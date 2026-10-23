import type { Card } from '../../core/types.ts';

// Beginner foundations with bilingual primers.
const base = { track: 'security', level: 'beginner' } as const;
const cheat = 'https://cheatsheetseries.owasp.org/cheatsheets';

export const cards: Card[] = [
  {
    ...base, topic: 'foundations', id: 'security/foundations/https-tls', type: 'flashcard', tags: ['https', 'tls'],
    primer: {
      en: 'On plain HTTP, anyone on the same Wi-Fi can read or change the data in transit, like a postcard. HTTPS puts the data in a sealed, signed envelope.',
      id: 'Pada HTTP biasa, siapa pun di Wi-Fi yang sama bisa membaca atau mengubah data di perjalanan, seperti kartu pos. HTTPS memasukkan data ke amplop tertutup yang ditandatangani.',
    },
    front: 'What does HTTPS add to HTTP?',
    back: 'TLS: it encrypts traffic so others cannot read it, detects tampering, and lets the browser verify (through a certificate) that it is talking to the real server.',
    explanation: 'HTTPS protects data in transit only. It does not protect against bugs in the application itself.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security',
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/hash-vs-encrypt', type: 'mcq', tags: ['hashing', 'encryption', 'interview'],
    primer: {
      en: 'Encryption is a locked box: with the key you can open it again. Hashing is a meat grinder: you cannot turn the result back into the original, you can only grind the same input again and compare.',
      id: 'Enkripsi adalah kotak terkunci: dengan kunci kamu bisa membukanya lagi. Hashing adalah penggiling daging: hasilnya tidak bisa dikembalikan ke aslinya, kamu hanya bisa menggiling input yang sama lagi lalu membandingkan.',
    },
    question: 'Which is the main difference between hashing and encryption?',
    options: [
      'Encryption can be reversed with a key; a hash is one-way',
      'Hashing can be reversed; encryption cannot',
      'They are the same operation',
      'Hashing needs a key; encryption does not',
    ],
    answerIndex: 0,
    explanation: 'Encrypt data you must read back later (a stored API token). Hash data you only need to verify, such as passwords, using a slow, salted algorithm like argon2 or bcrypt.',
    docsUrl: `${cheat}/Password_Storage_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/xss-escape', type: 'output', tags: ['xss', 'escaping'],
    primer: {
      en: 'XSS (cross-site scripting) happens when a page prints user input as HTML. If someone types `<script>...</script>` as their name, it would run in other visitors\' browsers. Escaping turns the dangerous characters into harmless text.',
      id: 'XSS (cross-site scripting) terjadi ketika halaman mencetak input pengguna sebagai HTML. Jika seseorang mengetik `<script>...</script>` sebagai namanya, kode itu akan berjalan di browser pengunjung lain. Escaping mengubah karakter berbahaya menjadi teks biasa.',
    },
    language: 'js',
    code: `const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

console.log(escapeHtml('<b>hi</b>'));`,
    options: ['&lt;b&gt;hi&lt;/b&gt;', '<b>hi</b>', 'hi', '&amp;lt;b&amp;gt;hi'],
    answerIndex: 0,
    verifiedOutput: '&lt;b&gt;hi&lt;/b&gt;',
    explanation: 'The angle brackets become &lt; and &gt;, so the browser shows the text instead of treating it as a tag. Frameworks such as Vue do this automatically for {{ }}, but not for v-html.',
    docsUrl: `${cheat}/Cross_Site_Scripting_Prevention_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/csrf', type: 'flashcard', tags: ['csrf'],
    primer: {
      en: 'Your browser attaches your login cookie to every request to a site, even requests started by another site. CSRF abuses that: a bad page makes your browser send a "transfer money" request while you are logged in.',
      id: 'Browser menempelkan cookie login ke setiap request ke sebuah situs, bahkan request yang dimulai oleh situs lain. CSRF menyalahgunakan hal itu: halaman jahat membuat browsermu mengirim request "transfer uang" saat kamu sedang login.',
    },
    front: 'What is CSRF and how do you defend against it?',
    back: 'Cross-Site Request Forgery: another site makes the victim\'s browser send an authenticated request. Defend with SameSite cookies (Lax or Strict), anti-CSRF tokens, and by never changing data on GET requests.',
    explanation: 'APIs that read a token from an Authorization header (not a cookie) are not affected, because the browser does not attach that header by itself.',
    docsUrl: `${cheat}/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`,
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/httponly-cookie', type: 'mcq', tags: ['cookies', 'xss'],
    primer: {
      en: 'A cookie is a small piece of data the browser stores and sends back automatically. Flags on the cookie decide who may read it.',
      id: 'Cookie adalah data kecil yang disimpan browser dan dikirim balik secara otomatis. Flag pada cookie menentukan siapa yang boleh membacanya.',
    },
    question: 'What does the HttpOnly flag on a session cookie do?',
    options: [
      'JavaScript in the page cannot read the cookie, so an XSS bug cannot steal it',
      'The cookie is sent only over HTTP, not HTTPS',
      'The cookie never expires',
      'The cookie is shared with all subdomains',
    ],
    answerIndex: 0,
    explanation: 'HttpOnly hides the cookie from document.cookie. Add Secure (HTTPS only) and SameSite to complete the set.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies#security',
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/least-privilege', type: 'flashcard', tags: ['principles'],
    primer: {
      en: 'Give a person or program only the access it needs for its job and nothing more, like giving a guest a key to one room, not to the whole house.',
      id: 'Berikan orang atau program hanya akses yang dibutuhkan untuk tugasnya dan tidak lebih, seperti memberi tamu kunci satu kamar, bukan seluruh rumah.',
    },
    front: 'What is the principle of least privilege?',
    back: 'Every user, service and token gets the minimum permissions required. A bug or a stolen credential then causes limited damage; for example, a reporting service gets a read-only database user.',
    explanation: 'It applies to database accounts, API keys, cloud roles and user roles in your app.',
    docsUrl: `${cheat}/Authorization_Cheat_Sheet.html#enforce-least-privileges`,
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/what-is-owasp', type: 'flashcard', tags: ['owasp', 'interview'],
    primer: {
      en: 'OWASP is a non-profit community that publishes free security guides. Interviewers often ask about its "Top 10" lists: the most common serious web and API weaknesses.',
      id: 'OWASP adalah komunitas nirlaba yang menerbitkan panduan keamanan gratis. Pewawancara sering menanyakan daftar "Top 10" miliknya: kelemahan web dan API yang paling umum dan serius.',
    },
    front: 'What is OWASP and what is the OWASP Top 10?',
    back: 'The Open Worldwide Application Security Project, a non-profit that publishes free security resources. The Top 10 is its ranked list of the most critical web application risks, with a separate API Security Top 10.',
    explanation: 'Broken access control, injection and security misconfiguration are recurring entries.',
    docsUrl: 'https://owasp.org/www-project-top-ten/',
  },
  {
    ...base, topic: 'foundations', id: 'security/foundations/authn-vs-authz-simple', type: 'mcq', tags: ['auth', 'interview'],
    primer: {
      en: 'Authentication answers "who are you?" (logging in). Authorization answers "what are you allowed to do?" (permissions). They are two different checks, in that order.',
      id: 'Authentication menjawab "siapa kamu?" (proses login). Authorization menjawab "apa yang boleh kamu lakukan?" (hak akses). Keduanya adalah dua pemeriksaan berbeda, dalam urutan itu.',
    },
    question: 'An airport checks your passport at the entrance and your boarding pass at the gate. Which is authentication?',
    options: [
      'The passport check (proving who you are)',
      'The boarding pass check',
      'Both are authentication',
      'Neither',
    ],
    answerIndex: 0,
    explanation: 'The passport proves identity (authentication). The boarding pass decides what you may access (authorization). A web app does the same: login first, then permission checks on each action.',
    docsUrl: `${cheat}/Authentication_Cheat_Sheet.html`,
  },
];
