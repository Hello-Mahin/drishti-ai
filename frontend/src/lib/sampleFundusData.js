/**
 * Generates realistic retinal fundus photography simulations and corresponding Grad-CAM heatmaps
 * representing the 5 Diabetic Retinopathy stages from the Kaggle APTOS 2019 dataset.
 */

export const SAMPLE_CASES = [
  {
    id: 'aptos-sample-0',
    stage: 'No DR',
    label: 'Normal Fundus (No DR)',
    patientName: 'Rameshwar Patil',
    patientAge: 48,
    patientId: 'MH-STR-2026-0041',
    confidence: 96.4,
    description: 'Clean retinal vasculature, crisp optic disc margins, macula healthy without microaneurysms.',
    findings: 'No microaneurysms, hemorrhages, or exudates observed. Optic cup-to-disc ratio is 0.3 (normal). Normal foveal avascular zone.',
    recommendation: 'Annual diabetic eye screening at village primary health sub-centre. Maintain HbA1c < 7.0%.',
  },
  {
    id: 'aptos-sample-1',
    stage: 'Mild',
    label: 'Mild NPDR (Early Microaneurysms)',
    patientName: 'Kamala Bai Deshmukh',
    patientAge: 54,
    patientId: 'MH-STR-2026-0078',
    confidence: 88.2,
    description: 'Isolated microaneurysms in the temporal quadrant. No hard exudates or macular edema.',
    findings: 'Few microaneurysms (red dots) identified in the inferotemporal retina. No signs of venous beading or intraretinal microvascular abnormalities (IRMA).',
    recommendation: 'Scheduled re-screening in 6 to 9 months by ASHA health worker. Strict blood pressure and glucose monitoring.',
  },
  {
    id: 'aptos-sample-2',
    stage: 'Moderate',
    label: 'Moderate NPDR (Exudates & Hemorrhages)',
    patientName: 'Anand Rao Shinde',
    patientAge: 61,
    patientId: 'MH-STR-2026-0112',
    confidence: 89.5,
    description: 'Multiple blot hemorrhages and hard yellowish lipid exudates near posterior pole.',
    findings: 'Scattered blot hemorrhages in two quadrants. Characteristic yellowish hard exudates adjacent to the superior arcade. Mild venous dilation noted.',
    recommendation: 'Referral to District Civil Hospital Ophthalmology OPD within 4 to 6 weeks for slit-lamp biomicroscopy and OCT examination.',
  },
  {
    id: 'aptos-sample-3',
    stage: 'Severe',
    label: 'Severe NPDR (4-2-1 Rule)',
    patientName: 'Sunita Devi More',
    patientAge: 67,
    patientId: 'MH-STR-2026-0164',
    confidence: 92.1,
    description: 'Extensive intraretinal hemorrhages across all 4 quadrants with venous beading.',
    findings: 'Severe intraretinal blot hemorrhages in all four quadrants. Definite venous beading in inferior quadrant. Cotton wool spots indicating localized retinal nerve fiber ischemia.',
    recommendation: 'High risk of progression to proliferative stage. Urgent specialist referral within 1 to 2 weeks for fluorescein angiography assessment.',
  },
  {
    id: 'aptos-sample-4',
    stage: 'Proliferative',
    label: 'Proliferative DR (Neovascularization)',
    patientName: 'Bapu Rao Jadhav',
    patientAge: 72,
    patientId: 'MH-STR-2026-0205',
    confidence: 94.8,
    description: 'Neovascularization at the disc (NVD) with vitreous traction. High risk of immediate blindness.',
    findings: 'Prominent neovascular vessels budding from optic disc into vitreous space. Preretinal hemorrhage along superotemporal arcade. Fibrovascular proliferation noted.',
    recommendation: 'URGENT: Immediate ophthalmology intervention required (Panretinal Photocoagulation / Anti-VEGF injection) to prevent irreversible visual loss.',
  },
];

/**
 * Creates high-fidelity synthetic retinal fundus canvas images
 */
export function generateFundusImage(stage = 'No DR', width = 512, height = 512) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;

  // Black background representing camera aperture mask
  ctx.fillStyle = '#060B0E';
  ctx.fillRect(0, 0, width, height);

  // Fundus circular aperture clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Deep orange-red choroidal retinal background
  const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
  bgGrad.addColorStop(0, '#B33C1B');
  bgGrad.addColorStop(0.5, '#962B12');
  bgGrad.addColorStop(0.85, '#6E1B0A');
  bgGrad.addColorStop(1, '#3B0D05');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Choroidal texture noise
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 400; i++) {
    const rx = cx + (Math.random() - 0.5) * r * 1.8;
    const ry = cy + (Math.random() - 0.5) * r * 1.8;
    ctx.fillRect(rx, ry, Math.random() * 3, Math.random() * 3);
  }

  // Optic Disc (Nasal side - yellowish bright circle)
  const discX = cx - r * 0.48;
  const discY = cy + r * 0.05;
  const discR = r * 0.16;

  const discGrad = ctx.createRadialGradient(discX, discY, 5, discX, discY, discR);
  discGrad.addColorStop(0, '#FFF5C2');
  discGrad.addColorStop(0.6, '#F8D18C');
  discGrad.addColorStop(1, '#D97736');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.ellipse(discX, discY, discR * 0.9, discR * 1.1, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Macula & Fovea (Temporal side - darker area)
  const maculaX = cx + r * 0.22;
  const maculaY = cy + r * 0.08;
  const maculaGrad = ctx.createRadialGradient(maculaX, maculaY, 2, maculaX, maculaY, r * 0.22);
  maculaGrad.addColorStop(0, '#421107');
  maculaGrad.addColorStop(0.7, '#6E1D0D');
  maculaGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = maculaGrad;
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Foveal reflex pinpoint
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.arc(maculaX, maculaY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Retinal Blood Vessels (Arterioles and Venules emerging from optic disc)
  ctx.strokeStyle = '#5E1005';
  ctx.lineCap = 'round';

  const drawBranch = (startX, startY, angles, thicknesses) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let curX = startX;
    let curY = startY;
    for (let i = 0; i < angles.length; i++) {
      ctx.lineWidth = thicknesses[i];
      const length = 28 + Math.sin(i) * 8;
      curX += Math.cos(angles[i]) * length;
      curY += Math.sin(angles[i]) * length;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
  };

  // Superior temporal arcade
  drawBranch(discX, discY, [-1.2, -0.9, -0.4, -0.1, 0.2], [5, 4, 3, 2.5, 1.8]);
  drawBranch(discX + 20, discY - 30, [-0.7, -0.2, 0.1, 0.4], [3, 2.2, 1.5, 1]);

  // Inferior temporal arcade
  drawBranch(discX, discY, [1.2, 0.9, 0.4, 0.1, -0.1], [5.5, 4.5, 3.2, 2.5, 1.8]);
  drawBranch(discX + 25, discY + 30, [0.8, 0.3, 0.0, -0.2], [3, 2.2, 1.5, 1]);

  // Nasal vessels
  drawBranch(discX, discY, [-2.4, -2.8, -3.0], [3.5, 2.5, 1.8]);
  drawBranch(discX, discY, [2.4, 2.8, 3.0], [3.5, 2.5, 1.8]);

  // DR Stage Specific Pathologies
  if (stage === 'Mild') {
    // Microaneurysms (small red dots in temporal quadrant)
    ctx.fillStyle = '#6E0B05';
    const spots = [
      [maculaX - 35, maculaY - 30, 2.5],
      [maculaX - 45, maculaY + 20, 2],
      [maculaX + 25, maculaY - 25, 2.2],
      [maculaX + 15, maculaY + 35, 1.8],
      [cx + 10, cy - 60, 2.5],
    ];
    spots.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (stage === 'Moderate') {
    // Blot Hemorrhages (larger irregular red spots)
    ctx.fillStyle = '#520603';
    const hemorrhages = [
      [maculaX - 40, maculaY - 45, 6, 8],
      [maculaX + 30, maculaY + 40, 7, 5],
      [cx - 10, cy + 70, 8, 6],
      [cx + 50, cy - 40, 5, 5],
    ];
    hemorrhages.forEach(([hx, hy, hrw, hrh]) => {
      ctx.beginPath();
      ctx.ellipse(hx, hy, hrw, hrh, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hard Exudates (bright yellowish waxy deposits)
    ctx.fillStyle = '#FCE38A';
    const exudates = [
      [maculaX - 15, maculaY - 25, 3],
      [maculaX - 18, maculaY - 22, 2.5],
      [maculaX - 12, maculaY - 28, 2],
      [maculaX + 45, maculaY - 15, 3.5],
      [maculaX + 42, maculaY - 10, 2.5],
    ];
    exudates.forEach(([ex, ey, er]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (stage === 'Severe') {
    // 4-Quadrant Hemorrhages + Cotton Wool Spots (white patches)
    ctx.fillStyle = '#420301';
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const dist = 50 + Math.random() * (r * 0.7);
      const hx = cx + Math.cos(angle) * dist;
      const hy = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 4 + Math.random() * 5, 3 + Math.random() * 4, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Cotton Wool spots (fluffy white areas)
    ctx.fillStyle = 'rgba(245, 245, 240, 0.75)';
    const cws = [
      [discX + 45, discY - 50, 10, 7],
      [maculaX - 30, maculaY + 45, 8, 12],
      [cx + 20, cy - 75, 11, 8],
    ];
    cws.forEach(([cxw, cyw, rxw, ryw]) => {
      ctx.beginPath();
      ctx.ellipse(cxw, cyw, rxw, ryw, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (stage === 'Proliferative') {
    // Extensive Hemorrhages + Neovascularization fronds at disc
    ctx.fillStyle = '#3A0201';
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * (r * 0.75);
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 5 + Math.random() * 6, 4 + Math.random() * 5, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Neovascular vessel fronds at disc (tangled web of fine vessels)
    ctx.strokeStyle = '#D9381E';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(discX, discY);
      const na = -1.5 + (i / 16) * 3;
      const nlen = 25 + Math.random() * 25;
      const mx = discX + Math.cos(na) * nlen;
      const my = discY + Math.sin(na) * nlen;
      ctx.quadraticCurveTo(discX + 10, discY - 10, mx, my);
      ctx.stroke();
    }

    // Vitreous boat-shaped preretinal hemorrhage
    ctx.fillStyle = '#290101';
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 30, 24, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Retinal edge vignette
  const edgeVig = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
  edgeVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeVig.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = edgeVig;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Creates Grad-CAM visual heatmaps highlighting the model's spatial attention
 */
export function generateGradCAMHeatmap(originalDataUrl, stage = 'No DR', width = 512, height = 512) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;

  // Background black mask
  ctx.fillStyle = '#060B0E';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Deep darkened fundus background base
  ctx.fillStyle = '#220803';
  ctx.fillRect(0, 0, width, height);

  // Define hot spots of Grad-CAM attention based on stage
  const hotspots = [];
  const maculaX = cx + r * 0.22;
  const maculaY = cy + r * 0.08;
  const discX = cx - r * 0.48;
  const discY = cy + r * 0.05;

  if (stage === 'No DR') {
    // Diffuse low attention centered on healthy fovea and optic disc
    hotspots.push({ x: maculaX, y: maculaY, radius: 80, intensity: 0.35 });
    hotspots.push({ x: discX, y: discY, radius: 70, intensity: 0.3 });
  } else if (stage === 'Mild') {
    // Attention focused on microaneurysm cluster in temporal retina
    hotspots.push({ x: maculaX - 35, y: maculaY - 30, radius: 65, intensity: 0.85 });
    hotspots.push({ x: maculaX + 20, y: maculaY - 15, radius: 55, intensity: 0.7 });
  } else if (stage === 'Moderate') {
    // Attention focused on hard exudates and hemorrhages
    hotspots.push({ x: maculaX - 25, y: maculaY - 25, radius: 90, intensity: 0.95 });
    hotspots.push({ x: maculaX + 35, y: maculaY + 30, radius: 75, intensity: 0.8 });
    hotspots.push({ x: cx - 10, y: cy + 65, radius: 70, intensity: 0.75 });
  } else if (stage === 'Severe') {
    // Multi-quadrant severe attention hotspots
    hotspots.push({ x: discX + 45, y: discY - 45, radius: 85, intensity: 0.95 });
    hotspots.push({ x: maculaX - 20, y: maculaY + 40, radius: 90, intensity: 0.9 });
    hotspots.push({ x: cx + 30, y: cy - 65, radius: 85, intensity: 0.88 });
    hotspots.push({ x: cx - 40, y: cy + 50, radius: 75, intensity: 0.82 });
  } else if (stage === 'Proliferative') {
    // Very intense focal activation on optic disc neovascularization and vitreous hemorrhage
    hotspots.push({ x: discX, y: discY, radius: 100, intensity: 1.0 });
    hotspots.push({ x: cx + 40, y: cy - 30, radius: 85, intensity: 0.95 });
    hotspots.push({ x: maculaX, y: maculaY, radius: 70, intensity: 0.8 });
  }

  // Draw Jet-colormap heat gradients
  hotspots.forEach(({ x, y, radius, intensity }) => {
    const heatGrad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    heatGrad.addColorStop(0, `rgba(255, 0, 0, ${0.85 * intensity})`);       // Red center (high activation)
    heatGrad.addColorStop(0.35, `rgba(255, 165, 0, ${0.75 * intensity})`);  // Yellow-orange
    heatGrad.addColorStop(0.65, `rgba(0, 255, 128, ${0.55 * intensity})`);  // Green
    heatGrad.addColorStop(0.9, `rgba(0, 100, 255, ${0.25 * intensity})`);   // Blue edge
    heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Retinal edge vignette
  const edgeVig = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
  edgeVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edgeVig.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = edgeVig;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Add Jet colormap legend overlay in bottom-right corner
  const legendX = width - 110;
  const legendY = height - 40;
  const legendW = 85;
  const legendH = 10;
  
  const legendGrad = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0);
  legendGrad.addColorStop(0, '#0022FF');
  legendGrad.addColorStop(0.33, '#00FF88');
  legendGrad.addColorStop(0.66, '#FFAA00');
  legendGrad.addColorStop(1, '#FF0000');
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(legendX - 6, legendY - 14, legendW + 12, legendH + 20);
  
  ctx.fillStyle = legendGrad;
  ctx.fillRect(legendX, legendY, legendW, legendH);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px sans-serif';
  ctx.fillText('Grad-CAM Attention', legendX, legendY - 4);

  return canvas.toDataURL('image/jpeg', 0.92);
}
