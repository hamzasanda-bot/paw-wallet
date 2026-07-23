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
  Scale,
  UserCog,
  UserPlus,
  Building2,
  ShieldAlert,
  Bell,
  BellRing,
  FileText,
  Award,
  Crown,
  Pencil,
  Search,
  LayoutGrid,
  NotebookText,
} from "lucide-react";
import { isPushSupported, getPushPermissionState, subscribeToPush } from "./pushClient";
import { logActivity } from "./activityLog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts";

/* ------------------------------------------------------------------ */
/*  Languages                                                          */
/* ------------------------------------------------------------------ */

const LANGS = [
  { code: "tr", label: "Türkçe", short: "TUR", flag: "🇹🇷", locale: "tr-TR" },
  { code: "en", label: "English", short: "ENG", flag: "🇬🇧", locale: "en-US" },
  { code: "fr", label: "Français", short: "FRA", flag: "🇫🇷", locale: "fr-FR" },
  { code: "de", label: "Deutsch", short: "DEU", flag: "🇩🇪", locale: "de-DE" },
  { code: "es", label: "Español", short: "ESP", flag: "🇪🇸", locale: "es-ES" },
];

const TRANSLATIONS = {
  tr: {
    speciesLabel: { dog: "Köpek", cat: "Kedi" },
    tagline: "Evcil hayvanınızın dijital pasaportu",
    navPassport: "Pasaport",
    navVaccines: "Aşı Kartı",
    navVets: "Sağlık & Bakım",
    addNewDogItem: "Yeni köpek ekle",
    addNewCatItem: "Yeni kedi ekle",
    noDogsTitle: "Henüz evcil hayvan eklenmedi",
    noDogsText: "Başlamak için evcil hayvanınızın pasaportunu oluşturun — kimlik bilgileri, QR kod ve daha fazlası otomatik hazırlanır.",
    addFirstDog: "İlk Köpeği Ekle",
    addFirstCat: "İlk Kediyi Ekle",
    footerNote: "Faz 1 önizlemesi — Pasaport, Aşı Kartı, Veteriner Ataması. Veriler Supabase'de saklanır.",
    addPetModalTitle: (species) => (species === "cat" ? "Yeni Kedi Ekle" : "Yeni Köpek Ekle"),
    editPetModalTitle: (species) => (species === "cat" ? "Kedi Bilgilerini Düzenle" : "Köpek Bilgilerini Düzenle"),
    uploadPhoto: "Fotoğraf yükle",
    changePhoto: "Fotoğrafı değiştir",
    fieldPetName: (species) => (species === "cat" ? "Kedi adı" : "Köpek adı"),
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
    fieldNeutered: "Kısırlaştırıldı mı?",
    rowNeutered: "Kısırlaştırma Durumu",
    neuteredYes: "Evet",
    neuteredNo: "Hayır",
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
    verifiedIdentityLabel: "DOĞRULANMIŞ KİMLİK",
    scannableIdDesc: (name) => `Bu kod taratıldığında ${name}'in kimlik ve iletişim bilgileri anında görüntülenir.`,
    scanToReach: "Kayıp durumunda tara & ulaş",
    lostPetCardBadge: (species) => (species === "cat" ? "Bu kediyi buldunuz mu?" : "Bu köpeği buldunuz mu?"),
    lostPetCardTitle: (name) => `${name}'in Kimlik Kartı`,
    lostPetCardDesc: (species) =>
      species === "cat"
        ? "Bu kedinin sahibi Paw Wallet kullanıyor. Aşağıdaki bilgilerle sahibine ulaşabilirsin."
        : "Bu köpeğin sahibi Paw Wallet kullanıyor. Aşağıdaki bilgilerle sahibine ulaşabilirsin.",
    callOwnerBtn: "Sahibini Ara",
    callEmergencyBtn: "Acil Kişiyi Ara",
    lostCardNotFound: (species) => (species === "cat" ? "Bu kediye ait bir kayıt bulunamadı." : "Bu köpeğe ait bir kayıt bulunamadı."),
    lostCardFooter: "Paw Wallet ile oluşturuldu",
    breedMixedOption: "Melez / Karışık",
    breedOtherOption: "Diğer",
    colorNames: {
      "Siyah": "Siyah",
      "Beyaz": "Beyaz",
      "Kahverengi": "Kahverengi",
      "Kum Rengi (Fawn)": "Kum Rengi (Fawn)",
      "Kızıl / Kırmızımsı": "Kızıl / Kırmızımsı",
      "Gri": "Gri",
      "Sarı / Krem": "Sarı / Krem",
      "Sable (Kızıl-Siyah Karışık)": "Sable (Kızıl-Siyah Karışık)",
      "Siyah-Beyaz": "Siyah-Beyaz",
      "Kahverengi-Beyaz": "Kahverengi-Beyaz",
      "Üç Renkli (Tricolor)": "Üç Renkli (Tricolor)",
      "Benekli (Merle)": "Benekli (Merle)",
      "Altın Sarısı": "Altın Sarısı",
      "Diğer": "Diğer",
    },
    deletePetModalTitle: (species) => (species === "cat" ? "Kediyi Sil" : "Köpeği Sil"),
    deletePetWarning: (name, species) =>
      species === "cat"
        ? `${name} adlı kedinin pasaportunu, aşı kayıtlarını ve veteriner atamalarını kalıcı olarak silmek üzeresin. Bu işlem geri alınamaz.`
        : `${name} adlı köpeğin pasaportunu, aşı kayıtlarını ve veteriner atamalarını kalıcı olarak silmek üzeresin. Bu işlem geri alınamaz.`,
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
    documentsTitle: "Belgeler",
    documentsSubtitle: (count) => `${count} belge yüklendi`,
    addDocumentBtn: "Belge Ekle",
    documentsEmpty: "Henüz belge yüklenmedi.",
    addDocumentModalTitle: "Belge Ekle",
    fieldDocumentType: "Belge türü",
    docTypeTravel: "Seyahat Belgesi (AB Pet Passport)",
    docTypeInsurance: "Sigorta Poliçesi",
    docTypeOwnership: "Sahiplik Belgesi",
    docTypeOther: "Diğer",
    fieldDocumentLabel: "Belge adı",
    fieldDocumentFile: "Dosya",
    viewDocumentBtn: "Görüntüle",
    saveBtn: "Kaydet",
    labelApplication: "Uygulama",
    labelNextDose: "Sonraki Doz",
    labelVet: "Veteriner",
    labelBatch: "Parti No",
    statusOverdue: "GECİKMİŞ",
    statusSoon: "YAKINDA",
    statusCurrent: "GÜNCEL",
    vetTabTitle: "Atama",
    vetTabSubtitle: (dogName) => `Platformdaki veterinerlerden ${dogName}'e birincil ve ikincil veteriner atayın.`,
    platformVetsLabel: "Platform Veterinerleri",
    makePrimaryBtn: "Birincil Yap",
    makeSecondaryBtn: "İkincil Yap",
    landingHeadline: "Evcil hayvanınızın tüm hayatı, tek bir dijital pasaportta.",
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
    forgotPasswordLink: "Şifremi unuttum",
    forgotPasswordTitle: "Şifreni Sıfırla",
    forgotPasswordDesc: "Kayıtlı e-posta adresini gir, sana bir şifre sıfırlama bağlantısı gönderelim.",
    sendResetLinkBtn: "Sıfırlama Bağlantısı Gönder",
    resetLinkSentTitle: "Bağlantı Gönderildi",
    resetLinkSentDesc: (email) => `${email} adresine bir şifre sıfırlama bağlantısı gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et.`,
    fieldNewPassword: "Yeni şifre",
    fieldConfirmNewPassword: "Yeni şifreni tekrar gir",
    setNewPasswordBtn: "Şifreyi Güncelle",
    resetPasswordScreenTitle: "Yeni Şifre Belirle",
    passwordUpdatedDesc: "Şifren güncellendi. Şimdi devam edebilirsin.",
    continueBtn: "Devam Et",
    verifyingSession: "Doğrulanıyor…",
    greeting: (name) => `Merhaba, ${name}`,
    navHealth: "Sağlık",
    navDocuments: "Belgeler",
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
    navWeight: "Ağırlık",
    weightTitle: "Ağırlık & Büyüme",
    weightSubtitle: (dogName, count) => `${dogName} için kayıtlı ${count} ölçüm`,
    fieldIdealWeight: "Veteriner tavsiyeli ideal ağırlık (kg)",
    saveIdealWeightBtn: "Kaydet",
    addWeightBtn: "Ölçüm Ekle",
    weightEmpty: "Henüz ağırlık kaydı yok. İlk ölçümü ekleyerek başlayın.",
    addWeightModalTitle: "Ağırlık Ölçümü Ekle",
    fieldWeightDate: "Ölçüm tarihi",
    fieldWeightKg: "Ağırlık (kg)",
    weightChartTitle: "Zaman İçinde Ağırlık",
    weightChartIdealLine: "İdeal ağırlık",
    adminPanelTitle: "Admin Paneli",
    vetPortalTitle: "Veteriner Portalı",
    adminStatsUsers: "Toplam Kullanıcı",
    adminStatsOwners: "Evcil Hayvan Sahibi",
    adminStatsVetAccounts: "Veteriner Hesabı",
    adminStatsVetListings: "Veteriner Kaydı",
    adminStatsPendingRequests: "Onay Bekleyen Atama",
    adminStatsServiceProviders: "Hizmet Firması",
    addVetSectionTitle: "Yeni İşletme Hesabı Aç",
    fieldBusinessType: "İşletme Türü",
    businessTypeNames: { vet: "Veteriner", groomer: "Kuaför / Bakım" },
    myPatientsTitleFor: (type) => (type === "groomer" ? "Müşterilerim" : "Hastalarım"),
    myPatientsSubtitleFor: (type, count) => (type === "groomer" ? `${count} onaylı müşteri` : `${count} onaylı hasta`),
    todaysApptsTitle: "Bugünkü Randevular",
    noApptsToday: "Bugün için randevu yok.",
    quickSearchPlaceholder: "Hasta, sahip ya da mikroçip no ara…",
    createUserSectionTitle: "Yeni Kullanıcı Oluştur",
    createUserSectionSubtitle: "Test için hızlıca e-posta + şifre ile hesap aç, davet e-postası beklemeden.",
    createUserBtn: "Kullanıcı Oluştur",
    userCreateSuccess: (email) => `${email} için hesap oluşturuldu.`,
    changePasswordSectionTitle: "Kullanıcı Şifresi Değiştir",
    fieldUserEmail: "Kullanıcı e-postası",
    changePasswordBtn: "Şifreyi Değiştir",
    passwordChangedSuccess: "Şifre başarıyla değiştirildi.",
    fieldClinicName: "Klinik adı",
    fieldVetCity: "Şehir",
    fieldVetCountry: "Ülke",
    fieldVetSpecialty: "Uzmanlık",
    fieldVetPhone: "Telefon",
    selectVetSpecialty: "Uzmanlık seçin",
    specialtyNames: {
      "İç Hastalıkları": "İç Hastalıkları",
      "Cerrahi": "Cerrahi",
      "Diş & Ağız Sağlığı": "Diş & Ağız Sağlığı",
      "Dermatoloji": "Dermatoloji",
      "Kardiyoloji": "Kardiyoloji",
      "Ortopedi": "Ortopedi",
      "Göz Hastalıkları": "Göz Hastalıkları",
      "Onkoloji": "Onkoloji",
      "Acil & Yoğun Bakım": "Acil & Yoğun Bakım",
      "Egzotik Hayvan Sağlığı": "Egzotik Hayvan Sağlığı",
      "Beslenme": "Beslenme",
      "Genel Bakım": "Genel Bakım",
    },
    fieldVetEmail: "Veterinerin e-postası (davet buraya gider)",
    createVetAccountBtn: "Hesap Oluştur & Davet Gönder",
    vetInviteSuccess: (email) => `${email} adresine davet gönderildi.`,
    addServiceProviderSectionTitle: "Hizmet Firması Ekle",
    fieldServiceName: "Firma adı",
    fieldServiceType: "Hizmet türü",
    serviceTypeGrooming: "Yıkama & Tıraş",
    serviceTypeWalking: "Köpek Yürüyüşü",
    serviceTypeTaxi: "Pet Taksi",
    serviceTypeOther: "Diğer",
    createServiceProviderBtn: "Firmayı Ekle",
    serviceProviderAdded: "Firma eklendi.",
    vetListSectionTitle: "Kayıtlı Veterinerler",
    activityLogsTitle: "Kullanıcı Hareket Kayıtları",
    fieldFilterByEmail: "E-postaya göre filtrele",
    filterBtn: "Filtrele",
    clearFilterBtn: "Temizle",
    noLogsFound: "Kayıt bulunamadı.",
    logColumnTime: "Zaman",
    logColumnUser: "Kullanıcı",
    logColumnAction: "Hareket",
    logColumnDetails: "Detay",
    actionLabels: {
      login: "Giriş yaptı",
      logout: "Çıkış yaptı",
      dog_created: "Evcil hayvan eklendi",
      dog_updated: "Evcil hayvan düzenlendi",
      dog_deleted: "Evcil hayvan silindi",
      vaccine_added: "Aşı eklendi",
      vaccine_deleted: "Aşı silindi",
      health_profile_updated: "Sağlık profili güncellendi",
      document_added: "Belge eklendi",
      document_deleted: "Belge silindi",
      health_record_added: "Muayene kaydı eklendi",
      health_record_deleted: "Muayene kaydı silindi",
      medication_added: "İlaç eklendi",
      medication_deleted: "İlaç silindi",
      appointment_added: "Randevu eklendi",
      appointment_deleted: "Randevu silindi",
      ideal_weight_updated: "İdeal ağırlık güncellendi",
      weight_entry_added: "Ağırlık ölçümü eklendi",
      weight_entry_deleted: "Ağırlık ölçümü silindi",
      vet_requested: "Veteriner atama isteği",
      vet_request_cancelled: "Veteriner isteği iptal edildi",
    },
    vetPortalWelcome: (clinic) => `Hoş geldin, ${clinic}`,
    pendingRequestsTitle: "Onay Bekleyen Atamalar",
    noPendingRequests: "Şu an onay bekleyen atama yok.",
    approveBtn: "Onayla",
    rejectBtn: "Reddet",
    requestFrom: (dogName, role) => `${dogName} için ${role} veteriner talebi`,
    myDoctorsTitle: "Doktorlarım",
    addDoctorBtn: "Doktor Ekle",
    fieldDoctorName: "Doktor adı",
    fieldDoctorTitle: "Unvan",
    noDoctors: "Henüz doktor eklenmedi.",
    myServicesTitle: "Verdiğim Hizmetler",
    addServiceBtn: "Hizmet Ekle",
    fieldServiceNameShort: "Hizmet adı",
    fieldServicePrice: "Fiyat",
    fieldServiceDuration: "Süre",
    durationMinutesLabel: (m) => (m < 60 ? `${m} dk` : m === 60 ? "1 saat" : `${Math.floor(m / 60)} sa ${m % 60 || ""} ${m % 60 ? "dk" : ""}`.trim()),
    selectServiceType: "Hizmet seçin",
    serviceNames: {
      "Muayene": "Muayene",
      "Aşılama": "Aşılama",
      "Kısırlaştırma": "Kısırlaştırma",
      "Diş Temizliği": "Diş Temizliği",
      "Röntgen": "Röntgen",
      "Kan Tahlili": "Kan Tahlili",
      "Ameliyat": "Ameliyat",
      "Ultrason": "Ultrason",
      "Mikroçip Takma": "Mikroçip Takma",
      "Tırnak Kesimi": "Tırnak Kesimi",
      "Yıkama & Tıraş": "Yıkama & Tıraş",
      "Ev Ziyareti": "Ev Ziyareti",
      "Acil Müdahale": "Acil Müdahale",
      "Laboratuvar Testi": "Laboratuvar Testi",
      "Diğer": "Diğer",
    },
    doctorTitleNames: {
      "Veteriner Hekim": "Veteriner Hekim",
      "Klinik Şefi": "Klinik Şefi",
      "Uzman Veteriner Hekim": "Uzman Veteriner Hekim",
      "Cerrah": "Cerrah",
      "Baş Veteriner": "Baş Veteriner",
      "Asistan Veteriner": "Asistan Veteriner",
      "Stajyer": "Stajyer",
      "Veteriner Teknisyeni": "Veteriner Teknisyeni",
    },
    editVaccineModalTitle: "Aşı Kaydını Düzenle",
    editHealthRecordModalTitle: "Sağlık Notunu Düzenle",
    vaccineConfirmedCheckbox: "Bu aşı yapıldı",
    notYetGivenLabel: "Henüz Yapılmadı",
    markAsDoneBtn: "Yapıldı Olarak İşaretle",
    markAsNotDoneBtn: "Yapılmadı Olarak İşaretle",
    addMedicationForPatientBtn: "İlaç/Takviye Öner",
    availabilityTitle: "Müsaitlik Takvimi",
    availabilitySubtitle: "Hastaların randevu alabileceği gün ve saatleri belirle.",
    availabilityBreakHint: "Mola vermek için aynı güne iki ayrı aralık ekleyebilirsin (örn. 09:00-12:00 ve 14:00-18:00).",
    blockSlotBtn: "Bu Saati Kapat",
    blockSlotTitle: "Uygulama Dışı Randevu",
    blockSlotSubtitle: "Telefon ya da kapıdan aldığın bir randevuyu buraya işleyerek o saati kapat.",
    blockSlotNotePlaceholder: "Müşteri adı / not (opsiyonel)",
    blockSlotSuccessMsg: "Saat kapatıldı.",
    vetTabDashboard: "Ana Ekran",
    vetTabAppointments: "Randevular",
    vetTabTeam: "Ekip & Hizmetler",
    vetTabSettings: "Klinik Bilgileri",
    ownerInfoSection: "Sahip Bilgileri",
    periodToday: "Bugün",
    periodWeek: "Bu Hafta",
    periodMonth: "Bu Ay",
    serviceBreakdownTitle: "Hizmete Göre Dağılım",
    dayNames: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
    fieldStartTime: "Başlangıç",
    fieldEndTime: "Bitiş",
    addAvailabilityBtn: "Blok Ekle",
    noAvailabilitySet: "Henüz müsaitlik tanımlanmadı.",
    myAppointmentsTitle: "Randevularım",
    noAppointmentsYet: "Henüz randevu yok.",
    apptStatusBooked: "Planlandı",
    apptStatusCompleted: "Tamamlandı",
    apptStatusCancelled: "İptal Edildi",
    apptStatusRescheduled: "Yeniden Planlandı",
    offAppApptSectionTitle: "Uygulama Dışı Randevu",
    allAppointmentsTitle: "Tüm Randevular",
    colApptDate: "Randevu Tarihi",
    colApptTimeRange: "Saat Aralığı",
    colCustomerName: "Müşteri Adı",
    colPetName: "Pet Adı",
    colService: "Verilecek Hizmet",
    colApptType: "Randevu Tipi",
    colStatus: "Durum",
    colDetails: "Detay",
    apptTypeOnApp: "Uygulama İçi",
    apptTypeOffApp: "Uygulama Dışı",
    noAppointmentsInTable: "Henüz randevu yok.",
    apptDetailTitle: "Randevu Detayı",
    cancelActionBtn: "İptal Et",
    rescheduleActionBtn: "Yeniden Planla",
    doneActionBtn: "Tamamlandı",
    statusNoteLabel: "Not",
    statusNotePlaceholder: "Hasta/müşteri ile ilgili not…",
    confirmActionBtn: "Onayla",
    newDateLabel: "Yeni Tarih",
    rescheduleSuccessMsg: "Randevu yeniden planlandı.",
    cancelSuccessMsg: "Randevu iptal edildi.",
    doneSuccessMsg: "Randevu tamamlandı olarak işaretlendi.",
    markCompletedBtn: "Tamamlandı İşaretle",
    cancelApptBtn: "İptal Et",
    bookApptBtn: "Randevu Al",
    selectDateLabel: "Tarih Seç",
    selectTimeLabel: "Saat Seç",
    noSlotsAvailable: "Bu tarihte müsait saat yok.",
    confirmBookingBtn: "Randevuyu Onayla",
    bookingSuccessMsg: "Randevun alındı!",
    slotTakenErrorMsg: "Bu saat az önce doldu, başka bir saat seç.",
    vetBookedApptBadge: "Vet Onaylı Randevu",
    apptNoteLabel: "Not (opsiyonel)",
    loadingSlotsText: "Müsait saatler yükleniyor…",
    noBookableVets: "Şu anda müsaitlik tanımlamış bir veteriner yok.",
    groomerSpecialtyNames: {
      "Yıkama & Tıraş": "Yıkama & Tıraş",
      "Tırnak Bakımı": "Tırnak Bakımı",
      "Kulak & Göz Temizliği": "Kulak & Göz Temizliği",
      "Diş Bakımı": "Diş Bakımı",
      "Deri & Tüy Bakımı": "Deri & Tüy Bakımı",
      "Irk Bazlı Kesim": "Irk Bazlı Kesim",
      "Parazit Kontrolü": "Parazit Kontrolü",
      "Spa & Masaj": "Spa & Masaj",
      "Genel Bakım": "Genel Bakım",
    },
    groomerStaffTitleNames: {
      "Kuaför": "Kuaför",
      "Şef Kuaför": "Şef Kuaför",
      "Bakım Uzmanı": "Bakım Uzmanı",
      "Yardımcı Personel": "Yardımcı Personel",
      "Stajyer": "Stajyer",
    },
    myTeamTitleFor: (type) => (type === "groomer" ? "Ekibim" : "Doktorlarım"),
    fieldEmployeeTitleFor: (type) => (type === "groomer" ? "Görev" : "Unvan"),
    fieldEmployeeNameFor: (type) => (type === "groomer" ? "Çalışan adı" : "Doktor adı"),
    noTeamMembersFor: (type) => (type === "groomer" ? "Henüz çalışan eklenmedi." : "Henüz doktor eklenmedi."),
    vaccineNames: {
      "Kuduz / Rabies": "Kuduz / Rabies",
      "Karma (DHPPi)": "Karma (DHPPi)",
      "Leptospiroz": "Leptospiroz",
      "Bordetella (Kennel Cough)": "Bordetella (Kennel Cough)",
      "Leishmania": "Leishmania",
      "Corona virüsü": "Corona virüsü",
      "Karma (FVRCP)": "Karma (FVRCP)",
      "Lösemi (FeLV)": "Lösemi (FeLV)",
      "FIV Testi": "FIV Testi",
      "Klamidya (Chlamydia)": "Klamidya (Chlamydia)",
      "Bordetella": "Bordetella",
      "Diğer": "Diğer",
    },
    noServices: "Henüz hizmet eklenmedi.",
    clinicInfoTitle: "Klinik Bilgileri",
    myPatientsTitle: "Hastalarım",
    addVaccineForPatientBtn: "Aşı Ekle",
    addHealthNoteForPatientBtn: "Sağlık Notu Ekle",
    addedByVetLabel: (clinic) => `${clinic} tarafından eklendi`,
    vetRecordSuccess: "Kayıt hastanın dosyasına eklendi.",
    myPatientsSubtitle: (count) => `${count} onaylı hasta`,
    noPatientsYet: "Henüz onaylı hastan yok.",
    viewPatientBtn: "Görüntüle",
    patientDetailTitle: (name) => `${name} — Hasta Kaydı`,
    closeBtn: "Kapat",
    maxSpecialtiesNote: (max) => `en fazla ${max}`,
    commercialInfoTitle: "Ticari Bilgiler",
    bankInfoTitle: "Banka Bilgileri",
    fieldWebsite: "Web Adresi",
    uploadLogo: "Logo yükle",
    changeLogo: "Logoyu değiştir",
    viewDetailsBtn: "Detayları Gör",
    vetServicesTitle: "Sunulan Hizmetler",
    noServicesListed: "Henüz hizmet eklenmemiş.",
    websiteLabel: "Web Sitesi",
    fieldLegalBusinessName: "Resmi (Ticari) Ünvan",
    fieldTaxId: "Vergi Numarası",
    fieldClinicAddress: "Açık Adres",
    fieldTradeRegistryDoc: "Ticari Sicil Belgesi",
    fieldIban: "IBAN No",
    fieldSwiftCode: "SWIFT Kodu",
    fieldBankName: "Banka Adı",
    fieldAccountHolderName: "Hesap Sahibi Adı",
    saveClinicInfoBtn: "Bilgileri Kaydet",
    approvedByLabel: "Onaylayan",
    assignedVetsTitle: "Atanmış Veterinerler",
    navPetCV: "CV",
    petCvTitle: (name) => `${name} — Genel Özet (CV)`,
    petCvSubtitle: "Tüm pasaport, sağlık, aşı ve veteriner bilgilerinin özeti",
    downloadPdfBtn: "PDF Olarak İndir",
    cvIdentitySection: "Kimlik Bilgileri",
    cvHealthSection: "Sağlık Profili",
    cvVaccinesSection: "Aşı Geçmişi",
    cvWeightSection: "Ağırlık",
    cvVetSection: "Atanmış Veterinerler",
    cvNoVaccines: "Kayıtlı aşı yok.",
    cvNoVet: "Onaylı veteriner ataması yok.",
    cvCurrentWeight: "Güncel Ağırlık",
    cvIdealWeight: "İdeal Ağırlık",
    cvNoWeight: "Ağırlık ölçümü yok.",
    cvGeneratedOn: (date) => `${date} tarihinde oluşturuldu`,
    pendingApprovalBadge: "ONAY BEKLİYOR",
    rejectedBadge: "REDDEDİLDİ",
    cancelRequestBtn: "İptal Et",
    enableNotificationsBtn: "Bildirimleri Aç",
    notificationsEnabled: "Bildirimler açık",
    notificationPermissionDenied: "Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsin.",
    notificationsUnsupported: "Bu tarayıcı push bildirimlerini desteklemiyor.",
    premiumBadge: "Premium",
    upgradeBtn: "Premium'a Geç",
    manageSubscriptionBtn: "Aboneliği Yönet",
    premiumModalTitle: "Paw Wallet Premium",
    premiumModalSubtitle: "Tüm hayvanlarınız, tüm veterinerleriniz, sınırsız belge.",
    billingMonthly: "Aylık",
    billingYearly: "Yıllık",
    billingYearlyBadge: "%30 tasarruf",
    priceMonthly: "€2.99/ay",
    priceYearly: "€24.99/yıl",
    premiumFeature1: "Sınırsız hayvan ekleme",
    premiumFeature2: "İkincil veteriner ataması",
    premiumFeature3: "Sınırsız belge yükleme",
    premiumFeature4: "Pet CV / PDF indirme",
    subscribeBtn: "Abone Ol",
    freePlanLabel: "Ücretsiz Plan",
    premiumPlanLabel: "Premium Plan",
    limitReachedPets: "Ücretsiz planda 1 hayvan ekleyebilirsin. Daha fazlası için Premium'a geç.",
    limitReachedVet: "İkincil veteriner ataması Premium özelliğidir.",
    limitReachedDocs: "Ücretsiz planda en fazla 3 belge yükleyebilirsin.",
    limitReachedCv: "Pet CV ve PDF indirme Premium özelliğidir.",
    seePremiumBtn: "Premium'u Gör",
    redirectingToStripe: "Ödeme sayfasına yönlendiriliyorsun…",
  },
  en: {
    speciesLabel: { dog: "Dog", cat: "Cat" },
    tagline: "Your pet's digital passport",
    navPassport: "Passport",
    navVaccines: "Vaccine Card",
    navVets: "Health & Care",
    addNewDogItem: "Add new dog",
    addNewCatItem: "Add new cat",
    noDogsTitle: "No pets added yet",
    noDogsText: "Get started by creating your pet's passport — identity details, QR code and more are prepared automatically.",
    addFirstDog: "Add First Dog",
    addFirstCat: "Add First Cat",
    footerNote: "Phase 1 preview — Passport, Vaccine Card, Vet Assignment. Data is stored in Supabase.",
    addPetModalTitle: (species) => (species === "cat" ? "Add New Cat" : "Add New Dog"),
    editPetModalTitle: (species) => (species === "cat" ? "Edit Cat Details" : "Edit Dog Details"),
    uploadPhoto: "Upload photo",
    changePhoto: "Change photo",
    fieldPetName: (species) => (species === "cat" ? "Cat's name" : "Dog's name"),
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
    fieldNeutered: "Neutered / Spayed?",
    rowNeutered: "Neutered / Spayed",
    neuteredYes: "Yes",
    neuteredNo: "No",
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
    verifiedIdentityLabel: "VERIFIED IDENTITY",
    scannableIdDesc: (name) => `When scanned, ${name}'s identity and contact details appear instantly.`,
    scanToReach: "Scan & reach out if lost",
    lostPetCardBadge: (species) => `Found this ${species.toLowerCase()}?`,
    lostPetCardTitle: (name) => `${name}'s ID Card`,
    lostPetCardDesc: (species) => `This ${species.toLowerCase()}'s owner uses Paw Wallet. You can reach them using the details below.`,
    callOwnerBtn: "Call Owner",
    callEmergencyBtn: "Call Emergency Contact",
    lostCardNotFound: (species) => `No record found for this ${species.toLowerCase()}.`,
    lostCardFooter: "Made with Paw Wallet",
    breedMixedOption: "Mixed / Unknown",
    breedOtherOption: "Other",
    colorNames: {
      "Siyah": "Black",
      "Beyaz": "White",
      "Kahverengi": "Brown",
      "Kum Rengi (Fawn)": "Fawn",
      "Kızıl / Kırmızımsı": "Red / Reddish",
      "Gri": "Grey",
      "Sarı / Krem": "Yellow / Cream",
      "Sable (Kızıl-Siyah Karışık)": "Sable",
      "Siyah-Beyaz": "Black & White",
      "Kahverengi-Beyaz": "Brown & White",
      "Üç Renkli (Tricolor)": "Tricolor",
      "Benekli (Merle)": "Merle",
      "Altın Sarısı": "Golden",
      "Diğer": "Other",
    },
    deletePetModalTitle: (species) => (species === "cat" ? "Delete Cat" : "Delete Dog"),
    deletePetWarning: (name, species) =>
      `You're about to permanently delete ${name}'s passport, vaccine records and vet assignments. This action cannot be undone.`,
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
    documentsTitle: "Documents",
    documentsSubtitle: (count) => `${count} documents uploaded`,
    addDocumentBtn: "Add Document",
    documentsEmpty: "No documents uploaded yet.",
    addDocumentModalTitle: "Add Document",
    fieldDocumentType: "Document type",
    docTypeTravel: "Travel Document (EU Pet Passport)",
    docTypeInsurance: "Insurance Policy",
    docTypeOwnership: "Ownership Document",
    docTypeOther: "Other",
    fieldDocumentLabel: "Document name",
    fieldDocumentFile: "File",
    viewDocumentBtn: "View",
    saveBtn: "Save",
    labelApplication: "Given",
    labelNextDose: "Next Dose",
    labelVet: "Vet",
    labelBatch: "Batch No.",
    statusOverdue: "OVERDUE",
    statusSoon: "DUE SOON",
    statusCurrent: "CURRENT",
    vetTabTitle: "Assignment",
    vetTabSubtitle: (dogName) => `Assign a primary and secondary vet to ${dogName} from platform vets.`,
    platformVetsLabel: "Platform Vets",
    makePrimaryBtn: "Make Primary",
    makeSecondaryBtn: "Make Secondary",
    landingHeadline: "Your pet's whole life, in one digital passport.",
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
    forgotPasswordLink: "Forgot password?",
    forgotPasswordTitle: "Reset Your Password",
    forgotPasswordDesc: "Enter your registered email and we'll send you a password reset link.",
    sendResetLinkBtn: "Send Reset Link",
    resetLinkSentTitle: "Link Sent",
    resetLinkSentDesc: (email) => `We sent a password reset link to ${email}. Check your inbox (and spam folder).`,
    fieldNewPassword: "New password",
    fieldConfirmNewPassword: "Confirm new password",
    setNewPasswordBtn: "Update Password",
    resetPasswordScreenTitle: "Set a New Password",
    passwordUpdatedDesc: "Your password has been updated. You can continue now.",
    continueBtn: "Continue",
    verifyingSession: "Verifying…",
    greeting: (name) => `Hi, ${name}`,
    navHealth: "Health",
    navDocuments: "Documents",
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
    navWeight: "Weight",
    weightTitle: "Weight & Growth",
    weightSubtitle: (dogName, count) => `${count} measurements recorded for ${dogName}`,
    fieldIdealWeight: "Vet-recommended ideal weight (kg)",
    saveIdealWeightBtn: "Save",
    addWeightBtn: "Add Measurement",
    weightEmpty: "No weight records yet. Add the first one to get started.",
    addWeightModalTitle: "Add Weight Measurement",
    fieldWeightDate: "Measurement date",
    fieldWeightKg: "Weight (kg)",
    weightChartTitle: "Weight Over Time",
    weightChartIdealLine: "Ideal weight",
    adminPanelTitle: "Admin Panel",
    vetPortalTitle: "Vet Portal",
    adminStatsUsers: "Total Users",
    adminStatsOwners: "Pet Owners",
    adminStatsVetAccounts: "Vet Accounts",
    adminStatsVetListings: "Vet Listings",
    adminStatsPendingRequests: "Pending Assignments",
    adminStatsServiceProviders: "Service Providers",
    addVetSectionTitle: "Create New Business Account",
    fieldBusinessType: "Business Type",
    businessTypeNames: { vet: "Veterinarian", groomer: "Grooming / Care" },
    myPatientsTitleFor: (type) => (type === "groomer" ? "My Customers" : "My Patients"),
    myPatientsSubtitleFor: (type, count) => (type === "groomer" ? `${count} approved customers` : `${count} approved patients`),
    todaysApptsTitle: "Today's Appointments",
    noApptsToday: "No appointments today.",
    quickSearchPlaceholder: "Search patient, owner, or microchip no…",
    createUserSectionTitle: "Create New User",
    createUserSectionSubtitle: "Quickly create a test account with email + password, no invite email needed.",
    createUserBtn: "Create User",
    userCreateSuccess: (email) => `Account created for ${email}.`,
    changePasswordSectionTitle: "Change User Password",
    fieldUserEmail: "User's email",
    changePasswordBtn: "Change Password",
    passwordChangedSuccess: "Password changed successfully.",
    fieldClinicName: "Clinic name",
    fieldVetCity: "City",
    fieldVetCountry: "Country",
    fieldVetSpecialty: "Specialty",
    fieldVetPhone: "Phone",
    selectVetSpecialty: "Select specialty",
    specialtyNames: {
      "İç Hastalıkları": "Internal Medicine",
      "Cerrahi": "Surgery",
      "Diş & Ağız Sağlığı": "Dentistry",
      "Dermatoloji": "Dermatology",
      "Kardiyoloji": "Cardiology",
      "Ortopedi": "Orthopedics",
      "Göz Hastalıkları": "Ophthalmology",
      "Onkoloji": "Oncology",
      "Acil & Yoğun Bakım": "Emergency & Critical Care",
      "Egzotik Hayvan Sağlığı": "Exotic Animal Medicine",
      "Beslenme": "Nutrition",
      "Genel Bakım": "General Care",
    },
    fieldVetEmail: "Vet's email (invite is sent here)",
    createVetAccountBtn: "Create Account & Send Invite",
    vetInviteSuccess: (email) => `Invite sent to ${email}.`,
    addServiceProviderSectionTitle: "Add Service Provider",
    fieldServiceName: "Company name",
    fieldServiceType: "Service type",
    serviceTypeGrooming: "Grooming",
    serviceTypeWalking: "Dog Walking",
    serviceTypeTaxi: "Pet Taxi",
    serviceTypeOther: "Other",
    createServiceProviderBtn: "Add Company",
    serviceProviderAdded: "Company added.",
    vetListSectionTitle: "Registered Vets",
    activityLogsTitle: "User Activity Logs",
    fieldFilterByEmail: "Filter by email",
    filterBtn: "Filter",
    clearFilterBtn: "Clear",
    noLogsFound: "No logs found.",
    logColumnTime: "Time",
    logColumnUser: "User",
    logColumnAction: "Action",
    logColumnDetails: "Details",
    actionLabels: {
      login: "Logged in",
      logout: "Logged out",
      dog_created: "Pet added",
      dog_updated: "Pet edited",
      dog_deleted: "Pet deleted",
      vaccine_added: "Vaccine added",
      vaccine_deleted: "Vaccine deleted",
      health_profile_updated: "Health profile updated",
      document_added: "Document added",
      document_deleted: "Document deleted",
      health_record_added: "Health record added",
      health_record_deleted: "Health record deleted",
      medication_added: "Medication added",
      medication_deleted: "Medication deleted",
      appointment_added: "Appointment added",
      appointment_deleted: "Appointment deleted",
      ideal_weight_updated: "Ideal weight updated",
      weight_entry_added: "Weight entry added",
      weight_entry_deleted: "Weight entry deleted",
      vet_requested: "Vet assignment requested",
      vet_request_cancelled: "Vet request cancelled",
    },
    vetPortalWelcome: (clinic) => `Welcome, ${clinic}`,
    pendingRequestsTitle: "Pending Assignment Requests",
    noPendingRequests: "No pending requests right now.",
    approveBtn: "Approve",
    rejectBtn: "Reject",
    requestFrom: (dogName, role) => `${role} vet request for ${dogName}`,
    myDoctorsTitle: "My Doctors",
    addDoctorBtn: "Add Doctor",
    fieldDoctorName: "Doctor's name",
    fieldDoctorTitle: "Title",
    noDoctors: "No doctors added yet.",
    myServicesTitle: "Services I Offer",
    addServiceBtn: "Add Service",
    fieldServiceNameShort: "Service name",
    fieldServicePrice: "Price",
    fieldServiceDuration: "Duration",
    durationMinutesLabel: (m) => (m < 60 ? `${m} min` : m === 60 ? "1 hr" : `${Math.floor(m / 60)}h ${m % 60 || ""}${m % 60 ? "m" : ""}`.trim()),
    selectServiceType: "Select service",
    serviceNames: {
      "Muayene": "Consultation",
      "Aşılama": "Vaccination",
      "Kısırlaştırma": "Spay/Neuter",
      "Diş Temizliği": "Dental Cleaning",
      "Röntgen": "X-Ray",
      "Kan Tahlili": "Blood Test",
      "Ameliyat": "Surgery",
      "Ultrason": "Ultrasound",
      "Mikroçip Takma": "Microchipping",
      "Tırnak Kesimi": "Nail Trim",
      "Yıkama & Tıraş": "Grooming",
      "Ev Ziyareti": "House Call",
      "Acil Müdahale": "Emergency Care",
      "Laboratuvar Testi": "Lab Test",
      "Diğer": "Other",
    },
    doctorTitleNames: {
      "Veteriner Hekim": "Veterinarian",
      "Klinik Şefi": "Head of Clinic",
      "Uzman Veteriner Hekim": "Specialist Veterinarian",
      "Cerrah": "Surgeon",
      "Baş Veteriner": "Chief Veterinarian",
      "Asistan Veteriner": "Assistant Veterinarian",
      "Stajyer": "Intern",
      "Veteriner Teknisyeni": "Veterinary Technician",
    },
    editVaccineModalTitle: "Edit Vaccine Record",
    editHealthRecordModalTitle: "Edit Health Note",
    vaccineConfirmedCheckbox: "This vaccine was given",
    notYetGivenLabel: "Not Yet Given",
    markAsDoneBtn: "Mark as Done",
    markAsNotDoneBtn: "Mark as Not Done",
    addMedicationForPatientBtn: "Prescribe Medication",
    availabilityTitle: "Availability Schedule",
    availabilitySubtitle: "Set the days and times patients can book appointments.",
    availabilityBreakHint: "Add two separate ranges for the same day to include a break (e.g. 9:00-12:00 and 14:00-18:00).",
    blockSlotBtn: "Block This Time",
    blockSlotTitle: "Off-App Appointment",
    blockSlotSubtitle: "Log an appointment you took by phone or in person to block that time.",
    blockSlotNotePlaceholder: "Customer name / note (optional)",
    blockSlotSuccessMsg: "Time slot blocked.",
    vetTabDashboard: "Dashboard",
    vetTabAppointments: "Appointments",
    vetTabTeam: "Team & Services",
    vetTabSettings: "Clinic Info",
    ownerInfoSection: "Owner Info",
    periodToday: "Today",
    periodWeek: "This Week",
    periodMonth: "This Month",
    serviceBreakdownTitle: "By Service",
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    fieldStartTime: "Start",
    fieldEndTime: "End",
    addAvailabilityBtn: "Add Block",
    noAvailabilitySet: "No availability set yet.",
    myAppointmentsTitle: "My Appointments",
    noAppointmentsYet: "No appointments yet.",
    apptStatusBooked: "Scheduled",
    apptStatusCompleted: "Done",
    apptStatusCancelled: "Cancelled",
    apptStatusRescheduled: "Rescheduled",
    offAppApptSectionTitle: "Off-App Appointment",
    allAppointmentsTitle: "All Appointments",
    colApptDate: "Appt Date",
    colApptTimeRange: "Time Range",
    colCustomerName: "Customer Name",
    colPetName: "Pet Name",
    colService: "Service",
    colApptType: "Appt Type",
    colStatus: "Status",
    colDetails: "Details",
    apptTypeOnApp: "On-App",
    apptTypeOffApp: "Off-App",
    noAppointmentsInTable: "No appointments yet.",
    apptDetailTitle: "Appointment Details",
    cancelActionBtn: "Cancel",
    rescheduleActionBtn: "Reschedule",
    doneActionBtn: "Done",
    statusNoteLabel: "Note",
    statusNotePlaceholder: "Note about the patient/customer…",
    confirmActionBtn: "Confirm",
    newDateLabel: "New Date",
    rescheduleSuccessMsg: "Appointment rescheduled.",
    cancelSuccessMsg: "Appointment cancelled.",
    doneSuccessMsg: "Appointment marked as done.",
    markCompletedBtn: "Mark Completed",
    cancelApptBtn: "Cancel",
    bookApptBtn: "Book Appointment",
    selectDateLabel: "Select Date",
    selectTimeLabel: "Select Time",
    noSlotsAvailable: "No slots available on this date.",
    confirmBookingBtn: "Confirm Booking",
    bookingSuccessMsg: "Your appointment is booked!",
    slotTakenErrorMsg: "This slot was just taken, please pick another.",
    vetBookedApptBadge: "Vet-Confirmed Appointment",
    apptNoteLabel: "Note (optional)",
    loadingSlotsText: "Loading available times…",
    noBookableVets: "No vets have set up availability yet.",
    groomerSpecialtyNames: {
      "Yıkama & Tıraş": "Bathing & Trimming",
      "Tırnak Bakımı": "Nail Care",
      "Kulak & Göz Temizliği": "Ear & Eye Cleaning",
      "Diş Bakımı": "Dental Care",
      "Deri & Tüy Bakımı": "Skin & Coat Care",
      "Irk Bazlı Kesim": "Breed-Specific Cut",
      "Parazit Kontrolü": "Parasite Control",
      "Spa & Masaj": "Spa & Massage",
      "Genel Bakım": "General Care",
    },
    groomerStaffTitleNames: {
      "Kuaför": "Groomer",
      "Şef Kuaför": "Head Groomer",
      "Bakım Uzmanı": "Care Specialist",
      "Yardımcı Personel": "Support Staff",
      "Stajyer": "Intern",
    },
    myTeamTitleFor: (type) => (type === "groomer" ? "My Team" : "My Doctors"),
    fieldEmployeeTitleFor: (type) => (type === "groomer" ? "Role" : "Title"),
    fieldEmployeeNameFor: (type) => (type === "groomer" ? "Employee name" : "Doctor name"),
    noTeamMembersFor: (type) => (type === "groomer" ? "No employees added yet." : "No doctors added yet."),
    vaccineNames: {
      "Kuduz / Rabies": "Rabies",
      "Karma (DHPPi)": "DHPPi (Combination)",
      "Leptospiroz": "Leptospirosis",
      "Bordetella (Kennel Cough)": "Bordetella (Kennel Cough)",
      "Leishmania": "Leishmania",
      "Corona virüsü": "Canine Coronavirus",
      "Karma (FVRCP)": "FVRCP (Combination)",
      "Lösemi (FeLV)": "Feline Leukemia (FeLV)",
      "FIV Testi": "FIV Test",
      "Klamidya (Chlamydia)": "Chlamydia",
      "Bordetella": "Bordetella",
      "Diğer": "Other",
    },
    noServices: "No services added yet.",
    clinicInfoTitle: "Clinic Info",
    myPatientsTitle: "My Patients",
    addVaccineForPatientBtn: "Add Vaccine",
    addHealthNoteForPatientBtn: "Add Health Note",
    addedByVetLabel: (clinic) => `Added by ${clinic}`,
    vetRecordSuccess: "Record added to the patient's file.",
    myPatientsSubtitle: (count) => `${count} approved patients`,
    noPatientsYet: "No approved patients yet.",
    viewPatientBtn: "View",
    patientDetailTitle: (name) => `${name} — Patient Record`,
    closeBtn: "Close",
    maxSpecialtiesNote: (max) => `up to ${max}`,
    commercialInfoTitle: "Business Info",
    bankInfoTitle: "Bank Details",
    fieldWebsite: "Website",
    uploadLogo: "Upload logo",
    changeLogo: "Change logo",
    viewDetailsBtn: "View Details",
    vetServicesTitle: "Services Offered",
    noServicesListed: "No services listed yet.",
    websiteLabel: "Website",
    fieldLegalBusinessName: "Legal Business Name",
    fieldTaxId: "Tax ID Number",
    fieldClinicAddress: "Full Address",
    fieldTradeRegistryDoc: "Trade Registry Document",
    fieldIban: "IBAN",
    fieldSwiftCode: "SWIFT Code",
    fieldBankName: "Bank Name",
    fieldAccountHolderName: "Account Holder Name",
    saveClinicInfoBtn: "Save Info",
    approvedByLabel: "Approved by",
    assignedVetsTitle: "Assigned Vets",
    navPetCV: "CV",
    petCvTitle: (name) => `${name} — Summary (CV)`,
    petCvSubtitle: "A summary of all passport, health, vaccine, and vet information",
    downloadPdfBtn: "Download as PDF",
    cvIdentitySection: "Identity Details",
    cvHealthSection: "Health Profile",
    cvVaccinesSection: "Vaccine History",
    cvWeightSection: "Weight",
    cvVetSection: "Assigned Vets",
    cvNoVaccines: "No vaccines recorded.",
    cvNoVet: "No approved vet assignment.",
    cvCurrentWeight: "Current Weight",
    cvIdealWeight: "Ideal Weight",
    cvNoWeight: "No weight measurements.",
    cvGeneratedOn: (date) => `Generated on ${date}`,
    pendingApprovalBadge: "PENDING APPROVAL",
    rejectedBadge: "REJECTED",
    cancelRequestBtn: "Cancel",
    enableNotificationsBtn: "Enable Notifications",
    notificationsEnabled: "Notifications on",
    notificationPermissionDenied: "Notification permission denied. You can allow it in your browser settings.",
    notificationsUnsupported: "This browser doesn't support push notifications.",
    premiumBadge: "Premium",
    upgradeBtn: "Upgrade to Premium",
    manageSubscriptionBtn: "Manage Subscription",
    premiumModalTitle: "Paw Wallet Premium",
    premiumModalSubtitle: "All your pets, all your vets, unlimited documents.",
    billingMonthly: "Monthly",
    billingYearly: "Yearly",
    billingYearlyBadge: "Save 30%",
    priceMonthly: "€2.99/mo",
    priceYearly: "€24.99/yr",
    premiumFeature1: "Add unlimited pets",
    premiumFeature2: "Assign a secondary vet",
    premiumFeature3: "Unlimited document uploads",
    premiumFeature4: "Pet CV / PDF download",
    subscribeBtn: "Subscribe",
    freePlanLabel: "Free Plan",
    premiumPlanLabel: "Premium Plan",
    limitReachedPets: "You can add 1 pet on the free plan. Upgrade to Premium for more.",
    limitReachedVet: "Secondary vet assignment is a Premium feature.",
    limitReachedDocs: "You can upload up to 3 documents on the free plan.",
    limitReachedCv: "Pet CV and PDF download are Premium features.",
    seePremiumBtn: "See Premium",
    redirectingToStripe: "Redirecting you to checkout…",
  },
  fr: {
    speciesLabel: { dog: "Chien", cat: "Chat" },
    tagline: "Le passeport numérique de votre animal",
    navPassport: "Passeport",
    navVaccines: "Carnet de Vaccination",
    navVets: "Santé & Soins",
    addNewDogItem: "Ajouter un chien",
    addNewCatItem: "Ajouter un chat",
    noDogsTitle: "Aucun animal ajouté",
    noDogsText: "Commencez par créer le passeport de votre animal — identité, code QR et plus sont préparés automatiquement.",
    addFirstDog: "Ajouter le Premier Chien",
    addFirstCat: "Ajouter le Premier Chat",
    footerNote: "Aperçu Phase 1 — Passeport, Carnet de Vaccination, Attribution Vétérinaire. Les données sont stockées dans Supabase.",
    addPetModalTitle: (species) => (species === "cat" ? "Ajouter un Nouveau Chat" : "Ajouter un Nouveau Chien"),
    editPetModalTitle: (species) => (species === "cat" ? "Modifier les Informations du Chat" : "Modifier les Informations du Chien"),
    uploadPhoto: "Télécharger une photo",
    changePhoto: "Changer la photo",
    fieldPetName: (species) => (species === "cat" ? "Nom du chat" : "Nom du chien"),
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
    fieldNeutered: "Stérilisé(e) ?",
    rowNeutered: "Statut de Stérilisation",
    neuteredYes: "Oui",
    neuteredNo: "Non",
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
    verifiedIdentityLabel: "IDENTITÉ VÉRIFIÉE",
    scannableIdDesc: (name) => `Une fois scanné, ce code affiche instantanément l'identité et les coordonnées de ${name}.`,
    scanToReach: "Scanner & contacter en cas de perte",
    lostPetCardBadge: (species) => (species === "cat" ? "Vous avez trouvé ce chat ?" : "Vous avez trouvé ce chien ?"),
    lostPetCardTitle: (name) => `Carte d'Identité de ${name}`,
    lostPetCardDesc: (species) =>
      species === "cat"
        ? "Le propriétaire de ce chat utilise Paw Wallet. Vous pouvez le contacter ci-dessous."
        : "Le propriétaire de ce chien utilise Paw Wallet. Vous pouvez le contacter ci-dessous.",
    callOwnerBtn: "Appeler le Propriétaire",
    callEmergencyBtn: "Appeler le Contact d'Urgence",
    lostCardNotFound: (species) => (species === "cat" ? "Aucun enregistrement trouvé pour ce chat." : "Aucun enregistrement trouvé pour ce chien."),
    lostCardFooter: "Créé avec Paw Wallet",
    breedMixedOption: "Croisé / Inconnu",
    breedOtherOption: "Autre",
    colorNames: {
      "Siyah": "Noir",
      "Beyaz": "Blanc",
      "Kahverengi": "Marron",
      "Kum Rengi (Fawn)": "Fauve",
      "Kızıl / Kırmızımsı": "Roux / Rougeâtre",
      "Gri": "Gris",
      "Sarı / Krem": "Jaune / Crème",
      "Sable (Kızıl-Siyah Karışık)": "Sable",
      "Siyah-Beyaz": "Noir & Blanc",
      "Kahverengi-Beyaz": "Marron & Blanc",
      "Üç Renkli (Tricolor)": "Tricolore",
      "Benekli (Merle)": "Merle",
      "Altın Sarısı": "Doré",
      "Diğer": "Autre",
    },
    deletePetModalTitle: (species) => (species === "cat" ? "Supprimer le Chat" : "Supprimer le Chien"),
    deletePetWarning: (name, species) =>
      `Vous êtes sur le point de supprimer définitivement le passeport, les vaccins et les vétérinaires assignés de ${name}. Cette action est irréversible.`,
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
    documentsTitle: "Documents",
    documentsSubtitle: (count) => `${count} documents téléversés`,
    addDocumentBtn: "Ajouter un Document",
    documentsEmpty: "Aucun document téléversé.",
    addDocumentModalTitle: "Ajouter un Document",
    fieldDocumentType: "Type de document",
    docTypeTravel: "Document de Voyage (Passeport UE)",
    docTypeInsurance: "Police d'Assurance",
    docTypeOwnership: "Certificat de Propriété",
    docTypeOther: "Autre",
    fieldDocumentLabel: "Nom du document",
    fieldDocumentFile: "Fichier",
    viewDocumentBtn: "Voir",
    saveBtn: "Enregistrer",
    labelApplication: "Administré",
    labelNextDose: "Prochaine Dose",
    labelVet: "Vétérinaire",
    labelBatch: "N° de Lot",
    statusOverdue: "EN RETARD",
    statusSoon: "BIENTÔT",
    statusCurrent: "À JOUR",
    vetTabTitle: "Attribution",
    vetTabSubtitle: (dogName) => `Assignez un vétérinaire principal et secondaire à ${dogName} parmi les vétérinaires de la plateforme.`,
    platformVetsLabel: "Vétérinaires de la Plateforme",
    makePrimaryBtn: "Définir Principal",
    makeSecondaryBtn: "Définir Secondaire",
    landingHeadline: "Toute la vie de votre animal, dans un seul passeport numérique.",
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
    forgotPasswordLink: "Mot de passe oublié ?",
    forgotPasswordTitle: "Réinitialiser votre Mot de Passe",
    forgotPasswordDesc: "Entrez votre e-mail enregistré, nous vous enverrons un lien de réinitialisation.",
    sendResetLinkBtn: "Envoyer le Lien",
    resetLinkSentTitle: "Lien Envoyé",
    resetLinkSentDesc: (email) => `Nous avons envoyé un lien de réinitialisation à ${email}. Vérifiez votre boîte de réception (et vos spams).`,
    fieldNewPassword: "Nouveau mot de passe",
    fieldConfirmNewPassword: "Confirmer le nouveau mot de passe",
    setNewPasswordBtn: "Mettre à Jour",
    resetPasswordScreenTitle: "Définir un Nouveau Mot de Passe",
    passwordUpdatedDesc: "Votre mot de passe a été mis à jour. Vous pouvez continuer.",
    continueBtn: "Continuer",
    verifyingSession: "Vérification…",
    greeting: (name) => `Bonjour, ${name}`,
    navHealth: "Santé",
    navDocuments: "Documents",
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
    navWeight: "Poids",
    weightTitle: "Poids & Croissance",
    weightSubtitle: (dogName, count) => `${count} mesures enregistrées pour ${dogName}`,
    fieldIdealWeight: "Poids idéal recommandé par le vétérinaire (kg)",
    saveIdealWeightBtn: "Enregistrer",
    addWeightBtn: "Ajouter une Mesure",
    weightEmpty: "Aucune mesure de poids. Ajoutez la première pour commencer.",
    addWeightModalTitle: "Ajouter une Mesure de Poids",
    fieldWeightDate: "Date de mesure",
    fieldWeightKg: "Poids (kg)",
    weightChartTitle: "Évolution du Poids",
    weightChartIdealLine: "Poids idéal",
    adminPanelTitle: "Panneau Admin",
    vetPortalTitle: "Portail Vétérinaire",
    adminStatsUsers: "Utilisateurs Totaux",
    adminStatsOwners: "Propriétaires",
    adminStatsVetAccounts: "Comptes Vétérinaires",
    adminStatsVetListings: "Vétérinaires Inscrits",
    adminStatsPendingRequests: "Attributions en Attente",
    adminStatsServiceProviders: "Prestataires de Services",
    addVetSectionTitle: "Créer un Nouveau Compte Professionnel",
    fieldBusinessType: "Type d'Activité",
    businessTypeNames: { vet: "Vétérinaire", groomer: "Toilettage / Soins" },
    myPatientsTitleFor: (type) => (type === "groomer" ? "Mes Clients" : "Mes Patients"),
    myPatientsSubtitleFor: (type, count) => (type === "groomer" ? `${count} clients approuvés` : `${count} patients approuvés`),
    todaysApptsTitle: "Rendez-vous d'Aujourd'hui",
    noApptsToday: "Aucun rendez-vous aujourd'hui.",
    quickSearchPlaceholder: "Rechercher patient, propriétaire ou puce…",
    createUserSectionTitle: "Créer un Nouvel Utilisateur",
    createUserSectionSubtitle: "Créez rapidement un compte de test avec e-mail + mot de passe, sans e-mail d'invitation.",
    createUserBtn: "Créer l'Utilisateur",
    userCreateSuccess: (email) => `Compte créé pour ${email}.`,
    changePasswordSectionTitle: "Changer le Mot de Passe d'un Utilisateur",
    fieldUserEmail: "E-mail de l'utilisateur",
    changePasswordBtn: "Changer le Mot de Passe",
    passwordChangedSuccess: "Mot de passe changé avec succès.",
    fieldClinicName: "Nom de la clinique",
    fieldVetCity: "Ville",
    fieldVetCountry: "Pays",
    fieldVetSpecialty: "Spécialité",
    fieldVetPhone: "Téléphone",
    selectVetSpecialty: "Choisir une spécialité",
    specialtyNames: {
      "İç Hastalıkları": "Médecine Interne",
      "Cerrahi": "Chirurgie",
      "Diş & Ağız Sağlığı": "Dentisterie",
      "Dermatoloji": "Dermatologie",
      "Kardiyoloji": "Cardiologie",
      "Ortopedi": "Orthopédie",
      "Göz Hastalıkları": "Ophtalmologie",
      "Onkoloji": "Oncologie",
      "Acil & Yoğun Bakım": "Urgences et Soins Intensifs",
      "Egzotik Hayvan Sağlığı": "Médecine des Animaux Exotiques",
      "Beslenme": "Nutrition",
      "Genel Bakım": "Soins Généraux",
    },
    fieldVetEmail: "E-mail du vétérinaire (invitation envoyée ici)",
    createVetAccountBtn: "Créer le Compte & Envoyer l'Invitation",
    vetInviteSuccess: (email) => `Invitation envoyée à ${email}.`,
    addServiceProviderSectionTitle: "Ajouter un Prestataire de Services",
    fieldServiceName: "Nom de l'entreprise",
    fieldServiceType: "Type de service",
    serviceTypeGrooming: "Toilettage",
    serviceTypeWalking: "Promenade de Chiens",
    serviceTypeTaxi: "Taxi pour Animaux",
    serviceTypeOther: "Autre",
    createServiceProviderBtn: "Ajouter l'Entreprise",
    serviceProviderAdded: "Entreprise ajoutée.",
    vetListSectionTitle: "Vétérinaires Enregistrés",
    activityLogsTitle: "Journaux d'Activité",
    fieldFilterByEmail: "Filtrer par e-mail",
    filterBtn: "Filtrer",
    clearFilterBtn: "Effacer",
    noLogsFound: "Aucun journal trouvé.",
    logColumnTime: "Heure",
    logColumnUser: "Utilisateur",
    logColumnAction: "Action",
    logColumnDetails: "Détails",
    vetPortalWelcome: (clinic) => `Bienvenue, ${clinic}`,
    pendingRequestsTitle: "Demandes d'Attribution en Attente",
    noPendingRequests: "Aucune demande en attente pour le moment.",
    approveBtn: "Approuver",
    rejectBtn: "Refuser",
    requestFrom: (dogName, role) => `Demande de vétérinaire ${role} pour ${dogName}`,
    myDoctorsTitle: "Mes Médecins",
    addDoctorBtn: "Ajouter un Médecin",
    fieldDoctorName: "Nom du médecin",
    fieldDoctorTitle: "Titre",
    noDoctors: "Aucun médecin ajouté.",
    myServicesTitle: "Mes Services",
    addServiceBtn: "Ajouter un Service",
    fieldServiceNameShort: "Nom du service",
    fieldServicePrice: "Prix",
    fieldServiceDuration: "Durée",
    durationMinutesLabel: (m) => (m < 60 ? `${m} min` : m === 60 ? "1 h" : `${Math.floor(m / 60)}h${m % 60 || ""}`.trim()),
    selectServiceType: "Choisir un service",
    serviceNames: {
      "Muayene": "Consultation",
      "Aşılama": "Vaccination",
      "Kısırlaştırma": "Stérilisation/Castration",
      "Diş Temizliği": "Nettoyage Dentaire",
      "Röntgen": "Radiographie",
      "Kan Tahlili": "Analyse de Sang",
      "Ameliyat": "Chirurgie",
      "Ultrason": "Échographie",
      "Mikroçip Takma": "Puce Électronique",
      "Tırnak Kesimi": "Coupe des Griffes",
      "Yıkama & Tıraş": "Toilettage",
      "Ev Ziyareti": "Visite à Domicile",
      "Acil Müdahale": "Soins d'Urgence",
      "Laboratuvar Testi": "Test de Laboratoire",
      "Diğer": "Autre",
    },
    doctorTitleNames: {
      "Veteriner Hekim": "Vétérinaire",
      "Klinik Şefi": "Chef de Clinique",
      "Uzman Veteriner Hekim": "Vétérinaire Spécialiste",
      "Cerrah": "Chirurgien",
      "Baş Veteriner": "Vétérinaire en Chef",
      "Asistan Veteriner": "Vétérinaire Assistant",
      "Stajyer": "Stagiaire",
      "Veteriner Teknisyeni": "Technicien Vétérinaire",
    },
    editVaccineModalTitle: "Modifier le Vaccin",
    editHealthRecordModalTitle: "Modifier la Note de Santé",
    vaccineConfirmedCheckbox: "Ce vaccin a été administré",
    notYetGivenLabel: "Pas Encore Administré",
    markAsDoneBtn: "Marquer comme Fait",
    markAsNotDoneBtn: "Marquer comme Non Fait",
    addMedicationForPatientBtn: "Prescrire un Médicament",
    availabilityTitle: "Horaires de Disponibilité",
    availabilitySubtitle: "Définissez les jours et heures où les patients peuvent prendre rendez-vous.",
    availabilityBreakHint: "Ajoutez deux créneaux séparés le même jour pour inclure une pause (ex. 9h-12h et 14h-18h).",
    blockSlotBtn: "Bloquer ce Créneau",
    blockSlotTitle: "Rendez-vous Hors Application",
    blockSlotSubtitle: "Enregistrez un rendez-vous pris par téléphone ou en personne pour bloquer ce créneau.",
    blockSlotNotePlaceholder: "Nom du client / note (facultatif)",
    blockSlotSuccessMsg: "Créneau bloqué.",
    vetTabDashboard: "Tableau de Bord",
    vetTabAppointments: "Rendez-vous",
    vetTabTeam: "Équipe & Services",
    vetTabSettings: "Infos de la Clinique",
    ownerInfoSection: "Informations du Propriétaire",
    periodToday: "Aujourd'hui",
    periodWeek: "Cette Semaine",
    periodMonth: "Ce Mois",
    serviceBreakdownTitle: "Par Service",
    dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    fieldStartTime: "Début",
    fieldEndTime: "Fin",
    addAvailabilityBtn: "Ajouter un Créneau",
    noAvailabilitySet: "Aucune disponibilité définie.",
    myAppointmentsTitle: "Mes Rendez-vous",
    noAppointmentsYet: "Aucun rendez-vous pour le moment.",
    apptStatusBooked: "Planifié",
    apptStatusCompleted: "Terminé",
    apptStatusCancelled: "Annulé",
    apptStatusRescheduled: "Replanifié",
    offAppApptSectionTitle: "Rendez-vous Hors Application",
    allAppointmentsTitle: "Tous les Rendez-vous",
    colApptDate: "Date du RDV",
    colApptTimeRange: "Plage Horaire",
    colCustomerName: "Nom du Client",
    colPetName: "Nom de l'Animal",
    colService: "Service",
    colApptType: "Type de RDV",
    colStatus: "Statut",
    colDetails: "Détails",
    apptTypeOnApp: "Dans l'App",
    apptTypeOffApp: "Hors App",
    noAppointmentsInTable: "Aucun rendez-vous pour le moment.",
    apptDetailTitle: "Détails du Rendez-vous",
    cancelActionBtn: "Annuler",
    rescheduleActionBtn: "Replanifier",
    doneActionBtn: "Terminé",
    statusNoteLabel: "Note",
    statusNotePlaceholder: "Note sur le patient/client…",
    confirmActionBtn: "Confirmer",
    newDateLabel: "Nouvelle Date",
    rescheduleSuccessMsg: "Rendez-vous replanifié.",
    cancelSuccessMsg: "Rendez-vous annulé.",
    doneSuccessMsg: "Rendez-vous marqué comme terminé.",
    markCompletedBtn: "Marquer Terminé",
    cancelApptBtn: "Annuler",
    bookApptBtn: "Prendre Rendez-vous",
    selectDateLabel: "Choisir une Date",
    selectTimeLabel: "Choisir une Heure",
    noSlotsAvailable: "Aucun créneau disponible à cette date.",
    confirmBookingBtn: "Confirmer le Rendez-vous",
    bookingSuccessMsg: "Votre rendez-vous est confirmé !",
    slotTakenErrorMsg: "Ce créneau vient d'être pris, veuillez en choisir un autre.",
    vetBookedApptBadge: "Rendez-vous Confirmé par le Vétérinaire",
    apptNoteLabel: "Note (facultatif)",
    loadingSlotsText: "Chargement des créneaux disponibles…",
    noBookableVets: "Aucun vétérinaire n'a encore défini de disponibilité.",
    groomerSpecialtyNames: {
      "Yıkama & Tıraş": "Bain & Tonte",
      "Tırnak Bakımı": "Soin des Griffes",
      "Kulak & Göz Temizliği": "Nettoyage Oreilles & Yeux",
      "Diş Bakımı": "Soin Dentaire",
      "Deri & Tüy Bakımı": "Soin de la Peau & du Pelage",
      "Irk Bazlı Kesim": "Coupe par Race",
      "Parazit Kontrolü": "Contrôle des Parasites",
      "Spa & Masaj": "Spa & Massage",
      "Genel Bakım": "Soin Général",
    },
    groomerStaffTitleNames: {
      "Kuaför": "Toiletteur",
      "Şef Kuaför": "Toiletteur en Chef",
      "Bakım Uzmanı": "Spécialiste Soins",
      "Yardımcı Personel": "Personnel Auxiliaire",
      "Stajyer": "Stagiaire",
    },
    myTeamTitleFor: (type) => (type === "groomer" ? "Mon Équipe" : "Mes Vétérinaires"),
    fieldEmployeeTitleFor: (type) => (type === "groomer" ? "Rôle" : "Titre"),
    fieldEmployeeNameFor: (type) => (type === "groomer" ? "Nom de l'employé" : "Nom du vétérinaire"),
    noTeamMembersFor: (type) => (type === "groomer" ? "Aucun employé ajouté." : "Aucun vétérinaire ajouté."),
    vaccineNames: {
      "Kuduz / Rabies": "Rage",
      "Karma (DHPPi)": "CHPPI (Combiné)",
      "Leptospiroz": "Leptospirose",
      "Bordetella (Kennel Cough)": "Toux du Chenil (Bordetella)",
      "Leishmania": "Leishmaniose",
      "Corona virüsü": "Coronavirus Canin",
      "Karma (FVRCP)": "Typhus/Coryza (FVRCP)",
      "Lösemi (FeLV)": "Leucose Féline (FeLV)",
      "FIV Testi": "Test FIV",
      "Klamidya (Chlamydia)": "Chlamydiose",
      "Bordetella": "Bordetella",
      "Diğer": "Autre",
    },
    noServices: "Aucun service ajouté.",
    clinicInfoTitle: "Infos de la Clinique",
    myPatientsTitle: "Mes Patients",
    addVaccineForPatientBtn: "Ajouter un Vaccin",
    addHealthNoteForPatientBtn: "Ajouter une Note de Santé",
    addedByVetLabel: (clinic) => `Ajouté par ${clinic}`,
    vetRecordSuccess: "Enregistrement ajouté au dossier du patient.",
    myPatientsSubtitle: (count) => `${count} patients approuvés`,
    noPatientsYet: "Aucun patient approuvé pour le moment.",
    viewPatientBtn: "Voir",
    patientDetailTitle: (name) => `${name} — Dossier Patient`,
    closeBtn: "Fermer",
    maxSpecialtiesNote: (max) => `jusqu'à ${max}`,
    commercialInfoTitle: "Informations Commerciales",
    bankInfoTitle: "Coordonnées Bancaires",
    fieldWebsite: "Site Web",
    uploadLogo: "Télécharger le logo",
    changeLogo: "Changer le logo",
    viewDetailsBtn: "Voir les Détails",
    vetServicesTitle: "Services Proposés",
    noServicesListed: "Aucun service répertorié.",
    websiteLabel: "Site Web",
    fieldLegalBusinessName: "Raison Sociale",
    fieldTaxId: "Numéro d'Identification Fiscale",
    fieldClinicAddress: "Adresse Complète",
    fieldTradeRegistryDoc: "Extrait Kbis / Registre du Commerce",
    fieldIban: "IBAN",
    fieldSwiftCode: "Code SWIFT",
    fieldBankName: "Nom de la Banque",
    fieldAccountHolderName: "Nom du Titulaire du Compte",
    saveClinicInfoBtn: "Enregistrer",
    approvedByLabel: "Approuvé par",
    assignedVetsTitle: "Vétérinaires Assignés",
    navPetCV: "CV",
    petCvTitle: (name) => `${name} — Résumé (CV)`,
    petCvSubtitle: "Un résumé de toutes les informations de passeport, santé, vaccins et vétérinaire",
    downloadPdfBtn: "Télécharger en PDF",
    cvIdentitySection: "Informations d'Identité",
    cvHealthSection: "Profil de Santé",
    cvVaccinesSection: "Historique des Vaccins",
    cvWeightSection: "Poids",
    cvVetSection: "Vétérinaires Assignés",
    cvNoVaccines: "Aucun vaccin enregistré.",
    cvNoVet: "Aucune attribution vétérinaire approuvée.",
    cvCurrentWeight: "Poids Actuel",
    cvIdealWeight: "Poids Idéal",
    cvNoWeight: "Aucune mesure de poids.",
    cvGeneratedOn: (date) => `Généré le ${date}`,
    pendingApprovalBadge: "EN ATTENTE",
    rejectedBadge: "REFUSÉ",
    cancelRequestBtn: "Annuler",
    enableNotificationsBtn: "Activer les Notifications",
    notificationsEnabled: "Notifications activées",
    notificationPermissionDenied: "Autorisation refusée. Vous pouvez l'activer dans les paramètres du navigateur.",
    notificationsUnsupported: "Ce navigateur ne prend pas en charge les notifications push.",
    premiumBadge: "Premium",
    upgradeBtn: "Passer à Premium",
    manageSubscriptionBtn: "Gérer l'Abonnement",
    premiumModalTitle: "Paw Wallet Premium",
    premiumModalSubtitle: "Tous vos animaux, tous vos vétérinaires, documents illimités.",
    billingMonthly: "Mensuel",
    billingYearly: "Annuel",
    billingYearlyBadge: "Économisez 30%",
    priceMonthly: "2,99€/mois",
    priceYearly: "24,99€/an",
    premiumFeature1: "Ajouter des animaux illimités",
    premiumFeature2: "Assigner un vétérinaire secondaire",
    premiumFeature3: "Téléversement de documents illimité",
    premiumFeature4: "CV animal / téléchargement PDF",
    subscribeBtn: "S'abonner",
    freePlanLabel: "Plan Gratuit",
    premiumPlanLabel: "Plan Premium",
    limitReachedPets: "Vous pouvez ajouter 1 animal avec le plan gratuit. Passez à Premium pour plus.",
    limitReachedVet: "L'assignation d'un vétérinaire secondaire est une fonctionnalité Premium.",
    limitReachedDocs: "Vous pouvez téléverser jusqu'à 3 documents avec le plan gratuit.",
    limitReachedCv: "Le CV animal et le téléchargement PDF sont des fonctionnalités Premium.",
    seePremiumBtn: "Voir Premium",
    redirectingToStripe: "Redirection vers le paiement…",
  },
  de: {
    speciesLabel: { dog: "Hund", cat: "Katze" },
    tagline: "Der digitale Pass Ihres Haustiers",
    navPassport: "Reisepass",
    navVaccines: "Impfausweis",
    navVets: "Gesundheit & Pflege",
    addNewDogItem: "Neuen Hund hinzufügen",
    addNewCatItem: "Neue Katze hinzufügen",
    noDogsTitle: "Noch kein Haustier hinzugefügt",
    noDogsText: "Erstellen Sie den Pass Ihres Haustiers — Identitätsdaten, QR-Code und mehr werden automatisch vorbereitet.",
    addFirstDog: "Ersten Hund Hinzufügen",
    addFirstCat: "Erste Katze Hinzufügen",
    footerNote: "Phase-1-Vorschau — Reisepass, Impfausweis, Tierarztzuweisung. Daten werden in Supabase gespeichert.",
    addPetModalTitle: (species) => (species === "cat" ? "Neue Katze Hinzufügen" : "Neuen Hund Hinzufügen"),
    editPetModalTitle: (species) => (species === "cat" ? "Katzendaten Bearbeiten" : "Hundedaten Bearbeiten"),
    uploadPhoto: "Foto hochladen",
    changePhoto: "Foto ändern",
    fieldPetName: (species) => (species === "cat" ? "Name der Katze" : "Name des Hundes"),
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
    fieldNeutered: "Kastriert / Sterilisiert?",
    rowNeutered: "Kastrationsstatus",
    neuteredYes: "Ja",
    neuteredNo: "Nein",
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
    verifiedIdentityLabel: "VERIFIZIERTE IDENTITÄT",
    scannableIdDesc: (name) => `Beim Scannen werden die Identitäts- und Kontaktdaten von ${name} sofort angezeigt.`,
    scanToReach: "Bei Verlust scannen & kontaktieren",
    lostPetCardBadge: (species) => (species === "cat" ? "Diese Katze gefunden?" : "Diesen Hund gefunden?"),
    lostPetCardTitle: (name) => `Ausweis von ${name}`,
    lostPetCardDesc: (species) =>
      species === "cat"
        ? "Der Besitzer dieser Katze nutzt Paw Wallet. Sie können ihn unten kontaktieren."
        : "Der Besitzer dieses Hundes nutzt Paw Wallet. Sie können ihn unten kontaktieren.",
    callOwnerBtn: "Besitzer Anrufen",
    callEmergencyBtn: "Notfallkontakt Anrufen",
    lostCardNotFound: (species) => (species === "cat" ? "Kein Eintrag für diese Katze gefunden." : "Kein Eintrag für diesen Hund gefunden."),
    lostCardFooter: "Erstellt mit Paw Wallet",
    breedMixedOption: "Mischling / Unbekannt",
    breedOtherOption: "Andere",
    colorNames: {
      "Siyah": "Schwarz",
      "Beyaz": "Weiß",
      "Kahverengi": "Braun",
      "Kum Rengi (Fawn)": "Falbfarben",
      "Kızıl / Kırmızımsı": "Rot / Rötlich",
      "Gri": "Grau",
      "Sarı / Krem": "Gelb / Creme",
      "Sable (Kızıl-Siyah Karışık)": "Sable",
      "Siyah-Beyaz": "Schwarz-Weiß",
      "Kahverengi-Beyaz": "Braun-Weiß",
      "Üç Renkli (Tricolor)": "Dreifarbig",
      "Benekli (Merle)": "Merle",
      "Altın Sarısı": "Golden",
      "Diğer": "Andere",
    },
    deletePetModalTitle: (species) => (species === "cat" ? "Katze Löschen" : "Hund Löschen"),
    deletePetWarning: (name, species) =>
      `Sie sind dabei, den Pass, die Impfdaten und die Tierarztzuweisungen von ${name} dauerhaft zu löschen. Dies kann nicht rückgängig gemacht werden.`,
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
    documentsTitle: "Dokumente",
    documentsSubtitle: (count) => `${count} Dokumente hochgeladen`,
    addDocumentBtn: "Dokument Hinzufügen",
    documentsEmpty: "Noch keine Dokumente hochgeladen.",
    addDocumentModalTitle: "Dokument Hinzufügen",
    fieldDocumentType: "Dokumenttyp",
    docTypeTravel: "Reisedokument (EU-Heimtierausweis)",
    docTypeInsurance: "Versicherungspolice",
    docTypeOwnership: "Eigentumsnachweis",
    docTypeOther: "Andere",
    fieldDocumentLabel: "Dokumentname",
    fieldDocumentFile: "Datei",
    viewDocumentBtn: "Ansehen",
    saveBtn: "Speichern",
    labelApplication: "Verabreicht",
    labelNextDose: "Nächste Dosis",
    labelVet: "Tierarzt",
    labelBatch: "Charge Nr.",
    statusOverdue: "ÜBERFÄLLIG",
    statusSoon: "BALD FÄLLIG",
    statusCurrent: "AKTUELL",
    vetTabTitle: "Zuweisung",
    vetTabSubtitle: (dogName) => `Weisen Sie ${dogName} einen primären und sekundären Tierarzt aus der Plattform zu.`,
    platformVetsLabel: "Plattform-Tierärzte",
    makePrimaryBtn: "Als Primär Festlegen",
    makeSecondaryBtn: "Als Sekundär Festlegen",
    landingHeadline: "Das ganze Leben Ihres Haustiers in einem digitalen Pass.",
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
    forgotPasswordLink: "Passwort vergessen?",
    forgotPasswordTitle: "Passwort Zurücksetzen",
    forgotPasswordDesc: "Geben Sie Ihre registrierte E-Mail ein, wir senden Ihnen einen Link zum Zurücksetzen.",
    sendResetLinkBtn: "Link Senden",
    resetLinkSentTitle: "Link Gesendet",
    resetLinkSentDesc: (email) => `Wir haben einen Link zum Zurücksetzen an ${email} gesendet. Prüfen Sie Ihr Postfach (und den Spam-Ordner).`,
    fieldNewPassword: "Neues Passwort",
    fieldConfirmNewPassword: "Neues Passwort bestätigen",
    setNewPasswordBtn: "Passwort Aktualisieren",
    resetPasswordScreenTitle: "Neues Passwort Festlegen",
    passwordUpdatedDesc: "Ihr Passwort wurde aktualisiert. Sie können jetzt fortfahren.",
    continueBtn: "Weiter",
    verifyingSession: "Wird überprüft…",
    greeting: (name) => `Hallo, ${name}`,
    navHealth: "Gesundheit",
    navDocuments: "Dokumente",
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
    navWeight: "Gewicht",
    weightTitle: "Gewicht & Wachstum",
    weightSubtitle: (dogName, count) => `${count} Messungen für ${dogName}`,
    fieldIdealWeight: "Vom Tierarzt empfohlenes Idealgewicht (kg)",
    saveIdealWeightBtn: "Speichern",
    addWeightBtn: "Messung Hinzufügen",
    weightEmpty: "Noch keine Gewichtsmessungen. Fügen Sie die erste hinzu.",
    addWeightModalTitle: "Gewichtsmessung Hinzufügen",
    fieldWeightDate: "Messdatum",
    fieldWeightKg: "Gewicht (kg)",
    weightChartTitle: "Gewichtsverlauf",
    weightChartIdealLine: "Idealgewicht",
    adminPanelTitle: "Admin-Panel",
    vetPortalTitle: "Tierarzt-Portal",
    adminStatsUsers: "Nutzer Gesamt",
    adminStatsOwners: "Haustierbesitzer",
    adminStatsVetAccounts: "Tierarztkonten",
    adminStatsVetListings: "Registrierte Tierärzte",
    adminStatsPendingRequests: "Ausstehende Zuweisungen",
    adminStatsServiceProviders: "Dienstleister",
    addVetSectionTitle: "Neues Geschäftskonto Erstellen",
    fieldBusinessType: "Geschäftsart",
    businessTypeNames: { vet: "Tierarzt", groomer: "Hundesalon / Pflege" },
    myPatientsTitleFor: (type) => (type === "groomer" ? "Meine Kunden" : "Meine Patienten"),
    myPatientsSubtitleFor: (type, count) => (type === "groomer" ? `${count} genehmigte Kunden` : `${count} genehmigte Patienten`),
    todaysApptsTitle: "Heutige Termine",
    noApptsToday: "Heute keine Termine.",
    quickSearchPlaceholder: "Patient, Besitzer oder Mikrochip suchen…",
    createUserSectionTitle: "Neuen Benutzer Erstellen",
    createUserSectionSubtitle: "Erstellen Sie schnell ein Testkonto mit E-Mail + Passwort, ohne Einladungs-E-Mail.",
    createUserBtn: "Benutzer Erstellen",
    userCreateSuccess: (email) => `Konto für ${email} erstellt.`,
    changePasswordSectionTitle: "Benutzerpasswort Ändern",
    fieldUserEmail: "E-Mail des Benutzers",
    changePasswordBtn: "Passwort Ändern",
    passwordChangedSuccess: "Passwort erfolgreich geändert.",
    fieldClinicName: "Klinikname",
    fieldVetCity: "Stadt",
    fieldVetCountry: "Land",
    fieldVetSpecialty: "Spezialisierung",
    fieldVetPhone: "Telefon",
    selectVetSpecialty: "Fachgebiet wählen",
    specialtyNames: {
      "İç Hastalıkları": "Innere Medizin",
      "Cerrahi": "Chirurgie",
      "Diş & Ağız Sağlığı": "Zahnmedizin",
      "Dermatoloji": "Dermatologie",
      "Kardiyoloji": "Kardiologie",
      "Ortopedi": "Orthopädie",
      "Göz Hastalıkları": "Augenheilkunde",
      "Onkoloji": "Onkologie",
      "Acil & Yoğun Bakım": "Notfall- und Intensivmedizin",
      "Egzotik Hayvan Sağlığı": "Exotenmedizin",
      "Beslenme": "Ernährung",
      "Genel Bakım": "Allgemeinmedizin",
    },
    fieldVetEmail: "E-Mail des Tierarztes (Einladung geht hierhin)",
    createVetAccountBtn: "Konto Erstellen & Einladung Senden",
    vetInviteSuccess: (email) => `Einladung an ${email} gesendet.`,
    addServiceProviderSectionTitle: "Dienstleister Hinzufügen",
    fieldServiceName: "Firmenname",
    fieldServiceType: "Dienstleistungsart",
    serviceTypeGrooming: "Fellpflege",
    serviceTypeWalking: "Hundespaziergang",
    serviceTypeTaxi: "Tiertaxi",
    serviceTypeOther: "Andere",
    createServiceProviderBtn: "Firma Hinzufügen",
    serviceProviderAdded: "Firma hinzugefügt.",
    vetListSectionTitle: "Registrierte Tierärzte",
    activityLogsTitle: "Aktivitätsprotokolle",
    fieldFilterByEmail: "Nach E-Mail filtern",
    filterBtn: "Filtern",
    clearFilterBtn: "Löschen",
    noLogsFound: "Keine Protokolle gefunden.",
    logColumnTime: "Zeit",
    logColumnUser: "Benutzer",
    logColumnAction: "Aktion",
    logColumnDetails: "Details",
    vetPortalWelcome: (clinic) => `Willkommen, ${clinic}`,
    pendingRequestsTitle: "Ausstehende Zuweisungsanfragen",
    noPendingRequests: "Derzeit keine ausstehenden Anfragen.",
    approveBtn: "Genehmigen",
    rejectBtn: "Ablehnen",
    requestFrom: (dogName, role) => `${role} Tierarztanfrage für ${dogName}`,
    myDoctorsTitle: "Meine Ärzte",
    addDoctorBtn: "Arzt Hinzufügen",
    fieldDoctorName: "Name des Arztes",
    fieldDoctorTitle: "Titel",
    noDoctors: "Noch keine Ärzte hinzugefügt.",
    myServicesTitle: "Meine Dienstleistungen",
    addServiceBtn: "Dienstleistung Hinzufügen",
    fieldServiceNameShort: "Name der Dienstleistung",
    fieldServicePrice: "Preis",
    fieldServiceDuration: "Dauer",
    durationMinutesLabel: (m) => (m < 60 ? `${m} Min` : m === 60 ? "1 Std" : `${Math.floor(m / 60)}Std ${m % 60 || ""}${m % 60 ? "Min" : ""}`.trim()),
    selectServiceType: "Dienstleistung wählen",
    serviceNames: {
      "Muayene": "Beratung",
      "Aşılama": "Impfung",
      "Kısırlaştırma": "Kastration/Sterilisation",
      "Diş Temizliği": "Zahnreinigung",
      "Röntgen": "Röntgen",
      "Kan Tahlili": "Bluttest",
      "Ameliyat": "Operation",
      "Ultrason": "Ultraschall",
      "Mikroçip Takma": "Mikrochip-Implantation",
      "Tırnak Kesimi": "Krallenschneiden",
      "Yıkama & Tıraş": "Fellpflege",
      "Ev Ziyareti": "Hausbesuch",
      "Acil Müdahale": "Notfallversorgung",
      "Laboratuvar Testi": "Labortest",
      "Diğer": "Andere",
    },
    doctorTitleNames: {
      "Veteriner Hekim": "Tierarzt",
      "Klinik Şefi": "Klinikleiter",
      "Uzman Veteriner Hekim": "Fachtierarzt",
      "Cerrah": "Chirurg",
      "Baş Veteriner": "Chefarzt",
      "Asistan Veteriner": "Assistenztierarzt",
      "Stajyer": "Praktikant",
      "Veteriner Teknisyeni": "Tiermedizinischer Techniker",
    },
    editVaccineModalTitle: "Impfeintrag Bearbeiten",
    editHealthRecordModalTitle: "Gesundheitsnotiz Bearbeiten",
    vaccineConfirmedCheckbox: "Diese Impfung wurde verabreicht",
    notYetGivenLabel: "Noch Nicht Verabreicht",
    markAsDoneBtn: "Als Erledigt Markieren",
    markAsNotDoneBtn: "Als Nicht Erledigt Markieren",
    addMedicationForPatientBtn: "Medikament Verschreiben",
    availabilityTitle: "Verfügbarkeitsplan",
    availabilitySubtitle: "Legen Sie fest, an welchen Tagen und Uhrzeiten Patienten Termine buchen können.",
    availabilityBreakHint: "Fügen Sie zwei separate Zeiträume für denselben Tag hinzu, um eine Pause einzuschließen (z.B. 9:00-12:00 und 14:00-18:00).",
    blockSlotBtn: "Diese Zeit Blockieren",
    blockSlotTitle: "Termin Außerhalb der App",
    blockSlotSubtitle: "Erfassen Sie einen telefonisch oder persönlich vereinbarten Termin, um diese Zeit zu blockieren.",
    blockSlotNotePlaceholder: "Kundenname / Notiz (optional)",
    blockSlotSuccessMsg: "Zeitfenster blockiert.",
    vetTabDashboard: "Übersicht",
    vetTabAppointments: "Termine",
    vetTabTeam: "Team & Dienstleistungen",
    vetTabSettings: "Klinikinformationen",
    ownerInfoSection: "Besitzerinformationen",
    periodToday: "Heute",
    periodWeek: "Diese Woche",
    periodMonth: "Diesen Monat",
    serviceBreakdownTitle: "Nach Dienstleistung",
    dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    fieldStartTime: "Start",
    fieldEndTime: "Ende",
    addAvailabilityBtn: "Zeitblock Hinzufügen",
    noAvailabilitySet: "Noch keine Verfügbarkeit festgelegt.",
    myAppointmentsTitle: "Meine Termine",
    noAppointmentsYet: "Noch keine Termine.",
    apptStatusBooked: "Geplant",
    apptStatusCompleted: "Erledigt",
    apptStatusCancelled: "Storniert",
    apptStatusRescheduled: "Verschoben",
    offAppApptSectionTitle: "Termin Außerhalb der App",
    allAppointmentsTitle: "Alle Termine",
    colApptDate: "Termindatum",
    colApptTimeRange: "Zeitraum",
    colCustomerName: "Kundenname",
    colPetName: "Tiername",
    colService: "Dienstleistung",
    colApptType: "Terminart",
    colStatus: "Status",
    colDetails: "Details",
    apptTypeOnApp: "In der App",
    apptTypeOffApp: "Außerhalb der App",
    noAppointmentsInTable: "Noch keine Termine.",
    apptDetailTitle: "Termindetails",
    cancelActionBtn: "Stornieren",
    rescheduleActionBtn: "Verschieben",
    doneActionBtn: "Erledigt",
    statusNoteLabel: "Notiz",
    statusNotePlaceholder: "Notiz zum Patienten/Kunden…",
    confirmActionBtn: "Bestätigen",
    newDateLabel: "Neues Datum",
    rescheduleSuccessMsg: "Termin verschoben.",
    cancelSuccessMsg: "Termin storniert.",
    doneSuccessMsg: "Termin als erledigt markiert.",
    markCompletedBtn: "Als Abgeschlossen Markieren",
    cancelApptBtn: "Stornieren",
    bookApptBtn: "Termin Buchen",
    selectDateLabel: "Datum Wählen",
    selectTimeLabel: "Uhrzeit Wählen",
    noSlotsAvailable: "An diesem Tag sind keine Termine verfügbar.",
    confirmBookingBtn: "Buchung Bestätigen",
    bookingSuccessMsg: "Ihr Termin wurde gebucht!",
    slotTakenErrorMsg: "Dieser Termin wurde gerade vergeben, bitte wählen Sie einen anderen.",
    vetBookedApptBadge: "Vom Tierarzt Bestätigter Termin",
    apptNoteLabel: "Notiz (optional)",
    loadingSlotsText: "Verfügbare Zeiten werden geladen…",
    noBookableVets: "Noch kein Tierarzt hat eine Verfügbarkeit festgelegt.",
    groomerSpecialtyNames: {
      "Yıkama & Tıraş": "Baden & Trimmen",
      "Tırnak Bakımı": "Krallenpflege",
      "Kulak & Göz Temizliği": "Ohren- & Augenreinigung",
      "Diş Bakımı": "Zahnpflege",
      "Deri & Tüy Bakımı": "Haut- & Fellpflege",
      "Irk Bazlı Kesim": "Rassespezifischer Schnitt",
      "Parazit Kontrolü": "Parasitenkontrolle",
      "Spa & Masaj": "Spa & Massage",
      "Genel Bakım": "Allgemeine Pflege",
    },
    groomerStaffTitleNames: {
      "Kuaför": "Hundefriseur",
      "Şef Kuaför": "Chef-Hundefriseur",
      "Bakım Uzmanı": "Pflegespezialist",
      "Yardımcı Personel": "Hilfspersonal",
      "Stajyer": "Praktikant",
    },
    myTeamTitleFor: (type) => (type === "groomer" ? "Mein Team" : "Meine Tierärzte"),
    fieldEmployeeTitleFor: (type) => (type === "groomer" ? "Rolle" : "Titel"),
    fieldEmployeeNameFor: (type) => (type === "groomer" ? "Name des Mitarbeiters" : "Name des Tierarztes"),
    noTeamMembersFor: (type) => (type === "groomer" ? "Noch keine Mitarbeiter hinzugefügt." : "Noch keine Tierärzte hinzugefügt."),
    vaccineNames: {
      "Kuduz / Rabies": "Tollwut",
      "Karma (DHPPi)": "Mehrfachimpfung (DHPPi)",
      "Leptospiroz": "Leptospirose",
      "Bordetella (Kennel Cough)": "Zwingerhusten (Bordetella)",
      "Leishmania": "Leishmaniose",
      "Corona virüsü": "Canines Coronavirus",
      "Karma (FVRCP)": "Katzenschnupfen-Kombi (FVRCP)",
      "Lösemi (FeLV)": "Katzenleukose (FeLV)",
      "FIV Testi": "FIV-Test",
      "Klamidya (Chlamydia)": "Chlamydien",
      "Bordetella": "Bordetella",
      "Diğer": "Andere",
    },
    noServices: "Noch keine Dienstleistungen hinzugefügt.",
    clinicInfoTitle: "Klinikinformationen",
    myPatientsTitle: "Meine Patienten",
    addVaccineForPatientBtn: "Impfung Hinzufügen",
    addHealthNoteForPatientBtn: "Gesundheitsnotiz Hinzufügen",
    addedByVetLabel: (clinic) => `Hinzugefügt von ${clinic}`,
    vetRecordSuccess: "Eintrag zur Patientenakte hinzugefügt.",
    myPatientsSubtitle: (count) => `${count} genehmigte Patienten`,
    noPatientsYet: "Noch keine genehmigten Patienten.",
    viewPatientBtn: "Ansehen",
    patientDetailTitle: (name) => `${name} — Patientenakte`,
    closeBtn: "Schließen",
    maxSpecialtiesNote: (max) => `max. ${max}`,
    commercialInfoTitle: "Geschäftsinformationen",
    bankInfoTitle: "Bankverbindung",
    fieldWebsite: "Webseite",
    uploadLogo: "Logo hochladen",
    changeLogo: "Logo ändern",
    viewDetailsBtn: "Details Ansehen",
    vetServicesTitle: "Angebotene Dienstleistungen",
    noServicesListed: "Noch keine Dienstleistungen gelistet.",
    websiteLabel: "Webseite",
    fieldLegalBusinessName: "Offizieller Firmenname",
    fieldTaxId: "Steuernummer",
    fieldClinicAddress: "Vollständige Adresse",
    fieldTradeRegistryDoc: "Handelsregisterauszug",
    fieldIban: "IBAN",
    fieldSwiftCode: "SWIFT-Code",
    fieldBankName: "Bankname",
    fieldAccountHolderName: "Kontoinhaber",
    saveClinicInfoBtn: "Informationen Speichern",
    approvedByLabel: "Genehmigt von",
    assignedVetsTitle: "Zugewiesene Tierärzte",
    navPetCV: "CV",
    petCvTitle: (name) => `${name} — Übersicht (CV)`,
    petCvSubtitle: "Eine Zusammenfassung aller Pass-, Gesundheits-, Impf- und Tierarztinformationen",
    downloadPdfBtn: "Als PDF Herunterladen",
    cvIdentitySection: "Identitätsdaten",
    cvHealthSection: "Gesundheitsprofil",
    cvVaccinesSection: "Impfhistorie",
    cvWeightSection: "Gewicht",
    cvVetSection: "Zugewiesene Tierärzte",
    cvNoVaccines: "Keine Impfungen erfasst.",
    cvNoVet: "Keine genehmigte Tierarztzuweisung.",
    cvCurrentWeight: "Aktuelles Gewicht",
    cvIdealWeight: "Idealgewicht",
    cvNoWeight: "Keine Gewichtsmessungen.",
    cvGeneratedOn: (date) => `Erstellt am ${date}`,
    pendingApprovalBadge: "GENEHMIGUNG AUSSTEHEND",
    rejectedBadge: "ABGELEHNT",
    cancelRequestBtn: "Abbrechen",
    enableNotificationsBtn: "Benachrichtigungen Aktivieren",
    notificationsEnabled: "Benachrichtigungen aktiv",
    notificationPermissionDenied: "Berechtigung verweigert. Sie können sie in den Browsereinstellungen aktivieren.",
    notificationsUnsupported: "Dieser Browser unterstützt keine Push-Benachrichtigungen.",
    premiumBadge: "Premium",
    upgradeBtn: "Auf Premium Upgraden",
    manageSubscriptionBtn: "Abo Verwalten",
    premiumModalTitle: "Paw Wallet Premium",
    premiumModalSubtitle: "Alle Haustiere, alle Tierärzte, unbegrenzte Dokumente.",
    billingMonthly: "Monatlich",
    billingYearly: "Jährlich",
    billingYearlyBadge: "30% sparen",
    priceMonthly: "2,99€/Monat",
    priceYearly: "24,99€/Jahr",
    premiumFeature1: "Unbegrenzt Haustiere hinzufügen",
    premiumFeature2: "Zweiten Tierarzt zuweisen",
    premiumFeature3: "Unbegrenzter Dokumenten-Upload",
    premiumFeature4: "Haustier-CV / PDF-Download",
    subscribeBtn: "Abonnieren",
    freePlanLabel: "Kostenloser Plan",
    premiumPlanLabel: "Premium-Plan",
    limitReachedPets: "Im kostenlosen Plan kannst du 1 Haustier hinzufügen. Upgrade auf Premium für mehr.",
    limitReachedVet: "Die Zuweisung eines zweiten Tierarztes ist eine Premium-Funktion.",
    limitReachedDocs: "Im kostenlosen Plan kannst du bis zu 3 Dokumente hochladen.",
    limitReachedCv: "Haustier-CV und PDF-Download sind Premium-Funktionen.",
    seePremiumBtn: "Premium Ansehen",
    redirectingToStripe: "Sie werden zur Kasse weitergeleitet…",
  },
  es: {
    speciesLabel: { dog: "Perro", cat: "Gato" },
    tagline: "El pasaporte digital de tu mascota",
    navPassport: "Pasaporte",
    navVaccines: "Cartilla de Vacunas",
    navVets: "Salud & Cuidado",
    addNewDogItem: "Añadir nuevo perro",
    addNewCatItem: "Añadir nuevo gato",
    noDogsTitle: "Aún no se ha añadido ninguna mascota",
    noDogsText: "Comienza creando el pasaporte de tu mascota — los datos de identidad, el código QR y más se preparan automáticamente.",
    addFirstDog: "Añadir Primer Perro",
    addFirstCat: "Añadir Primer Gato",
    footerNote: "Vista previa Fase 1 — Pasaporte, Cartilla de Vacunas, Asignación de Veterinario. Los datos se almacenan en Supabase.",
    addPetModalTitle: (species) => (species === "cat" ? "Añadir Nuevo Gato" : "Añadir Nuevo Perro"),
    editPetModalTitle: (species) => (species === "cat" ? "Editar Datos del Gato" : "Editar Datos del Perro"),
    uploadPhoto: "Subir foto",
    changePhoto: "Cambiar foto",
    fieldPetName: (species) => (species === "cat" ? "Nombre del gato" : "Nombre del perro"),
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
    fieldNeutered: "¿Esterilizado/a?",
    rowNeutered: "Estado de Esterilización",
    neuteredYes: "Sí",
    neuteredNo: "No",
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
    verifiedIdentityLabel: "IDENTIDAD VERIFICADA",
    scannableIdDesc: (name) => `Al escanearlo, aparecen al instante los datos de identidad y contacto de ${name}.`,
    scanToReach: "Escanea y contacta si se pierde",
    lostPetCardBadge: (species) => (species === "cat" ? "¿Encontraste a este gato?" : "¿Encontraste a este perro?"),
    lostPetCardTitle: (name) => `Tarjeta de Identidad de ${name}`,
    lostPetCardDesc: (species) =>
      species === "cat"
        ? "El dueño de este gato usa Paw Wallet. Puedes contactarlo con los datos de abajo."
        : "El dueño de este perro usa Paw Wallet. Puedes contactarlo con los datos de abajo.",
    callOwnerBtn: "Llamar al Dueño",
    callEmergencyBtn: "Llamar al Contacto de Emergencia",
    lostCardNotFound: (species) => (species === "cat" ? "No se encontró ningún registro para este gato." : "No se encontró ningún registro para este perro."),
    lostCardFooter: "Creado con Paw Wallet",
    breedMixedOption: "Mestizo / Desconocido",
    breedOtherOption: "Otro",
    colorNames: {
      "Siyah": "Negro",
      "Beyaz": "Blanco",
      "Kahverengi": "Marrón",
      "Kum Rengi (Fawn)": "Leonado",
      "Kızıl / Kırmızımsı": "Rojizo",
      "Gri": "Gris",
      "Sarı / Krem": "Amarillo / Crema",
      "Sable (Kızıl-Siyah Karışık)": "Sable",
      "Siyah-Beyaz": "Negro y Blanco",
      "Kahverengi-Beyaz": "Marrón y Blanco",
      "Üç Renkli (Tricolor)": "Tricolor",
      "Benekli (Merle)": "Merle",
      "Altın Sarısı": "Dorado",
      "Diğer": "Otro",
    },
    deletePetModalTitle: (species) => (species === "cat" ? "Eliminar Gato" : "Eliminar Perro"),
    deletePetWarning: (name, species) =>
      species === "cat"
        ? `Estás a punto de eliminar permanentemente el pasaporte, los registros de vacunas y las asignaciones de veterinario de ${name}. Esta acción no se puede deshacer.`
        : `Estás a punto de eliminar permanentemente el pasaporte, los registros de vacunas y las asignaciones de veterinario de ${name}. Esta acción no se puede deshacer.`,
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
    documentsTitle: "Documentos",
    documentsSubtitle: (count) => `${count} documentos subidos`,
    addDocumentBtn: "Añadir Documento",
    documentsEmpty: "Aún no hay documentos subidos.",
    addDocumentModalTitle: "Añadir Documento",
    fieldDocumentType: "Tipo de documento",
    docTypeTravel: "Documento de Viaje (Pasaporte UE)",
    docTypeInsurance: "Póliza de Seguro",
    docTypeOwnership: "Documento de Propiedad",
    docTypeOther: "Otro",
    fieldDocumentLabel: "Nombre del documento",
    fieldDocumentFile: "Archivo",
    viewDocumentBtn: "Ver",
    saveBtn: "Guardar",
    labelApplication: "Aplicada",
    labelNextDose: "Próxima Dosis",
    labelVet: "Veterinario",
    labelBatch: "N.º de Lote",
    statusOverdue: "ATRASADA",
    statusSoon: "PRÓXIMA",
    statusCurrent: "AL DÍA",
    vetTabTitle: "Asignación",
    vetTabSubtitle: (dogName) => `Asigna un veterinario principal y secundario a ${dogName} de entre los veterinarios de la plataforma.`,
    platformVetsLabel: "Veterinarios de la Plataforma",
    makePrimaryBtn: "Hacer Principal",
    makeSecondaryBtn: "Hacer Secundario",
    landingHeadline: "Toda la vida de tu mascota, en un solo pasaporte digital.",
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
    forgotPasswordLink: "¿Olvidaste tu contraseña?",
    forgotPasswordTitle: "Restablece tu Contraseña",
    forgotPasswordDesc: "Introduce tu correo registrado y te enviaremos un enlace para restablecerla.",
    sendResetLinkBtn: "Enviar Enlace",
    resetLinkSentTitle: "Enlace Enviado",
    resetLinkSentDesc: (email) => `Enviamos un enlace de restablecimiento a ${email}. Revisa tu bandeja de entrada (y spam).`,
    fieldNewPassword: "Nueva contraseña",
    fieldConfirmNewPassword: "Confirmar nueva contraseña",
    setNewPasswordBtn: "Actualizar Contraseña",
    resetPasswordScreenTitle: "Establecer Nueva Contraseña",
    passwordUpdatedDesc: "Tu contraseña ha sido actualizada. Ya puedes continuar.",
    continueBtn: "Continuar",
    verifyingSession: "Verificando…",
    greeting: (name) => `Hola, ${name}`,
    navHealth: "Salud",
    navDocuments: "Documentos",
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
    navWeight: "Peso",
    weightTitle: "Peso y Crecimiento",
    weightSubtitle: (dogName, count) => `${count} mediciones registradas para ${dogName}`,
    fieldIdealWeight: "Peso ideal recomendado por el veterinario (kg)",
    saveIdealWeightBtn: "Guardar",
    addWeightBtn: "Añadir Medición",
    weightEmpty: "Aún no hay mediciones de peso. Añade la primera para empezar.",
    addWeightModalTitle: "Añadir Medición de Peso",
    fieldWeightDate: "Fecha de medición",
    fieldWeightKg: "Peso (kg)",
    weightChartTitle: "Peso a lo Largo del Tiempo",
    weightChartIdealLine: "Peso ideal",
    adminPanelTitle: "Panel de Administración",
    vetPortalTitle: "Portal Veterinario",
    adminStatsUsers: "Usuarios Totales",
    adminStatsOwners: "Dueños de Mascotas",
    adminStatsVetAccounts: "Cuentas Veterinarias",
    adminStatsVetListings: "Veterinarios Registrados",
    adminStatsPendingRequests: "Asignaciones Pendientes",
    adminStatsServiceProviders: "Proveedores de Servicios",
    addVetSectionTitle: "Crear Nueva Cuenta de Negocio",
    fieldBusinessType: "Tipo de Negocio",
    businessTypeNames: { vet: "Veterinario", groomer: "Peluquería / Cuidado" },
    myPatientsTitleFor: (type) => (type === "groomer" ? "Mis Clientes" : "Mis Pacientes"),
    myPatientsSubtitleFor: (type, count) => (type === "groomer" ? `${count} clientes aprobados` : `${count} pacientes aprobados`),
    todaysApptsTitle: "Citas de Hoy",
    noApptsToday: "No hay citas hoy.",
    quickSearchPlaceholder: "Buscar paciente, dueño o microchip…",
    createUserSectionTitle: "Crear Nuevo Usuario",
    createUserSectionSubtitle: "Crea rápidamente una cuenta de prueba con correo + contraseña, sin correo de invitación.",
    createUserBtn: "Crear Usuario",
    userCreateSuccess: (email) => `Cuenta creada para ${email}.`,
    changePasswordSectionTitle: "Cambiar Contraseña de Usuario",
    fieldUserEmail: "Correo del usuario",
    changePasswordBtn: "Cambiar Contraseña",
    passwordChangedSuccess: "Contraseña cambiada con éxito.",
    fieldClinicName: "Nombre de la clínica",
    fieldVetCity: "Ciudad",
    fieldVetCountry: "País",
    fieldVetSpecialty: "Especialidad",
    fieldVetPhone: "Teléfono",
    selectVetSpecialty: "Seleccionar especialidad",
    specialtyNames: {
      "İç Hastalıkları": "Medicina Interna",
      "Cerrahi": "Cirugía",
      "Diş & Ağız Sağlığı": "Odontología",
      "Dermatoloji": "Dermatología",
      "Kardiyoloji": "Cardiología",
      "Ortopedi": "Ortopedia",
      "Göz Hastalıkları": "Oftalmología",
      "Onkoloji": "Oncología",
      "Acil & Yoğun Bakım": "Emergencias y Cuidados Intensivos",
      "Egzotik Hayvan Sağlığı": "Medicina de Animales Exóticos",
      "Beslenme": "Nutrición",
      "Genel Bakım": "Atención General",
    },
    fieldVetEmail: "Correo del veterinario (la invitación se envía aquí)",
    createVetAccountBtn: "Crear Cuenta y Enviar Invitación",
    vetInviteSuccess: (email) => `Invitación enviada a ${email}.`,
    addServiceProviderSectionTitle: "Añadir Proveedor de Servicios",
    fieldServiceName: "Nombre de la empresa",
    fieldServiceType: "Tipo de servicio",
    serviceTypeGrooming: "Peluquería",
    serviceTypeWalking: "Paseo de Perros",
    serviceTypeTaxi: "Taxi para Mascotas",
    serviceTypeOther: "Otro",
    createServiceProviderBtn: "Añadir Empresa",
    serviceProviderAdded: "Empresa añadida.",
    vetListSectionTitle: "Veterinarios Registrados",
    activityLogsTitle: "Registros de Actividad",
    fieldFilterByEmail: "Filtrar por correo",
    filterBtn: "Filtrar",
    clearFilterBtn: "Limpiar",
    noLogsFound: "No se encontraron registros.",
    logColumnTime: "Hora",
    logColumnUser: "Usuario",
    logColumnAction: "Acción",
    logColumnDetails: "Detalles",
    vetPortalWelcome: (clinic) => `Bienvenido, ${clinic}`,
    pendingRequestsTitle: "Solicitudes de Asignación Pendientes",
    noPendingRequests: "No hay solicitudes pendientes por ahora.",
    approveBtn: "Aprobar",
    rejectBtn: "Rechazar",
    requestFrom: (dogName, role) => `Solicitud de veterinario ${role} para ${dogName}`,
    myDoctorsTitle: "Mis Doctores",
    addDoctorBtn: "Añadir Doctor",
    fieldDoctorName: "Nombre del doctor",
    fieldDoctorTitle: "Título",
    noDoctors: "Aún no hay doctores añadidos.",
    myServicesTitle: "Mis Servicios",
    addServiceBtn: "Añadir Servicio",
    fieldServiceNameShort: "Nombre del servicio",
    fieldServicePrice: "Precio",
    fieldServiceDuration: "Duración",
    durationMinutesLabel: (m) => (m < 60 ? `${m} min` : m === 60 ? "1 h" : `${Math.floor(m / 60)}h ${m % 60 || ""}${m % 60 ? "min" : ""}`.trim()),
    selectServiceType: "Seleccionar servicio",
    serviceNames: {
      "Muayene": "Consulta",
      "Aşılama": "Vacunación",
      "Kısırlaştırma": "Esterilización/Castración",
      "Diş Temizliği": "Limpieza Dental",
      "Röntgen": "Radiografía",
      "Kan Tahlili": "Análisis de Sangre",
      "Ameliyat": "Cirugía",
      "Ultrason": "Ecografía",
      "Mikroçip Takma": "Microchip",
      "Tırnak Kesimi": "Corte de Uñas",
      "Yıkama & Tıraş": "Peluquería",
      "Ev Ziyareti": "Visita a Domicilio",
      "Acil Müdahale": "Atención de Emergencia",
      "Laboratuvar Testi": "Prueba de Laboratorio",
      "Diğer": "Otro",
    },
    doctorTitleNames: {
      "Veteriner Hekim": "Veterinario",
      "Klinik Şefi": "Jefe de Clínica",
      "Uzman Veteriner Hekim": "Veterinario Especialista",
      "Cerrah": "Cirujano",
      "Baş Veteriner": "Veterinario Jefe",
      "Asistan Veteriner": "Veterinario Asistente",
      "Stajyer": "Interno",
      "Veteriner Teknisyeni": "Técnico Veterinario",
    },
    editVaccineModalTitle: "Editar Registro de Vacuna",
    editHealthRecordModalTitle: "Editar Nota de Salud",
    vaccineConfirmedCheckbox: "Esta vacuna fue administrada",
    notYetGivenLabel: "Aún No Administrada",
    markAsDoneBtn: "Marcar como Hecho",
    markAsNotDoneBtn: "Marcar como No Hecho",
    addMedicationForPatientBtn: "Recetar Medicamento",
    availabilityTitle: "Horario de Disponibilidad",
    availabilitySubtitle: "Define los días y horas en que los pacientes pueden reservar citas.",
    availabilityBreakHint: "Añade dos franjas separadas el mismo día para incluir un descanso (ej. 9:00-12:00 y 14:00-18:00).",
    blockSlotBtn: "Bloquear Este Horario",
    blockSlotTitle: "Cita Fuera de la Aplicación",
    blockSlotSubtitle: "Registra una cita tomada por teléfono o en persona para bloquear ese horario.",
    blockSlotNotePlaceholder: "Nombre del cliente / nota (opcional)",
    blockSlotSuccessMsg: "Horario bloqueado.",
    vetTabDashboard: "Panel",
    vetTabAppointments: "Citas",
    vetTabTeam: "Equipo & Servicios",
    vetTabSettings: "Información de la Clínica",
    ownerInfoSection: "Información del Dueño",
    periodToday: "Hoy",
    periodWeek: "Esta Semana",
    periodMonth: "Este Mes",
    serviceBreakdownTitle: "Por Servicio",
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    fieldStartTime: "Inicio",
    fieldEndTime: "Fin",
    addAvailabilityBtn: "Añadir Bloque",
    noAvailabilitySet: "Aún no hay disponibilidad definida.",
    myAppointmentsTitle: "Mis Citas",
    noAppointmentsYet: "Aún no hay citas.",
    apptStatusBooked: "Programada",
    apptStatusCompleted: "Completada",
    apptStatusCancelled: "Cancelada",
    apptStatusRescheduled: "Reprogramada",
    offAppApptSectionTitle: "Cita Fuera de la Aplicación",
    allAppointmentsTitle: "Todas las Citas",
    colApptDate: "Fecha de Cita",
    colApptTimeRange: "Rango Horario",
    colCustomerName: "Nombre del Cliente",
    colPetName: "Nombre de la Mascota",
    colService: "Servicio",
    colApptType: "Tipo de Cita",
    colStatus: "Estado",
    colDetails: "Detalles",
    apptTypeOnApp: "Dentro de la App",
    apptTypeOffApp: "Fuera de la App",
    noAppointmentsInTable: "Aún no hay citas.",
    apptDetailTitle: "Detalles de la Cita",
    cancelActionBtn: "Cancelar",
    rescheduleActionBtn: "Reprogramar",
    doneActionBtn: "Completada",
    statusNoteLabel: "Nota",
    statusNotePlaceholder: "Nota sobre el paciente/cliente…",
    confirmActionBtn: "Confirmar",
    newDateLabel: "Nueva Fecha",
    rescheduleSuccessMsg: "Cita reprogramada.",
    cancelSuccessMsg: "Cita cancelada.",
    doneSuccessMsg: "Cita marcada como completada.",
    markCompletedBtn: "Marcar como Completada",
    cancelApptBtn: "Cancelar",
    bookApptBtn: "Reservar Cita",
    selectDateLabel: "Seleccionar Fecha",
    selectTimeLabel: "Seleccionar Hora",
    noSlotsAvailable: "No hay horarios disponibles en esta fecha.",
    confirmBookingBtn: "Confirmar Reserva",
    bookingSuccessMsg: "¡Tu cita ha sido reservada!",
    slotTakenErrorMsg: "Este horario acaba de ser reservado, elige otro.",
    vetBookedApptBadge: "Cita Confirmada por el Veterinario",
    apptNoteLabel: "Nota (opcional)",
    loadingSlotsText: "Cargando horarios disponibles…",
    noBookableVets: "Ningún veterinario ha configurado disponibilidad todavía.",
    groomerSpecialtyNames: {
      "Yıkama & Tıraş": "Baño & Corte",
      "Tırnak Bakımı": "Cuidado de Uñas",
      "Kulak & Göz Temizliği": "Limpieza de Oídos & Ojos",
      "Diş Bakımı": "Cuidado Dental",
      "Deri & Tüy Bakımı": "Cuidado de Piel & Pelaje",
      "Irk Bazlı Kesim": "Corte por Raza",
      "Parazit Kontrolü": "Control de Parásitos",
      "Spa & Masaj": "Spa & Masaje",
      "Genel Bakım": "Cuidado General",
    },
    groomerStaffTitleNames: {
      "Kuaför": "Peluquero",
      "Şef Kuaför": "Peluquero Jefe",
      "Bakım Uzmanı": "Especialista en Cuidado",
      "Yardımcı Personel": "Personal de Apoyo",
      "Stajyer": "Interno",
    },
    myTeamTitleFor: (type) => (type === "groomer" ? "Mi Equipo" : "Mis Veterinarios"),
    fieldEmployeeTitleFor: (type) => (type === "groomer" ? "Rol" : "Título"),
    fieldEmployeeNameFor: (type) => (type === "groomer" ? "Nombre del empleado" : "Nombre del veterinario"),
    noTeamMembersFor: (type) => (type === "groomer" ? "Aún no hay empleados añadidos." : "Aún no hay veterinarios añadidos."),
    vaccineNames: {
      "Kuduz / Rabies": "Rabia",
      "Karma (DHPPi)": "Vacuna Combinada (DHPPi)",
      "Leptospiroz": "Leptospirosis",
      "Bordetella (Kennel Cough)": "Tos de las Perreras (Bordetella)",
      "Leishmania": "Leishmaniasis",
      "Corona virüsü": "Coronavirus Canino",
      "Karma (FVRCP)": "Combinada Felina (FVRCP)",
      "Lösemi (FeLV)": "Leucemia Felina (FeLV)",
      "FIV Testi": "Prueba de FIV",
      "Klamidya (Chlamydia)": "Clamidiosis",
      "Bordetella": "Bordetella",
      "Diğer": "Otro",
    },
    noServices: "Aún no hay servicios añadidos.",
    clinicInfoTitle: "Información de la Clínica",
    myPatientsTitle: "Mis Pacientes",
    addVaccineForPatientBtn: "Añadir Vacuna",
    addHealthNoteForPatientBtn: "Añadir Nota de Salud",
    addedByVetLabel: (clinic) => `Añadido por ${clinic}`,
    vetRecordSuccess: "Registro añadido al expediente del paciente.",
    myPatientsSubtitle: (count) => `${count} pacientes aprobados`,
    noPatientsYet: "Aún no hay pacientes aprobados.",
    viewPatientBtn: "Ver",
    patientDetailTitle: (name) => `${name} — Ficha del Paciente`,
    closeBtn: "Cerrar",
    maxSpecialtiesNote: (max) => `hasta ${max}`,
    commercialInfoTitle: "Información Comercial",
    bankInfoTitle: "Datos Bancarios",
    fieldWebsite: "Sitio Web",
    uploadLogo: "Subir logo",
    changeLogo: "Cambiar logo",
    viewDetailsBtn: "Ver Detalles",
    vetServicesTitle: "Servicios Ofrecidos",
    noServicesListed: "Aún no hay servicios listados.",
    websiteLabel: "Sitio Web",
    fieldLegalBusinessName: "Razón Social",
    fieldTaxId: "Número de Identificación Fiscal",
    fieldClinicAddress: "Dirección Completa",
    fieldTradeRegistryDoc: "Documento de Registro Mercantil",
    fieldIban: "IBAN",
    fieldSwiftCode: "Código SWIFT",
    fieldBankName: "Nombre del Banco",
    fieldAccountHolderName: "Titular de la Cuenta",
    saveClinicInfoBtn: "Guardar Información",
    approvedByLabel: "Aprobado por",
    assignedVetsTitle: "Veterinarios Asignados",
    navPetCV: "CV",
    petCvTitle: (name) => `${name} — Resumen (CV)`,
    petCvSubtitle: "Un resumen de toda la información de pasaporte, salud, vacunas y veterinario",
    downloadPdfBtn: "Descargar como PDF",
    cvIdentitySection: "Datos de Identidad",
    cvHealthSection: "Perfil de Salud",
    cvVaccinesSection: "Historial de Vacunas",
    cvWeightSection: "Peso",
    cvVetSection: "Veterinarios Asignados",
    cvNoVaccines: "No hay vacunas registradas.",
    cvNoVet: "No hay asignación veterinaria aprobada.",
    cvCurrentWeight: "Peso Actual",
    cvIdealWeight: "Peso Ideal",
    cvNoWeight: "No hay mediciones de peso.",
    cvGeneratedOn: (date) => `Generado el ${date}`,
    pendingApprovalBadge: "PENDIENTE DE APROBACIÓN",
    rejectedBadge: "RECHAZADO",
    cancelRequestBtn: "Cancelar",
    enableNotificationsBtn: "Activar Notificaciones",
    notificationsEnabled: "Notificaciones activadas",
    notificationPermissionDenied: "Permiso denegado. Puedes activarlo en la configuración del navegador.",
    notificationsUnsupported: "Este navegador no admite notificaciones push.",
    premiumBadge: "Premium",
    upgradeBtn: "Pasar a Premium",
    manageSubscriptionBtn: "Gestionar Suscripción",
    premiumModalTitle: "Paw Wallet Premium",
    premiumModalSubtitle: "Todas tus mascotas, todos tus veterinarios, documentos ilimitados.",
    billingMonthly: "Mensual",
    billingYearly: "Anual",
    billingYearlyBadge: "Ahorra 30%",
    priceMonthly: "2,99€/mes",
    priceYearly: "24,99€/año",
    premiumFeature1: "Añadir mascotas ilimitadas",
    premiumFeature2: "Asignar un veterinario secundario",
    premiumFeature3: "Subida ilimitada de documentos",
    premiumFeature4: "CV de mascota / descarga en PDF",
    subscribeBtn: "Suscribirse",
    freePlanLabel: "Plan Gratuito",
    premiumPlanLabel: "Plan Premium",
    limitReachedPets: "Puedes añadir 1 mascota en el plan gratuito. Actualiza a Premium para más.",
    limitReachedVet: "La asignación de un veterinario secundario es una función Premium.",
    limitReachedDocs: "Puedes subir hasta 3 documentos en el plan gratuito.",
    limitReachedCv: "El CV de mascota y la descarga en PDF son funciones Premium.",
    seePremiumBtn: "Ver Premium",
    redirectingToStripe: "Redirigiendo al pago…",
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

const VET_SPECIALTY_KEYS = [
  "İç Hastalıkları",
  "Cerrahi",
  "Diş & Ağız Sağlığı",
  "Dermatoloji",
  "Kardiyoloji",
  "Ortopedi",
  "Göz Hastalıkları",
  "Onkoloji",
  "Acil & Yoğun Bakım",
  "Egzotik Hayvan Sağlığı",
  "Beslenme",
  "Genel Bakım",
];

const VET_SERVICE_KEYS = [
  "Muayene",
  "Aşılama",
  "Kısırlaştırma",
  "Diş Temizliği",
  "Röntgen",
  "Kan Tahlili",
  "Ameliyat",
  "Ultrason",
  "Mikroçip Takma",
  "Tırnak Kesimi",
  "Yıkama & Tıraş",
  "Ev Ziyareti",
  "Acil Müdahale",
  "Laboratuvar Testi",
  "Diğer",
];

const DOCTOR_TITLE_KEYS = [
  "Veteriner Hekim",
  "Klinik Şefi",
  "Uzman Veteriner Hekim",
  "Cerrah",
  "Baş Veteriner",
  "Asistan Veteriner",
  "Stajyer",
  "Veteriner Teknisyeni",
];

const GROOMER_SPECIALTY_KEYS = [
  "Yıkama & Tıraş",
  "Tırnak Bakımı",
  "Kulak & Göz Temizliği",
  "Diş Bakımı",
  "Deri & Tüy Bakımı",
  "Irk Bazlı Kesim",
  "Parazit Kontrolü",
  "Spa & Masaj",
  "Genel Bakım",
];

const GROOMER_STAFF_TITLE_KEYS = ["Kuaför", "Şef Kuaför", "Bakım Uzmanı", "Yardımcı Personel", "Stajyer"];

const CAT_VACCINES = [
  "Kuduz / Rabies",
  "Karma (FVRCP)",
  "Lösemi (FeLV)",
  "FIV Testi",
  "Klamidya (Chlamydia)",
  "Bordetella",
  "Diğer",
];

const BREEDS = [
  "Melez / Karışık",
  "Affenpinscher",
  "Afghan Hound",
  "Airedale Terrier",
  "Akbaş",
  "Akita",
  "Alaskan Malamute",
  "American Bulldog",
  "American Eskimo Dog",
  "American Foxhound",
  "American Pitbull Terrier",
  "American Staffordshire Terrier",
  "American Water Spaniel",
  "Anatolian Shepherd Dog (Anadolu Çoban Köpeği)",
  "Australian Cattle Dog",
  "Australian Shepherd (Aussie)",
  "Australian Terrier",
  "Basenji",
  "Basset Hound",
  "Beagle",
  "Bearded Collie",
  "Bedlington Terrier",
  "Belgian Malinois",
  "Belgian Sheepdog",
  "Belgian Tervuren",
  "Bernese Mountain Dog",
  "Bichon Frise",
  "Black and Tan Coonhound",
  "Black Russian Terrier",
  "Bloodhound",
  "Bluetick Coonhound",
  "Boerboel",
  "Border Collie",
  "Border Terrier",
  "Borzoi (Rus Tazısı)",
  "Boston Terrier",
  "Bouvier des Flandres",
  "Boxer",
  "Boykin Spaniel",
  "Bracco Italiano",
  "Briard",
  "Brittany",
  "Brussels Griffon",
  "Bull Terrier",
  "Bulldog (English Bulldog)",
  "Bullmastiff",
  "Cairn Terrier",
  "Canaan Dog",
  "Cane Corso",
  "Cardigan Welsh Corgi",
  "Cavalier King Charles Spaniel",
  "Chesapeake Bay Retriever",
  "Chihuahua",
  "Chinese Crested",
  "Chinese Shar-Pei",
  "Chow Chow",
  "Clumber Spaniel",
  "Cocker Spaniel",
  "Collie",
  "Coton de Tulear",
  "Curly-Coated Retriever",
  "Dachshund (Sosis Köpek)",
  "Dalmatian (Dalmaçyalı)",
  "Dandie Dinmont Terrier",
  "Doberman Pinscher",
  "Dogo Argentino",
  "Dogue de Bordeaux",
  "Dutch Shepherd",
  "English Cocker Spaniel",
  "English Setter",
  "English Springer Spaniel",
  "English Toy Spaniel",
  "Entlebucher Mountain Dog",
  "Field Spaniel",
  "Finnish Lapphund",
  "Finnish Spitz",
  "Flat-Coated Retriever",
  "Fox Terrier (Smooth)",
  "Fox Terrier (Wire)",
  "French Bulldog (Fransız Bulldog)",
  "German Pinscher",
  "German Shepherd Dog (Alman Kurdu)",
  "German Shorthaired Pointer",
  "German Wirehaired Pointer",
  "Giant Schnauzer",
  "Glen of Imaal Terrier",
  "Golden Retriever",
  "Gordon Setter",
  "Grand Basset Griffon Vendéen",
  "Great Dane (Danua)",
  "Great Pyrenees",
  "Greater Swiss Mountain Dog",
  "Greyhound (Tazı)",
  "Harrier",
  "Havanese",
  "Ibizan Hound",
  "Icelandic Sheepdog",
  "Irish Red and White Setter",
  "Irish Setter",
  "Irish Terrier",
  "Irish Water Spaniel",
  "Irish Wolfhound",
  "Italian Greyhound",
  "Jack Russell Terrier",
  "Japanese Chin",
  "Japanese Spitz",
  "Kangal",
  "Karabaş",
  "Keeshond",
  "Kerry Blue Terrier",
  "Komondor",
  "Kuvasz",
  "Kars Çoban Köpeği (Çakabey)",
  "Labrador Retriever",
  "Lagotto Romagnolo",
  "Lakeland Terrier",
  "Lhasa Apso",
  "Löwchen",
  "Malaklı",
  "Maltese (Malta Köpeği)",
  "Manchester Terrier",
  "Mastiff",
  "Miniature Bull Terrier",
  "Miniature Pinscher",
  "Miniature Schnauzer",
  "Neapolitan Mastiff",
  "Newfoundland",
  "Norfolk Terrier",
  "Norwegian Buhund",
  "Norwegian Elkhound",
  "Norwegian Lundehund",
  "Norwich Terrier",
  "Nova Scotia Duck Tolling Retriever",
  "Old English Sheepdog",
  "Otterhound",
  "Papillon",
  "Parson Russell Terrier",
  "Pekingese",
  "Pembroke Welsh Corgi",
  "Perro de Presa Canario",
  "Petit Basset Griffon Vendéen",
  "Pharaoh Hound",
  "Plott Hound",
  "Pointer",
  "Pomeranian (Spitz)",
  "Poodle (Standard)",
  "Poodle (Miniature)",
  "Portuguese Podengo",
  "Portuguese Water Dog",
  "Pug",
  "Puli",
  "Pyrenean Shepherd",
  "Rat Terrier",
  "Redbone Coonhound",
  "Rhodesian Ridgeback",
  "Rottweiler",
  "Saint Bernard",
  "Saluki",
  "Samoyed",
  "Schipperke",
  "Scottish Deerhound",
  "Scottish Terrier",
  "Sealyham Terrier",
  "Setter (İrlanda)",
  "Shetland Sheepdog (Sheltie)",
  "Shiba Inu",
  "Shih Tzu",
  "Siberian Husky",
  "Silky Terrier",
  "Sivas Kangalı",
  "Skye Terrier",
  "Sloughi",
  "Soft Coated Wheaten Terrier",
  "Spinone Italiano",
  "Staffordshire Bull Terrier",
  "Standard Schnauzer",
  "Sussex Spaniel",
  "Swedish Vallhund",
  "Tibetan Mastiff",
  "Tibetan Spaniel",
  "Tibetan Terrier",
  "Toy Fox Terrier",
  "Toy Poodle",
  "Treeing Walker Coonhound",
  "Vizsla",
  "Weimaraner",
  "Welsh Springer Spaniel",
  "Welsh Terrier",
  "West Highland White Terrier",
  "Whippet",
  "Wirehaired Pointing Griffon",
  "Xoloitzcuintli",
  "Yakutian Laika",
  "Yorkshire Terrier",
  "Diğer",
];

const CAT_BREEDS = [
  "Melez / Karışık",
  "Abyssinian",
  "American Bobtail",
  "American Curl",
  "American Shorthair",
  "American Wirehair",
  "Balinese",
  "Bengal",
  "Birman",
  "Bombay",
  "British Longhair",
  "British Shorthair",
  "Burmese",
  "Burmilla",
  "Chartreux",
  "Colorpoint Shorthair",
  "Cornish Rex",
  "Cymric",
  "Devon Rex",
  "Donskoy",
  "Egyptian Mau",
  "European Shorthair",
  "Exotic Shorthair",
  "Havana Brown",
  "Himalayan",
  "Japanese Bobtail",
  "Javanese",
  "Khao Manee",
  "Korat",
  "Kurilian Bobtail",
  "LaPerm",
  "Maine Coon",
  "Manx",
  "Munchkin",
  "Nebelung",
  "Norwegian Forest Cat",
  "Ocicat",
  "Oriental Shorthair",
  "Persian",
  "Peterbald",
  "Pixie-bob",
  "Ragamuffin",
  "Ragdoll",
  "Russian Blue",
  "Savannah",
  "Scottish Fold",
  "Selkirk Rex",
  "Serengeti",
  "Siamese",
  "Siberian",
  "Singapura",
  "Skookum",
  "Snowshoe",
  "Sokoke",
  "Somali",
  "Sphynx",
  "Tonkinese",
  "Toyger",
  "Turkish Angora",
  "Turkish Van",
  "Ukrainian Levkoy",
  "York Chocolate",
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

/* Subtle scattered dog-themed background pattern (paw prints + bones), used only
   on the outer page background — never behind the actual content cards. */
const DOG_BG_PATTERN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <g fill='#1B3A2F' fill-opacity='0.05'>
    <g transform='translate(24,30) rotate(-18)'>
      <ellipse cx='0' cy='11' rx='8' ry='6.2'/>
      <circle cx='-8' cy='-2' r='3'/>
      <circle cx='-3' cy='-7' r='3.2'/>
      <circle cx='3' cy='-7' r='3.2'/>
      <circle cx='8' cy='-2' r='3'/>
    </g>
    <g transform='translate(150,60) rotate(24)'>
      <rect x='-11' y='-3' width='22' height='6' rx='3'/>
      <circle cx='-11' cy='-3.5' r='3.4'/>
      <circle cx='-11' cy='3.5' r='3.4'/>
      <circle cx='11' cy='-3.5' r='3.4'/>
      <circle cx='11' cy='3.5' r='3.4'/>
    </g>
    <g transform='translate(60,140) rotate(10)'>
      <ellipse cx='0' cy='9' rx='6.5' ry='5'/>
      <circle cx='-6.5' cy='-1.5' r='2.4'/>
      <circle cx='-2.4' cy='-5.5' r='2.6'/>
      <circle cx='2.4' cy='-5.5' r='2.6'/>
      <circle cx='6.5' cy='-1.5' r='2.4'/>
    </g>
    <g transform='translate(155,165) rotate(-30)'>
      <rect x='-9' y='-2.5' width='18' height='5' rx='2.5'/>
      <circle cx='-9' cy='-3' r='2.8'/>
      <circle cx='-9' cy='3' r='2.8'/>
      <circle cx='9' cy='-3' r='2.8'/>
      <circle cx='9' cy='3' r='2.8'/>
    </g>
  </g>
</svg>`;
const DOG_BG_PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(DOG_BG_PATTERN_SVG)}")`;

/* Subtle scattered cat-themed background pattern (cat faces + fish) */
const CAT_BG_PATTERN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <g fill='#1B3A2F' fill-opacity='0.05'>
    <g transform='translate(28,32) rotate(-12)'>
      <circle cx='0' cy='2' r='9'/>
      <polygon points='-9,-3 -13,-14 -2,-7'/>
      <polygon points='9,-3 13,-14 2,-7'/>
    </g>
    <g transform='translate(150,55) rotate(18)'>
      <ellipse cx='-3' cy='0' rx='10' ry='6'/>
      <polygon points='9,0 20,-7 20,7'/>
    </g>
    <g transform='translate(55,145) rotate(8)'>
      <circle cx='0' cy='1.5' r='7'/>
      <polygon points='-7,-2 -10,-11 -1.5,-5.5'/>
      <polygon points='7,-2 10,-11 1.5,-5.5'/>
    </g>
    <g transform='translate(160,170) rotate(-22)'>
      <ellipse cx='-2.5' cy='0' rx='8' ry='5'/>
      <polygon points='7,0 16,-5.5 16,5.5'/>
    </g>
  </g>
</svg>`;
const CAT_BG_PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(CAT_BG_PATTERN_SVG)}")`;


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

function PrimaryButton({ children, onClick, type = "button", full, icon: Icon, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${
        full ? "w-full" : ""
      } inline-flex items-center justify-center gap-2 rounded-md bg-[#1B3A2F] px-4 py-2.5 text-[13.5px] font-semibold text-[#F7F3E8] tracking-wide hover:bg-[#234a3b] active:scale-[0.98] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
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
        className="flex items-center gap-1.5 rounded-full border border-[#d8cfb4] bg-[#FBF8EE] px-2.5 py-1.5 text-[12.5px] font-medium text-[#3c473f] hover:bg-[#f0e9cd] transition"
      >
        <span>{current?.flag}</span>
        <span>{current?.short}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-28 rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] shadow-lg overflow-hidden z-30">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-1.5 text-left px-3 py-2 text-[13px] hover:bg-[#f0e9cd] transition ${
                l.code === lang ? "bg-[#f0e9cd] font-semibold" : ""
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.short}</span>
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

/* Uzmanlık alanı — en fazla 3 tane seçilebilen etiket (pill) seçici */
function SpecialtyMultiSelect({ label, value, onChange, options, max = 3, nameMap }) {
  const { t } = useI18n();
  const selected = value || [];
  const names = nameMap || t.specialtyNames;

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <Field label={`${label} (${t.maxSpecialtiesNote(max)})`}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          const disabled = !isSelected && selected.length >= max;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium border transition ${
                isSelected
                  ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                  : disabled
                  ? "border-[#e3d9bd] text-[#c7bb95] cursor-not-allowed"
                  : "border-[#d8cfb4] text-[#5b6d63] hover:border-[#1B3A2F]/40"
              }`}
            >
              {names?.[opt] || opt}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  Add / Edit Dog Modal                                               */
/* ------------------------------------------------------------------ */

/* Searchable combobox — type to filter a long list (e.g. dog breeds), free typing also allowed */
function SearchableSelect({ value, onChange, options, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [filterText, setFilterText] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => setQuery(value || ""), [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = filterText.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)).slice(0, 60) : options.slice(0, 60);

  return (
    <div className="relative" ref={containerRef}>
      <input
        className={inputCls}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setFilterText(e.target.value);
          setOpen(true);
          onChange(e.target.value);
        }}
        onFocus={(e) => {
          setOpen(true);
          setFilterText("");
          e.target.select();
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-[#d8cfb4] bg-[#fdfbf4] shadow-lg">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setQuery(o);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[13.5px] text-[#1f2a24] hover:bg-[#eee6cd] transition"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddDogModal({ onClose, onSave, existingDog, initialSpecies }) {
  const { t } = useI18n();
  const isEdit = !!existingDog;
  const species = existingDog?.species || initialSpecies || "dog";
  const speciesBreeds = species === "cat" ? CAT_BREEDS : BREEDS;
  const displayBreeds = speciesBreeds.map((b) => {
    if (b === "Melez / Karışık") return t.breedMixedOption;
    if (b === "Diğer") return t.breedOtherOption;
    return b;
  });
  const [form, setForm] = useState(
    existingDog
      ? {
          ...existingDog,
          species,
          neutered: existingDog.neutered || "Hayır",
          customColor: !COLORS.includes(existingDog.color) ? existingDog.color : "",
          color: COLORS.includes(existingDog.color) ? existingDog.color : "Diğer",
        }
      : {
          species,
          name: "",
          breed: displayBreeds[0],
          birthDate: "",
          gender: "Erkek",
          neutered: "Hayır",
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
    <Modal title={isEdit ? t.editPetModalTitle(species) : t.addPetModalTitle(species)} onClose={onClose} wide>
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
          <Field label={t.fieldPetName(species)}>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Zeytin" />
          </Field>
          <Field label={t.fieldBreed}>
            <SearchableSelect
              value={form.breed}
              onChange={(v) => setForm((f) => ({ ...f, breed: v }))}
              options={displayBreeds}
              placeholder={t.fieldBreed}
            />
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
                <option key={c} value={c}>
                  {t.colorNames?.[c] || c}
                </option>
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

          <Field label={t.fieldNeutered}>
            <select className={inputCls} value={form.neutered} onChange={set("neutered")}>
              <option value="Evet">{t.neuteredYes}</option>
              <option value="Hayır">{t.neuteredNo}</option>
            </select>
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
  const { t } = useI18n();
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
            PAW WALLET · {t.verifiedIdentityLabel} ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22px] rounded-full bg-white shadow-inner border border-[#C9A227]/40 grid place-items-center">
        <img src={qrUrl} alt="QR" className="w-[70%] h-[70%] object-contain" />
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

  const publicLostPetUrl = `${window.location.origin}/?lost=${dog.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=${encodeURIComponent(publicLostPetUrl)}`;

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

        <div className="flex gap-4 sm:gap-6">
          <div className="shrink-0">
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint size={36} className="text-[#a89c6e]" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="font-display text-[22px] sm:text-[30px] leading-tight text-[#1B3A2F] truncate">{dog.name}</h2>
            <p className="text-[12.5px] sm:text-[13.5px] text-[#5b6d63]">{dog.breed}</p>
          </div>
        </div>

        <div className="mt-4">
          <Row label={t.rowBirthDate} value={fmtDate(dog.birthDate, locale)} />
          <Row label={t.rowGender} value={dog.gender === "Dişi" ? t.female : t.male} />
          <Row label={t.rowNeutered} value={dog.neutered === "Evet" ? t.neuteredYes : t.neuteredNo} />
          <Row label={t.rowColor} value={t.colorNames?.[dog.color] || dog.color} />
          <Row label={t.rowBirthPlace} value={birthPlace} />
          <Row label={t.rowLivingPlace} value={livingPlace} />
          <Row label={t.rowMicrochip} value={dog.microchip} mono />
          <Row label={t.rowPassportNo} value={dog.passportNumber} mono />
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
/*  Documents (Belgeler)                                                */
/* ------------------------------------------------------------------ */

const DOC_TYPE_KEYS = {
  Seyahat: "docTypeTravel",
  Sigorta: "docTypeInsurance",
  Sahiplik: "docTypeOwnership",
  Diğer: "docTypeOther",
};

function AddDocumentModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [type, setType] = useState("Seyahat");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setFileName(f.name);
    try {
      if (f.type.startsWith("image/")) {
        const dataUrl = await resizeImageFile(f, 900, 0.82);
        setFile({ dataUrl, isImage: true, mimeType: "image/jpeg" });
      } else {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        setFile({ dataUrl, isImage: false, mimeType: f.type });
      }
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  const submit = () => {
    if (!file) return;
    onSave({
      id: uid(),
      type,
      label: type === "Diğer" ? label || t.docTypeOther : "",
      fileName,
      mimeType: file.mimeType,
      isImage: file.isImage,
      data: file.dataUrl,
      date: todayISO(),
    });
  };

  return (
    <Modal title={t.addDocumentModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <Field label={t.fieldDocumentType}>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(DOC_TYPE_KEYS).map(([key, tKey]) => (
              <option key={key} value={key}>
                {t[tKey]}
              </option>
            ))}
          </select>
        </Field>
        {type === "Diğer" && (
          <Field label={t.fieldDocumentLabel}>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
        )}
        <Field label={t.fieldDocumentFile}>
          <div
            className="flex items-center gap-3 rounded-md border border-dashed border-[#c7bb95] bg-[#efe8d1] px-3 py-2.5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {busy ? <Loader2 size={15} className="animate-spin text-[#5b6d63]" /> : <Upload size={15} className="text-[#5b6d63]" />}
            <span className="text-[13px] text-[#5b6d63] truncate">{fileName || t.chooseFileText}</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
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

function DocumentsTab({ dog, onAdd, onDelete, isPremium, onRequirePremium }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const [showAdd, setShowAdd] = useState(false);
  const docs = dog.documents || [];
  const FREE_DOC_LIMIT = 3;

  const handleAddClick = () => {
    if (!isPremium && docs.length >= FREE_DOC_LIMIT) {
      onRequirePremium();
      return;
    }
    setShowAdd(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.documentsTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.documentsSubtitle(docs.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={handleAddClick}>
          {t.addDocumentBtn}
        </PrimaryButton>
      </div>

      {!isPremium && docs.length >= FREE_DOC_LIMIT && (
        <p className="text-[12.5px] text-[#8a6d16] bg-[#f3e9c8] rounded-md px-3 py-2 mb-4">{t.limitReachedDocs}</p>
      )}

      {docs.length === 0 ? (
        <EmptyState icon={FileText} text={t.documentsEmpty} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {docs.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden flex flex-col">
              <div className="h-28 bg-[#eee6cd] grid place-items-center overflow-hidden">
                {doc.isImage ? (
                  <img src={doc.data} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText size={26} className="text-[#a89c6e]" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col gap-1.5">
                <p className="text-[13px] font-semibold text-[#1B3A2F]">
                  {doc.label || t[DOC_TYPE_KEYS[doc.type]] || doc.type}
                </p>
                <p className="text-[11px] text-[#8d8560]">{fmtDate(doc.date, locale)}</p>
                <div className="mt-auto flex items-center justify-between pt-1.5">
                  <a
                    href={doc.data}
                    download={doc.fileName || "document"}
                    className="text-[12px] font-medium text-[#1B3A2F] underline underline-offset-2"
                  >
                    {t.viewDocumentBtn}
                  </a>
                  <button onClick={() => onDelete(doc.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddDocumentModal
          onClose={() => setShowAdd(false)}
          onSave={(d) => {
            onAdd(d);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddVaccineModal({ onClose, onSave, species, existingVaccine }) {
  const { t } = useI18n();
  const isEdit = !!existingVaccine;
  const vaccineList = species === "cat" ? CAT_VACCINES : COMMON_VACCINES;
  const [form, setForm] = useState(
    existingVaccine
      ? {
          name: vaccineList.includes(existingVaccine.name) ? existingVaccine.name : "Diğer",
          customName: vaccineList.includes(existingVaccine.name) ? "" : existingVaccine.name,
          date: existingVaccine.date || todayISO(),
          nextDate: existingVaccine.nextDate || "",
          vetMode: "manual",
          vetId: PLATFORM_VETS[0].id,
          vetManual: existingVaccine.vet || "",
          batch: existingVaccine.batch || "",
          file: existingVaccine.file || null,
          fileName: existingVaccine.fileName || "",
          confirmed: existingVaccine.confirmed !== false,
        }
      : {
          name: vaccineList[0],
          customName: "",
          date: todayISO(),
          nextDate: "",
          vetMode: "platform",
          vetId: PLATFORM_VETS[0].id,
          vetManual: "",
          batch: "",
          file: null,
          fileName: "",
          confirmed: true,
        }
  );
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
      id: isEdit ? existingVaccine.id : uid(),
      name: finalName,
      date: form.date,
      nextDate: form.nextDate,
      vet: vetLabel,
      batch: form.batch,
      file: form.file,
      fileName: form.fileName,
      confirmed: form.confirmed,
    });
  };

  return (
    <Modal title={isEdit ? t.editVaccineModalTitle : t.addVaccineModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <Field label={t.fieldVaccineName}>
          <select className={inputCls} value={form.name} onChange={set("name")}>
            {vaccineList.map((v) => (
              <option key={v} value={v}>
                {t.vaccineNames?.[v] || v}
              </option>
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

        <label className="flex items-center gap-2 text-[13px] text-[#3c473f] cursor-pointer">
          <input
            type="checkbox"
            checked={form.confirmed}
            onChange={(e) => setForm((f) => ({ ...f, confirmed: e.target.checked }))}
            className="h-4 w-4 accent-[#1B3A2F]"
          />
          {t.vaccineConfirmedCheckbox}
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

function VaccineCard({ v, onDelete, onEdit, onToggleConfirmed }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const d = daysUntil(v.nextDate);
  let status = null;
  if (v.nextDate) {
    if (d < 0) status = { label: t.statusOverdue, cls: "bg-[#a63d40] text-white" };
    else if (d <= 30) status = { label: t.statusSoon, cls: "bg-[#C9A227] text-white" };
    else status = { label: t.statusCurrent, cls: "bg-[#1B3A2F] text-[#F7F3E8]" };
  }
  const isLocked = !!v.addedByVet;
  const vetPending = isLocked && v.confirmed === false;
  const notConfirmed = !isLocked && v.confirmed === false;
  return (
    <div className="relative rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F0EBD8] border border-[#d8cfb4]" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F0EBD8] border border-[#d8cfb4]" />
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Syringe size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{t.vaccineNames?.[v.name] || v.name}</span>
          {isLocked && !vetPending && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B3A2F] bg-[#dcefe3] rounded-full px-2 py-0.5">
              <Check size={10} /> {t.addedByVetLabel(v.vet)}
            </span>
          )}
          {vetPending && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8d8560] bg-[#efe8d1] rounded-full px-2 py-0.5">
              {t.notYetGivenLabel} · {v.vet}
            </span>
          )}
          {notConfirmed && (
            <button
              onClick={() => onToggleConfirmed(v.id)}
              className="text-[10px] font-semibold text-[#8d8560] bg-[#efe8d1] hover:bg-[#e3d9bd] rounded-full px-2 py-0.5 transition"
            >
              {t.notYetGivenLabel} · {t.markAsDoneBtn}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status && <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>}
          {!isLocked && (
            <>
              <button onClick={() => onEdit(v)} className="text-[#5b6d63] hover:text-[#1B3A2F] transition p-1">
                <Pencil size={14} />
              </button>
              <button onClick={() => onDelete(v.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
                <Trash2 size={14} />
              </button>
            </>
          )}
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

function VaccineTab({ dog, onAdd, onDelete, onUpdate }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const sorted = [...dog.vaccines].sort((a, b) => (a.date < b.date ? 1 : -1));

  const toggleConfirmed = (id) => {
    const v = dog.vaccines.find((x) => x.id === id);
    if (v) onUpdate({ ...v, confirmed: true });
  };

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
            <VaccineCard key={v.id} v={v} onDelete={onDelete} onEdit={setEditingVaccine} onToggleConfirmed={toggleConfirmed} />
          ))}
        </div>
      )}

      {editingVaccine && (
        <AddVaccineModal
          species={dog.species}
          existingVaccine={editingVaccine}
          onClose={() => setEditingVaccine(null)}
          onSave={(v) => {
            onUpdate(v);
            setEditingVaccine(null);
          }}
        />
      )}

      {showAdd && (
        <AddVaccineModal
          species={dog.species}
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

function AddHealthRecordModal({ onClose, onSave, existingRecord }) {
  const { t } = useI18n();
  const isEdit = !!existingRecord;
  const [form, setForm] = useState(
    existingRecord || {
      date: todayISO(),
      diagnosis: "",
      examNotes: "",
      treatment: "",
      prescription: "",
      labResults: "",
      isSurgery: false,
      surgeryNotes: "",
      vet: "",
    }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.date) return;
    onSave({ ...form, id: isEdit ? existingRecord.id : uid() });
  };

  return (
    <Modal title={isEdit ? t.editHealthRecordModalTitle : t.addHealthRecordModalTitle} onClose={onClose} wide>
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

function HealthRecordCard({ record, onDelete, onEdit }) {
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
          {record.addedByVet && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B3A2F] bg-[#dcefe3] rounded-full px-2 py-0.5">
              <Check size={10} /> {t.addedByVetLabel(record.vet)}
            </span>
          )}
        </div>
        {!record.addedByVet && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(record)} className="text-[#5b6d63] hover:text-[#1B3A2F] transition p-1">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(record.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
              <Trash2 size={14} />
            </button>
          </div>
        )}
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

function HealthTab({ dog, onSaveProfile, onAddRecord, onDeleteRecord, onUpdateRecord }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
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
            <HealthRecordCard key={r.id} record={r} onDelete={onDeleteRecord} onEdit={setEditingRecord} />
          ))}
        </div>
      )}

      {editingRecord && (
        <AddHealthRecordModal
          existingRecord={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(r) => {
            onUpdateRecord(r);
            setEditingRecord(null);
          }}
        />
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <Pill size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{med.name}</span>
          {med.addedByVet && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B3A2F] bg-[#dcefe3] rounded-full px-2 py-0.5">
              <Check size={10} /> {t.addedByVetLabel(med.vet)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
          {!med.addedByVet && (
            <button onClick={() => onDelete(med.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
              <Trash2 size={14} />
            </button>
          )}
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

function BookAppointmentModal({ dog, session, onClose, onBooked }) {
  const { t } = useI18n();
  const [myVets, setMyVets] = useState(undefined);
  const [selectedVet, setSelectedVet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookDate, setBookDate] = useState(todayISO());
  const [slots, setSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookMsg, setBookMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: reqRows } = await supabase
        .from("vet_assignment_requests")
        .select("vet_id, role")
        .eq("dog_id", dog.id)
        .eq("status", "approved");
      const roleByVetId = {};
      (reqRows || []).forEach((r) => {
        roleByVetId[r.vet_id] = r.role;
      });

      const { data: vetRows } = await supabase.from("vets").select("*").eq("approved", true).order("clinic_name");
      const bookable = (vetRows || []).filter((v) => (v.availability || []).length > 0);
      const withRole = bookable.map((v) => ({ ...v, myRole: roleByVetId[v.id] || null }));
      withRole.sort((a, b) => {
        const aAssigned = a.myRole ? 0 : 1;
        const bAssigned = b.myRole ? 0 : 1;
        if (aAssigned !== bAssigned) return aAssigned - bAssigned;
        if (a.myRole && b.myRole) return a.myRole === "Birincil" ? -1 : 1;
        return 0;
      });

      setMyVets(withRole);
      if (withRole.length === 1) setSelectedVet(withRole[0]);
    })();
  }, [dog.id]);

  const loadSlots = useCallback(
    async (date) => {
      if (!selectedVet || !selectedService) return;
      setSlots(null);
      setSelectedSlot(null);
      const res = await fetch("/api/vet-availability-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vetId: selectedVet.id, date, durationMinutes: selectedService.duration }),
      });
      const data = await res.json();
      setSlots(data.slots || []);
    },
    [selectedVet, selectedService]
  );

  useEffect(() => {
    if (selectedVet && selectedService) loadSlots(bookDate);
  }, [selectedVet, selectedService, bookDate, loadSlots]);

  const confirmBooking = async () => {
    setBooking(true);
    setBookMsg("");
    try {
      const res = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          vetId: selectedVet.id,
          dogId: dog.id,
          date: bookDate,
          time: selectedSlot,
          note: selectedService.name,
          durationMinutes: selectedService.duration,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onBooked();
        onClose();
      } else if (data.error === "SLOT_TAKEN") {
        setBookMsg(t.slotTakenErrorMsg);
        loadSlots(bookDate);
      } else {
        setBookMsg(data.error || t.authError);
      }
    } catch {
      setBookMsg(t.authError);
    }
    setBooking(false);
  };

  return (
    <Modal title={t.bookApptBtn} onClose={onClose}>
      {myVets === undefined ? (
        <div className="py-8 grid place-items-center text-[#5b6d63]">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : myVets.length === 0 ? (
        <p className="text-[13px] text-[#5b6d63]">{t.noBookableVets}</p>
      ) : (
        <div className="space-y-3">
          {myVets.length > 1 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold mb-1.5">{t.fieldApptVet}</p>
              <div className="max-h-52 overflow-y-auto space-y-1.5 rounded-md border border-[#d8cfb4] p-2">
                {myVets.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVet(v)}
                    className={`w-full flex items-center justify-between text-left rounded-md px-3 py-2 text-[13px] border transition ${
                      selectedVet?.id === v.id
                        ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                        : "border-[#d8cfb4] text-[#3c473f] hover:border-[#1B3A2F]/40"
                    }`}
                  >
                    <span>
                      <span className="font-medium">{v.clinic_name}</span>
                      <span className={selectedVet?.id === v.id ? "text-[#F7F3E8]/70" : "text-[#8d8560]"}>
                        {" "}
                        · {v.city}
                        {v.city && v.country ? ", " : ""}
                        {v.country}
                      </span>
                    </span>
                    {v.myRole && (
                      <span
                        className={`shrink-0 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          selectedVet?.id === v.id ? "bg-[#C9A227] text-white" : "bg-[#f3e9c8] text-[#8a6d16]"
                        }`}
                      >
                        {v.myRole.toUpperCase()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedVet && (
            <>
              <p className="text-[13px] text-[#5b6d63]">
                {t.bookApptBtn}: <span className="font-semibold text-[#1B3A2F]">{selectedVet.clinic_name}</span>
              </p>
              <Field label={t.colService}>
                <select
                  className={inputCls}
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const s = (selectedVet.services || []).find((sv) => sv.id === e.target.value);
                    setSelectedService(s ? { id: s.id, name: s.name, duration: s.duration || 30 } : null);
                  }}
                >
                  <option value="">{t.selectServiceType}</option>
                  {(selectedVet.services || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {(t.serviceNames?.[s.name] || t.groomerSpecialtyNames?.[s.name] || s.name) +
                        (s.duration ? ` · ${t.durationMinutesLabel(s.duration)}` : "")}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedService && (
                <>
                  <Field label={t.selectDateLabel}>
                    <input
                      type="date"
                      min={todayISO()}
                      className={inputCls}
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                    />
                  </Field>

                  {slots === null ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.loadingSlotsText}</p>
                  ) : slots.length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noSlotsAvailable}</p>
                  ) : (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold mb-1.5">{t.selectTimeLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSlot(s)}
                            className={`text-[12.5px] font-mono rounded-md px-2.5 py-1.5 border transition ${
                              selectedSlot === s
                                ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                                : "border-[#d8cfb4] text-[#3c473f] hover:border-[#1B3A2F]/40"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {bookMsg && <p className="text-[12.5px] text-[#a63d40]">{bookMsg}</p>}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>{t.cancel}</GhostButton>
        {selectedSlot && (
          <PrimaryButton disabled={booking} onClick={confirmBooking} icon={Check}>
            {t.confirmBookingBtn}
          </PrimaryButton>
        )}
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

function VetBookedApptCard({ appt, onCancel }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const statusCfg = {
    scheduled: { label: t.apptStatusBooked, cls: "bg-[#C9A227] text-white" },
    done: { label: t.apptStatusCompleted, cls: "bg-[#1B3A2F] text-[#F7F3E8]" },
    cancelled: { label: t.apptStatusCancelled, cls: "bg-[#8d8560] text-white" },
    rescheduled: { label: t.apptStatusRescheduled, cls: "bg-[#6b7db3] text-white" },
  }[appt.status] || { label: appt.status, cls: "bg-[#8d8560] text-white" };

  return (
    <div className="rounded-xl border border-[#C9A227]/40 bg-[#FBF8EE] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-dashed border-[#d8cfb4]">
        <div className="flex items-center gap-2.5">
          <CalendarClock size={16} className="text-[#1B3A2F]" />
          <span className="font-display text-[16px] text-[#1B3A2F]">{t.vetBookedApptBadge}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${statusCfg.cls}`}>{statusCfg.label}</span>
          {appt.status === "scheduled" && (
            <button onClick={() => onCancel(appt.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="px-5 py-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldApptDate}</p>
          <p className="text-[#1f2a24]">{fmtDate(appt.appt_date, locale)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.fieldApptTime}</p>
          <p className="text-[#1f2a24] font-mono">
            {appt.appt_time}
            {appt.appt_end_time ? `–${appt.appt_end_time}` : ""}
          </p>
        </div>
        {appt.note && (
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.apptNoteLabel}</p>
            <p className="text-[#1f2a24]">{appt.note}</p>
          </div>
        )}
        {appt.status_note && (
          <div>
            <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">{t.statusNoteLabel}</p>
            <p className="text-[#1f2a24]">{appt.status_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentTab({ dog, session, onAdd, onDelete }) {
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [vetAppts, setVetAppts] = useState([]);
  const appts = [...(dog.appointments || [])].sort((a, b) => (a.date < b.date ? 1 : -1));

  const loadVetAppts = useCallback(async () => {
    const { data } = await supabase
      .from("vet_appointments")
      .select("*")
      .eq("dog_id", dog.id)
      .order("appt_date", { ascending: false });
    if (data) setVetAppts(data);
  }, [dog.id]);

  useEffect(() => {
    loadVetAppts();
  }, [loadVetAppts]);

  const cancelVetAppt = async (id) => {
    await supabase.from("vet_appointments").update({ status: "cancelled" }).eq("id", id);
    loadVetAppts();
  };

  const totalCount = appts.length + vetAppts.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.appointmentsTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.appointmentsSubtitle(dog.name, totalCount)}</p>
        </div>
        <div className="flex gap-2">
          <GhostButton icon={CalendarClock} onClick={() => setShowBooking(true)}>
            {t.bookApptBtn}
          </GhostButton>
          <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
            {t.addAppointmentBtn}
          </PrimaryButton>
        </div>
      </div>

      {totalCount === 0 ? (
        <EmptyState icon={CalendarClock} text={t.appointmentsEmpty} />
      ) : (
        <div className="space-y-3">
          {vetAppts.map((a) => (
            <VetBookedApptCard key={a.id} appt={a} onCancel={cancelVetAppt} />
          ))}
          {appts.map((a) => (
            <AppointmentCard key={a.id} appt={a} onDelete={onDelete} />
          ))}
        </div>
      )}

      {showBooking && (
        <BookAppointmentModal
          dog={dog}
          session={session}
          onClose={() => setShowBooking(false)}
          onBooked={loadVetAppts}
        />
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

/* ------------------------------------------------------------------ */
/*  Weight & growth tab                                                 */
/* ------------------------------------------------------------------ */

function AddWeightModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");

  const submit = () => {
    const w = parseFloat(weight);
    if (!date || !w || w <= 0) return;
    onSave({ id: uid(), date, weight: w });
  };

  return (
    <Modal title={t.addWeightModalTitle} onClose={onClose}>
      <div className="space-y-3.5">
        <Field label={t.fieldWeightDate}>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t.fieldWeightKg}>
          <input
            type="number"
            step="0.1"
            min="0"
            className={inputCls}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="12.5"
          />
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

function WeightChart({ entries, idealWeight, t, locale }) {
  const data = [...entries]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((e) => ({
      date: e.date,
      weight: e.weight,
      label: new Date(e.date + "T00:00:00").toLocaleDateString(locale || "en-US", { month: "short", year: "numeric" }),
    }));

  const maxRecorded = Math.max(...data.map((d) => d.weight), 0);
  const upperBound = Math.ceil(Math.max(maxRecorded * 1.5, idealWeight || 0));

  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-4 mb-5" style={{ height: 260 }}>
      <p className="font-display text-[15px] text-[#1B3A2F] mb-2">{t.weightChartTitle}</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3d9bd" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b6d63" }} />
          <YAxis tick={{ fontSize: 11, fill: "#5b6d63" }} domain={[0, upperBound]} />
          <Tooltip
            contentStyle={{ background: "#FBF8EE", border: "1px solid #d8cfb4", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value} kg`, ""]}
          />
          {idealWeight > 0 && (
            <ReferenceLine
              y={idealWeight}
              stroke="#C9A227"
              strokeDasharray="4 4"
              label={{ value: t.weightChartIdealLine, fontSize: 10, fill: "#8a6d16", position: "insideTopRight" }}
            />
          )}
          <Line type="monotone" dataKey="weight" stroke="#1B3A2F" strokeWidth={2.5} dot={{ r: 3.5, fill: "#1B3A2F" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WeightTab({ dog, onSaveIdeal, onAdd, onDelete }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const [showAdd, setShowAdd] = useState(false);
  const [idealInput, setIdealInput] = useState(dog.idealWeight || "");
  const entries = [...(dog.weightEntries || [])];
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5 mb-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Field label={t.fieldIdealWeight}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={inputCls}
              value={idealInput}
              onChange={(e) => setIdealInput(e.target.value)}
            />
          </Field>
        </div>
        <PrimaryButton onClick={() => onSaveIdeal(parseFloat(idealInput) || 0)}>{t.saveIdealWeightBtn}</PrimaryButton>
      </div>

      {entries.length > 1 && <WeightChart entries={entries} idealWeight={dog.idealWeight || 0} t={t} locale={locale} />}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.weightTitle}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.weightSubtitle(dog.name, entries.length)}</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          {t.addWeightBtn}
        </PrimaryButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Scale} text={t.weightEmpty} />
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Scale size={16} className="text-[#1B3A2F]" />
                <span className="text-[14px] text-[#1f2a24]">{fmtDate(entry.date, locale)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[14px] font-semibold text-[#1B3A2F]">{entry.weight} kg</span>
                <button onClick={() => onDelete(entry.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddWeightModal
          onClose={() => setShowAdd(false)}
          onSave={(entry) => {
            onAdd(entry);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function VetDetailModal({ vet, dog, session, onClose }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const specialties = Array.isArray(vet.specialty) ? vet.specialty : vet.specialty ? [vet.specialty] : [];
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookDate, setBookDate] = useState(todayISO());
  const [slots, setSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookMsg, setBookMsg] = useState("");

  const loadSlots = useCallback(
    async (date) => {
      if (!selectedService) return;
      setSlots(null);
      setSelectedSlot(null);
      const res = await fetch("/api/vet-availability-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vetId: vet.id, date, durationMinutes: selectedService.duration }),
      });
      const data = await res.json();
      setSlots(data.slots || []);
    },
    [vet.id, selectedService]
  );

  useEffect(() => {
    if (showBooking && selectedService) loadSlots(bookDate);
  }, [showBooking, bookDate, selectedService, loadSlots]);

  const confirmBooking = async () => {
    setBooking(true);
    setBookMsg("");
    try {
      const res = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          vetId: vet.id,
          dogId: dog.id,
          date: bookDate,
          time: selectedSlot,
          note: selectedService.name,
          durationMinutes: selectedService.duration,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookMsg(t.bookingSuccessMsg);
        setSelectedSlot(null);
        loadSlots(bookDate);
      } else if (data.error === "SLOT_TAKEN") {
        setBookMsg(t.slotTakenErrorMsg);
        loadSlots(bookDate);
      } else {
        setBookMsg(data.error || t.authError);
      }
    } catch {
      setBookMsg(t.authError);
    }
    setBooking(false);
  };

  return (
    <Modal title={vet.clinic_name} onClose={onClose} wide>
      <div className="flex items-center gap-4 mb-5">
        <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center shrink-0">
          {vet.logo ? (
            <img src={vet.logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 size={22} className="text-[#8d8560]" />
          )}
        </div>
        <div>
          <p className="font-display text-[19px] text-[#1B3A2F] leading-tight">{vet.clinic_name}</p>
          <p className="text-[12.5px] text-[#5b6d63]">
            {vet.city}
            {vet.city && vet.country ? ", " : ""}
            {vet.country}
          </p>
        </div>
      </div>

      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties.map((s) => (
            <span key={s} className="text-[11.5px] font-medium text-[#8a6d16] bg-[#f3e9c8] rounded-full px-2.5 py-1">
              {t.specialtyNames?.[s] || t.groomerSpecialtyNames?.[s] || s}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1.5 mb-5">
        {vet.address && (
          <p className="text-[13px] text-[#3c473f] flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[#8d8560]" /> {vet.address}
          </p>
        )}
        {vet.phone && (
          <p className="text-[13px] text-[#3c473f] flex items-center gap-2 font-mono">
            <Phone size={14} className="shrink-0 text-[#8d8560]" /> {vet.phone}
          </p>
        )}
        {vet.email && (
          <p className="text-[13px] text-[#3c473f] flex items-center gap-2">
            <User size={14} className="shrink-0 text-[#8d8560]" /> {vet.email}
          </p>
        )}
        {vet.website && (
          <p className="text-[13px] flex items-center gap-2">
            <Globe size={14} className="shrink-0 text-[#8d8560]" />
            <a
              href={vet.website.startsWith("http") ? vet.website : `https://${vet.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B3A2F] underline underline-offset-2"
            >
              {vet.website}
            </a>
          </p>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.vetServicesTitle}</p>
      {(vet.services || []).length === 0 ? (
        <p className="text-[13px] text-[#5b6d63] mb-2">{t.noServicesListed}</p>
      ) : (
        <div className="space-y-1 mb-2">
          {vet.services.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-[13px] py-1.5 px-3 rounded-md bg-white/50">
              <span className="text-[#1f2a24] font-medium">{t.serviceNames?.[s.name] || s.name}</span>
              {s.price && (
                <span className="text-[#8a6d16] font-semibold">
                  {s.price} {s.currency || "EUR"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {(vet.availability || []).length > 0 && (
        <div className="mb-2">
          {!showBooking ? (
            <PrimaryButton icon={CalendarClock} onClick={() => setShowBooking(true)}>
              {t.bookApptBtn}
            </PrimaryButton>
          ) : (
            <div className="rounded-md border border-[#C9A227]/40 bg-[#FBF8EE] p-3.5 space-y-2.5">
              <Field label={t.colService}>
                <select
                  className={inputCls}
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const s = (vet.services || []).find((sv) => sv.id === e.target.value);
                    setSelectedService(s ? { id: s.id, name: s.name, duration: s.duration || 30 } : null);
                  }}
                >
                  <option value="">{t.selectServiceType}</option>
                  {(vet.services || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {(t.serviceNames?.[s.name] || t.groomerSpecialtyNames?.[s.name] || s.name) +
                        (s.duration ? ` · ${t.durationMinutesLabel(s.duration)}` : "")}
                    </option>
                  ))}
                </select>
              </Field>

              {selectedService && (
                <Field label={t.selectDateLabel}>
                  <input
                    type="date"
                    min={todayISO()}
                    className={inputCls}
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                  />
                </Field>
              )}

              {selectedService && (
                <>
                  {slots === null ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.loadingSlotsText}</p>
                  ) : slots.length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noSlotsAvailable}</p>
                  ) : (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold mb-1.5">{t.selectTimeLabel}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSlot(s)}
                            className={`text-[12.5px] font-mono rounded-md px-2.5 py-1.5 border transition ${
                              selectedSlot === s
                                ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                                : "border-[#d8cfb4] text-[#3c473f] hover:border-[#1B3A2F]/40"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedSlot && (
                <>
                  <PrimaryButton disabled={booking} onClick={confirmBooking} icon={Check}>
                    {t.confirmBookingBtn}
                  </PrimaryButton>
                </>
              )}

              {bookMsg && <p className="text-[12.5px] text-[#8a6d16]">{bookMsg}</p>}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <GhostButton onClick={onClose}>{t.closeBtn}</GhostButton>
      </div>
    </Modal>
  );
}

function VetTab({ dog, session, isPremium, onRequirePremium }) {
  const { t } = useI18n();
  const [vetsList, setVetsList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedVetDetail, setSelectedVetDetail] = useState(null);

  const load = useCallback(async () => {
    const { data: vetsData } = await supabase.from("vets").select("*").eq("approved", true).order("clinic_name");
    if (vetsData) setVetsList(vetsData);
    const { data: reqData } = await supabase
      .from("vet_assignment_requests")
      .select("*")
      .eq("dog_id", dog.id)
      .order("created_at", { ascending: false });
    if (reqData) setRequests(reqData);
    setLoaded(true);
  }, [dog.id]);

  useEffect(() => {
    load();
  }, [load]);

  // en son isteği her rol için al (pending veya approved olan aktif kabul edilir)
  const latestByRole = (role) =>
    requests.filter((r) => r.role === role && r.status !== "rejected").sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];

  const primaryReq = latestByRole("Birincil");
  const secondaryReq = latestByRole("İkincil");
  const activeVetIds = [primaryReq, secondaryReq].filter(Boolean).map((r) => r.vet_id);

  const requestVet = async (vetId, role) => {
    // aynı rol için varsa eski isteği kaldır
    const existing = latestByRole(role);
    if (existing) {
      await supabase.from("vet_assignment_requests").delete().eq("id", existing.id);
    }
    await supabase.from("vet_assignment_requests").insert({
      dog_id: dog.id,
      dog_name: dog.name,
      owner_user_id: session.user.id,
      vet_id: vetId,
      role,
      status: "pending",
    });
    logActivity(session.user.id, "vet_requested", `${role} — ${dog.name}`);
    load();
  };

  const cancelRequest = async (id) => {
    await supabase.from("vet_assignment_requests").delete().eq("id", id);
    logActivity(session.user.id, "vet_request_cancelled", dog.name);
    load();
  };

  const AssignmentRow = ({ req }) => {
    const vet = vetsList.find((v) => v.id === req.vet_id);
    if (!vet) return null;
    return (
      <div className="flex items-center justify-between rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#1B3A2F] text-[#F7F3E8] grid place-items-center font-display text-[15px]">
            {vet.clinic_name[0]}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1B3A2F]">{vet.clinic_name}</p>
            <p className="text-[12px] text-[#5b6d63]">
              {vet.city}
              {vet.city && vet.country ? ", " : ""}
              {vet.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10.5px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
              req.status === "approved"
                ? req.role === "Birincil"
                  ? "bg-[#1B3A2F] text-[#F7F3E8]"
                  : "bg-[#C9A227] text-white"
                : "bg-[#8d8560] text-white"
            }`}
          >
            {req.status === "approved" ? req.role.toUpperCase() : t.pendingApprovalBadge}
          </span>
          <button onClick={() => cancelRequest(req.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  if (!loaded) {
    return (
      <div className="py-16 grid place-items-center text-[#5b6d63]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.vetTabTitle}</h3>
        <p className="text-[13px] text-[#5b6d63]">{t.vetTabSubtitle(dog.name)}</p>
      </div>

      {(primaryReq || secondaryReq) && (
        <div className="mb-5 space-y-2">
          {primaryReq && <AssignmentRow req={primaryReq} />}
          {secondaryReq && <AssignmentRow req={secondaryReq} />}
        </div>
      )}

      <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#5b6d63] mb-2.5">{t.platformVetsLabel}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {vetsList.map((vet) => {
          const isPrimary = primaryReq?.vet_id === vet.id;
          const isSecondary = secondaryReq?.vet_id === vet.id;
          return (
            <div key={vet.id} className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-4 flex flex-col gap-2.5">
              <button
                onClick={() => setSelectedVetDetail(vet)}
                className="flex items-start justify-between gap-2 text-left"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="h-9 w-9 rounded-md overflow-hidden bg-[#eee6cd] grid place-items-center shrink-0">
                    {vet.logo ? (
                      <img src={vet.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={16} className="text-[#8d8560]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#1B3A2F] truncate">{vet.clinic_name}</p>
                    <p className="text-[11.5px] text-[#8d8560] flex items-center gap-1 mt-0.5">
                      <MapPin size={11} />
                      {vet.city}
                      {vet.city && vet.country ? ", " : ""}
                      {vet.country}
                    </p>
                  </div>
                </div>
                {vet.rating > 0 && (
                  <span className="flex items-center gap-1 text-[12px] text-[#8a6d16] font-semibold shrink-0">
                    <Star size={12} className="fill-[#C9A227] text-[#C9A227]" /> {vet.rating}
                  </span>
                )}
              </button>
              {vet.specialty && vet.specialty.length > 0 && (
                <p className="text-[12px] text-[#5b6d63] flex items-center gap-1">
                  <Stethoscope size={12} />{" "}
                  {(Array.isArray(vet.specialty) ? vet.specialty : [vet.specialty]).map((s) => t.specialtyNames?.[s] || t.groomerSpecialtyNames?.[s] || s).join(", ")}
                </p>
              )}
              {vet.phone && (
                <p className="text-[12px] text-[#5b6d63] flex items-center gap-1 font-mono">
                  <Phone size={12} /> {vet.phone}
                </p>
              )}
              <button
                onClick={() => setSelectedVetDetail(vet)}
                className="text-[12px] text-[#5b6d63] underline underline-offset-2 text-left w-fit"
              >
                {t.viewDetailsBtn}
              </button>
              <div className="flex gap-2 mt-1">
                <button
                  disabled={isPrimary}
                  onClick={() => requestVet(vet.id, "Birincil")}
                  className="flex-1 rounded-md border border-[#1B3A2F] text-[#1B3A2F] text-[12px] font-semibold py-1.5 hover:bg-[#1B3A2F] hover:text-[#F7F3E8] transition disabled:opacity-40"
                >
                  {t.makePrimaryBtn}
                </button>
                <button
                  disabled={isSecondary}
                  onClick={() => (isPremium ? requestVet(vet.id, "İkincil") : onRequirePremium())}
                  className="flex-1 rounded-md border border-[#C9A227] text-[#8a6d16] text-[12px] font-semibold py-1.5 hover:bg-[#C9A227] hover:text-white transition disabled:opacity-40"
                >
                  {t.makeSecondaryBtn}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {selectedVetDetail && (
        <VetDetailModal vet={selectedVetDetail} dog={dog} session={session} onClose={() => setSelectedVetDetail(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pet CV — printable full summary                                     */
/* ------------------------------------------------------------------ */

function PetCVTab({ dog, session, isPremium, onRequirePremium }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const [assignedVets, setAssignedVets] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: reqData } = await supabase
        .from("vet_assignment_requests")
        .select("*")
        .eq("dog_id", dog.id)
        .eq("status", "approved");
      if (reqData && reqData.length > 0) {
        const vetIds = reqData.map((r) => r.vet_id);
        const { data: vetsData } = await supabase.from("vets").select("*").in("id", vetIds);
        const merged = reqData.map((r) => ({ ...r, vet: vetsData?.find((v) => v.id === r.vet_id) }));
        setAssignedVets(merged);
      }
      setLoaded(true);
    })();
  }, [dog.id]);

  const sortedVaccines = [...(dog.vaccines || [])].sort((a, b) => (a.date < b.date ? 1 : -1));
  const sortedWeights = [...(dog.weightEntries || [])].sort((a, b) => (a.date < b.date ? -1 : 1));
  const currentWeight = sortedWeights[sortedWeights.length - 1];
  const ownerPhone = fmtPhone(dog.ownerPhoneCode, dog.ownerPhoneNumber);
  const birthPlace = [dog.birthCity, dog.birthCountry].filter(Boolean).join(", ");
  const livingPlace = [dog.livingCity, dog.livingCountry].filter(Boolean).join(", ");

  const CvRow = ({ label, value }) => (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-dotted border-[#d8cfb4]">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold shrink-0">{label}</span>
      <span className="text-right text-[13.5px] text-[#1f2a24]">{value || "—"}</span>
    </div>
  );

  if (!isPremium) {
    return (
      <div className="rounded-2xl border border-dashed border-[#C9A227]/50 bg-[#FBF8EE]/60 py-16 flex flex-col items-center gap-3 text-center px-6">
        <div className="h-12 w-12 rounded-full bg-[#C9A227] grid place-items-center">
          <Crown size={22} className="text-white" />
        </div>
        <p className="text-[13.5px] text-[#5b6d63] max-w-sm">{t.limitReachedCv}</p>
        <PrimaryButton icon={Crown} onClick={onRequirePremium}>
          {t.seePremiumBtn}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pet-cv-printable, #pet-cv-printable * { visibility: visible; }
          #pet-cv-printable { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
      `}</style>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">{t.petCvTitle(dog.name)}</h3>
          <p className="text-[13px] text-[#5b6d63]">{t.petCvSubtitle}</p>
        </div>
        <PrimaryButton icon={FileText} onClick={() => window.print()}>
          {t.downloadPdfBtn}
        </PrimaryButton>
      </div>

      <div id="pet-cv-printable" className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[#1B3A2F] mb-5">
          <Award size={18} />
          <span className="font-display text-[13px] tracking-[0.18em] uppercase">Paw Wallet — Pet CV</span>
        </div>

        <div className="flex gap-4 sm:gap-6 mb-6">
          <div className="shrink-0">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint size={30} className="text-[#a89c6e]" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="font-display text-[26px] text-[#1B3A2F] leading-tight">{dog.name}</h2>
            <p className="text-[13px] text-[#5b6d63]">{dog.breed}</p>
          </div>
          <div className="shrink-0">
            <div className="h-24 w-24 rounded-lg overflow-hidden border-2 border-[#C9A227]/40 bg-white grid place-items-center p-1.5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(
                  `${window.location.origin}/?lost=${dog.id}`
                )}`}
                alt="QR"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvIdentitySection}</p>
        <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
          <div>
            <CvRow label={t.rowBirthDate} value={fmtDate(dog.birthDate, locale)} />
            <CvRow label={t.rowGender} value={dog.gender === "Dişi" ? t.female : t.male} />
            <CvRow label={t.rowNeutered} value={dog.neutered === "Evet" ? t.neuteredYes : t.neuteredNo} />
            <CvRow label={t.rowColor} value={t.colorNames?.[dog.color] || dog.color} />
          </div>
          <div>
            <CvRow label={t.rowMicrochip} value={dog.microchip} />
            <CvRow label={t.rowPassportNo} value={dog.passportNumber} />
            <CvRow label={t.rowBirthPlace} value={birthPlace} />
            <CvRow label={t.rowLivingPlace} value={livingPlace} />
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvHealthSection}</p>
        <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
          <CvRow label={t.fieldChronicConditions} value={dog.chronicConditions} />
          <CvRow label={t.fieldAllergies} value={dog.allergies} />
        </div>

        <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvWeightSection}</p>
        <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
          <CvRow label={t.cvCurrentWeight} value={currentWeight ? `${currentWeight.weight} kg (${fmtDate(currentWeight.date, locale)})` : t.cvNoWeight} />
          <CvRow label={t.cvIdealWeight} value={dog.idealWeight ? `${dog.idealWeight} kg` : "—"} />
        </div>

        <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvVaccinesSection}</p>
        {sortedVaccines.length === 0 ? (
          <p className="text-[13px] text-[#5b6d63] mb-5">{t.cvNoVaccines}</p>
        ) : (
          <div className="mb-5 space-y-1">
            {sortedVaccines.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-[13px] py-1 border-b border-dotted border-[#d8cfb4]">
                <span className="text-[#1f2a24] font-medium">{v.name}</span>
                <span className="text-[#5b6d63]">{fmtDate(v.date, locale)}{v.vet ? ` · ${v.vet}` : ""}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvVetSection}</p>
        {!loaded ? (
          <Loader2 className="animate-spin text-[#5b6d63]" size={16} />
        ) : assignedVets.length === 0 ? (
          <p className="text-[13px] text-[#5b6d63] mb-2">{t.cvNoVet}</p>
        ) : (
          <div className="space-y-1 mb-2">
            {assignedVets.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-[13px] py-1 border-b border-dotted border-[#d8cfb4]">
                <span className="text-[#1f2a24] font-medium">{a.vet?.clinic_name || "—"}</span>
                <span className="text-[#5b6d63]">{a.role}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10.5px] text-[#8d8560] mt-6">{t.cvGeneratedOn(fmtDate(todayISO(), locale))}</p>
      </div>
    </div>
  );
}


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
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSentTo, setResetSentTo] = useState("");

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

  const submitForgotPassword = async () => {
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || t.authError);
      return;
    }
    setResetSentTo(email);
  };

  if (resetSentTo) {
    return (
      <Modal title={t.resetLinkSentTitle} onClose={onClose}>
        <p className="text-[14px] text-[#3c473f] leading-relaxed">{t.resetLinkSentDesc(resetSentTo)}</p>
        <div className="mt-6 flex justify-end">
          <GhostButton onClick={onClose}>{t.backToForm}</GhostButton>
        </div>
      </Modal>
    );
  }

  if (forgotMode) {
    return (
      <Modal title={t.forgotPasswordTitle} onClose={onClose}>
        <div className="space-y-3.5">
          <p className="text-[13.5px] text-[#5b6d63]">{t.forgotPasswordDesc}</p>
          <Field label={t.fieldEmail}>
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <p className="text-[13px] text-[#a63d40]">{error}</p>}
          <PrimaryButton onClick={submitForgotPassword} full icon={loading ? Loader2 : Check}>
            {t.sendResetLinkBtn}
          </PrimaryButton>
          <button
            onClick={() => setForgotMode(false)}
            className="w-full text-center text-[12.5px] text-[#5b6d63] hover:text-[#1B3A2F] underline underline-offset-2 mt-1"
          >
            {t.backToForm}
          </button>
        </div>
      </Modal>
    );
  }

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

        {mode === "login" && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setForgotMode(true);
            }}
            className="text-[12.5px] text-[#5b6d63] hover:text-[#1B3A2F] underline underline-offset-2 -mt-1"
          >
            {t.forgotPasswordLink}
          </button>
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

/* ------------------------------------------------------------------ */
/*  Admin Panel                                                         */
/* ------------------------------------------------------------------ */

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-4">
      <p className="text-[11px] uppercase tracking-wider text-[#8d8560] font-semibold mb-1">{label}</p>
      <p className="font-display text-[26px] text-[#1B3A2F]">{value ?? "—"}</p>
    </div>
  );
}

function AdminPanel({ session }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [vetForm, setVetForm] = useState({
    businessType: "vet",
    clinicName: "",
    city: "",
    country: "",
    specialty: [],
    phoneCode: "",
    phoneNumber: "",
    email: "",
  });
  const [vetBusy, setVetBusy] = useState(false);
  const [vetMsg, setVetMsg] = useState("");
  const [svcForm, setSvcForm] = useState({ name: "", service_type: "Köpek Yürüyüşü", city: "", country: "", phone: "" });
  const [svcBusy, setSvcBusy] = useState(false);
  const [svcMsg, setSvcMsg] = useState("");
  const [pwForm, setPwForm] = useState({ email: "", newPassword: "" });
  const [newUserForm, setNewUserForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [newUserBusy, setNewUserBusy] = useState(false);
  const [newUserMsg, setNewUserMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [vetsList, setVetsList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [emailFilterInput, setEmailFilterInput] = useState("");

  const loadLogs = useCallback(
    async (emailFilter = "") => {
      setLogsLoading(true);
      try {
        const url = emailFilter ? `/api/admin?action=logs&email=${encodeURIComponent(emailFilter)}` : "/api/admin?action=logs";
        const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
        const data = await res.json();
        setLogs(data.logs || []);
      } catch {
        /* ignore */
      }
      setLogsLoading(false);
    },
    [session]
  );

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?action=stats", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch {
      /* ignore */
    }
  }, [session]);

  const loadVets = useCallback(async () => {
    const { data } = await supabase.from("vets").select("*").order("created_at", { ascending: false });
    if (data) setVetsList(data);
  }, []);

  useEffect(() => {
    loadStats();
    loadVets();
    loadLogs();
  }, [loadStats, loadVets, loadLogs]);

  const submitVet = async () => {
    if (!vetForm.clinicName.trim() || !vetForm.email.trim()) return;
    setVetBusy(true);
    setVetMsg("");
    try {
      const res = await fetch("/api/admin?action=create-vet", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          businessType: vetForm.businessType,
          clinicName: vetForm.clinicName,
          city: vetForm.city,
          country: vetForm.country,
          specialty: vetForm.specialty,
          phone: fmtPhone(vetForm.phoneCode, vetForm.phoneNumber),
          email: vetForm.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setVetMsg(t.vetInviteSuccess(vetForm.email));
        setVetForm({
          businessType: "vet",
          clinicName: "",
          city: "",
          country: "",
          specialty: [],
          phoneCode: "",
          phoneNumber: "",
          email: "",
        });
        loadStats();
        loadVets();
      } else {
        setVetMsg(data.error || t.authError);
      }
    } catch {
      setVetMsg(t.authError);
    }
    setVetBusy(false);
  };

  const submitServiceProvider = async () => {
    if (!svcForm.name.trim()) return;
    setSvcBusy(true);
    setSvcMsg("");
    const { error } = await supabase.from("service_providers").insert(svcForm);
    if (!error) {
      setSvcMsg(t.serviceProviderAdded);
      setSvcForm({ name: "", service_type: "Köpek Yürüyüşü", city: "", country: "", phone: "" });
      loadStats();
    } else {
      setSvcMsg(error.message);
    }
    setSvcBusy(false);
  };

  const submitPasswordChange = async () => {
    if (!pwForm.email.trim() || pwForm.newPassword.length < 6) return;
    setPwBusy(true);
    setPwMsg("");
    try {
      const res = await fetch("/api/admin?action=set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ email: pwForm.email, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg(t.passwordChangedSuccess);
        setPwForm({ email: "", newPassword: "" });
      } else {
        setPwMsg(data.error || t.authError);
      }
    } catch {
      setPwMsg(t.authError);
    }
    setPwBusy(false);
  };

  const submitCreateUser = async () => {
    if (!newUserForm.email.trim() || newUserForm.password.length < 6) return;
    setNewUserBusy(true);
    setNewUserMsg("");
    try {
      const res = await fetch("/api/admin?action=create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNewUserMsg(t.userCreateSuccess(newUserForm.email));
        setNewUserForm({ email: "", password: "", firstName: "", lastName: "" });
        loadStats();
      } else {
        setNewUserMsg(data.error || t.authError);
      }
    } catch {
      setNewUserMsg(t.authError);
    }
    setNewUserBusy(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body overflow-x-hidden" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
              <ShieldAlert size={19} className="text-[#F7F3E8]" />
            </div>
            <h1 className="font-display text-[22px] text-[#1B3A2F] leading-none">{t.adminPanelTitle}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <button
              onClick={() => {
                logActivity(session.user.id, "logout", session.user.email);
                supabase.auth.signOut();
              }}
              className="text-[12.5px] font-medium text-[#5b6d63] hover:text-[#a63d40] underline underline-offset-2"
            >
              {t.logOut}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard label={t.adminStatsUsers} value={stats?.totalUsers} />
          <StatCard label={t.adminStatsOwners} value={stats?.totalOwners} />
          <StatCard label={t.adminStatsVetAccounts} value={stats?.totalVetAccounts} />
          <StatCard label={t.adminStatsVetListings} value={stats?.vetListingCount} />
          <StatCard label={t.adminStatsPendingRequests} value={stats?.pendingRequestCount} />
          <StatCard label={t.adminStatsServiceProviders} value={stats?.serviceProviderCount} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5">
            <p className="font-display text-[16px] text-[#1B3A2F] mb-3 flex items-center gap-2">
              <UserCog size={16} /> {t.addVetSectionTitle}
            </p>
            <div className="space-y-3">
              <Field label={t.fieldBusinessType}>
                <div className="flex gap-2">
                  {Object.entries(t.businessTypeNames).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVetForm((f) => ({ ...f, businessType: key, specialty: [] }))}
                      className={`flex-1 rounded-md border px-3 py-2 text-[13px] font-semibold transition ${
                        vetForm.businessType === key
                          ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                          : "border-[#d8cfb4] text-[#5b6d63] hover:border-[#1B3A2F]/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t.fieldClinicName}>
                <input
                  className={inputCls}
                  value={vetForm.clinicName}
                  onChange={(e) => setVetForm((f) => ({ ...f, clinicName: e.target.value }))}
                />
              </Field>
              <CountryCityPicker
                t={t}
                countryLabel={t.fieldVetCountry}
                cityLabel={t.fieldVetCity}
                country={vetForm.country}
                city={vetForm.city}
                onCountryChange={(v) => setVetForm((f) => ({ ...f, country: v }))}
                onCityChange={(v) => setVetForm((f) => ({ ...f, city: v }))}
              />
              <SpecialtyMultiSelect
                label={t.fieldVetSpecialty}
                value={vetForm.specialty}
                onChange={(v) => setVetForm((f) => ({ ...f, specialty: v }))}
                options={vetForm.businessType === "groomer" ? GROOMER_SPECIALTY_KEYS : VET_SPECIALTY_KEYS}
                nameMap={vetForm.businessType === "groomer" ? t.groomerSpecialtyNames : t.specialtyNames}
              />
              <PhoneField
                label={t.fieldVetPhone}
                code={vetForm.phoneCode}
                number={vetForm.phoneNumber}
                onCodeChange={(v) => setVetForm((f) => ({ ...f, phoneCode: v }))}
                onNumberChange={(v) => setVetForm((f) => ({ ...f, phoneNumber: v }))}
              />
              <Field label={t.fieldVetEmail}>
                <input
                  type="email"
                  className={inputCls}
                  value={vetForm.email}
                  onChange={(e) => setVetForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              {vetMsg && <p className="text-[12.5px] text-[#5b6d63]">{vetMsg}</p>}
              <PrimaryButton full onClick={submitVet} icon={vetBusy ? Loader2 : Check}>
                {t.createVetAccountBtn}
              </PrimaryButton>
            </div>
          </div>

          <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5">
            <p className="font-display text-[16px] text-[#1B3A2F] mb-3 flex items-center gap-2">
              <Building2 size={16} /> {t.addServiceProviderSectionTitle}
            </p>
            <div className="space-y-3">
              <Field label={t.fieldServiceName}>
                <input
                  className={inputCls}
                  value={svcForm.name}
                  onChange={(e) => setSvcForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label={t.fieldServiceType}>
                <select
                  className={inputCls}
                  value={svcForm.service_type}
                  onChange={(e) => setSvcForm((f) => ({ ...f, service_type: e.target.value }))}
                >
                  <option value="Köpek Yürüyüşü">{t.serviceTypeWalking}</option>
                  <option value="Pet Taksi">{t.serviceTypeTaxi}</option>
                  <option value="Diğer">{t.serviceTypeOther}</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t.fieldVetCity}>
                  <input
                    className={inputCls}
                    value={svcForm.city}
                    onChange={(e) => setSvcForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </Field>
                <Field label={t.fieldVetCountry}>
                  <input
                    className={inputCls}
                    value={svcForm.country}
                    onChange={(e) => setSvcForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label={t.fieldVetPhone}>
                <input
                  className={inputCls}
                  value={svcForm.phone}
                  onChange={(e) => setSvcForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Field>
              {svcMsg && <p className="text-[12.5px] text-[#5b6d63]">{svcMsg}</p>}
              <PrimaryButton full onClick={submitServiceProvider} icon={svcBusy ? Loader2 : Check}>
                {t.createServiceProviderBtn}
              </PrimaryButton>
            </div>
          </div>

          <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5">
            <p className="font-display text-[16px] text-[#1B3A2F] mb-3 flex items-center gap-2">
              <UserCog size={16} /> {t.changePasswordSectionTitle}
            </p>
            <div className="space-y-3">
              <Field label={t.fieldUserEmail}>
                <input
                  type="email"
                  className={inputCls}
                  value={pwForm.email}
                  onChange={(e) => setPwForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              <Field label={t.fieldNewPassword}>
                <input
                  type="password"
                  className={inputCls}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                />
              </Field>
              {pwMsg && <p className="text-[12.5px] text-[#5b6d63]">{pwMsg}</p>}
              <PrimaryButton full onClick={submitPasswordChange} icon={pwBusy ? Loader2 : Check}>
                {t.changePasswordBtn}
              </PrimaryButton>
            </div>
          </div>

          <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5">
            <p className="font-display text-[16px] text-[#1B3A2F] mb-1 flex items-center gap-2">
              <UserPlus size={16} /> {t.createUserSectionTitle}
            </p>
            <p className="text-[12px] text-[#5b6d63] mb-3">{t.createUserSectionSubtitle}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label={t.fieldFirstName}>
                  <input
                    className={inputCls}
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </Field>
                <Field label={t.fieldLastName}>
                  <input
                    className={inputCls}
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label={t.fieldUserEmail}>
                <input
                  type="email"
                  className={inputCls}
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              <Field label={t.fieldPassword}>
                <input
                  type="text"
                  className={monoInputCls}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm((f) => ({ ...f, password: e.target.value }))}
                />
              </Field>
              {newUserMsg && <p className="text-[12.5px] text-[#5b6d63]">{newUserMsg}</p>}
              <PrimaryButton full onClick={submitCreateUser} icon={newUserBusy ? Loader2 : Check}>
                {t.createUserBtn}
              </PrimaryButton>
            </div>
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#5b6d63] mb-2.5">{t.vetListSectionTitle}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {vetsList.map((vet) => (
            <div key={vet.id} className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-4">
              <p className="text-[14px] font-semibold text-[#1B3A2F]">{vet.clinic_name}</p>
              <p className="text-[12px] text-[#5b6d63]">
                {vet.city}
                {vet.city && vet.country ? ", " : ""}
                {vet.country}
              </p>
              <p className="text-[11.5px] text-[#8d8560] mt-1">
                {vet.user_id ? "✓ " + t.logInBtn : "—"} {vet.phone && `· ${vet.phone}`}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#5b6d63]">{t.activityLogsTitle}</p>
            <div className="flex items-center gap-2">
              <input
                className={inputCls + " !py-1.5 !text-[12.5px] w-52"}
                placeholder={t.fieldFilterByEmail}
                value={emailFilterInput}
                onChange={(e) => setEmailFilterInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadLogs(emailFilterInput)}
              />
              <GhostButton onClick={() => loadLogs(emailFilterInput)}>{t.filterBtn}</GhostButton>
              {emailFilterInput && (
                <GhostButton
                  onClick={() => {
                    setEmailFilterInput("");
                    loadLogs("");
                  }}
                >
                  {t.clearFilterBtn}
                </GhostButton>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] overflow-hidden">
            {logsLoading ? (
              <div className="py-10 grid place-items-center text-[#5b6d63]">
                <Loader2 className="animate-spin" size={18} />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-[13px] text-[#5b6d63] p-5 text-center">{t.noLogsFound}</p>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-[12.5px]">
                  <thead className="sticky top-0 bg-[#F0EBD8]">
                    <tr>
                      <th className="text-left font-semibold text-[#5b6d63] px-3 py-2">{t.logColumnTime}</th>
                      <th className="text-left font-semibold text-[#5b6d63] px-3 py-2">{t.logColumnUser}</th>
                      <th className="text-left font-semibold text-[#5b6d63] px-3 py-2">{t.logColumnAction}</th>
                      <th className="text-left font-semibold text-[#5b6d63] px-3 py-2">{t.logColumnDetails}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-[#e3d9bd]">
                        <td className="px-3 py-2 text-[#8d8560] font-mono whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-2 text-[#1f2a24]">{log.email}</td>
                        <td className="px-3 py-2 text-[#1B3A2F] font-medium whitespace-nowrap">
                          {t.actionLabels?.[log.action] || log.action.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-2 text-[#5b6d63]">{log.details || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */

function PatientDetailModal({ dogId, session, businessType, onClose }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const [dog, setDog] = useState(undefined);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [vaccineForm, setVaccineForm] = useState({ name: "", date: todayISO(), nextDate: "", batch: "" });
  const [healthForm, setHealthForm] = useState({ date: todayISO(), diagnosis: "", examNotes: "" });
  const [showAddMed, setShowAddMed] = useState(false);
  const [medForm, setMedForm] = useState({ name: "", dose: "", startDate: todayISO(), endDate: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const loadDog = useCallback(() => {
    supabase
      .from("dogs")
      .select("payload")
      .eq("id", dogId)
      .single()
      .then(({ data }) => setDog(data?.payload || null));
  }, [dogId]);

  useEffect(() => {
    loadDog();
  }, [loadDog]);

  const submitRecord = async (type, entry) => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/vet-add-record", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ dogId, type, entry }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg(t.vetRecordSuccess);
        setShowAddVaccine(false);
        setShowAddHealth(false);
        setShowAddMed(false);
        setVaccineForm({ name: "", date: todayISO(), nextDate: "", batch: "" });
        setHealthForm({ date: todayISO(), diagnosis: "", examNotes: "" });
        setMedForm({ name: "", dose: "", startDate: todayISO(), endDate: "" });
        loadDog();
      } else {
        setSaveMsg(data.error || t.authError);
      }
    } catch {
      setSaveMsg(t.authError);
    }
    setSaving(false);
  };

  const toggleVaccineConfirmed = async (vId, newConfirmed) => {
    try {
      const res = await fetch("/api/vet-add-record", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ dogId, action: "toggle_confirm", vaccineId: vId, confirmed: newConfirmed }),
      });
      const data = await res.json();
      if (res.ok) {
        loadDog();
      } else {
        setSaveMsg(data.error || t.authError);
      }
    } catch {
      setSaveMsg(t.authError);
    }
  };

  const vaccineOptions = dog?.species === "cat" ? CAT_VACCINES : COMMON_VACCINES;

  const sortedVaccines = dog ? [...(dog.vaccines || [])].sort((a, b) => (a.date < b.date ? 1 : -1)) : [];
  const sortedWeights = dog ? [...(dog.weightEntries || [])].sort((a, b) => (a.date < b.date ? -1 : 1)) : [];
  const currentWeight = sortedWeights[sortedWeights.length - 1];

  const Row = ({ label, value }) => (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-dotted border-[#d8cfb4]">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold shrink-0">{label}</span>
      <span className="text-right text-[13.5px] text-[#1f2a24]">{value || "—"}</span>
    </div>
  );

  return (
    <Modal title={dog ? t.patientDetailTitle(dog.name) : "…"} onClose={onClose} wide>
      {dog === undefined ? (
        <div className="py-10 grid place-items-center text-[#5b6d63]">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : dog === null ? (
        <p className="text-[13px] text-[#5b6d63]">—</p>
      ) : (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center shrink-0">
              {dog.photo ? (
                <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
              ) : (
                <PawPrint size={22} className="text-[#a89c6e]" />
              )}
            </div>
            <div>
              <p className="font-display text-[20px] text-[#1B3A2F] leading-tight">{dog.name}</p>
              <p className="text-[12.5px] text-[#5b6d63]">{dog.breed}</p>
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvIdentitySection}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
            <div>
              <Row label={t.rowBirthDate} value={fmtDate(dog.birthDate, locale)} />
              <Row label={t.rowGender} value={dog.gender === "Dişi" ? t.female : t.male} />
              <Row label={t.rowNeutered} value={dog.neutered === "Evet" ? t.neuteredYes : t.neuteredNo} />
            </div>
            <div>
              <Row label={t.rowColor} value={t.colorNames?.[dog.color] || dog.color} />
              <Row label={t.rowMicrochip} value={dog.microchip} />
              <Row label={t.rowPassportNo} value={dog.passportNumber} />
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.ownerInfoSection}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
            <div>
              <Row label={t.rowOwner} value={dog.ownerName} />
              <Row label={t.rowPhone} value={fmtPhone(dog.ownerPhoneCode, dog.ownerPhoneNumber)} />
            </div>
            <div>
              <Row label={t.rowEmail} value={dog.ownerEmail} />
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvHealthSection}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
            <Row label={t.fieldChronicConditions} value={dog.chronicConditions} />
            <Row label={t.fieldAllergies} value={dog.allergies} />
          </div>

          <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16] mb-2">{t.cvWeightSection}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 mb-5">
            <Row
              label={t.cvCurrentWeight}
              value={currentWeight ? `${currentWeight.weight} kg (${fmtDate(currentWeight.date, locale)})` : t.cvNoWeight}
            />
            <Row label={t.cvIdealWeight} value={dog.idealWeight ? `${dog.idealWeight} kg` : "—"} />
          </div>

          {businessType !== "groomer" && (
            <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16]">{t.cvVaccinesSection}</p>
            <button
              onClick={() => setShowAddVaccine((s) => !s)}
              className="flex items-center gap-1 text-[12px] font-bold text-white bg-[#C9A227] hover:bg-[#b8931f] rounded-full px-3 py-1.5 transition shadow-sm"
            >
              <Plus size={13} /> {t.addVaccineForPatientBtn}
            </button>
          </div>

          {showAddVaccine && (
            <div className="rounded-md border border-[#d8cfb4] bg-white/60 p-3 mb-3 space-y-2">
              <div className="grid sm:grid-cols-2 gap-2">
                <select
                  className={inputCls}
                  value={vaccineForm.name}
                  onChange={(e) => setVaccineForm((f) => ({ ...f, name: e.target.value }))}
                >
                  <option value="">{t.fieldVaccineName}</option>
                  {vaccineOptions.map((v) => (
                    <option key={v} value={v}>
                      {t.vaccineNames?.[v] || v}
                    </option>
                  ))}
                </select>
                <input
                  className={monoInputCls}
                  placeholder={t.labelBatch}
                  value={vaccineForm.batch}
                  onChange={(e) => setVaccineForm((f) => ({ ...f, batch: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Field label={t.labelApplication}>
                  <input
                    type="date"
                    className={inputCls}
                    value={vaccineForm.date}
                    onChange={(e) => setVaccineForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </Field>
                <Field label={t.labelNextDose}>
                  <input
                    type="date"
                    className={inputCls}
                    value={vaccineForm.nextDate}
                    onChange={(e) => setVaccineForm((f) => ({ ...f, nextDate: e.target.value }))}
                  />
                </Field>
              </div>
              <PrimaryButton
                disabled={saving || !vaccineForm.name}
                onClick={() =>
                  submitRecord("vaccine", {
                    name: vaccineForm.name,
                    date: vaccineForm.date,
                    nextDate: vaccineForm.nextDate,
                    batch: vaccineForm.batch,
                    confirmed: true,
                  })
                }
              >
                {t.saveBtn}
              </PrimaryButton>
            </div>
          )}

          {sortedVaccines.length === 0 ? (
            <p className="text-[13px] text-[#5b6d63] mb-2">{t.cvNoVaccines}</p>
          ) : (
            <div className="space-y-1 mb-2">
              {sortedVaccines.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-[13px] py-1 border-b border-dotted border-[#d8cfb4] flex-wrap gap-1">
                  <span className="text-[#1f2a24] font-medium">
                    {t.vaccineNames?.[v.name] || v.name}
                    {v.addedByVet && (
                      <button
                        onClick={() => toggleVaccineConfirmed(v.id, !(v.confirmed !== false))}
                        className={`ml-2 inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 transition ${
                          v.confirmed !== false
                            ? "text-[#1B3A2F] bg-[#dcefe3] hover:bg-[#c9e5d4]"
                            : "text-[#8d8560] bg-[#efe8d1] hover:bg-[#e3d9bd]"
                        }`}
                      >
                        {v.confirmed !== false ? <Check size={10} /> : null}
                        {v.confirmed !== false ? t.addedByVetLabel(v.vet) : `${t.notYetGivenLabel} · ${v.vet}`}
                      </button>
                    )}
                  </span>
                  <span className="text-[#5b6d63]">
                    {fmtDate(v.date, locale)}
                    {v.nextDate ? ` → ${fmtDate(v.nextDate, locale)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-2 mt-5">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16]">{t.cvHealthSection}</p>
            <button
              onClick={() => setShowAddHealth((s) => !s)}
              className="flex items-center gap-1 text-[12px] font-bold text-white bg-[#C9A227] hover:bg-[#b8931f] rounded-full px-3 py-1.5 transition shadow-sm"
            >
              <Plus size={13} /> {t.addHealthNoteForPatientBtn}
            </button>
          </div>

          {showAddHealth && (
            <div className="rounded-md border border-[#d8cfb4] bg-white/60 p-3 mb-3 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  className={inputCls}
                  value={healthForm.date}
                  onChange={(e) => setHealthForm((f) => ({ ...f, date: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder={t.fieldDiagnosis}
                  value={healthForm.diagnosis}
                  onChange={(e) => setHealthForm((f) => ({ ...f, diagnosis: e.target.value }))}
                />
              </div>
              <textarea
                className={inputCls}
                rows={2}
                placeholder={t.fieldExamNotes}
                value={healthForm.examNotes}
                onChange={(e) => setHealthForm((f) => ({ ...f, examNotes: e.target.value }))}
              />
              <PrimaryButton
                disabled={saving || !healthForm.diagnosis}
                onClick={() =>
                  submitRecord("health", {
                    date: healthForm.date,
                    diagnosis: healthForm.diagnosis,
                    examNotes: healthForm.examNotes,
                    treatment: "",
                    prescription: "",
                    labResults: "",
                    isSurgery: false,
                    surgeryNotes: "",
                  })
                }
              >
                {t.saveBtn}
              </PrimaryButton>
            </div>
          )}

          {(dog.healthRecords || []).length === 0 ? (
            <p className="text-[13px] text-[#5b6d63] mb-2">—</p>
          ) : (
            <div className="space-y-1 mb-2">
              {[...dog.healthRecords].reverse().map((r) => (
                <div key={r.id} className="text-[13px] py-1.5 border-b border-dotted border-[#d8cfb4]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1f2a24] font-medium">
                      {r.diagnosis}
                      {r.addedByVet && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B3A2F] bg-[#dcefe3] rounded-full px-2 py-0.5">
                          <Check size={10} /> {t.addedByVetLabel(r.vet)}
                        </span>
                      )}
                    </span>
                    <span className="text-[#5b6d63]">{fmtDate(r.date, locale)}</span>
                  </div>
                  {r.examNotes && <p className="text-[#5b6d63] text-[12.5px] mt-0.5">{r.examNotes}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-2 mt-5">
            <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#8a6d16]">{t.medicationsTitle}</p>
            <button
              onClick={() => setShowAddMed((s) => !s)}
              className="flex items-center gap-1 text-[12px] font-bold text-white bg-[#C9A227] hover:bg-[#b8931f] rounded-full px-3 py-1.5 transition shadow-sm"
            >
              <Plus size={13} /> {t.addMedicationForPatientBtn}
            </button>
          </div>

          {showAddMed && (
            <div className="rounded-md border border-[#d8cfb4] bg-white/60 p-3 mb-3 space-y-2">
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  className={inputCls}
                  placeholder={t.fieldMedName}
                  value={medForm.name}
                  onChange={(e) => setMedForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  className={inputCls}
                  placeholder={t.fieldDose}
                  value={medForm.dose}
                  onChange={(e) => setMedForm((f) => ({ ...f, dose: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Field label={t.fieldStartDate}>
                  <input
                    type="date"
                    className={inputCls}
                    value={medForm.startDate}
                    onChange={(e) => setMedForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </Field>
                <Field label={t.fieldEndDate}>
                  <input
                    type="date"
                    className={inputCls}
                    value={medForm.endDate}
                    onChange={(e) => setMedForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </Field>
              </div>
              <PrimaryButton
                disabled={saving || !medForm.name}
                onClick={() =>
                  submitRecord("medication", {
                    name: medForm.name,
                    dose: medForm.dose,
                    startDate: medForm.startDate,
                    endDate: medForm.endDate,
                    dailyReminder: false,
                  })
                }
              >
                {t.saveBtn}
              </PrimaryButton>
            </div>
          )}

          {(dog.medications || []).length === 0 ? (
            <p className="text-[13px] text-[#5b6d63] mb-2">—</p>
          ) : (
            <div className="space-y-1 mb-2">
              {[...dog.medications].reverse().map((m) => (
                <div key={m.id} className="flex items-center justify-between text-[13px] py-1.5 border-b border-dotted border-[#d8cfb4]">
                  <span className="text-[#1f2a24] font-medium">
                    {m.name}
                    {m.addedByVet && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1B3A2F] bg-[#dcefe3] rounded-full px-2 py-0.5">
                        <Check size={10} /> {t.addedByVetLabel(m.vet)}
                      </span>
                    )}
                  </span>
                  <span className="text-[#5b6d63]">{m.dose}</span>
                </div>
              ))}
            </div>
          )}
            </>
          )}

          {saveMsg && <p className="text-[12.5px] text-[#8a6d16] mt-2">{saveMsg}</p>}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <GhostButton onClick={onClose}>{t.closeBtn}</GhostButton>
      </div>
    </Modal>
  );
}

function AppointmentDetailModal({ appt, session, onClose, onUpdated }) {
  const { t, lang } = useI18n();
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const [activeAction, setActiveAction] = useState(null);
  const [note, setNote] = useState("");
  const [newDate, setNewDate] = useState(appt.appt_date);
  const [newStartTime, setNewStartTime] = useState(appt.appt_time);
  const [newEndTime, setNewEndTime] = useState(appt.appt_end_time || appt.appt_time);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const isOnApp = !!appt.dog_id;
  const Row = ({ label, value }) => (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-dotted border-[#d8cfb4]">
      <span className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold shrink-0">{label}</span>
      <span className="text-right text-[13.5px] text-[#1f2a24]">{value || "—"}</span>
    </div>
  );
  const statusCfg = {
    scheduled: { label: t.apptStatusBooked, cls: "bg-[#C9A227] text-white" },
    done: { label: t.apptStatusCompleted, cls: "bg-[#1B3A2F] text-[#F7F3E8]" },
    cancelled: { label: t.apptStatusCancelled, cls: "bg-[#8d8560] text-white" },
    rescheduled: { label: t.apptStatusRescheduled, cls: "bg-[#6b7db3] text-white" },
  }[appt.status] || { label: appt.status, cls: "bg-[#8d8560] text-white" };

  const submitAction = async (action) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/update-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          appointmentId: appt.id,
          action,
          note,
          newDate: action === "reschedule" ? newDate : undefined,
          newStartTime: action === "reschedule" ? newStartTime : undefined,
          newEndTime: action === "reschedule" ? newEndTime : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdated();
        onClose();
      } else if (data.error === "SLOT_TAKEN") {
        setMsg(t.slotTakenErrorMsg);
      } else {
        setMsg(data.error || t.authError);
      }
    } catch {
      setMsg(t.authError);
    }
    setBusy(false);
  };

  return (
    <Modal title={t.apptDetailTitle} onClose={onClose}>
      <div className="space-y-1.5 mb-5">
        <Row label={t.colApptDate} value={fmtDate(appt.appt_date, locale)} />
        <Row
          label={t.colApptTimeRange}
          value={`${appt.appt_time}${appt.appt_end_time ? `–${appt.appt_end_time}` : ""}`}
        />
        <Row label={t.colCustomerName} value={appt.customer_name || "—"} />
        <Row label={t.colPetName} value={appt.dog_name || "—"} />
        <Row label={t.colService} value={appt.note ? t.serviceNames?.[appt.note] || t.groomerSpecialtyNames?.[appt.note] || appt.note : "—"} />
        <Row label={t.colApptType} value={isOnApp ? t.apptTypeOnApp : t.apptTypeOffApp} />
        <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-dotted border-[#d8cfb4]">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold shrink-0">{t.colStatus}</span>
          <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>
        {appt.status_note && <Row label={t.statusNoteLabel} value={appt.status_note} />}
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveAction("cancel")}
          className={`flex-1 rounded-md border text-[12.5px] font-semibold py-2 transition ${
            activeAction === "cancel" ? "bg-[#a63d40] border-[#a63d40] text-white" : "border-[#e3c2c2] text-[#a63d40] hover:bg-[#f7e9e9]"
          }`}
        >
          {t.cancelActionBtn}
        </button>
        <button
          onClick={() => setActiveAction("reschedule")}
          className={`flex-1 rounded-md border text-[12.5px] font-semibold py-2 transition ${
            activeAction === "reschedule"
              ? "bg-[#C9A227] border-[#C9A227] text-white"
              : "border-[#C9A227]/50 text-[#8a6d16] hover:bg-[#f3e9c8]"
          }`}
        >
          {t.rescheduleActionBtn}
        </button>
        <button
          onClick={() => setActiveAction("done")}
          className={`flex-1 rounded-md border text-[12.5px] font-semibold py-2 transition ${
            activeAction === "done" ? "bg-[#1B3A2F] border-[#1B3A2F] text-white" : "border-[#1B3A2F]/40 text-[#1B3A2F] hover:bg-[#eee6cd]"
          }`}
        >
          {t.doneActionBtn}
        </button>
      </div>

      {activeAction && (
        <div className="rounded-md border border-[#d8cfb4] bg-white/60 p-3 space-y-2">
          {activeAction === "reschedule" && (
            <div className="grid grid-cols-3 gap-2">
              <input type="date" className={inputCls} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              <input type="time" className={inputCls} value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
              <input type="time" className={inputCls} value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
            </div>
          )}
          <textarea
            className={inputCls}
            rows={2}
            placeholder={t.statusNotePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {msg && <p className="text-[12px] text-[#a63d40]">{msg}</p>}
          <PrimaryButton disabled={busy} onClick={() => submitAction(activeAction)} icon={Check}>
            {t.confirmActionBtn}
          </PrimaryButton>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <GhostButton onClick={onClose}>{t.closeBtn}</GhostButton>
      </div>
    </Modal>
  );
}

function AllAppointmentsTable({ appointments, t, lang, onOpenDetail }) {
  const locale = LANGS.find((l) => l.code === lang)?.locale;
  const sorted = [...appointments].sort((a, b) => a.appt_date.localeCompare(b.appt_date) || a.appt_time.localeCompare(b.appt_time));
  const statusCfg = {
    scheduled: { label: t.apptStatusBooked, cls: "bg-[#C9A227] text-white" },
    done: { label: t.apptStatusCompleted, cls: "bg-[#1B3A2F] text-[#F7F3E8]" },
    cancelled: { label: t.apptStatusCancelled, cls: "bg-[#8d8560] text-white" },
    rescheduled: { label: t.apptStatusRescheduled, cls: "bg-[#6b7db3] text-white" },
  };

  return (
    <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5 mb-8">
      <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.allAppointmentsTitle}</p>
      {sorted.length === 0 ? (
        <p className="text-[13px] text-[#5b6d63]">{t.noAppointmentsInTable}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#d8cfb4] text-left">
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colApptDate}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colApptTimeRange}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colCustomerName}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colPetName}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colService}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colApptType}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colStatus}</th>
                <th className="py-2 pr-3 font-semibold text-[#5b6d63]">{t.colDetails}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => {
                const cfg = statusCfg[a.status] || { label: a.status, cls: "bg-[#8d8560] text-white" };
                return (
                  <tr key={a.id} className="border-b border-dotted border-[#d8cfb4]">
                    <td className="py-2 pr-3 font-mono">{fmtDate(a.appt_date, locale)}</td>
                    <td className="py-2 pr-3 font-mono">
                      {a.appt_time}
                      {a.appt_end_time ? `–${a.appt_end_time}` : ""}
                    </td>
                    <td className="py-2 pr-3">{a.customer_name || "—"}</td>
                    <td className="py-2 pr-3">{a.dog_name || "—"}</td>
                    <td className="py-2 pr-3">{a.note ? t.serviceNames?.[a.note] || t.groomerSpecialtyNames?.[a.note] || a.note : "—"}</td>
                    <td className="py-2 pr-3">{a.dog_id ? t.apptTypeOnApp : t.apptTypeOffApp}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <button onClick={() => onOpenDetail(a)} className="text-[#5b6d63] hover:text-[#1B3A2F] transition">
                        <NotebookText size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VetPortal({ session }) {
  const { t, lang } = useI18n();
  const vetId = session.user.user_metadata?.vet_id;
  const [vet, setVet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: "", title: "" });
  const [newService, setNewService] = useState({ name: "", price: "", currency: "EUR", duration: 30 });
  const [clinicForm, setClinicForm] = useState(null);
  const tradeDocRef = useRef(null);
  const logoRef = useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 400, 0.85);
      setClinicForm((f) => ({ ...f, logo: dataUrl }));
    } catch {
      /* ignore */
    }
  };

  const handleTradeDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let dataUrl;
      if (file.type.startsWith("image/")) {
        dataUrl = await resizeImageFile(file, 1200, 0.85);
      } else {
        dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      setClinicForm((f) => ({ ...f, trade_registry_doc: dataUrl, trade_registry_doc_name: file.name }));
    } catch {
      /* ignore */
    }
  };
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newAvailability, setNewAvailability] = useState({ day: 1, start: "09:00", end: "17:00" });
  const [appointments, setAppointments] = useState([]);
  const [showBlockSlot, setShowBlockSlot] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [vetTab, setVetTab] = useState("dashboard");
  const [patientsLastSeen, setPatientsLastSeen] = useState("2000-01-01T00:00:00.000Z");
  const [apptLastSeen, setApptLastSeen] = useState("2000-01-01T00:00:00.000Z");
  const [dashboardPeriod, setDashboardPeriod] = useState("today");
  const [blockSlotForm, setBlockSlotForm] = useState({
    date: todayISO(),
    startTime: "10:00",
    endTime: "10:30",
    reason: "",
    customerName: "",
    petName: "",
  });
  const [blockSlotBusy, setBlockSlotBusy] = useState(false);
  const [blockSlotMsg, setBlockSlotMsg] = useState("");
  const blockSlotSubmittingRef = useRef(false);

  const load = useCallback(async () => {
    if (!vetId) {
      setLoaded(true);
      return;
    }
    const { data: vetRow } = await supabase.from("vets").select("*").eq("id", vetId).single();
    if (vetRow) {
      setVet(vetRow);
      const existingPhone = vetRow.phone || "";
      const firstSpace = existingPhone.indexOf(" ");
      setClinicForm({
        clinic_name: vetRow.clinic_name || "",
        city: vetRow.city || "",
        country: vetRow.country || "",
        specialty: Array.isArray(vetRow.specialty) ? vetRow.specialty : vetRow.specialty ? [vetRow.specialty] : [],
        phoneCode: firstSpace > 0 ? existingPhone.slice(0, firstSpace) : "",
        phoneNumber: firstSpace > 0 ? existingPhone.slice(firstSpace + 1) : existingPhone,
        legal_business_name: vetRow.legal_business_name || "",
        tax_id: vetRow.tax_id || "",
        address: vetRow.address || "",
        trade_registry_doc: vetRow.trade_registry_doc || null,
        trade_registry_doc_name: vetRow.trade_registry_doc_name || "",
        iban: vetRow.iban || "",
        swift_code: vetRow.swift_code || "",
        bank_name: vetRow.bank_name || "",
        account_holder_name: vetRow.account_holder_name || "",
        website: vetRow.website || "",
        logo: vetRow.logo || null,
      });
    }
    const { data: reqRows } = await supabase
      .from("vet_assignment_requests")
      .select("*")
      .eq("vet_id", vetId)
      .order("created_at", { ascending: false });
    if (reqRows) setRequests(reqRows);
    const { data: apptRows } = await supabase
      .from("vet_appointments")
      .select("*")
      .eq("vet_id", vetId)
      .order("appt_date", { ascending: true })
      .order("appt_time", { ascending: true });
    if (apptRows) setAppointments(apptRows);
    setLoaded(true);
  }, [vetId]);

  useEffect(() => {
    load();
  }, [load]);

  const respondToRequest = async (id, status) => {
    await supabase.from("vet_assignment_requests").update({ status }).eq("id", id);
    load();
  };

  const addAvailabilityBlock = async () => {
    const blocks = [...(vet.availability || []), { id: uid(), ...newAvailability }];
    await supabase.from("vets").update({ availability: blocks }).eq("id", vetId);
    load();
  };

  const removeAvailabilityBlock = async (id) => {
    const blocks = (vet.availability || []).filter((b) => b.id !== id);
    await supabase.from("vets").update({ availability: blocks }).eq("id", vetId);
    load();
  };

  const submitBlockSlot = async () => {
    if (blockSlotSubmittingRef.current) return;
    blockSlotSubmittingRef.current = true;
    setBlockSlotBusy(true);
    setBlockSlotMsg("");
    try {
      const res = await fetch("/api/block-appointment-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(blockSlotForm),
      });
      const data = await res.json();
      if (res.ok) {
        setBlockSlotMsg(t.blockSlotSuccessMsg);
        setBlockSlotForm({ date: todayISO(), startTime: "10:00", endTime: "10:30", reason: "", customerName: "", petName: "" });
        load();
      } else if (data.error === "SLOT_TAKEN") {
        setBlockSlotMsg(t.slotTakenErrorMsg);
      } else {
        setBlockSlotMsg(data.error || t.authError);
      }
    } catch {
      setBlockSlotMsg(t.authError);
    }
    setBlockSlotBusy(false);
    blockSlotSubmittingRef.current = false;
  };

  const saveClinicInfo = async () => {
    const { phoneCode, phoneNumber, ...rest } = clinicForm;
    await supabase
      .from("vets")
      .update({ ...rest, phone: fmtPhone(phoneCode, phoneNumber) })
      .eq("id", vetId);
    load();
  };

  const addDoctor = async () => {
    if (!newDoctor.name.trim()) return;
    const doctors = [...(vet.doctors || []), { id: uid(), ...newDoctor }];
    await supabase.from("vets").update({ doctors }).eq("id", vetId);
    setNewDoctor({ name: "", title: "" });
    load();
  };

  const removeDoctor = async (id) => {
    const doctors = (vet.doctors || []).filter((d) => d.id !== id);
    await supabase.from("vets").update({ doctors }).eq("id", vetId);
    load();
  };

  const addService = async () => {
    if (!newService.name.trim()) return;
    const services = [...(vet.services || []), { id: uid(), ...newService }];
    await supabase.from("vets").update({ services }).eq("id", vetId);
    setNewService({ name: "", price: "", currency: "EUR", duration: 30 });
    load();
  };

  const removeService = async (id) => {
    const services = (vet.services || []).filter((s) => s.id !== id);
    await supabase.from("vets").update({ services }).eq("id", vetId);
    load();
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedPatients = Array.from(
    new Map(requests.filter((r) => r.status === "approved").map((r) => [r.dog_id, r])).values()
  );
  const hasNewPending = pendingRequests.some((r) => r.created_at && r.created_at > patientsLastSeen);
  const hasNewAppt = appointments.some((a) => a.dog_id && a.created_at && a.created_at > apptLastSeen);
  const periodBounds = (() => {
    const now = new Date();
    if (dashboardPeriod === "today") {
      return { start: todayISO(), end: todayISO() };
    }
    if (dashboardPeriod === "week") {
      const day = now.getDay(); // 0=Pazar
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
    }
    // month
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: first.toISOString().slice(0, 10), end: last.toISOString().slice(0, 10) };
  })();
  const periodAppts = appointments
    .filter((a) => a.appt_date >= periodBounds.start && a.appt_date <= periodBounds.end && a.status !== "cancelled")
    .sort((a, b) => a.appt_date.localeCompare(b.appt_date) || a.appt_time.localeCompare(b.appt_time));
  const serviceChartData = Object.entries(
    periodAppts.reduce((acc, a) => {
      const key = a.note?.trim() ? t.serviceNames?.[a.note] || t.groomerSpecialtyNames?.[a.note] || a.note : t.serviceNames?.Diğer || "—";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));
  const filteredPatients = quickSearch.trim()
    ? approvedPatients.filter((r) => (r.dog_name || "").toLowerCase().includes(quickSearch.trim().toLowerCase()))
    : approvedPatients;

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body overflow-x-hidden" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
              <Stethoscope size={19} className="text-[#F7F3E8]" />
            </div>
            <div>
              <h1 className="font-display text-[22px] text-[#1B3A2F] leading-none">{t.vetPortalTitle}</h1>
              {vet && <p className="text-[11.5px] text-[#5b6d63]">{t.vetPortalWelcome(vet.clinic_name)}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
            <button
              onClick={() => {
                logActivity(session.user.id, "logout", session.user.email);
                supabase.auth.signOut();
              }}
              className="text-[12.5px] font-medium text-[#5b6d63] hover:text-[#a63d40] underline underline-offset-2"
            >
              {t.logOut}
            </button>
          </div>
        </div>

        {!loaded ? (
          <div className="py-24 grid place-items-center text-[#5b6d63]">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : !vet ? (
          <EmptyState icon={ShieldAlert} text={t.authError} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {[
                { id: "dashboard", label: t.vetTabDashboard, icon: LayoutGrid, alert: false },
                { id: "appointments", label: t.vetTabAppointments, icon: CalendarClock, alert: hasNewAppt },
                { id: "patients", label: t.myPatientsTitleFor(vet?.business_type), icon: PawPrint, alert: hasNewPending },
                { id: "team", label: t.vetTabTeam, icon: UserCog, alert: false },
              ].map((tabDef) => {
                const Icon = tabDef.icon;
                return (
                  <button
                    key={tabDef.id}
                    onClick={() => {
                      setVetTab(tabDef.id);
                      if (tabDef.id === "appointments") setApptLastSeen(new Date().toISOString());
                      if (tabDef.id === "patients") setPatientsLastSeen(new Date().toISOString());
                    }}
                    className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl border text-[11.5px] sm:text-[13.5px] font-semibold text-center transition ${
                      vetTab === tabDef.id
                        ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                        : "bg-[#FBF8EE] border-[#d8cfb4] text-[#5b6d63] hover:border-[#1B3A2F]/40"
                    }`}
                  >
                    {tabDef.alert && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#a63d40] border-2 border-[#EFE9D6]" />
                    )}
                    <Icon size={16} />
                    {tabDef.label}
                  </button>
                );
              })}
              <button
                onClick={() => setVetTab("settings")}
                className={`col-span-2 sm:col-span-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl border text-[11.5px] sm:text-[13.5px] font-semibold text-center transition ${
                  vetTab === "settings"
                    ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                    : "bg-[#FBF8EE] border-[#d8cfb4] text-[#5b6d63] hover:border-[#1B3A2F]/40"
                }`}
              >
                <Building2 size={16} />
                {t.vetTabSettings}
              </button>
            </div>

            {vetTab === "dashboard" && (
            <div className="rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] p-5 mb-8">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="font-display text-[16px] text-[#1B3A2F]">{t.todaysApptsTitle}</p>
                <div className="flex gap-1.5">
                  {[
                    { id: "today", label: t.periodToday },
                    { id: "week", label: t.periodWeek },
                    { id: "month", label: t.periodMonth },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setDashboardPeriod(p.id)}
                      className={`text-[11.5px] font-semibold rounded-full px-3 py-1 transition ${
                        dashboardPeriod === p.id
                          ? "bg-[#1B3A2F] text-[#F7F3E8]"
                          : "bg-white/60 text-[#5b6d63] hover:bg-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {periodAppts.length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noApptsToday}</p>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {periodAppts.map((a) => {
                        const statusCfg = {
                          scheduled: { label: t.apptStatusBooked, cls: "bg-[#C9A227] text-white" },
                          done: { label: t.apptStatusCompleted, cls: "bg-[#1B3A2F] text-[#F7F3E8]" },
                          cancelled: { label: t.apptStatusCancelled, cls: "bg-[#8d8560] text-white" },
                          rescheduled: { label: t.apptStatusRescheduled, cls: "bg-[#6b7db3] text-white" },
                        }[a.status] || { label: a.status, cls: "bg-[#8d8560] text-white" };
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelectedAppt(a)}
                            className="w-full flex items-center justify-between text-[13px] px-3 py-2 rounded-md bg-white/50 hover:bg-white/80 transition text-left"
                          >
                            <span className="font-mono text-[#1B3A2F] font-semibold shrink-0">
                              {dashboardPeriod !== "today" && `${a.appt_date.slice(5)} · `}
                              {a.appt_time}
                              {a.appt_end_time ? `–${a.appt_end_time}` : ""}
                            </span>
                            <span className="flex-1 px-3 truncate">
                              {a.dog_name || "—"}
                              {a.note && (
                                <span className="text-[#8d8560]">
                                  {" "}
                                  · {t.serviceNames?.[a.note] || t.groomerSpecialtyNames?.[a.note] || a.note}
                                </span>
                              )}
                              <span className="ml-1.5 text-[9.5px] font-semibold text-[#8d8560] bg-[#efe8d1] rounded-full px-1.5 py-0.5">
                                {a.dog_id ? t.apptTypeOnApp : t.apptTypeOffApp}
                              </span>
                            </span>
                            <span
                              className={`text-[9.5px] font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${statusCfg.cls}`}
                            >
                              {statusCfg.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {serviceChartData.length > 0 && (
                    <div className="mt-4" style={{ height: 160 }}>
                      <p className="text-[11px] uppercase tracking-[0.08em] text-[#5b6d63] font-semibold mb-1.5">
                        {t.serviceBreakdownTitle}
                      </p>
                      <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={serviceChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e3d9bd" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5b6d63" }} interval={0} angle={-15} textAnchor="end" height={40} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#5b6d63" }} />
                          <Tooltip contentStyle={{ background: "#FBF8EE", border: "1px solid #d8cfb4", borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="count" fill="#1B3A2F" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.myPatientsTitleFor(vet?.business_type)}</p>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d8560]" />
                    <input
                      className={inputCls + " pl-9"}
                      placeholder={t.quickSearchPlaceholder}
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                    />
                  </div>
                  {filteredPatients.length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noPatientsYet}</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {filteredPatients.map((r) => (
                        <button
                          key={r.dog_id}
                          onClick={() => setSelectedPatientId(r.dog_id)}
                          className="w-full flex items-center justify-between text-left text-[13px] px-3 py-2 rounded-md bg-white/50 hover:bg-white/80 transition"
                        >
                          <span className="text-[#1f2a24]">{r.dog_name}</span>
                          <span className="text-[11px] text-[#8a6d16] font-semibold">{t.viewDetailsBtn}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {vetTab === "patients" && (
            <div className="mb-8">
              <h3 className="font-display text-[18px] text-[#1B3A2F] mb-3">{t.pendingRequestsTitle}</h3>
              {pendingRequests.length === 0 ? (
                <EmptyState icon={CalendarClock} text={t.noPendingRequests} />
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] px-4 py-3"
                    >
                      <span className="text-[14px] text-[#1f2a24]">{t.requestFrom(r.dog_name, r.role)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => respondToRequest(r.id, "approved")}
                          className="rounded-md bg-[#1B3A2F] text-[#F7F3E8] text-[12px] font-semibold px-3 py-1.5 hover:bg-[#234a3b] transition"
                        >
                          {t.approveBtn}
                        </button>
                        <button
                          onClick={() => respondToRequest(r.id, "rejected")}
                          className="rounded-md border border-[#e3c2c2] text-[#a63d40] text-[12px] font-semibold px-3 py-1.5 hover:bg-[#f7e9e9] transition"
                        >
                          {t.rejectBtn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {vetTab === "patients" && (
            <div className="mb-8">
              <h3 className="font-display text-[18px] text-[#1B3A2F] mb-1">{t.myPatientsTitleFor(vet?.business_type)}</h3>
              <p className="text-[13px] text-[#5b6d63] mb-3">
                {t.myPatientsSubtitleFor(vet?.business_type, approvedPatients.length)}
              </p>
              {approvedPatients.length === 0 ? (
                <EmptyState icon={PawPrint} text={t.noPatientsYet} />
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {approvedPatients.map((r) => (
                    <div
                      key={r.dog_id}
                      className="flex items-center justify-between rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#1B3A2F] text-[#F7F3E8] grid place-items-center font-display text-[13px]">
                          {r.dog_name?.[0] || "?"}
                        </div>
                        <span className="text-[14px] text-[#1f2a24] font-medium">{r.dog_name}</span>
                      </div>
                      <GhostButton onClick={() => setSelectedPatientId(r.dog_id)}>{t.viewPatientBtn}</GhostButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {vetTab === "appointments" && (
            <>
            <AllAppointmentsTable
              appointments={appointments}
              t={t}
              lang={lang}
              onOpenDetail={setSelectedAppt}
            />
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5">
                <p className="font-display text-[16px] text-[#1B3A2F] mb-1">{t.availabilityTitle}</p>
                <p className="text-[12.5px] text-[#5b6d63] mb-1">{t.availabilitySubtitle}</p>
                <p className="text-[11.5px] text-[#8a6d16] mb-3">{t.availabilityBreakHint}</p>
                <div className="space-y-1.5 mb-3">
                  {(vet.availability || []).length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noAvailabilitySet}</p>
                  ) : (
                    Array.from(new Set((vet.availability || []).map((b) => b.day)))
                      .sort((a, b) => a - b)
                      .map((day) => {
                        const dayBlocks = (vet.availability || [])
                          .filter((b) => b.day === day)
                          .sort((a, b) => a.start.localeCompare(b.start));
                        return (
                          <div key={day} className="px-3 py-2 rounded-md bg-white/50">
                            <p className="font-medium text-[13px] mb-1">{t.dayNames[day]}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dayBlocks.map((b) => (
                                <span
                                  key={b.id}
                                  className="flex items-center gap-1.5 font-mono text-[12px] text-[#5b6d63] bg-[#efe8d1] rounded-full px-2.5 py-1"
                                >
                                  {b.start}–{b.end}
                                  <button onClick={() => removeAvailabilityBlock(b.id)} className="text-[#a08a5a] hover:text-[#a63d40]">
                                    <Trash2 size={11} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 items-stretch">
                  <select
                    className={inputCls}
                    value={newAvailability.day}
                    onChange={(e) => setNewAvailability((f) => ({ ...f, day: Number(e.target.value) }))}
                  >
                    {t.dayNames.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className={inputCls}
                    value={newAvailability.start}
                    onChange={(e) => setNewAvailability((f) => ({ ...f, start: e.target.value }))}
                  />
                  <input
                    type="time"
                    className={inputCls}
                    value={newAvailability.end}
                    onChange={(e) => setNewAvailability((f) => ({ ...f, end: e.target.value }))}
                  />
                  <button
                    onClick={addAvailabilityBlock}
                    className="rounded-md border border-[#d8cfb4] text-[#3c473f] hover:bg-[#eee6cd] transition grid place-items-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-display text-[16px] text-[#1B3A2F]">{t.offAppApptSectionTitle}</p>
                  <button
                    onClick={() => setShowBlockSlot((s) => !s)}
                    className="text-[11.5px] font-semibold text-[#1B3A2F] underline underline-offset-2"
                  >
                    + {t.blockSlotBtn}
                  </button>
                </div>

                {showBlockSlot && (
                  <div className="rounded-md border border-[#C9A227]/40 bg-white/60 p-3 mb-3 space-y-2">
                    <p className="text-[11.5px] text-[#8a6d16]">{t.blockSlotSubtitle}</p>
                    <input
                      type="date"
                      min={todayISO()}
                      className={inputCls}
                      value={blockSlotForm.date}
                      onChange={(e) => setBlockSlotForm((f) => ({ ...f, date: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t.fieldStartTime}>
                        <input
                          type="time"
                          className={inputCls}
                          value={blockSlotForm.startTime}
                          onChange={(e) => setBlockSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                        />
                      </Field>
                      <Field label={t.fieldEndTime}>
                        <input
                          type="time"
                          className={inputCls}
                          value={blockSlotForm.endTime}
                          onChange={(e) => setBlockSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <select
                      className={inputCls}
                      value={blockSlotForm.reason}
                      onChange={(e) => setBlockSlotForm((f) => ({ ...f, reason: e.target.value }))}
                    >
                      <option value="">{t.selectServiceType}</option>
                      {(vet.services || []).length > 0
                        ? vet.services.map((s) => (
                            <option key={s.id} value={s.name}>
                              {t.serviceNames?.[s.name] || s.name}
                            </option>
                          ))
                        : (vet?.business_type === "groomer" ? GROOMER_SPECIALTY_KEYS : VET_SERVICE_KEYS).map((k) => (
                            <option key={k} value={k}>
                              {vet?.business_type === "groomer" ? t.groomerSpecialtyNames?.[k] || k : t.serviceNames?.[k] || k}
                            </option>
                          ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className={inputCls}
                        placeholder={t.blockSlotNotePlaceholder}
                        value={blockSlotForm.customerName}
                        onChange={(e) => setBlockSlotForm((f) => ({ ...f, customerName: e.target.value }))}
                      />
                      <input
                        className={inputCls}
                        placeholder={t.colPetName}
                        value={blockSlotForm.petName}
                        onChange={(e) => setBlockSlotForm((f) => ({ ...f, petName: e.target.value }))}
                      />
                    </div>
                    {blockSlotMsg && <p className="text-[12px] text-[#8a6d16]">{blockSlotMsg}</p>}
                    <PrimaryButton disabled={blockSlotBusy} onClick={submitBlockSlot} icon={Check}>
                      {t.blockSlotBtn}
                    </PrimaryButton>
                  </div>
                )}
              </div>
            </div>
            </>
            )}

            {vetTab === "team" && (
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5">
                <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.myTeamTitleFor(vet?.business_type)}</p>
                <div className="space-y-2 mb-3">
                  {(vet.doctors || []).length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noTeamMembersFor(vet?.business_type)}</p>
                  ) : (
                    (vet.doctors || []).map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-[13px] px-3 py-2 rounded-md bg-white/50">
                        <span>
                          {d.name}{" "}
                          {d.title && (
                            <span className="text-[#8d8560]">
                              ·{" "}
                              {vet?.business_type === "groomer"
                                ? t.groomerStaffTitleNames?.[d.title] || d.title
                                : t.doctorTitleNames?.[d.title] || d.title}
                            </span>
                          )}
                        </span>
                        <button onClick={() => removeDoctor(d.id)} className="text-[#a08a5a] hover:text-[#a63d40] p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder={t.fieldEmployeeNameFor(vet?.business_type)}
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor((f) => ({ ...f, name: e.target.value }))}
                  />
                  <select
                    className={inputCls}
                    value={newDoctor.title}
                    onChange={(e) => setNewDoctor((f) => ({ ...f, title: e.target.value }))}
                  >
                    <option value="">{t.fieldEmployeeTitleFor(vet?.business_type)}</option>
                    {(vet?.business_type === "groomer" ? GROOMER_STAFF_TITLE_KEYS : DOCTOR_TITLE_KEYS).map((k) => (
                      <option key={k} value={k}>
                        {vet?.business_type === "groomer" ? t.groomerStaffTitleNames?.[k] || k : t.doctorTitleNames?.[k] || k}
                      </option>
                    ))}
                  </select>
                  <GhostButton onClick={addDoctor} icon={Plus} />
                </div>
              </div>

              <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5">
                <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.myServicesTitle}</p>
                <div className="space-y-2 mb-3">
                  {(vet.services || []).length === 0 ? (
                    <p className="text-[13px] text-[#5b6d63]">{t.noServices}</p>
                  ) : (
                    (vet.services || []).map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-[13px] px-3 py-2 rounded-md bg-white/50">
                        <span>
                          {t.serviceNames?.[s.name] || t.groomerSpecialtyNames?.[s.name] || s.name}{" "}
                          {s.price && <span className="text-[#8d8560]">· {s.price} {s.currency || "EUR"}</span>}
                          {s.duration && <span className="text-[#8d8560]"> · {t.durationMinutesLabel(s.duration)}</span>}
                        </span>
                        <button onClick={() => removeService(s.id)} className="text-[#a08a5a] hover:text-[#a63d40] p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    className={inputCls}
                    value={newService.name}
                    onChange={(e) => setNewService((f) => ({ ...f, name: e.target.value }))}
                  >
                    <option value="">{t.selectServiceType}</option>
                    {(vet?.business_type === "groomer" ? GROOMER_SPECIALTY_KEYS : VET_SERVICE_KEYS).map((s) => (
                      <option key={s} value={s}>
                        {vet?.business_type === "groomer" ? t.groomerSpecialtyNames?.[s] || s : t.serviceNames?.[s] || s}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-[1fr_84px_40px] gap-2 items-stretch">
                    <input
                      className={inputCls}
                      placeholder={t.fieldServicePrice}
                      value={newService.price}
                      onChange={(e) => setNewService((f) => ({ ...f, price: e.target.value }))}
                    />
                    <select
                      className={inputCls + " px-1.5"}
                      value={newService.currency}
                      onChange={(e) => setNewService((f) => ({ ...f, currency: e.target.value }))}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="TRY">TRY</option>
                    </select>
                    <button
                      onClick={addService}
                      className="rounded-md border border-[#d8cfb4] text-[#3c473f] hover:bg-[#eee6cd] transition grid place-items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <Field label={t.fieldServiceDuration}>
                    <select
                      className={inputCls}
                      value={newService.duration}
                      onChange={(e) => setNewService((f) => ({ ...f, duration: Number(e.target.value) }))}
                    >
                      {[15, 30, 45, 60, 90, 120, 150, 180].map((d) => (
                        <option key={d} value={d}>
                          {t.durationMinutesLabel(d)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
            )}

            {vetTab === "settings" && clinicForm && (
              <div className="rounded-xl border border-[#d8cfb4] bg-[#FBF8EE] p-5">
                <p className="font-display text-[16px] text-[#1B3A2F] mb-3">{t.clinicInfoTitle}</p>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-16 w-16 rounded-lg border-2 border-dashed border-[#c7bb95] bg-[#efe8d1] grid place-items-center overflow-hidden cursor-pointer shrink-0"
                    onClick={() => logoRef.current?.click()}
                  >
                    {clinicForm.logo ? (
                      <img src={clinicForm.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={22} className="text-[#8d8560]" />
                    )}
                  </div>
                  <button onClick={() => logoRef.current?.click()} className="text-[12px] text-[#5b6d63] underline underline-offset-2">
                    {clinicForm.logo ? t.changeLogo : t.uploadLogo}
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 mb-3">
                  <Field label={t.fieldClinicName}>
                    <input
                      className={inputCls}
                      value={clinicForm.clinic_name}
                      onChange={(e) => setClinicForm((f) => ({ ...f, clinic_name: e.target.value }))}
                    />
                  </Field>
                  <SpecialtyMultiSelect
                    label={t.fieldVetSpecialty}
                    value={clinicForm.specialty}
                    onChange={(v) => setClinicForm((f) => ({ ...f, specialty: v }))}
                    options={vet?.business_type === "groomer" ? GROOMER_SPECIALTY_KEYS : VET_SPECIALTY_KEYS}
                    nameMap={vet?.business_type === "groomer" ? t.groomerSpecialtyNames : t.specialtyNames}
                  />
                  <CountryCityPicker
                    t={t}
                    countryLabel={t.fieldVetCountry}
                    cityLabel={t.fieldVetCity}
                    country={clinicForm.country}
                    city={clinicForm.city}
                    onCountryChange={(v) => setClinicForm((f) => ({ ...f, country: v }))}
                    onCityChange={(v) => setClinicForm((f) => ({ ...f, city: v }))}
                  />
                  <PhoneField
                    label={t.fieldVetPhone}
                    code={clinicForm.phoneCode}
                    number={clinicForm.phoneNumber}
                    onCodeChange={(v) => setClinicForm((f) => ({ ...f, phoneCode: v }))}
                    onNumberChange={(v) => setClinicForm((f) => ({ ...f, phoneNumber: v }))}
                  />
                  <Field label={t.fieldWebsite}>
                    <input
                      className={inputCls}
                      value={clinicForm.website}
                      onChange={(e) => setClinicForm((f) => ({ ...f, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t.fieldClinicAddress}>
                      <input
                        className={inputCls}
                        value={clinicForm.address}
                        onChange={(e) => setClinicForm((f) => ({ ...f, address: e.target.value }))}
                      />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-[#e3d9bd] my-4" />
                <p className="text-[13px] font-semibold text-[#1B3A2F] mb-3">{t.commercialInfoTitle}</p>
                <div className="grid sm:grid-cols-2 gap-3.5 mb-3">
                  <Field label={t.fieldLegalBusinessName}>
                    <input
                      className={inputCls}
                      value={clinicForm.legal_business_name}
                      onChange={(e) => setClinicForm((f) => ({ ...f, legal_business_name: e.target.value }))}
                    />
                  </Field>
                  <Field label={t.fieldTaxId}>
                    <input
                      className={monoInputCls}
                      value={clinicForm.tax_id}
                      onChange={(e) => setClinicForm((f) => ({ ...f, tax_id: e.target.value }))}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t.fieldTradeRegistryDoc}>
                      <div
                        className="flex items-center gap-3 rounded-md border border-dashed border-[#c7bb95] bg-[#efe8d1] px-3 py-2.5 cursor-pointer"
                        onClick={() => tradeDocRef.current?.click()}
                      >
                        <Upload size={15} className="text-[#5b6d63]" />
                        <span className="text-[13px] text-[#5b6d63] truncate">
                          {clinicForm.trade_registry_doc_name || t.chooseFileText}
                        </span>
                      </div>
                      <input ref={tradeDocRef} type="file" className="hidden" onChange={handleTradeDocUpload} />
                    </Field>
                  </div>
                </div>

                <div className="h-px bg-[#e3d9bd] my-4" />
                <p className="text-[13px] font-semibold text-[#1B3A2F] mb-3">{t.bankInfoTitle}</p>
                <div className="grid sm:grid-cols-2 gap-3.5 mb-3">
                  <Field label={t.fieldAccountHolderName}>
                    <input
                      className={inputCls}
                      value={clinicForm.account_holder_name}
                      onChange={(e) => setClinicForm((f) => ({ ...f, account_holder_name: e.target.value }))}
                    />
                  </Field>
                  <Field label={t.fieldBankName}>
                    <input
                      className={inputCls}
                      value={clinicForm.bank_name}
                      onChange={(e) => setClinicForm((f) => ({ ...f, bank_name: e.target.value }))}
                    />
                  </Field>
                  <Field label={t.fieldIban}>
                    <input
                      className={monoInputCls}
                      value={clinicForm.iban}
                      onChange={(e) => setClinicForm((f) => ({ ...f, iban: e.target.value }))}
                    />
                  </Field>
                  <Field label={t.fieldSwiftCode}>
                    <input
                      className={monoInputCls}
                      value={clinicForm.swift_code}
                      onChange={(e) => setClinicForm((f) => ({ ...f, swift_code: e.target.value }))}
                    />
                  </Field>
                </div>

                <PrimaryButton onClick={saveClinicInfo} icon={Check}>
                  {t.saveClinicInfoBtn}
                </PrimaryButton>
              </div>
            )}
          </>
        )}
      </div>
      {selectedPatientId && (
        <PatientDetailModal
          dogId={selectedPatientId}
          session={session}
          businessType={vet?.business_type}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
      {selectedAppt && (
        <AppointmentDetailModal
          appt={selectedAppt}
          session={session}
          onClose={() => setSelectedAppt(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}

function ResetPasswordScreen({ onDone }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError("");
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message || t.authError);
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body flex items-center justify-center p-4 overflow-x-hidden" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
      <div className="w-full max-w-sm rounded-2xl border border-[#e3d9bd] bg-[#F7F3E8] p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
            <PawPrint size={19} className="text-[#F7F3E8]" />
          </div>
          <h1 className="font-display text-[19px] text-[#1B3A2F]">{t.resetPasswordScreenTitle}</h1>
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="text-[14px] text-[#3c473f]">{t.passwordUpdatedDesc}</p>
            <PrimaryButton full onClick={onDone} icon={Check}>
              {t.continueBtn}
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-3.5">
            <Field label={t.fieldNewPassword}>
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label={t.fieldConfirmNewPassword}>
              <input
                type="password"
                className={inputCls}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            {error && <p className="text-[13px] text-[#a63d40]">{error}</p>}
            <PrimaryButton full onClick={submit} icon={loading ? Loader2 : Check}>
              {t.setNewPasswordBtn}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthGate() {
  const { t } = useI18n();
  const [session, setSession] = useState(undefined); // undefined = loading
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery") ||
      window.location.hash.includes("type=invite") ||
      window.location.search.includes("type=invite")
    );
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && newSession?.user && !recoveryMode) {
        logActivity(newSession.user.id, "login", newSession.user.email);
      }
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [recoveryMode]);

  if (recoveryMode) {
    return (
      <ResetPasswordScreen
        onDone={() => {
          setRecoveryMode(false);
          window.history.replaceState({}, "", window.location.pathname);
        }}
      />
    );
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen w-full bg-[#EFE9D6] grid place-items-center text-[#5b6d63] gap-3 flex-col flex font-body">
        <Loader2 className="animate-spin" size={22} />
        <span className="text-[13px]">{t.verifyingSession}</span>
      </div>
    );
  }

  if (!session) return <LandingPage />;

  const role = session.user.user_metadata?.role;
  if (role === "admin") return <AdminPanel key={session.user.id} session={session} />;
  if (role === "vet") return <VetPortal key={session.user.id} session={session} />;

  return <PawWalletInner key={session.user.id} session={session} />;
}

/* ------------------------------------------------------------------ */
/*  Main App                                                            */
/* ------------------------------------------------------------------ */

const TAB_IDS = [
  { id: "passport", key: "navPassport", icon: PawPrint },
  { id: "documents", key: "navDocuments", icon: FileText },
  { id: "vaccines", key: "navVaccines", icon: Syringe },
  { id: "health", key: "navHealth", icon: ClipboardList },
  { id: "medications", key: "navMedications", icon: Pill },
  { id: "appointments", key: "navAppointments", icon: CalendarClock },
  { id: "weight", key: "navWeight", icon: Scale },
  { id: "vets", key: "navVets", icon: Stethoscope },
  { id: "cv", key: "navPetCV", icon: Award },
];

function PremiumModal({ session, onClose }) {
  const { t } = useI18n();
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ billingCycle: cycle }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Modal title={t.premiumModalTitle} onClose={onClose}>
      <div className="text-center mb-5">
        <div className="h-12 w-12 rounded-full bg-[#C9A227] grid place-items-center mx-auto mb-3">
          <Crown size={22} className="text-white" />
        </div>
        <p className="text-[13.5px] text-[#5b6d63]">{t.premiumModalSubtitle}</p>
      </div>

      <div className="flex gap-2 mb-5 bg-[#F0EBD8] rounded-full p-1">
        <button
          onClick={() => setCycle("monthly")}
          className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition ${
            cycle === "monthly" ? "bg-[#1B3A2F] text-[#F7F3E8]" : "text-[#5b6d63]"
          }`}
        >
          {t.billingMonthly}
        </button>
        <button
          onClick={() => setCycle("yearly")}
          className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition relative ${
            cycle === "yearly" ? "bg-[#1B3A2F] text-[#F7F3E8]" : "text-[#5b6d63]"
          }`}
        >
          {t.billingYearly}
          <span className="ml-1.5 text-[10px] font-bold text-[#8a6d16] bg-[#f3e9c8] rounded-full px-1.5 py-0.5">
            {t.billingYearlyBadge}
          </span>
        </button>
      </div>

      <p className="text-center font-display text-[30px] text-[#1B3A2F] mb-5">
        {cycle === "monthly" ? t.priceMonthly : t.priceYearly}
      </p>

      <div className="space-y-2.5 mb-6">
        {[t.premiumFeature1, t.premiumFeature2, t.premiumFeature3, t.premiumFeature4].map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-[13.5px] text-[#1f2a24]">
            <Check size={15} className="text-[#1B3A2F] shrink-0" />
            {f}
          </div>
        ))}
      </div>

      {error && <p className="text-[13px] text-[#a63d40] mb-3 text-center">{error}</p>}

      <PrimaryButton full onClick={subscribe} icon={loading ? Loader2 : Crown}>
        {loading ? t.redirectingToStripe : t.subscribeBtn}
      </PrimaryButton>
    </Modal>
  );
}

function NotificationButton({ userId }) {
  const { t } = useI18n();
  const [state, setState] = useState("checking"); // checking | unsupported | default | granted | denied
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const supported = await isPushSupported();
        if (!supported) return setState("unsupported");
        const perm = await getPushPermissionState();
        setState(perm || "unsupported");
      } catch {
        setState("unsupported");
      }
    })();
  }, []);

  const enable = async () => {
    try {
      await subscribeToPush(userId);
      setState("granted");
      setMsg(t.notificationsEnabled);
    } catch {
      const perm = await getPushPermissionState();
      setState(perm);
      setMsg(perm === "denied" ? t.notificationPermissionDenied : "");
    }
  };

  if (state === "checking") return null;
  if (state === "unsupported") {
    return (
      <span
        title={t.notificationsUnsupported}
        className="hidden sm:flex items-center gap-1 text-[11.5px] text-[#a89c6e] cursor-help"
      >
        <Bell size={13} />
      </span>
    );
  }
  if (state === "granted") {
    return (
      <span className="hidden sm:flex items-center gap-1 text-[12px] text-[#1B3A2F]">
        <BellRing size={13} /> {t.notificationsEnabled}
      </span>
    );
  }

  return (
    <button
      onClick={enable}
      title={msg}
      className="flex items-center gap-1.5 rounded-full border border-[#d8cfb4] bg-[#FBF8EE] px-3 py-1.5 text-[12.5px] font-medium text-[#3c473f] hover:bg-[#f0e9cd] transition"
    >
      <Bell size={13} /> <span className="hidden sm:inline">{t.enableNotificationsBtn}</span>
    </button>
  );
}

function PawWalletInner({ session }) {
  const { t } = useI18n();
  const [dogs, setDogs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("passport");
  const [showAddDog, setShowAddDog] = useState(false);
  const [addSpecies, setAddSpecies] = useState("dog");
  const [editingDog, setEditingDog] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dogMenuOpen, setDogMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const userId = session.user.id;
  const displayName = session.user.user_metadata?.first_name || session.user.email;
  const isPremium = subscription?.plan === "premium" && (subscription?.status === "active" || subscription?.status === "trialing");

  useEffect(() => {
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => setSubscription(data || null));
  }, [userId]);

  const openBillingPortal = async () => {
    const res = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleAddPetClick = (species) => {
    if (dogs.length >= 1 && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setAddSpecies(species);
    setShowAddDog(true);
  };

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

  // Push bildirimine tıklanınca gelen ?dog=...&tab=... adresini oku
  useEffect(() => {
    if (!loaded || !dogs.length) return;
    const params = new URLSearchParams(window.location.search);
    const dogParam = params.get("dog");
    const tabParam = params.get("tab");
    let used = false;
    if (dogParam && dogs.some((d) => d.id === dogParam)) {
      setActiveId(dogParam);
      used = true;
    }
    if (tabParam && TAB_IDS.some((t) => t.id === tabParam)) {
      setTab(tabParam);
      used = true;
    }
    if (used) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [loaded, dogs]);

  // Stripe ödemesinden döndükten sonra abonelik durumunu tazele
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      // Webhook'un işlemesi için kısa bir gecikmeyle tekrar sorgula
      setTimeout(() => {
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single()
          .then(({ data }) => setSubscription(data || null));
      }, 2000);
    }
  }, [userId]);

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
    logActivity(userId, isEdit ? "dog_updated" : "dog_created", dog.name);
  };

  const deleteDog = async (id) => {
    const deletedDog = dogs.find((d) => d.id === id);
    const next = dogs.filter((d) => d.id !== id);
    setDogs(next);
    try {
      await supabase.from("dogs").delete().eq("id", id).eq("user_id", userId);
    } catch {
      /* ignore */
    }
    if (activeId === id) setActiveId(next[0]?.id || null);
    logActivity(userId, "dog_deleted", deletedDog?.name);
  };

  const addVaccine = (v) => {
    updateDog(activeDog.id, (d) => ({ ...d, vaccines: [...d.vaccines, v] }));
    logActivity(userId, "vaccine_added", `${v.name} — ${activeDog.name}`);
  };
  const deleteVaccine = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) }));
    logActivity(userId, "vaccine_deleted", activeDog.name);
  };
  const updateVaccine = (updated) => {
    updateDog(activeDog.id, (d) => ({ ...d, vaccines: d.vaccines.map((v) => (v.id === updated.id ? updated : v)) }));
    logActivity(userId, "vaccine_updated", `${updated.name} — ${activeDog.name}`);
  };

  const saveHealthProfile = (profile) => {
    updateDog(activeDog.id, (d) => ({ ...d, ...profile }));
    logActivity(userId, "health_profile_updated", activeDog.name);
  };

  const addDocument = (doc) => {
    updateDog(activeDog.id, (d) => ({ ...d, documents: [...(d.documents || []), doc] }));
    logActivity(userId, "document_added", `${doc.label || doc.type} — ${activeDog.name}`);
  };
  const deleteDocument = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, documents: (d.documents || []).filter((doc) => doc.id !== id) }));
    logActivity(userId, "document_deleted", activeDog.name);
  };
  const addHealthRecord = (r) => {
    updateDog(activeDog.id, (d) => ({ ...d, healthRecords: [...(d.healthRecords || []), r] }));
    logActivity(userId, "health_record_added", activeDog.name);
  };
  const deleteHealthRecord = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, healthRecords: (d.healthRecords || []).filter((r) => r.id !== id) }));
    logActivity(userId, "health_record_deleted", activeDog.name);
  };
  const updateHealthRecord = (updated) => {
    updateDog(activeDog.id, (d) => ({
      ...d,
      healthRecords: (d.healthRecords || []).map((r) => (r.id === updated.id ? updated : r)),
    }));
    logActivity(userId, "health_record_updated", activeDog.name);
  };

  const addMedication = (m) => {
    updateDog(activeDog.id, (d) => ({ ...d, medications: [...(d.medications || []), m] }));
    logActivity(userId, "medication_added", `${m.name} — ${activeDog.name}`);
  };
  const deleteMedication = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, medications: (d.medications || []).filter((m) => m.id !== id) }));
    logActivity(userId, "medication_deleted", activeDog.name);
  };

  const addAppointment = (a) => {
    updateDog(activeDog.id, (d) => ({ ...d, appointments: [...(d.appointments || []), a] }));
    logActivity(userId, "appointment_added", `${a.type} — ${activeDog.name}`);
  };
  const deleteAppointment = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, appointments: (d.appointments || []).filter((a) => a.id !== id) }));
    logActivity(userId, "appointment_deleted", activeDog.name);
  };

  const saveIdealWeight = (idealWeight) => {
    updateDog(activeDog.id, (d) => ({ ...d, idealWeight }));
    logActivity(userId, "ideal_weight_updated", `${idealWeight}kg — ${activeDog.name}`);
  };
  const addWeightEntry = (entry) => {
    updateDog(activeDog.id, (d) => ({ ...d, weightEntries: [...(d.weightEntries || []), entry] }));
    logActivity(userId, "weight_entry_added", `${entry.weight}kg — ${activeDog.name}`);
  };
  const deleteWeightEntry = (id) => {
    updateDog(activeDog.id, (d) => ({ ...d, weightEntries: (d.weightEntries || []).filter((e) => e.id !== id) }));
    logActivity(userId, "weight_entry_deleted", activeDog.name);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#EFE9D6] font-body overflow-x-hidden"
      style={{
        colorScheme: "light",
        backgroundImage: activeDog?.species === "cat" ? CAT_BG_PATTERN_URL : DOG_BG_PATTERN_URL,
        backgroundSize: "200px 200px",
      }}
    >
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
            {isPremium ? (
              <button
                onClick={openBillingPortal}
                className="flex items-center gap-1.5 rounded-full bg-[#C9A227] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#b8931f] transition"
              >
                <Crown size={13} /> <span className="hidden sm:inline">{t.premiumBadge}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPremiumModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-[#C9A227] px-3 py-1.5 text-[12px] font-semibold text-[#8a6d16] hover:bg-[#f3e9c8] transition"
              >
                <Crown size={13} /> <span className="hidden sm:inline">{t.upgradeBtn}</span>
              </button>
            )}
            <NotificationButton userId={userId} />
            <LanguageSwitcher />
            <button
              onClick={() => {
                logActivity(userId, "logout", session.user.email);
                supabase.auth.signOut();
              }}
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
                        handleAddPetClick("dog");
                        setDogMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13.5px] text-[#1B3A2F] font-semibold border-t border-[#e3d9bd] hover:bg-[#f0e9cd] transition"
                    >
                      <Plus size={13} /> {t.addNewDogItem}
                    </button>
                    <button
                      onClick={() => {
                        handleAddPetClick("cat");
                        setDogMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[13.5px] text-[#1B3A2F] font-semibold hover:bg-[#f0e9cd] transition"
                    >
                      <Plus size={13} /> {t.addNewCatItem}
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <PrimaryButton icon={Plus} onClick={() => handleAddPetClick("dog")}>
                {t.addFirstDog}
              </PrimaryButton>
              <GhostButton icon={Plus} onClick={() => handleAddPetClick("cat")}>
                {t.addFirstCat}
              </GhostButton>
            </div>
          </div>
        ) : (
          <>
            {/* tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
              {TAB_IDS.map((tabDef) => {
                const Icon = tabDef.icon;
                const isActive = tab === tabDef.id;
                return (
                  <button
                    key={tabDef.id}
                    onClick={() => setTab(tabDef.id)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-xl border text-[11.5px] sm:text-[13.5px] font-semibold text-center transition ${
                      isActive
                        ? "bg-[#1B3A2F] border-[#1B3A2F] text-[#F7F3E8]"
                        : "bg-[#FBF8EE] border-[#d8cfb4] text-[#5b6d63] hover:border-[#1B3A2F]/40"
                    }`}
                  >
                    <span className="relative">
                      <Icon size={16} />
                      {tabDef.id === "vaccines" && activeDog.vaccines.some((v) => v.nextDate && daysUntil(v.nextDate) < 0) && (
                        <AlertTriangle
                          size={10}
                          className={`absolute -top-1 -right-1.5 ${isActive ? "text-[#f3c8c9]" : "text-[#a63d40]"}`}
                        />
                      )}
                    </span>
                    <span className="leading-tight">{t[tabDef.key]}</span>
                  </button>
                );
              })}
            </div>

            {tab === "passport" && (
              <PassportTab dog={activeDog} onEdit={() => setEditingDog(activeDog)} onDelete={() => setConfirmDeleteId(activeDog.id)} />
            )}
            {tab === "documents" && (
              <DocumentsTab
                dog={activeDog}
                onAdd={addDocument}
                onDelete={deleteDocument}
                isPremium={isPremium}
                onRequirePremium={() => setShowPremiumModal(true)}
              />
            )}
            {tab === "vaccines" && (
              <VaccineTab dog={activeDog} onAdd={addVaccine} onDelete={deleteVaccine} onUpdate={updateVaccine} />
            )}
            {tab === "health" && (
              <HealthTab
                dog={activeDog}
                onSaveProfile={saveHealthProfile}
                onAddRecord={addHealthRecord}
                onDeleteRecord={deleteHealthRecord}
                onUpdateRecord={updateHealthRecord}
              />
            )}
            {tab === "medications" && <MedicationTab dog={activeDog} onAdd={addMedication} onDelete={deleteMedication} />}
            {tab === "appointments" && (
              <AppointmentTab dog={activeDog} session={session} onAdd={addAppointment} onDelete={deleteAppointment} />
            )}
            {tab === "weight" && (
              <WeightTab dog={activeDog} onSaveIdeal={saveIdealWeight} onAdd={addWeightEntry} onDelete={deleteWeightEntry} />
            )}
            {tab === "vets" && (
              <VetTab dog={activeDog} session={session} isPremium={isPremium} onRequirePremium={() => setShowPremiumModal(true)} />
            )}
            {tab === "cv" && (
              <PetCVTab
                dog={activeDog}
                session={session}
                isPremium={isPremium}
                onRequirePremium={() => setShowPremiumModal(true)}
              />
            )}
          </>
        )}

        <p className="text-center text-[11px] text-[#8d8560] mt-10">{t.footerNote}</p>
      </div>

      {showAddDog && <AddDogModal initialSpecies={addSpecies} onClose={() => setShowAddDog(false)} onSave={addDog} />}
      {editingDog && <AddDogModal existingDog={editingDog} onClose={() => setEditingDog(null)} onSave={addDog} />}
      {showPremiumModal && <PremiumModal session={session} onClose={() => setShowPremiumModal(false)} />}
      {confirmDeleteId && (
        <Modal
          title={t.deletePetModalTitle(dogs.find((d) => d.id === confirmDeleteId)?.species || "dog")}
          onClose={() => setConfirmDeleteId(null)}
        >
          <p className="text-[14px] text-[#3c473f] leading-relaxed">
            {t.deletePetWarning(
              dogs.find((d) => d.id === confirmDeleteId)?.name,
              dogs.find((d) => d.id === confirmDeleteId)?.species || "dog"
            )}
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

/* ------------------------------------------------------------------ */
/*  Public "lost pet" card — no login required                          */
/* ------------------------------------------------------------------ */

function LostPetCard({ dogId }) {
  const { t } = useI18n();
  const [card, setCard] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    fetch(`/api/public-pet-card?id=${encodeURIComponent(dogId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCard(data))
      .catch(() => setCard(null));
  }, [dogId]);

  const ownerPhone = card ? fmtPhone(card.ownerPhoneCode, card.ownerPhoneNumber) : "";
  const emergencyPhone = card ? fmtPhone(card.emergencyPhoneCode, card.emergencyPhoneNumber) : "";

  return (
    <div className="min-h-screen w-full bg-[#EFE9D6] font-body flex items-center justify-center p-4 overflow-x-hidden" style={{ colorScheme: "light" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Zilla Slab', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {card === undefined ? (
        <Loader2 className="animate-spin text-[#5b6d63]" size={24} />
      ) : card === null ? (
        <div className="text-center text-[#5b6d63] text-[14px]">{t.lostCardNotFound("dog")}</div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-1.5 justify-center mb-4 text-[11px] font-bold tracking-wider text-white bg-[#a63d40] rounded-full px-3 py-1.5 w-fit mx-auto">
            <ScanLine size={13} /> {t.lostPetCardBadge(card.species || "dog")}
          </div>

          <div className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 shadow-xl">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-[#1B3A2F]/15 bg-[#eee6cd] grid place-items-center">
                {card.photo ? (
                  <img src={card.photo} alt={card.name} className="h-full w-full object-cover" />
                ) : (
                  <PawPrint size={36} className="text-[#a89c6e]" />
                )}
              </div>
              <div>
                <h1 className="font-display text-[26px] text-[#1B3A2F] leading-tight">{t.lostPetCardTitle(card.name)}</h1>
                <p className="text-[13px] text-[#5b6d63]">{card.breed}</p>
              </div>
              <p className="text-[13px] text-[#5b6d63]">{t.lostPetCardDesc(card.species || "dog")}</p>
            </div>

            <div className="space-y-2 mb-5">
              {card.microchip && (
                <div className="flex items-center justify-between py-2 border-b border-dotted border-[#d8cfb4]">
                  <span className="text-[11px] uppercase tracking-wider text-[#5b6d63] font-semibold">{t.rowMicrochip}</span>
                  <span className="text-[13.5px] font-mono text-[#1f2a24]">{card.microchip}</span>
                </div>
              )}
              {card.passportNumber && (
                <div className="flex items-center justify-between py-2 border-b border-dotted border-[#d8cfb4]">
                  <span className="text-[11px] uppercase tracking-wider text-[#5b6d63] font-semibold">{t.rowPassportNo}</span>
                  <span className="text-[13.5px] font-mono text-[#1f2a24]">{card.passportNumber}</span>
                </div>
              )}
              {card.ownerName && (
                <div className="flex items-center justify-between py-2 border-b border-dotted border-[#d8cfb4]">
                  <span className="text-[11px] uppercase tracking-wider text-[#5b6d63] font-semibold">{t.rowOwner}</span>
                  <span className="text-[13.5px] text-[#1f2a24]">{card.ownerName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {ownerPhone.trim() && (
                <a
                  href={`tel:${ownerPhone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-md bg-[#1B3A2F] text-[#F7F3E8] font-semibold text-[14px] py-3 hover:bg-[#234a3b] transition"
                >
                  <Phone size={16} /> {t.callOwnerBtn} · {ownerPhone}
                </a>
              )}
              {emergencyPhone.trim() && (
                <a
                  href={`tel:${emergencyPhone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-md border border-[#C9A227] text-[#8a6d16] font-semibold text-[14px] py-3 hover:bg-[#C9A227] hover:text-white transition"
                >
                  <Phone size={16} /> {t.callEmergencyBtn} · {emergencyPhone}
                </a>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-[#8d8560] mt-4 flex items-center justify-center gap-1.5">
            <PawPrint size={12} /> {t.lostCardFooter}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PawWallet() {
  const [lang, setLang] = useState(() => localStorage.getItem("paw-wallet-lang") || "en");
  const [lostDogId] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("lost");
  });

  useEffect(() => {
    localStorage.setItem("paw-wallet-lang", lang);
  }, [lang]);

  const value = useMemo(() => ({ t: TRANSLATIONS[lang], lang, setLang }), [lang]);

  return (
    <I18nContext.Provider value={value}>
      {lostDogId ? <LostPetCard dogId={lostDogId} /> : <AuthGate />}
    </I18nContext.Provider>
  );
}
