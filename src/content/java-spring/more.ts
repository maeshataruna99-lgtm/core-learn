import type { Card } from '../../core/types.ts';

const base = { track: 'java-spring', stack: 'spring' } as const;
const repo = 'maeshataruna99-lgtm/mahesha-streamworx-assessment';
const gateway = 'services/gateway-discovery/src/main/java/id/maetaruna/assessment/gateway';
const tests1 = 'services/api-1-user-aggregator/src/test/java/id/maetaruna/assessment/userapi';
const tests2 = 'services/api-2-post-xml/src/test/java/id/maetaruna/assessment/postapi';
const spring = 'https://docs.spring.io/spring-framework/reference';
const cloud = 'https://docs.spring.io/spring-cloud-commons/reference';

export const cards: Card[] = [
  // ---- java-basics (more, executed) ----
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/record-equals', type: 'output', level: 'intermediate', tags: ['records'],
    language: 'java',
    code: `public class Main {
    record Point(int x) {}

    public static void main(String[] args) {
        System.out.println(new Point(1).equals(new Point(1)));
        System.out.println(new Point(1));
    }
}`,
    options: ['true then Point[x=1]', 'false then Point@1', 'true then Point(x=1)', 'false then Point[x=1]'],
    answerIndex: 0,
    verifiedOutput: 'true\nPoint[x=1]',
    explanation: 'A record generates equals, hashCode and toString from its components, so two records with equal fields are equal. That makes records a good fit for DTOs and for @ConfigurationProperties.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/language/records.html',
  },
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/optional-map', type: 'output', level: 'intermediate', tags: ['optional'],
    language: 'java',
    code: `import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String name = null;
        System.out.println(Optional.ofNullable(name).map(String::toUpperCase).orElse("none"));
        System.out.println(Optional.of("ann").map(String::toUpperCase).orElse("none"));
    }
}`,
    options: ['none then ANN', 'null then ANN', 'none then ann', 'NullPointerException'],
    answerIndex: 0,
    verifiedOutput: 'none\nANN',
    explanation: 'map is skipped for an empty Optional, so orElse supplies the default. Use Optional for return values that may be absent, not for fields or parameters.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html',
  },
  // ---- service-discovery ----
  {
    ...base, topic: 'service-discovery', id: 'java-spring/service-discovery/eureka', type: 'flashcard', level: 'intermediate', tags: ['eureka', 'microservices'],
    front: 'What does Eureka service discovery solve?',
    back: 'Services register their address with the Eureka server and clients look up instances by service name, so nobody hardcodes hosts and ports. Instances can come and go and the registry keeps the list current.',
    explanation: 'In the assessment, the gateway routes to lb://api-1-user-aggregator and lb://api-2-post-xml by service name, and API 1 reaches api-2 the same way, never by host and port.',
    source: { repo, path: 'services/gateway-discovery' },
    docsUrl: 'https://docs.spring.io/spring-cloud-netflix/reference/spring-cloud-netflix.html',
  },
  {
    ...base, topic: 'service-discovery', id: 'java-spring/service-discovery/load-balanced-builder', type: 'mcq', level: 'advanced', tags: ['load-balancer', 'restclient'],
    question: 'What does annotating a RestClient.Builder bean with @LoadBalanced change?',
    options: [
      'Requests to a service id such as http://api-2/posts are resolved to a registered instance',
      'Requests are retried automatically forever',
      'Responses are cached',
      'The client becomes asynchronous',
    ],
    answerIndex: 0,
    explanation: 'The load-balancer interceptor replaces the logical host with a concrete instance from discovery. Keep it on a separate builder from the default one so clients that need plain DNS hosts are unaffected.',
    source: { repo, path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/config/RestClientConfig.java' },
    docsUrl: `${cloud}/loadbalancer/client.html`,
  },
  // ---- gateway ----
  {
    ...base, topic: 'gateway', id: 'java-spring/gateway/route-parts', type: 'flashcard', level: 'intermediate', tags: ['gateway'],
    front: 'What are the parts of a Spring Cloud Gateway route?',
    back: 'An id, a destination (uri or service id), predicates that decide whether a request matches (path, method, header) and filters that change the request or response (strip a prefix, add a header).',
    explanation: 'Predicates answer "does this route apply?"; filters answer "what do we do to the exchange?".',
    source: { repo, path: gateway },
    docsUrl: 'https://docs.spring.io/spring-cloud-gateway/reference/',
  },
  {
    ...base, topic: 'gateway', id: 'java-spring/gateway/custom-health-indicator', type: 'mcq', level: 'intermediate', tags: ['actuator', 'health'],
    question: 'The gateway\'s RoutedServicesHealthIndicator reports OUT_OF_SERVICE until every lb:// route target has a registered instance. Why build that check?',
    options: [
      'So docker compose can wait for it, and the first request after startup does not race Eureka registration',
      'To restart services that are down',
      'To balance load between instances',
      'To validate request bodies',
    ],
    answerIndex: 0,
    explanation: 'A custom HealthIndicator adds a named component (with details such as waitingFor) to /actuator/health. Readiness should mean "can really serve traffic", not just "the JVM started".',
    source: { repo, path: `${gateway}/RoutedServicesHealthIndicator.java` },
    docsUrl: 'https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.health',
  },
  // ---- testing ----
  {
    ...base, topic: 'testing', id: 'java-spring/testing/testcontainers', type: 'mcq', level: 'intermediate', tags: ['testcontainers', 'integration'],
    question: 'The assessment tests use PostgresContainerConfig and RedisContainerConfig. Why run real containers instead of an in-memory fake?',
    options: [
      'The tests exercise the real database engine and driver behaviour, so dialect and serialization differences show up',
      'Containers are faster than mocks',
      'Spring requires containers',
      'It removes the need for any assertions',
    ],
    answerIndex: 0,
    explanation: 'H2 or a hand-written fake can pass while production Postgres or Redis behaves differently. Testcontainers starts the real thing for the test run and discards it afterwards (with @ServiceConnection Spring Boot wires the app to it automatically); the cost is a slower, Docker-dependent test.',
    source: { repo, path: `${tests2}/PostgresContainerConfig.java` },
    docsUrl: 'https://docs.spring.io/spring-boot/reference/testing/testcontainers.html',
  },
  {
    ...base, topic: 'testing', id: 'java-spring/testing/web-mvc-test', type: 'flashcard', level: 'intermediate', tags: ['testing', 'slices'],
    front: '@WebMvcTest vs @SpringBootTest',
    back: '@WebMvcTest loads only the web layer (controllers, filters, converters) and expects collaborators to be mocked with @MockitoBean, so it is fast. @SpringBootTest starts the full application context, optionally with a real port, for end-to-end integration tests.',
    explanation: 'The assessment pairs controller slice tests (UserControllerTest) with full-context tests that talk to real containers.',
    source: { repo, path: `${tests1}/controller/UserControllerTest.java` },
    docsUrl: 'https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.autoconfigured-spring-mvc-tests',
  },
  {
    ...base, topic: 'testing', id: 'java-spring/testing/contract-test', type: 'flashcard', level: 'advanced', tags: ['contract', 'api'],
    front: 'What does a contract test such as UsersJsonContractTest or PostsXmlContractTest protect?',
    back: 'The exact shape of the public response (field names, nesting, types, content type). It fails when a refactor changes the JSON or XML a client depends on, even if the unit tests still pass.',
    explanation: 'It is cheap insurance for an API that has consumers you do not control, such as the aggregator reading the XML API.',
    source: { repo, path: `${tests1}/UsersJsonContractTest.java` },
    docsUrl: 'https://martinfowler.com/bliki/ContractTest.html',
  },
  // ---- resilience ----
  {
    ...base, topic: 'resilience', id: 'java-spring/resilience/connect-vs-read-timeout', type: 'mcq', level: 'intermediate', tags: ['timeouts', 'restclient'],
    question: 'RestClientConfig sets both a connect timeout and a read timeout. What is the difference?',
    options: [
      'Connect limits establishing the TCP connection; read limits waiting for response data once connected',
      'They are two names for the same limit',
      'Connect is for the database, read for the cache',
      'Read applies only to POST requests',
    ],
    answerIndex: 0,
    explanation: 'A host that is down fails at connect; a host that accepts the connection but hangs is caught by read. Without both, one slow dependency can tie up all your threads.',
    source: { repo, path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/config/RestClientConfig.java' },
    docsUrl: 'https://docs.spring.io/spring-boot/reference/io/rest-client.html',
  },
  {
    ...base, topic: 'resilience', id: 'java-spring/resilience/gateway-status-codes', type: 'mcq', level: 'intermediate', tags: ['http', 'gateway'],
    question: 'A gateway forwards a request and the upstream service does not answer within the timeout. Which status is correct?',
    options: ['504 Gateway Timeout', '502 Bad Gateway', '404 Not Found', '500 Internal Server Error'],
    answerIndex: 0,
    explanation: '504 means the upstream timed out, 502 means it returned an invalid response (or the connection broke), and 503 means the service is unavailable, for example no instance is registered.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/504',
  },
  {
    ...base, topic: 'resilience', id: 'java-spring/resilience/router-function-errors', type: 'mcq', level: 'advanced', tags: ['gateway', 'errors'],
    question: 'The gateway has a ServiceUnavailableResolver (a HandlerExceptionResolver) instead of a @ControllerAdvice. Why?',
    options: [
      'Gateway routes are router functions, which @ControllerAdvice does not cover, so the exception would become a generic 500',
      '@ControllerAdvice is deprecated',
      'Resolvers are faster than advice',
      'A route cannot throw exceptions',
    ],
    answerIndex: 0,
    explanation: 'When a route\'s service has no registered instance the load balancer raises a 503 error. The resolver converts it into a ProblemDetail 503 response; without it the servlet container would answer with a vague 500.',
    source: { repo, path: `${gateway}/ServiceUnavailableResolver.java` },
    docsUrl: `${spring}/web/webmvc/mvc-servlet/exceptionhandlers.html`,
  },
  // ---- config ----
  {
    ...base, topic: 'config', id: 'java-spring/config/record-properties', type: 'flashcard', level: 'intermediate', tags: ['config', 'records'],
    front: 'Why is a record a good fit for @ConfigurationProperties?',
    back: 'Records are immutable and Spring Boot binds them through the canonical constructor, so the configuration object cannot change after startup. Nested records group related settings, such as an endpoint\'s url and its timeouts.',
    explanation: 'ClientProperties(Endpoint posts, Endpoint todos) nests an Endpoint(URI baseUrl, Duration connectTimeout, Duration readTimeout), so timeouts are typed Duration values.',
    source: { repo, path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/config/ClientProperties.java' },
    docsUrl: 'https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.constructor-binding',
  },
  // ---- data-access ----
  {
    ...base, topic: 'data-access', id: 'java-spring/data-access/derived-queries', type: 'flashcard', level: 'beginner', tags: ['spring-data'],
    front: 'What is a derived query method in Spring Data?',
    back: 'A repository method whose name describes the query, such as findByEmailAndActiveTrue(String email). Spring Data parses the name and generates the implementation, so you only declare the interface.',
    explanation: 'Use @Query for anything the naming convention cannot express clearly.',
    docsUrl: 'https://docs.spring.io/spring-data/commons/reference/repositories/query-methods-details.html',
  },
  {
    ...base, topic: 'data-access', id: 'java-spring/data-access/one-store-per-purpose', type: 'mcq', level: 'advanced', tags: ['redis', 'postgres'],
    question: 'In the assessment, users live in Redis and posts in PostgreSQL. What is the trade-off of splitting storage by service?',
    options: [
      'Each service owns the store that fits its data, but cross-service joins and transactions are no longer possible',
      'Redis is always faster than PostgreSQL for every query',
      'PostgreSQL cannot store posts',
      'No trade-off exists',
    ],
    answerIndex: 0,
    explanation: 'Per-service data ownership keeps services independent, but data from several services has to be combined in application code (the aggregator) and consistency across them is eventual.',
    source: { repo, path: 'README.md' },
    docsUrl: 'https://microservices.io/patterns/data/database-per-service.html',
  },
];
