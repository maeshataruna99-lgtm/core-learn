import type { Card } from '../../core/types.ts';

const base = { track: 'java-spring', stack: 'spring' } as const;
const assessment = 'maeshataruna99-lgtm/mahesha-streamworx-assessment';
const svc = 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi';
const spring = 'https://docs.spring.io/spring-framework/reference';
const boot = 'https://docs.spring.io/spring-boot/reference';

export const cards: Card[] = [
  // ---- java-basics (more, executed) ----
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/integer-division', type: 'output', level: 'beginner', tags: ['numbers'],
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        int x = 5 / 2;
        double y = 5 / 2;
        System.out.println(x + " " + y);
    }
}`,
    options: ['2 2.5', '2 2.0', '2.5 2.5', '2 2'],
    answerIndex: 1,
    verifiedOutput: '2 2.0',
    explanation: 'Both operands are int, so the division is integer division (2) even when the result is stored in a double. Write 5 / 2.0 to get 2.5.',
    docsUrl: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.17.2',
  },
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/integer-cache', type: 'output', level: 'advanced', tags: ['boxing'],
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println(a == b);
        System.out.println(c == d);
    }
}`,
    options: ['true then true', 'true then false', 'false then true', 'false then false'],
    answerIndex: 1,
    verifiedOutput: 'true\nfalse',
    explanation: 'Integer.valueOf caches boxed values from -128 to 127, so 127 is the same object but 128 is not. Compare boxed numbers with equals.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html#valueOf(int)',
  },
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/list-of-immutable', type: 'output', level: 'intermediate', tags: ['collections'],
    language: 'java',
    code: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        try {
            List.of(1).add(2);
            System.out.println("added");
        } catch (UnsupportedOperationException e) {
            System.out.println("immutable");
        }
    }
}`,
    options: ['added', 'immutable', '[1, 2]', 'ClassCastException'],
    answerIndex: 1,
    verifiedOutput: 'immutable',
    explanation: 'List.of returns an unmodifiable list, so add throws UnsupportedOperationException. Copy into new ArrayList<>(...) if you need to mutate.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html#of(E)',
  },
  // ---- spring-boot-basics ----
  {
    ...base, topic: 'spring-boot-basics', id: 'java-spring/spring-boot-basics/spring-boot-application', type: 'mcq', level: 'beginner', tags: ['annotations'],
    question: '@SpringBootApplication is a shortcut for which three annotations?',
    options: [
      '@SpringBootConfiguration (a @Configuration), @EnableAutoConfiguration, @ComponentScan',
      '@Controller, @Service, @Repository',
      '@Bean, @Autowired, @Component',
      '@Transactional, @Cacheable, @Async',
    ],
    answerIndex: 0,
    explanation: 'It marks a configuration class, turns on auto-configuration from the classpath, and scans the package and its sub-packages for components.',
    docsUrl: `${boot}/using/using-the-springbootapplication-annotation.html`,
  },
  {
    ...base, topic: 'spring-boot-basics', id: 'java-spring/spring-boot-basics/configuration-properties', type: 'mcq', level: 'intermediate', tags: ['config'],
    question: 'RestClientConfig uses @EnableConfigurationProperties(ClientProperties.class). What is the benefit over many @Value fields?',
    options: [
      'Typed, grouped, validated configuration bound from application.yml in one object',
      'It loads properties lazily on each request',
      'It encrypts the values',
      'It disables environment variables',
    ],
    answerIndex: 0,
    explanation: '@ConfigurationProperties binds a prefix to a class or record with relaxed naming and type conversion, so timeouts become Duration values instead of loose strings.',
    source: { repo: assessment, path: `${svc}/config/RestClientConfig.java` },
    docsUrl: `${boot}/features/external-config.html#features.external-config.typesafe-configuration-properties`,
  },
  {
    ...base, topic: 'spring-boot-basics', id: 'java-spring/spring-boot-basics/profiles', type: 'flashcard', level: 'beginner', tags: ['config', 'profiles'],
    front: 'What are Spring profiles for?',
    back: 'Environment-specific configuration. Activate with spring.profiles.active (or SPRING_PROFILES_ACTIVE) to load application-{profile}.yml and beans annotated @Profile.',
    explanation: 'Typical profiles: dev, test, prod. Keep secrets in environment variables, not in the committed files.',
    docsUrl: `${boot}/features/profiles.html`,
  },
  {
    ...base, topic: 'spring-boot-basics', id: 'java-spring/spring-boot-basics/primary-bean', type: 'mcq', level: 'advanced', tags: ['di', 'beans'],
    question: 'RestClientConfig defines two RestClient.Builder beans (one @Primary and plain, one @LoadBalanced). Why mark the plain one @Primary?',
    options: [
      'Other components that inject RestClient.Builder without a qualifier, such as the Eureka client, must get the plain one',
      'So the load-balanced builder is never created',
      'To make beans singletons',
      'Because @Primary is required on every @Bean method',
    ],
    answerIndex: 0,
    explanation: 'With two beans of the same type, injection is ambiguous. @Primary decides the default; the load-balanced builder is requested explicitly where service-name resolution is needed.',
    source: { repo: assessment, path: `${svc}/config/RestClientConfig.java` },
    docsUrl: `${spring}/core/beans/annotation-config/autowired-primary.html`,
  },
  // ---- rest-controllers (more) ----
  {
    ...base, topic: 'rest-controllers', id: 'java-spring/rest-controllers/explicit-produces', type: 'mcq', level: 'advanced', tags: ['content-negotiation'],
    question: 'UserController declares `@GetMapping(value = "/api/users", produces = MediaType.APPLICATION_JSON_VALUE)`. Why set produces explicitly?',
    options: [
      'jackson-dataformat-xml is on the classpath, and a browser Accept header that prefers XML would otherwise receive XML',
      'To make the endpoint faster',
      'Because JSON is not supported by default',
      'To require authentication',
    ],
    answerIndex: 0,
    explanation: 'Content negotiation picks a converter from the Accept header. Adding an XML library introduces a second candidate, so pinning produces keeps the response format stable.',
    source: { repo: assessment, path: `${svc}/controller/UserController.java` },
    docsUrl: `${spring}/web/webmvc/mvc-controller/ann-requestmapping.html#mvc-ann-requestmapping-produces`,
  },
  {
    ...base, topic: 'rest-controllers', id: 'java-spring/rest-controllers/problem-detail', type: 'flashcard', level: 'intermediate', tags: ['errors', 'http'],
    front: 'What is ProblemDetail and how does UserController use it?',
    back: 'Spring\'s implementation of RFC 9457 "problem details" error bodies. An @ExceptionHandler returns ProblemDetail.forStatusAndDetail(503, message) so clients get a standard JSON error with the right status.',
    explanation: 'The handler maps PostsUnavailableException to 503 Service Unavailable because the failure is in a dependency, not in the request.',
    source: { repo: assessment, path: `${svc}/controller/UserController.java` },
    docsUrl: `${spring}/web/webmvc/mvc-ann-rest-exceptions.html`,
  },
  {
    ...base, topic: 'rest-controllers', id: 'java-spring/rest-controllers/status-codes', type: 'mcq', level: 'beginner', tags: ['http'],
    question: 'A POST creates a new resource. Which response is the REST convention?',
    options: ['201 Created with a Location header', '200 OK with an empty body', '204 No Content', '302 Found'],
    answerIndex: 0,
    explanation: 'Return 201 and point Location at the new resource. In Spring use ResponseEntity.created(uri).body(...).',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201',
  },
  // ---- jpa ----
  {
    ...base, topic: 'jpa', id: 'java-spring/jpa/lazy-default', type: 'mcq', level: 'intermediate', tags: ['jpa', 'fetch'],
    question: 'What is the default fetch type of a @OneToMany association?',
    options: ['LAZY', 'EAGER', 'IMMEDIATE', 'BATCH'],
    answerIndex: 0,
    explanation: 'To-many associations are lazy by default; to-one (@ManyToOne, @OneToOne) are eager by default. Touching a lazy collection after the session closes throws LazyInitializationException.',
    docsUrl: 'https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/OneToMany.html',
  },
  {
    ...base, topic: 'jpa', id: 'java-spring/jpa/n-plus-one-entity-graph', type: 'mcq', level: 'advanced', tags: ['jpa', 'performance'],
    question: 'Loading 100 orders and then reading order.getItems() for each runs 101 queries. Which change fixes it?',
    options: [
      'Fetch the association together, with JOIN FETCH or @EntityGraph on the repository method',
      'Make the association EAGER globally',
      'Call flush() after each read',
      'Increase the connection pool size',
    ],
    answerIndex: 0,
    explanation: 'Fetching the association in the same query removes the per-row lookups. Switching to EAGER globally only hides the problem and affects every query.',
    docsUrl: 'https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.entity-graph',
  },
  {
    ...base, topic: 'jpa', id: 'java-spring/jpa/transactional-self-invocation', type: 'mcq', level: 'advanced', tags: ['transactions', 'proxies'],
    question: 'Method a() in a bean calls this.b(), and b() is annotated @Transactional. Why is no transaction started?',
    options: [
      'Spring applies @Transactional through a proxy, and a call on this bypasses the proxy',
      'b() must be private',
      '@Transactional only works on interfaces',
      'Transactions require @Async',
    ],
    answerIndex: 0,
    explanation: 'Self-invocation never goes through the proxy. Move b() to another bean, or put @Transactional on the entry point that is called from outside.',
    docsUrl: `${spring}/data-access/transaction/declarative/annotations.html`,
  },
  // ---- validation (more) ----
  {
    ...base, topic: 'validation', id: 'java-spring/validation/notblank-vs-notnull', type: 'mcq', level: 'beginner', tags: ['validation'],
    question: 'Which constraint rejects null, "" and "   " for a String?',
    options: ['@NotBlank', '@NotNull', '@NotEmpty', '@Size(min = 1)'],
    answerIndex: 0,
    explanation: '@NotNull only rejects null. @NotEmpty also rejects "". @NotBlank also rejects strings of only whitespace.',
    docsUrl: 'https://jakarta.ee/specifications/bean-validation/3.0/apidocs/jakarta/validation/constraints/NotBlank.html',
  },
  {
    ...base, topic: 'validation', id: 'java-spring/validation/validated-path', type: 'flashcard', level: 'intermediate', tags: ['validation'],
    front: '@Valid on @RequestBody vs @Validated on the controller class',
    back: '@Valid on a @RequestBody parameter validates that body and fails with MethodArgumentNotValidException. @Validated on the class enables constraint annotations directly on @PathVariable and @RequestParam, failing with HandlerMethodValidationException/ConstraintViolationException.',
    explanation: 'Use @Valid for request bodies and put constraints such as @Min(1) on simple parameters when you need them.',
    docsUrl: `${spring}/core/validation/beanvalidation.html`,
  },
];
