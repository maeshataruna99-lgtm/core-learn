import type { Card } from '../../core/types.ts';

// Interview-style cards on core Java, Spring Boot and Hibernate. Topics were chosen from the questions
// that are asked most often; every card is written from scratch, and output cards are executed.
const base = { track: 'java-spring', stack: 'spring' } as const;
const oracle = 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java';
const tutorial = 'https://docs.oracle.com/javase/tutorial';
const fw = 'https://docs.spring.io/spring-framework/reference';
const boot = 'https://docs.spring.io/spring-boot/reference';
const hib = 'https://docs.hibernate.org/orm/current/userguide/html_single/Hibernate_User_Guide.html';

export const cards: Card[] = [
  // ================= java-core =================
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/jvm-jre-jdk', level: 'beginner', type: 'mcq', tags: ['jvm', 'interview'],
    primer: {
      en: 'You write Java source code, a compiler turns it into bytecode, and something has to run that bytecode. Three names describe the pieces: JVM, JRE and JDK.',
      id: 'Kamu menulis kode sumber Java, compiler mengubahnya menjadi bytecode, lalu ada yang harus menjalankan bytecode itu. Tiga nama menggambarkan bagian-bagiannya: JVM, JRE, dan JDK.',
    },
    question: 'Which statement about JVM, JRE and JDK is correct?',
    options: [
      'The JVM runs bytecode; the JRE is the JVM plus the standard libraries; the JDK adds development tools such as the compiler',
      'The JDK runs bytecode; the JVM compiles source code; the JRE is only for Windows',
      'They are three names for the same program',
      'The JRE contains the compiler and the JVM is only a text editor',
    ],
    answerIndex: 0,
    explanation: 'Developers install a JDK (it includes javac). A machine that only runs Java programs needs a runtime. Because the JVM runs bytecode, the same compiled program can run on any operating system that has a JVM: "write once, run anywhere".',
    docsUrl: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-1.html',
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/string-pool', level: 'beginner', type: 'output', tags: ['strings', 'interview'],
    primer: {
      en: 'Java keeps a shared table of text values written directly in the code (literals), called the String Pool, so identical literals share one object. `new String(...)` always makes a separate object, and `intern()` returns the pooled one.',
      id: 'Java menyimpan tabel bersama untuk teks yang ditulis langsung di kode (literal), disebut String Pool, sehingga literal yang sama memakai satu objek. `new String(...)` selalu membuat objek terpisah, dan `intern()` mengembalikan objek yang ada di pool.',
    },
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        String d = c.intern();
        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a == d);
    }
}`,
    options: ['true then false then true', 'true then true then true', 'false then false then true', 'true then false then false'],
    answerIndex: 0,
    verifiedOutput: 'true\nfalse\ntrue',
    explanation: 'a and b point to the same pooled literal. c is a new object outside the pool, so a == c is false. intern() returns the pooled instance, so a == d is true. Compare content with equals().',
    docsUrl: `${oracle}/lang/String.html#intern()`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/string-builder', level: 'beginner', type: 'output', tags: ['strings', 'interview'],
    primer: {
      en: 'A String can never be changed after it is created. A StringBuilder is a text buffer you can change. StringBuffer is the older, thread-safe (and slower) version of StringBuilder.',
      id: 'String tidak bisa diubah setelah dibuat. StringBuilder adalah buffer teks yang bisa diubah. StringBuffer adalah versi lama dari StringBuilder yang thread-safe (dan lebih lambat).',
    },
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("a");
        sb.append("b");
        String s = "a";
        s.concat("b");
        System.out.println(sb);
        System.out.println(s);
    }
}`,
    options: ['ab then a', 'ab then ab', 'a then a', 'a then ab'],
    answerIndex: 0,
    verifiedOutput: 'ab\na',
    explanation: 'append changes the StringBuilder in place. concat returns a new String that was thrown away, so s is unchanged. Use StringBuilder to build text in a loop, and StringBuffer only when several threads share one buffer.',
    docsUrl: `${oracle}/lang/StringBuilder.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/default-values', level: 'beginner', type: 'output', tags: ['variables', 'interview'],
    primer: {
      en: 'Fields (variables of a class) get a default value automatically: 0 for numbers, false for boolean, null for objects. Local variables (inside a method) get nothing, and the compiler refuses to let you read one before you assign it.',
      id: 'Field (variabel milik class) otomatis mendapat nilai default: 0 untuk angka, false untuk boolean, null untuk objek. Variabel lokal (di dalam method) tidak mendapat apa-apa, dan compiler menolak jika kamu membacanya sebelum diisi.',
    },
    language: 'java',
    code: `public class Main {
    static int count;
    static String name;
    static boolean flag;

    public static void main(String[] args) {
        System.out.println(count + " " + name + " " + flag);
    }
}`,
    options: ['0 null false', '0 "" false', 'null null null', 'The code does not compile'],
    answerIndex: 0,
    verifiedOutput: '0 null false',
    explanation: 'Static and instance fields are initialized to their type\'s default. A local variable such as `int x; System.out.println(x);` would not compile.',
    docsUrl: `${tutorial}/java/nutsandbolts/datatypes.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/wrapper-classes', level: 'beginner', type: 'flashcard', tags: ['wrapper', 'interview'],
    primer: {
      en: 'Java has simple types like `int` and `double` that are just values, and matching classes like `Integer` and `Double` that wrap them into objects. Collections such as List can only hold objects, so they need the wrapper versions.',
      id: 'Java punya tipe sederhana seperti `int` dan `double` yang hanya berupa nilai, dan class padanannya seperti `Integer` dan `Double` yang membungkusnya menjadi objek. Collection seperti List hanya bisa menyimpan objek, jadi membutuhkan versi wrapper.',
    },
    front: 'What is a wrapper class and what is autoboxing?',
    back: 'A wrapper class (Integer, Long, Boolean, ...) turns a primitive into an object, which generics and collections need. Autoboxing is the automatic conversion between the primitive and its wrapper (int to Integer), and unboxing is the reverse.',
    explanation: 'Unboxing a null wrapper throws a NullPointerException, and boxed values compare with equals(), not ==.',
    docsUrl: `${tutorial}/java/data/autoboxing.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/unboxing-null', level: 'intermediate', type: 'output', tags: ['wrapper', 'npe'],
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        try {
            Integer boxed = null;
            int value = boxed;
            System.out.println(value);
        } catch (NullPointerException e) {
            System.out.println("NPE");
        }
    }
}`,
    options: ['NPE', '0', 'null', 'The code does not compile'],
    answerIndex: 0,
    verifiedOutput: 'NPE',
    explanation: 'Assigning a null Integer to an int silently calls boxed.intValue(), which throws NullPointerException. This commonly happens with database columns that may be null.',
    docsUrl: `${tutorial}/java/data/autoboxing.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/overload-resolution', level: 'intermediate', type: 'output', tags: ['overloading', 'interview'],
    language: 'java',
    code: `public class Main {
    static void show(int x) { System.out.println("int"); }
    static void show(long x) { System.out.println("long"); }
    static void show(Integer x) { System.out.println("Integer"); }
    static void show(Object x) { System.out.println("Object"); }

    public static void main(String[] args) {
        byte b = 1;
        show(b);
        show(5);
        show(5L);
        show(Integer.valueOf(5));
    }
}`,
    options: ['int int long Integer', 'byte int long Integer', 'int Integer long Integer', 'Object Object long Integer'],
    answerIndex: 0,
    verifiedOutput: 'int\nint\nlong\nInteger',
    explanation: 'Overloads are chosen at compile time from the static argument types: widening a primitive (byte to int) beats boxing, and an exact match wins. Overriding, by contrast, is decided at runtime.',
    docsUrl: `${tutorial}/java/javaOO/methods.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/overriding-vs-overloading', level: 'intermediate', type: 'output', tags: ['polymorphism', 'overriding', 'interview'],
    language: 'java',
    code: `public class Main {
    static class Animal {
        String sound() { return "..."; }
        static String kind() { return "animal"; }
    }
    static class Dog extends Animal {
        @Override String sound() { return "woof"; }
        static String kind() { return "dog"; }
    }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.sound());
        System.out.println(a.kind());
    }
}`,
    options: ['woof then animal', 'woof then dog', '... then animal', '... then dog'],
    answerIndex: 0,
    verifiedOutput: 'woof\nanimal',
    explanation: 'Instance methods are overridden: the runtime type (Dog) decides, so sound() prints woof. Static methods are only hidden, not overridden: the declared type (Animal) decides, so kind() prints animal.',
    docsUrl: `${tutorial}/java/IandI/override.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/interface-vs-abstract', level: 'intermediate', type: 'mcq', tags: ['oop', 'interview'],
    question: 'When is an abstract class a better choice than an interface?',
    options: [
      'When related classes should share state (fields) and partial implementation, and you can use single inheritance',
      'When a class needs to extend several unrelated types',
      'When you want no method bodies at all',
      'Never; interfaces replaced abstract classes in Java 8',
    ],
    answerIndex: 0,
    explanation: 'A class can extend only one class but implement many interfaces. Interfaces describe capabilities (and may have default methods); abstract classes can hold instance fields and constructors for a common base.',
    docsUrl: `${tutorial}/java/IandI/abstract.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/equals-hashcode', level: 'intermediate', type: 'output', tags: ['equals', 'hashcode', 'interview'],
    language: 'java',
    code: `import java.util.HashSet;
import java.util.Set;

public class Main {
    static class Point {
        final int x;
        Point(int x) { this.x = x; }
        @Override public int hashCode() { return x; }
    }

    public static void main(String[] args) {
        Set<Point> set = new HashSet<>();
        set.add(new Point(1));
        set.add(new Point(1));
        System.out.println(set.size());
    }
}`,
    options: ['2', '1', '0', 'It throws an exception'],
    answerIndex: 0,
    verifiedOutput: '2',
    explanation: 'Both points land in the same bucket, but equals() was not overridden, so they are different objects. The contract: equal objects must have equal hash codes, so override both equals and hashCode together.',
    docsUrl: `${oracle}/lang/Object.html#hashCode()`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/hashmap-vs-hashtable', level: 'intermediate', type: 'output', tags: ['collections', 'interview'],
    language: 'java',
    code: `import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, String> map = new HashMap<>();
        map.put(null, "x");
        System.out.println(map.get(null));
        try {
            new Hashtable<String, String>().put(null, "x");
        } catch (NullPointerException e) {
            System.out.println("NPE");
        }
    }
}`,
    options: ['x then NPE', 'null then NPE', 'x then x', 'NPE then NPE'],
    answerIndex: 0,
    verifiedOutput: 'x\nNPE',
    explanation: 'HashMap allows one null key and null values and is not synchronized. Hashtable is a legacy, synchronized class that rejects null. For thread-safe maps use ConcurrentHashMap, which also rejects null.',
    docsUrl: `${oracle}/util/HashMap.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/arraylist-vs-linkedlist', level: 'intermediate', type: 'mcq', tags: ['collections', 'interview'],
    question: 'You mostly read elements by index and append at the end. Which List fits best?',
    options: ['ArrayList', 'LinkedList', 'Hashtable', 'TreeMap'],
    answerIndex: 0,
    explanation: 'ArrayList is backed by an array: get(i) is O(1) and appending is amortized O(1). LinkedList needs O(n) to reach index i and its per-node memory overhead is larger; it only wins for frequent insertion or removal at known positions via an iterator.',
    docsUrl: `${oracle}/util/ArrayList.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/comparator-sort', level: 'intermediate', type: 'output', tags: ['comparator', 'interview'],
    language: 'java',
    code: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("pear", "fig", "apple"));
        words.sort(Comparator.comparing(String::length));
        System.out.println(words);
    }
}`,
    options: ['[fig, pear, apple]', '[apple, fig, pear]', '[pear, fig, apple]', '[apple, pear, fig]'],
    answerIndex: 0,
    verifiedOutput: '[fig, pear, apple]',
    explanation: 'Comparable gives a class one natural order (compareTo). A Comparator is an external, reusable ordering, so you can sort the same objects by different keys. Here the key is the string length.',
    docsUrl: `${oracle}/util/Comparator.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/fail-fast-iterator', level: 'advanced', type: 'output', tags: ['collections', 'iterator'],
    language: 'java',
    code: `import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        try {
            for (Integer n : list) {
                if (n == 1) list.remove(n);
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("CME");
        }
    }
}`,
    options: ['CME', '[2, 3]', '1', 'No output'],
    answerIndex: 0,
    verifiedOutput: 'CME',
    explanation: 'ArrayList iterators are fail-fast: changing the list during a for-each (outside the iterator) is detected on the next step. Remove through iterator.remove(), use removeIf, or iterate a copy.',
    docsUrl: `${oracle}/util/ArrayList.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/checked-vs-unchecked', level: 'intermediate', type: 'mcq', tags: ['exceptions', 'interview'],
    question: 'What is the difference between checked and unchecked exceptions?',
    options: [
      'The compiler forces you to catch or declare checked exceptions; unchecked ones (RuntimeException and Error) are not enforced',
      'Checked exceptions happen only at runtime',
      'Unchecked exceptions must always be caught',
      'Checked exceptions cannot be thrown from methods',
    ],
    answerIndex: 0,
    explanation: 'IOException is checked; NullPointerException and IllegalArgumentException are unchecked. Spring\'s @Transactional rolls back for unchecked exceptions by default, which is one reason this distinction matters in practice.',
    docsUrl: `${tutorial}/essential/exceptions/runtime.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/finally-order', level: 'intermediate', type: 'output', tags: ['exceptions'],
    language: 'java',
    code: `public class Main {
    static int f() {
        try {
            return 1;
        } finally {
            System.out.println("finally");
        }
    }

    public static void main(String[] args) {
        System.out.println(f());
    }
}`,
    options: ['finally then 1', '1 then finally', 'finally', '1'],
    answerIndex: 0,
    verifiedOutput: 'finally\n1',
    explanation: 'The finally block always runs before the method actually returns. Do not confuse final (a modifier), finally (a block) and finalize (an old, deprecated object method).',
    docsUrl: `${tutorial}/essential/exceptions/finally.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/try-with-resources', level: 'intermediate', type: 'output', tags: ['exceptions', 'resources'],
    language: 'java',
    code: `public class Main {
    static class Res implements AutoCloseable {
        final String name;
        Res(String name) { this.name = name; System.out.println("open " + name); }
        @Override public void close() { System.out.println("close " + name); }
    }

    public static void main(String[] args) {
        try (Res a = new Res("a"); Res b = new Res("b")) {
            System.out.println("body");
        }
    }
}`,
    options: ['open a then open b then body then close b then close a', 'open a then open b then body then close a then close b', 'open a then body then close a then open b then close b', 'body then open a then open b then close b then close a'],
    answerIndex: 0,
    verifiedOutput: 'open a\nopen b\nbody\nclose b\nclose a',
    explanation: 'try-with-resources closes resources automatically in reverse order of opening, even when the body throws. Use it for streams, JDBC connections and anything AutoCloseable.',
    docsUrl: `${tutorial}/essential/exceptions/tryResourceClose.html`,
  },
  {
    ...base, topic: 'java-core', id: 'java-spring/java-core/thread-join', level: 'intermediate', type: 'output', tags: ['threads'],
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> System.out.println("worker"));
        worker.start();
        worker.join();
        System.out.println("main");
    }
}`,
    options: ['worker then main', 'main then worker', 'worker', 'The order is random'],
    answerIndex: 0,
    verifiedOutput: 'worker\nmain',
    explanation: 'start() launches the thread; join() makes the main thread wait until it finishes. Without join the order would not be guaranteed. You can create a thread by passing a Runnable (preferred) or by extending Thread.',
    docsUrl: `${tutorial}/essential/concurrency/join.html`,
  },
  // ================= spring-boot-qa =================
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/spring-vs-boot', level: 'beginner', type: 'mcq', tags: ['boot', 'interview'],
    primer: {
      en: 'Spring is a large toolbox for building Java applications. Setting it up used to need a lot of configuration. Spring Boot is the "quick start" on top of it: sensible defaults, ready-made starter dependencies and an embedded server.',
      id: 'Spring adalah kotak perkakas besar untuk membangun aplikasi Java. Dulu menyiapkannya butuh banyak konfigurasi. Spring Boot adalah "jalan pintas" di atasnya: default yang masuk akal, dependency starter siap pakai, dan server tertanam.',
    },
    question: 'How does Spring Boot relate to the Spring Framework?',
    options: [
      'Boot builds on Spring and adds auto-configuration, starters and an embedded server so an app runs with little setup',
      'Boot is a replacement that cannot use Spring features',
      'Boot is only a database driver',
      'Spring Boot and Spring are the same jar',
    ],
    answerIndex: 0,
    explanation: 'You still use Spring concepts (beans, dependency injection, MVC). Boot removes most boilerplate: it picks configurations from the libraries on your classpath and packages the app as a runnable jar.',
    docsUrl: 'https://spring.io/projects/spring-boot',
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/auto-configuration', level: 'intermediate', type: 'mcq', tags: ['boot', 'auto-configuration'],
    question: 'What is Spring Boot auto-configuration?',
    options: [
      'Spring Boot configures beans automatically based on the libraries on the classpath and your properties, and backs off when you define your own',
      'A tool that generates source code for controllers',
      'A setting that restarts the app on changes',
      'A way to skip dependency injection',
    ],
    answerIndex: 0,
    explanation: 'For example, with spring-boot-starter-data-jpa and a database driver present, Boot creates a DataSource and an EntityManagerFactory. Defining your own bean of that type makes the auto-configured one back off.',
    docsUrl: `${boot}/using/auto-configuration.html`,
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/request-vs-get-mapping', level: 'beginner', type: 'mcq', tags: ['mvc', 'interview'],
    primer: {
      en: 'A controller method needs to say which URL and which HTTP verb it handles. `@RequestMapping` can describe any combination; `@GetMapping`, `@PostMapping` and friends are shorter versions for one verb.',
      id: 'Method controller perlu menyatakan URL dan verb HTTP mana yang ia tangani. `@RequestMapping` bisa menjelaskan kombinasi apa saja; `@GetMapping`, `@PostMapping`, dan kawan-kawannya adalah versi singkat untuk satu verb.',
    },
    question: 'What is `@GetMapping("/users")` equivalent to?',
    options: [
      '@RequestMapping(value = "/users", method = RequestMethod.GET)',
      '@RequestMapping("/users") with method POST',
      '@PostMapping("/users")',
      '@Controller("/users")',
    ],
    answerIndex: 0,
    explanation: '@GetMapping is a composed annotation: @RequestMapping restricted to GET. Prefer the specific forms, and use @RequestMapping on the class to share a URL prefix.',
    docsUrl: `${fw}/web/webmvc/mvc-controller/ann-requestmapping.html`,
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/change-port', level: 'beginner', type: 'flashcard', tags: ['boot', 'config', 'interview'],
    primer: {
      en: 'A Spring Boot web app starts its own embedded web server (Tomcat by default). That server listens on a port, and you can change which one in the configuration file.',
      id: 'Aplikasi web Spring Boot menjalankan web server tertanamnya sendiri (Tomcat secara default). Server itu mendengarkan sebuah port, dan kamu bisa mengubahnya di file konfigurasi.',
    },
    front: 'What is the default port of an embedded Spring Boot server and how do you change it?',
    back: 'It listens on 8080 by default. Set server.port in application.properties (or application.yml), or pass --server.port=9000 or the SERVER_PORT environment variable. server.port=0 picks a random free port.',
    explanation: 'Command-line arguments and environment variables override the configuration file, which is handy in deployments.',
    docsUrl: 'https://docs.spring.io/spring-boot/how-to/webserver.html',
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/bean-scopes', level: 'intermediate', type: 'mcq', tags: ['beans', 'scope', 'interview'],
    question: 'How does prototype scope differ from the default singleton scope?',
    options: [
      'A prototype bean is created anew every time it is requested; a singleton is created once per container',
      'Prototype beans are shared across applications',
      'Prototype scope is only for static methods',
      'There is no difference',
    ],
    answerIndex: 0,
    explanation: 'Use prototype for stateful objects that must not be shared. Injecting a prototype into a singleton only happens once, at creation, so use ObjectProvider or a scoped proxy to get a new one each time.',
    docsUrl: `${fw}/core/beans/factory-scopes.html`,
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/constructor-vs-setter', level: 'intermediate', type: 'mcq', tags: ['di', 'interview'],
    question: 'Why do Spring maintainers prefer constructor injection over setter injection for required dependencies?',
    options: [
      'The object is never created half-initialized, its dependencies can be final, and it is easy to build in a test',
      'Setters are not allowed in Spring',
      'Constructors make beans lazy',
      'Setter injection cannot inject interfaces',
    ],
    answerIndex: 0,
    explanation: 'Use setter injection only for optional dependencies that can change. Field injection with @Autowired hides dependencies and needs reflection or Spring to be tested.',
    docsUrl: `${fw}/core/beans/dependencies/factory-collaborators.html`,
  },
  {
    ...base, topic: 'spring-boot-qa', id: 'java-spring/spring-boot-qa/actuator', level: 'beginner', type: 'flashcard', tags: ['actuator'],
    primer: {
      en: 'When an app runs in production you need to know if it is healthy. Spring Boot Actuator adds ready-made endpoints that report this, such as `/actuator/health`.',
      id: 'Saat aplikasi berjalan di produksi, kamu perlu tahu apakah ia sehat. Spring Boot Actuator menambahkan endpoint siap pakai untuk itu, misalnya `/actuator/health`.',
    },
    front: 'What is Spring Boot Actuator?',
    back: 'A module (spring-boot-starter-actuator) that exposes operational endpoints: health, metrics, environment, beans, loggers and more. Only some are exposed over HTTP by default, and sensitive ones must be secured.',
    explanation: 'Orchestrators such as Kubernetes or Docker Compose call the health endpoint to decide whether to send traffic to the app.',
    docsUrl: `${boot}/actuator/index.html`,
  },
  // ================= hibernate =================
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/hibernate-vs-jdbc', level: 'beginner', type: 'mcq', tags: ['hibernate', 'jdbc', 'interview'],
    primer: {
      en: 'JDBC is the basic Java way to talk to a database: you write SQL strings and copy each column into objects yourself. Hibernate does that mapping for you.',
      id: 'JDBC adalah cara dasar Java berbicara dengan database: kamu menulis string SQL dan menyalin setiap kolom ke objek sendiri. Hibernate mengerjakan pemetaan itu untukmu.',
    },
    question: 'What does Hibernate add on top of plain JDBC?',
    options: [
      'Object-relational mapping: it generates SQL and converts rows to objects, plus caching and dirty checking',
      'A faster network driver',
      'A replacement for the database itself',
      'Nothing; it is just a JDBC alias',
    ],
    answerIndex: 0,
    explanation: 'Hibernate uses JDBC underneath. It removes boilerplate (statements, result-set mapping) but you must still understand the SQL it produces.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/session-factory', level: 'intermediate', type: 'flashcard', tags: ['hibernate', 'interview'],
    front: 'SessionFactory vs Session in Hibernate',
    back: 'A SessionFactory is a heavyweight, thread-safe object created once per database that produces sessions. A Session (JPA: EntityManager) is a lightweight, short-lived unit of work with a persistence context; it is not thread-safe, so do not share it between threads.',
    explanation: 'In Spring Boot you rarely create them: the EntityManagerFactory is configured for you and the EntityManager is injected, bound to the current transaction.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/entity-states', level: 'intermediate', type: 'mcq', tags: ['hibernate', 'interview'],
    question: 'A new User object has just been created with `new User()` and has not been saved. In which entity state is it?',
    options: ['Transient', 'Persistent (managed)', 'Detached', 'Removed'],
    answerIndex: 0,
    explanation: 'Transient: not associated with a session or a row. After persist/save it becomes persistent (managed). After the session closes it is detached. After remove it is removed.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/dirty-checking', level: 'intermediate', type: 'mcq', tags: ['hibernate', 'interview'],
    question: 'Inside a @Transactional method you load a User and call user.setName("Ann"), with no explicit save. What happens at commit?',
    options: [
      'Hibernate detects the change (dirty checking) and issues an UPDATE automatically',
      'Nothing is saved without calling save()',
      'The entity is deleted',
      'An exception is thrown because setters are forbidden',
    ],
    answerIndex: 0,
    explanation: 'Managed entities are tracked by the persistence context; changes are flushed as SQL when the transaction commits. Outside a transaction (or on a detached object) no automatic update happens.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/first-vs-second-level-cache', level: 'advanced', type: 'mcq', tags: ['hibernate', 'cache', 'interview'],
    question: 'What is the difference between the first-level and second-level cache in Hibernate?',
    options: [
      'First-level is per session and always on; second-level is shared across sessions, optional and needs a cache provider',
      'First-level is shared by all users; second-level is per request',
      'Both are the same and always enabled',
      'First-level caches queries; second-level caches only primitives',
    ],
    answerIndex: 0,
    explanation: 'The first-level cache is the persistence context, so loading the same id twice in one session issues one SELECT. The second-level cache is for rarely changing data shared across sessions and must be configured deliberately.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/persist-vs-merge', level: 'advanced', type: 'flashcard', tags: ['jpa', 'interview'],
    front: 'persist vs merge in JPA',
    back: 'persist makes a new (transient) entity managed and schedules an INSERT; it does not return a different instance. merge copies the state of a possibly detached entity onto a managed instance (loading it if needed) and returns that managed copy, so you must use the returned object.',
    explanation: 'Spring Data\'s save() calls persist for new entities and merge for existing ones. A common bug is changing the original object after merge and expecting the changes to be tracked.',
    docsUrl: hib,
  },
  {
    ...base, topic: 'hibernate', id: 'java-spring/hibernate/find-vs-get-reference', level: 'advanced', type: 'mcq', tags: ['jpa', 'lazy', 'interview'],
    question: 'What is the difference between EntityManager.find() and getReference() (Hibernate\'s get() and load())?',
    options: [
      'find loads the row now and returns null if missing; getReference returns a lazy proxy and fails with an exception on first use if the row does not exist',
      'find returns a proxy; getReference always hits the database',
      'They are identical',
      'getReference creates a new row',
    ],
    answerIndex: 0,
    explanation: 'getReference is useful to set a foreign key (for example, order.setCustomer(em.getReference(Customer.class, id))) without loading the whole customer.',
    docsUrl: hib,
  },
];
