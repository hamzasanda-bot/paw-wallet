import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COMMON_VACCINES = [
  "Kuduz",
  "Karma (DHPPi)",
  "Leptospiroz",
  "Bordetella (Kennel Cough)",
  "Leishmania",
  "Corona virüs",
  "Diğer",
];

const BREEDS = [
  "Golden Retriever",
  "Labrador Retriever",
  "Kangal",
  "Akbaş",
  "Fransız Bulldog",
  "Pomeranian",
  "Chihuahua",
  "Beagle",
  "Melez / Karışık",
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

const STORAGE_KEY = "paw-wallet-dogs-v1";
const ACTIVE_KEY = "paw-wallet-active-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
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

const Field = ({ label, children, mono }) => (
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

/* ------------------------------------------------------------------ */
/*  Add Dog Modal                                                      */
/* ------------------------------------------------------------------ */

function AddDogModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    breed: BREEDS[0],
    birthDate: "",
    gender: "Erkek",
    color: "",
    microchip: "",
    passportNumber: "",
    ownerName: "",
    ownerPhone: "",
    ownerAddress: "",
    emergencyName: "",
    emergencyPhone: "",
    photo: null,
  });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
    onSave({
      id: uid(),
      ...form,
      passportNumber: form.passportNumber || `TR-PW-${Math.floor(100000 + Math.random() * 900000)}`,
      vaccines: [],
      vets: [],
      createdAt: todayISO(),
    });
  };

  return (
    <Modal title="Yeni Köpek Ekle" onClose={onClose} wide>
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
            Fotoğraf yükle
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="Köpek adı">
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="örn. Zeytin" />
          </Field>
          <Field label="Irk">
            <select className={inputCls} value={form.breed} onChange={set("breed")}>
              {BREEDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Doğum tarihi">
            <input type="date" className={inputCls} value={form.birthDate} onChange={set("birthDate")} />
          </Field>
          <Field label="Cinsiyet">
            <select className={inputCls} value={form.gender} onChange={set("gender")}>
              <option>Erkek</option>
              <option>Dişi</option>
            </select>
          </Field>
          <Field label="Renk">
            <input className={inputCls} value={form.color} onChange={set("color")} placeholder="örn. Kum rengi" />
          </Field>
          <Field label="Mikroçip numarası">
            <input className={monoInputCls} value={form.microchip} onChange={set("microchip")} placeholder="15 haneli numara" />
          </Field>
        </div>
      </div>

      <div className="h-px bg-[#e3d9bd] my-5" />

      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Sahip adı">
          <input className={inputCls} value={form.ownerName} onChange={set("ownerName")} placeholder="Ad Soyad" />
        </Field>
        <Field label="Sahip telefon">
          <input className={inputCls} value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="+90 5.. ... .. .." />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Sahip adres">
            <input className={inputCls} value={form.ownerAddress} onChange={set("ownerAddress")} placeholder="Adres" />
          </Field>
        </div>
        <Field label="Acil kişi adı">
          <input className={inputCls} value={form.emergencyName} onChange={set("emergencyName")} placeholder="Ad Soyad" />
        </Field>
        <Field label="Acil kişi telefon">
          <input className={inputCls} value={form.emergencyPhone} onChange={set("emergencyPhone")} placeholder="+90 5.. ... .. .." />
        </Field>
        <Field label="Pasaport numarası (boş bırakılırsa otomatik atanır)">
          <input className={monoInputCls} value={form.passportNumber} onChange={set("passportNumber")} placeholder="TR-PW-000000" />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>Vazgeç</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          Pasaportu Oluştur
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
        <img src={qrUrl} alt="QR kod" className="h-full w-full rounded-full object-cover" />
      </div>
    </div>
  );
}

function PassportTab({ dog }) {
  const qrPayload = JSON.stringify({
    ad: dog.name,
    irk: dog.breed,
    cip: dog.microchip,
    pasaport: dog.passportNumber,
    sahip: dog.ownerName,
    tel: dog.ownerPhone,
    acil: dog.emergencyPhone,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=${encodeURIComponent(qrPayload)}`;

  const Row = ({ label, value, mono }) => (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-dotted border-[#d8cfb4]">
      <span className="text-[11px] uppercase tracking-[0.1em] text-[#5b6d63] font-semibold shrink-0">{label}</span>
      <span className={`text-right text-[14px] text-[#1f2a24] ${mono ? "font-mono" : "font-body"}`}>{value || "—"}</span>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div
        className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 sm:p-8 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(27,58,47,0.05) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="flex items-center gap-2 text-[#1B3A2F] mb-6">
          <ShieldCheck size={18} />
          <span className="font-display text-[13px] tracking-[0.18em] uppercase">Uluslararası Evcil Hayvan Pasaportu</span>
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
              <Row label="Doğum Tarihi" value={fmtDate(dog.birthDate)} />
              <Row label="Cinsiyet" value={dog.gender} />
              <Row label="Renk" value={dog.color} />
              <Row label="Mikroçip No" value={dog.microchip} mono />
              <Row label="Pasaport No" value={dog.passportNumber} mono />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#C9A227]/30 my-5" />

        <div className="grid sm:grid-cols-2 gap-x-8">
          <div>
            <Row label="Sahip" value={dog.ownerName} />
            <Row label="Telefon" value={dog.ownerPhone} mono />
            <Row label="Adres" value={dog.ownerAddress} />
          </div>
          <div>
            <Row label="Acil Kişi" value={dog.emergencyName} />
            <Row label="Acil Telefon" value={dog.emergencyPhone} mono />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#C9A227]/50 bg-[#FBF8EE] p-6 flex flex-col items-center text-center gap-4">
        <StampSeal qrUrl={qrUrl} />
        <div>
          <p className="font-display text-[15px] text-[#1B3A2F]">Taranabilir Kimlik</p>
          <p className="text-[12.5px] text-[#5b6d63] leading-snug mt-1">
            Bu kod taratıldığında {dog.name}'in kimlik ve iletişim bilgileri anında görüntülenir.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#8a6d16] bg-[#f3e9c8] rounded-full px-3 py-1">
          <ScanLine size={13} /> Kayıp durumunda tara &amp; ulaş
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vaccination tab                                                     */
/* ------------------------------------------------------------------ */

function AddVaccineModal({ onClose, onSave }) {
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
    const vetLabel =
      form.vetMode === "platform"
        ? PLATFORM_VETS.find((v) => v.id === form.vetId)?.name
        : form.vetManual;
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
    <Modal title="Aşı Kaydı Ekle" onClose={onClose}>
      <div className="space-y-3.5">
        <Field label="Aşı adı">
          <select className={inputCls} value={form.name} onChange={set("name")}>
            {COMMON_VACCINES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        {form.name === "Diğer" && (
          <Field label="Aşı adı (manuel)">
            <input className={inputCls} value={form.customName} onChange={set("customName")} placeholder="Aşı adını girin" />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Uygulama tarihi">
            <input type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label="Sonraki doz tarihi">
            <input type="date" className={inputCls} value={form.nextDate} onChange={set("nextDate")} />
          </Field>
        </div>

        <Field label="Uygulayan veteriner">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "platform" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "platform" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              Platformdan seç
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, vetMode: "manual" }))}
              className={`flex-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium border transition ${
                form.vetMode === "manual" ? "bg-[#1B3A2F] text-[#F7F3E8] border-[#1B3A2F]" : "border-[#d8cfb4] text-[#5b6d63]"
              }`}
            >
              Manuel gir
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
            <input className={inputCls} value={form.vetManual} onChange={set("vetManual")} placeholder="Veteriner adı" />
          )}
        </Field>

        <Field label="Parti / seri numarası">
          <input className={monoInputCls} value={form.batch} onChange={set("batch")} placeholder="örn. LOT-2026-118" />
        </Field>

        <Field label="Sertifika / belge">
          <div
            className="flex items-center gap-3 rounded-md border border-dashed border-[#c7bb95] bg-[#efe8d1] px-3 py-2.5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} className="text-[#5b6d63]" />
            <span className="text-[13px] text-[#5b6d63] truncate">
              {form.fileName || "Dosya seç (görsel veya belge)"}
            </span>
          </div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <GhostButton onClick={onClose}>Vazgeç</GhostButton>
        <PrimaryButton onClick={submit} icon={Check}>
          Kaydet
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function VaccineCard({ v, onDelete }) {
  const d = daysUntil(v.nextDate);
  let status = null;
  if (v.nextDate) {
    if (d < 0) status = { label: "GECİKMİŞ", cls: "bg-[#a63d40] text-white" };
    else if (d <= 30) status = { label: "YAKINDA", cls: "bg-[#C9A227] text-white" };
    else status = { label: "GÜNCEL", cls: "bg-[#1B3A2F] text-[#F7F3E8]" };
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
          {status && (
            <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
          )}
          <button onClick={() => onDelete(v.id)} className="text-[#a08a5a] hover:text-[#a63d40] transition p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-5 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">Uygulama</p>
          <p className="text-[#1f2a24]">{fmtDate(v.date)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">Sonraki Doz</p>
          <p className="text-[#1f2a24]">{fmtDate(v.nextDate)}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">Veteriner</p>
          <p className="text-[#1f2a24]">{v.vet || "—"}</p>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wider text-[#8d8560] font-semibold mb-0.5">Parti No</p>
          <p className="text-[#1f2a24] font-mono">{v.batch || "—"}</p>
        </div>
      </div>
      {v.file && (
        <div className="px-5 pb-4">
          <img src={v.file} alt="Sertifika" className="h-20 rounded-md border border-[#d8cfb4] object-cover" />
        </div>
      )}
    </div>
  );
}

function VaccineTab({ dog, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const sorted = [...dog.vaccines].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-[20px] text-[#1B3A2F]">Aşı Kartı</h3>
          <p className="text-[13px] text-[#5b6d63]">{dog.name} için kayıtlı {dog.vaccines.length} aşı</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
          Aşı Ekle
        </PrimaryButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Syringe} text="Henüz aşı kaydı yok. İlk aşıyı ekleyerek başlayın." />
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
  const assignedIds = dog.vets.map((v) => v.vetId);
  const primary = dog.vets.find((v) => v.role === "Birincil");

  return (
    <div>
      <div className="mb-5">
        <h3 className="font-display text-[20px] text-[#1B3A2F]">Veteriner Ataması</h3>
        <p className="text-[13px] text-[#5b6d63]">Platformdaki veterinerlerden {dog.name}'e birincil ve ikincil veteriner atayın.</p>
      </div>

      {dog.vets.length > 0 && (
        <div className="mb-5 space-y-2">
          {dog.vets.map((assignment) => {
            const vet = PLATFORM_VETS.find((v) => v.id === assignment.vetId);
            if (!vet) return null;
            return (
              <div
                key={assignment.vetId}
                className="flex items-center justify-between rounded-xl border border-[#C9A227]/50 bg-[#FBF8EE] px-4 py-3"
              >
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

      <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#5b6d63] mb-2.5">Platform Veterinerleri</p>
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
                  Birincil Yap
                </button>
                <button
                  disabled={isAssigned && dog.vets.find((v) => v.vetId === vet.id)?.role === "İkincil"}
                  onClick={() => onAssign(vet.id, "İkincil")}
                  className="flex-1 rounded-md border border-[#C9A227] text-[#8a6d16] text-[12px] font-semibold py-1.5 hover:bg-[#C9A227] hover:text-white transition disabled:opacity-40"
                >
                  İkincil Yap
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

const TABS = [
  { id: "passport", label: "Pasaport", icon: PawPrint },
  { id: "vaccines", label: "Aşı Kartı", icon: Syringe },
  { id: "vets", label: "Veteriner", icon: Stethoscope },
];

export default function PawWallet() {
  const [dogs, setDogs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("passport");
  const [showAddDog, setShowAddDog] = useState(false);
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
    const next = [...dogs, dog];
    persistDogs(next);
    setActiveId(dog.id);
    setShowAddDog(false);
  };

  const addVaccine = (v) => updateDog(activeDog.id, (d) => ({ ...d, vaccines: [...d.vaccines, v] }));
  const deleteVaccine = (id) =>
    updateDog(activeDog.id, (d) => ({ ...d, vaccines: d.vaccines.filter((v) => v.id !== id) }));

  const assignVet = (vetId, role) =>
    updateDog(activeDog.id, (d) => {
      let vets = d.vets.filter((v) => !(v.role === role) && v.vetId !== vetId);
      vets = [...vets, { vetId, role }];
      return { ...d, vets };
    });
  const removeVet = (vetId) =>
    updateDog(activeDog.id, (d) => ({ ...d, vets: d.vets.filter((v) => v.vetId !== vetId) }));

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-[#1B3A2F] grid place-items-center">
              <PawPrint size={19} className="text-[#F7F3E8]" />
            </div>
            <div>
              <h1 className="font-display text-[22px] text-[#1B3A2F] leading-none">Paw Wallet</h1>
              <p className="text-[11.5px] text-[#5b6d63] tracking-wide">Köpeğinizin dijital pasaportu</p>
            </div>
          </div>

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
                    <Plus size={13} /> Yeni köpek ekle
                  </button>
                </div>
              )}
            </div>
          )}
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
              <h2 className="font-display text-[20px] text-[#1B3A2F] mb-1">Henüz köpek eklenmedi</h2>
              <p className="text-[13.5px] text-[#5b6d63] max-w-sm">
                Başlamak için köpeğinizin pasaportunu oluşturun — kimlik bilgileri, QR kod ve daha fazlası otomatik hazırlanır.
              </p>
            </div>
            <PrimaryButton icon={Plus} onClick={() => setShowAddDog(true)}>
              İlk Köpeği Ekle
            </PrimaryButton>
          </div>
        ) : (
          <>
            {/* tabs */}
            <div className="flex gap-1.5 mb-5 border-b border-[#d8cfb4]">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold rounded-t-lg border border-b-0 transition ${
                      isActive
                        ? "bg-[#FBF8EE] border-[#d8cfb4] text-[#1B3A2F] -mb-px"
                        : "border-transparent text-[#8d8560] hover:text-[#5b6d63]"
                    }`}
                  >
                    <Icon size={15} /> {t.label}
                    {t.id === "vaccines" &&
                      activeDog.vaccines.some((v) => v.nextDate && daysUntil(v.nextDate) < 0) && (
                        <AlertTriangle size={13} className="text-[#a63d40]" />
                      )}
                  </button>
                );
              })}
            </div>

            {tab === "passport" && <PassportTab dog={activeDog} />}
            {tab === "vaccines" && <VaccineTab dog={activeDog} onAdd={addVaccine} onDelete={deleteVaccine} />}
            {tab === "vets" && <VetTab dog={activeDog} onAssign={assignVet} onRemove={removeVet} />}
          </>
        )}

        <p className="text-center text-[11px] text-[#8d8560] mt-10">
          Faz 1 önizlemesi — Pasaport, Aşı Kartı, Veteriner Ataması. Veriler bu tarayıcıda saklanır.
        </p>
      </div>

      {showAddDog && <AddDogModal onClose={() => setShowAddDog(false)} onSave={addDog} />}
    </div>
  );
}
