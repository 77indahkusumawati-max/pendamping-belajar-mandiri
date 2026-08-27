import { ArrowLeft, BookOpen, Medal, Share2, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Leaderboard() {
  const { data, isLoading, isError } = trpc.leaderboard.list.useQuery(undefined, { retry: false });
  const rows = data ?? [];
  const me = rows.find((row) => row.isCurrentUser);
  const shareRanking = async () => {
    if (!me) return;
    const text = `Saya berada di peringkat #${me.rank} leaderboard temanbelajar dengan ${me.points} poin.`;
    if (navigator.share) await navigator.share({ title: "Peringkat temanbelajar", text });
    else { await navigator.clipboard.writeText(text); toast.success("Peringkat disalin"); }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#65716a] transition hover:text-[#e4694b]"><ArrowLeft size={16} /> Kembali ke ringkasan</Link>
        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">ruang apresiasi</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">Leaderboard</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#65716a]">Lihat perkembanganmu dan jadikan pencapaian teman belajar sebagai dorongan yang sehat.</p></div>
          {me && <div className="flex items-center gap-2"><div className="rounded-2xl bg-[#1c2421] px-5 py-4 text-[#f6f1e8]"><p className="text-xs text-[#aab8af]">Peringkatmu</p><p className="mt-1 font-display text-3xl font-bold">#{me.rank}</p><p className="text-xs text-[#aab8af]">{me.points} poin</p></div><button onClick={shareRanking} aria-label="Bagikan peringkat" className="rounded-xl border border-[#1c2421]/15 bg-[#fbf8f3] p-3 text-[#65716a] transition hover:bg-[#ebe4d8]"><Share2 size={18} /></button></div>}
        </div>
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] shadow-[0_8px_24px_rgba(28,36,33,.04)]">
          <div className="grid grid-cols-[52px_1fr_90px] items-center gap-3 border-b border-[#1c2421]/10 bg-[#f1ece3] px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#8a938d]"><span>#</span><span>Teman belajar</span><span className="text-right">Poin</span></div>
          {isLoading ? <p className="p-8 text-center text-sm text-[#8a938d]">Memuat peringkat...</p> : isError ? <p className="p-8 text-center text-sm text-[#9f4635]">Leaderboard belum dapat dimuat. Coba lagi setelah koneksi pulih.</p> : rows.length === 0 ? <p className="p-8 text-center text-sm text-[#8a938d]">Belum ada data peringkat.</p> : <div>{rows.map((row) => <div key={row.userId} className={`grid grid-cols-[52px_1fr_90px] items-center gap-3 border-b border-[#1c2421]/5 px-5 py-4 last:border-0 ${row.isCurrentUser ? "bg-[#f8e9e2]" : ""}`}><div className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${row.rank === 1 ? "bg-[#f0dfc2] text-[#89683b]" : row.rank === 2 ? "bg-[#dce8d9] text-[#52715b]" : "bg-[#f1ece3] text-[#65716a]"}`}>{row.rank <= 3 ? <Medal size={15} /> : row.rank}</div><div><p className="font-bold">{row.name}{row.isCurrentUser && <span className="ml-2 rounded-full bg-[#e4694b]/15 px-2 py-1 text-[10px] text-[#c8563d]">Kamu</span>}</p><p className="mt-1 flex flex-wrap gap-3 text-xs text-[#8a938d]"><span className="flex items-center gap-1"><BookOpen size={12} /> {row.materialsCompleted} materi</span><span>{row.quizzesCompleted} kuis</span></p></div><p className="text-right font-display text-xl font-bold">{row.points}</p></div>)}</div>}
        </section>
        <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#8a938d]"><Trophy size={14} className="text-[#89683b]" /> Poin dihitung dari materi selesai dan hasil kuis yang tersimpan di akun masing-masing.</p>
      </div>
    </main>
  );
}
