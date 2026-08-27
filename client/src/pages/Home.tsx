// Signal & Focus: editorial dashboard untuk belajar mandiri—jelas, suportif, terarah.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/signal-focus-hero_5232b3a4.png";
const pathImage = "/manus-storage/study-path-illustration_e8b57108.png";
const deskImage = "/manus-storage/focus-desk-detail_e7b2fed8.png";
const markImage = "/manus-storage/temanbelajar-mark_2a158bc4.png";

const subjects = [
  { name: "Matematika", count: "12 materi", color: "coral", symbol: "∑" },
  { name: "Bahasa Indonesia", count: "8 materi", color: "sage", symbol: "Aa" },
  { name: "Produktif RPL", count: "16 materi", color: "ochre", symbol: "</>" },
];

type Task = { id: number; title: string; meta: string; done: boolean };

const initialTasks: Task[] = [
  { id: 1, title: "Pahami konsep fungsi", meta: "Matematika · 18 menit", done: true },
  { id: 2, title: "Latihan persamaan kuadrat", meta: "Matematika · 15 soal", done: false },
  { id: 3, title: "Baca rangkuman HTML dasar", meta: "Produktif RPL · 12 menit", done: false },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [activeNav, setActiveNav] = useState("Ringkasan");
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("temanbelajar_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const userName = localStorage.getItem("temanbelajar_user") || "teman belajar";
  useEffect(() => { localStorage.setItem("temanbelajar_tasks", JSON.stringify(tasks)); }, [tasks]);
  const [query, setQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const completed = tasks.filter((task) => task.done).length;
  const progress = Math.round((completed / tasks.length) * 100);
  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => subject.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const toggleTask = (id: number) => {
    setTasks((current: Task[]) => current.map((task: Task) => (task.id === id ? { ...task, done: !task.done } : task)));
    toast.success("Progres belajar diperbarui", { description: "Langkahmu tersimpan di sesi hari ini." });
  };

  const handleAction = (message: string) => toast(message, { description: "Fitur ini siap dipakai pada prototipe berikutnya." });

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#1c2421] selection:bg-[#e4694b]/20">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className={`fixed inset-y-0 left-0 z-40 w-[250px] border-r border-[#1c2421]/10 bg-[#f6f1e8] px-6 py-7 transition-transform duration-200 lg:static lg:translate-x-0 ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center gap-3">
            <img src={markImage} alt="Logo temanbelajar" className="h-10 w-10 rounded-xl bg-[#1c2421] object-contain p-1.5" />
            <div>
              <p className="font-display text-lg font-bold tracking-tight">temanbelajar</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#65716a]">ruang tumbuh</p>
            </div>
          </div>

          <div className="mt-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">Menu utama</p>
            <nav className="space-y-1">
              {[
                ["Ringkasan", LayoutDashboard],
                ["Materi belajar", BookOpen],
                ["Rencana saya", CalendarDays],
                ["Progres", Trophy],
              ].map(([label, Icon]) => (
                <button
                  key={label as string}
                  onClick={() => { setActiveNav(label as string); setShowMobileMenu(false); }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition duration-200 active:scale-[.98] ${activeNav === label ? "bg-[#1c2421] text-[#f6f1e8] shadow-[0_8px_20px_rgba(28,36,33,.12)]" : "text-[#65716a] hover:bg-[#ebe4d8] hover:text-[#1c2421]"}`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {label as string}
                  {label === "Rencana saya" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e4694b]" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">Lainnya</p>
            <button onClick={() => handleAction("Pengaturan belum dibuka")} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#65716a] transition hover:bg-[#ebe4d8] hover:text-[#1c2421]"><CircleHelp size={17} strokeWidth={1.8} />Bantuan</button>
          </div>

          <div className="absolute bottom-7 left-6 right-6 rounded-2xl bg-[#dce8d9] p-4">
            <div className="mb-3 flex items-center justify-between"><Sparkles size={18} className="text-[#52715b]" /><span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#52715b]">tip hari ini</span></div>
            <p className="text-sm font-semibold leading-5 text-[#31483a]">Belajar 15 menit hari ini tetap lebih berarti daripada menunggu waktu yang sempurna.</p>
          </div>
        </aside>

        {showMobileMenu && <button aria-label="Tutup menu" onClick={() => setShowMobileMenu(false)} className="fixed inset-0 z-30 bg-[#1c2421]/20 lg:hidden" />}

        <main className="min-w-0 flex-1 px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowMobileMenu(true)} className="rounded-xl p-2 hover:bg-[#ebe4d8] lg:hidden" aria-label="Buka menu"><Menu size={21} /></button>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a938d]">Rabu, 26 Agustus 2026</p>
                <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Halo, {userName}<span className="text-[#e4694b]">.</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <label className="hidden items-center gap-2 rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-3 py-2 text-[#8a938d] focus-within:border-[#e4694b] sm:flex"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari materi..." className="w-28 bg-transparent text-sm outline-none placeholder:text-[#a4aaa5]" /></label>
              <button onClick={() => toast("Belum ada notifikasi baru")} className="relative rounded-xl p-2.5 text-[#65716a] transition hover:bg-[#ebe4d8] hover:text-[#1c2421]" aria-label="Notifikasi"><Bell size={19} strokeWidth={1.8} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e4694b]" /></button>
              <button onClick={() => handleAction("Profil pengguna")} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c2421] font-display text-sm font-bold text-[#f6f1e8] transition hover:bg-[#e4694b]" aria-label="Buka profil">TB</button>
            </div>
          </header>

          <section className="relative mb-8 overflow-hidden rounded-[26px] bg-[#1c2421] shadow-[0_18px_40px_rgba(28,36,33,.12)]">
            <img src={heroImage} alt="Meja belajar dengan buku dan timer" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
            <div className="relative z-10 max-w-xl px-7 py-8 sm:px-10 sm:py-10">
              <div className="mb-5 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e4694b]" /><span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5b09f]">langkah berikutnya</span></div>
              <h2 className="max-w-lg font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-[#fbf8f3] sm:text-[42px]">Mulai dari yang<br /><span className="text-[#f5b09f]">paling jelas.</span></h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#c4cec7]">Selesaikan satu langkah kecil hari ini. Kamu sedang membangun ritme yang akan membantu memahami lebih banyak.</p>
              <button onClick={() => navigate("/materi/Matematika")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#e4694b] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(228,105,75,.22)] transition hover:-translate-y-0.5 hover:bg-[#ef795b] active:scale-[.98]">Lanjutkan belajar <ArrowUpRight size={16} /></button>
            </div>
            <div className="absolute bottom-5 right-6 hidden text-right sm:block"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8da092]">sesi aktif</p><p className="mt-1 font-display text-2xl font-bold text-[#fbf8f3]">18 <span className="text-sm font-medium text-[#aab8af]">menit</span></p></div>
          </section>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <section className="mb-8">
                <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">ritme kamu</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">Ringkasan progres</h2></div><button onClick={() => setActiveNav("Progres")} className="flex items-center gap-1 text-xs font-bold text-[#e4694b] transition hover:gap-2">Lihat detail <ChevronRight size={15} /></button></div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard icon={Flame} label="Streak belajar" value="4 hari" detail="Pertahankan ritmemu" accent="coral" />
                  <StatCard icon={Clock3} label="Waktu minggu ini" value="2j 45m" detail="+32% dari minggu lalu" accent="sage" />
                  <StatCard icon={Target} label="Target tercapai" value={`${progress}%`} detail={`${completed} dari ${tasks.length} langkah`} accent="ochre" />
                </div>
              </section>

              <section className="mb-8">
                <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">checklist hari ini</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">Rencana belajar</h2></div><button onClick={() => handleAction("Rencana belajar baru")} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#65716a] transition hover:bg-[#ebe4d8] hover:text-[#1c2421]"><Plus size={15} /> Tambah</button></div>
                <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-2 shadow-[0_8px_24px_rgba(28,36,33,.04)]">
                  {tasks.map((task: Task) => <button key={task.id} onClick={() => toggleTask(task.id)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition hover:bg-[#f1ece3]">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${task.done ? "border-[#6e9978] bg-[#6e9978] text-white" : "border-[#c4cec7] text-transparent group-hover:border-[#e4694b]"}`}>{task.done && <Check size={14} strokeWidth={3} />}</span>
                    <span className="min-w-0 flex-1"><span className={`block text-sm font-bold ${task.done ? "text-[#8a938d] line-through" : "text-[#1c2421]"}`}>{task.title}</span><span className="mt-1 block text-xs text-[#8a938d]">{task.meta}</span></span><ChevronRight size={16} className="text-[#b1b9b3] transition group-hover:translate-x-0.5 group-hover:text-[#e4694b]" />
                  </button>)}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">pilihan untukmu</p><h2 className="mt-1 font-display text-xl font-bold tracking-tight">Materi populer</h2></div><button onClick={() => setActiveNav("Materi belajar")} className="flex items-center gap-1 text-xs font-bold text-[#e4694b] transition hover:gap-2">Semua materi <ChevronRight size={15} /></button></div>
                <div className="grid gap-3 sm:grid-cols-3">{filteredSubjects.map((subject) => <SubjectCard key={subject.name} subject={subject} onClick={() => navigate(`/materi/${encodeURIComponent(subject.name)}`)} />)}</div>
                {filteredSubjects.length === 0 && <div className="rounded-2xl border border-dashed border-[#1c2421]/15 p-8 text-center text-sm text-[#8a938d]">Materi tidak ditemukan. Coba kata kunci lain.</div>}
              </section>
            </div>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] shadow-[0_8px_24px_rgba(28,36,33,.04)]">
                <div className="flex items-start justify-between p-5 pb-3"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a938d]">evaluasi cepat</p><h3 className="mt-1 font-display text-lg font-bold">Kuis hari ini</h3></div><span className="rounded-lg bg-[#f5dfd8] p-2 text-[#c8563d]"><Brain size={18} /></span></div>
                <div className="px-5 pb-5"><p className="text-sm font-semibold leading-5">Seberapa paham kamu dengan fungsi kuadrat?</p><div className="mt-4 flex items-center gap-3 text-xs text-[#8a938d]"><span className="flex items-center gap-1"><CircleHelp size={14} /> 5 soal</span><span className="flex items-center gap-1"><Clock3 size={14} /> 8 menit</span></div><button onClick={() => navigate("/kuis")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c2421] py-3 text-sm font-bold text-[#f6f1e8] transition hover:bg-[#31443b] active:scale-[.98]"><Play size={15} fill="currentColor" /> Mulai kuis</button></div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-[#dce8d9] p-5"><img src={pathImage} alt="Ilustrasi jalur belajar" className="absolute -bottom-5 -right-8 h-32 w-32 object-cover opacity-60 mix-blend-multiply" /><div className="relative z-10"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#52715b]">cara belajarmu</p><h3 className="mt-2 max-w-[160px] font-display text-xl font-bold leading-tight text-[#31483a]">Pelan, tapi konsisten.</h3><button onClick={() => handleAction("Tips belajar dibuka")} className="mt-4 flex items-center gap-1 text-xs font-bold text-[#52715b]">Baca tips <ArrowUpRight size={14} /></button></div></div>
              <div className="overflow-hidden rounded-2xl bg-[#f0dfc2]"><img src={deskImage} alt="Detail meja belajar" className="h-28 w-full object-cover mix-blend-multiply opacity-80" /><div className="flex items-center justify-between p-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#89683b]">mode fokus</p><p className="mt-1 text-sm font-bold text-[#5b452b]">25 menit tanpa distraksi</p></div><button onClick={() => setFocusMode(!focusMode)} className={`rounded-xl p-2.5 transition ${focusMode ? "bg-[#e4694b] text-white" : "bg-[#fbf8f3]/70 text-[#89683b] hover:bg-[#fbf8f3]"}`} aria-label="Aktifkan mode fokus"><TimerReset size={18} /></button></div></div>
            </aside>
          </div>
        </main>
      </div>
      {focusMode && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#1c2421] px-4 py-3 text-sm font-semibold text-[#f6f1e8] shadow-[0_12px_30px_rgba(28,36,33,.22)]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#e4694b]" />Mode fokus aktif · 25:00<button onClick={() => setFocusMode(false)} className="ml-2 rounded-md p-1 text-[#aab8af] hover:bg-white/10 hover:text-white" aria-label="Tutup mode fokus"><X size={15} /></button></div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, accent }: { icon: typeof Flame; label: string; value: string; detail: string; accent: string }) {
  const colors: Record<string, string> = { coral: "bg-[#f5dfd8] text-[#c8563d]", sage: "bg-[#dce8d9] text-[#52715b]", ochre: "bg-[#f0dfc2] text-[#89683b]" };
  return <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-4 shadow-[0_8px_24px_rgba(28,36,33,.04)]"><div className="flex items-center justify-between"><span className={`rounded-lg p-2 ${colors[accent]}`}><Icon size={16} /></span><MoreHorizontal size={16} className="text-[#b1b9b3]" /></div><p className="mt-4 text-xs font-semibold text-[#8a938d]">{label}</p><p className="mt-1 font-display text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[11px] font-medium text-[#6e9978]">{detail}</p></div>;
}

function SubjectCard({ subject, onClick }: { subject: typeof subjects[number]; onClick: () => void }) {
  const palette: Record<string, string> = { coral: "bg-[#f5dfd8] text-[#c8563d]", sage: "bg-[#dce8d9] text-[#52715b]", ochre: "bg-[#f0dfc2] text-[#89683b]" };
  return <button onClick={onClick} className="group rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-4 text-left shadow-[0_8px_24px_rgba(28,36,33,.04)] transition duration-200 hover:-translate-y-1 hover:border-[#e4694b]/40 hover:shadow-[0_14px_28px_rgba(28,36,33,.08)] active:scale-[.98]"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-bold ${palette[subject.color]}`}>{subject.symbol}</span><ArrowUpRight size={17} className="text-[#b1b9b3] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e4694b]" /></div><p className="mt-5 font-display text-sm font-bold">{subject.name}</p><p className="mt-1 text-xs text-[#8a938d]">{subject.count}</p><div className="mt-4 flex gap-1"><span className="h-1.5 w-8 rounded-full bg-[#e4694b]" /><span className="h-1.5 w-3 rounded-full bg-[#d6dbd6]" /><span className="h-1.5 w-2 rounded-full bg-[#d6dbd6]" /></div></button>;
}
