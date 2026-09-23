import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);
const LANG_STORAGE_KEY = 'drishti_ai_language';

export const translations = {
  en: {
    // Navbar
    'nav.newScan': 'New Scan',
    'nav.dashboard': 'Dashboard',
    'nav.demoMode': 'Demo Mode',
    'nav.ashaPortal': 'ASHA Access Portal',
    'nav.ashaWorker': 'ASHA Worker',
    'nav.logout': 'Logout',
    'nav.fieldScreener': 'Field Screener',
    'nav.newRetinalScan': 'New Retinal Scan',
    'nav.screeningDashboard': 'Screening Dashboard',

    // Language Selector
    'lang.english': 'English',
    'lang.hindi': 'हिन्दी',

    // Landing / Login
    'hero.mission': 'Rural Community Healthcare Initiative',
    'hero.title1': 'Preventing Blindness in',
    'hero.title2': 'Rural India',
    'hero.desc': 'DrishtiAI empowers accredited ASHA health workers to screen rural communities for diabetic retinopathy using retinal fundus images captured with portable fundus cameras — bridging the specialist gap before vision loss becomes irreversible.',
    'stats.stages': '5 DR Stages',
    'stats.stagesSub': 'Standard ICDR Grading',
    'stats.ai': 'AI-Assisted',
    'stats.aiSub': 'Field Screening & Triage',
    'stats.speed': '< 2 Seconds',
    'stats.speedSub': 'Fast Retinal Image Analysis',
    'login.portalTitle': 'ASHA Worker Access Portal',
    'login.portalSubtitle': 'Sign in to start new retinal screenings or inspect population records',
    'login.portalActive': 'Active',
    'login.cardTitle': 'ASHA Health Worker Sign In',
    'login.cardSubtitle': 'Enter your name to access the retinal fundus screening terminal.',
    'login.workerNameLabel': 'ASHA Health Worker Name',
    'login.workerNamePlaceholder': 'Enter your name (e.g. Priya Sharma, Sunita Devi, Anjali...)',
    'login.workerNameHelper': 'The name you write here will be the active ASHA worker on all retinal screening records, audit trails, and clinical triage reports.',
    'login.signInBtn': 'Sign In',
    'login.signInAs': 'Sign In as',
    'login.orSignInWith': 'or sign in with',
    'login.googleSignIn': 'Sign in with Google',
    'login.connecting': 'Connecting Google account…',
    'login.disclaimer': 'Notice: DrishtiAI is an AI-assisted screening and clinical triage support tool, not a confirmed medical diagnosis. Designed for primary eye-care screening in resource-limited rural clinics.',
    'login.footerHackathon': 'DrishtiAI • College Hackathon Edition',
    'login.footerDatasets': 'Trained on Kaggle APTOS 2019 & EyePACS Retinal Datasets',

    // Upload Page
    'upload.badge': 'Primary Eye Care Screening',
    'upload.title': 'Upload Retinal Fundus Image',
    'upload.desc': 'Upload a clear retinal image captured using a fundus camera. DrishtiAI will perform automated ICDR Diabetic Retinopathy screening and highlight vascular pathology with Grad-CAM.',
    'upload.fundusImage': 'Fundus Camera Image',
    'upload.dropTitle': 'Drag & drop retinal image here',
    'upload.dropSubtitle': 'or browse from fundus camera storage / device',
    'upload.supportedFormats': 'Supports JPG, PNG, TIFF, DICOM up to 25MB',
    'upload.chooseFile': 'Choose Image File',
    'upload.changeImage': 'Change Image',
    'upload.sampleImages': 'Or select verified fundus sample for demonstration:',
    'upload.sampleNoDr': 'Normal Retina (No DR)',
    'upload.sampleModerate': 'Moderate NPDR',
    'upload.sampleSevere': 'Severe NPDR',
    'upload.samplePdr': 'Proliferative DR',
    'upload.patientDetails': 'Patient Details & Demographics',
    'upload.patientName': 'Patient Full Name',
    'upload.patientNamePlaceholder': 'e.g. Ramesh Kumar Patel',
    'upload.patientId': 'Patient Screening ID',
    'upload.patientAge': 'Age (Years)',
    'upload.patientGender': 'Biological Gender',
    'upload.genderMale': 'Male',
    'upload.genderFemale': 'Female',
    'upload.genderOther': 'Other',
    'upload.eyeExamined': 'Eye Examined',
    'upload.eyeRight': 'Right Eye (OD)',
    'upload.eyeLeft': 'Left Eye (OS)',
    'upload.diabetesDuration': 'Known Diabetes Duration',
    'upload.diabetesNone': 'No known diabetes history',
    'upload.diabetesLess5': '< 5 Years',
    'upload.diabetes5to10': '5 - 10 Years',
    'upload.diabetesMore10': '> 10 Years',
    'upload.primarySymptoms': 'Primary Symptoms & Visual Complaints',
    'upload.symptomsPlaceholder': 'e.g. Blurred vision, floaters, difficulty reading, night vision reduction',
    'upload.activeScreener': 'Active ASHA Screener:',
    'upload.analyzeBtn': 'Analyze Retina with AI',
    'upload.analyzing': 'Analyzing Retinal Fundus…',

    // Result Page
    'result.screenings': 'Screenings',
    'result.analysis': 'Result Analysis',
    'result.assessmentTitle': 'Diabetic Retinopathy Assessment',
    'result.newScan': 'New Scan',
    'result.generatePdf': 'Generate PDF Report',
    'result.generatingPdf': 'Generating Report…',
    'result.shareWhatsApp': 'Share on WhatsApp',
    'result.patientName': 'Patient Name',
    'result.patientId': 'Patient ID',
    'result.ageDemo': 'Age & Demographic',
    'result.years': 'Years',
    'result.scanTimestamp': 'Scan Timestamp',
    'result.ashaScreener': 'ASHA Screener',
    'result.eyeScanned': 'Eye Scanned',
    'result.triageAssessment': 'Clinical Triage Assessment',
    'result.confidence': 'Model Confidence',
    'result.icdrGrade': 'ICDR Retinopathy Grade',
    'result.actionRequired': 'Clinical Action Required',
    'result.visualExplainability': 'Visual Explainability (Grad-CAM Lesion Heatmap)',
    'result.gradCamExplanation': 'Grad-CAM highlights specific retinal microaneurysms, hemorrhages, hard exudates, or neovascularization regions that guided the AI triage decision.',
    'result.originalFundus': 'Original Fundus Image',
    'result.gradCamOverlay': 'Grad-CAM Attention Overlay',
    'result.clinicalFindings': 'Clinical Findings & Recommendation',
    'result.recommendation': 'Triage Recommendation',
    'result.auditTrail': 'ASHA Worker Audit Trail',
    'result.recordedBy': 'Screening Recorded By:',
    'result.facility': 'Primary Facility:',
    'result.disclaimerNotice': 'Medical Disclaimer Notice',

    // Dashboard
    'dash.title': 'Population Screening Dashboard',
    'dash.subtitle': 'Rural diabetic retinopathy screening registry, epidemiological tracking, and urgent referral records',
    'dash.totalScreened': 'Total Screened',
    'dash.noDrCount': 'No DR Detected',
    'dash.referrals': 'Urgent Referrals',
    'dash.mildDr': 'Mild DR (Routine)',
    'dash.recentRecords': 'Recent Screening Records',
    'dash.searchPlaceholder': 'Search by patient name, ID, or ASHA screener...',
    'dash.exportCsv': 'Export CSV',
    'dash.colPatient': 'Patient Details',
    'dash.colDate': 'Screening Date',
    'dash.colScreener': 'ASHA Screener',
    'dash.colStage': 'ICDR Stage',
    'dash.colConfidence': 'Confidence',
    'dash.colTriage': 'Triage Action',
    'dash.colActions': 'Actions',
    'dash.viewReport': 'View Report',
    'dash.noRecords': 'No screening records found matching your search.',

    // ASHA Profile Dropdown
    'profile.mission': 'ASHA Health Mission',
    'profile.online': 'Online • Ready for Screening',
    'profile.worker': 'ASHA Worker',
    'profile.editProfile': 'Edit Profile',
    'profile.viewMenu': 'View Menu',
    'profile.myProfile': 'My Profile & Screener Options',
    'profile.newScreening': 'New Retinal Screening',
    'profile.screeningHistory': 'Screening History',
    'profile.dashboard': 'Dashboard',
    'profile.settings': 'Settings',
    'profile.logout': 'Logout',
    'profile.saveApply': 'Save & Apply Profile',
    'profile.startScreening': 'Start Screening',
    'profile.quickPresets': 'Quick Screener Presets:',
    'profile.fullName': 'ASHA Worker Full Name',
    'profile.workerId': 'ASHA Worker ID',
    'profile.phone': 'Contact Phone Number',
    'profile.center': 'Primary Health Sub-Centre / PHC',
    'profile.role': 'Designation / Role',
    'profile.village': 'Assigned Village / Area',
    'profile.device': 'Paired Fundus Camera Device',
    'profile.backToMenu': 'Back to Menu',
  },
  hi: {
    // Navbar
    'nav.newScan': 'नया स्कैन',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.demoMode': 'डेमो मोड',
    'nav.ashaPortal': 'आशा एक्सेस पोर्टल',
    'nav.ashaWorker': 'आशा कार्यकर्ता',
    'nav.logout': 'लॉगआउट',
    'nav.fieldScreener': 'फील्ड स्क्रीनर',
    'nav.newRetinalScan': 'नया रेटिना स्कैन',
    'nav.screeningDashboard': 'स्क्रीनिंग डैशबोर्ड',

    // Language Selector
    'lang.english': 'English',
    'lang.hindi': 'हिन्दी',

    // Landing / Login
    'hero.mission': 'ग्रामीण सामुदायिक स्वास्थ्य पहल',
    'hero.title1': 'अंधापन निवारण',
    'hero.title2': 'ग्रामीण भारत',
    'hero.desc': 'दृष्टिAI मान्यता प्राप्त आशा (ASHA) कार्यकर्ताओं को पोर्टेबल फंडस कैमरों से ली गई रेटिनल छवियों का उपयोग करके डायबिटिक रेटिनोपैथी की जांच करने में सशक्त बनाता है — ताकि दृष्टि हानि होने से पहले समय पर उपचार मिल सके।',
    'stats.stages': '5 डीआर चरण',
    'stats.stagesSub': 'मानक ICDR ग्रेडिंग',
    'stats.ai': 'एआई-सहायता प्राप्त',
    'stats.aiSub': 'फील्ड स्क्रीनिंग और ट्राइएज',
    'stats.speed': '< 2 सेकंड',
    'stats.speedSub': 'त्वरित रेटिना छवि विश्लेषण',
    'login.portalTitle': 'आशा कार्यकर्ता एक्सेस पोर्टल',
    'login.portalSubtitle': 'नई रेटिना स्क्रीनिंग शुरू करने या रिकॉर्ड देखने के लिए साइन इन करें',
    'login.portalActive': 'सक्रिय',
    'login.cardTitle': 'आशा कार्यकर्ता साइन इन',
    'login.cardSubtitle': 'रेटिनल फंडस स्क्रीनिंग टर्मिनल खोलने के लिए अपना नाम दर्ज करें।',
    'login.workerNameLabel': 'आशा स्वास्थ्य कार्यकर्ता का नाम',
    'login.workerNamePlaceholder': 'अपना नाम दर्ज करें (उदा. प्रिया शर्मा, सुनीता देवी, अंजली...)',
    'login.workerNameHelper': 'यहाँ लिखा गया नाम सभी रेटिना स्क्रीनिंग रिकॉर्ड, ऑडिट ट्रेल और रेफरल रिपोर्ट में दर्ज होगा।',
    'login.signInBtn': 'साइन इन करें',
    'login.signInAs': 'के रूप में साइन इन करें',
    'login.orSignInWith': 'या इसके माध्यम से साइन इन करें',
    'login.googleSignIn': 'Google से साइन इन करें',
    'login.connecting': 'Google खाते से कनेक्ट हो रहा है…',
    'login.disclaimer': 'सूचना: दृष्टिAI एक एआई-सहायता प्राप्त स्क्रीनिंग और क्लिनिकल ट्राइएज टूल है, कोई अंतिम मेडिकल निदान नहीं है। प्राथमिक नेत्र जांच के लिए तैयार किया गया है।',
    'login.footerHackathon': 'दृष्टिAI • कॉलेज हैकाथॉन संस्करण',
    'login.footerDatasets': 'Kaggle APTOS 2019 और EyePACS रेटिनल डेटासेट पर प्रशिक्षित',

    // Upload Page
    'upload.badge': 'प्राथमिक नेत्र देखभाल स्क्रीनिंग',
    'upload.title': 'रेटिनल फंडस छवि अपलोड करें',
    'upload.desc': 'पोर्टेबल फंडस कैमरे से ली गई स्पष्ट रेटिना छवि अपलोड करें। दृष्टिAI स्वचालित रूप से डायबिटिक रेटिनोपैथी का विश्लेषण करेगा और विकृतियों को Grad-CAM से दिखाएगा।',
    'upload.fundusImage': 'फंडस कैमरा छवि',
    'upload.dropTitle': 'रेटिना की छवि यहाँ खींचें और छोड़ें',
    'upload.dropSubtitle': 'या फंडस कैमरा / डिवाइस से चुनें',
    'upload.supportedFormats': 'JPG, PNG, TIFF, DICOM समर्थित (25MB तक)',
    'upload.chooseFile': 'फ़ाइल चुनें',
    'upload.changeImage': 'छवि बदलें',
    'upload.sampleImages': 'या डेमो के लिए सत्यापित रेटिना नमूना चुनें:',
    'upload.sampleNoDr': 'सामान्य रेटिना (No DR)',
    'upload.sampleModerate': 'मध्यम एनपीडीआर (Moderate NPDR)',
    'upload.sampleSevere': 'गंभीर एनपीडीआर (Severe NPDR)',
    'upload.samplePdr': 'प्रोलिफ़ेरेटिव डीआर (Proliferative DR)',
    'upload.patientDetails': 'मरीज़ का विवरण व जनसांख्यिकी',
    'upload.patientName': 'मरीज़ का पूरा नाम',
    'upload.patientNamePlaceholder': 'उदा. रमेश कुमार पटेल',
    'upload.patientId': 'मरीज़ स्क्रीनिंग आईडी',
    'upload.patientAge': 'उम्र (वर्ष)',
    'upload.patientGender': 'लिंग',
    'upload.genderMale': 'पुरुष',
    'upload.genderFemale': 'महिला',
    'upload.genderOther': 'अन्य',
    'upload.eyeExamined': 'जांची गई आँख',
    'upload.eyeRight': 'दाहिनी आँख (OD)',
    'upload.eyeLeft': 'बाईं आँख (OS)',
    'upload.diabetesDuration': 'डायबिटीज की अवधि',
    'upload.diabetesNone': 'डायबिटीज का कोई पूर्व इतिहास नहीं',
    'upload.diabetesLess5': '< 5 वर्ष',
    'upload.diabetes5to10': '5 - 10 वर्ष',
    'upload.diabetesMore10': '> 10 वर्ष',
    'upload.primarySymptoms': 'मुख्य लक्षण और आँखों की शिकायतें',
    'upload.symptomsPlaceholder': 'उदा. धुंधला दिखना, काले धब्बे दिखना, पढ़ने में परेशानी, रात में कम दिखना',
    'upload.activeScreener': 'सक्रिय आशा कार्यकर्ता:',
    'upload.analyzeBtn': 'एआई से रेटिना की जांच करें',
    'upload.analyzing': 'रेटिना छवि का विश्लेषण जारी है…',

    // Result Page
    'result.screenings': 'स्क्रीनिंग्स',
    'result.analysis': 'परिणाम विश्लेषण',
    'result.assessmentTitle': 'डायबिटिक रेटिनोपैथी मूल्यांकन',
    'result.newScan': 'नया स्कैन',
    'result.generatePdf': 'पीडीएफ रिपोर्ट बनाएं',
    'result.generatingPdf': 'रिपोर्ट तैयार हो रही है…',
    'result.shareWhatsApp': 'व्हाट्सएप पर शेयर करें',
    'result.patientName': 'मरीज़ का नाम',
    'result.patientId': 'मरीज़ आईडी',
    'result.ageDemo': 'उम्र व विवरण',
    'result.years': 'वर्ष',
    'result.scanTimestamp': 'स्कैन का समय',
    'result.ashaScreener': 'आशा कार्यकर्ता',
    'result.eyeScanned': 'जांची गई आँख',
    'result.triageAssessment': 'क्लिनिकल ट्राइएज मूल्यांकन',
    'result.confidence': 'मॉडल विश्वसनीयता',
    'result.icdrGrade': 'ICDR रेटिनोपैथी ग्रेड',
    'result.actionRequired': 'आवश्यक चिकित्सीय कार्रवाई',
    'result.visualExplainability': 'विजुअल एक्सप्लेनेबिलिटी (Grad-CAM लीजन मैप)',
    'result.gradCamExplanation': 'Grad-CAM रेटिना की उन सूक्ष्म रक्तस्राव और विकृतियों को दर्शाता है जिनके आधार पर एआई ने निर्णय लिया है।',
    'result.originalFundus': 'मूल फंडस छवि',
    'result.gradCamOverlay': 'Grad-CAM लीजन हीटमैप',
    'result.clinicalFindings': 'क्लिनिकल निष्कर्ष और सिफारिशें',
    'result.recommendation': 'ट्राइएज सिफारिश',
    'result.auditTrail': 'आशा कार्यकर्ता ऑडिट ट्रेल',
    'result.recordedBy': 'स्क्रीनिंग रिकॉर्डकर्ता:',
    'result.facility': 'प्राथमिक स्वास्थ्य केंद्र:',
    'result.disclaimerNotice': 'मेडिकल डिस्क्लेमर सूचना',

    // Dashboard
    'dash.title': 'जनसंख्या स्क्रीनिंग डैशबोर्ड',
    'dash.subtitle': 'ग्रामीण डायबिटिक रेटिनोपैथी स्क्रीनिंग रजिस्ट्री और मरीज़ रिकॉर्ड्स',
    'dash.totalScreened': 'कुल जांचें',
    'dash.noDrCount': 'डीआर नहीं पाया गया (No DR)',
    'dash.referrals': 'तत्काल रेफरल',
    'dash.mildDr': 'हल्का डीआर (नियमित जांच)',
    'dash.recentRecords': 'हालिया स्क्रीनिंग रिकॉर्ड',
    'dash.searchPlaceholder': 'मरीज़ का नाम, आईडी या आशा कार्यकर्ता से खोजें...',
    'dash.exportCsv': 'सीएसवी एक्सपोर्ट करें',
    'dash.colPatient': 'मरीज़ विवरण',
    'dash.colDate': 'स्क्रीनिंग दिनांक',
    'dash.colScreener': 'आशा कार्यकर्ता',
    'dash.colStage': 'ICDR चरण',
    'dash.colConfidence': 'विश्वसनीयता',
    'dash.colTriage': 'ट्राइएज कार्रवाई',
    'dash.colActions': 'कार्रवाई',
    'dash.viewReport': 'रिपोर्ट देखें',
    'dash.noRecords': 'आपकी खोज से मेल खाता कोई रिकॉर्ड नहीं मिला।',

    // ASHA Profile Dropdown
    'profile.mission': 'आशा स्वास्थ्य मिशन',
    'profile.online': 'ऑनलाइन • स्क्रीनिंग के लिए तैयार',
    'profile.worker': 'आशा कार्यकर्ता',
    'profile.editProfile': 'प्रोफ़ाइल बदलें',
    'profile.viewMenu': 'मेनू देखें',
    'profile.myProfile': 'मेरी प्रोफ़ाइल व विकल्प',
    'profile.newScreening': 'नई रेटिनल स्क्रीनिंग',
    'profile.screeningHistory': 'स्क्रीनिंग का इतिहास',
    'profile.dashboard': 'डैशबोर्ड',
    'profile.settings': 'सेटिंग्स',
    'profile.logout': 'लॉगआउट',
    'profile.saveApply': 'सहेजें और लागू करें',
    'profile.startScreening': 'स्क्रीनिंग शुरू करें',
    'profile.quickPresets': 'त्वरित आशा प्रोफ़ाइल:',
    'profile.fullName': 'आशा कार्यकर्ता का पूरा नाम',
    'profile.workerId': 'आशा कार्यकर्ता आईडी',
    'profile.phone': 'संपर्क फ़ोन नंबर',
    'profile.center': 'प्राथमिक स्वास्थ्य उप-केंद्र / पीएचसी',
    'profile.role': 'पद / भूमिका',
    'profile.village': 'आवंटित गाँव / क्षेत्र',
    'profile.device': 'जुड़ा हुआ फंडस कैमरा डिवाइस',
    'profile.backToMenu': 'मेनू पर वापस जाएं',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {}
    }
  };

  const t = (key, fallback) => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations.en;
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
