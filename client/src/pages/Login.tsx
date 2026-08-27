// Signal & Focus: onboarding ringan, tanpa akun server, untuk personalisasi lokal.
import { FormEvent, useState } from "react";
import { ArrowRight, BookOpen, Check, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    localStorage.setItem("temanbelajar_user", cleanName);
    navigate("/");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1c2421] px-5 py-10 text-[#f6f1e8]">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#e4694b]/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#a6c3a0]/15 blur-3xl" />
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#26332e] shadow-[0_24px_70px_rgba(0,0,0,.25)] md:grid-cols-[.92fr_1.08fr]">
        <div className="relative hidden min-h-[560px] overflow-hidden p-10 md:block">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#26332e,#1c2421)]" />
          <div className="relative z-10 flex h-full flex-col justify-between"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4694b] text-white"><BookOpen size={19} /></span><span className="font-display text-lg font-bold">temanbelajar</span></div><p className="mt-20 max-w-xs font-display text-4xl font-bold leading-[1.05] tracking-[-.04em]">Belajar lebih ringan saat langkahnya terlihat.</p><p className="mt-5 max-w-xs text-sm leading-6 text-[#afbeb4]">Rangkuman, latihan, dan progres dalam satu ruang yang dibuat untuk ritmemu.</p></div><div className="flex items-center gap-2 text-xs font-semibold text-[#afbeb4]"><Check size={15} className="text-[#e4694b]" /> Tidak perlu password untuk mencoba</div></div>
        </div>
        <div className="bg-[#f6f1e8] px-7 py-10 text-[#1c2421] sm:px-12 md:py-14"><div className="mb-12 flex items-center gap-2 text-[#e4694b] md:hidden"><Sparkles size={18} /><span className="font-display font-bold">temanbelajar</span></div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#8a938d]">mulai dari sini</p><h1 className="mt-3 max-w-sm font-display text-4xl font-bold leading-tight tracking-[-.04em]">Siapa yang sedang belajar hari ini?</h1><p className="mt-4 max-w-sm text-sm leading-6 text-[#65716a]">Masukkan nama panggilanmu. Kami akan menggunakannya hanya di browser ini agar dashboard terasa lebih personal.</p><form onSubmit={submit} className="mt-10"><label htmlFor="name" className="text-xs font-bold uppercase tracking-[.14em] text-[#65716a]">Nama panggilan</label><input id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Indah" className="mt-3 w-full border-b-2 border-[#c9d0ca] bg-transparent px-0 py-3 font-display text-2xl font-semibold outline-none transition placeholder:text-[#b5bdb7] focus:border-[#e4694b]" /><button type="submit" disabled={!name.trim()} className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e4694b] py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef795b] disabled:cursor-not-allowed disabled:opacity-45 active:scale-[.98]">Masuk ke ruang belajar <ArrowRight size={17} /></button></form><p className="mt-6 text-center text-[11px] leading-5 text-[#8a938d]">Data nama tersimpan secara lokal di perangkatmu.</p></div>
      </section>
    </main>
  );
}
