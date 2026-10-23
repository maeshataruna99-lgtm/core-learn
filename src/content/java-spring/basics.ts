import type { Card } from '../../core/types.ts';

const base = { track: 'java-spring', stack: 'spring' } as const;
const source = { repo: 'maeshataruna99-lgtm/mahesha-streamworx-assessment', path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/controller/UserController.java' };

export const cards: Card[] = [
  {
    ...base, id: 'java-spring/java-basics/string-equality', topic: 'java-basics', type: 'output', level: 'beginner', tags: ['strings'],
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        String a = "hi";
        String b = new String("hi");
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}`,
    options: ['true then true', 'false then true', 'true then false', 'false then false'],
    answerIndex: 1,
    verifiedOutput: 'false\ntrue',
    explanation: '== compares references, and new String creates a distinct object. equals compares contents.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html#equals(java.lang.Object)',
  },
  {
    ...base, id: 'java-spring/rest-controllers/rest-controller', topic: 'rest-controllers', type: 'flashcard', level: 'beginner', tags: ['spring-web'],
    front: '@RestController vs @Controller',
    back: '@RestController = @Controller + @ResponseBody: return values are written straight to the HTTP response body (JSON/XML) instead of being resolved as view names.',
    explanation: 'Use @RestController for APIs. Plain @Controller is for server-rendered views.',
    source,
    docsUrl: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann.html',
  },
  {
    ...base, id: 'java-spring/validation/missing-valid', topic: 'validation', type: 'bugspot', level: 'intermediate', tags: ['validation'],
    language: 'java',
    code: `public record CreateUser(@NotBlank String name, @Email String email) {}

@PostMapping("/users")
public User create(@RequestBody CreateUser body) {
    return service.create(body);
}`,
    buggyLines: [4],
    fixedCode: `public record CreateUser(@NotBlank String name, @Email String email) {}

@PostMapping("/users")
public User create(@Valid @RequestBody CreateUser body) {
    return service.create(body);
}`,
    explanation: 'Bean Validation annotations on the record do nothing unless the parameter is annotated with @Valid (or @Validated). Invalid bodies reach the service.',
    docsUrl: 'https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html',
  },
  {
    ...base, id: 'java-spring/spring-boot-basics/constructor-injection', topic: 'spring-boot-basics', type: 'mcq', level: 'beginner', tags: ['di'],
    question: 'Which dependency injection style does Spring recommend?',
    options: ['Constructor injection', 'Field injection with @Autowired', 'Static lookups', 'Setter injection only'],
    answerIndex: 0,
    explanation: 'Constructor injection makes dependencies explicit and final, and lets you build the class in a plain unit test without Spring.',
    docsUrl: 'https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html',
  },
];
