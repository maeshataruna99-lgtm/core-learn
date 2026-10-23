import type { Card } from '../../core/types.ts';

// Web and HTTP fundamentals every backend interview touches. Written from scratch.
const base = { track: 'cs-basics', topic: 'web' } as const;
const mdn = 'https://developer.mozilla.org/en-US/docs/Web/HTTP';

export const cards: Card[] = [
  {
    ...base, id: 'cs-basics/web/client-server', level: 'beginner', type: 'flashcard', tags: ['http', 'interview'],
    primer: {
      en: 'When you open a web page, your browser (the client) asks another computer (the server) for it, and the server answers. Almost everything on the web, including APIs, works this way: a request goes out, a response comes back.',
      id: 'Saat kamu membuka halaman web, browser (client) meminta halaman itu ke komputer lain (server), lalu server menjawab. Hampir semua hal di web, termasuk API, bekerja begitu: request dikirim, response kembali.',
    },
    front: 'What is the client-server model and what is HTTP?',
    back: 'A client sends a request and a server returns a response. HTTP (HyperText Transfer Protocol) is the set of rules for those messages: a method and URL, headers, an optional body, and a response with a status code, headers and a body. HTTPS is HTTP over TLS.',
    explanation: 'HTTP is request-response and stateless: each request must carry everything the server needs (for example a token).',
    docsUrl: `${mdn}/Guides/Overview`,
  },
  {
    ...base, id: 'cs-basics/web/url-parts', level: 'beginner', type: 'mcq', tags: ['url'],
    primer: {
      en: 'A URL is an address with parts: how to talk (scheme), which computer (host), which program door (port), which resource (path), and extra options (query).',
      id: 'URL adalah alamat yang punya bagian-bagian: cara berbicara (scheme), komputer mana (host), pintu program mana (port), resource mana (path), dan opsi tambahan (query).',
    },
    question: 'In `https://shop.example.com:8443/users/5?sort=name#top`, which part is the query string?',
    options: ['?sort=name', '/users/5', ':8443', '#top'],
    answerIndex: 0,
    explanation: 'scheme https, host shop.example.com, port 8443, path /users/5, query sort=name, fragment top. The fragment is handled by the browser and is never sent to the server.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL',
  },
  {
    ...base, id: 'cs-basics/web/idempotent-methods', level: 'intermediate', type: 'mcq', tags: ['http', 'rest', 'interview'],
    question: 'Which HTTP method is NOT idempotent, meaning that repeating the same request can change the result again?',
    options: ['POST', 'PUT', 'DELETE', 'GET'],
    answerIndex: 0,
    explanation: 'GET, PUT and DELETE are idempotent: sending them twice leaves the server in the same state as once (the second DELETE finds nothing to delete). POST usually creates a new resource each time, so a retry may create a duplicate. That is why payment APIs add idempotency keys.',
    docsUrl: `${mdn}/Reference/Methods#safe_idempotent_and_cacheable_methods`,
  },
  {
    ...base, id: 'cs-basics/web/put-vs-patch', level: 'intermediate', type: 'mcq', tags: ['rest', 'interview'],
    question: 'You change only the email of a user. Which method best matches the intent?',
    options: ['PATCH /users/5 with {"email": "..."}', 'PUT /users/5 with only the email', 'POST /users/5/delete', 'GET /users/5?email=...'],
    answerIndex: 0,
    explanation: 'PUT replaces the whole resource with the body you send (missing fields may be cleared). PATCH applies a partial update. GET must never change data.',
    docsUrl: `${mdn}/Reference/Methods/PATCH`,
  },
  {
    ...base, id: 'cs-basics/web/rest-principles', level: 'intermediate', type: 'flashcard', tags: ['rest', 'interview'],
    front: 'What makes an API RESTful?',
    back: 'It models things as resources with URLs (/users/5), uses HTTP methods for actions (GET, POST, PUT, PATCH, DELETE), returns representations such as JSON with proper status codes, and is stateless: the server keeps no client session between requests.',
    explanation: 'REST is an architectural style, not a standard. Good practice: nouns in URLs, plural collections, versioning, and consistent error bodies.',
    docsUrl: 'https://en.wikipedia.org/wiki/REST',
  },
  {
    ...base, id: 'cs-basics/web/stateless', level: 'intermediate', type: 'mcq', tags: ['rest', 'architecture'],
    question: 'Why is a stateless API easier to scale horizontally?',
    options: [
      'Any server instance can handle any request because nothing about the client is stored on a particular instance',
      'It uses less memory per database row',
      'It never needs authentication',
      'It disables caching',
    ],
    answerIndex: 0,
    explanation: 'With a token on every request (such as a JWT) the load balancer can send each call to any instance. Server-side sessions need sticky routing or a shared session store such as Redis.',
    docsUrl: 'https://en.wikipedia.org/wiki/Stateless_protocol',
  },
  {
    ...base, id: 'cs-basics/web/what-happens-on-url', level: 'intermediate', type: 'flashcard', tags: ['networking', 'interview'],
    front: 'What happens when you type a URL into the browser and press Enter?',
    back: 'The browser looks up the domain\'s IP address (DNS), opens a TCP connection (and a TLS handshake for HTTPS), sends an HTTP request, receives the response, then parses the HTML and loads the CSS, JavaScript and images it references, and finally renders the page.',
    explanation: 'Caches speed up several steps (DNS cache, HTTP cache, CDN). Each step is also a place where things can fail or be slow.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work',
  },
  {
    ...base, id: 'cs-basics/web/cookies-vs-storage', level: 'intermediate', type: 'mcq', tags: ['browser', 'security', 'interview'],
    question: 'Which statement about browser storage is correct?',
    options: [
      'Cookies are sent to the server with every matching request; localStorage stays in the browser and is readable by any script on the page',
      'localStorage is sent to the server automatically; cookies never are',
      'sessionStorage survives after the browser is closed',
      'Cookies cannot be made HttpOnly',
    ],
    answerIndex: 0,
    explanation: 'Because any script (including an injected one) can read localStorage, avoid keeping long-lived secrets there. HttpOnly cookies cannot be read by JavaScript, which protects them from XSS theft. sessionStorage is cleared when the tab closes.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies',
  },
];
