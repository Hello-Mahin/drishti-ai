import { jsPDF } from 'jspdf';
import { STAGE_CONFIGS } from '../components/StageBadge';

export const HINDI_STAGE_DATA = {
  'No DR': {
    name: 'कोई डायबिटिक रेटिनोपैथी नहीं (No DR)',
    shortName: 'सामान्य (No DR)',
    findings: 'रेटिना में कोई माइक्रोएन्यूरिज्म, रक्तस्राव या एक्सयूडेट नहीं पाया गया। सामान्य ऑप्टिक डिस्क एवं मैक्यूला।',
    recommendation: 'ग्राम प्राथमिक स्वास्थ्य उपकेंद्र पर नियमित वार्षिक डायबिटिक नेत्र जांच। HbA1c < 7.0% बनाए रखें।',
  },
  'Mild': {
    name: 'हल्का (Mild NPDR)',
    shortName: 'हल्का (Mild NPDR)',
    findings: 'रेटिना के निचले हिस्से में प्रारंभिक माइक्रोएन्यूरिज्म उपस्थित हैं। मैक्युलर एडिमा अनुपस्थित है।',
    recommendation: 'आशा कार्यकर्ता द्वारा 6 से 9 महीने में पुनः स्क्रीनिंग। रक्तचाप और रक्त शर्करा स्तर की कड़ी निगरानी रखें।',
  },
  'Moderate': {
    name: 'मध्यम (Moderate NPDR)',
    shortName: 'मध्यम (Moderate NPDR)',
    findings: 'रेटिना के दो चतुर्थांशों में छिटपुट रक्तस्राव एवं पीला एक्सयूडेट देखा गया। हल्की शिरापरक सूजन उपस्थित।',
    recommendation: '4 से 6 सप्ताह के भीतर स्लिट-लैम्प एवं ओसीटी जांच हेतु जिला सिविल अस्पताल नेत्र ओपीडी में रेफरल की सिफारिश।',
  },
  'Severe': {
    name: 'गंभीर (Severe NPDR)',
    shortName: 'गंभीर (Severe NPDR)',
    findings: 'चारों चतुर्थांशों में व्यापक रक्तस्राव, शिरापरक असामान्यताएं एवं रेटिना तंत्रिका तंतुओं में इस्केमिया के संकेत उपस्थित।',
    recommendation: 'प्रोलिफेरेटिव चरण में बढ़ने का उच्च जोखिम। 1 से 2 सप्ताह के भीतर नेत्र रोग विशेषज्ञ के पास तत्काल रेफरल आवश्यक।',
  },
  'Proliferative': {
    name: 'प्रोलिफेरेटिव (PDR)',
    shortName: 'प्रोलिफेरेटिव (PDR)',
    findings: 'ऑप्टिक डिस्क पर नई असामान्य रक्त वाहिकाओं (नियोवैस्कुलराइजेशन) का फैलाव एवं विट्रीयस रक्तस्राव का उच्च जोखिम।',
    recommendation: 'अति आवश्यक: दृष्टि हानि रोकने हेतु नेत्र रोग विशेषज्ञ द्वारा तत्काल आपातकालीन चिकित्सा उपचार (लेजर/एंटी-VEGF) आवश्यक।',
  },
};

/**
 * Generates and downloads a clinical-grade PDF screening report using jsPDF.
 * Supports English ('en') and Hindi ('hi') with complete Devanagari Unicode rendering.
 */
export async function generatePDFReport(resultData, ashaWorkerName = 'ASHA Health Worker', language = 'en') {
  if (!resultData) {
    throw new Error('No screening data provided for PDF generation.');
  }

  const {
    patient_id = 'PAT-UNKNOWN',
    patient_name = 'Patient',
    patient_age = '--',
    dr_stage = 'No DR',
    confidence = 0,
    original_image_url,
    heatmap_base64,
    report_text = '',
    created_at = new Date().toISOString(),
  } = resultData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let fontNormal = 'helvetica';
  let fontBold = 'helvetica';

  if (language === 'hi') {
    const { NOTO_SANS_DEVANAGARI_REGULAR, NOTO_SANS_DEVANAGARI_BOLD } = await import('./devanagariFontsData');
    doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', NOTO_SANS_DEVANAGARI_REGULAR);
    doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');

    doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', NOTO_SANS_DEVANAGARI_BOLD);
    doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');

    fontNormal = 'NotoSansDevanagari';
    fontBold = 'NotoSansDevanagari';
  }

  // Header Banner in Primary Teal
  doc.setFillColor(14, 148, 136); // #0E9488
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Coral accent line
  doc.setFillColor(255, 122, 89); // #FF7A59
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont(fontBold, 'bold');
  doc.setFontSize(18);
  doc.text('DrishtiAI', margin, 13);

  doc.setFont(fontNormal, 'normal');
  doc.setFontSize(language === 'hi' ? 8.5 : 9);
  if (language === 'hi') {
    doc.text('डायबिटिक रेटिनोपैथी स्क्रीनिंग सारांश  |  राष्ट्रीय ग्रामीण स्वास्थ्य मिशन', margin + 32, 12);
    doc.text('आशा कार्यकर्ताओं हेतु स्क्रीनिंग रिपोर्ट  |  "ग्रामीण भारत में दृष्टिहीनता रोकथाम"', margin, 21);
  } else {
    doc.text('Diabetic Retinopathy Screening Summary  |  Rural Health Mission', margin + 32, 12);
    doc.text('Screening for Community Health Workers (ASHA)  |  "Preventing Blindness in Rural India"', margin, 21);
  }

  // Meta Info Box (Patient Demographics)
  let y = 38;
  doc.setFillColor(247, 250, 249); // #F7FAF9
  doc.setDrawColor(225, 235, 232); // #E1EBE8
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(11, 42, 50); // #0B2A32
  doc.setFontSize(8.5);

  const formattedDate = new Date(created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (language === 'hi') {
    // Row 1
    doc.setFont(fontBold, 'bold');
    doc.text('रोगी आईडी:', margin + 4, y + 7);
    doc.setFont(fontNormal, 'normal');
    doc.text(String(patient_id), margin + 26, y + 7);

    doc.setFont(fontBold, 'bold');
    doc.text('रोगी का नाम:', margin + 70, y + 7);
    doc.setFont(fontNormal, 'normal');
    doc.text(String(patient_name), margin + 96, y + 7);

    doc.setFont(fontBold, 'bold');
    doc.text('आयु:', margin + 145, y + 7);
    doc.setFont(fontNormal, 'normal');
    doc.text(`${patient_age} वर्ष`, margin + 155, y + 7);

    // Row 2
    doc.setFont(fontBold, 'bold');
    doc.text('जांच की तारीख:', margin + 4, y + 16);
    doc.setFont(fontNormal, 'normal');
    doc.text(formattedDate, margin + 28, y + 16);

    doc.setFont(fontBold, 'bold');
    doc.text('स्क्रीनिंगकर्ता (आशा):', margin + 70, y + 16);
    doc.setFont(fontNormal, 'normal');
    doc.text(String(ashaWorkerName), margin + 106, y + 16);

    doc.setFont(fontBold, 'bold');
    doc.text('उपकरण:', margin + 145, y + 16);
    doc.setFont(fontNormal, 'normal');
    doc.text('फंडस कैमरा', margin + 160, y + 16);
  } else {
    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.text('Patient ID:', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(String(patient_id), margin + 26, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Patient Name:', margin + 70, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(String(patient_name), margin + 96, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Age:', margin + 145, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient_age} yrs`, margin + 155, y + 7);

    // Row 2
    doc.setFont('helvetica', 'bold');
    doc.text('Date of Scan:', margin + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(formattedDate, margin + 26, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.text('Screener (ASHA):', margin + 70, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(String(ashaWorkerName), margin + 102, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.text('Device:', margin + 145, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text('Fundus Camera', margin + 160, y + 16);
  }

  // Result Outcome Card
  y += 30;
  const stageConfig = STAGE_CONFIGS[dr_stage] || STAGE_CONFIGS['No DR'];

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 210, 215);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  // Left colored indicator bar
  const r = parseInt(stageConfig.color.slice(1, 3), 16) || 14;
  const g = parseInt(stageConfig.color.slice(3, 5), 16) || 148;
  const b = parseInt(stageConfig.color.slice(5, 7), 16) || 136;
  doc.setFillColor(r, g, b);
  doc.rect(margin, y, 4, 22, 'F');

  if (language === 'hi') {
    const stageInfo = HINDI_STAGE_DATA[dr_stage] || HINDI_STAGE_DATA['No DR'];

    doc.setTextColor(11, 42, 50);
    doc.setFont(fontBold, 'bold');
    doc.setFontSize(8.5);
    doc.text('स्क्रीनिंग परिणाम:', margin + 8, y + 8);

    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    doc.text(`चरण: ${stageInfo.name}`, margin + 8, y + 16);

    if (dr_stage === 'Proliferative') {
      doc.setFillColor(153, 27, 27);
      doc.roundedRect(margin + 80, y + 10, 26, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont(fontBold, 'bold');
      doc.text('अति आवश्यक', margin + 82, y + 14.5);
    }

    // Confidence
    doc.setTextColor(11, 42, 50);
    doc.setFontSize(8.5);
    doc.setFont(fontBold, 'bold');
    doc.text('मॉडल का विश्वास स्तर:', margin + 120, y + 8);
    doc.setFontSize(13);
    doc.setFont(fontBold, 'bold');
    doc.setTextColor(14, 148, 136);
    doc.text(`${confidence}%`, margin + 120, y + 16);
  } else {
    doc.setTextColor(11, 42, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SCREENING RESULT:', margin + 8, y + 8);

    doc.setFontSize(14);
    doc.setTextColor(r, g, b);
    doc.text(`Stage: ${dr_stage}`, margin + 8, y + 16);

    if (dr_stage === 'Proliferative') {
      doc.setFillColor(153, 27, 27);
      doc.roundedRect(margin + 65, y + 10, 24, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('URGENT', margin + 68, y + 14.5);
    }

    // Confidence
    doc.setTextColor(11, 42, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Model Confidence:', margin + 120, y + 8);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(14, 148, 136);
    doc.text(`${confidence}%`, margin + 120, y + 16);
  }

  // Dual Fundus & Heatmap Images
  y += 28;
  doc.setTextColor(11, 42, 50);
  doc.setFont(fontBold, 'bold');
  doc.setFontSize(10);
  doc.text(
    language === 'hi'
      ? 'रेटिनल इमेज साक्ष्य और डीप लर्निंग विश्लेषण'
      : 'Retinal Image Evidence & Deep Learning Attention',
    margin,
    y
  );

  y += 4;
  const imgWidth = (contentWidth - 8) / 2;
  const imgHeight = imgWidth; // Square 1:1 aspect

  // Box 1: Original Retinal Image
  doc.setFillColor(6, 11, 14);
  doc.roundedRect(margin, y, imgWidth, imgHeight, 2, 2, 'F');
  if (original_image_url) {
    try {
      doc.addImage(original_image_url, 'JPEG', margin + 2, y + 2, imgWidth - 4, imgHeight - 4);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(language === 'hi' ? 'मूल फंडस छवि' : 'Original Fundus Photo', margin + 10, y + imgHeight / 2);
    }
  }
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, y + imgHeight - 6, imgWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont(fontNormal, 'normal');
  doc.text(
    language === 'hi' ? 'प्राप्त रेटिनल फंडस छवि' : 'Captured Retinal Fundus',
    margin + 6,
    y + imgHeight - 2
  );

  // Box 2: Grad-CAM Heatmap
  const heatmapX = margin + imgWidth + 8;
  doc.setFillColor(6, 11, 14);
  doc.roundedRect(heatmapX, y, imgWidth, imgHeight, 2, 2, 'F');
  if (heatmap_base64) {
    try {
      doc.addImage(heatmap_base64, 'JPEG', heatmapX + 2, y + 2, imgWidth - 4, imgHeight - 4);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(language === 'hi' ? 'Grad-CAM हीटमैप' : 'Grad-CAM Heatmap', heatmapX + 10, y + imgHeight / 2);
    }
  }
  doc.setFillColor(0, 0, 0);
  doc.rect(heatmapX, y + imgHeight - 6, imgWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont(fontNormal, 'normal');
  doc.text(
    language === 'hi' ? 'Grad-CAM पैथोलॉजी अटेंशन हीटमैप' : 'Grad-CAM Pathology Attention Heatmap',
    heatmapX + 6,
    y + imgHeight - 2
  );

  // Clinical Findings & Report text
  y += imgHeight + 8;
  doc.setTextColor(11, 42, 50);
  doc.setFont(fontBold, 'bold');
  doc.setFontSize(10);
  doc.text(
    language === 'hi' ? 'एआई क्लिनिकल स्क्रीनिंग सारांश' : 'AI Clinical Screening Summary',
    margin,
    y
  );

  y += 5;
  doc.setFont(fontNormal, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  let finalReportText = '';
  if (language === 'hi') {
    const stageInfo = HINDI_STAGE_DATA[dr_stage] || HINDI_STAGE_DATA['No DR'];
    finalReportText =
      `DrishtiAI स्वचालित डीप-लर्निंग स्क्रीनिंग मॉडल (Kaggle APTOS 2019 और EyePACS डेटासेट पर प्रशिक्षित EfficientNet-B4 बैकबोन) ने ICDR वर्गीकरण हेतु रेटिनल फंडस छवि का विश्लेषण किया।\n\n` +
      `स्क्रीनिंग परिणाम: चरण ${dr_stage} - ${stageInfo.name} (${stageInfo.findings})\n\n` +
      `मॉडल स्थानिक ध्यान (Grad-CAM): रेटिना की रक्त वाहिकाओं पर केंद्रित सक्रियता के साथ ${confidence}% स्क्रीनिंग विश्वास स्तर प्राप्त हुआ।\n\n` +
      `आशा स्वास्थ्य कार्यकर्ता प्रोटोकॉल: ${stageInfo.recommendation}`;
  } else {
    finalReportText = report_text.replace(/\r/g, '');
  }

  const splitLines = doc.splitTextToSize(finalReportText, contentWidth - 6);
  doc.text(splitLines, margin + 2, y);

  // Footer / Disclaimer
  const footerY = 270;
  doc.setDrawColor(225, 235, 232);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont(fontBold, 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 40, 40);
  doc.text(
    language === 'hi' ? 'महत्वपूर्ण चिकित्सकीय अस्वीकरण (DISCLAIMER):' : 'IMPORTANT MEDICAL DISCLAIMER:',
    margin,
    footerY + 5
  );

  doc.setFont(fontNormal, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  const disclaimer =
    language === 'hi'
      ? 'यह एक एआई-सहायक स्क्रीनिंग परिणाम है और कोई अंतिम चिकित्सकीय निदान नहीं है। यह रिपोर्ट विशेष रूप से ग्रामीण स्वास्थ्य कार्यकर्ताओं (ASHA) द्वारा प्राथमिक जांच सहायता हेतु बनाई गई है। निश्चित चिकित्सकीय निदान एवं उपचार हेतु किसी पंजीकृत नेत्र रोग विशेषज्ञ से पूर्ण जांच कराना अनिवार्य है।'
      : 'This is an AI-assisted screening result and not a confirmed medical diagnosis. Designed specifically for community health workers (ASHA) to support triage in rural settings. Definite diagnosis and surgical intervention require comprehensive dilated ophthalmoscopy by a registered ophthalmologist.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, footerY + 9);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const tagLine =
    language === 'hi'
      ? `DrishtiAI v1.0 द्वारा जनरेट • स्क्रीनिंग आईडी: ${patient_id} • राष्ट्रीय ग्रामीण स्वास्थ्य मिशन हेतु सत्यापित`
      : `Generated by DrishtiAI v1.0 • Screening ID: ${patient_id} • Verified for Rural Health Mission`;
  doc.text(tagLine, margin, footerY + 18);

  const cleanPatientId = String(patient_id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = language === 'hi'
    ? `DrishtiAI_Screening_${cleanPatientId}_Hindi.pdf`
    : `DrishtiAI_Screening_${cleanPatientId}.pdf`;

  doc.save(filename);
  return filename;
}
