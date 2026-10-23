import type { Card } from '../../core/types.ts';

// Beginner foundations: the questions an interviewer asks first (component, bean, repository, JPA, JPQL).
// Every card has a bilingual primer so someone who has never met the term can read it before answering.
const base = { track: 'java-spring', stack: 'spring', level: 'beginner' } as const;
const fw = 'https://docs.spring.io/spring-framework/reference';
const data = 'https://docs.spring.io/spring-data/jpa/reference';

export const cards: Card[] = [
  // ================= spring-basics =================
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/what-is-a-component', type: 'flashcard', tags: ['component', 'interview'],
    primer: {
      en: 'Normally you create objects yourself with `new`. In Spring you hand that job to the framework: you mark a class with an annotation and Spring creates one object of it, keeps it, and gives it to whoever needs it.',
      id: 'Biasanya kamu membuat objek sendiri dengan `new`. Di Spring, tugas itu diserahkan ke framework: kamu menandai sebuah class dengan annotation, lalu Spring yang membuat objeknya, menyimpannya, dan memberikannya ke bagian lain yang membutuhkan.',
    },
    front: 'What is a "component" in Spring?',
    back: 'A class annotated with @Component (or a specialization: @Service, @Repository, @Controller). Spring finds it by component scanning, creates one object of it and manages that object as a bean.',
    explanation: '@Component is the generic marker. @Service, @Repository and @RestController are @Component with a more specific meaning, so Spring and readers know which layer the class belongs to.',
    docsUrl: `${fw}/core/beans/classpath-scanning.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/what-is-a-bean', type: 'mcq', tags: ['bean', 'interview'],
    primer: {
      en: 'Think of Spring as a warehouse. Every object the warehouse owns and looks after is called a bean. You ask the warehouse for a bean instead of building it yourself.',
      id: 'Bayangkan Spring sebagai sebuah gudang. Setiap objek yang dimiliki dan diurus gudang itu disebut bean. Kamu meminta bean ke gudang, bukan membuatnya sendiri.',
    },
    question: 'What is a Spring bean?',
    options: [
      'An object that is created, wired and managed by the Spring container',
      'Any Java class in the project',
      'A database table',
      'A JSON object sent by a client',
    ],
    answerIndex: 0,
    explanation: 'A bean is just an ordinary object, but its lifecycle belongs to the Spring container (the ApplicationContext). Not every class is a bean, only the ones Spring has been told to manage.',
    docsUrl: `${fw}/core/beans/introduction.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/ioc-container', type: 'flashcard', tags: ['ioc', 'container'],
    primer: {
      en: 'Inversion of Control (IoC) means the framework controls when objects are created and connected, not your code. "Inverted" because normally your code is in charge.',
      id: 'Inversion of Control (IoC) artinya framework yang mengatur kapan objek dibuat dan dihubungkan, bukan kodemu. Disebut "inversi" karena biasanya kodemu yang memegang kendali.',
    },
    front: 'What is the IoC container (ApplicationContext)?',
    back: 'The part of Spring that creates the beans, connects them to each other (dependency injection) and manages their lifecycle. You describe what you need with annotations; the container does the construction.',
    explanation: 'In Spring Boot the container is started by SpringApplication.run(...), which scans your classes and builds all beans before the application begins serving requests.',
    docsUrl: `${fw}/core/beans/basics.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/dependency-injection', type: 'mcq', tags: ['di', 'interview'],
    primer: {
      en: 'A service needs a repository to work. Instead of the service building the repository itself (tight coupling), Spring hands the repository in from outside. That "handing in" is dependency injection.',
      id: 'Sebuah service membutuhkan repository agar bisa bekerja. Alih-alih service membuat repository sendiri (terlalu terikat), Spring "menyerahkan" repository itu dari luar. Proses menyerahkan inilah yang disebut dependency injection.',
    },
    question: 'In this code, how does UserService get its UserRepository?\n\n@Service\nclass UserService {\n  private final UserRepository repo;\n  UserService(UserRepository repo) { this.repo = repo; }\n}',
    options: [
      'Spring passes the UserRepository bean into the constructor (constructor injection)',
      'UserService creates it with new UserRepository()',
      'It is read from application.properties',
      'It is a static field shared by all classes',
    ],
    answerIndex: 0,
    explanation: 'Spring sees the constructor needs a UserRepository, finds that bean in the container and passes it in. The class never builds its own dependency, which makes it easy to replace with a fake in a test.',
    docsUrl: `${fw}/core/beans/dependencies/factory-collaborators.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/stereotype-annotations', type: 'mcq', tags: ['annotations', 'layers'],
    primer: {
      en: 'Spring has several annotations that all create a bean. They differ only in meaning: they tell you (and Spring) what job the class does.',
      id: 'Spring punya beberapa annotation yang semuanya membuat bean. Bedanya hanya pada makna: annotation itu memberi tahu kamu (dan Spring) tugas class tersebut.',
    },
    question: 'Which annotation is the right one for the class that talks to the database?',
    options: ['@Repository', '@Service', '@RestController', '@Configuration'],
    answerIndex: 0,
    explanation: '@Repository marks the data-access layer (and also translates database exceptions into Spring\'s DataAccessException). @Service is for business logic, @RestController for HTTP endpoints, @Configuration for bean definitions.',
    docsUrl: `${fw}/core/beans/classpath-scanning.html#beans-stereotype-annotations`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/component-vs-bean-method', type: 'mcq', tags: ['bean', 'configuration'],
    primer: {
      en: 'You can only put @Component on classes you wrote. For a class from a library you cannot edit (for example a RestClient or an ObjectMapper), you write a method that builds the object and mark the method with @Bean.',
      id: '@Component hanya bisa dipasang pada class yang kamu tulis sendiri. Untuk class dari library yang tidak bisa kamu ubah (misalnya RestClient atau ObjectMapper), kamu menulis sebuah method yang membuat objeknya lalu menandai method itu dengan @Bean.',
    },
    question: 'You need to register an object from a third-party library as a bean. What do you use?',
    options: [
      'A method annotated @Bean inside a @Configuration class',
      '@Component on the library class',
      '@Repository on the library class',
      'Nothing; Spring finds it automatically',
    ],
    answerIndex: 0,
    explanation: '@Component works on your own classes (found by scanning). @Bean works on a method, so the object can come from anywhere. The assessment\'s RestClientConfig defines its RestClient builders this way.',
    source: { repo: 'maeshataruna99-lgtm/mahesha-streamworx-assessment', path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/config/RestClientConfig.java' },
    docsUrl: `${fw}/core/beans/java/bean-annotation.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/component-scan', type: 'mcq', tags: ['component-scan'],
    primer: {
      en: 'Spring does not read every class in the world. At startup it walks through a package (and its sub-packages), looks for annotated classes and turns them into beans. This walk is called component scanning.',
      id: 'Spring tidak membaca semua class di dunia. Saat start, ia menelusuri sebuah package (beserta sub-package-nya), mencari class yang diberi annotation, lalu mengubahnya menjadi bean. Penelusuran ini disebut component scanning.',
    },
    question: 'Your @Service class lives in com.other.app while the main class is in com.shop.app. Spring cannot find it. Why?',
    options: [
      'Component scanning only covers the main class\'s package and its sub-packages',
      '@Service only works on interfaces',
      'Services must be declared in application.properties',
      'Spring Boot cannot have more than one package',
    ],
    answerIndex: 0,
    explanation: '@SpringBootApplication scans from its own package downward, which is why the main class belongs in a root package. Move the class under com.shop.app, or widen the scan with @ComponentScan or scanBasePackages.',
    docsUrl: 'https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html',
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/singleton-bean', type: 'mcq', tags: ['scope'],
    primer: {
      en: 'By default Spring creates one object per bean and shares it everywhere. All requests use the same UserService object, so it must not keep per-user data in its fields.',
      id: 'Secara default Spring membuat satu objek untuk setiap bean dan membagikannya ke mana-mana. Semua request memakai objek UserService yang sama, jadi objek itu tidak boleh menyimpan data per-pengguna di field-nya.',
    },
    question: 'What is the default scope of a Spring bean?',
    options: ['Singleton (one shared instance per container)', 'A new instance for every injection', 'One instance per HTTP request', 'One instance per thread'],
    answerIndex: 0,
    explanation: 'Singleton is the default. Because many threads share it, keep singleton beans stateless: pass per-request data through method parameters.',
    docsUrl: `${fw}/core/beans/factory-scopes.html`,
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/starter-dependency', type: 'flashcard', tags: ['boot', 'maven'],
    primer: {
      en: 'A Spring Boot "starter" is one dependency that pulls in a whole set of matching libraries, so you do not pick versions one by one.',
      id: 'Sebuah "starter" Spring Boot adalah satu dependency yang menarik sekumpulan library yang cocok sekaligus, jadi kamu tidak perlu memilih versi satu per satu.',
    },
    front: 'What does the web starter give you (spring-boot-starter-web, renamed spring-boot-starter-webmvc in Spring Boot 4)?',
    back: 'An embedded web server (Tomcat by default) and Spring MVC with compatible versions, so one dependency is enough to build a REST API. JSON support through Jackson comes along in a typical setup.',
    explanation: 'Older projects still use the name spring-boot-starter-web. Other common starters: spring-boot-starter-data-jpa (JPA + Hibernate), spring-boot-starter-validation and spring-boot-starter-test.',
    docsUrl: 'https://docs.spring.io/spring-boot/reference/using/build-systems.html#using.build-systems.starters',
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/application-properties', type: 'flashcard', tags: ['config'],
    primer: {
      en: 'Settings such as the server port or the database URL should not be written inside Java code. They go into a configuration file that Spring reads at startup.',
      id: 'Pengaturan seperti port server atau URL database sebaiknya tidak ditulis di dalam kode Java. Pengaturan itu ditaruh di file konfigurasi yang dibaca Spring saat start.',
    },
    front: 'What is application.properties (or application.yml) for?',
    back: 'It holds the application\'s configuration (server.port, spring.datasource.url, custom settings). Values can be overridden per environment with profiles or environment variables, without changing code.',
    explanation: 'Never commit real passwords there; read secrets from environment variables.',
    docsUrl: 'https://docs.spring.io/spring-boot/reference/features/external-config.html',
  },
  {
    ...base, topic: 'spring-basics', id: 'java-spring/spring-basics/maven-pom', type: 'flashcard', tags: ['maven', 'build'],
    primer: {
      en: 'Maven is a build tool. You list the libraries you need in one file, pom.xml, and Maven downloads them and builds the project for you.',
      id: 'Maven adalah build tool. Kamu menuliskan library yang dibutuhkan di satu file, pom.xml, lalu Maven mengunduhnya dan membangun proyekmu.',
    },
    front: 'What is pom.xml?',
    back: 'Maven\'s project file: the project\'s coordinates (groupId, artifactId, version), its dependencies and its build plugins. Maven reads it to download libraries and run commands such as mvn test and mvn package.',
    explanation: 'Gradle does the same job with build.gradle. Spring Boot projects usually use a parent POM that manages dependency versions.',
    docsUrl: 'https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html',
  },
  // ================= layers =================
  {
    ...base, topic: 'layers', id: 'java-spring/layers/controller-service-repository', type: 'mcq', tags: ['architecture', 'interview'],
    primer: {
      en: 'A typical Spring app is split into layers, like departments in a company. The controller is the front desk (talks to the client), the service holds the rules, the repository is the archive (talks to the database).',
      id: 'Aplikasi Spring biasanya dibagi menjadi layer, seperti divisi dalam perusahaan. Controller adalah resepsionis (berbicara dengan client), service berisi aturan bisnis, repository adalah arsip (berbicara dengan database).',
    },
    question: 'Which pair correctly matches a layer with its job?',
    options: [
      'Controller handles HTTP; Service holds business rules; Repository accesses the database',
      'Controller accesses the database; Repository handles HTTP',
      'Service handles HTTP; Controller holds business rules',
      'Repository holds business rules; Service accesses the database',
    ],
    answerIndex: 0,
    explanation: 'Flow of a request: client, Controller, Service, Repository, database, and back. Each layer only calls the one below it, which keeps responsibilities separate and testable.',
    docsUrl: `${fw}/web/webmvc/mvc-controller.html`,
  },
  {
    ...base, topic: 'layers', id: 'java-spring/layers/what-is-a-repository', type: 'flashcard', tags: ['repository', 'interview'],
    primer: {
      en: 'Imagine a librarian. You say "give me the book with this title" and you do not care which shelf it is on. A repository is that librarian for your data: other code asks it for objects and it handles how they are stored.',
      id: 'Bayangkan seorang pustakawan. Kamu bilang "tolong ambilkan buku dengan judul ini" dan kamu tidak peduli di rak mana bukunya. Repository adalah pustakawan itu untuk datamu: kode lain meminta objek kepadanya, dan ia yang mengurus cara penyimpanannya.',
    },
    front: 'What is a repository in Spring?',
    back: 'The data-access layer: an object that saves, finds and deletes entities and hides the database details from the rest of the app. In Spring it is a class marked @Repository, or most often an interface that extends a Spring Data repository such as JpaRepository.',
    explanation: 'The service calls userRepository.findByEmail(email) and never writes SQL. That is the repository pattern: one place that knows how data is stored.',
    docsUrl: 'https://docs.spring.io/spring-data/commons/reference/repositories/core-concepts.html',
  },
  {
    ...base, topic: 'layers', id: 'java-spring/layers/why-repository-pattern', type: 'mcq', tags: ['repository', 'design'],
    primer: {
      en: 'Why not let the service run SQL directly? Because then every change to the database touches business code, and testing needs a real database.',
      id: 'Mengapa service tidak langsung menjalankan SQL? Karena setiap perubahan database akan menyentuh kode bisnis, dan pengujian jadi membutuhkan database sungguhan.',
    },
    question: 'What is the main benefit of putting data access behind a repository?',
    options: [
      'Business code stays independent of how data is stored, and the repository can be replaced by a fake in tests',
      'Queries run faster',
      'The database no longer needs a schema',
      'It removes the need for a service layer',
    ],
    answerIndex: 0,
    explanation: 'Separation of concerns. The service depends on a repository interface only, so you can mock it in a unit test or change the storage without rewriting business rules.',
    docsUrl: 'https://martinfowler.com/eaaCatalog/repository.html',
  },
  {
    ...base, topic: 'layers', id: 'java-spring/layers/dto-vs-entity', type: 'mcq', tags: ['dto', 'entity'],
    primer: {
      en: 'An entity mirrors a database table. A DTO (Data Transfer Object) is the shape you send over HTTP. They are often different: for example the entity has a password hash that must never be sent to a client.',
      id: 'Entity mencerminkan sebuah tabel database. DTO (Data Transfer Object) adalah bentuk data yang dikirim lewat HTTP. Keduanya sering berbeda: misalnya entity punya hash password yang tidak boleh dikirim ke client.',
    },
    question: 'Why return a DTO from a controller instead of the JPA entity itself?',
    options: [
      'To control exactly which fields are exposed and avoid leaking internals such as password hashes',
      'Because entities cannot be converted to JSON',
      'Because DTOs are faster to compile',
      'Because controllers cannot use entities',
    ],
    answerIndex: 0,
    explanation: 'Returning entities couples your API to the table design and can expose private fields or trigger lazy-loading problems. A DTO (often a Java record) is a stable, explicit contract.',
    source: { repo: 'maeshataruna99-lgtm/mahesha-streamworx-assessment', path: 'services/api-1-user-aggregator/src/main/java/id/maetaruna/assessment/userapi/controller/UserController.java' },
    docsUrl: 'https://martinfowler.com/eaaCatalog/dataTransferObject.html',
  },
  // ================= jpa-basics =================
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/what-is-jpa', type: 'flashcard', tags: ['jpa', 'interview'],
    primer: {
      en: 'Databases store rows in tables, Java works with objects. JPA is a set of rules for translating between the two, so you can save a Java object without writing the INSERT yourself.',
      id: 'Database menyimpan baris dalam tabel, sedangkan Java bekerja dengan objek. JPA adalah seperangkat aturan untuk menerjemahkan keduanya, sehingga kamu bisa menyimpan objek Java tanpa menulis INSERT sendiri.',
    },
    front: 'What is JPA?',
    back: 'Jakarta Persistence API (formerly Java Persistence API): a standard specification for mapping Java objects (entities) to relational database tables (ORM) and for querying them. It defines annotations and interfaces; a provider such as Hibernate implements them.',
    explanation: 'JPA itself is only the specification (interfaces and annotations like @Entity). You need an implementation to run it, which is why Spring Boot\'s data-jpa starter brings Hibernate.',
    docsUrl: 'https://jakarta.ee/specifications/persistence/',
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/jpa-hibernate-spring-data', type: 'mcq', tags: ['jpa', 'hibernate', 'interview'],
    primer: {
      en: 'Three names that are easy to mix up: JPA is the rulebook, Hibernate is a company that follows the rulebook (does the real work), and Spring Data JPA is a helper on top that writes repetitive repository code for you.',
      id: 'Tiga nama yang mudah tertukar: JPA adalah buku aturannya, Hibernate adalah pihak yang menjalankan aturan itu (yang bekerja sebenarnya), dan Spring Data JPA adalah pembantu di atasnya yang menulis kode repository berulang untukmu.',
    },
    question: 'Which statement about JPA, Hibernate and Spring Data JPA is correct?',
    options: [
      'JPA is the specification, Hibernate is an implementation of it, Spring Data JPA builds repositories on top of JPA',
      'Hibernate is the specification and JPA is its implementation',
      'Spring Data JPA replaces Hibernate with its own database driver',
      'All three are the same library under different names',
    ],
    answerIndex: 0,
    explanation: 'JPA (spec) defines what to do. Hibernate (provider) does it, generating the SQL. Spring Data JPA reduces boilerplate: you declare an interface and it creates the repository implementation.',
    docsUrl: `${data}/repositories/create-instances.html`,
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/what-is-orm', type: 'flashcard', tags: ['orm'],
    primer: {
      en: 'ORM stands for Object-Relational Mapping: a table row becomes an object, a column becomes a field. You work with objects and the ORM writes the SQL.',
      id: 'ORM singkatan dari Object-Relational Mapping: baris tabel menjadi objek, kolom menjadi field. Kamu bekerja dengan objek, dan ORM yang menulis SQL-nya.',
    },
    front: 'What does an ORM do, and what is its downside?',
    back: 'It maps tables to classes and rows to objects and generates SQL for you, so you write less repetitive code. The downside is hidden queries: you must learn what SQL it produces (for example the N+1 problem) to keep it fast.',
    explanation: 'Hibernate (for JPA) and Prisma (in the NestJS stack) are both ORMs.',
    docsUrl: 'https://hibernate.org/orm/',
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/entity-annotations', type: 'mcq', tags: ['entity', 'annotations'],
    primer: {
      en: 'An entity is a Java class that represents one table. Annotations tell JPA which class is an entity and which field is the primary key.',
      id: 'Entity adalah class Java yang mewakili satu tabel. Annotation memberi tahu JPA class mana yang menjadi entity dan field mana yang menjadi primary key.',
    },
    question: 'In an entity class, which annotations mark the class as a table and its field as an auto-generated primary key?',
    options: [
      '@Entity on the class, @Id and @GeneratedValue on the field',
      '@Table on the field, @Primary on the class',
      '@Component and @Autowired',
      '@Column on the class, @Key on the field',
    ],
    answerIndex: 0,
    explanation: '@Entity marks the class as persistent, @Id marks the primary key, @GeneratedValue lets the database or provider generate it. @Table and @Column only customize names.',
    docsUrl: 'https://jakarta.ee/specifications/persistence/',
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/jpa-repository-methods', type: 'mcq', tags: ['spring-data', 'repository'],
    primer: {
      en: 'With Spring Data JPA you do not write the repository class. You write only an interface, and Spring generates the working class with common methods already included.',
      id: 'Dengan Spring Data JPA kamu tidak menulis class repository. Kamu hanya menulis interface, dan Spring membuatkan class yang berfungsi, lengkap dengan method umum.',
    },
    question: 'You write `interface UserRepository extends JpaRepository<User, Long> {}`. Which methods do you get without writing any code?',
    options: [
      'save, findById, findAll, delete, count and more',
      'Only findAll',
      'None until you implement them',
      'Only methods whose names start with get',
    ],
    answerIndex: 0,
    explanation: 'The two generic types are the entity (User) and the type of its id (Long). Spring creates the implementation at startup and registers it as a bean you can inject.',
    docsUrl: `${data}/jpa/getting-started.html`,
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/many-to-one', type: 'mcq', tags: ['relationships'],
    primer: {
      en: 'Tables are linked by foreign keys: many orders belong to one customer. In JPA you express that link with a field in the class and an annotation on it.',
      id: 'Tabel dihubungkan dengan foreign key: banyak order milik satu customer. Di JPA hubungan itu dinyatakan dengan field di class beserta annotation-nya.',
    },
    question: 'Many Order rows point to one Customer. Which mapping goes on the Order entity?',
    options: [
      '@ManyToOne on a Customer field, with @JoinColumn naming the foreign key column',
      '@OneToMany on a Customer field',
      '@OneToOne on a List<Customer> field',
      '@Id on the Customer field',
    ],
    answerIndex: 0,
    explanation: 'The "many" side holds the foreign key, so it owns the relationship: @ManyToOne + @JoinColumn(name = "customer_id"). The Customer side may have a @OneToMany(mappedBy = "customer") list for navigation.',
    docsUrl: 'https://jakarta.ee/specifications/persistence/',
  },
  {
    ...base, topic: 'jpa-basics', id: 'java-spring/jpa-basics/transactional-basics', type: 'flashcard', tags: ['transactions'],
    primer: {
      en: 'A transaction groups several database steps so that either all of them happen or none do. A bank transfer must not take money from A and then crash before giving it to B.',
      id: 'Transaksi mengelompokkan beberapa langkah database agar semuanya terjadi atau tidak sama sekali. Transfer bank tidak boleh mengambil uang dari A lalu crash sebelum memberikannya ke B.',
    },
    front: 'What does @Transactional do on a service method?',
    back: 'Spring starts a database transaction before the method runs, commits it if the method finishes normally, and rolls it back if an unchecked exception (RuntimeException) escapes.',
    explanation: 'Put it on service methods that change several rows or tables together. By default only RuntimeException and Error cause a rollback, not checked exceptions.',
    docsUrl: `${fw}/data-access/transaction/declarative/annotations.html`,
  },
  // ================= jpql =================
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/what-is-jpql', type: 'flashcard', tags: ['jpql', 'interview'],
    primer: {
      en: 'SQL talks about tables and columns. JPQL looks like SQL but talks about your Java classes and fields instead. Hibernate translates it into real SQL for the database you use.',
      id: 'SQL berbicara tentang tabel dan kolom. JPQL mirip SQL tetapi berbicara tentang class dan field Java-mu. Hibernate menerjemahkannya menjadi SQL sungguhan untuk database yang kamu pakai.',
    },
    front: 'What is JPQL?',
    back: 'Jakarta Persistence Query Language: an object-oriented query language defined by JPA. You query entities and their fields (FROM User u WHERE u.email = :email), not tables and columns, and the provider translates it to SQL for your database.',
    explanation: 'Because it names entities, a JPQL query keeps working if you rename a table or switch databases, as long as the mapping is updated. The Hibernate query language guide says tables and columns cannot be referenced directly in HQL or JPQL.',
    docsUrl: 'https://docs.hibernate.org/orm/current/querylanguage/html_single/Hibernate_Query_Language.html',
  },
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/jpql-vs-sql', type: 'mcq', tags: ['jpql', 'sql'],
    primer: {
      en: 'Compare two queries that do the same thing. SQL: `SELECT * FROM users WHERE email = ?`. JPQL: `SELECT u FROM User u WHERE u.email = :email`. In JPQL, `User` is the class and `u.email` is its field.',
      id: 'Bandingkan dua query yang hasilnya sama. SQL: `SELECT * FROM users WHERE email = ?`. JPQL: `SELECT u FROM User u WHERE u.email = :email`. Di JPQL, `User` adalah nama class dan `u.email` adalah field-nya.',
    },
    question: 'What is the key difference between JPQL and SQL?',
    options: [
      'JPQL queries entity classes and their fields; SQL queries tables and columns',
      'JPQL is faster than SQL',
      'JPQL can only read data, never change it',
      'JPQL works only with MySQL',
    ],
    answerIndex: 0,
    explanation: 'JPQL is database-independent and uses Java names (case-sensitive for entity and field names). SQL is tied to the schema and the vendor\'s dialect.',
    docsUrl: 'https://docs.hibernate.org/orm/current/querylanguage/html_single/Hibernate_Query_Language.html',
  },
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/query-annotation', type: 'flashcard', tags: ['jpql', 'spring-data'],
    primer: {
      en: 'When a method name would be too long or awkward, you write the query yourself and put it above the method with @Query.',
      id: 'Ketika nama method akan terlalu panjang atau janggal, kamu menulis query sendiri dan menaruhnya di atas method dengan @Query.',
    },
    front: 'How do you run a custom JPQL query from a Spring Data repository?',
    back: 'Annotate a repository method with @Query("SELECT u FROM User u WHERE u.email = :email") and bind the parameter with @Param("email"). The query is JPQL unless you set nativeQuery = true.',
    explanation: 'Named parameters (:email) are bound by @Param, never concatenated into the string, which also protects against SQL injection.',
    docsUrl: `${data}/jpa/query-methods.html#jpa.query-methods.at-query`,
  },
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/table-name-bug', type: 'bugspot', tags: ['jpql', 'bug'],
    primer: {
      en: 'In JPQL you write the entity (class) name, not the table name. If the entity is `User` but the table is `users`, `FROM users` is wrong in JPQL.',
      id: 'Di JPQL kamu menulis nama entity (class), bukan nama tabel. Jika entity-nya `User` tetapi tabelnya `users`, maka `FROM users` salah di JPQL.',
    },
    language: 'java',
    code: `@Entity
@Table(name = "users")
public class User { /* ... */ }

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM users u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
}`,
    buggyLines: [6],
    fixedCode: `@Entity
@Table(name = "users")
public class User { /* ... */ }

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);
}`,
    explanation: 'JPQL refers to the entity name User, not the table name users, because tables and columns cannot be referenced directly. Spring Data validates @Query at startup, so the application fails to start with an error such as "users is not mapped" or "could not resolve root entity". Use nativeQuery = true if you really want table names.',
    docsUrl: 'https://docs.hibernate.org/orm/current/querylanguage/html_single/Hibernate_Query_Language.html',
  },
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/native-query', type: 'mcq', tags: ['native-query'],
    primer: {
      en: 'Sometimes JPQL cannot express what you need (a database-specific function, a very tuned query). Then you may write plain SQL and tell Spring it is native.',
      id: 'Kadang JPQL tidak bisa menyatakan apa yang kamu butuhkan (fungsi khusus database, query yang sangat dituning). Saat itu kamu boleh menulis SQL biasa dan memberi tahu Spring bahwa itu native.',
    },
    question: 'What does `@Query(value = "SELECT * FROM users WHERE email = ?1", nativeQuery = true)` do differently from a JPQL query?',
    options: [
      'It runs your SQL against the database, using table and column names',
      'It converts the query to JPQL automatically',
      'It disables transactions',
      'It caches the result forever',
    ],
    answerIndex: 0,
    explanation: 'Native queries use real SQL, so they are tied to your database vendor (Spring Data may still adjust a simple one for paging and sorting). Prefer JPQL or derived queries first, and use native SQL only when you need it.',
    docsUrl: `${data}/jpa/query-methods.html#jpa.query-methods.at-query`,
  },
  {
    ...base, topic: 'jpql', id: 'java-spring/jpql/derived-vs-query', type: 'mcq', tags: ['spring-data', 'jpql'],
    primer: {
      en: 'Spring Data can build a query just from a method name (findByEmail). That is the simple way. For anything longer, switch to @Query.',
      id: 'Spring Data bisa membuat query hanya dari nama method (findByEmail). Itu cara termudah. Untuk kebutuhan yang lebih panjang, pindah ke @Query.',
    },
    question: 'Which repository method needs no @Query because Spring Data derives the query from the name?',
    options: [
      'Optional<User> findByEmail(String email)',
      'List<User> searchUsersWithSpecialRulesAndJoins(String a, String b)',
      'void doMagic()',
      'User fetch(String sql)',
    ],
    answerIndex: 0,
    explanation: 'findBy + a property name (Email) is parsed into WHERE email = ?. Names that do not follow the convention fail at startup, which is when you use @Query.',
    docsUrl: 'https://docs.spring.io/spring-data/commons/reference/repositories/query-methods-details.html',
  },
  // ================= java-basics (foundations, executed) =================
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/string-immutable', type: 'output', tags: ['strings'],
    primer: {
      en: 'In Java a String never changes after it is created. Methods such as concat return a new String and leave the original alone.',
      id: 'Di Java sebuah String tidak pernah berubah setelah dibuat. Method seperti concat mengembalikan String baru dan membiarkan yang asli.',
    },
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        String s = "a";
        s.concat("b");
        System.out.println(s);
    }
}`,
    options: ['a', 'ab', 'b', 'null'],
    answerIndex: 0,
    verifiedOutput: 'a',
    explanation: 'concat returns a new String "ab", but the result was thrown away, so s is still "a". Write s = s.concat("b") to keep it.',
    docsUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html',
  },
  {
    ...base, topic: 'java-basics', id: 'java-spring/java-basics/interface-vs-class', type: 'flashcard', tags: ['oop', 'interface'],
    primer: {
      en: 'An interface is a contract: it lists method names without the code. A class "implements" the interface by supplying that code. Spring Data repositories are interfaces: Spring writes the class for you.',
      id: 'Interface adalah kontrak: berisi daftar nama method tanpa isinya. Sebuah class "mengimplementasikan" interface dengan menulis isinya. Repository Spring Data berupa interface: Spring yang menuliskan class-nya untukmu.',
    },
    front: 'What is an interface in Java, and why does Spring use them so much?',
    back: 'A type that declares methods without implementing them; classes implement it. Spring injects the interface type, so you can swap the implementation (a real repository versus a test fake) without changing the code that uses it.',
    explanation: 'This is also why `UserRepository extends JpaRepository` can be an interface with no code: Spring generates the implementation at startup.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/IandI/createinterface.html',
  },
];
