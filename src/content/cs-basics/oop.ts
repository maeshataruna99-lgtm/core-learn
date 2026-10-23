import type { Card } from '../../core/types.ts';

// Language-independent OOP questions. Examples use Java and JavaScript. Written from scratch.
const base = { track: 'cs-basics', topic: 'oop' } as const;

export const cards: Card[] = [
  {
    ...base, id: 'cs-basics/oop/four-pillars', level: 'beginner', type: 'flashcard', tags: ['oop', 'interview'],
    primer: {
      en: 'Object-oriented programming (OOP) organizes a program as objects: things that hold data and the actions that work on that data, like a Car with a speed and a brake() method. Four ideas keep this approach tidy.',
      id: 'Object-oriented programming (OOP) menyusun program sebagai objek: sesuatu yang menyimpan data beserta aksi yang bekerja pada data itu, misalnya Car dengan speed dan method brake(). Empat gagasan menjaga pendekatan ini tetap rapi.',
    },
    front: 'What are the four pillars of OOP?',
    back: 'Encapsulation (bundle data with the code that uses it and hide the details), Abstraction (expose only what is needed), Inheritance (a class reuses and extends another), Polymorphism (one interface, many implementations).',
    explanation: 'A short way to remember: hide the inside, show the essentials, reuse a parent, and let one call behave differently per object.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/concepts/index.html',
  },
  {
    ...base, id: 'cs-basics/oop/encapsulation', level: 'beginner', type: 'mcq', tags: ['encapsulation', 'interview'],
    primer: {
      en: 'A bank account object should not let anyone set its balance to any number. Encapsulation keeps the data private and offers methods (deposit, withdraw) that enforce the rules.',
      id: 'Objek rekening bank tidak boleh membiarkan siapa pun mengisi saldo dengan angka sembarang. Encapsulation menjaga data tetap privat dan menyediakan method (deposit, withdraw) yang menegakkan aturan.',
    },
    question: 'Which design shows encapsulation?',
    options: [
      'A private balance field changed only through deposit() and withdraw(), which validate the amount',
      'A public balance field that any code can set',
      'One huge class that does everything',
      'A class with no fields',
    ],
    answerIndex: 0,
    explanation: 'Private fields plus public methods protect invariants (the balance can never go negative). Getters and setters alone are not enough if they allow any change.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html',
  },
  {
    ...base, id: 'cs-basics/oop/abstraction-vs-encapsulation', level: 'intermediate', type: 'mcq', tags: ['abstraction', 'interview'],
    question: 'How does abstraction differ from encapsulation?',
    options: [
      'Abstraction decides what to show (a simple interface); encapsulation hides how it is stored and protects the data',
      'They mean exactly the same thing',
      'Abstraction is only for databases',
      'Encapsulation means a class cannot have methods',
    ],
    answerIndex: 0,
    explanation: 'A List interface is an abstraction: you ask for add() and get() without caring how. Encapsulation is why ArrayList\'s internal array is private. In Java, abstraction is expressed with interfaces and abstract classes.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html',
  },
  {
    ...base, id: 'cs-basics/oop/inheritance', level: 'beginner', type: 'flashcard', tags: ['inheritance', 'interview'],
    primer: {
      en: 'A Dog is an Animal, so it should be able to do what every Animal does. Inheritance lets the Dog class reuse the Animal class and then add or change behavior.',
      id: 'Dog adalah Animal, jadi ia seharusnya bisa melakukan apa yang dilakukan setiap Animal. Inheritance memungkinkan class Dog memakai ulang class Animal lalu menambah atau mengubah perilaku.',
    },
    front: 'What is inheritance and what is its main risk?',
    back: 'A subclass reuses the fields and methods of a superclass (an "is-a" relationship) and can override behavior. The risk is tight coupling: changes in the parent can break every child, and deep hierarchies become hard to understand.',
    explanation: 'Use inheritance when the child is truly a kind of the parent. For code reuse alone, prefer composition.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html',
  },
  {
    ...base, id: 'cs-basics/oop/diamond-problem', level: 'intermediate', type: 'mcq', tags: ['inheritance', 'interview'],
    question: 'What is the diamond problem and how does Java avoid it for classes?',
    options: [
      'A class inheriting the same method from two parents is ambiguous; Java allows only one superclass (interfaces with defaults must be resolved explicitly)',
      'A graphics bug in IDEs',
      'A problem with loops of exactly four iterations',
      'A rule that every class needs four fields',
    ],
    answerIndex: 0,
    explanation: 'If B and C both extend A and D extends both, which version of A\'s method does D inherit? C++ allows multiple inheritance and needs rules (virtual inheritance); Java forbids multiple class inheritance and makes you override when two interface default methods clash.',
    docsUrl: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html',
  },
  {
    ...base, id: 'cs-basics/oop/polymorphism-kinds', level: 'intermediate', type: 'flashcard', tags: ['polymorphism', 'interview'],
    front: 'What are compile-time and runtime polymorphism?',
    back: 'Compile-time (static) polymorphism is method overloading: the compiler picks a method by the argument types. Runtime (dynamic) polymorphism is method overriding: the JVM picks the implementation by the actual object type when the call runs, so a List variable can hold an ArrayList or a LinkedList.',
    explanation: 'Dynamic dispatch is what makes "program to an interface" work in Spring: the injected interface hides the real implementation.',
    docsUrl: 'https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html',
  },
  {
    ...base, id: 'cs-basics/oop/composition-over-inheritance', level: 'intermediate', type: 'mcq', tags: ['composition', 'design', 'interview'],
    question: 'A Car needs an Engine. Which relationship is the usual better design?',
    options: [
      'Composition: Car has an Engine field (has-a), not Car extends Engine',
      'Inheritance: Car extends Engine (is-a)',
      'Make the Engine a global variable',
      'Copy the Engine code into Car',
    ],
    answerIndex: 0,
    explanation: 'A car is not an engine, it has one. Composition is more flexible: you can swap the engine, test with a fake, and avoid inheriting methods that make no sense.',
    docsUrl: 'https://en.wikipedia.org/wiki/Composition_over_inheritance',
  },
  {
    ...base, id: 'cs-basics/oop/association-aggregation-composition', level: 'intermediate', type: 'flashcard', tags: ['design', 'interview'],
    front: 'Association vs aggregation vs composition',
    back: 'Association: objects know each other (a Teacher and a Student). Aggregation: a "has-a" where the parts can live without the whole (a Team and its Players). Composition: a stronger "has-a" where the parts die with the whole (a House and its Rooms).',
    explanation: 'The distinction is about lifecycle and ownership, and it often shows up in UML class diagrams and database cascade rules.',
    docsUrl: 'https://en.wikipedia.org/wiki/Object_composition',
  },
  {
    ...base, id: 'cs-basics/oop/single-responsibility', level: 'intermediate', type: 'mcq', tags: ['solid', 'design'],
    question: 'What does the Single Responsibility Principle say?',
    options: [
      'A class should have one reason to change, that is, one job',
      'A class may have only one method',
      'Only one object of each class may exist',
      'A program may have only one class',
    ],
    answerIndex: 0,
    explanation: 'It is the S in SOLID. A UserService that validates input, sends email and writes SQL has three reasons to change; split those jobs so each can change and be tested alone. Spring\'s controller, service and repository layers follow it.',
    docsUrl: 'https://en.wikipedia.org/wiki/Single-responsibility_principle',
  },
  {
    ...base, id: 'cs-basics/oop/shallow-vs-deep-copy', level: 'intermediate', type: 'output', tags: ['copy', 'interview'],
    language: 'js',
    code: `const original = { n: { v: 1 } };
const shallow = { ...original };
const deep = structuredClone(original);
original.n.v = 2;
console.log(shallow.n.v, deep.n.v);`,
    options: ['2 1', '1 1', '2 2', '1 2'],
    answerIndex: 0,
    verifiedOutput: '2 1',
    explanation: 'A shallow copy duplicates only the top level: nested objects are still shared, so the change shows up. A deep copy duplicates everything, so it is independent. Java\'s clone() is shallow by default.',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy',
  },
];
