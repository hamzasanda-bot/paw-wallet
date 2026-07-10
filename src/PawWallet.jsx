import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import { supabase } from "./supabaseClient";
import {
  PawPrint,
  Plus,
  X,
  Syringe,
  Stethoscope,
  Phone,
  MapPin,
  User,
  Camera,
  ChevronDown,
  Check,
  AlertTriangle,
  Trash2,
  Upload,
  ScanLine,
  ShieldCheck,
  Star,
  Loader2,
  Globe,
  ClipboardList,
  Pill,
  CalendarClock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Languages                                                          */
/* ------------------------------------------------------------------ */

const LANGS = [
  { code: "tr", label: "Türkçe", locale: "tr-TR" },
  { code: "en", label: "English", locale: "en-US" },
  { code: "fr", label: "Français", locale: "fr-FR" },
  { code: "de", label: "Deutsch", locale: "de-DE" },
  { code: "es", label: "Español", locale: "es-ES" },
];

const TRANSLATIONS = {
  tr: {
    tagline: "Köpeğinizin dijital pasaportu",
    navPassport: "Pasaport",
    navVaccines: "Aşı Kartı",
    navVets: "Veteriner",
    addDogMenuItem: "Yeni köpek ekle",
    noDogsTitle: "Henüz köpek eklenmedi",
    noDogsText: "Başlamak için köpeğinizin pasaportunu oluşturun — kimlik bilgileri, QR kod ve daha fazlası otomatik hazırlanır.",
    addFirstDog: "İlk Köpeği Ekle",
    footerNote: "Faz 1 önizlemesi — Pasaport, Aşı Kartı, Veteriner Ataması. Veriler Supabase'de saklanır.",
    addDogModalTitle: "Yeni Köpek Ekle",
    editDogModalTitle: "Köpek Bilgilerini Düzenle",
    uploadPhoto: "Fotoğraf yükle",
    changePhoto: "Fotoğrafı değiştir",
    fieldDogName: "Köpek adı",
    fieldBreed: "Irk",
    fieldBirthDate: "Doğum tarihi",
    fieldGender: "Cinsiyet",
    male: "Erkek",
    female: "Dişi",
    fieldColor: "Renk",
    fieldCustomColor: "Rengi belirt",
    fieldBirthCountry: "Doğum ülkesi",
    fieldBirthCity: "Doğum şehri",
    fieldLivingCountry: "Yaşadığı ülke",
    fieldLivingCity: "Yaşadığı şehir",
    fieldMicrochip: "Mikroçip numarası",
    fieldOwnerName: "Sahip adı",
    fieldOwnerEmail: "Sahip e-postası (aşı hatırlatmaları buraya gider)",
    fieldOwnerPhone: "Sahip telefon",
    fieldOwnerAddress: "Sahip adres",
    fieldEmergencyName: "Acil kişi adı",
    fieldEmergencyPhone: "Acil kişi telefon",
    fieldPassportNumber: "Pasaport numarası (boş bırakılırsa otomatik atanır)",
    selectCountry: "Ülke seçin",
    selectCity: "Şehir seçin",
    otherCity: "Diğer (listede yok)",
    otherCityPlaceholder: "Şehir adını yazın",
    cancel: "Vazgeç",
    saveChanges: "Değişiklikleri Kaydet",
    createPassport: "Pasaportu Oluştur",
    passportHeader: "Uluslararası Evcil Hayvan Pasaportu",
    editBtn: "Düzenle",
    deleteBtn: "Sil",
    rowBirthDate: "Doğum Tarihi",
    rowGender: "Cinsiyet",
    rowColor: "Renk",
    rowBirthPlace: "Doğum Yeri",
    rowLivingPlace: "Yaşadığı Yer",
    rowMicrochip: "Mikroçip No",
    rowPassportNo: "Pasaport No",
    rowOwner: "Sahip",
    rowEmail: "E-posta",
    rowPhone: "Telefon",
    rowAddress: "Adres",
    rowEmergency: "Acil Kişi",
    rowEmergencyPhone: "Acil Telefon",
    scannableIdTitle: "Taranabilir Kimlik",
    scannableIdDesc: (name) => `Bu kod taratıldığında ${name}'in kimlik ve iletişim bilgileri anında görüntülenir.`,
    scanToReach: "Kayıp durumunda tara & ulaş",
    deleteDogModalTitle: "Köpeği Sil",
    deleteDogWarning: (name) => `${name} adlı köpeğin pasaportunu, aşı kayıtlarını ve veteriner atamalarını kalıcı olarak silmek üzeresin. Bu işlem geri alınamaz.`,
    confirmDeleteBtn: "Evet, Sil",
    vaccineTabTitle: "Aşı Kartı",
    vaccineTabSubtitle: (dogName, count) => `${dogName} için kayıtlı ${count} aşı`,
    addVaccineBtn: "Aşı Ekle",
    vaccineEmptyText: "Henüz aşı kaydı yok. İlk aşıyı ekleyerek başlayın.",
    addVaccineModalTitle: "Aşı Kaydı Ekle",
    fieldVaccineName: "Aşı adı",
    fieldCustomVaccineName: "Aşı adı (manuel)",
    fieldDateGiven: "Uygulama tarihi",
    fieldNextDose: "Sonraki doz tarihi",
    fieldVetLabel: "Uygulayan veteriner",
    chooseFromPlatform: "Platformdan seç",
    enterManually: "Manuel gir",
    fieldVetManualName: "Veteriner adı",
    fieldBatchNumber: "Parti / seri numarası",
    fieldCertificate: "Sertifika / belge",
    chooseFileText: "Dosya seç (görsel veya belge)",
    saveBtn: "Kaydet",
    labelApplication: "Uygulama",
    labelNextDose: "Sonraki Doz",
    labelVet: "Veteriner",
    labelBatch: "Parti No",
    statusOverdue: "GECİKMİŞ",
    statusSoon: "YAKINDA",
    statusCurrent: "GÜNCEL",
    vetTabTitle: "Veteriner Ataması",
    vetTabSubtitle: (dogName) => `Platformdaki veterinerlerden ${dogName}'e birincil ve ikincil veteriner atayın.`,
    platformVetsLabel: "Platform Veterinerleri",
    makePrimaryBtn: "Birincil Yap",
    makeSecondaryBtn: "İkincil Yap",
    landingHeadline: "Köpeğinizin tüm hayatı, tek bir dijital pasaportta.",
    landingSub: "Kimlik bilgileri, aşı takvimi ve veteriner ataması — hepsi güvenle saklanır, her yerden erişilir.",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    logOut: "Çıkış Yap",
    fieldFirstName: "Ad",
    fieldLastName: "Soyad",
    fieldEmail: "E-posta adresi",
    fieldPassword: "Şifre",
    fieldConfirmPassword: "Şifreni tekrar gir",
    passwordsDontMatch: "Şifreler eşleşmiyor",
    passwordTooShort: "Şifre en az 6 karakter olmalı",
    sendMagicLink: "Giriş Bağlantısı Gönder",
    createAccountBtn: "Hesap Oluştur",
    logInBtn: "Giriş Yap",
    authSignupTitle: "Hesap Oluştur",
    authLoginTitle: "Giriş Yap",
    authSwitchToLogin: "Zaten hesabın var mı? Giriş yap",
    authSwitchToSignup: "Hesabın yok mu? Kayıt ol",
    checkInboxTitle: "E-postanı onayla",
    checkInboxDesc: (email) => `${email} adresine bir onay bağlantısı gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et, bağlantıya tıkla — hesabın onaylanınca otomatik olarak pasaport sayfana yönlendirileceksin.`,
    backToForm: "Geri dön",
    authError: "Bir şeyler ters gitti, tekrar dener misin?",
    loginUserNotFound: "E-posta veya şifre hatalı, ya da hesabın henüz onaylanmamış olabilir.",
    verifyingSession: "Doğrulanıyor…",
    greeting: (name) => `Merhaba, ${name}`,
    navHealth: "Sağlık",
    navMedications: "İlaçlar",
    navAppointments: "Randevular",
    healthProfileTitle: "Sağlık Profili",
    fieldChronicConditions: "Kronik hastalıklar",
    fieldAllergies: "Alerjiler",
    saveProfileBtn: "Profili Kaydet",
    healthRecordsTitle: "Muayene Kayıtları",
    healthRecordsSubtitle: (dogName, count) => `${dogName} için kayıtlı ${count} muayene`,
    addHealthRecordBtn: "Kayıt Ekle",
    healthRecordsEmpty: "Henüz muayene kaydı yok. İlk kaydı ekleyerek başlayın.",
    addHealthRecordModalTitle: "Muayene Kaydı Ekle",
    fieldRecordDate: "Muayene tarihi",
    fieldDiagnosis: "Tanı",
    fieldExamNotes: "Muayene notları",
    fieldTreatment: "Uygulanan tedavi",
    fieldPrescription: "Reçete",
    fieldLabResults: "Laboratuvar sonuçları",
    fieldSurgery: "Bu kayıt bir ameliyatı kapsıyor",
    fieldSurgeryNotes: "Ameliyat notları",
    medicationsTitle: "İlaç Takibi",
    medicationsSubtitle: (dogName, count) => `${dogName} için kayıtlı ${count} ilaç`,
    addMedicationBtn: "İlaç Ekle",
    medicationsEmpty: "Henüz ilaç kaydı yok. İlk ilacı ekleyerek başlayın.",
    addMedicationModalTitle: "İlaç Kaydı Ekle",
    fieldMedName: "İlaç adı",
    fieldDose: "Doz",
    fieldStartDate: "Başlangıç tarihi",
    fieldEndDate: "Bitiş tarihi",
    fieldDailyReminder: "Günlük hatırlatıcı gönder",
    medStatusActive: "AKTİF",
    medStatusUpcoming: "YAKLAŞIYOR",
    medStatusFinished: "TAMAMLANDI",
    appointmentsTitle: "Randevu Takibi",
    appointmentsSubtitle: (dogName, count) => `${dogName} için kayıtlı ${count} randevu`,
    addAppointmentBtn: "Randevu Ekle",
    appointmentsEmpty: "Henüz randevu yok. İlk randevuyu ekleyerek başlayın.",
    addAppointmentModalTitle: "Randevu Ekle",
    fieldApptDate: "Randevu tarihi",
    fieldApptTime: "Saat",
    fieldApptType: "Randevu türü",
    apptTypeExam: "Muayene",
    apptTypeVaccine: "Aşı",
    apptTypeCheckup: "Kontrol",
    fieldApptVet: "Veteriner / klinik",
    apptReminderNote: "Randevudan 1 gün önce sahibine otomatik e-posta hatırlatması gönderilir.",
    apptStatusUpcoming: "YAKLAŞIYOR",
    apptStatusPast: "GEÇTİ",
  },
  en: {
    tagline: "Your dog's digital passport",
    navPassport: "Passport",
    navVaccines: "Vaccine Card",
    navVets: "Vet",
    addDogMenuItem: "Add new dog",
    noDogsTitle: "No dog added yet",
    noDogsText: "Get started by creating your dog's passport — identity details, QR code and more are prepared automatically.",
    addFirstDog: "Add First Dog",
    footerNote: "Phase 1 preview — Passport, Vaccine Card, Vet Assignment. Data is stored in Supabase.",
    addDogModalTitle: "Add New Dog",
    editDogModalTitle: "Edit Dog Details",
    uploadPhoto: "Upload photo",
    changePhoto: "Change photo",
    fieldDogName: "Dog's name",
    fieldBreed: "Breed",
    fieldBirthDate: "Date of birth",
    fieldGender: "Gender",
    male: "Male",
    female: "Female",
    fieldColor: "Color",
    fieldCustomColor: "Specify color",
    fieldBirthCountry: "Country of birth",
    fieldBirthCity: "City of birth",
    fieldLivingCountry: "Country of residence",
    fieldLivingCity: "City of residence",
    fieldMicrochip: "Microchip number",
    fieldOwnerName: "Owner's name",
    fieldOwnerEmail: "Owner's email (vaccine reminders go here)",
    fieldOwnerPhone: "Owner's phone",
    fieldOwnerAddress: "Owner's address",
    fieldEmergencyName: "Emergency contact name",
    fieldEmergencyPhone: "Emergency contact phone",
    fieldPassportNumber: "Passport number (auto-assigned if left blank)",
    selectCountry: "Select country",
    selectCity: "Select city",
    otherCity: "Other (not listed)",
    otherCityPlaceholder: "Type city name",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    createPassport: "Create Passport",
    passportHeader: "International Pet Passport",
    editBtn: "Edit",
    deleteBtn: "Delete",
    rowBirthDate: "Date of Birth",
    rowGender: "Gender",
    rowColor: "Color",
    rowBirthPlace: "Place of Birth",
    rowLivingPlace: "Place of Residence",
    rowMicrochip: "Microchip No.",
    rowPassportNo: "Passport No.",
    rowOwner: "Owner",
    rowEmail: "Email",
    rowPhone: "Phone",
    rowAddress: "Address",
    rowEmergency: "Emergency Contact",
    rowEmergencyPhone: "Emergency Phone",
    scannableIdTitle: "Scannable Identity",
    scannableIdDesc: (name) => `When scanned, ${name}'s identity and contact details appear instantly.`,
    scanToReach: "Scan & reach out if lost",
    deleteDogModalTitle: "Delete Dog",
    deleteDogWarning: (name) => `You're about to permanently delete ${name}'s passport, vaccine records and vet assignments. This action cannot be undone.`,
    confirmDeleteBtn: "Yes, Delete",
    vaccineTabTitle: "Vaccine Card",
    vaccineTabSubtitle: (dogName, count) => `${count} vaccines recorded for ${dogName}`,
    addVaccineBtn: "Add Vaccine",
    vaccineEmptyText: "No vaccine records yet. Add the first one to get started.",
    addVaccineModalTitle: "Add Vaccine Record",
    fieldVaccineName: "Vaccine name",
    fieldCustomVaccineName: "Vaccine name (manual)",
    fieldDateGiven: "Date given",
    fieldNextDose: "Next dose date",
    fieldVetLabel: "Administering vet",
    chooseFromPlatform: "Choose from platform",
    enterManually: "Enter manually",
    fieldVetManualName: "Vet's name",
    fieldBatchNumber: "Batch / lot number",
    fieldCertificate: "Certificate / document",
    chooseFileText: "Choose file (image or document)",
    saveBtn: "Save",
    labelApplication: "Given",
    labelNextDose: "Next Dose",
    labelVet: "Vet",
    labelBatch: "Batch No.",
    statusOverdue: "OVERDUE",
    statusSoon: "DUE SOON",
    statusCurrent: "CURRENT",
    vetTabTitle: "Vet Assignment",
    vetTabSubtitle: (dogName) => `Assign a primary and secondary vet to ${dogName} from platform vets.`,
    platformVetsLabel: "Platform Vets",
    makePrimaryBtn: "Make Primary",
    makeSecondaryBtn: "Make Secondary",
    landingHeadline: "Your dog's whole life, in one digital passport.",
    landingSub: "Identity details, vaccine schedule and vet assignment — securely stored, accessible from anywhere.",
    signIn: "Log In",
    signUp: "Sign Up",
    logOut: "Log Out",
    fieldFirstName: "First name",
    fieldLastName: "Last name",
    fieldEmail: "Email address",
    fieldPassword: "Password",
    fieldConfirmPassword: "Confirm password",
    passwordsDontMatch: "Passwords don't match",
    passwordTooShort: "Password must be at least 6 characters",
    sendMagicLink: "Send Login Link",
    createAccountBtn: "Create Account",
    logInBtn: "Log In",
    authSignupTitle: "Create Account",
    authLoginTitle: "Log In",
    authSwitchToLogin: "Already have an account? Log in",
    authSwitchToSignup: "Don't have an account? Sign up",
    checkInboxTitle: "Confirm your email",
    checkInboxDesc: (email) => `We sent a confirmation link to ${email}. Check your inbox (and spam folder), click the link — once confirmed you'll be redirected to your passport automatically.`,
    backToForm: "Go back",
    authError: "Something went wrong, could you try again?",
    loginUserNotFound: "Incorrect email or password, or your account may not be confirmed yet.",
    verifyingSession: "Verifying…",
    greeting: (name) => `Hi, ${name}`,
    navHealth: "Health",
    navMedications: "Medications",
    navAppointments: "Appointments",
    healthProfileTitle: "Health Profile",
    fieldChronicConditions: "Chronic conditions",
    fieldAllergies: "Allergies",
    saveProfileBtn: "Save Profile",
    healthRecordsTitle: "Health Records",
    healthRecordsSubtitle: (dogName, count) => `${count} records for ${dogName}`,
    addHealthRecordBtn: "Add Record",
    healthRecordsEmpty: "No health records yet. Add the first one to get started.",
    addHealthRecordModalTitle: "Add Health Record",
    fieldRecordDate: "Exam date",
    fieldDiagnosis: "Diagnosis",
    fieldExamNotes: "Exam notes",
    fieldTreatment: "Treatment given",
    fieldPrescription: "Prescription",
    fieldLabResults: "Lab results",
    fieldSurgery: "This record includes a surgery",
    fieldSurgeryNotes: "Surgery notes",
    medicationsTitle: "Medication Tracking",
    medicationsSubtitle: (dogName, count) => `${count} medications for ${dogName}`,
    addMedicationBtn: "Add Medication",
    medicationsEmpty: "No medications yet. Add the first one to get started.",
    addMedicationModalTitle: "Add Medication",
    fieldMedName: "Medication name",
    fieldDose: "Dose",
    fieldStartDate: "Start date",
    fieldEndDate: "End date",
    fieldDailyReminder: "Send daily reminder",
    medStatusActive: "ACTIVE",
    medStatusUpcoming: "UPCOMING",
    medStatusFinished: "FINISHED",
    appointmentsTitle: "Appointment Tracking",
    appointmentsSubtitle: (dogName, count) => `${count} appointments for ${dogName}`,
    addAppointmentBtn: "Add Appointment",
    appointmentsEmpty: "No appointments yet. Add the first one to get started.",
    addAppointmentModalTitle: "Add Appointment",
    fieldApptDate: "Appointment date",
    fieldApptTime: "Time",
    fieldApptType: "Appointment type",
    apptTypeExam: "Exam",
    apptTypeVaccine: "Vaccine",
    apptTypeCheckup: "Check-up",
    fieldApptVet: "Vet / clinic",
    apptReminderNote: "An automatic email reminder is sent to the owner 1 day before the appointment.",
    apptStatusUpcoming: "UPCOMING",
    apptStatusPast: "PAST",
  },
  fr: {
    tagline: "Le passeport numérique de votre chien",
    navPassport: "Passeport",
    navVaccines: "Carnet de Vaccination",
    navVets: "Vétérinaire",
    addDogMenuItem: "Ajouter un chien",
    noDogsTitle: "Aucun chien ajouté",
    noDogsText: "Commencez par créer le passeport de votre chien — identité, code QR et plus sont préparés automatiquement.",
    addFirstDog: "Ajouter le Premier Chien",
    footerNote: "Aperçu Phase 1 — Passeport, Carnet de Vaccination, Attribution Vétérinaire. Les données sont stockées dans Supabase.",
    addDogModalTitle: "Ajouter un Nouveau Chien",
    editDogModalTitle: "Modifier les Informations",
    uploadPhoto: "Télécharger une photo",
    changePhoto: "Changer la photo",
    fieldDogName: "Nom du chien",
    fieldBreed: "Race",
    fieldBirthDate: "Date de naissance",
    fieldGender: "Sexe",
    male: "Mâle",
    female: "Femelle",
    fieldColor: "Couleur",
    fieldCustomColor: "Préciser la couleur",
    fieldBirthCountry: "Pays de naissance",
    fieldBirthCity: "Ville de naissance",
    fieldLivingCountry: "Pays de résidence",
    fieldLivingCity: "Ville de résidence",
    fieldMicrochip: "Numéro de puce",
    fieldOwnerName: "Nom du propriétaire",
    fieldOwnerEmail: "E-mail du propriétaire (rappels de vaccins envoyés ici)",
    fieldOwnerPhone: "Téléphone du propriétaire",
    fieldOwnerAddress: "Adresse du propriétaire",
    fieldEmergencyName: "Contact d'urgence",
    fieldEmergencyPhone: "Téléphone d'urgence",
    fieldPassportNumber: "Numéro de passeport (attribué automatiquement si vide)",
    selectCountry: "Sélectionner le pays",
    selectCity: "Sélectionner la ville",
    otherCity: "Autre (non listée)",
    otherCityPlaceholder: "Saisir le nom de la ville",
    cancel: "Annuler",
    saveChanges: "Enregistrer",
    createPassport: "Créer le Passeport",
    passportHeader: "Passeport International pour Animaux",
    editBtn: "Modifier",
    deleteBtn: "Supprimer",
    rowBirthDate: "Date de Naissance",
    rowGender: "Sexe",
    rowColor: "Couleur",
    rowBirthPlace: "Lieu de Naissance",
    rowLivingPlace: "Lieu de Résidence",
    rowMicrochip: "N° de Puce",
    rowPassportNo: "N° de Passeport",
    rowOwner: "Propriétaire",
    rowEmail: "E-mail",
    rowPhone: "Téléphone",
    rowAddress: "Adresse",
    rowEmergency: "Contact d'Urgence",
    rowEmergencyPhone: "Téléphone d'Urgence",
    scannableIdTitle: "Identité Scannable",
    scannableIdDesc: (name) => `Une fois scanné, ce code affiche instantanément l'identité et les coordonnées de ${name}.`,
    scanToReach: "Scanner & contacter en cas de perte",
    deleteDogModalTitle: "Supprimer le Chien",
    deleteDogWarning: (name) => `Vous êtes sur le point de supprimer définitivement le passeport, les vaccins et les vétérinaires assignés de ${name}. Cette action est irréversible.`,
    confirmDeleteBtn: "Oui, Supprimer",
    vaccineTabTitle: "Carnet de Vaccination",
    vaccineTabSubtitle: (dogName, count) => `${count} vaccins enregistrés pour ${dogName}`,
    addVaccineBtn: "Ajouter un Vaccin",
    vaccineEmptyText: "Aucun vaccin enregistré. Ajoutez le premier pour commencer.",
    addVaccineModalTitle: "Ajouter un Vaccin",
    fieldVaccineName: "Nom du vaccin",
    fieldCustomVaccineName: "Nom du vaccin (manuel)",
    fieldDateGiven: "Date d'administration",
    fieldNextDose: "Date de la prochaine dose",
    fieldVetLabel: "Vétérinaire",
    chooseFromPlatform: "Choisir sur la plateforme",
    enterManually: "Saisir manuellement",
    fieldVetManualName: "Nom du vétérinaire",
    fieldBatchNumber: "Numéro de lot",
    fieldCertificate: "Certificat / document",
    chooseFileText: "Choisir un fichier (image ou document)",
    saveBtn: "Enregistrer",
    labelApplication: "Administré",
    labelNextDose: "Prochaine Dose",
    labelVet: "Vétérinaire",
    labelBatch: "N° de Lot",
    statusOverdue: "EN RETARD",
    statusSoon: "BIENTÔT",
    statusCurrent: "À JOUR",
    vetTabTitle: "Attribution Vétérinaire",
    vetTabSubtitle: (dogName) => `Assignez un vétérinaire principal et secondaire à ${dogName} parmi les vétérinaires de la plateforme.`,
    platformVetsLabel: "Vétérinaires de la Plateforme",
    makePrimaryBtn: "Définir Principal",
    makeSecondaryBtn: "Définir Secondaire",
    landingHeadline: "Toute la vie de votre chien, dans un seul passeport numérique.",
    landingSub: "Identité, calendrier de vaccination et vétérinaire assigné — stockés en sécurité, accessibles de partout.",
    signIn: "Connexion",
    signUp: "S'inscrire",
    logOut: "Déconnexion",
    fieldFirstName: "Prénom",
    fieldLastName: "Nom",
    fieldEmail: "Adresse e-mail",
    fieldPassword: "Mot de passe",
    fieldConfirmPassword: "Confirmer le mot de passe",
    passwordsDontMatch: "Les mots de passe ne correspondent pas",
    passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
    sendMagicLink: "Envoyer le Lien de Connexion",
    createAccountBtn: "Créer un Compte",
    logInBtn: "Connexion",
    authSignupTitle: "Créer un Compte",
    authLoginTitle: "Connexion",
    authSwitchToLogin: "Déjà un compte ? Connectez-vous",
    authSwitchToSignup: "Pas de compte ? Inscrivez-vous",
    checkInboxTitle: "Confirmez votre e-mail",
    checkInboxDesc: (email) => `Nous avons envoyé un lien de confirmation à ${email}. Vérifiez votre boîte de réception (et vos spams), cliquez sur le lien — une fois confirmé, vous serez redirigé vers votre passeport automatiquement.`,
    backToForm: "Retour",
    authError: "Une erreur s'est produite, veuillez réessayer.",
    loginUserNotFound: "E-mail ou mot de passe incorrect, ou votre compte n'est peut-être pas encore confirmé.",
    verifyingSession: "Vérification…",
    greeting: (name) => `Bonjour, ${name}`,
    navHealth: "Santé",
    navMedications: "Médicaments",
    navAppointments: "Rendez-vous",
    healthProfileTitle: "Profil de Santé",
    fieldChronicConditions: "Maladies chroniques",
    fieldAllergies: "Allergies",
    saveProfileBtn: "Enregistrer le Profil",
    healthRecordsTitle: "Dossiers Médicaux",
    healthRecordsSubtitle: (dogName, count) => `${count} consultations pour ${dogName}`,
    addHealthRecordBtn: "Ajouter un Dossier",
    healthRecordsEmpty: "Aucun dossier médical. Ajoutez le premier pour commencer.",
    addHealthRecordModalTitle: "Ajouter un Dossier Médical",
    fieldRecordDate: "Date de consultation",
    fieldDiagnosis: "Diagnostic",
    fieldExamNotes: "Notes de consultation",
    fieldTreatment: "Traitement administré",
    fieldPrescription: "Ordonnance",
    fieldLabResults: "Résultats de laboratoire",
    fieldSurgery: "Ce dossier inclut une opération",
    fieldSurgeryNotes: "Notes de l'opération",
    medicationsTitle: "Suivi des Médicaments",
    medicationsSubtitle: (dogName, count) => `${count} médicaments pour ${dogName}`,
    addMedicationBtn: "Ajouter un Médicament",
    medicationsEmpty: "Aucun médicament. Ajoutez le premier pour commencer.",
    addMedicationModalTitle: "Ajouter un Médicament",
    fieldMedName: "Nom du médicament",
    fieldDose: "Dose",
    fieldStartDate: "Date de début",
    fieldEndDate: "Date de fin",
    fieldDailyReminder: "Envoyer un rappel quotidien",
    medStatusActive: "ACTIF",
    medStatusUpcoming: "À VENIR",
    medStatusFinished: "TERMINÉ",
    appointmentsTitle: "Suivi des Rendez-vous",
    appointmentsSubtitle: (dogName, count) => `${count} rendez-vous pour ${dogName}`,
    addAppointmentBtn: "Ajouter un Rendez-vous",
    appointmentsEmpty: "Aucun rendez-vous. Ajoutez le premier pour commencer.",
    addAppointmentModalTitle: "Ajouter un Rendez-vous",
    fieldApptDate: "Date du rendez-vous",
    fieldApptTime: "Heure",
    fieldApptType: "Type de rendez-vous",
    apptTypeExam: "Consultation",
    apptTypeVaccine: "Vaccin",
    apptTypeCheckup: "Contrôle",
    fieldApptVet: "Vétérinaire / clinique",
    apptReminderNote: "Un rappel automatique par e-mail est envoyé au propriétaire 1 jour avant le rendez-vous.",
    apptStatusUpcoming: "À VENIR",
    apptStatusPast: "PASSÉ",
  },
  de: {
    tagline: "Der digitale Pass Ihres Hundes",
    navPassport: "Reisepass",
    navVaccines: "Impfausweis",
    navVets: "Tierarzt",
    addDogMenuItem: "Neuen Hund hinzufügen",
    noDogsTitle: "Noch kein Hund hinzugefügt",
    noDogsText: "Erstellen Sie den Pass Ihres Hundes — Identitätsdaten, QR-Code und mehr werden automatisch vorbereitet.",
    addFirstDog: "Ersten Hund Hinzufügen",
    footerNote: "Phase-1-Vorschau — Reisepass, Impfausweis, Tierarztzuweisung. Daten werden in Supabase gespeichert.",
    addDogModalTitle: "Neuen Hund Hinzufügen",
    editDogModalTitle: "Hundedaten Bearbeiten",
    uploadPhoto: "Foto hochladen",
    changePhoto: "Foto ändern",
    fieldDogName: "Name des Hundes",
    fieldBreed: "Rasse",
    fieldBirthDate: "Geburtsdatum",
    fieldGender: "Geschlecht",
    male: "Rüde",
    female: "Hündin",
    fieldColor: "Farbe",
    fieldCustomColor: "Farbe angeben",
    fieldBirthCountry: "Geburtsland",
    fieldBirthCity: "Geburtsstadt",
    fieldLivingCountry: "Wohnsitzland",
    fieldLivingCity: "Wohnort",
    fieldMicrochip: "Mikrochip-Nummer",
    fieldOwnerName: "Name des Besitzers",
    fieldOwnerEmail: "E-Mail des Besitzers (Impferinnerungen gehen hierhin)",
    fieldOwnerPhone: "Telefon des Besitzers",
    fieldOwnerAddress: "Adresse des Besitzers",
    fieldEmergencyName: "Notfallkontakt Name",
    fieldEmergencyPhone: "Notfallkontakt Telefon",
    fieldPassportNumber: "Passnummer (wird automatisch vergeben, wenn leer)",
    selectCountry: "Land auswählen",
    selectCity: "Stadt auswählen",
    otherCity: "Andere (nicht gelistet)",
    otherCityPlaceholder: "Stadtname eingeben",
    cancel: "Abbrechen",
    saveChanges: "Änderungen Speichern",
    createPassport: "Pass Erstellen",
    passportHeader: "Internationaler Heimtierausweis",
    editBtn: "Bearbeiten",
    deleteBtn: "Löschen",
    rowBirthDate: "Geburtsdatum",
    rowGender: "Geschlecht",
    rowColor: "Farbe",
    rowBirthPlace: "Geburtsort",
    rowLivingPlace: "Wohnort",
    rowMicrochip: "Mikrochip-Nr.",
    rowPassportNo: "Pass-Nr.",
    rowOwner: "Besitzer",
    rowEmail: "E-Mail",
    rowPhone: "Telefon",
    rowAddress: "Adresse",
    rowEmergency: "Notfallkontakt",
    rowEmergencyPhone: "Notfalltelefon",
    scannableIdTitle: "Scanbare Identität",
    scannableIdDesc: (name) => `Beim Scannen werden die Identitäts- und Kontaktdaten von ${name} sofort angezeigt.`,
    scanToReach: "Bei Verlust scannen & kontaktieren",
    deleteDogModalTitle: "Hund Löschen",
    deleteDogWarning: (name) => `Sie sind dabei, den Pass, die Impfdaten und die Tierarztzuweisungen von ${name} dauerhaft zu löschen. Dies kann nicht rückgängig gemacht werden.`,
    confirmDeleteBtn: "Ja, Löschen",
    vaccineTabTitle: "Impfausweis",
    vaccineTabSubtitle: (dogName, count) => `${count} Impfungen für ${dogName} erfasst`,
    addVaccineBtn: "Impfung Hinzufügen",
    vaccineEmptyText: "Noch keine Impfungen erfasst. Fügen Sie die erste hinzu.",
    addVaccineModalTitle: "Impfung Hinzufügen",
    fieldVaccineName: "Impfstoffname",
    fieldCustomVaccineName: "Impfstoffname (manuell)",
    fieldDateGiven: "Verabreichungsdatum",
    fieldNextDose: "Nächste Dosis am",
    fieldVetLabel: "Behandelnder Tierarzt",
    chooseFromPlatform: "Aus Plattform wählen",
    enterManually: "Manuell eingeben",
    fieldVetManualName: "Name des Tierarztes",
    fieldBatchNumber: "Chargennummer",
    fieldCertificate: "Zertifikat / Dokument",
    chooseFileText: "Datei wählen (Bild oder Dokument)",
    saveBtn: "Speichern",
    labelApplication: "Verabreicht",
    labelNextDose: "Nächste Dosis",
    labelVet: "Tierarzt",
    labelBatch: "Charge Nr.",
    statusOverdue: "ÜBERFÄLLIG",
    statusSoon: "BALD FÄLLIG",
    statusCurrent: "AKTUELL",
    vetTabTitle: "Tierarztzuweisung",
    vetTabSubtitle: (dogName) => `Weisen Sie ${dogName} einen primären und sekundären Tierarzt aus der Plattform zu.`,
    platformVetsLabel: "Plattform-Tierärzte",
    makePrimaryBtn: "Als Primär Festlegen",
    makeSecondaryBtn: "Als Sekundär Festlegen",
    landingHeadline: "Das ganze Leben Ihres Hundes in einem digitalen Pass.",
    landingSub: "Identitätsdaten, Impfplan und Tierarztzuweisung — sicher gespeichert, von überall zugänglich.",
    signIn: "Anmelden",
    signUp: "Registrieren",
    logOut: "Abmelden",
    fieldFirstName: "Vorname",
    fieldLastName: "Nachname",
    fieldEmail: "E-Mail-Adresse",
    fieldPassword: "Passwort",
    fieldConfirmPassword: "Passwort bestätigen",
    passwordsDontMatch: "Passwörter stimmen nicht überein",
    passwordTooShort: "Passwort muss mindestens 6 Zeichen haben",
    sendMagicLink: "Anmeldelink Senden",
    createAccountBtn: "Konto Erstellen",
    logInBtn: "Anmelden",
    authSignupTitle: "Konto Erstellen",
    authLoginTitle: "Anmelden",
    authSwitchToLogin: "Bereits ein Konto? Anmelden",
    authSwitchToSignup: "Noch kein Konto? Registrieren",
    checkInboxTitle: "Bestätigen Sie Ihre E-Mail",
    checkInboxDesc: (email) => `Wir haben einen Bestätigungslink an ${email} gesendet. Prüfen Sie Ihr Postfach (und den Spam-Ordner), klicken Sie auf den Link — nach der Bestätigung werden Sie automatisch zu Ihrem Pass weitergeleitet.`,
    backToForm: "Zurück",
    authError: "Etwas ist schiefgelaufen, bitte versuchen Sie es erneut.",
    loginUserNotFound: "E-Mail oder Passwort falsch, oder Ihr Konto ist noch nicht bestätigt.",
    verifyingSession: "Wird überprüft…",
    greeting: (name) => `Hallo, ${name}`,
    navHealth: "Gesundheit",
    navMedications: "Medikamente",
    navAppointments: "Termine",
    healthProfileTitle: "Gesundheitsprofil",
    fieldChronicConditions: "Chronische Erkrankungen",
    fieldAllergies: "Allergien",
    saveProfileBtn: "Profil Speichern",
    healthRecordsTitle: "Behandlungsakten",
    healthRecordsSubtitle: (dogName, count) => `${count} Untersuchungen für ${dogName}`,
    addHealthRecordBtn: "Eintrag Hinzufügen",
    healthRecordsEmpty: "Noch keine Behandlungsakte. Fügen Sie die erste hinzu.",
    addHealthRecordModalTitle: "Behandlungseintrag Hinzufügen",
    fieldRecordDate: "Untersuchungsdatum",
    fieldDiagnosis: "Diagnose",
    fieldExamNotes: "Untersuchungsnotizen",
    fieldTreatment: "Durchgeführte Behandlung",
    fieldPrescription: "Rezept",
    fieldLabResults: "Laborergebnisse",
    fieldSurgery: "Dieser Eintrag beinhaltet eine Operation",
    fieldSurgeryNotes: "Operationsnotizen",
    medicationsTitle: "Medikamentenverfolgung",
    medicationsSubtitle: (dogName, count) => `${count} Medikamente für ${dogName}`,
    addMedicationBtn: "Medikament Hinzufügen",
    medicationsEmpty: "Noch keine Medikamente. Fügen Sie das erste hinzu.",
    addMedicationModalTitle: "Medikament Hinzufügen",
    fieldMedName: "Medikamentenname",
    fieldDose: "Dosis",
    fieldStartDate: "Startdatum",
    fieldEndDate: "Enddatum",
    fieldDailyReminder: "Tägliche Erinnerung senden",
    medStatusActive: "AKTIV",
    medStatusUpcoming: "BEVORSTEHEND",
    medStatusFinished: "ABGESCHLOSSEN",
    appointmentsTitle: "Terminverfolgung",
    appointmentsSubtitle: (dogName, count) => `${count} Termine für ${dogName}`,
    addAppointmentBtn: "Termin Hinzufügen",
    appointmentsEmpty: "Noch keine Termine. Fügen Sie den ersten hinzu.",
    addAppointmentModalTitle: "Termin Hinzufügen",
    fieldApptDate: "Termindatum",
    fieldApptTime: "Uhrzeit",
    fieldApptType: "Terminart",
    apptTypeExam: "Untersuchung",
    apptTypeVaccine: "Impfung",
    apptTypeCheckup: "Kontrolle",
    fieldApptVet: "Tierarzt / Klinik",
    apptReminderNote: "Eine automatische E-Mail-Erinnerung wird 1 Tag vor dem Termin an den Besitzer gesendet.",
    apptStatusUpcoming: "BEVORSTEHEND",
    apptStatusPast: "VERGANGEN",
  },
  es: {
    tagline: "El pasaporte digital de tu perro",
    navPassport: "Pasaporte",
    navVaccines: "Cartilla de Vacunas",
    navVets: "Veterinario",
    addDogMenuItem: "Añadir nuevo perro",
    noDogsTitle: "Aún no se ha añadido ningún perro",
    noDogsText: "Comienza creando el pasaporte de tu perro — los datos de identidad, el código QR y más se preparan automáticamente.",
    addFirstDog: "Añadir Primer Perro",
    footerNote: "Vista previa Fase 1 — Pasaporte, Cartilla de Vacunas, Asignación de Veterinario. Los datos se almacenan en Supabase.",
    addDogModalTitle: "Añadir Nuevo Perro",
    editDogModalTitle: "Editar Datos del Perro",
    uploadPhoto: "Subir foto",
    changePhoto: "Cambiar foto",
    fieldDogName: "Nombre del perro",
    fieldBreed: "Raza",
    fieldBirthDate: "Fecha de nacimiento",
    fieldGender: "Sexo",
    male: "Macho",
    female: "Hembra",
    fieldColor: "Color",
    fieldCustomColor: "Especificar color",
    fieldBirthCountry: "País de nacimiento",
    fieldBirthCity: "Ciudad de nacimiento",
    fieldLivingCountry: "País de residencia",
    fieldLivingCity: "Ciudad de residencia",
    fieldMicrochip: "Número de microchip",
    fieldOwnerName: "Nombre del dueño",
    fieldOwnerEmail: "Correo del dueño (los recordatorios de vacunas se envían aquí)",
    fieldOwnerPhone: "Teléfono del dueño",
    fieldOwnerAddress: "Dirección del dueño",
    fieldEmergencyName: "Nombre de contacto de emergencia",
    fieldEmergencyPhone: "Teléfono de emergencia",
    fieldPassportNumber: "Número de pasaporte (se asigna automáticamente si se deja en blanco)",
    selectCountry: "Seleccionar país",
    selectCity: "Seleccionar ciudad",
    otherCity: "Otra (no listada)",
    otherCityPlaceholder: "Escribe el nombre de la ciudad",
    cancel: "Cancelar",
    saveChanges: "Guardar Cambios",
    createPassport: "Crear Pasaporte",
    passportHeader: "Pasaporte Internacional para Mascotas",
    editBtn: "Editar",
    deleteBtn: "Eliminar",
    rowBirthDate: "Fecha de Nacimiento",
    rowGender: "Sexo",
    rowColor: "Color",
    rowBirthPlace: "Lugar de Nacimiento",
    rowLivingPlace: "Lugar de Residencia",
    rowMicrochip: "N.º de Microchip",
    rowPassportNo: "N.º de Pasaporte",
    rowOwner: "Dueño",
    rowEmail: "Correo",
    rowPhone: "Teléfono",
    rowAddress: "Dirección",
    rowEmergency: "Contacto de Emergencia",
    rowEmergencyPhone: "Teléfono de Emergencia",
    scannableIdTitle: "Identidad Escaneable",
    scannableIdDesc: (name) => `Al escanearlo, aparecen al instante los datos de identidad y contacto de ${name}.`,
    scanToReach: "Escanea y contacta si se pierde",
    deleteDogModalTitle: "Eliminar Perro",
    deleteDogWarning: (name) => `Estás a punto de eliminar permanentemente el pasaporte, los registros de vacunas y las asignaciones de veterinario de ${name}. Esta acción no se puede deshacer.`,
    confirmDeleteBtn: "Sí, Eliminar",
    vaccineTabTitle: "Cartilla de Vacunas",
    vaccineTabSubtitle: (dogName, count) => `${count} vacunas registradas para ${dogName}`,
    addVaccineBtn: "Añadir Vacuna",
    vaccineEmptyText: "Aún no hay vacunas registradas. Añade la primera para empezar.",
    addVaccineModalTitle: "Añadir Registro de Vacuna",
    fieldVaccineName: "Nombre de la vacuna",
    fieldCustomVaccineName: "Nombre de la vacuna (manual)",
    fieldDateGiven: "Fecha de aplicación",
    fieldNextDose: "Fecha de la próxima dosis",
    fieldVetLabel: "Veterinario que la administró",
    chooseFromPlatform: "Elegir de la plataforma",
    enterManually: "Introducir manualmente",
    fieldVetManualName: "Nombre del veterinario",
    fieldBatchNumber: "Número de lote",
    fieldCertificate: "Certificado / documento",
    chooseFileText: "Elegir archivo (imagen o documento)",
    saveBtn: "Guardar",
    labelApplication: "Aplicada",
    labelNextDose: "Próxima Dosis",
    labelVet: "Veterinario",
    labelBatch: "N.º de Lote",
    statusOverdue: "ATRASADA",
    statusSoon: "PRÓXIMA",
    statusCurrent: "AL DÍA",
    vetTabTitle: "Asignación de Veterinario",
    vetTabSubtitle: (dogName) => `Asigna un veterinario principal y secundario a ${dogName} de entre los veterinarios de la plataforma.`,
    platformVetsLabel: "Veterinarios de la Plataforma",
    makePrimaryBtn: "Hacer Principal",
    makeSecondaryBtn: "Hacer Secundario",
    landingHeadline: "Toda la vida de tu perro, en un solo pasaporte digital.",
    landingSub: "Datos de identidad, calendario de vacunas y veterinario asignado — almacenados con seguridad, accesibles desde cualquier lugar.",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    logOut: "Cerrar Sesión",
    fieldFirstName: "Nombre",
    fieldLastName: "Apellido",
    fieldEmail: "Correo electrónico",
    fieldPassword: "Contraseña",
    fieldConfirmPassword: "Confirmar contraseña",
    passwordsDontMatch: "Las contraseñas no coinciden",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    sendMagicLink: "Enviar Enlace de Acceso",
    createAccountBtn: "Crear Cuenta",
    logInBtn: "Iniciar Sesión",
    authSignupTitle: "Crear Cuenta",
    authLoginTitle: "Iniciar Sesión",
    authSwitchToLogin: "¿Ya tienes cuenta? Inicia sesión",
    authSwitchToSignup: "¿No tienes cuenta? Regístrate",
    checkInboxTitle: "Confirma tu correo",
    checkInboxDesc: (email) => `Enviamos un enlace de confirmación a ${email}. Revisa tu bandeja de entrada (y la carpeta de spam), haz clic en el enlace — una vez confirmado serás redirigido automáticamente a tu pasaporte.`,
    backToForm: "Volver",
    authError: "Algo salió mal, ¿podrías intentarlo de nuevo?",
    loginUserNotFound: "Correo o contraseña incorrectos, o tu cuenta aún no está confirmada.",
    verifyingSession: "Verificando…",
    greeting: (name) => `Hola, ${name}`,
    navHealth: "Salud",
    navMedications: "Medicamentos",
    navAppointments: "Citas",
    healthProfileTitle: "Perfil de Salud",
    fieldChronicConditions: "Enfermedades crónicas",
    fieldAllergies: "Alergias",
    saveProfileBtn: "Guardar Perfil",
    healthRecordsTitle: "Historial Médico",
    healthRecordsSubtitle: (dogName, count) => `${count} consultas registradas para ${dogName}`,
    addHealthRecordBtn: "Añadir Registro",
    healthRecordsEmpty: "Aún no hay registros médicos. Añade el primero para empezar.",
    addHealthRecordModalTitle: "Añadir Registro Médico",
    fieldRecordDate: "Fecha de consulta",
    fieldDiagnosis: "Diagnóstico",
    fieldExamNotes: "Notas de la consulta",
    fieldTreatment: "Tratamiento aplicado",
    fieldPrescription: "Receta",
    fieldLabResults: "Resultados de laboratorio",
    fieldSurgery: "Este registro incluye una cirugía",
    fieldSurgeryNotes: "Notas de la cirugía",
    medicationsTitle: "Seguimiento de Medicamentos",
    medicationsSubtitle: (dogName, count) => `${count} medicamentos para ${dogName}`,
    addMedicationBtn: "Añadir Medicamento",
    medicationsEmpty: "Aún no hay medicamentos. Añade el primero para empezar.",
    addMedicationModalTitle: "Añadir Medicamento",
    fieldMedName: "Nombre del medicamento",
    fieldDose: "Dosis",
    fieldStartDate: "Fecha de inicio",
    fieldEndDate: "Fecha de fin",
    fieldDailyReminder: "Enviar recordatorio diario",
    medStatusActive: "ACTIVO",
    medStatusUpcoming: "PRÓXIMO",
    medStatusFinished: "FINALIZADO",
    appointmentsTitle: "Seguimiento de Citas",
    appointmentsSubtitle: (dogName, count) => `${count} citas para ${dogName}`,
    addAppointmentBtn: "Añadir Cita",
    appointmentsEmpty: "Aún no hay citas. Añade la primera para empezar.",
    addAppointmentModalTitle: "Añadir Cita",
    fieldApptDate: "Fecha de la cita",
    fieldApptTime: "Hora",
    fieldApptType: "Tipo de cita",
    apptTypeExam: "Consulta",
    apptTypeVaccine: "Vacuna",
    apptTypeCheckup: "Revisión",
    fieldApptVet: "Veterinario / clínica",
    apptReminderNote: "Se envía un recordatorio automático por correo al dueño 1 día antes de la cita.",
    apptStatusUpcoming: "PRÓXIMA",
    apptStatusPast: "PASADA",
  },
};

const I18nContext = createContext({ t: TRANSLATIONS.tr, lang: "tr", setLang: () => {} });
const useI18n = () => useContext(I18nContext);

/* ------------------------------------------------------------------ */
/*  Countries, dial codes & major cities                               */
/*  (Europe + Turkey + USA — major cities only; "Other" covers the     */
/*  rest so every town doesn't need to be listed individually)         */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  { name: "Turkey", dial: "+90", cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Diyarbakir", "Kayseri", "Eskisehir", "Trabzon", "Malatya", "Sanliurfa"] },
  { name: "Germany", dial: "+49", cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg"] },
  { name: "France", dial: "+33", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims"] },
  { name: "Spain", dial: "+34", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba"] },
  { name: "Italy", dial: "+39", cities: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice", "Verona"] },
  { name: "United Kingdom", dial: "+44", cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Sheffield", "Newcastle", "Belfast", "Cardiff"] },
  { name: "Netherlands", dial: "+31", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere"] },
  { name: "Belgium", dial: "+32", cities: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges"] },
  { name: "Switzerland", dial: "+41", cities: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne"] },
  { name: "Austria", dial: "+43", cities: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"] },
  { name: "Portugal", dial: "+351", cities: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"] },
  { name: "Greece", dial: "+30", cities: ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa"] },
  { name: "Poland", dial: "+48", cities: ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk"] },
  { name: "Sweden", dial: "+46", cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala"] },
  { name: "Norway", dial: "+47", cities: ["Oslo", "Bergen", "Trondheim", "Stavanger"] },
  { name: "Denmark", dial: "+45", cities: ["Copenhagen", "Aarhus", "Odense", "Aalborg"] },
  { name: "Finland", dial: "+358", cities: ["Helsinki", "Espoo", "Tampere", "Vantaa"] },
  { name: "Ireland", dial: "+353", cities: ["Dublin", "Cork", "Limerick", "Galway"] },
  { name: "Czech Republic", dial: "+420", cities: ["Prague", "Brno", "Ostrava"] },
  { name: "Hungary", dial: "+36", cities: ["Budapest", "Debrecen", "Szeged"] },
  { name: "Romania", dial: "+40", cities: ["Bucharest", "Cluj-Napoca", "Timișoara"] },
  { name: "Bulgaria", dial: "+359", cities: ["Sofia", "Plovdiv", "Varna"] },
  { name: "Croatia", dial: "+385", cities: ["Zagreb", "Split", "Rijeka"] },
  { name: "Malta", dial: "+356", cities: ["Valletta", "Sliema", "St. Julian's", "Birkirkara", "Mosta"] },
  { name: "Cyprus", dial: "+357", cities: ["Nicosia", "Limassol", "Larnaca"] },
  { name: "Ukraine", dial: "+380", cities: ["Kyiv", "Kharkiv", "Odesa", "Lviv"] },
  { name: "Serbia", dial: "+381", cities: ["Belgrade", "Novi Sad"] },
  { name: "Slovakia", dial: "+421", cities: ["Bratislava", "Košice"] },
  { name: "Slovenia", dial: "+386", cities: ["Ljubljana", "Maribor"] },
  { name: "Lithuania", dial: "+370", cities: ["Vilnius", "Kaunas"] },
  { name: "Latvia", dial: "+371", cities: ["Riga", "Daugavpils"] },
  { name: "Estonia", dial: "+372", cities: ["Tallinn", "Tartu"] },
  { name: "Luxembourg", dial: "+352", cities: ["Luxembourg City"] },
  { name: "Iceland", dial: "+354", cities: ["Reykjavik"] },
  {
    name: "United States",
    dial: "+1",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Austin", "San Jose", "Miami", "Boston", "Seattle", "Denver", "Washington D.C."],
  },
];

const OTHER_CITY = "__other__";

/* ------------------------------------------------------------------ */
/*  Other constants                                                    */
/* ------------------------------------------------------------------ */

const COMMON_VACCINES = [
  "Kuduz / Rabies",
  "Karma (DHPPi)",
  "Leptospiroz",
  "Bordetella (Kennel Cough)",
  "Leishmania",
  "Corona virüsü",
  "Diğer",
];

const BREEDS = [
  "Melez / Karışık",
  "Golden Retriever",
  "Labrador Retriever",
  "Kangal",
  "Akbaş",
  "Anadolu Çoban Köpeği",
  "Kars Çoban Köpeği (Çakabey)",
  "Malaklı",
  "Fransız Bulldog",
  "İngiliz Bulldog",
  "Pomeranian (Spitz)",
  "Chihuahua",
  "Beagle",
  "Cocker Spaniel",
  "Alman Kurdu (German Shepherd)",
  "Rottweiler",
  "Doberman",
  "Boxer",
  "Husky (Siberian Husky)",
  "Akita",
  "Shiba Inu",
  "Border Collie",
  "Avustralya Çoban Köpeği (Aussie)",
  "Jack Russell Terrier",
  "Yorkshire Terrier",
  "Shih Tzu",
  "Maltese (Malta Köpeği)",
  "Pug",
  "Dalmaçyalı",
  "Rus Tazısı (Borzoi)",
  "Grönland Köpeği",
  "Saint Bernard",
  "Bernese Mountain Dog",
  "Great Dane (Danua)",
  "Mastiff",
  "Bull Terrier",
  "Staffordshire Bull Terrier",
  "American Pitbull Terrier",
  "Rhodesian Ridgeback",
  "Weimaraner",
  "Vizsla",
  "Pointer",
  "Setter (İrlanda)",
  "Basset Hound",
  "Bloodhound",
  "Dachshund (Sosis Köpek)",
  "Schnauzer",
  "Poodle (Standart)",
  "Toy Poodle",
  "Bichon Frise",
  "Havanese",
  "Papillon",
  "Pekingese",
  "Lhasa Apso",
  "Bull Mastiff",
  "Newfoundland",
  "Samoyed",
  "Alaskan Malamute",
  "Collie",
  "Sheltie (Shetland Sheepdog)",
  "Corgi (Pembroke Welsh)",
  "Whippet",
  "Greyhound (Tazı)",
  "Afgan Tazısı",
  "Kuvasz",
  "Sivas Kangalı",
  "Karabaş",
  "Diğer",
];

const COLORS = [
  "Siyah",
  "Beyaz",
  "Kahverengi",
  "Kum Rengi (Fawn)",
  "Kızıl / Kırmızımsı",
  "Gri",
  "Sarı / Krem",
  "Sable (Kızıl-Siyah Karışık)",
  "Siyah-Beyaz",
  "Kahverengi-Beyaz",
  "Üç Renkli (Tricolor)",
  "Benekli (Merle)",
  "Altın Sarısı",
  "Diğer",
];

const PLATFORM_VETS = [
  { id: "v1", name: "Dr. Elif Kaya", clinic: "Bostancı Veteriner Kliniği", city: "İstanbul", specialty: "İç Hastalıklar", phone: "+90 532 111 22 33", rating: 4.9 },
  { id: "v2", name: "Dr. Mert Aydın", clinic: "Kadıköy Pet Sağlık Merkezi", city: "İstanbul", specialty: "Cerrahi", phone: "+90 533 222 33 44", rating: 4.8 },
  { id: "v3", name: "Dr. Zeynep Arslan", clinic: "Malta Animal Care", city: "Sliema, Malta", specialty: "Genel Bakım", phone: "+356 7911 2233", rating: 5.0 },
  { id: "v4", name: "Dr. Kerem Şahin", clinic: "Valletta Vet Clinic", city: "Valletta, Malta", specialty: "Aşı & Önleyici Bakım", phone: "+356 7922 3344", rating: 4.7 },
  { id: "v5", name: "Dr. Ayşe Demir", clinic: "Ataşehir Veteriner Polikliniği", city: "İstanbul", specialty: "Diş & Ağız Sağlığı", phone: "+90 535 444 55 66", rating: 4.6 },
  { id: "v6", name: "Dr. Luca Borg", clinic: "St. Julian's Vet Practice", city: "St. Julian's, Malta", specialty: "İç Hastalıklar", phone: "+356 7933 4455", rating: 4.9 },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
};

const fmtDate = (dateStr, locale) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(locale || "tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtPhone = (code, number) => {
  if (!code && !number) return "";
  return `${code || ""} ${number || ""}`.trim();
};

/* ------------------------------------------------------------------ */
/*  Image resize helper (keeps storage light)                          */
/* ------------------------------------------------------------------ */

function resizeImageFile(file, maxSize = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                     */
/* ------------------------------------------------------------------ */

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5b6d63] mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-md border border-[#d8cfb4] bg-[#fdfbf4] px-3 py-2 text-[14.5px] text-[#1f2a24] placeholder-[#9b9481] focus:outline-none focus:ring-2 focus:ring-[#1B3A2F]/30 focus:border-[#1B3A2F] transition font-body";

const monoInputCls = inputCls + " font-mono tracking-wide";

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12201a]/55 backdrop-blur-sm p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[88vh] overflow-y-auto rounded-2xl bg-[#F7F3E8] border border-[#e3d9bd] shadow-2xl`}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-[#F7F3E8]/95 backdrop-blur border-b border-[#e3d9bd] rounded-t-2xl">
          <h3 className="font-display text-[19px] text-[#1B3A2F]">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full text-[#5b6d63] hover:bg-[#eae2c8] transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button", full, icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${full ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-md bg-[#1B3A2F] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F3E8] tracking-wide hover:bg-[#234a3b] active:scale-[0.98] transition shadow-sm`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, danger }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[13px] font-medium transition ${
        danger
          ? "border-[#e3c2c2] text-[#a63d40] hover:bg-[#f7e9e9]"
          : "border-[#d8cfb4] text-[#3c473f] hover:bg-[#eee6cd]"
      }`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGS.find((l) => l.code === lang);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-[#d8cfb4] bg-[#FBF8EE] px-3 py-1.5 text-[12.5px] font-medium text-[#3c473f] hover:bg-[#f0e9cd] transition"
      >
        <Globe size={13} /> {current?.label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] shadow-lg overflow-hidden z-30">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#f0e9cd] transition ${
                l.code === lang ? "bg-[#f0e9cd] font-semibold" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Country + city cascading select, with a manual fallback for cities not listed */
function CountryCityPicker({ t, countryLabel, cityLabel, country, city, onCountryChange, onCityChange }) {
  const selectedCountry = COUNTRIES.find((c) => c.name === country);
  const isOtherCity = city && selectedCountry && !selectedCountry.cities.includes(city);

  return (
    <>
      <Field label={countryLabel}>
        <select
          className={inputCls}
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onCityChange("");
          }}
        >
          <option value="">{t.selectCountry}</option>
          {COUNTRIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={cityLabel}>
        {selectedCountry ? (
          <div className="space-y-2">
            <select
              className={inputCls}
              value={isOtherCity ? OTHER_CITY : city}
              onChange={(e) => onCityChange(e.target.value === OTHER_CITY ? "" : e.target.value)}
            >
              <option value="">{t.selectCity}</option>
              {selectedCountry.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER_CITY}>{t.otherCity}</option>
            </select>
            {(isOtherCity || city === "") && isOtherCity && (
              <input
                className={inputCls}
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder={t.otherCityPlaceholder}
              />
            )}
          </div>
        ) : (
          <select className={inputCls} disabled>
            <option>{t.selectCity}</option>
          </select>
        )}
      </Field>
    </>
  );
}

/* Dial-code select embedded inside the number input — avoids flex/grid overflow issues entirely */
function PhoneField({ label, code, number, onCodeChange, onNumberChange, placeholder }) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="absolute left-0 top-0 bottom-0 w-[68px] rounded-l-md border-0 border-r border-[#d8cfb4] bg-transparent text-[13px] font-mono text-[#1f2a24] pl-2 pr-0.5 focus:outline-none focus:ring-0 appearance-none"
        >
          <option value="">+__</option>
          {COUNTRIES.map((c) => (
            <option key={c.name + c.dial} value={c.dial} title={c.name}>
              {c.dial}
            </option>
          ))}
        </select>
        <input
          className={inputCls + " font-mono pl-[76px]"}
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={placeholder || "5xx xxx xx xx"}
        />
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  Add / Edit Dog Modal                                               */
/* ------------------------------------------------------------------ */

function AddDogModal({ onClose, onSave, existingDog }) {
  const { t } = useI18n();
  const isEdit = !!existingDog;
  const [form, setForm] = useState(
    existingDog
      ? {
          ...existingDog,
          customColor: !COLORS.includes(existingDog.color) ? existingDog.color : "",
          color: COLORS.includes(existingDog.color) ? existingDog.color : "Diğer",
        }
      : {
          name: "",
          breed: BREEDS[0],
          birthDate: "",
          gender: "Erkek",
          color: COLORS[0],
          customColor: "",
          birthCountry: "",
          birthCity: "",
          livingCountry: "",
          livingCity: "",
          microchip: "",
          passportNumber: "",
          ownerName: "",
          ownerEmail: "",
          ownerPhoneCode: "",
          ownerPhoneNumber: "",
          ownerAddress: "",
          emergencyName: "",
          emergencyPhoneCode: "",
          emergencyPhoneNumber: "",
          photo: null,
        }
  );
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 480, 0.82);
      setForm((f) => ({ ...f, photo: dataUrl }));
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  const submit = () => {
    if (!form.name.trim()) return;
    const finalColor = form.color === "Diğer" ? form.customColor || "Diğer" : form.color;
    const { customColor, ...rest } = form;
    onSave({
      ...rest,
      id: existingDog?.id || uid(),
      color: finalColor,
      passportNumber: form.passportNumber || `TR-PW-${Math.floor(100000 + Math.random() * 900000)}`,
      vaccines: existingDog?.vaccines || [],
      vets: existingDog?.vets || [],
      createdAt: existingDog?.createdAt || todayISO(),
    });
  };

  return (
    <Modal title={isEdit ? t.editDogModalTitle : t.addDogModalTitle} onClose={onClose} wide>
      <div className="grid sm:grid-cols-[136px_1fr] gap-5">
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-32 w-32 rounded-full border-2 border-dashed border-[#c7bb95] bg-[#efe8d1] grid place-items-center overflow-hidden cursor-pointer relative"
            onClick={() => fileRef.current?.click()}
          >
            {busy ? (
              <Loader2 size={22} className="animate-spin text-[#5b6d63]" />
            ) : form.photo ? (
              <img src={form.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera size={26} className="text-[#8d8560]" />
            )}
          </div>
          <button onClick={() => fileRef.current?.click()} className="text-[12px] text-[#5b6d63] underline underline-offset-2">
            {form.photo ? t.changePhoto : t.uploadPhoto}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label={t.fieldDogName}>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Zeytin" />
          </Field>
          <Field label={t.fieldBreed}>
            <select className={inputCls} value={form.breed} onChange={set("breed")}>
              {BREEDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label={t.fieldBirthDate}>
            <input type="date" className={inputCls} value={form.birthDate} onChange={set("birthDate")} />
          </Field>
          <Field label={t.fieldGender}>
            <select className={inputCls} value={form.gender} onChange={set("gender")}>
              <option value="Erkek">{t.male}</option>
              <option value="Dişi">{t.female}</option>
            </select>
          </Field>
          <Field label={t.fieldColor}>
            <select className={inputCls} value={form.color} onChange={set("color")}>
              {COLORS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          {form.color === "Diğer" && (
            <Field label={t.fieldCustomColor}>
              <input className={inputCls} value={form.customColor} onChange={set("customColor")} />
            </Field>
          )}

          <Field label={t.fieldMicrochip}>
            <input className={monoInputCls} value={form.microchip} onChange={set("microchip")} placeholder="15 haneli numara" />
          </Field>

          <CountryCityPicker
            t={t}
            countryLabel={t.fieldBirthCountry}
            cityLabel={t.fieldBirthCity}
            country={form.birthCountry}
            city={form.birthCity}
            onCountryChange={setVal("birthCountry")}
            onCityChange={setVal("birthCity")}
          />
          <CountryCityPicker
            t={t}
            countryLabel={t.fieldLivingCountry}
            cityLabel={t.fieldLivingCity}
            country={form.livingCountry}
            city={form.livingCity}
            onCountryChange={setVal("livingCountry")}
            onCityChange={setVal("livingCity")}
          />
        </div>
      </div>

      <div className="h-px bg-[#e3d9bd] my-5" />

      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label={t.fieldOwnerName}>
          <input className={inputCls} value={form.ownerName} onChange={set("ownerName")} />
        </Field>
        <Field label={t.fieldOwnerEmail}>
          <input type="email" className={inputCls} value={form.ownerEmail} onChange={set("ownerEmail")} placeholder="ornek@eposta.com" />
        </Field>
        <PhoneField
          label={t.fieldOwnerPhone}
          code={form.ownerPhoneCode}
          number={form.ownerPhoneNumber}
          onCodeChange={setVal("ownerPhoneCode")}
          onNumberChange={setVal("ownerPhoneNumber")}
        />
        <div className="sm:col-span-2">
          <Field label={t.fieldOwnerAddress}>
            <input className={inputCls} value={form.ownerAddress} onChange={set("ownerAddress")} />
          </Field>
        </div>
        <Field label={t.fieldEmergencyName}>
          <input className={inputCls} value={form.emergencyName} onChange={set("emergencyName")} />
        </Field>
        <PhoneField
          label={t.fieldEmergencyPhone}
          code={form.emergencyPhoneCode}
          number={form.emergencyPhoneNumber}
          onCodeChange={setVal("emergencyPhoneCode")}
          onNumberChange={setVal("emergencyPhoneNumber")}
        />
        <Field label={t.fieldPassportNumber}>
          <input className={monoInputCls} value={form.passportNumber} onChange={set("passportNumber")} placeholder="TR-PW-000000" />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          {isEdit ? t.saveChanges : t.createPassport}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Passport tab                                                       */
/* ------------------------------------------------------------------ */

function StampSeal({ qrUrl }) {
  return (
    <div className="relative shrink-0" style={{ width: 168, height: 168 }}>
      <svg viewBox="0 0 168 168" width={168} height={168} className="absolute inset-0">
        <defs>
          <path id="sealCircle" d="M 84,20 A 64,64 0 1 1 83.9,20" fill="none" />
        </defs>
        <circle cx="84" cy="84" r="80" fill="none" stroke="#C9A227" strokeWidth="2" strokeDasharray="1 4.2" strokeLinecap="round" />
        <circle cx="84" cy="84" r="72" fill="none" stroke="#C9A227" strokeWidth="1.4" />
        <text fill="#8a6d16" fontSize="10.3" fontWeight="700" letterSpacing="2.6" fontFamily="'Zilla Slab', serif">
          <textPath href="#sealCircle" startOffset="2%">
            PAW WALLET · DOĞRULANMIŞ KİMLİK ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22px] rounded-full bg-white p-1.5 shadow-inner border border-[#C9A227]/40">
        <img src={qrUrl} alt="QR" className="h-full w-full rounded-full object-cover" />
      </div>
    </div>
  );
}

function PassportTab({ dog, onEdit, onDelete }) {
  const { t, lang } = useI18n();
  const ownerPhone = fmtPhone(dog.ownerPhoneCode, dog.ownerPhoneNumber);
  const emergencyPhone = fmtPhone(dog.emergencyPhoneCode, dog.emergencyPhoneNumber);
  const birthPlace = [dog.birthCity, dog.birthCountry].filter(Boolean).join(", ");
  const livingPlace = [dog.livingCity, dog.livingCountry].filter(Boolean).join(", ");

  const qrPayload = JSON.stringify({
    name: dog.name,
    breed: dog.breed,
    chip: dog.microchip,
    passport: dog.passportNumber,
    owner: dog.ownerName,
    phone: ownerPhone,
    emergency: emergencyPhone,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=${encodeURIComponent(qrPayload)}`;

  const Row = ({ label, value, mono }) => (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-dotted border-[#d8cfb4]">
      <span className="text-[11px] uppercase tracking-[0.1em] text-[#5b6d63] font-semibold shrink-0">{label}</span>
      <span className={`text-right text-[14px] text-[#1f2a24] ${mono ? "font-mono" : "font-body"}`}>{value || "—"}</span>
    </div>
  );

  const locale = LANGS.find((l) => l.code === lang)?.locale;

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div
        className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 sm:p-8 relative overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(27,58,47,0.05) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[#1B3A2F]">
            <ShieldCheck size={18} />
            <span className="font-display text-[13px] tracking-[0.18em] uppercase">{t.passportHeader}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="text-[12px] font-medium text-[#5b6d63] hover:text-[#1B3A2F] underline underline-offset-2">
              {t.editBtn}
            </button>
            <button onClick={onDelete} className="text-[12px] font-medium text-[#a63d40] hover:text-[#7d2c2e] underline underline-offset-2">
              {t.deleteBtn}
            </button>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap sm:flex-nowrap">
          <div className="shrink-0">
            <div className="h-40 w-32 rounded-lg overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint size={36} className="text-[#a89c6e]" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="font-display text-[30px] leading-tight text-[#1B3A2F]">{dog.name}</h2>
            <p className="text-[13.5px] text-[#5b6d63] mb-3">{dog.breed}</p>
            <div>
              <Row label={t.rowBirthDate} value={fmtDate(dog.birthDate, locale)} />
              <Row label={t.rowGender} value={dog.gender === "Dişi" ? t.female : t.male} />
              <Row label={t.rowColor} value={dog.color} />
              <Row label={t.rowBirthPlace} value={birthPlace} />
              <Row label={t.rowLivingPlace} value={livingPlace} />
              <Row label={t.rowMicrochip} value={dog.microchip} mono />
              <Row label={t.rowPassportNo} value={dog.passportNumber} mono />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#C9A227]/30 my-5" />

        <div className="grid sm:grid-cols-2 gap-x-8">
          <div>
            <Row label={t.rowOwner} value={dog.ownerName} />
            <Row label={t.rowEmail} value={dog.ownerEmail} />
            <Row label={t.rowPhone} value={ownerPhone} mono />
            <Row label={t.rowAddress} value={dog.ownerAddress} />
          </div>
          <div>
            <Row label={t.rowEmergency} value={dog.emergencyName} />
            <Row label={t.rowEmergencyPhone} value={emergencyPhone} mono />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 flex flex-col items-center text-center gap-4">
        <StampSeal qrUrl={qrUrl} />
        <div>
          <p className="font-display text-[15px] text-[#1B3A2F]">{t.scannableIdTitle}</p>
          <p className="text-[12.5px] text-[#5b6d63] leading-snug mt-1">{t.scannableIdDesc(dog.name)}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#8a6d16] bg-[#f3e9c8] rounded-full px-3 py-1">
          <ScanLine size={13} /> {t.scanToReach}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vaccination tab                                                     */
/* ------------------------------------------------------------------ */

function AddVaccineModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: COMMON_VACCINES[0],
    customName: "",
    date: todayISO(),
    nextDate: "",
    vetMode: "platform",
    vetId: PLATFORM_VETS[0].id,
    vetManual: "",
    batch: "",
    file: null,
    fileName: "",
  });
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const dataUrl = await resizeImageFile(file, 700, 0.8);
      setForm((f) => ({ ...f, file: dataUrl, fileName: file.name }));
    } else {
      setForm((f) => ({ ...f, file: null, fileName: file.name }));
    }
  };

  const submit = () => {
    const finalName = form.name === "Diğer" ? form.customName || "Diğer" : form.name;
    if (!finalName || !form.date) return;
    const vetLabel = form.vetMode === "platform" ? PLATFORM_VETS.find((v) => v.id === form.vetId)?.name : form.vetManual;
    onSave({
      id: uid(),
      name: finalName,
      date: form.date,
      nextDate: form.nextDate,
      vet: vetLabel,
      batch: form.batch,
      file: form.file,
      fileName: form.fileName,
    });
  };

  return (
    <Modal title={t.addVaccineModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <Field label={t.fieldVaccineName}>
          <select className={inputCls} value={form.name} onChange={set("name")}>
            {COMMON_VACCINES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        {form.name === "Diğer" && (
          <Field label={t.fieldCustomVaccineName}>
            <input className={inputCls} value={form.customName} onChange={set("customName")} />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t.fieldDateGiven}>
            <input type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label={t.fieldNextDose}>
            <input type="date" className={inputCls} value={form.nextDate} onChange={set("nextDate")} />
          </Field>
        </div>

        <Field label={t.fieldVetLabel}>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "platform" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "platform" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              {t.chooseFromPlatform}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "manual" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "manual" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              {t.enterManually}
            </button>
          </div>
          {form.vetMode === "platform" ? (
            <select className={inputCls} value={form.vetId} onChange={set("vetId")}>
              {PLATFORM_VETS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.clinic}
                </option>
              ))}
            </select>
          ) : (
            <input className={inputCls} value={form.vetManual} onChange={set("vetManual")} placeholder={t.fieldVetManualName} />
          )}
        </Field>

        <Field label={t.fieldBatchNumber}>
          <input className={monoInputCls} value={form.batch} onChange={set("batch")} placeholder="LOT-2026-118" />
        </Field>

        <Field label={t.fieldCertificate}>
          <div
            className="flex items-center gap-3 rounded-md border border-dashed border-[#c7bb95] bg-[#efe8d1] px-3 py-2.5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} className="text-[#5b6d63]" />
            <span className="text-[13px] text-[#5b6d63] truncate">{form.fileName || t.chooseFileText}</span>
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          {t.saveBtn}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function VaccineCard({ v, onDelete }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const d = daysUntil(v.nextDate);
  let status = null;
  if (v.nextDate) {
    if (d < 0) status = { label: t.statusOverdue, cls: "bg-[#a63d40] text-white" };
    else if (d <= 30) status = { label: t.statusSoon, cls: "bg-[#C9A227] text-white" };
    else status = { label: t.statusCurrent, cls: "bg-[#1B3A2F] text-[#F7F3E8]" };
  }
  return (
    <div className="relative rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F0EBD8] border border-[#d8cfb4]" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F0EBD8] border border-[#d8cfb4]" />
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5">
          <Syringe size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{v.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>}
          <button onClick={() => onDelete(v.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-5 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.labelApplication}</p>
          <p className="text-[#1f2a24]">{fmtDate(v.date, locale)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.labelNextDose}</p>
          <p className="text-[#1f2a24]">{fmtDate(v.nextDate, locale)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.labelVet}</p>
          <p className="text-[#1f2a24]">{v.vet || "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.labelBatch}</p>
          <p className="text-[#1f2a24] font-mono">{v.batch || "—"}</p>
        </div>
      </div>
      {v.file && (
        <div className="px-5 pb-4">
          <img src={v.file} alt="" className="h-20 rounded-md border border-[#d8cfb4] object-cover" />
        </div>
      )}
    </div>
  );
}

function VaccineTab({ dog, onAdd, onDelete }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const sorted = [...dog.vaccines].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.vaccineTabTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.vaccineTabSubtitle(dog.name, dog.vaccines.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          {t.addVaccineBtn}
        </PrimaryButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Syringe} text={t.vaccineEmptyText} />
      ) : (
        <div className="space-y-3">
          {sorted.map((v) => (
            <VaccineCard key={v.id} v={v} onDelete={onDelete} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddVaccineModal
          onClose={() => setShowAdd(false)}
          onSave={(v) => {
            onAdd(v);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vet assignment tab                                                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Health records tab                                                  */
/* ------------------------------------------------------------------ */

function HealthProfileCard({ dog, onSave }) {
  const { t } = useI18n();
  const [chronic, setChronic] = useState(dog.chronicConditions || "");
  const [allergies, setAllergies] = useState(dog.allergies || "");
  const [dirty, setDirty] = useState(false);

  return (
    <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5 mb-5">
      <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.healthProfileTitle}</p>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label={t.fieldChronicConditions}>
          <input
            className={inputCls}
            value={chronic}
            onChange={(e) => {
              setChronic(e.target.value);
              setDirty(true);
            }}
          />
        </Field>
        <Field label={t.fieldAllergies}>
          <input
            className={inputCls}
            value={allergies}
            onChange={(e) => {
              setAllergies(e.target.value);
              setDirty(true);
            }}
          />
        </Field>
      </div>
      {dirty && (
        <div className="mt-3 flex justify-end">
          <PrimaryButton
            icon={Check}
            onClick={() => {
              onSave({ chronicConditions: chronic, allergies });
              setDirty(false);
            }}
          >
            {t.saveProfileBtn}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

function AddHealthRecordModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    date: todayISO(),
    diagnosis: "",
    examNotes: "",
    treatment: "",
    prescription: "",
    labResults: "",
    isSurgery: false,
    surgeryNotes: "",
    vet: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.date) return;
    onSave({ id: uid(), ...form });
  };

  return (
    <Modal title={t.addHealthRecordModalTitle} onClose={onClose} wide>
      <div className="space-y-3.5">
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label={t.fieldRecordDate}>
            <input type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label={t.fieldApptVet}>
            <input className={inputCls} value={form.vet} onChange={set("vet")} />
          </Field>
        </div>
        <Field label={t.fieldDiagnosis}>
          <input className={inputCls} value={form.diagnosis} onChange={set("diagnosis")} />
        </Field>
        <Field label={t.fieldExamNotes}>
          <textarea className={inputCls} rows={3} value={form.examNotes} onChange={set("examNotes")} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label={t.fieldTreatment}>
            <textarea className={inputCls} rows={2} value={form.treatment} onChange={set("treatment")} />
          </Field>
          <Field label={t.fieldPrescription}>
            <textarea className={inputCls} rows={2} value={form.prescription} onChange={set("prescription")} />
          </Field>
        </div>
        <Field label={t.fieldLabResults}>
          <textarea className={inputCls} rows={2} value={form.labResults} onChange={set("labResults")} />
        </Field>
        <label className="flex items-center gap-2 text-[13px] text-[#3c473f] cursor-pointer">
          <input
            type="checkbox"
            checked={form.isSurgery}
            onChange={(e) => setForm((f) => ({ ...f, isSurgery: e.target.checked }))}
            className="h-4 w-4 accent-[#1B3A2F]"
          />
          {t.fieldSurgery}
        </label>
        {form.isSurgery && (
          <Field label={t.fieldSurgeryNotes}>
            <textarea className={inputCls} rows={2} value={form.surgeryNotes} onChange={set("surgeryNotes")} />
          </Field>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          {t.saveBtn}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function HealthRecordCard({ record, onDelete }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5">
          <ClipboardList size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{record.diagnosis || fmtDate(record.date, locale)}</span>
          {record.isSurgery && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-full bg-[#a63d40] text-white">
              {t.fieldSurgery.split(" ")[0]}
            </span>
          )}
        </div>
        <button onClick={() => onDelete(record.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="px-5 py-3.5 space-y-2 text-[13px]">
        <p className="text-[#5b6d63]">
          <span className="font-semibold text-[#8d8560] uppercase text-[10.5px] tracking-wider mr-2">{t.fieldRecordDate}</span>
          {fmtDate(record.date, locale)} {record.vet && `· ${record.vet}`}
        </p>
        {record.examNotes && <p className="text-[#1f2a24]">{record.examNotes}</p>}
        {record.treatment && (
          <p className="text-[#1f2a24]">
            <span className="font-semibold text-[#8d8560] uppercase text-[10.5px] tracking-wider mr-2">{t.fieldTreatment}</span>
            {record.treatment}
          </p>
        )}
        {record.prescription && (
          <p className="text-[#1f2a24]">
            <span className="font-semibold text-[#8d8560] uppercase text-[10.5px] tracking-wider mr-2">{t.fieldPrescription}</span>
            {record.prescription}
          </p>
        )}
        {record.labResults && (
          <p className="text-[#1f2a24]">
            <span className="font-semibold text-[#8d8560] uppercase text-[10.5px] tracking-wider mr-2">{t.fieldLabResults}</span>
            {record.labResults}
          </p>
        )}
        {record.isSurgery && record.surgeryNotes && (
          <p className="text-[#1f2a24]">
            <span className="font-semibold text-[#8d8560] uppercase text-[10.5px] tracking-wider mr-2">{t.fieldSurgeryNotes}</span>
            {record.surgeryNotes}
          </p>
        )}
      </div>
    </div>
  );
}

function HealthTab({ dog, onSaveProfile, onAddRecord, onDeleteRecord }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const records = [...(dog.healthRecords || [])].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <HealthProfileCard dog={dog} onSave={onSaveProfile} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.healthRecordsTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.healthRecordsSubtitle(dog.name, records.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          {t.addHealthRecordBtn}
        </PrimaryButton>
      </div>

      {records.length === 0 ? (
        <EmptyState icon={ClipboardList} text={t.healthRecordsEmpty} />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <HealthRecordCard key={r.id} record={r} onDelete={onDeleteRecord} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddHealthRecordModal
          onClose={() => setShowAdd(false)}
          onSave={(r) => {
            onAddRecord(r);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Medication tab                                                      */
/* ------------------------------------------------------------------ */

function AddMedicationModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    dose: "",
    startDate: todayISO(),
    endDate: "",
    dailyReminder: false,
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.name.trim() || !form.startDate) return;
    onSave({ id: uid(), ...form });
  };

  return (
    <Modal title={t.addMedicationModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <Field label={t.fieldMedName}>
          <input className={inputCls} value={form.name} onChange={set("name")} />
        </Field>
        <Field label={t.fieldDose}>
          <input className={inputCls} value={form.dose} onChange={set("dose")} placeholder="1 tablet, günde 2 kez" />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t.fieldStartDate}>
            <input type="date" className={inputCls} value={form.startDate} onChange={set("startDate")} />
          </Field>
          <Field label={t.fieldEndDate}>
            <input type="date" className={inputCls} value={form.endDate} onChange={set("endDate")} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#3c473f] cursor-pointer">
          <input
            type="checkbox"
            checked={form.dailyReminder}
            onChange={(e) => setForm((f) => ({ ...f, dailyReminder: e.target.checked }))}
            className="h-4 w-4 accent-[#1B3A2F]"
          />
          {t.fieldDailyReminder}
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          {t.saveBtn}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function MedicationCard({ med, onDelete }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const today = todayISO();
  let status;
  if (med.startDate > today) status = { label: t.medStatusUpcoming, cls: "bg-[#C9A227] text-white" };
  else if (med.endDate && med.endDate < today) status = { label: t.medStatusFinished, cls: "bg-[#8d8560] text-white" };
  else status = { label: t.medStatusActive, cls: "bg-[#1B3A2F] text-[#F7F3E8]" };

  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5">
          <Pill size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{med.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
          <button onClick={() => onDelete(med.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-5 py-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldDose}</p>
          <p className="text-[#1f2a24]">{med.dose || "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldStartDate}</p>
          <p className="text-[#1f2a24]">{fmtDate(med.startDate, locale)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldEndDate}</p>
          <p className="text-[#1f2a24]">{fmtDate(med.endDate, locale)}</p>
        </div>
      </div>
    </div>
  );
}

function MedicationTab({ dog, onAdd, onDelete }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const meds = [...(dog.medications || [])].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.medicationsTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.medicationsSubtitle(dog.name, meds.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          {t.addMedicationBtn}
        </PrimaryButton>
      </div>

      {meds.length === 0 ? (
        <EmptyState icon={Pill} text={t.medicationsEmpty} />
      ) : (
        <div className="space-y-3">
          {meds.map((m) => (
            <MedicationCard key={m.id} med={m} onDelete={onDelete} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddMedicationModal
          onClose={() => setShowAdd(false)}
          onSave={(m) => {
            onAdd(m);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointments tab                                                    */
/* ------------------------------------------------------------------ */

function AddAppointmentModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    date: "",
    time: "",
    type: "Muayene",
    vetMode: "platform",
    vetId: PLATFORM_VETS[0].id,
    vetManual: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.date) return;
    const vetLabel = form.vetMode === "platform" ? PLATFORM_VETS.find((v) => v.id === form.vetId)?.name : form.vetManual;
    onSave({ id: uid(), date: form.date, time: form.time, type: form.type, vet: vetLabel });
  };

  return (
    <Modal title={t.addAppointmentModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t.fieldApptDate}>
            <input type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label={t.fieldApptTime}>
            <input type="time" className={inputCls} value={form.time} onChange={set("time")} />
          </Field>
        </div>
        <Field label={t.fieldApptType}>
          <select className={inputCls} value={form.type} onChange={set("type")}>
            <option value="Muayene">{t.apptTypeExam}</option>
            <option value="Aşı">{t.apptTypeVaccine}</option>
            <option value="Kontrol">{t.apptTypeCheckup}</option>
          </select>
        </Field>
        <Field label={t.fieldApptVet}>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "platform" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "platform" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              {t.chooseFromPlatform}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "manual" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "manual" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              {t.enterManually}
            </button>
          </div>
          {form.vetMode === "platform" ? (
            <select className={inputCls} value={form.vetId} onChange={set("vetId")}>
              {PLATFORM_VETS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.clinic}
                </option>
              ))}
            </select>
          ) : (
            <input className={inputCls} value={form.vetManual} onChange={set("vetManual")} placeholder={t.fieldVetManualName} />
          )}
        </Field>
        <p className="text-[11.5px] text-[#8a6d16] bg-[#f3e9c8] rounded-md px-3 py-2 flex items-start gap-1.5">
          <CalendarClock size={14} className="shrink-0 mt-0.5" /> {t.apptReminderNote}
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          {t.saveBtn}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function AppointmentCard({ appt, onDelete }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const d = daysUntil(appt.date);
  const isPast = d < 0;
  const typeLabel = appt.type === "Aşı" ? t.apptTypeVaccine : appt.type === "Kontrol" ? t.apptTypeCheckup : t.apptTypeExam;

  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5">
          <CalendarClock size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{typeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${
              isPast ? "bg-[#8d8560] text-white" : "bg-[#1B3A2F] text-[#F7F3E8]"
            }`}
          >
            {isPast ? t.apptStatusPast : t.apptStatusUpcoming}
          </span>
          <button onClick={() => onDelete(appt.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-5 py-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldApptDate}</p>
          <p className="text-[#1f2a24]">{fmtDate(appt.date, locale)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldApptTime}</p>
          <p className="text-[#1f2a24] font-mono">{appt.time || "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldApptVet}</p>
          <p className="text-[#1f2a24]">{appt.vet || "—"}</p>
        </div>
      </div>
    </div>
  );
}

function AppointmentTab({ dog, onAdd, onDelete }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const appts = [...(dog.appointments || [])].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.appointmentsTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.appointmentsSubtitle(dog.name, appts.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          {t.addAppointmentBtn}
        </PrimaryButton>
      </div>

      {appts.length === 0 ? (
        <EmptyState icon={CalendarClock} text={t.appointmentsEmpty} />
      ) : (
        <div className="space-y-3">
          {appts.map((a) => (
            <AppointmentCard key={a.id} appt={a} onDelete={onDelete} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddAppointmentModal
          onClose={() => setShowAdd(false)}
          onSave={(a) => {
            onAdd(a);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function VetTab({ dog, onAssign, onRemove }) {
  const { t } = useI18n();
  const assignedIds = dog.vets.map((v) => v.vetId);
  const primary = dog.vets.find((v) => v.role === "Birincil");

  return (
    <div>
      <div className="mb-5">
        <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.vetTabTitle}</h3>
        <p className="text-[13px] text-[#5b6d63]">{t.vetTabSubtitle(dog.name)}</p>
      </div>

      {dog.vets.length > 0 && (
        <div className="mb-5 space-y-2">
          {dog.vets.map((assignment) => {
            const vet = PLATFORM_VETS.find((v) => v.id === assignment.vetId);
            if (!vet) return null;
            return (
              <div key={assignment.vetId} className="flex items-center justify-between rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1B3A2F] text-[#F7F3E8] grid place-items-center font-display text-[15px]">
                    {vet.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1B3A2F]">{vet.name}</p>
                    <p className="text-[12px] text-[#5b6d63]">{vet.clinic} · {vet.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10.5px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                      assignment.role === "Birincil" ? "bg-[#1B3A2F] text-[#F7F3E8]" : "bg-[#C9A227] text-white"
                    }`}
                  >
                    {assignment.role.toUpperCase()}
                  </span>
                  <button onClick={() => onRemove(assignment.vetId)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#5b6d63] mb-2.5">{t.platformVetsLabel}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {PLATFORM_VETS.map((vet) => {
          const isAssigned = assignedIds.includes(vet.id);
          return (
            <div key={vet.id} className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-semibold text-[#1B3A2F]">{vet.name}</p>
                  <p className="text-[12px] text-[#5b6d63]">{vet.clinic}</p>
                  <p className="text-[11.5px] text-[#8d8560] flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {vet.city}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[12px] text-[#8a6d16] font-semibold shrink-0">
                  <Star size={12} className="fill-[#C9A227] text-[#C9A227]" /> {vet.rating}
                </span>
              </div>
              <p className="text-[12px] text-[#5b6d63] flex items-center gap-1">
                <Stethoscope size={12} /> {vet.specialty}
              </p>
              <p className="text-[12px] text-[#5b6d63] flex items-center gap-1 font-mono">
                <Phone size={12} /> {vet.phone}
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  disabled={isAssigned && primary?.vetId === vet.id}
                  onClick={() => onAssign(vet.id, "Birincil")}
                  className="flex-1 rounded-md border border-[#1B3A2F] text-[#1B3A2F] text-[12px] font-semibold py-1.5 hover:bg-[#1B3A2F] hover:text-[#F7F3E8] transition disabled:opacity-40"
                >
                  {t.makePrimaryBtn}
                </button>
                <button
                  disabled={isAssigned && dog.vets.find((v) => v.vetId === vet.id)?.role === "İkincil"}
                  onClick={() => onAssign(vet.id, "İkincil")}
                  className="flex-1 rounded-md border border-[#C9A227] text-[#8a6d16] text-[12px] font-semibold py-1.5 hover:bg-[#C9A227] hover:text-white transition disabled:opacity-40"
                >
                  {t.makeSecondaryBtn}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#c7bb95] bg-[#FBF8EE]/60 py-14 flex flex-col items-center gap-3 text-center px-6">
      <div className="h-12 w-12 rounded-full bg-[#eee6cd] grid place-items-center">
        <Icon size={22} className="text-[#8d8560]" />
      </div>
      <p className="text-[13.5px] text-[#5b6d63] max-w-sm">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing page & authentication                                      */
/* ------------------------------------------------------------------ */

function AuthModal({ mode, onClose, onSwitchMode }) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  const submit = async () => {
    setError("");
    if (mode === "signup") {
      if (password.length < 6) {
        setError(t.passwordTooShort);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordsDontMatch);
        return;
      }
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: window.location.origin,
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message || t.authError);
        return;
      }
      setSentTo(email);
    } else {
      setLoading(true);
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (loginError) {
        setError(t.loginUserNotFound);
        return;
      }
      onClose();
    }
  };

  if (sentTo) {
    return (
      <Modal title={t.checkInboxTitle} onClose={onClose}>
        <p className="text-[14px] text-[#3c473f] leading-relaxed">{t.checkInboxDesc(sentTo)}</p>
        <div className="mt-6 flex justify-end">
          <GhostButton onClick={onClose}>{t.backToForm}</GhostButton>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={mode === "signup" ? t.authSignupTitle : t.authLoginTitle} onClose={onClose}>
      <div className="space-y-3.5">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3.5">
            <Field label={t.fieldFirstName}>
              <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label={t.fieldLastName}>
              <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>
        )}
        <Field label={t.fieldEmail}>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t.fieldPassword}>
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {mode === "signup" && (
          <Field label={t.fieldConfirmPassword}>
            <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Field>
        )}

        {error && <p className="text-[13px] text-[#a63d40]">{error}</p>}

        <PrimaryButton onClick={submit} full icon={loading ? Loader2 : Check}>
          {mode === "signup" ? t.createAccountBtn : t.logInBtn}
        </PrimaryButton>

        <button
          onClick={() => onSwitchMode(mode === "signup" ? "login" : "signup")}
          className="w-full text-center text-[12.5px] text-[#5b6d63] hover:text-[#1B3A2F] underline underline-offset-2 mt-1"
        >
          {mode === "signup" ? t.authSwitchToLogin : t.authSwitchToSignup}
        </button>
      </div>
    </Modal>
  );
}

function LandingPage() {
  const { t } = useI18n();
  const [authMode, setAuthMode] = useState(null); // null | "signup" | "login"

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body flex flex-col" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
            <PawPrint size={19} className="text-[#F7F3E8]" />
          </div>
          <h1 className="font-display text-[22px] text-[#1B3A2F] leading-none">Paw Wallet</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <GhostButton onClick={() => setAuthMode("login")}>{t.signIn}</GhostButton>
          <PrimaryButton onClick={() => setAuthMode("signup")}>{t.signUp}</PrimaryButton>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto px-6 flex flex-col items-center text-center justify-center py-16 gap-6">
        <div className="h-16 w-16 rounded-full bg-[#1B3A2F] grid place-items-center mb-2">
          <PawPrint size={30} className="text-[#F7F3E8]" />
        </div>
        <h2 className="font-display text-[32px] sm:text-[42px] leading-tight text-[#1B3A2F]">{t.landingHeadline}</h2>
        <p className="text-[15px] sm:text-[16px] text-[#5b6d63] max-w-xl">{t.landingSub}</p>
        <div className="flex items-center gap-3 mt-2">
          <PrimaryButton onClick={() => setAuthMode("signup")} icon={Plus}>
            {t.signUp}
          </PrimaryButton>
          <GhostButton onClick={() => setAuthMode("login")}>{t.signIn}</GhostButton>
        </div>
      </div>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={setAuthMode} />}
    </div>
  );
}

function AuthGate() {
  const { t } = useI18n();
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen w-full bg-[#EFE9D6] grid place-items-center text-[#5b6d63] gap-3 flex-col flex font-body">
        <Loader2 className="animate-spin" size={22} />
        <span className="text-[13px]">{t.verifyingSession}</span>
      </div>
    );
  }

  if (!session) return <LandingPage />;

  return <PawWalletInner key={session.user.id} session={session} />;
}

/* ------------------------------------------------------------------ */
/*  Main App                                                            */
/* ------------------------------------------------------------------ */

const TAB_IDS = [
  { id: "passport", key: "navPassport", icon: PawPrint },
  { id: "vaccines", key: "navVaccines", icon: Syringe },
  { id: "health", key: "navHealth", icon: ClipboardList },
  { id: "medications", key: "navMedications", icon: Pill },
  { id: "appointments", key: "navAppointments", icon: CalendarClock },
  { id: "vets", key: "navVets", icon: Stethoscope },
];

function PawWalletInner({ session }) {
  const { t } = useI18n();
  const [dogs, setDogs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("passport");
  const [showAddDog, setShowAddDog] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dogMenuOpen, setDogMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const userId = session.user.id;
  const displayName = session.user.user_metadata?.first_name || session.user.email;

  // load — only this user's dogs
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("id, payload")
        .eq("user_id", userId)
        .order("created_at");
      if (!error && data) setDogs(data.map((row) => row.payload));
      const savedActive = localStorage.getItem("paw-wallet-active");
      if (savedActive) setActiveId(savedActive);
      setLoaded(true);
    })();
  }, [userId]);

  const persistDogs = useCallback(
    async (next) => {
      setDogs(next);
      for (const dog of next) {
        await supabase.from("dogs").upsert({ id: dog.id, payload: dog, user_id: userId });
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!loaded) return;
    if (activeId) {
      localStorage.setItem("paw-wallet-active", activeId);
    }
  }, [activeId, loaded]);

  useEffect(() => {
    if (loaded && dogs.length && !activeId) setActiveId(dogs[0].id);
  }, [loaded, dogs, activeId]);

  const activeDog = dogs.find((d) => d.id === activeId) || null;

  const updateDog = (id, updater) => {
    persistDogs(dogs.map((d) => (d.id === id ? updater(d) : d)));
  };

  const addDog = (dog) => {
    const isEdit = dogs.some((d) => d.id === dog.id);
    const next = isEdit ? dogs.map((d) => (d.id === dog.id ? dog : d)) : [...dogs, dog];
    persistDogs(next);
    setActiveId(dog.id);
    setShowAddDog(false);
    setEditingDog(null);
  };

  const deleteDog = async (id) => {
    const next = dogs.filter((d) => d.id !== id);
    setDogs(next);
    try {
      await supabase.from("dogs").delete().eq("id", id).eq("user_id", userId);
    } catch {
      /* ignore */
    }
    if (activeId === id) setActiveId(next[0]?.id || null);
  };

  const addVaccine = (v) => updateDog(activeDog.id, (d) => ({ ...d, vaccines: [...d.vaccines, v] }));
  const deleteVaccine = (id) => updateDog(activeDog.id, (d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) }));

  const assignVet = (vetId, role) =>
    updateDog(activeDog.id, (d) => {
      let vets = d.vets.filter((v) => !(v.role === role) && v.vetId !== vetId);
      vets = [...vets, { vetId, role }];
      return { ...d, vets };
    });
  const removeVet = (vetId) => updateDog(activeDog.id, (d) => ({ ...d, vets: d.vets.filter((v) => v.vetId !== vetId) }));

  const saveHealthProfile = (profile) => updateDog(activeDog.id, (d) => ({ ...d, ...profile }));
  const addHealthRecord = (r) =>
    updateDog(activeDog.id, (d) => ({ ...d, healthRecords: [...(d.healthRecords || []), r] }));
  const deleteHealthRecord = (id) =>
    updateDog(activeDog.id, (d) => ({ ...d, healthRecords: (d.healthRecords || []).filter((r) => r.id !== id) }));

  const addMedication = (m) => updateDog(activeDog.id, (d) => ({ ...d, medications: [...(d.medications || []), m] }));
  const deleteMedication = (id) =>
    updateDog(activeDog.id, (d) => ({ ...d, medications: (d.medications || []).filter((m) => m.id !== id) }));

  const addAppointment = (a) => updateDog(activeDog.id, (d) => ({ ...d, appointments: [...(d.appointments || []), a] }));
  const deleteAppointment = (id) =>
    updateDog(activeDog.id, (d) => ({ ...d, appointments: (d.appointments || []).filter((a) => a.id !== id) }));

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
              <PawPrint size={19} className="text-[#F7F3E8]" />
            </div>
            <div>
              <h1 className="font-display text-[22px] text-[#1B3A2F] leading-none">Paw Wallet</h1>
              <p className="text-[11.5px] text-[#5b6d63] tracking-wide">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[12.5px] text-[#5b6d63]">{t.greeting(displayName)}</span>
            <LanguageSwitcher />
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-[12.5px] font-medium text-[#5b6d63] hover:text-[#a63d40] underline underline-offset-2 transition"
            >
              {t.logOut}
            </button>
            {dogs.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setDogMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-[#d8cfb4] bg-[#FBF8EE] pl-1.5 pr-3 py-1.5 hover:bg-[#f0e9cd] transition"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden bg-[#eee6cd] grid place-items-center">
                    {activeDog?.photo ? (
                      <img src={activeDog.photo} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <PawPrint size={13} className="text-[#a89c6e]" />
                    )}
                  </div>
                  <span className="text-[13.5px] font-medium text-[#1f2a24]">{activeDog?.name}</span>
                  <ChevronDown size={14} className="text-[#5b6d63]" />
                </button>
                {dogMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] shadow-lg overflow-hidden z-20">
                    {dogs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveId(d.id);
                          setDogMenuOpen(false);
                          setTab("passport");
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13.5px] hover:bg-[#f0e9cd] transition ${
                          d.id === activeId ? "bg-[#f0e9cd] font-semibold" : ""
                        }`}
                      >
                        <PawPrint size={13} className="text-[#8d8560]" /> {d.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowAddDog(true);
                        setDogMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13.5px] text-[#1B3A2F] font-semibold border-t border-[#e3d9bd] hover:bg-[#f0e9cd] transition"
                    >
                      <Plus size={13} /> {t.addDogMenuItem}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!loaded ? (
          <div className="py-24 grid place-items-center text-[#5b6d63]">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : !activeDog ? (
          <div className="rounded-2xl border border-dashed border-[#c7bb95] bg-[#FBF8EE]/70 py-20 flex flex-col items-center gap-4 text-center px-6">
            <div className="h-14 w-14 rounded-full bg-[#eee6cd] grid place-items-center">
              <PawPrint size={26} className="text-[#8d8560]" />
            </div>
            <div>
              <h2 className="font-display text-[20px] text-[#1B3A2F] mb-1">{t.noDogsTitle}</h2>
              <p className="text-[13.5px] text-[#5b6d63] max-w-sm">{t.noDogsText}</p>
            </div>
            <PrimaryButton icon={Plus} onClick={() => setShowAddDog(true)}>
              {t.addFirstDog}
            </PrimaryButton>
          </div>
        ) : (
          <>
            {/* tabs */}
            <div className="flex gap-1.5 mb-5 border-b border-[#d8cfb4]">
              {TAB_IDS.map((tabDef) => {
                const Icon = tabDef.icon;
                const isActive = tab === tabDef.id;
                return (
                  <button
                    key={tabDef.id}
                    onClick={() => setTab(tabDef.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold rounded-t-lg border border-b-0 transition ${
                      isActive ? "bg-[#FBF8EE] border-[#d8cfb4] text-[#1B3A2F] -mb-px" : "border-transparent text-[#8d8560] hover:text-[#5b6d63]"
                    }`}
                  >
                    <Icon size={15} /> {t[tabDef.key]}
                    {tabDef.id === "vaccines" && activeDog.vaccines.some((v) => v.nextDate && daysUntil(v.nextDate) < 0) && (
                      <AlertTriangle size={13} className="text-[#a63d40]" />
                    )}
                  </button>
                );
              })}
            </div>

            {tab === "passport" && (
              <PassportTab dog={activeDog} onEdit={() => setEditingDog(activeDog)} onDelete={() => setConfirmDeleteId(activeDog.id)} />
            )}
            {tab === "vaccines" && <VaccineTab dog={activeDog} onAdd={addVaccine} onDelete={deleteVaccine} />}
            {tab === "health" && (
              <HealthTab
                dog={activeDog}
                onSaveProfile={saveHealthProfile}
                onAddRecord={addHealthRecord}
                onDeleteRecord={deleteHealthRecord}
              />
            )}
            {tab === "medications" && <MedicationTab dog={activeDog} onAdd={addMedication} onDelete={deleteMedication} />}
            {tab === "appointments" && (
              <AppointmentTab dog={activeDog} onAdd={addAppointment} onDelete={deleteAppointment} />
            )}
            {tab === "vets" && <VetTab dog={activeDog} onAssign={assignVet} onRemove={removeVet} />}
          </>
        )}

        <p className="text-center text-[11px] text-[#8d8560] mt-10">{t.footerNote}</p>
      </div>

      {showAddDog && <AddDogModal onClose={() => setShowAddDog(false)} onSave={addDog} />}
      {editingDog && <AddDogModal existingDog={editingDog} onClose={() => setEditingDog(null)} onSave={addDog} />}
      {confirmDeleteId && (
        <Modal title={t.deleteDogModalTitle} onClose={() => setConfirmDeleteId(null)}>
          <p className="text-[14px] text-[#3c473f] leading-relaxed">
            {t.deleteDogWarning(dogs.find((d) => d.id === confirmDeleteId)?.name)}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <GhostButton onClick={() => setConfirmDeleteId(null)}>{t.cancel}</GhostButton>
            <button
              onClick={() => {
                deleteDog(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#a63d40] px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#8a3234] transition"
            >
              <Trash2 size={15} /> {t.confirmDeleteBtn}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function PawWallet() {
  const [lang, setLang] = useState(() => localStorage.getItem("paw-wallet-lang") || "tr");

  useEffect(() => {
    localStorage.setItem("paw-wallet-lang", lang);
  }, [lang]);

  const value = useMemo(() => ({ t: TRANSLATIONS[lang], lang, setLang }), [lang]);

  return (
    <I18nContext.Provider value={value}>
      <AuthGate />
    </I18nContext.Provider>
  );
}
