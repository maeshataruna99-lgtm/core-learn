import { useStore } from '../composables/useStore.ts';

// UI strings only. Card content and code stay in English.
export const en = {
  'nav.home': 'Home', 'nav.learn': 'Learn', 'nav.practice': 'Practice', 'nav.progress': 'Progress', 'nav.settings': 'Settings',
  'home.due': 'due today ({n} total)', 'home.streak': 'day streak', 'home.continue': 'Continue',
  'home.learn': 'Learn', 'home.learnText': 'Guided topics, beginner to advanced',
  'home.revise': 'Revise', 'home.reviseText': 'Due and weakest cards first',
  'home.interview': 'Interview', 'home.interviewText': 'Timed, mixed tracks',
  'card.primer': 'Learn the basics first',
  'card.reveal': 'Tap to reveal', 'card.knew': 'Knew it', 'card.didnt': "Didn't",
  'card.printQ': 'What does this print?', 'card.tapBug': 'Tap the buggy line.',
  'card.correctAnswer': '✓ Correct answer', 'card.yourAnswer': '✗ Your answer', 'card.bug': '← bug',
  'card.correct': '✓ Correct', 'card.wrong': '✗ Not quite', 'card.inspired': 'Inspired by',
  'card.docs': 'Official docs', 'card.next': 'Next',
  'quiz.cardOf': 'Card {i} of {n}', 'quiz.done': 'Done', 'quiz.score': '{right} / {total} correct',
  'quiz.in': 'in {time}', 'quiz.empty': 'No cards match these filters.', 'quiz.elapsed': 'Elapsed time',
  'learn.title': 'Learn', 'learn.back': '← Back', 'learn.cards': '({n} cards)', 'learn.another': 'Choose another topic',
  'practice.title': 'Practice', 'practice.interview': 'Interview', 'practice.tracks': 'Tracks', 'practice.level': 'Level',
  'practice.types': 'Card types', 'practice.length': 'Length', 'practice.timer': 'Timer',
  'practice.matching': '{n} matching cards (leave filters empty for all)', 'practice.start': 'Start', 'practice.new': 'New session',
  'progress.title': 'Progress', 'progress.mastery': 'Mastery by track', 'progress.weak': 'Weak cards',
  'progress.none': 'No wrong answers yet.', 'progress.wrong': '({n} wrong)', 'progress.backup': 'Backup',
  'progress.export': 'Export JSON', 'progress.import': 'Import JSON',
  'progress.confirm': 'File contains {n} cards of progress. Replace current progress?',
  'progress.replace': 'Replace', 'progress.cancel': 'Cancel', 'progress.imported': 'Progress imported.',
  'progress.failed': 'Import failed: {e}', 'progress.reset': 'Reset progress',
  'progress.resetConfirm': 'Reset all progress? This cannot be undone.',
  'settings.title': 'Settings', 'settings.theme': 'Theme', 'settings.system': 'System', 'settings.light': 'Light',
  'settings.dark': 'Dark', 'settings.length': 'Default quiz length', 'settings.timer': 'Timer on by default',
  'settings.language': 'Language', 'settings.langNote': 'Only the app interface is translated; card content and code stay in English.',
  'pwa.update': 'A new version is available.', 'pwa.reload': 'Reload', 'pwa.offline': 'Ready to work offline.',
} as const;

export type Key = keyof typeof en;

export const id: Record<Key, string> = {
  'nav.home': 'Beranda', 'nav.learn': 'Belajar', 'nav.practice': 'Latihan', 'nav.progress': 'Progres', 'nav.settings': 'Pengaturan',
  'home.due': 'jatuh tempo hari ini (total {n})', 'home.streak': 'hari beruntun', 'home.continue': 'Lanjutkan',
  'home.learn': 'Belajar', 'home.learnText': 'Topik terarah, dari pemula sampai mahir',
  'home.revise': 'Ulangi', 'home.reviseText': 'Kartu jatuh tempo dan terlemah dulu',
  'home.interview': 'Wawancara', 'home.interviewText': 'Berwaktu, campuran track',
  'card.primer': 'Pelajari dasarnya dulu',
  'card.reveal': 'Ketuk untuk melihat jawaban', 'card.knew': 'Tahu', 'card.didnt': 'Belum tahu',
  'card.printQ': 'Apa yang dicetak kode ini?', 'card.tapBug': 'Ketuk baris yang salah.',
  'card.correctAnswer': '✓ Jawaban benar', 'card.yourAnswer': '✗ Jawabanmu', 'card.bug': '← bug',
  'card.correct': '✓ Benar', 'card.wrong': '✗ Belum tepat', 'card.inspired': 'Terinspirasi dari',
  'card.docs': 'Dokumentasi resmi', 'card.next': 'Lanjut',
  'quiz.cardOf': 'Kartu {i} dari {n}', 'quiz.done': 'Selesai', 'quiz.score': '{right} / {total} benar',
  'quiz.in': 'dalam {time}', 'quiz.empty': 'Tidak ada kartu yang cocok dengan filter ini.', 'quiz.elapsed': 'Waktu berjalan',
  'learn.title': 'Belajar', 'learn.back': '← Kembali', 'learn.cards': '({n} kartu)', 'learn.another': 'Pilih topik lain',
  'practice.title': 'Latihan', 'practice.interview': 'Wawancara', 'practice.tracks': 'Track', 'practice.level': 'Level',
  'practice.types': 'Jenis kartu', 'practice.length': 'Jumlah', 'practice.timer': 'Timer',
  'practice.matching': '{n} kartu cocok (kosongkan filter untuk semua)', 'practice.start': 'Mulai', 'practice.new': 'Sesi baru',
  'progress.title': 'Progres', 'progress.mastery': 'Penguasaan per track', 'progress.weak': 'Kartu lemah',
  'progress.none': 'Belum ada jawaban salah.', 'progress.wrong': '({n} salah)', 'progress.backup': 'Cadangan',
  'progress.export': 'Ekspor JSON', 'progress.import': 'Impor JSON',
  'progress.confirm': 'File berisi progres {n} kartu. Ganti progres saat ini?',
  'progress.replace': 'Ganti', 'progress.cancel': 'Batal', 'progress.imported': 'Progres berhasil diimpor.',
  'progress.failed': 'Impor gagal: {e}', 'progress.reset': 'Reset progres',
  'progress.resetConfirm': 'Reset semua progres? Tindakan ini tidak bisa dibatalkan.',
  'settings.title': 'Pengaturan', 'settings.theme': 'Tema', 'settings.system': 'Sistem', 'settings.light': 'Terang',
  'settings.dark': 'Gelap', 'settings.length': 'Jumlah kuis bawaan', 'settings.timer': 'Timer aktif secara bawaan',
  'settings.language': 'Bahasa', 'settings.langNote': 'Hanya antarmuka aplikasi yang diterjemahkan; isi kartu dan kode tetap berbahasa Inggris.',
  'pwa.update': 'Versi baru tersedia.', 'pwa.reload': 'Muat ulang', 'pwa.offline': 'Siap digunakan secara offline.',
};

export type Vars = Record<string, string | number>;

export function translate(lang: 'en' | 'id', key: Key, vars: Vars = {}): string {
  const text = (lang === 'id' ? id : en)[key];
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

export function useT() {
  const { store } = useStore();
  return (key: Key, vars?: Vars) => translate(store.settings.language, key, vars);
}
