import { ArrowLeft, Award, Download, Share2, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user } = useAuth();
  const { data } = trpc.progress.get.useQuery(undefined, { retry: false });
  const attempts = data?.attempts ?? [];
  const perfect = attempts.filter((attempt) => attempt.score === attempt.total && attempt.total > 0);
  const share = async () => {
    const text = `Saya baru saja mencapai ${perfect.length} lencana kuis sempurna di temanbelajar!`;
    const certificateFile = perfect[0] ? new File([`Sertifikat Kuis Sempurna\\nNama: ${user?.name || "Teman Belajar"}\\nNilai: ${perfect[0].score}/${perfect[0].total}\\nKuis: ${perfect[0].quizKey}`], "sertifikat-temanbelajar.txt", { type: "text/plain" }) : null;
    if (navigator.share && certificateFile && navigator.canShare?.({ files: [certificateFile] })) await navigator.share({ title: "Sertifikat temanbelajar", text, files: [certificateFile] });
    else if (navigator.share) await navigator.share({ title: "Pencapaian temanbelajar", text });
    else { await navigator.clipboard.writeText(text); toast.success("Teks pencapaian disalin"); }
  };
  const download = (attempt: (typeof attempts)[number]) => {
    const name = user?.name || "Teman Belajar";
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Sertifikat temanbelajar</title><style>body{font-family:Arial;background:#f6f1e8;color:#1c2421;padding:48px;text-align:center}.card{max-width:720px;margin:auto;padding:72px 48px;border:10px solid #e4694b;background:#fbf8f3;border-radius:24px}h1{font-size:42px}.badge{display:inline-block;padding:12px 20px;border-radius:999px;background:#dce8d9;color:#52715b;font-weight:bold}</style></head><body><div class="card"><p>temanbelajar · lencana pencapaian</p><h1>Sertifikat Kuis Sempurna</h1><p>Diberikan kepada</p><h2>${name}</h2><p>atas keberhasilan menyelesaikan kuis Fungsi Kuadrat dengan nilai sempurna.</p><div class="badge">${attempt.score}/${attempt.total} benar · 100%</div></div></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "sertifikat-temanbelajar.html"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <main className="min-h-screen bg-[#f6f1e8] px-5 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8"><div className="mx-auto max-w-5xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#65716a] transition hover:text-[#e4694b]"><ArrowLeft size={16} /> Kembali ke ringkasan</Link><div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">ruang pribadi</p><h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">Profil pengguna</h1><p className="mt-3 text-sm text-[#65716a]">{user?.name || "Teman Belajar"}</p></div><button onClick={share} className="inline-flex items-center gap-2 rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8]"><Share2 size={16} /> Bagikan pencapaian</button></div><section className="mt-8 rounded-2xl bg-[#dce8d9] p-6"><div className="flex items-center gap-3"><Award className="text-[#52715b]" /><div><p className="font-display text-xl font-bold text-[#31483a]">Koleksi pencapaian</p><p className="mt-1 text-sm text-[#52715b]">{perfect.length} lencana kuis sempurna tersimpan di akunmu.</p></div></div></section><section className="mt-7 grid gap-4 sm:grid-cols-2">{perfect.length === 0 ? <div className="rounded-2xl border border-dashed border-[#1c2421]/15 bg-[#fbf8f3] p-8 text-center text-sm text-[#8a938d] sm:col-span-2">Belum ada lencana. Selesaikan kuis dengan nilai 100% untuk mendapat sertifikat pertama.</div> : perfect.map((attempt) => <article key={attempt.id} className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5 shadow-[0_8px_24px_rgba(28,36,33,.04)]"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0dfc2] text-[#89683b]"><Trophy size={24} /></span><span className="rounded-full bg-[#dce8d9] px-3 py-1 text-xs font-bold text-[#52715b]">100%</span></div><h2 className="mt-5 font-display text-xl font-bold">Kuis sempurna</h2><p className="mt-1 text-sm text-[#65716a]">{attempt.quizKey} · {new Date(attempt.completedAt).toLocaleDateString("id-ID")}</p><div className="mt-5 flex gap-2"><button onClick={() => download(attempt)} className="inline-flex items-center gap-2 rounded-lg bg-[#e4694b] px-3 py-2 text-xs font-bold text-white"><Download size={14} /> Unduh sertifikat</button><button onClick={share} className="inline-flex items-center gap-2 rounded-lg border border-[#1c2421]/15 px-3 py-2 text-xs font-bold"><Share2 size={14} /> Bagikan</button></div></article>)}</section></div></main>;
}
