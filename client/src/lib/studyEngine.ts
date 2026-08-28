export type StudyPreference = { interests: string[]; preferredTrack: string };
export type StudyCandidate = {
  subject: string;
  title: string;
  track: string;
  level: string;
};
export type StudyAttempt = { quizKey: string; score: number; total: number };

const quizSubjectMap: Record<string, string> = {
  "fungsi-kuadrat": "Matematika",
  "html-dasar": "Produktif RPL",
  "basis-data": "Basis Data",
  "jaringan-komputer": "Jaringan Komputer",
};

export function buildAdaptivePlan(
  preferences: StudyPreference | undefined,
  completed: string[],
  attempts: StudyAttempt[],
  catalog: StudyCandidate[]
) {
  const weakKeys = new Set(
    attempts
      .filter(item => item.total > 0 && item.score / item.total < 0.8)
      .map(item =>
        (
          quizSubjectMap[item.quizKey.toLowerCase()] ?? item.quizKey
        ).toLowerCase()
      )
  );
  const preferred = catalog.filter(
    item =>
      (preferences?.preferredTrack === "Semua jalur" ||
        item.track === preferences?.preferredTrack ||
        preferences?.interests.some(interest =>
          item.track.toLowerCase().includes(interest.toLowerCase())
        )) &&
      !completed.includes(item.subject)
  );
  const fallback = catalog.filter(item => !completed.includes(item.subject));
  return [...preferred, ...fallback]
    .filter(
      (item, index, all) =>
        all.findIndex(other => other.subject === item.subject) === index
    )
    .sort(
      (a, b) =>
        Number(weakKeys.has(b.subject.toLowerCase())) -
        Number(weakKeys.has(a.subject.toLowerCase()))
    )
    .slice(0, 3);
}

export function reviewDue(key: string, now = Date.now()) {
  if (typeof localStorage === "undefined") return false;
  const last = Number(localStorage.getItem(`temanbelajar_review_${key}`) ?? 0);
  if (!last) return false;
  const interval = Number(
    localStorage.getItem(`temanbelajar_review_interval_${key}`) ?? 1
  );
  return now - last >= interval * 86_400_000;
}
export function markReviewCompleted(key: string) {
  if (typeof localStorage === "undefined") return;
  const current = Number(
    localStorage.getItem(`temanbelajar_review_interval_${key}`) ?? 1
  );
  localStorage.setItem(`temanbelajar_review_${key}`, String(Date.now()));
  localStorage.setItem(
    `temanbelajar_review_interval_${key}`,
    String(Math.min(current * 2, 30))
  );
}
