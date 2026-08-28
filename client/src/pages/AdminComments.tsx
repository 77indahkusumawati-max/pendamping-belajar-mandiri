import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminComments() {
  const { user, loading } = useAuth();
  const hiddenQuery = trpc.admin.hiddenComments.useQuery(undefined, {
    enabled: user?.role === "admin",
    retry: false,
  });
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Semua materi");
  const restoreComment = trpc.admin.restoreComment.useMutation({
    onSuccess: () => {
      toast.success("Komentar ditampilkan kembali");
      hiddenQuery.refetch();
    },
    onError: () => toast.error("Komentar belum dapat dipulihkan"),
  });
  const deleteComment = trpc.admin.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Komentar dihapus permanen");
      hiddenQuery.refetch();
    },
    onError: () => toast.error("Komentar belum dapat dihapus"),
  });

  if (loading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#1c2421]">
        Memuat dashboard admin...
      </main>
    );
  if (user?.role !== "admin")
    return (
      <main className="min-h-screen bg-[#f6f1e8] px-5 py-8 text-[#1c2421]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e4694b]/20 bg-[#fbf8f3] p-8 text-center">
          <ShieldCheck className="mx-auto text-[#e4694b]" size={32} />
          <h1 className="mt-4 font-display text-2xl font-bold">
            Akses admin diperlukan
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#46564d]">
            Halaman ini hanya tersedia bagi pengelola temanbelajar.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8]"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </main>
    );

  const comments = hiddenQuery.data ?? [];
  const subjects = Array.from(
    new Set(comments.map(comment => comment.subject))
  ).sort();
  const filteredComments = comments.filter(
    comment =>
      (subjectFilter === "Semua materi" || comment.subject === subjectFilter) &&
      `${comment.subject} ${comment.body} ${comment.userName ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#46564d] hover:text-[#e4694b]"
        >
          <ArrowLeft size={16} /> Kembali ke dashboard
        </Link>
        <header className="mt-8 flex flex-col gap-4 border-b border-[#1c2421]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">
              <ShieldCheck size={14} /> ruang pengelola
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em]">
              Moderasi komentar
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#46564d]">
              Pantau komentar yang disembunyikan karena melanggar aturan
              diskusi. Pulihkan komentar yang sudah ditinjau atau hapus secara
              permanen.
            </p>
          </div>
          <div className="rounded-2xl bg-[#dce8d9] px-5 py-4 text-center">
            <p className="text-2xl font-bold text-[#173b25]">
              {comments.length}
            </p>
            <p className="text-xs font-bold text-[#31533c]">tersembunyi</p>
          </div>
        </header>
        <section className="mt-8">
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Cari isi komentar atau nama pengguna..."
              className="rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-sm text-[#1c2421] outline-none focus:border-[#e4694b]"
            />
            <select
              value={subjectFilter}
              onChange={event => setSubjectFilter(event.target.value)}
              className="rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-sm font-bold text-[#1c2421] outline-none"
            >
              <option>Semua materi</option>
              {subjects.map(subject => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            {filteredComments.map(comment => (
              <article
                key={comment.id}
                className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5 shadow-[0_8px_24px_rgba(28,36,33,.04)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="rounded-full bg-[#f8e9e2] px-2.5 py-1 text-[#9b4938]">
                        Tersembunyi
                      </span>
                      <span className="text-[#e4694b]">{comment.subject}</span>
                    </div>
                    <p className="mt-4 break-words text-base font-semibold leading-7 text-[#1c2421]">
                      “{comment.body}”
                    </p>
                    <p className="mt-3 text-xs text-[#46564d]">
                      Oleh {comment.userName || "Teman belajar"} ·{" "}
                      {new Date(
                        comment.updatedAt ?? comment.createdAt
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      onClick={() => restoreComment.mutate({ id: comment.id })}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#dce8d9] px-3 py-2 text-xs font-bold text-[#173b25] hover:bg-[#c9ddc9]"
                    >
                      <Eye size={14} /> Tampilkan
                    </button>
                    <button
                      onClick={() => deleteComment.mutate({ id: comment.id })}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#f8e9e2] px-3 py-2 text-xs font-bold text-[#9b4938] hover:bg-[#f2d6cd]"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!filteredComments.length && (
              <div className="rounded-2xl border border-dashed border-[#1c2421]/20 bg-[#fbf8f3] p-12 text-center">
                <MessageSquare className="mx-auto text-[#6e9978]" size={32} />
                <h2 className="mt-4 font-display text-xl font-bold">
                  Tidak ada komentar tersembunyi
                </h2>
                <p className="mt-2 text-sm text-[#46564d]">
                  Semua ruang diskusi sedang dalam kondisi baik.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
