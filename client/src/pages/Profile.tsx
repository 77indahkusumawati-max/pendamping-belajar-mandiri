import {
  ArrowLeft,
  Award,
  Download,
  Share2,
  Trophy,
  Upload,
  BarChart3,
  Sparkles,
  Printer,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const interestOptions = [
  "Numerasi",
  "Bahasa",
  "Teknologi",
  "Sains",
  "Kreatif digital",
  "Karakter",
  "Analitik",
  "Akademik",
];
const trackOptions = [
  "Semua jalur",
  "Numerasi dan bermain",
  "Literasi",
  "Sains",
  "Bahasa",
  "Teknologi",
  "Karakter",
  "Kreatif digital",
  "Analitik",
  "Akademik",
];

export default function Profile() {
  const { user } = useAuth();
  const { data } = trpc.progress.get.useQuery(undefined, { retry: false });
  const preferencesQuery = trpc.preferences.get.useQuery();
  const uploadsQuery = trpc.uploads.list.useQuery();
  const savePreferences = trpc.preferences.save.useMutation({
    onSuccess: () => {
      toast.success("Preferensi rekomendasi disimpan");
      preferencesQuery.refetch();
    },
    onError: () => toast.error("Preferensi belum tersimpan"),
  });
  const deleteUpload = trpc.uploads.delete.useMutation({
    onSuccess: () => {
      toast.success("Materi unggahan dihapus");
      uploadsQuery.refetch();
    },
    onError: () => toast.error("Materi belum dapat dihapus"),
  });
  const uploadMaterial = trpc.uploads.create.useMutation({
    onSuccess: () => {
      toast.success("Materi berhasil diunggah");
      uploadsQuery.refetch();
      setFile(null);
      setTitle("");
    },
    onError: () => toast.error("Materi belum dapat diunggah"),
  });
  const savePdfQuiz = trpc.quiz.submit.useMutation({
    onSuccess: () =>
      toast.success("Hasil kuis PDF tersimpan ke progres dan leaderboard"),
    onError: () => toast.error("Hasil kuis belum tersimpan"),
  });
  const extractMaterial = trpc.uploads.extract.useMutation({
    onSuccess: () => {
      toast.success("Ringkasan dan kuis AI berhasil dibuat");
      uploadsQuery.refetch();
    },
    onError: error =>
      toast.error(error.message || "Ekstraksi AI belum berhasil"),
  });
  const attempts = data?.attempts ?? [];
  const perfect = attempts.filter(
    attempt => attempt.score === attempt.total && attempt.total > 0
  );
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredTrack, setPreferredTrack] = useState("Semua jalur");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Umum");
  const [tags, setTags] = useState("");
  const [uploadSearch, setUploadSearch] = useState("");
  const [uploadCategoryFilter, setUploadCategoryFilter] =
    useState("Semua kategori");
  const [uploadTagFilter, setUploadTagFilter] = useState("Semua tag");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>(
    {}
  );
  const parseQuiz = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? (parsed as Array<{
            question: string;
            options: string[];
            answerIndex: number;
            explanation: string;
          }>)
        : [];
    } catch {
      return [];
    }
  };
  useEffect(() => {
    if (preferencesQuery.data) {
      try {
        setInterests(JSON.parse(preferencesQuery.data.interests));
      } catch {
        setInterests([]);
      }
      setPreferredTrack(preferencesQuery.data.preferredTrack);
    }
  }, [preferencesQuery.data]);
  const uploadTagOptions = Array.from(
    new Set(
      (uploadsQuery.data ?? []).flatMap(upload =>
        upload.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean)
      )
    )
  );
  const weeklyData = Object.entries(data?.weeklyActivity ?? {}).map(
    ([day, minutes]) => ({ day, menit: minutes })
  );
  const completedCount = data?.completedMaterials?.length ?? 0;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / 17) * 100)
  );
  const badges = [
    {
      title: "Langkah pertama",
      description: "Selesaikan 1 materi",
      unlocked: completedCount >= 1,
    },
    {
      title: "Ritme belajar",
      description: "Aktif belajar 3 hari",
      unlocked: (data?.activityDates?.length ?? 0) >= 3,
    },
    {
      title: "Konsisten",
      description: "Selesaikan 5 materi",
      unlocked: completedCount >= 5,
    },
    {
      title: "Penakluk kuis",
      description: "Dapatkan nilai sempurna",
      unlocked: perfect.length >= 1,
    },
    {
      title: "Jalur tuntas",
      description: "Selesaikan 10 materi",
      unlocked: completedCount >= 10,
    },
  ];
  const share = async () => {
    const text = `Saya baru saja mencapai ${perfect.length} lencana kuis sempurna di temanbelajar!`;
    if (navigator.share)
      await navigator.share({ title: "Pencapaian temanbelajar", text });
    else {
      await navigator.clipboard.writeText(text);
      toast.success("Teks pencapaian disalin");
    }
  };
  const download = (attempt: (typeof attempts)[number]) => {
    const name = user?.name || "Teman Belajar";
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Sertifikat temanbelajar</title><style>body{font-family:Arial;background:#f6f1e8;color:#1c2421;padding:48px;text-align:center}.card{max-width:720px;margin:auto;padding:72px 48px;border:10px solid #e4694b;background:#fbf8f3;border-radius:24px}h1{font-size:42px}.badge{display:inline-block;padding:12px 20px;border-radius:999px;background:#dce8d9;color:#52715b;font-weight:bold}</style></head><body><div class="card"><p>temanbelajar · lencana pencapaian</p><h1>Sertifikat Kuis Sempurna</h1><p>Diberikan kepada</p><h2>${name}</h2><p>atas keberhasilan menyelesaikan kuis dengan nilai sempurna.</p><div class="badge">${attempt.score}/${attempt.total} benar · 100%</div></div></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sertifikat-temanbelajar.html";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const toggleInterest = (interest: string) =>
    setInterests(current =>
      current.includes(interest)
        ? current.filter(value => value !== interest)
        : [...current, interest]
    );
  const exportSummaryPdf = (title: string, summary: string) => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      toast.error("Izinkan pop-up untuk mengunduh PDF");
      return;
    }
    const safeTitle = title.replace(/[<>]/g, "");
    const safeSummary = summary.replace(/[<>]/g, "");
    printWindow.document.write(
      `<html><head><title>Ringkasan AI - ${safeTitle}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:48px auto;color:#1c2421;line-height:1.7}h1{color:#e4694b}p{white-space:pre-wrap}</style></head><body><h1>Ringkasan AI</h1><h2>${safeTitle}</h2><p>${safeSummary}</p><p>temanbelajar · hasil ekstraksi materi</p></body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const submitPdfQuiz = (
    uploadId: number,
    uploadTitle: string,
    rawQuiz: string
  ) => {
    const quiz = parseQuiz(rawQuiz);
    const score = quiz.reduce(
      (total, question, questionIndex) =>
        total +
        (quizAnswers[`${uploadId}-${questionIndex}`] === question.answerIndex
          ? 1
          : 0),
      0
    );
    savePdfQuiz.mutate({
      quizKey: `PDF-${uploadId}-${uploadTitle}`.slice(0, 64),
      score,
      total: quiz.length,
    });
  };
  const isQuizComplete = (uploadId: number, rawQuiz: string) =>
    parseQuiz(rawQuiz).every(
      (_, questionIndex) =>
        quizAnswers[`${uploadId}-${questionIndex}`] !== undefined
    );
  const getQuizScore = (uploadId: number, rawQuiz: string) => {
    const quiz = parseQuiz(rawQuiz);
    return quiz.reduce(
      (score, question, questionIndex) =>
        score +
        (quizAnswers[`${uploadId}-${questionIndex}`] === question.answerIndex
          ? 1
          : 0),
      0
    );
  };
  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim()) {
      toast("Pilih file dan isi judul materi terlebih dahulu");
      return;
    }
    if (file.size > 5_000_000) {
      toast.error("Ukuran file maksimal 5 MB");
      return;
    }
    const mimeType = file.type as
      | "text/plain"
      | "text/markdown"
      | "application/pdf";
    if (
      !["text/plain", "text/markdown", "application/pdf"].includes(mimeType)
    ) {
      toast.error("Format yang didukung: PDF, TXT, atau Markdown");
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    uploadMaterial.mutate({
      title,
      category,
      tags,
      fileName: file.name,
      mimeType,
      sizeBytes: file.size,
      dataBase64: base64,
    });
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#46564d] transition hover:text-[#e4694b]"
        >
          <ArrowLeft size={16} /> Kembali ke ringkasan
        </Link>
        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">
              ruang pribadi
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] sm:text-5xl">
              Profil pengguna
            </h1>
            <p className="mt-3 text-sm text-[#46564d]">
              {user?.name || "Teman Belajar"}
            </p>
          </div>
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8]"
          >
            <Share2 size={16} /> Bagikan pencapaian
          </button>
        </div>
        <section className="mt-8 rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-[#e4694b]" />
            <div>
              <p className="font-display text-xl font-bold">
                Ringkasan progres
              </p>
              <p className="mt-1 text-sm text-[#46564d]">
                {completedCount} dari 17 materi selesai · {progressPercent}%
                jalur katalog tercapai
              </p>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#ebe4d8]">
            <div
              className="h-full rounded-full bg-[#6e9978] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-6 h-48 w-full">
            {weeklyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="menit" fill="#e4694b" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-[#f1ece3] text-sm text-[#46564d]">
                Mulai belajar untuk melihat grafik aktivitas mingguan.
              </div>
            )}
          </div>
        </section>
        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-6">
            <h2 className="font-display text-xl font-bold">
              Minat dan jalur rekomendasi
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#46564d]">
              Pilih topik yang kamu sukai supaya rekomendasi materi lebih
              sesuai.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition ${interests.includes(interest) ? "bg-[#1c2421] text-[#f6f1e8]" : "bg-[#f1ece3] text-[#46564d]"}`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-bold">
              Jalur belajar
              <select
                value={preferredTrack}
                onChange={event => setPreferredTrack(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#1c2421]/12 bg-[#fbf8f3] px-3 py-2.5 text-sm font-normal outline-none"
              >
                <option>Semua jalur</option>
                {trackOptions
                  .filter(track => track !== "Semua jalur")
                  .map(track => (
                    <option key={track}>{track}</option>
                  ))}
              </select>
            </label>
            <button
              onClick={() =>
                savePreferences.mutate({ interests, preferredTrack })
              }
              className="mt-5 rounded-xl bg-[#e4694b] px-4 py-3 text-sm font-bold text-white"
            >
              Simpan preferensi
            </button>
          </div>
          <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-6">
            <h2 className="font-display text-xl font-bold">
              Unggah materi belajar
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#46564d]">
              Simpan PDF, TXT, atau Markdown milikmu. File disimpan aman dan
              dapat dibuka kembali dari profil.
            </p>
            <form onSubmit={submitUpload} className="mt-4 space-y-3">
              <input
                required
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Judul materi"
                className="w-full rounded-xl border border-[#1c2421]/12 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#e4694b]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  Kategori
                  <select
                    value={category}
                    onChange={event => setCategory(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#1c2421]/12 bg-[#fbf8f3] px-3 py-2.5 text-sm font-normal"
                  >
                    <option>Umum</option>
                    <option>Matematika</option>
                    <option>Bahasa</option>
                    <option>Sains</option>
                    <option>Teknologi</option>
                    <option>Produktivitas</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Tag
                  <input
                    value={tags}
                    onChange={event => setTags(event.target.value)}
                    placeholder="contoh: ujian, dasar, praktik"
                    className="mt-2 w-full rounded-xl border border-[#1c2421]/12 bg-transparent px-3 py-2.5 text-sm font-normal"
                  />
                </label>
              </div>
              <input
                required
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={event => setFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-[#1c2421]/12 bg-transparent px-3 py-2.5 text-sm"
              />
              <button
                disabled={uploadMaterial.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8] disabled:opacity-50"
              >
                <Upload size={16} />{" "}
                {uploadMaterial.isPending ? "Mengunggah..." : "Unggah materi"}
              </button>
            </form>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <input
                value={uploadSearch}
                onChange={event => setUploadSearch(event.target.value)}
                placeholder="Cari judul atau tag..."
                className="w-full rounded-xl border border-[#1c2421]/12 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#e4694b]"
              />
              <select
                value={uploadCategoryFilter}
                onChange={event => setUploadCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-[#1c2421]/12 bg-[#fbf8f3] px-3 py-2.5 text-sm"
              >
                <option>Semua kategori</option>
                <option>Umum</option>
                <option>Matematika</option>
                <option>Bahasa</option>
                <option>Sains</option>
                <option>Teknologi</option>
                <option>Produktivitas</option>
              </select>
              <select
                value={uploadTagFilter}
                onChange={event => setUploadTagFilter(event.target.value)}
                className="w-full rounded-xl border border-[#1c2421]/12 bg-[#fbf8f3] px-3 py-2.5 text-sm"
              >
                <option>Semua tag</option>
                {uploadTagOptions.map(tag => (
                  <option key={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 space-y-2">
              {(uploadsQuery.data ?? [])
                .filter(
                  upload =>
                    (uploadCategoryFilter === "Semua kategori" ||
                      upload.category === uploadCategoryFilter) &&
                    (uploadTagFilter === "Semua tag" ||
                      upload.tags
                        .split(",")
                        .map(tag => tag.trim())
                        .includes(uploadTagFilter)) &&
                    `${upload.title} ${upload.category} ${upload.tags}`
                      .toLowerCase()
                      .includes(uploadSearch.toLowerCase())
                )
                .map(upload => (
                  <div key={upload.id} className="rounded-xl bg-[#f1ece3] p-3">
                    <a
                      href={upload.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-sm font-bold text-[#1c2421] hover:text-[#e4694b]"
                    >
                      <span className="truncate">
                        {upload.title}
                        <small className="ml-2 font-normal text-[#46564d]">
                          {upload.fileName}
                        </small>
                        <small className="ml-2 font-normal text-[#52715b]">
                          {upload.category} · {upload.tags || "tanpa tag"}
                        </small>
                      </span>
                      <Download size={15} />
                    </a>
                    <button
                      onClick={() => deleteUpload.mutate({ id: upload.id })}
                      className="mt-2 text-xs font-bold text-[#9b4938]"
                    >
                      Hapus unggahan
                    </button>
                    {upload.mimeType === "application/pdf" && (
                      <button
                        onClick={() =>
                          extractMaterial.mutate({ id: upload.id })
                        }
                        disabled={extractMaterial.isPending}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#dce8d9] px-3 py-2 text-xs font-bold text-[#173b25]"
                      >
                        <Sparkles size={14} /> Buat ringkasan & kuis AI
                      </button>
                    )}
                    {upload.aiSummary && (
                      <div className="mt-3 rounded-lg bg-[#eef3ec] p-3 text-xs leading-5 text-[#31533c]">
                        <strong>Ringkasan AI:</strong> {upload.aiSummary}{" "}
                        <button
                          onClick={() =>
                            exportSummaryPdf(
                              upload.title,
                              upload.aiSummary ?? ""
                            )
                          }
                          className="ml-2 inline-flex items-center gap-1 rounded-lg bg-[#e4694b] px-2 py-1 text-[11px] font-bold text-white"
                        >
                          <Printer size={12} /> Unduh PDF
                        </button>
                        {upload.aiQuiz && (
                          <details className="mt-2">
                            <summary className="cursor-pointer font-bold">
                              Buka kuis interaktif
                            </summary>
                            <div className="mt-2 space-y-2">
                              {parseQuiz(upload.aiQuiz).map(
                                (question, index) => (
                                  <div
                                    key={question.question}
                                    className="rounded-lg bg-white/60 p-2"
                                  >
                                    <p className="font-bold">
                                      {index + 1}. {question.question}
                                    </p>
                                    <div className="mt-1 grid gap-1">
                                      {question.options.map(
                                        (option, optionIndex) => (
                                          <button
                                            key={option}
                                            onClick={() => {
                                              setQuizAnswers(current => ({
                                                ...current,
                                                [`${upload.id}-${index}`]:
                                                  optionIndex,
                                              }));
                                              setQuizSubmitted(current => ({
                                                ...current,
                                                [upload.id]: true,
                                              }));
                                            }}
                                            className={`rounded px-2 py-1 text-left hover:bg-[#dce8d9] ${quizSubmitted[upload.id] ? (optionIndex === question.answerIndex ? "bg-[#dce8d9] text-[#173b25]" : quizAnswers[`${upload.id}-${index}`] === optionIndex ? "bg-[#f8e9e2] text-[#9b4938]" : "bg-white/70") : "bg-white/70"}`}
                                          >
                                            {option}
                                          </button>
                                        )
                                      )}
                                    </div>
                                    {quizSubmitted[upload.id] &&
                                      quizAnswers[`${upload.id}-${index}`] !==
                                        undefined && (
                                        <p
                                          className={`mt-2 text-xs font-bold ${quizAnswers[`${upload.id}-${index}`] === question.answerIndex ? "text-[#173b25]" : "text-[#9b4938]"}`}
                                        >
                                          {quizAnswers[
                                            `${upload.id}-${index}`
                                          ] === question.answerIndex
                                            ? "Benar. Jawabanmu tepat."
                                            : `Belum tepat. ${question.explanation}`}
                                        </p>
                                      )}
                                  </div>
                                )
                              )}
                            </div>
                            {quizSubmitted[upload.id] && (
                              <button
                                onClick={() => {
                                  setQuizSubmitted(current => ({
                                    ...current,
                                    [upload.id]: false,
                                  }));
                                  setQuizAnswers(current =>
                                    Object.fromEntries(
                                      Object.entries(current).filter(
                                        ([key]) =>
                                          !key.startsWith(`${upload.id}-`)
                                      )
                                    )
                                  );
                                }}
                                className="mt-2 text-xs font-bold text-[#e4694b]"
                              >
                                Ulangi kuis
                              </button>
                            )}
                            {quizSubmitted[upload.id] && (
                              <div className="mt-2">
                                <p className="font-bold text-[#173b25]">
                                  Hasil kuis:{" "}
                                  {getQuizScore(upload.id, upload.aiQuiz ?? "")}
                                  /{parseQuiz(upload.aiQuiz ?? "").length} ·{" "}
                                  {Math.round(
                                    (getQuizScore(
                                      upload.id,
                                      upload.aiQuiz ?? ""
                                    ) /
                                      Math.max(
                                        1,
                                        parseQuiz(upload.aiQuiz ?? "").length
                                      )) *
                                      100
                                  )}
                                  %
                                </p>
                                {isQuizComplete(
                                  upload.id,
                                  upload.aiQuiz ?? ""
                                ) && (
                                  <button
                                    onClick={() =>
                                      submitPdfQuiz(
                                        upload.id,
                                        upload.title,
                                        upload.aiQuiz ?? ""
                                      )
                                    }
                                    disabled={savePdfQuiz.isPending}
                                    className="mt-2 rounded-lg bg-[#e4694b] px-3 py-2 text-xs font-bold text-white"
                                  >
                                    {savePdfQuiz.isPending
                                      ? "Menyimpan..."
                                      : "Simpan hasil ke progres"}
                                  </button>
                                )}
                              </div>
                            )}
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </section>
        <section className="mt-7 rounded-2xl bg-[#dce8d9] p-6">
          <div className="flex items-center gap-3">
            <Award className="text-[#173b25]" />
            <div>
              <p className="font-display text-xl font-bold text-[#173b25]">
                Koleksi pencapaian
              </p>
              <p className="mt-1 text-sm text-[#31533c]">
                {perfect.length} lencana kuis sempurna tersimpan di akunmu.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {badges.map(badge => (
              <div
                key={badge.title}
                className={`rounded-xl p-4 ${badge.unlocked ? "bg-[#f0dfc2] text-[#684d22]" : "bg-[#f1ece3] text-[#8a938d]"}`}
              >
                <div className="flex items-center justify-between">
                  <strong>{badge.title}</strong>
                  <span>{badge.unlocked ? "Terbuka" : "Terkunci"}</span>
                </div>
                <p className="mt-1 text-xs">{badge.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-7 grid gap-4 sm:grid-cols-2">
          {perfect.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1c2421]/15 bg-[#fbf8f3] p-8 text-center text-sm text-[#46564d] sm:col-span-2">
              Belum ada lencana. Selesaikan kuis dengan nilai 100% untuk
              mendapat sertifikat pertama.
            </div>
          ) : (
            perfect.map(attempt => (
              <article
                key={attempt.id}
                className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5 shadow-[0_8px_24px_rgba(28,36,33,.04)]"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0dfc2] text-[#89683b]">
                    <Trophy size={24} />
                  </span>
                  <span className="rounded-full bg-[#dce8d9] px-3 py-1 text-xs font-bold text-[#173b25]">
                    100%
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-bold">
                  Kuis sempurna
                </h2>
                <p className="mt-1 text-sm text-[#46564d]">
                  {attempt.quizKey} ·{" "}
                  {new Date(attempt.completedAt).toLocaleDateString("id-ID")}
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => download(attempt)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#e4694b] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Download size={14} /> Unduh sertifikat
                  </button>
                  <button
                    onClick={share}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1c2421]/15 px-3 py-2 text-xs font-bold"
                  >
                    <Share2 size={14} /> Bagikan
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
