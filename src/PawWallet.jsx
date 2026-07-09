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

/* Dial-code select + local number input, side by side */
function PhoneField({ label, code, number, onCodeChange, onNumberChange, placeholder }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <select
          className={inputCls + " w-[128px] shrink-0 font-mono"}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
        >
          <option value="">+__</option>
          {COUNTRIES.map((c) => (
            <option key={c.name + c.dial} value={c.dial}>
              {c.dial} {c.name}
            </option>
          ))}
        </select>
        <input
          className={inputCls + " font-mono"}
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

          <Field label={t.fieldMicrochip}>
            <input className={monoInputCls} value={form.microchip} onChange={set("microchip")} placeholder="15 haneli numara" />
          </Field>
        </div>
      </div>

      <div className="h-px bg-[#e3d9bd] my-5" />

      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label={t.fieldOwnerName}>
          <input className={inputCls} value={form.ownerName} onChange={set("ownerName")} />
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
/*  Main App                                                            */
/* ------------------------------------------------------------------ */

const TAB_IDS = [
  { id: "passport", key: "navPassport", icon: PawPrint },
  { id: "vaccines", key: "navVaccines", icon: Syringe },
  { id: "vets", key: "navVets", icon: Stethoscope },
];

function PawWalletInner() {
  const { t } = useI18n();
  const [dogs, setDogs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("passport");
  const [showAddDog, setShowAddDog] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [dogMenuOpen, setDogMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("dogs").select("id, payload").order("created_at");
      if (!error && data) setDogs(data.map((row) => row.payload));
      const savedActive = localStorage.getItem("paw-wallet-active");
      if (savedActive) setActiveId(savedActive);
      setLoaded(true);
    })();
  }, []);

  const persistDogs = useCallback(async (next) => {
    setDogs(next);
    for (const dog of next) {
      await supabase.from("dogs").upsert({ id: dog.id, payload: dog });
    }
  }, []);

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
      await supabase.from("dogs").delete().eq("id", id);
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
            <LanguageSwitcher />
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
      <PawWalletInner />
    </I18nContext.Provider>
  );
}
