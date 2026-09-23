import io
import base64
import logging
import numpy as np
from PIL import Image
import torch
import torch.nn as nn

logger = logging.getLogger("drishti_backend.gradcam")

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV (cv2) not found in current environment. Using PIL/Numpy fallback for heatmap rendering.")


def generate_gradcam_overlay(
    model: nn.Module,
    input_tensor: torch.Tensor,
    original_pil: Image.Image,
    target_category: int
) -> str:
    """
    Generates a Grad-CAM heatmap highlighting retinal damage areas
    and overlays it onto the original retinal fundus image.

    Target layer: model.features[-1] (final convolutional block)

    Returns:
        Base64-encoded PNG data URI string: 'data:image/png;base64,...'
    """
    # Resize original image to match tensor size (224, 224)
    rgb_img_224 = original_pil.convert("RGB").resize((224, 224))
    rgb_array = np.float32(rgb_img_224) / 255.0

    cam_generated = False
    visualization = None

    # Method 1: Using pytorch-grad-cam library
    try:
        from pytorch_grad_cam import GradCAM
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
        from pytorch_grad_cam.utils.image import show_cam_on_image

        target_layers = [model.features[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)
        targets = [ClassifierOutputTarget(target_category)]

        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]
        visualization = show_cam_on_image(rgb_array, grayscale_cam, use_rgb=True)
        cam_generated = True
    except Exception as e:
        logger.debug(f"pytorch-grad-cam library not used: {e}. Switching to direct PyTorch hooks.")

    # Method 2: Fallback using PyTorch forward/backward hooks
    if not cam_generated or visualization is None:
        try:
            visualization = _generate_gradcam_native(
                model=model,
                input_tensor=input_tensor,
                rgb_array=rgb_array,
                target_category=target_category
            )
        except Exception as e:
            logger.error(f"Fallback Grad-CAM hook failed: {e}. Returning original image.")
            visualization = np.uint8(rgb_array * 255)

    # Convert RGB visualization to PNG base64
    pil_overlay = Image.fromarray(visualization)
    buffer = io.BytesIO()
    pil_overlay.save(buffer, format="PNG")
    b64_encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{b64_encoded}"


def _generate_gradcam_native(
    model: nn.Module,
    input_tensor: torch.Tensor,
    rgb_array: np.ndarray,
    target_category: int
) -> np.ndarray:
    """
    Pure PyTorch hook implementation of Grad-CAM for model.features[-1].
    """
    gradients = []
    activations = []

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    def forward_hook(module, input, output):
        activations.append(output)

    target_layer = model.features[-1]
    handle_fwd = target_layer.register_forward_hook(forward_hook)
    handle_bwd = target_layer.register_full_backward_hook(backward_hook)

    # Re-enable gradient computation for CAM computation
    tensor_copy = input_tensor.clone().detach().requires_grad_(True)
    model.zero_grad()
    output = model(tensor_copy)

    # Target class score
    score = output[0, target_category]
    score.backward()

    # Unregister hooks immediately
    handle_fwd.remove()
    handle_bwd.remove()

    if not gradients or not activations:
        raise RuntimeError("Grad-CAM hooks failed to collect activations or gradients.")

    grads_val = gradients[0].cpu().data.numpy()[0]   # (C, H, W)
    act_val = activations[0].cpu().data.numpy()[0]   # (C, H, W)

    weights = np.mean(grads_val, axis=(1, 2))        # (C,)
    cam = np.zeros(act_val.shape[1:], dtype=np.float32)

    for i, w in enumerate(weights):
        cam += w * act_val[i, :, :]

    cam = np.maximum(cam, 0)
    if np.max(cam) != 0:
        cam = cam / np.max(cam)

    original_uint8 = np.uint8(255 * rgb_array)

    if CV2_AVAILABLE:
        cam_resized = cv2.resize(cam, (224, 224))
        heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        blended = np.uint8(0.6 * original_uint8 + 0.4 * heatmap_rgb)
    else:
        # Fallback pseudo-heatmap using PIL without cv2
        cam_img = Image.fromarray(np.uint8(255 * cam)).resize((224, 224), Image.BILINEAR)
        cam_np = np.array(cam_img, dtype=np.float32) / 255.0
        # Jet colormap approximation (Red for high, Blue for low)
        r = np.clip(1.5 - np.abs(4 * cam_np - 3), 0, 1)
        g = np.clip(1.5 - np.abs(4 * cam_np - 2), 0, 1)
        b = np.clip(1.5 - np.abs(4 * cam_np - 1), 0, 1)
        heatmap_rgb = np.stack([r, g, b], axis=-1) * 255.0
        blended = np.uint8(0.6 * original_uint8 + 0.4 * heatmap_rgb)

    return blended
