import os
import logging
from typing import Tuple, Optional
from PIL import Image
import torch
import torch.nn as nn

logger = logging.getLogger("drishti_backend.model")

# Diabetic Retinopathy stage labels (0-4)
DR_CLASSES = {
    0: "No DR",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Proliferative"
}

# Check for torchvision availability
try:
    import torchvision.models as models
    from torchvision import transforms
    TORCHVISION_AVAILABLE = True
except ImportError:
    logger.warning("torchvision is not installed in the current environment. Fallback mode enabled.")
    TORCHVISION_AVAILABLE = False
    models = None
    transforms = None


def get_preprocess_transform():
    if TORCHVISION_AVAILABLE and transforms is not None:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    return None


class FallbackEfficientNet(nn.Module):
    """
    Fallback mock architecture when torchvision is not installed locally.
    Ensures identical feature interface (model.features[-1]) and classification head.
    """
    def __init__(self):
        super().__init__()
        # Simulated feature extractor with target layer matching features[-1]
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Conv2d(64, 1536, kernel_size=1)
        )
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(1536, 5)
        )

    def forward(self, x):
        feat = self.features(x)
        pooled = torch.mean(feat, dim=(2, 3))
        out = self.classifier(pooled)
        return out


def load_model(model_path: str = "efficientnet_dr.pth", device: str = "cpu") -> nn.Module:
    """
    Loads and initializes the EfficientNet-B3 model for Diabetic Retinopathy screening.
    Replaces the classification head to output 5 classes.
    Loads saved checkpoint weights if available; otherwise initializes for dev/testing.
    """
    if TORCHVISION_AVAILABLE and models is not None:
        try:
            model = models.efficientnet_b3(weights=None)
        except TypeError:
            model = models.efficientnet_b3(pretrained=False)

        model.classifier[1] = nn.Linear(1536, 5)
    else:
        logger.warning(
            "Using FallbackEfficientNet architecture because torchvision is not installed. "
            "In production (Docker/Cloud Run), the full EfficientNet-B3 architecture is used."
        )
        model = FallbackEfficientNet()

    candidate_paths = [
        model_path,
        "efficientnet_dr.pth",
        "efficientnet_dr_final.pth",
        os.path.join("DrishtiAI_backend_handoff", "models", "efficientnet_dr_final.pth")
    ]
    resolved_path = next((p for p in candidate_paths if p and os.path.exists(p)), None)

    if resolved_path:
        logger.info(f"Loading trained weights from '{resolved_path}' onto {device}...")
        try:
            state_dict = torch.load(resolved_path, map_location=device)
            if isinstance(state_dict, dict) and "state_dict" in state_dict:
                state_dict = state_dict["state_dict"]
            elif isinstance(state_dict, dict) and "model" in state_dict:
                state_dict = state_dict["model"]
            model.load_state_dict(state_dict, strict=False)
            logger.info(f"Successfully loaded weights from '{resolved_path}'.")
        except Exception as e:
            logger.error(f"Error loading state_dict from '{resolved_path}': {e}. Using initialized model.")
    else:
        logger.warning(
            f"Weights file not found at any candidate path. "
            "Running with initialized weights. Place 'efficientnet_dr.pth' in the working directory for trained inference."
        )

    model.to(device)
    model.eval()
    return model


def preprocess_image(pil_image: Image.Image) -> Tuple[torch.Tensor, Image.Image]:
    """
    Prepares a PIL Image for model inference and Grad-CAM visualization.
    Returns:
        tensor: Normalized PyTorch tensor of shape (1, 3, 224, 224)
        resized_pil: Resized RGB PIL Image (224x224) for heatmap overlay
    """
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")

    resized_pil = pil_image.resize((224, 224))
    transform = get_preprocess_transform()

    if transform is not None:
        tensor = transform(pil_image).unsqueeze(0)
    else:
        # Native PyTorch normalization fallback without torchvision
        import numpy as np
        img_np = np.array(resized_pil, dtype=np.float32) / 255.0
        # mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        norm_img = (img_np - mean) / std
        tensor = torch.from_numpy(norm_img.transpose(2, 0, 1)).unsqueeze(0)

    return tensor, resized_pil


def predict(
    model: nn.Module,
    pil_image: Image.Image,
    device: str = "cpu"
) -> Tuple[int, str, float, torch.Tensor, Image.Image]:
    """
    Performs inference on a retinal fundus image.

    Returns:
        dr_level: int (0 to 4)
        dr_stage: str ("No DR", "Mild", "Moderate", "Severe", "Proliferative")
        confidence: float (percentage 0.0 - 100.0)
        input_tensor: torch.Tensor on device
        resized_pil: PIL.Image of size (224, 224)
    """
    input_tensor, resized_pil = preprocess_image(pil_image)
    input_tensor = input_tensor.to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence_val, pred_class = torch.max(probabilities, dim=0)

    dr_level = int(pred_class.item())
    dr_stage = DR_CLASSES.get(dr_level, "Unknown")
    confidence = round(float(confidence_val.item()) * 100.0, 1)

    return dr_level, dr_stage, confidence, input_tensor, resized_pil
