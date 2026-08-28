// Signal & Focus: kuis singkat dengan umpan balik yang jelas dan langkah berikutnya.
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { markReviewCompleted } from "@/lib/studyEngine";

const questions = [
  {
    question: "Apa bentuk umum dari fungsi kuadrat?",
    options: [
      "f(x) = ax + b",
      "f(x) = ax² + bx + c",
      "f(x) = a/x",
      "f(x) = a + b + c",
    ],
    answer: 1,
    explanation:
      "Fungsi kuadrat memiliki pangkat tertinggi dua, sehingga bentuk umumnya adalah f(x) = ax² + bx + c.",
  },
  {
    question: "Apa yang ditunjukkan oleh titik puncak grafik fungsi kuadrat?",
    options: [
      "Nilai maksimum atau minimum",
      "Jumlah akar saja",
      "Nama variabel",
      "Panjang sumbu-x",
    ],
    answer: 0,
    explanation:
      "Titik puncak menunjukkan nilai maksimum atau minimum grafik, tergantung arah buka parabolanya.",
  },
  {
    question: "Jika diskriminan bernilai nol, grafik memotong sumbu-x di...",
    options: [
      "Dua titik berbeda",
      "Tidak pernah",
      "Satu titik",
      "Tak terhingga titik",
    ],
    answer: 2,
    explanation:
      "Diskriminan nol berarti persamaan memiliki satu akar kembar, sehingga grafik menyentuh sumbu-x di satu titik.",
  },
  {
    question:
      "Elemen HTML yang paling tepat untuk judul utama halaman adalah...",
    options: ["<p>", "<h1>", "<span>", "<footer>"],
    answer: 1,
    explanation:
      "Heading h1 digunakan untuk judul utama halaman dan membantu struktur dokumen menjadi lebih jelas.",
  },
  {
    question:
      "Apa langkah pertama yang baik saat membaca teks untuk menemukan gagasan utama?",
    options: [
      "Melewati judul",
      "Membaca secara utuh",
      "Langsung menyalin semua kalimat",
      "Menghafalkan kata terakhir",
    ],
    answer: 1,
    explanation:
      "Membaca teks secara utuh membantu memahami konteks sebelum menentukan gagasan utama.",
  },
  {
    question: "Pseudocode digunakan terutama untuk...",
    options: [
      "Menghias tampilan aplikasi",
      "Menggambarkan langkah algoritma",
      "Menggantikan database",
      "Mengukur koneksi internet",
    ],
    answer: 1,
    explanation:
      "Pseudocode menggambarkan langkah algoritma dengan bahasa terstruktur sebelum diterjemahkan ke kode.",
  },
  {
    question: "Contoh perilaku yang mencerminkan gotong royong adalah...",
    options: [
      "Mengabaikan tugas kelompok",
      "Mengerjakan semua sendiri tanpa berdiskusi",
      "Bekerja bersama menyelesaikan tugas",
      "Menunda pekerjaan teman",
    ],
    answer: 2,
    explanation:
      "Gotong royong ditunjukkan melalui kerja bersama untuk mencapai tujuan yang disepakati.",
  },
  {
    question:
      "Kunci yang nilainya harus unik untuk membedakan setiap baris tabel disebut...",
    options: ["Primary key", "Foreign key", "Index warna", "Tag HTML"],
    answer: 0,
    explanation:
      "Primary key mengidentifikasi setiap baris secara unik dalam sebuah tabel.",
  },
  {
    question:
      "Dalam desain UI/UX, ukuran dan warna yang berbeda terutama digunakan untuk...",
    options: [
      "Menghapus semua teks",
      "Menunjukkan hierarki informasi",
      "Mengganti fungsi tombol",
      "Memperbesar ukuran file",
    ],
    answer: 1,
    explanation:
      "Perbedaan ukuran, warna, dan jarak membantu pengguna memahami prioritas informasi.",
  },
  {
    question:
      "Perangkat yang menghubungkan jaringan lokal dengan jaringan lain disebut...",
    options: ["Gateway", "Keyboard", "Monitor", "Compiler"],
    answer: 0,
    explanation:
      "Gateway menjadi jalur keluar dari jaringan lokal menuju jaringan lain.",
  },
  {
    question:
      "Atribut HTML yang digunakan untuk memberikan teks alternatif pada gambar adalah...",
    options: ["href", "alt", "srcset", "target"],
    answer: 1,
    explanation:
      "Atribut alt menyediakan teks alternatif agar gambar tetap dapat dipahami saat tidak tampil.",
  },
  {
    question:
      "Hubungan satu pengguna yang memiliki banyak riwayat kuis disebut kardinalitas...",
    options: ["1:1", "1:N", "N:1 saja", "0:0"],
    answer: 1,
    explanation:
      "Satu pengguna dapat memiliki banyak riwayat kuis, sehingga relasinya adalah satu-ke-banyak atau 1:N.",
  },
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const submitAttempt = trpc.quiz.submit.useMutation({
    onSuccess: () => {
      toast.success("Hasil kuis tersimpan");
      utils.progress.get.invalidate();
      utils.quiz.recent.invalidate();
    },
    onError: () =>
      toast.error("Hasil kuis belum tersimpan", {
        description: "Periksa koneksi lalu coba lagi.",
      }),
  });
  const question = questions[current];
  const displayedScore = score;

  const choose = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setAnswers(currentAnswers => ({ ...currentAnswers, [current]: index }));
    if (index === question.answer) setScore(value => value + 1);
  };
  const playSuccessSound = () => {
    try {
      const audio = new AudioContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.45);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.45);
    } catch {
      /* Audio tidak tersedia, animasi tetap berjalan. */
    }
  };
  const next = () => {
    if (current === questions.length - 1) {
      const finalScore = score + (selected === question.answer ? 1 : 0);
      setScore(finalScore);
      if (finalScore === questions.length) playSuccessSound();
      markReviewCompleted("fungsi-kuadrat");
      submitAttempt.mutate({
        quizKey: "fungsi-kuadrat",
        score: finalScore,
        total: questions.length,
      });
      setFinished(true);
    } else {
      setCurrent(value => value + 1);
      setSelected(null);
    }
  };
  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswers({});
    setFinished(false);
  };
  const downloadCertificate = () => {
    const name = user?.name || "Teman Belajar";
    const certificate = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Lencana Temanbelajar</title><style>body{font-family:Arial,sans-serif;background:#f6f1e8;color:#1c2421;padding:48px;text-align:center}.card{max-width:720px;margin:auto;padding:72px 48px;border:10px solid #e4694b;background:#fbf8f3;border-radius:24px}.eyebrow{letter-spacing:4px;text-transform:uppercase;color:#c8563d;font-size:12px;font-weight:bold}h1{font-size:42px;margin:18px 0}p{font-size:18px;line-height:1.6}.badge{display:inline-block;margin-top:22px;padding:12px 20px;border-radius:999px;background:#dce8d9;color:#52715b;font-weight:bold}</style></head><body><div class="card"><div class="eyebrow">temanbelajar · lencana pencapaian</div><h1>Sertifikat Kuis Sempurna</h1><p>Dengan bangga diberikan kepada</p><h2>${name}</h2><p>karena berhasil menyelesaikan kuis Fungsi Kuadrat dengan nilai sempurna.</p><div class="badge">${displayedScore}/${questions.length} benar · 100%</div></div></body></html>`;
    const url = URL.createObjectURL(
      new Blob([certificate], { type: "text/html" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "sertifikat-temanbelajar.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 sm:px-5 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#65716a] transition hover:text-[#e4694b]"
        >
          <ArrowLeft size={16} /> Kembali ke ringkasan
        </Link>
        {finished ? (
          <section className="mt-20 rounded-[28px] border border-[#1c2421]/10 bg-[#fbf8f3] p-8 text-center shadow-[0_12px_32px_rgba(28,36,33,.06)] sm:p-14">
            <span
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0dfc2] text-[#89683b] ${displayedScore === questions.length ? "animate-bounce" : ""}`}
            >
              <Trophy size={30} />
            </span>
            {displayedScore === questions.length && (
              <div
                className="mt-4 text-2xl tracking-[.4em] text-[#e4694b] animate-pulse"
                aria-label="Lencana berhasil diperoleh"
              >
                ✦ ✦ ✦
              </div>
            )}
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#8a938d]">
              kuis selesai
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.04em]">
              {displayedScore} dari {questions.length} benar
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#65716a]">
              Bagus. Lihat kembali pembahasan untuk memperkuat konsep yang masih
              terasa samar.
            </p>
            {displayedScore / questions.length < 0.8 && (
              <div className="mx-auto mt-5 max-w-md rounded-xl border border-[#e4694b]/20 bg-[#f8e9e2] p-4 text-left">
                <p className="text-sm font-bold text-[#9b4938]">
                  Remedial otomatis disiapkan
                </p>
                <p className="mt-1 text-xs leading-5 text-[#9b4938]">
                  Ulangi materi dasar dan kerjakan kuis lagi setelah memahami
                  pembahasan.
                </p>
                <Link
                  href="/materi/Matematika"
                  className="mt-3 inline-flex rounded-lg bg-[#e4694b] px-3 py-2 text-xs font-bold text-white"
                >
                  Buka materi penguatan
                </Link>
              </div>
            )}
            <section className="mx-auto mt-8 max-w-2xl text-left">
              <h2 className="font-display text-lg font-bold">
                Pembahasan jawaban
              </h2>
              <div className="mt-3 space-y-3">
                {questions.map(
                  (item, index) =>
                    answers[index] !== item.answer && (
                      <article
                        key={item.question}
                        className="rounded-xl border border-[#e4694b]/20 bg-[#f8e9e2] p-4"
                      >
                        <p className="text-sm font-bold">
                          {index + 1}. {item.question}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#9f4635]">
                          Jawabanmu: {item.options[answers[index] ?? 0]}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#52715b]">
                          Jawaban benar: {item.options[item.answer]}.{" "}
                          {item.explanation}
                        </p>
                      </article>
                    )
                )}
              </div>
            </section>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {displayedScore === questions.length && (
                <button
                  onClick={downloadCertificate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#e4694b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ef795b]"
                >
                  <Trophy size={16} /> Unduh sertifikat
                </button>
              )}
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-[#1c2421]/15 px-4 py-3 text-sm font-bold transition hover:bg-[#f1ece3]"
              >
                <RotateCcw size={16} /> Ulangi kuis
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8] transition hover:bg-[#31443b]"
              >
                Kembali belajar <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">
                  evaluasi cepat · fungsi kuadrat
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold tracking-[-.04em]">
                  Kuis hari ini
                </h1>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#8a938d]">
                <CircleHelp size={16} /> {current + 1}/{questions.length}
              </span>
            </div>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#dce1db]">
              <div
                className="h-full rounded-full bg-[#e4694b] transition-all duration-300"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <div className="mt-8 min-w-0 rounded-[24px] border border-[#1c2421]/10 bg-[#fbf8f3] p-6 shadow-[0_12px_32px_rgba(28,36,33,.05)] sm:p-9">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#8a938d]">
                pertanyaan {String(current + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 max-w-xl font-display text-2xl font-bold leading-tight">
                {question.question}
              </h2>
              <div className="mt-7 space-y-3">
                {question.options.map((option, index) => {
                  const isCorrect =
                    selected !== null && index === question.answer;
                  const isWrong =
                    selected === index && index !== question.answer;
                  return (
                    <button
                      key={option}
                      onClick={() => choose(index)}
                      className={`flex w-full min-w-0 items-start gap-3 rounded-xl border px-3 py-3.5 text-left text-sm font-semibold transition active:scale-[.99] ${isCorrect ? "border-[#6e9978] bg-[#dce8d9] text-[#31483a]" : isWrong ? "border-[#e4694b] bg-[#f5dfd8] text-[#9f4635]" : "border-[#1c2421]/10 hover:border-[#e4694b]/50 hover:bg-[#f1ece3]"}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0ece4] font-mono text-xs">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isCorrect && <CheckCircle2 size={17} />}
                      {isWrong && <XCircle size={17} />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <div className="mt-6 rounded-xl bg-[#eef3ec] p-4 text-sm leading-6 text-[#52715b]">
                  <strong className="font-display">Pembahasan: </strong>
                  {question.explanation}
                </div>
              )}
              <button
                disabled={selected === null}
                onClick={next}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c2421] py-3.5 text-sm font-bold text-[#f6f1e8] transition hover:bg-[#31443b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {current === questions.length - 1
                  ? "Lihat hasil"
                  : "Pertanyaan berikutnya"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
