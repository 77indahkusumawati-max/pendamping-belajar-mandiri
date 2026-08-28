// Signal & Focus: halaman materi editorial dengan langkah belajar yang dapat diikuti.
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Lightbulb,
  MessageCircle,
  PlayCircle,
  Search,
  Send,
  Bot,
  Download,
  Printer,
  GraduationCap,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type Material = {
  title: string;
  subject: string;
  summary: string;
  steps: string[];
  source: string;
  level: string;
  difficulty: "Pemula" | "Menengah" | "Lanjutan";
  track: string;
};

const makeMaterial = (
  title: string,
  subject: string,
  summary: string,
  steps: string[],
  source: string,
  level: string,
  difficulty: Material["difficulty"],
  track: string
): Material => ({
  title,
  subject,
  summary,
  steps,
  source,
  level,
  difficulty,
  track,
});

export const content: Record<string, Material> = {
  "Matematika TK": makeMaterial(
    "Bentuk dan Berhitung",
    "Matematika TK",
    "Mengenal warna, bentuk, pola, dan hitungan awal melalui permainan sederhana.",
    [
      "Kelompokkan benda berdasarkan warna dan bentuk.",
      "Hitung benda satu sampai sepuluh sambil menunjuk satu per satu.",
      "Lanjutkan pola sederhana seperti merah-biru-merah-biru.",
    ],
    "Aktivitas Numerasi Anak Usia Dini",
    "TK",
    "Pemula",
    "Numerasi dan bermain"
  ),
  "Membaca SD": makeMaterial(
    "Membaca Cerita Pendek",
    "Membaca SD",
    "Melatih kelancaran membaca dan menemukan tokoh serta kejadian penting.",
    [
      "Baca judul dan gambar untuk memperkirakan isi cerita.",
      "Tandai tokoh, tempat, dan kejadian utama.",
      "Ceritakan kembali isi bacaan dengan kalimat sendiri.",
    ],
    "Modul Literasi Dasar SD",
    "SD",
    "Pemula",
    "Literasi"
  ),
  "Matematika SD": makeMaterial(
    "Pecahan dalam Kehidupan",
    "Matematika SD",
    "Memahami pecahan melalui pembagian benda dan situasi sehari-hari.",
    [
      "Bayangkan satu benda dibagi menjadi bagian sama besar.",
      "Bandingkan pembilang dan penyebut secara perlahan.",
      "Gunakan gambar untuk menjumlahkan pecahan berpenyebut sama.",
    ],
    "Modul Numerasi SD",
    "SD",
    "Pemula",
    "Numerasi"
  ),
  "IPA SMP": makeMaterial(
    "Ekosistem dan Rantai Makanan",
    "IPA SMP",
    "Memahami hubungan makhluk hidup dengan lingkungan dan aliran energi.",
    [
      "Bedakan komponen biotik dan abiotik.",
      "Susun produsen, konsumen, dan pengurai dalam rantai makanan.",
      "Jelaskan dampak perubahan satu populasi terhadap ekosistem.",
    ],
    "Modul IPA SMP · Ekologi",
    "SMP",
    "Menengah",
    "Sains"
  ),
  "Bahasa Inggris SMP": makeMaterial(
    "Daily Conversation",
    "Bahasa Inggris SMP",
    "Berlatih ungkapan perkenalan, meminta bantuan, dan menceritakan rutinitas.",
    [
      "Hafalkan pola kalimat pendek yang sering digunakan.",
      "Latih dialog dengan pasangan atau rekaman suara.",
      "Ganti kosakata sesuai situasi sekolah dan rumah.",
    ],
    "Modul Bahasa Inggris SMP",
    "SMP",
    "Pemula",
    "Bahasa"
  ),
  Matematika: makeMaterial(
    "Fungsi Kuadrat",
    "Matematika",
    "Memahami bentuk, grafik, dan titik penting pada fungsi kuadrat secara bertahap.",
    [
      "Kenali bentuk umum f(x) = ax² + bx + c dan peran setiap koefisien.",
      "Temukan titik puncak dan sumbu simetri untuk membaca bentuk grafik.",
      "Gunakan diskriminan untuk memprediksi perpotongan grafik dengan sumbu-x.",
    ],
    "Modul Matematika SMA · Bab Fungsi",
    "SMA",
    "Menengah",
    "Numerasi"
  ),
  "Bahasa Indonesia": makeMaterial(
    "Menemukan Gagasan Utama",
    "Bahasa Indonesia",
    "Latihan menemukan ide utama dan hubungan antargagasan dalam sebuah paragraf.",
    [
      "Baca paragraf secara utuh tanpa langsung mencari kata kunci.",
      "Tandai kalimat yang menjadi inti pembahasan.",
      "Uji kembali gagasan utama dengan merangkum paragraf dalam satu kalimat.",
    ],
    "Modul Bahasa Indonesia",
    "SMA",
    "Menengah",
    "Bahasa"
  ),
  "Produktif RPL": makeMaterial(
    "HTML Dasar",
    "Produktif RPL",
    "Mengenal struktur halaman HTML dan cara menyusun elemen secara semantik.",
    [
      "Mulai dari struktur dokumen: doctype, html, head, dan body.",
      "Gunakan heading, paragraf, tautan, dan gambar sesuai tujuan konten.",
      "Periksa kembali nesting dan atribut agar halaman mudah dibaca browser.",
    ],
    "Modul Produktif RPL · Web Dasar",
    "SMK",
    "Pemula",
    "Teknologi"
  ),
  Informatika: makeMaterial(
    "Algoritma dan Pseudocode",
    "Informatika",
    "Menyusun langkah penyelesaian masalah sebelum diterjemahkan ke dalam kode program.",
    [
      "Uraikan masalah menjadi input, proses, dan output.",
      "Tulis langkah solusi menggunakan bahasa yang terstruktur dan mudah dibaca.",
      "Uji pseudocode dengan contoh sederhana sebelum masuk ke tahap implementasi.",
    ],
    "Modul Informatika SMK",
    "SMK",
    "Menengah",
    "Teknologi"
  ),
  "Bahasa Inggris": makeMaterial(
    "Reading for Main Ideas",
    "Bahasa Inggris",
    "Menemukan gagasan utama dan informasi pendukung dalam teks pendek.",
    [
      "Baca judul dan kalimat pembuka untuk memperkirakan topik.",
      "Cari detail yang menjelaskan atau mendukung gagasan utama.",
      "Tuliskan kembali inti bacaan menggunakan kalimat sederhana.",
    ],
    "Modul Bahasa Inggris SMK",
    "SMK",
    "Menengah",
    "Bahasa"
  ),
  "Pendidikan Pancasila": makeMaterial(
    "Nilai Pancasila dalam Kehidupan",
    "Pendidikan Pancasila",
    "Menghubungkan nilai setiap sila dengan contoh perilaku di lingkungan sekolah.",
    [
      "Identifikasi nilai utama dari sila yang sedang dipelajari.",
      "Hubungkan nilai tersebut dengan situasi nyata di sekolah.",
      "Jelaskan alasan tindakan tersebut mencerminkan nilai Pancasila.",
    ],
    "Modul Pendidikan Pancasila",
    "SMK",
    "Pemula",
    "Karakter"
  ),
  "Basis Data": makeMaterial(
    "Relasi dan Kunci Tabel",
    "Basis Data",
    "Memahami primary key, foreign key, dan hubungan antartabel sebelum membuat basis data aplikasi.",
    [
      "Tentukan entitas dan atribut penting dari kebutuhan pengguna.",
      "Pilih primary key yang unik dan hubungkan tabel dengan foreign key.",
      "Periksa kardinalitas agar data tidak berulang dan mudah ditelusuri.",
    ],
    "Modul Basis Data SMK",
    "SMK",
    "Menengah",
    "Teknologi"
  ),
  "Desain UI/UX": makeMaterial(
    "Hierarki Informasi",
    "Desain UI/UX",
    "Menyusun informasi agar pengguna dapat menemukan langkah belajar dengan cepat dan nyaman.",
    [
      "Kelompokkan informasi berdasarkan tujuan pengguna.",
      "Gunakan ukuran, jarak, dan warna untuk menunjukkan prioritas.",
      "Uji alur pada layar kecil dan pastikan tombol utama mudah ditemukan.",
    ],
    "Modul Desain Antarmuka",
    "SMK",
    "Menengah",
    "Kreatif digital"
  ),
  "Jaringan Komputer": makeMaterial(
    "Dasar Alamat IP",
    "Jaringan Komputer",
    "Mengenal fungsi alamat IP dan perannya dalam komunikasi antarperangkat.",
    [
      "Bedakan alamat IP, subnet mask, dan gateway.",
      "Gunakan contoh jaringan sederhana untuk membaca rentang alamat.",
      "Uji pemahaman dengan menjelaskan jalur data dari perangkat ke tujuan.",
    ],
    "Modul Jaringan Komputer SMK",
    "SMK",
    "Menengah",
    "Teknologi"
  ),
  "Statistika Kuliah": makeMaterial(
    "Statistika Deskriptif",
    "Statistika Kuliah",
    "Meringkas data menggunakan tabel, ukuran pemusatan, dan visualisasi sederhana.",
    [
      "Kenali tipe data dan susun tabel frekuensi.",
      "Hitung mean, median, dan modus dengan contoh kecil.",
      "Pilih grafik yang sesuai lalu jelaskan pola yang terlihat.",
    ],
    "Bahan Ajar Statistika Perguruan Tinggi",
    "Kuliah",
    "Menengah",
    "Analitik"
  ),
  "Pemrograman Kuliah": makeMaterial(
    "Struktur Data Dasar",
    "Pemrograman Kuliah",
    "Mengenal array, stack, queue, dan pertimbangan kompleksitas secara bertahap.",
    [
      "Bedakan kebutuhan akses data pada setiap struktur.",
      "Tulis contoh operasi tambah, ambil, dan hapus.",
      "Bandingkan efisiensi solusi menggunakan contoh input kecil.",
    ],
    "Bahan Ajar Algoritma dan Struktur Data",
    "Kuliah",
    "Lanjutan",
    "Teknologi"
  ),
  "Metodologi Penelitian Kuliah": makeMaterial(
    "Rumusan Masalah dan Variabel",
    "Metodologi Penelitian Kuliah",
    "Menyusun pertanyaan penelitian dan menentukan variabel yang dapat diamati.",
    [
      "Mulai dari fenomena yang ingin dipahami.",
      "Batasi masalah agar dapat diteliti dalam waktu yang tersedia.",
      "Definisikan variabel dan indikator pengukurannya.",
    ],
    "Bahan Ajar Metodologi Penelitian",
    "Kuliah",
    "Lanjutan",
    "Akademik"
  ),
  Fisika: makeMaterial(
    "Gerak Lurus dan Hukum Newton",
    "Fisika",
    "Memahami hubungan posisi, kecepatan, percepatan, gaya, dan massa melalui contoh sehari-hari.",
    [
      "Bedakan jarak, perpindahan, kelajuan, dan kecepatan.",
      "Gunakan grafik posisi-waktu untuk membaca gerak.",
      "Terapkan F = m × a pada masalah sederhana dan periksa satuannya.",
    ],
    "Modul Fisika SMA",
    "SMA",
    "Menengah",
    "Sains"
  ),
  Kimia: makeMaterial(
    "Atom, Ikatan, dan Reaksi Kimia",
    "Kimia",
    "Mengenal struktur atom, ikatan kimia, persamaan reaksi, dan perubahan zat.",
    [
      "Identifikasi proton, neutron, elektron, dan nomor atom.",
      "Bedakan ikatan ion, kovalen, dan logam melalui contoh.",
      "Setarakan persamaan reaksi dengan menghitung jumlah atom kiri dan kanan.",
    ],
    "Modul Kimia SMA",
    "SMA",
    "Menengah",
    "Sains"
  ),
  Biologi: makeMaterial(
    "Sel dan Sistem Kehidupan",
    "Biologi",
    "Mengenal struktur sel, fungsi organel, dan hubungan tingkat organisasi kehidupan.",
    [
      "Bedakan sel prokariotik dan eukariotik.",
      "Hubungkan organel dengan fungsi spesifiknya.",
      "Susun tingkat organisasi dari sel sampai organisme.",
    ],
    "Modul Biologi SMA",
    "SMA",
    "Menengah",
    "Sains"
  ),
  Sejarah: makeMaterial(
    "Pergerakan Nasional Indonesia",
    "Sejarah",
    "Menganalisis latar belakang, tokoh, dan dampak pergerakan nasional Indonesia.",
    [
      "Susun kronologi peristiwa penting.",
      "Bandingkan tujuan beberapa organisasi pergerakan.",
      "Jelaskan hubungan pendidikan, pers, dan kesadaran kebangsaan.",
    ],
    "Modul Sejarah Indonesia SMA",
    "SMA",
    "Menengah",
    "Akademik"
  ),
  Ekonomi: makeMaterial(
    "Permintaan, Penawaran, dan Pasar",
    "Ekonomi",
    "Memahami cara permintaan dan penawaran membentuk harga serta keputusan ekonomi.",
    [
      "Bedakan faktor yang menggeser permintaan dan perubahan jumlah diminta.",
      "Baca titik keseimbangan pada grafik sederhana.",
      "Hubungkan konsep pasar dengan kegiatan jual beli sehari-hari.",
    ],
    "Modul Ekonomi SMA",
    "SMA",
    "Menengah",
    "Analitik"
  ),
  Geografi: makeMaterial(
    "Peta, Skala, dan Mitigasi Bencana",
    "Geografi",
    "Menggunakan konsep peta dan kondisi wilayah untuk memahami risiko bencana.",
    [
      "Hitung jarak sebenarnya dari skala peta.",
      "Baca simbol, legenda, dan kontur dasar.",
      "Susun langkah mitigasi sebelum, saat, dan setelah bencana.",
    ],
    "Modul Geografi SMA",
    "SMA",
    "Menengah",
    "Sains"
  ),
  Sosiologi: makeMaterial(
    "Interaksi dan Perubahan Sosial",
    "Sosiologi",
    "Menganalisis interaksi sosial, norma, kelompok, dan perubahan di masyarakat.",
    [
      "Identifikasi syarat terjadinya interaksi sosial.",
      "Bedakan proses asosiatif dan disosiatif.",
      "Gunakan contoh lingkungan sekolah untuk membaca perubahan sosial.",
    ],
    "Modul Sosiologi SMA",
    "SMA",
    "Menengah",
    "Karakter"
  ),
  "Produktif TKJ": makeMaterial(
    "Administrasi Sistem dan Keamanan Jaringan",
    "Produktif TKJ",
    "Mengenal layanan jaringan, akun pengguna, dan prinsip keamanan dasar pada perangkat.",
    [
      "Bedakan fungsi server, client, dan layanan jaringan.",
      "Buat daftar akun serta hak akses sesuai kebutuhan.",
      "Terapkan kata sandi kuat, pembaruan sistem, dan pencadangan.",
    ],
    "Modul Produktif TKJ SMK",
    "SMK",
    "Lanjutan",
    "Teknologi"
  ),
  "Produktif Akuntansi": makeMaterial(
    "Jurnal Umum dan Siklus Akuntansi",
    "Produktif Akuntansi",
    "Mencatat transaksi dan memahami alur dasar siklus akuntansi perusahaan jasa.",
    [
      "Kelompokkan aset, kewajiban, modal, pendapatan, dan beban.",
      "Tentukan akun debit dan kredit dari transaksi.",
      "Pindahkan jurnal ke buku besar dan periksa keseimbangan.",
    ],
    "Modul Produktif Akuntansi SMK",
    "SMK",
    "Menengah",
    "Analitik"
  ),
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>\"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );

const resourceLinks: Record<string, Array<{ label: string; url: string }>> = {
  "Produktif RPL": [
    {
      label: "MDN Learn Web Development",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    },
    { label: "Google for Developers", url: "https://developers.google.com/" },
  ],
  "Basis Data": [
    { label: "OER Commons", url: "https://www.oercommons.org/" },
    { label: "SPADA", url: "https://lmsspada.kemdiktisaintek.go.id/" },
  ],
  "Jaringan Komputer": [
    { label: "OER Commons", url: "https://www.oercommons.org/" },
    {
      label: "UNESCO OER",
      url: "https://www.unesco.org/en/articles/promoting-open-educational-resources-across-indonesia",
    },
  ],
  "Desain UI/UX": [
    { label: "Google for Developers", url: "https://developers.google.com/" },
    { label: "OER Commons", url: "https://www.oercommons.org/" },
  ],
  Informatika: [
    {
      label: "MDN Learn Web Development",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    },
  ],
  "Pemrograman Kuliah": [
    { label: "MIT OpenCourseWare", url: "https://ocw.mit.edu/" },
  ],
  "Statistika Kuliah": [
    { label: "OpenStax", url: "https://openstax.org/subjects/math" },
  ],
  "Metodologi Penelitian Kuliah": [
    { label: "OER Commons", url: "https://www.oercommons.org/" },
  ],
};

export default function Materials() {
  const { user } = useAuth();
  const [, params] = useRoute("/materi/:subject");
  const [, navigate] = useLocation();
  const subject = decodeURIComponent(params?.subject ?? "Matematika");
  const managedQuery = trpc.materials.managed.useQuery();
  const managedItem = managedQuery.data?.find(
    material => material.subject === subject
  );
  const item: Material = managedItem
    ? {
        title: managedItem.title,
        subject: managedItem.subject,
        summary: managedItem.summary,
        steps: (() => {
          try {
            return JSON.parse(managedItem.steps);
          } catch {
            return managedItem.steps.split("\\n");
          }
        })(),
        source: managedItem.source,
        level: managedItem.level,
        difficulty: managedItem.difficulty as Material["difficulty"],
        track: managedItem.track,
      }
    : (content[subject] ?? content.Matematika);
  const progressQuery = trpc.progress.get.useQuery(undefined, { retry: false });
  const bookmarkQuery = trpc.materials.bookmarks.useQuery();
  const commentsQuery = trpc.materials.comments.useQuery({ subject });
  const conversationQuery = trpc.materials.conversation.useQuery({ subject });
  const [comment, setComment] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const toggleBookmark = trpc.materials.toggleBookmark.useMutation({
    onSuccess: () => {
      toast.success("Bookmark diperbarui");
      bookmarkQuery.refetch();
    },
    onError: () => toast.error("Bookmark belum tersimpan"),
  });
  const addComment = trpc.materials.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      toast.success("Pertanyaan ditambahkan");
      commentsQuery.refetch();
    },
    onError: () => toast.error("Komentar belum terkirim"),
  });
  const updateComment = trpc.materials.updateComment.useMutation({
    onSuccess: () => {
      setEditingCommentId(null);
      toast.success("Komentar diperbarui");
      commentsQuery.refetch();
    },
    onError: () => toast.error("Komentar tidak dapat diperbarui"),
  });
  const deleteComment = trpc.materials.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Komentar dihapus");
      commentsQuery.refetch();
    },
    onError: () => toast.error("Komentar tidak dapat dihapus"),
  });
  const moderateComment = trpc.materials.moderateComment.useMutation({
    onSuccess: () => {
      toast.success("Moderasi komentar diperbarui");
      commentsQuery.refetch();
    },
    onError: () => toast.error("Moderasi hanya tersedia untuk admin"),
  });
  const askAI = trpc.materials.askAI.useMutation({
    onSuccess: () => conversationQuery.refetch(),
    onError: () => toast.error("Teman AI belum dapat menjawab"),
  });
  const utils = trpc.useUtils();
  const saveProgress = trpc.progress.save.useMutation({
    onSuccess: () => {
      toast.success("Materi tersimpan sebagai selesai");
      utils.progress.get.invalidate();
    },
    onError: () =>
      toast.error("Materi belum tersimpan", {
        description: "Periksa koneksi lalu coba lagi.",
      }),
  });
  const completedMaterials = progressQuery.data?.completedMaterials ?? [];
  const isDone = completedMaterials.includes(item.subject);
  const isBookmarked =
    bookmarkQuery.data?.some(bookmark => bookmark.subject === item.subject) ??
    false;
  const exportConversation = (format: "txt" | "pdf") => {
    const entries = conversationQuery.data ?? [];
    if (!entries.length) {
      toast("Belum ada riwayat AI untuk diekspor");
      return;
    }
    const text = [
      `Riwayat Teman AI — ${item.title}`,
      `Materi: ${item.subject}`,
      "",
      ...entries.map(
        entry =>
          `${entry.role === "user" ? "Pertanyaan" : "Teman AI"}: ${entry.message}`
      ),
    ].join("\\n");
    if (format === "txt") {
      const url = URL.createObjectURL(
        new Blob([text], { type: "text/plain;charset=utf-8" })
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `riwayat-ai-${item.subject.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Riwayat AI diunduh sebagai teks");
      return;
    }
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      toast.error("Izinkan pop-up untuk membuat PDF");
      return;
    }
    printWindow.document.write(
      `<html><head><title>${escapeHtml(item.title)}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#1c2421;line-height:1.6}h1{font-size:24px}h2{font-size:14px;color:#e4694b;margin-top:24px}p{white-space:pre-wrap}</style></head><body><h1>Riwayat Teman AI — ${escapeHtml(item.title)}</h1><p>Materi: ${escapeHtml(item.subject)}</p>${entries.map(entry => `<h2>${entry.role === "user" ? "Pertanyaan" : "Teman AI"}</h2><p>${escapeHtml(entry.message)}</p>`).join("")}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const markDone = () => {
    const nextMaterials = Array.from(
      new Set([...completedMaterials, item.subject])
    );
    saveProgress.mutate({
      tasks: progressQuery.data?.tasks ?? [],
      completedMaterials: nextMaterials,
      weeklyActivity: progressQuery.data?.weeklyActivity ?? {},
      activityDates: progressQuery.data?.activityDates ?? [],
      dailyTargetMinutes: progressQuery.data?.dailyTargetMinutes ?? 30,
      reminderEnabled: progressQuery.data?.reminderEnabled ?? 0,
      reminderTime: progressQuery.data?.reminderTime ?? "19:00",
    });
    navigate(`/materi/${encodeURIComponent(item.subject)}`);
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-5 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#65716a] transition hover:text-[#e4694b]"
        >
          <ArrowLeft size={16} /> Kembali ke ringkasan
        </Link>
        <div className="mt-8 grid min-w-0 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <article className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">
              <span className="h-2 w-2 rounded-full bg-[#e4694b]" />{" "}
              {item.subject}
            </div>
            <h1 className="mt-4 max-w-2xl break-words font-display text-3xl font-bold leading-[1.05] tracking-[-.04em] sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#46564d]">
              {item.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce8d9] px-3 py-1.5 text-xs font-bold text-[#173b25]">
                <GraduationCap size={14} /> {item.level}
              </span>
              <span className="rounded-full bg-[#f0dfc2] px-3 py-1.5 text-xs font-bold text-[#684d22]">
                Kesulitan: {item.difficulty}
              </span>
              <span className="rounded-full bg-[#f1ece3] px-3 py-1.5 text-xs font-bold text-[#46564d]">
                {item.track}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#8a938d]">
              <span className="flex items-center gap-1.5">
                <Clock3 size={15} /> 18 menit
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={15} /> 3 langkah
              </span>
              {isDone && (
                <span className="flex items-center gap-1.5 text-[#6e9978]">
                  <CheckCircle2 size={15} /> Selesai
                </span>
              )}
            </div>
            <div className="mt-10 space-y-4">
              {item.steps.map((step, index) => (
                <section
                  key={step}
                  className="relative rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5 pl-16 shadow-[0_8px_24px_rgba(28,36,33,.04)]"
                >
                  <span className="absolute left-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-[#dce8d9] font-mono text-xs font-bold text-[#52715b]">
                    0{index + 1}
                  </span>
                  <h2 className="font-display text-lg font-bold">
                    Langkah {index + 1}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#65716a]">
                    {step}
                  </p>
                </section>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={markDone}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1c2421] px-4 py-3 text-sm font-bold text-[#f6f1e8] transition hover:bg-[#31443b] active:scale-[.98]"
              >
                <CheckCircle2 size={16} />{" "}
                {isDone ? "Materi sudah selesai" : "Tandai selesai"}
              </button>
              <button
                onClick={() => toggleBookmark.mutate({ subject: item.subject })}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${isBookmarked ? "border-[#6e9978] bg-[#dce8d9] text-[#52715b]" : "border-[#1c2421]/15 hover:bg-[#f1ece3]"}`}
              >
                <Bookmark
                  size={16}
                  fill={isBookmarked ? "currentColor" : "none"}
                />{" "}
                {isBookmarked ? "Tersimpan" : "Simpan materi"}
              </button>
              <Link
                href="/kuis"
                className="inline-flex items-center gap-2 rounded-xl bg-[#e4694b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ef795b] active:scale-[.98]"
              >
                <PlayCircle size={16} /> Coba kuis
              </Link>
            </div>
            <section className="mt-8 space-y-4">
              <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-[#e4694b]" />
                  <h2 className="font-display text-lg font-bold">Teman AI</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#65716a]">
                  Tanyakan bagian materi yang belum jelas. Jawaban dibuat
                  singkat dan bertahap.
                </p>
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    if (aiQuestion.trim())
                      askAI.mutate({
                        subject: item.subject,
                        question: aiQuestion,
                      });
                  }}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    value={aiQuestion}
                    onChange={event => setAiQuestion(event.target.value)}
                    placeholder="Contoh: apa fungsi primary key?"
                    className="min-w-0 flex-1 rounded-xl border border-[#1c2421]/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#e4694b]"
                  />
                  <button
                    type="submit"
                    disabled={askAI.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c2421] px-4 py-2.5 text-sm font-bold text-[#f6f1e8] disabled:opacity-50"
                  >
                    <Send size={15} />{" "}
                    {askAI.isPending ? "Menjawab..." : "Tanya AI"}
                  </button>
                </form>
                {askAI.data?.answer && (
                  <div className="mt-4 rounded-xl bg-[#eef3ec] p-4 text-sm leading-6 text-[#52715b]">
                    {askAI.data.answer}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => exportConversation("txt")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1c2421]/15 px-3 py-2 text-xs font-bold text-[#1c2421] hover:bg-[#f1ece3]"
                  >
                    <Download size={14} /> Ekspor TXT
                  </button>
                  <button
                    onClick={() => exportConversation("pdf")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1c2421]/15 px-3 py-2 text-xs font-bold text-[#1c2421] hover:bg-[#f1ece3]"
                  >
                    <Printer size={14} /> Cetak / PDF
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {conversationQuery.data?.map(entry => (
                    <div
                      key={entry.id}
                      className={`rounded-xl p-3 text-sm leading-5 ${entry.role === "user" ? "bg-[#f1ece3] text-[#65716a]" : "bg-[#eef3ec] text-[#52715b]"}`}
                    >
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#8a938d]">
                        {entry.role === "user" ? "Pertanyaanmu" : "Teman AI"}
                      </p>
                      {entry.message}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-[#e4694b]" />
                  <h2 className="font-display text-lg font-bold">
                    Diskusi materi
                  </h2>
                </div>
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    if (comment.trim())
                      addComment.mutate({
                        subject: item.subject,
                        body: comment,
                      });
                  }}
                  className="mt-4 flex gap-2"
                >
                  <input
                    value={comment}
                    onChange={event => setComment(event.target.value)}
                    placeholder="Tulis pertanyaanmu..."
                    className="min-w-0 flex-1 rounded-xl border border-[#1c2421]/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#e4694b]"
                  />
                  <button
                    type="submit"
                    disabled={addComment.isPending}
                    className="rounded-xl bg-[#e4694b] px-3 py-2.5 text-white disabled:opacity-50"
                    aria-label="Kirim komentar"
                  >
                    <Send size={15} />
                  </button>
                </form>
                <div className="mt-4 space-y-3">
                  {commentsQuery.data?.map(entry => (
                    <div key={entry.id} className="rounded-xl bg-[#f1ece3] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold">
                            {entry.userName || "Teman belajar"}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-[#65716a]">
                            {editingCommentId === entry.id ? (
                              <input
                                value={editingText}
                                onChange={event =>
                                  setEditingText(event.target.value)
                                }
                                className="w-full rounded-lg border border-[#1c2421]/10 bg-[#fbf8f3] px-2 py-1 outline-none"
                              />
                            ) : (
                              entry.body
                            )}
                          </p>
                        </div>
                        {user?.id === entry.userId && (
                          <div className="flex shrink-0 gap-2 text-[11px] font-bold">
                            <button
                              onClick={() => {
                                if (editingCommentId === entry.id)
                                  updateComment.mutate({
                                    id: entry.id,
                                    body: editingText,
                                  });
                                else {
                                  setEditingCommentId(entry.id);
                                  setEditingText(entry.body);
                                }
                              }}
                              className="text-[#e4694b]"
                            >
                              {editingCommentId === entry.id
                                ? "Simpan"
                                : "Edit"}
                            </button>
                            <button
                              onClick={() =>
                                deleteComment.mutate({ id: entry.id })
                              }
                              className="text-[#8a938d]"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                        {user?.role === "admin" && (
                          <button
                            onClick={() =>
                              moderateComment.mutate({
                                id: entry.id,
                                status:
                                  entry.status === "hidden"
                                    ? "visible"
                                    : "hidden",
                              })
                            }
                            className="mt-2 text-[11px] font-bold text-[#52715b]"
                          >
                            {entry.status === "hidden"
                              ? "Tampilkan"
                              : "Sembunyikan"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!commentsQuery.data?.length && (
                    <p className="mt-4 text-sm text-[#8a938d]">
                      Belum ada pertanyaan. Jadilah yang pertama berdiskusi.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </article>
          <aside className="self-start space-y-5 lg:sticky lg:top-6">
            <div className="rounded-2xl bg-[#dce8d9] p-5">
              <Lightbulb size={20} className="text-[#52715b]" />
              <h2 className="mt-4 font-display text-xl font-bold text-[#31483a]">
                Catatan kecil
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#52715b]">
                Jangan berhenti di membaca. Setelah memahami konsep, coba
                jelaskan kembali dengan kata-katamu sendiri.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3]">
              <div className="flex h-28 items-center justify-center bg-[#f0dfc2] text-[#89683b]">
                <BookOpen size={38} strokeWidth={1.4} />
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#8a938d]">
                  sumber materi
                </p>
                <p className="mt-2 text-sm font-bold">{item.source}</p>
                <div className="mt-4 space-y-2">
                  {(resourceLinks[item.subject] ?? []).map(resource => (
                    <a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-[#e4694b] hover:underline"
                    >
                      {resource.label} <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function MaterialsCatalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [levelFilter, setLevelFilter] = useState("Semua jenjang");
  const [difficultyFilter, setDifficultyFilter] = useState("Semua tingkat");
  const { data: bookmarks = [] } = trpc.materials.bookmarks.useQuery();
  const { data: managed = [] } = trpc.materials.managed.useQuery();
  const { data: progress } = trpc.progress.get.useQuery(undefined, {
    retry: false,
  });
  const { data: preferences } = trpc.preferences.get.useQuery();
  const completed = progress?.completedMaterials ?? [];
  const library: Record<string, Material> = {
    ...content,
    ...Object.fromEntries(
      managed.map(material => [
        material.subject,
        {
          title: material.title,
          subject: material.subject,
          summary: material.summary,
          steps: (() => {
            try {
              return JSON.parse(material.steps);
            } catch {
              return material.steps.split("\\n");
            }
          })(),
          source: material.source,
          level: material.level,
          difficulty: material.difficulty as Material["difficulty"],
          track: material.track,
        },
      ])
    ),
  };
  const toggleBookmark = trpc.materials.toggleBookmark.useMutation({
    onSuccess: () => toast.success("Bookmark diperbarui"),
    onError: () => toast.error("Bookmark belum tersimpan"),
  });
  const subjects = ["Semua", "Tersimpan", ...Object.keys(library)];
  const interestList = (() => {
    try {
      return JSON.parse(preferences?.interests ?? "[]") as string[];
    } catch {
      return [];
    }
  })();
  const items = Object.values(library).filter(item => {
    const matchesQuery = `${item.title} ${item.subject} ${item.summary}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesFilter =
      filter === "Semua" ||
      (filter === "Tersimpan"
        ? bookmarks.some(bookmark => bookmark.subject === item.subject)
        : item.subject === filter);
    const matchesLevel =
      levelFilter === "Semua jenjang" || item.level === levelFilter;
    const matchesDifficulty =
      difficultyFilter === "Semua tingkat" ||
      item.difficulty === difficultyFilter;
    return matchesQuery && matchesFilter && matchesLevel && matchesDifficulty;
  });
  const unfinished = Object.values(library).filter(
    item => !completed.includes(item.subject)
  );
  const preferenceMatches = unfinished.filter(
    item =>
      (preferences?.preferredTrack !== "Semua jalur" &&
        item.track === preferences?.preferredTrack) ||
      interestList.includes(item.track)
  );
  const hasPreferenceFilter =
    preferences?.preferredTrack !== "Semua jalur" || interestList.length > 0;
  const fallbackUsed = hasPreferenceFilter && preferenceMatches.length === 0;
  const recommendations = (
    hasPreferenceFilter && preferenceMatches.length > 0
      ? preferenceMatches
      : unfinished
  ).slice(0, 4);
  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-[#1c2421] sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#65716a] transition hover:text-[#e4694b]"
        >
          <ArrowLeft size={16} /> Kembali ke ringkasan
        </Link>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#e4694b]">
              ruang belajar
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.04em]">
              Temukan materi
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#46564d]">
              Pilih materi sesuai jenjang dan tingkat kesulitan. Rekomendasi
              akan berubah mengikuti progres belajar kamu.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#65716a]">
            <Bookmark size={15} /> {bookmarks.length} tersimpan
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-[#8a938d]">
            <Search size={17} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Cari materi atau topik..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#a4aaa5]"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-[#65716a]">
            <Filter size={16} />
            <select
              value={filter}
              onChange={event => setFilter(event.target.value)}
              className="bg-transparent text-sm font-bold outline-none"
            >
              {subjects.map(subject => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
          <select
            value={levelFilter}
            onChange={event => setLevelFilter(event.target.value)}
            className="rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-sm font-bold text-[#46564d] outline-none"
          >
            <option>Semua jenjang</option>
            {["TK", "SD", "SMP", "SMA", "SMK", "Kuliah"].map(level => (
              <option key={level}>{level}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={event => setDifficultyFilter(event.target.value)}
            className="rounded-xl border border-[#1c2421]/10 bg-[#fbf8f3] px-4 py-3 text-sm font-bold text-[#46564d] outline-none"
          >
            <option>Semua tingkat</option>
            {["Pemula", "Menengah", "Lanjutan"].map(difficulty => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
        {recommendations.length > 0 && (
          <section className="mt-8 rounded-2xl bg-[#1c2421] p-5 text-[#f6f1e8]">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#f5b09f]" />
              <h2 className="font-display text-xl font-bold">
                Rekomendasi untuk langkah berikutnya
              </h2>
            </div>
            <p className="mt-2 text-sm text-[#c4cec7]">
              {fallbackUsed
                ? "Belum ada materi yang cocok dengan preferensi saat ini, jadi kami menampilkan materi belum selesai lainnya."
                : "Mulai dari materi yang belum selesai agar progresmu berkembang bertahap."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map(recommendation => (
                <Link
                  key={recommendation.subject}
                  href={`/materi/${encodeURIComponent(recommendation.subject)}`}
                  className="rounded-xl bg-[#31443b] p-3 transition hover:-translate-y-0.5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#f5b09f]">
                    {recommendation.level} · {recommendation.difficulty}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#fbf8f3]">
                    {recommendation.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const saved = bookmarks.some(
              bookmark => bookmark.subject === item.subject
            );
            return (
              <article
                key={item.subject}
                className="flex min-w-0 flex-col rounded-2xl border border-[#1c2421]/10 bg-[#fbf8f3] p-5 shadow-[0_8px_24px_rgba(28,36,33,.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#e4694b]">
                      {item.subject}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold leading-tight">
                      {item.title}
                    </h2>
                  </div>
                  <button
                    aria-label={
                      saved
                        ? `Hapus bookmark ${item.title}`
                        : `Simpan ${item.title}`
                    }
                    onClick={() =>
                      toggleBookmark.mutate({ subject: item.subject })
                    }
                    className={`rounded-xl p-2 transition ${saved ? "bg-[#dce8d9] text-[#52715b]" : "bg-[#f1ece3] text-[#8a938d] hover:text-[#e4694b]"}`}
                  >
                    <Bookmark
                      size={17}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#dce8d9] px-2.5 py-1 text-[11px] font-bold text-[#173b25]">
                    {item.level}
                  </span>
                  <span className="rounded-full bg-[#f0dfc2] px-2.5 py-1 text-[11px] font-bold text-[#684d22]">
                    {item.difficulty}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#46564d]">
                  {item.summary}
                </p>
                <Link
                  href={`/materi/${encodeURIComponent(item.subject)}`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#e4694b]"
                >
                  Buka materi <ArrowUpRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
        {items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#1c2421]/15 p-10 text-center text-sm text-[#8a938d]">
            Materi tidak ditemukan. Coba kata kunci atau filter lain.
          </div>
        )}
      </div>
    </main>
  );
}
