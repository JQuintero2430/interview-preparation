# 03. Generics and type erasure

> **What this covers:** how Java generics move type checks from run time to compile time: generic types and methods, inference, bounds, and the wildcards that make APIs flexible (PECS). Then what the compiler erases and what the class file keeps, the bridge methods and heap pollution that follow from it, and how libraries such as Spring recover a full generic type at run time with type tokens.
> **Prerequisites:** [01. Java OOP fundamentals § 8. Polymorphism: overloading, overriding and dispatch](01-java-oop-fundamentals.md#8-polymorphism-overloading-overriding-and-dispatch), [§ 9. Abstract classes and interfaces](01-java-oop-fundamentals.md#9-abstract-classes-and-interfaces)
> **Leads to:** [04. Collections internals](04-java-collections-internals.md), [05. Lambdas, streams and `Optional`](05-java-lambdas-streams-optional.md), [15. Spring IoC and bean lifecycle](15-spring-ioc-and-bean-lifecycle.md)
> **Applies to:** Java 25, Spring Framework 7.0.10 (§7 only)
> **Study time:** ~5 hours reading + ~3 hours exercises
> **Short on time:** [4. Wildcards, PECS and variance](#4-wildcards-pecs-and-variance), [5. Type erasure and bridge methods](#5-type-erasure-and-bridge-methods), [7. Capturing types at run time: class tokens and super type tokens](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens); questions [Q03.02](#q03-02), [Q03.09](#q03-09), [Q03.11](#q03-11), [Q03.15](#q03-15), [Q03.20](#q03-20); then [Summary](#summary).
> **Labs:** [`labs/java-language/`](../labs/java-language/), package `dev.interview.javalanguage.m03`. Run: `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl java-language -am verify`. Needs Docker: no.

## Contents

1. [Why generics: compile-time safety and raw types](#1-why-generics-compile-time-safety-and-raw-types)
2. [Generic types, generic methods and type inference](#2-generic-types-generic-methods-and-type-inference)
3. [Bounded type parameters](#3-bounded-type-parameters)
4. [Wildcards, PECS and variance](#4-wildcards-pecs-and-variance)
5. [Type erasure and bridge methods](#5-type-erasure-and-bridge-methods)
6. [Reifiable types, generic arrays and heap pollution](#6-reifiable-types-generic-arrays-and-heap-pollution)
7. [Capturing types at run time: class tokens and super type tokens](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)
8. [Reading generic signatures in the JDK](#8-reading-generic-signatures-in-the-jdk)
- [Summary](#summary)
- [Question bank](#question-bank)
- [Hands-on exercises](#hands-on-exercises)
- [Check your understanding](#check-your-understanding)
- [Connections](#connections)

## 1. Why generics: compile-time safety and raw types
### The problem it solves

A warehouse service keeps SKU codes (stock-keeping unit identifiers) in a `List`. Written the pre-Java-5 way, that list holds `Object`, so every read needs a cast and nothing stops a caller from adding a stock count, an `Integer`, to it. The `add` succeeds. The failure comes later, in a nightly report that reads the element as a `String` and dies with a `ClassCastException`. The stack trace points at the report, which is correct code, and says nothing about the line that put the number there, which may have run hours earlier in another class. Generics exist to move that failure from a run-time read to the compile-time `add`.

### Mental model

A generic type is a box with a label, and the compiler is a customs officer who reads labels. With `List<String>` the officer checks every item going in, so nothing needs checking on the way out. A raw `List` is the same box with the label torn off: the officer waves everything through, and the person who later unpacks the box, expecting only strings, is the one who gets hurt.

```mermaid
sequenceDiagram
    participant L as LegacyCatalog with a raw List
    participant A as ArrayList
    participant R as SkuReport with a List of String
    L->>A: add(42), no check
    A-->>L: true
    R->>A: get(1)
    A-->>R: an Integer, typed as Object
    R->>R: compiler-inserted cast to String
    Note over R: ClassCastException here, far from the add
    Note over L,A: with Collections.checkedList the add itself throws
```

What to notice: the list never checks anything. The only check is the cast the compiler puts in the reading code, so the exception appears wherever the element is first used as a `String`.

### How it actually works

**What a type argument buys.** `List<E>` declares a type parameter `E`, a placeholder for an element type. `List<String>` supplies the type argument `String`, and the result is called a parameterized type. From then on the compiler does two things. It rejects a wrong argument: `names.add(42)` on a `List<String>` does not compile [Lab: RawTypeCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java). And it writes the casts for you: `SkuReport.firstLetters` below has no cast in its source, yet the `ClassCastException` is thrown from inside that method, because the compiler inserted a cast to `String` where each element is read [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java). The type argument itself is not kept in the object: an `ArrayList<String>` and an `ArrayList<Integer>` have the same run-time class [Lab: M03LabSmokeTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/smoke/M03LabSmokeTest.java). That removal is type erasure, the subject of [§5](#5-type-erasure-and-bridge-methods).

**What a raw type is.** A raw type is the name of a generic class or interface used without a type argument list, such as `List` instead of `List<String>`. The types of its constructors, instance methods and non-static fields are their erasures, so `add(E)` becomes `add(Object)` and accepts anything. A raw variable can also be assigned any parameterized instance of its type without a warning, which is how the `List<String>` reaches the legacy code in the first place. The specification allows raw types "only as a concession to compatibility of legacy code", so that libraries could become generic in Java 5 without breaking their callers. It strongly discourages them in new code and says a future version of the language may disallow them [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8).

**The two warnings.** javac reports two different things, under two lint categories (lint is javac's set of optional warning groups, enabled with `-Xlint:<key>`) [Doc: javac, Java 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html):

| Lint key | What it flags | What it means |
|---|---|---|
| `rawtypes` | the mention of a raw type (`List raw`) | type checking is switched off for this variable |
| `unchecked` | an operation the compiler cannot check, here the call `raw.add(42)` | this line may put a wrong element into a typed collection |

The second one is the warning the specification requires: calling a method of a raw type is an unchecked warning whenever erasure changes a parameter type, as it does for `add(E)` [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). In the lab, compiling the raw `add` with `-Xlint:rawtypes,unchecked` succeeds and produces both warnings. With no lint flag the same source produces no warning at all, only a note that the file uses unchecked operations, which is why raw types survive unnoticed in builds that never turn the flags on [Lab: RawTypeCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java).

**Why the warning matters.** A variable of a parameterized type that refers to an object which is not of that type is called heap pollution, and the specification gives a guarantee about it: if no operation that requires an unchecked warning takes place, and no array of a non-reifiable element type is aliased unsafely, heap pollution cannot occur [Doc: JLS §4.12.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.2). So in a program with no unchecked warnings and no such array aliasing, no compiler-inserted cast can fail, and every suppressed warning is a hole in that guarantee. Arrays and varargs, the other route to pollution, are in [§6](#6-reifiable-types-generic-arrays-and-heap-pollution).

**Moving the failure back.** `Collections.checkedList(list, String.class)` returns a view that keeps a `Class` object, the one thing a raw caller cannot erase. Every insertion goes through `typeCheck`, which calls `type.isInstance(o)` and throws `ClassCastException` for a non-null element of the wrong class [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). In the lab the exception's top frame is `Collections$CheckedCollection.typeCheck`, reached from the bad `add`, and the list keeps its single element [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java).

### Code

The lab reproduces the incident with two classes and then moves the failure.

1. `LegacyCatalog` is the pre-generics API, kept as the defect: its parameter is a raw `List`, so its `add` is unchecked.
2. `SkuReport` is correct, typed code with no cast in its source.
3. The first test pollutes a `List<String>` through `LegacyCatalog`, shows that the `add` and an `Object` read both succeed, and asserts that the exception comes from `SkuReport`.
4. The second test wraps the list with `Collections.checkedList` and asserts that the same `add` now throws.

```java
package dev.interview.javalanguage.m03.s01;

import java.util.List;

// Module 03 §1: a pre-generics API, the defect on purpose. Its parameter is a raw List, so javac checks no element.
public final class LegacyCatalog {

    private static final Integer STOCK_COUNT = 42;

    private LegacyCatalog() {}

    @SuppressWarnings({"rawtypes", "unchecked"})
    public static void addStockCount(List skus) {
        skus.add(STOCK_COUNT);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s01/LegacyCatalog.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s01/LegacyCatalog.java)</sub>

```java
package dev.interview.javalanguage.m03.s01;

import java.util.List;

// Module 03 §1: typed code with no cast in its source. javac inserts the cast where each element is read as a String.
public final class SkuReport {

    private SkuReport() {}

    public static String firstLetters(List<String> skus) {
        StringBuilder letters = new StringBuilder();
        for (String sku : skus) {
            letters.append(sku.charAt(0));
        }
        return letters.toString();
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s01/SkuReport.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s01/SkuReport.java)</sub>

Where each version fails (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java
    private static final String SKU = "A-100";
    private static final String CHECKED_VIEW_CLASS = "java.util.Collections$CheckedCollection";
    private static final String TYPE_CHECK_METHOD = "typeCheck";

    @Test
    @DisplayName("M03 §1 · a raw-typed add makes the ClassCastException appear at the typed read")
    void firstLetters_throwsClassCastException_whenRawAddPollutedTheList() {
        List<String> skus = new ArrayList<>(List.of(SKU));

        LegacyCatalog.addStockCount(skus);

        assertThat(skus).hasSize(2);
        for (Object element : skus) {
            assertThat(element).isNotNull();
        }
        ClassCastException thrown = catchThrowableOfType(ClassCastException.class, () -> SkuReport.firstLetters(skus));
        assertThat(thrown).isNotNull();
        assertThat(thrown.getStackTrace()[0].getClassName()).isEqualTo(SkuReport.class.getName());
    }

    @Test
    @DisplayName("M03 §1 · Collections.checkedList throws at the bad add")
    void addStockCount_throwsClassCastException_whenListIsCheckedView() {
        List<String> skus = Collections.checkedList(new ArrayList<>(List.of(SKU)), String.class);

        ClassCastException thrown =
                catchThrowableOfType(ClassCastException.class, () -> LegacyCatalog.addStockCount(skus));

        assertThat(thrown).isNotNull();
        StackTraceElement top = thrown.getStackTrace()[0];
        assertThat(top.getClassName()).isEqualTo(CHECKED_VIEW_CLASS);
        assertThat(top.getMethodName()).isEqualTo(TYPE_CHECK_METHOD);
        assertThat(skus).hasSize(1);
    }
```

The compile-time side: the source below compiles, and the test asserts the two warning keys rather than the message text (excerpt).

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java
    private static final String LINT = "-Xlint:rawtypes,unchecked";
    private static final String RAW_USE = "compiler.warn.raw.class.use";
    private static final String UNCHECKED_CALL = "compiler.warn.unchecked.call.mbr.of.raw.type";

    private static final String RAW_ADD = """
            import java.util.*;
            class Raw {
                List<String> run() {
                    List<String> names = new ArrayList<>();
                    List raw = names;
                    raw.add(42);
                    return names;
                }
            }
            """;

    @Test
    @DisplayName("M03 §1 · a raw List accepts any element and warns under -Xlint:rawtypes,unchecked")
    void compile_warnsTwice_whenRawListIsUsedWithLint() {
        var result = InMemoryCompiler.compile(Map.of(SOURCE_NAME, RAW_ADD), LINT);

        assertThat(result.success()).isTrue();
        assertThat(warningCodes(result)).contains(RAW_USE, UNCHECKED_CALL);
    }
```

### Failure modes and operations

**The delayed `ClassCastException`.** The exception is thrown where the element is first used as its declared type, not where it was inserted, so the top frame names innocent code: in the lab it is `SkuReport` [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java). Code that only treats elements as `Object` (logging, `size()`, copying) passes the bad element along untouched, so the cause and the symptom can be far apart in both code and time. Load plays no part: the failure depends on the data, and it repeats every time the polluted element is read as a `String`.

**Legacy APIs that return raw types.** Assigning a raw `List` to a `List<String>` is allowed with an unchecked warning, for the sake of old libraries; the specification notes that the warning means the caller "may experience problems from heap pollution at other points in the program" [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). [Q03.03](#q03-03) works through that incident.

**Suppression that is too wide.** `@SuppressWarnings` applies to the annotated element and everything inside it, so one annotation on a class also hides every unchecked warning added to that class later [Src: JDK 25, java.lang.SuppressWarnings](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/SuppressWarnings.java). The two keys are independent: in the lab, `@SuppressWarnings("unchecked")` on a method removes the unchecked warning and leaves the `rawtypes` one [Lab: RawTypeCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java).

**What to configure and observe.** Compile with `-Xlint:rawtypes,unchecked`, and add `-Werror`, which terminates compilation when warnings occur, once the existing ones are fixed [Doc: javac, Java 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html). Without the flags the only trace in a build log is the note about unchecked operations. At run time, a `ClassCastException` whose top frame is a method with no cast in its source is the signature of heap pollution. To find the writer, wrap the collection in a checked view where it is created: the `Collections` Javadoc describes exactly this use, as a debugging aid for a reproducible failure [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java).

> [!NOTE]
> **Version notes.** Java 1.4 and earlier: no generics, so collections hold `Object` and every read is a hand-written cast; that code still compiles today as raw types. Java 5: generics added to the language [Doc: JSR 14](https://jcp.org/en/jsr/detail?id=14). Java 7: the diamond, `new ArrayList<>()`, lets the compiler infer the type arguments of a constructor call [Doc: JSR 334](https://jcp.org/en/jsr/detail?id=334). Java 10: `var` infers a local variable's type from its initializer [Final since Java 10, JEP 286] [Doc: JEP 286](https://openjdk.org/jeps/286). Java 25 (default): raw types are still legal and still only a warning [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). Inference is covered in [§2](#2-generic-types-generic-methods-and-type-inference).

### Best practices and anti-patterns

- Never use a raw type in new code; write `List<String>`, or `List<?>` when the element type does not matter, because a raw type switches off the check for every operation on that variable.
- Compile with `-Xlint:rawtypes,unchecked` and fail the build on warnings, because without the flags javac prints one note per file and the problem stays invisible.
- Treat each unchecked warning as a claim to prove, because a program with none cannot fail in a compiler-inserted cast (the array cases of [§6](#6-reifiable-types-generic-arrays-and-heap-pollution) aside).
- When a warning cannot be removed, put `@SuppressWarnings("unchecked")` on the smallest declaration that works (a local variable or a short method) with a comment saying why the operation is safe, because the annotation covers everything inside the element it marks.
- Do not suppress `rawtypes` and `unchecked` together by habit, because they answer different questions: one says a type is unchecked, the other says this line may pollute.
- Wrap a legacy raw API once, at the boundary, in a method that copies its result into a typed collection after checking each element, because the failure then happens at the boundary and names the library.
- Use `Collections.checkedList` (and the other `checked…` views) to locate a bad writer, or when handing a collection to code you do not control, because the view fails at the insertion; it adds a check to every write, so it is a diagnostic and a guard, not a default.

### Misconceptions and traps

- *"A raw `List` and a `List<Object>` are the same thing."* A raw `List` turns checking off: it accepts any parameterized list and any element, with warnings at most. `List<Object>` is an ordinary parameterized type that the compiler checks like any other. The myth exists because both let you add any object; [Q03.12](#q03-12) and [§4](#4-wildcards-pecs-and-variance) show where they differ.
- *"Generics add a run-time cost."* The type arguments are erased, so there is one class however many parameterizations the program uses, and the casts are the ones a programmer wrote by hand before Java 5 [Lab: M03LabSmokeTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/smoke/M03LabSmokeTest.java). The myth comes from C++ templates, which look similar; the Java 5 guide answers it directly: generics "do not generate a new class for each specialization" [Doc: Java 5 language guide, Generics](https://docs.oracle.com/javase/1.5.0/docs/guide/language/generics.html).
- *"If it compiles without errors, the types are right."* Only when it also compiles without unchecked warnings; a raw `add` is not an error [Lab: RawTypeCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java). It looks true because default javac output hides the warnings behind a note.
- *"The `ClassCastException` shows where the bug is."* It shows where the wrong element was first read as its declared type. The bug is the earlier unchecked write, which the stack trace does not contain. The belief carries over from hand-written casts, where the cast and the mistake are usually on the same line.

Questions that drill this section: [Q03.01](#q03-01), [Q03.02](#q03-02), [Q03.03](#q03-03), [Q03.12](#q03-12).

## 2. Generic types, generic methods and type inference
### The problem it solves

A configuration holder stores values of several types, so its getter returns `Object` and every caller casts. Someone tidies it up with a generic signature, `<T> T get(String key)`, and the casts disappear from the callers: `Integer port = settings.get("port")` compiles with no warning. The stored value is the text `"8080"`. The line fails at run time with a `ClassCastException`, in the caller, on a line that contains no cast. The signature looked type-safe and promised nothing, because nothing in it tells the compiler what `T` is. To read a generic signature you have to know two things: where a type parameter is declared, and who chooses its value.

### Mental model

A type parameter is a blank on a form. A generic class prints the blank on the form itself: whoever takes a copy fills it in once, and every field of that copy uses the same answer. A generic method has its own blank, filled in again at each call. Type inference is a clerk who fills in the blank for you when the context makes the answer obvious, and who writes the most general answer, `Object`, when the context says nothing.

| Declared on | Who chooses the type argument | Chosen | Example |
|---|---|---|---|
| a class or interface, `class Box<T>` | the code that names the type or creates the instance | once per use of the type | `Box<String> name = new Box<>("sku")` |
| a method, `static <T> T firstOr(List<T> elements, T fallback)` | each call, almost always by inference | at every call | `Elements.firstOr(List.of(7), 0)` |
| a constructor, `<T> Catalog(T seed)` | each `new` expression | at every instantiation | rare in practice |

### How it actually works

**Generic classes.** A class is generic if its declaration declares one or more type variables. `Box<String>` and `Box<Integer>` are different types to the compiler, and "all of these parameterized types share the same class at run time". Two rules follow from one class serving every parameterization: a static member cannot refer to the class's type parameter, because static members belong to the class and not to one parameterization of it, and a generic class cannot be a subclass of `Throwable` [Doc: JLS §8.1.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.2) [Doc: JLS §6.5.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.5.1). By convention type parameters are single uppercase letters, so that they are not mistaken for class names: `T` for a type, `E` for an element, `K` and `V` for a key and a value, `N` for a number [Doc: The Java Tutorials, Generic Types](https://docs.oracle.com/javase/tutorial/java/generics/types.html). `R` for a result type is the JDK's own habit, as in `Function<T, R>`.

**Generic methods and constructors.** A method is generic if it declares its own type variables, written before the return type: `static <T> T firstOr(...)`. It can live in a non-generic class, and a generic class can add method-level parameters of its own, as `Box.map` does with `<R>`. The type arguments "may not need to be provided explicitly when a generic method is invoked, as they can often be inferred" [Doc: JLS §8.4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.4). A constructor can be generic too, independently of whether its class is [Doc: JLS §8.8.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.4).

**Inference and the target type.** The compiler infers type arguments from two sources: the arguments of the call, and the target type, which is the type the surrounding context expects. An expression whose type may depend on its target is called a poly expression, and the rule that decides everything below is when an expression is one:

- A `new` expression with the diamond `<>` is a poly expression only when it appears in an assignment or as a method argument [Doc: JLS §15.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9). In `List<String> names = new ArrayList<>()` the target is `List<String>`, so the result is an `ArrayList<String>`. The diamond is not a raw type: in the lab it compiles with no warning under `-Xlint:rawtypes,unchecked`, while `new ArrayList()` in the same place produces a raw-type warning and an unchecked-conversion warning, and a diamond passed as a method argument is inferred from the parameter type [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java).
- A generic method call is a poly expression only when it appears in an assignment or as an argument, has no explicit type arguments, and its return type mentions a type parameter [Doc: JLS §15.12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12). The receiver of a chained call is in neither position. So `Collections.emptyList().get(0)` infers with no target, and a type variable left with nothing but its upper bound resolves to that bound, here `Object` [Doc: JLS §18.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-18.html#jls-18.4). In the lab, returning that expression as a `String` is a compile error, and the explicit type argument, called a type witness, fixes it: `Collections.<String>emptyList().get(0)` [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java).

**`var`.** For `var`, the type of the variable is the type of the initializer "treated as if it did not appear in an assignment context", that is, as a standalone expression, and a `null` initializer is an error [Doc: JLS §14.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1). So `var` gives the initializer no target type, and `var list = new ArrayList<>()` is an `ArrayList<Object>`: in the lab it accepts a `String` and an `Integer`, and reading an element as a `String` does not compile. `var` is still static typing. The type is fixed at the declaration, so assigning an `int` to a `var` that was initialized with a `String` is a compile error, as is a `var` with no initializer [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java).

**Why `<T> T get(String key)` is a trap.** `T` appears only in the return type, so no argument constrains it and the target type alone decides: `Integer port = settings.get("port")` infers `T = Integer`. Inside the getter, the cast `(T)` is an unchecked cast. In the lab javac reports it once, at the getter, and reports nothing at the caller; with `@SuppressWarnings("unchecked")` on the getter there is no warning anywhere [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java). The cast inside the getter checks nothing at run time, so the wrong value is returned normally and the first real check is the cast the compiler inserts in the caller: in the lab an `Object` read succeeds, and the `Integer` read throws with the caller's class as the top stack frame [Lab: GenericDeclarationsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/GenericDeclarationsTest.java). It is the heap pollution of [§1](#1-why-generics-compile-time-safety-and-raw-types) packaged as an API; why the cast checks nothing is erasure, in [§5](#5-type-erasure-and-bridge-methods).

### Code

Three small classes show the three cases: a class-level parameter, a method-level parameter, and a parameter nothing constrains.

1. `Box<T>` declares `T` on the class, and `map` declares a second parameter `R` on the method.
2. `Elements.firstOr` is a generic method in a non-generic class; both arguments constrain `T`.
3. `Settings.get` is the defect: `T` occurs only in the return type.
4. The test shows that the caller, not `Settings`, fails.

```java
package dev.interview.javalanguage.m03.s02;

import java.util.function.Function;

// Module 03 §2: a generic class. T is chosen once per instance; map adds a method-level R chosen at each call.
public final class Box<T> {

    private final T value;

    public Box(T value) {
        this.value = value;
    }

    public T value() {
        return value;
    }

    public <R> Box<R> map(Function<T, R> mapper) {
        return new Box<>(mapper.apply(value));
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Box.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Box.java)</sub>

```java
package dev.interview.javalanguage.m03.s02;

import java.util.List;

// Module 03 §2: a generic method in a non-generic class. The <T> before the return type declares the parameter.
public final class Elements {

    private Elements() {}

    public static <T> T firstOr(List<T> elements, T fallback) {
        return elements.isEmpty() ? fallback : elements.get(0);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Elements.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Elements.java)</sub>

```java
package dev.interview.javalanguage.m03.s02;

import java.util.HashMap;
import java.util.Map;

// Module 03 §2: the defect on purpose. T appears only in the return type, so the caller picks it and nothing checks it.
public final class Settings {

    private final Map<String, Object> values = new HashMap<>();

    public void put(String key, Object value) {
        values.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) values.get(key);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Settings.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Settings.java)</sub>

The caller's side (excerpt). `readPort` has no cast in its source, and it is where the exception is thrown.

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/GenericDeclarationsTest.java
    private static final String PORT_KEY = "port";
    private static final String PORT_TEXT = "8080";

    @Test
    @DisplayName("M03 §2 · a <T> T getter throws ClassCastException at the caller's assignment")
    void get_throwsClassCastExceptionInTheCaller_whenTheStoredValueHasAnotherType() {
        Settings settings = new Settings();
        settings.put(PORT_KEY, PORT_TEXT);

        Object untyped = settings.get(PORT_KEY);
        ClassCastException thrown = catchThrowableOfType(ClassCastException.class, () -> readPort(settings));

        assertThat(untyped).isEqualTo(PORT_TEXT);
        assertThat(thrown).isNotNull();
        assertThat(thrown.getStackTrace()[0].getClassName()).isEqualTo(GenericDeclarationsTest.class.getName());
    }

    private static Integer readPort(Settings settings) {
        return settings.get(PORT_KEY);
    }
```

The inference rules, each as a pair of sources that differ in one detail (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java
    private static final String VAR_DIAMOND_MIXED_ADDS =
            source("void run() { var list = new ArrayList<>(); list.add(\"a\"); list.add(1); }");
    private static final String VAR_DIAMOND_STRING_READ =
            source("void run() { var list = new ArrayList<>(); list.add(\"a\"); String s = list.get(0); }");
    private static final String VAR_EXPLICIT_STRING_READ =
            source("void run() { var list = new ArrayList<String>(); list.add(\"a\"); String s = list.get(0); }");
    private static final String CHAIN_WITHOUT_WITNESS =
            source("String run() { return Collections.emptyList().get(0); }");
    private static final String CHAIN_WITH_WITNESS =
            source("String run() { return Collections.<String>emptyList().get(0); }");

    @Test
    @DisplayName("M03 §2 · var with a diamond infers ArrayList<Object>")
    void compile_infersObjectElements_whenVarIsInitializedWithADiamond() {
        assertThat(compile(VAR_DIAMOND_MIXED_ADDS).success()).isTrue();
        assertThat(compile(VAR_DIAMOND_STRING_READ).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(VAR_EXPLICIT_STRING_READ).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §2 · a type witness selects T where inference cannot")
    void compile_succeedsOnlyWithATypeWitness_whenTheCallIsAReceiverInAChain() {
        assertThat(compile(CHAIN_WITHOUT_WITNESS).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(CHAIN_WITH_WITNESS).success()).isTrue();
    }

    private static String source(String members) {
        return "import java.util.*;\nclass Raw {\n" + members + "\n}\n";
    }
```

### Failure modes and operations

Declaring and inferring type parameters happens entirely at compile time, so this section has no load or deployment behavior: a wrong inference is a compile error, as the lab's `var` and chained-call cases show [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java). The one run-time failure is the unconstrained `<T> T` getter, which moves a `ClassCastException` into every caller that guesses the type wrong [Lab: GenericDeclarationsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/GenericDeclarationsTest.java). What to observe: the only compile-time signal is the unchecked-cast warning at the getter, so a suppressed warning on a method whose type parameter appears only in its return type deserves a second look in review. [Q03.06](#q03-06) is the bug hunt.

> [!NOTE]
> **Version notes.** Java 5 and 6: constructor type arguments are written out, `new ArrayList<String>()`. Java 7: the diamond infers them [Doc: JSR 334](https://jcp.org/en/jsr/detail?id=334). Java 8: a generic method call that is itself a method argument is inferred from the parameter type it is passed to [Doc: JEP 101](https://openjdk.org/jeps/101). Java 9: the diamond is allowed with anonymous classes when the inferred type is denotable [Doc: JEP 213](https://openjdk.org/jeps/213). Java 10: `var` for local variables [Doc: JEP 286](https://openjdk.org/jeps/286). Java 11: `var` on the parameters of an implicitly typed lambda [Doc: JEP 323](https://openjdk.org/jeps/323). Java 25 (default): the receiver of a chained call still has no target type, so it still needs a type witness [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java).

### Best practices and anti-patterns

- Declare a type parameter on the class when it describes the instance's state, and on the method when it only relates that call's arguments and result, because a class-level parameter that one method needs forces every user of the class to supply it.
- Make every method type parameter appear in at least one parameter type, because a parameter that occurs only in the return type is chosen by the caller and checked by nothing.
- For a container of mixed types, pass a `Class<T>` token and let the method check it, as [§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens) and [Exercise 03.1](#ex03-1) do, because the token is a run-time value the method can test.
- Use the diamond on the right-hand side and keep the type on the left, because the declaration then documents the type and the compiler infers the repetition.
- Do not combine `var` with a diamond; write `var names = new ArrayList<String>()`, because with `var` there is no target type and the element type silently becomes `Object`.
- Use a type witness only where inference has no target, such as the receiver of a chained call, because elsewhere it is noise the compiler would infer.
- Keep the conventional single-letter names, because a type parameter named like a class reads as one.

### Misconceptions and traps

- *"The diamond is a raw type with nicer syntax."* The diamond means "infer the type arguments"; the result is a fully parameterized type and compiles without warnings, while `new ArrayList()` is raw and warns [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java). The confusion exists because both leave the type argument out.
- *"`var` makes Java dynamically typed."* The type is inferred once, at compile time, and never changes [Final since Java 10, JEP 286] [Doc: JEP 286](https://openjdk.org/jeps/286). The myth comes from JavaScript, where `var` declares a variable that can hold any type.
- *"A method with `<T>` in its signature is type-safe."* Only when something constrains `T`. `<T> T get(String key)` compiles cleanly at every call site and fails in whichever one guessed wrong [Lab: GenericDeclarationsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/GenericDeclarationsTest.java). It looks safe because the caller writes no cast and sees no warning.
- *"Inference looks at the whole statement."* It looks at the expression's own arguments and, only for an assignment or an argument, at its target type; a chained call's receiver is inferred alone [Doc: JLS §15.12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12). The belief comes from lambdas and the diamond, where the target type visibly flows inward.

Questions that drill this section: [Q03.04](#q03-04), [Q03.05](#q03-05), [Q03.06](#q03-06), [Exercise 03.1](#ex03-1).

## 3. Bounded type parameters
### The problem it solves

A reporting utility needs the largest element of a list, for any element type. With a plain `<T>` the body cannot compare anything: the compiler knows only that a `T` is an `Object`, so `a.compareTo(b)` does not compile. The pre-generics answer was to take `List<Comparable>` and cast, which accepts a list mixing dates and strings and fails at run time. The obvious generic answer, `<T extends Comparable<T>>`, compiles, and then rejects the first `List<LocalDate>` a caller passes. A bound has to say exactly what the body needs from `T`: enough to call the methods it uses, and no more than the callers' types can satisfy.

### Mental model

A bound is a job requirement on a blank. "`T extends Number`" reads "any type, as long as it is a kind of number". Inside the method you may rely on everything the requirement guarantees, and nothing else. A requirement that is too loose leaves the body unable to do its work. One that is too strict turns away qualified candidates, which is what `Comparable<T>` does to `LocalDate`: a date can be compared, but with any date of any calendar system, not only with a `LocalDate`.

### How it actually works

**Upper bounds.** Every type variable has a bound, and `Object` is assumed when none is declared. The bound decides which members the body can use: the members of `T` are those of its bound. It also restricts the callers, whose type argument must be a subtype of the bound [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4). In the lab, calling `doubleValue()` on an unbounded `T` does not compile and the same body with `<T extends Number>` does, while passing a `List<String>` to that method is rejected at the call [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java). The keyword is `extends` for interfaces as well as classes.

**Multiple bounds.** A bound may list several types joined by `&`: `<T extends Number & Comparable<T>>`. At most one of them is a class, and it must come first; the rest must be interfaces. The body sees the members of all of them, as an intersection type [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4) [Doc: JLS §4.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.9). In the lab, `Comparable<T> & Number` is a compile error and `Number & Comparable<T>` compiles [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java).

**Order matters for one more reason.** The specification says the order of a bound's types is significant in two ways only: a class may appear only first, and "the erasure of a type variable is determined by the first type in its bound" [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4) [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6). Erasure, covered in [§5](#5-type-erasure-and-bridge-methods), is what remains of a generic signature in the compiled method. Reflection shows both sides. The declared bounds of `clamp` are still readable, `Number` then `Comparable<T>`. Its erased signature takes and returns `Number`; `max`, bounded by `Comparable<? super T>`, returns `Comparable`; and an unbounded `T` returns `Object` [Lab: BoundReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java). This is why the JDK declares `Collections.max` with `<T extends Object & Comparable<? super T>>`: the leading `Object` makes the erased return type `Object` instead of `Comparable` [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). [§8](#8-reading-generic-signatures-in-the-jdk) reads that signature in full.

**Recursive bounds.** A bound may mention the variable it bounds. `<T extends Comparable<T>>` says "a type that can be compared with itself", and `Enum` is declared `Enum<E extends Enum<E>>`, so that the methods an enum inherits, such as `compareTo(E)`, are typed with the concrete enum [Src: JDK 25, java.lang.Enum](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Enum.java) [Lab: BoundReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java).

**Why `Comparable<? super T>` is the robust form.** `Comparable<T>` is satisfied only by a type that implements `Comparable` of exactly itself. A class that inherits its ordering does not. `LocalDate` implements `ChronoLocalDate`, which extends `Comparable<ChronoLocalDate>`, and `java.sql.Timestamp` extends `java.util.Date`, which implements `Comparable<Date>` [Src: JDK 25, java.time.chrono.ChronoLocalDate](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/time/chrono/ChronoLocalDate.java) [Src: JDK 25, java.util.Date](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Date.java). So a `LocalDate` is a `Comparable<ChronoLocalDate>`, not a `Comparable<LocalDate>`. `? super T` is a wildcard, a type argument that stands for an unknown type, here "`T` or one of its supertypes"; [§4](#4-wildcards-pecs-and-variance) covers wildcards. The bound `Comparable<? super T>` therefore asks only for what the body needs: something that can compare a `T`. In the lab, `max` over a `List<LocalDate>` or a `List<Timestamp>` does not compile with the strict bound; with the wildcard the `List<LocalDate>` call compiles and returns the latest date [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java) [Lab: BoundsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundsTest.java).

**No lower bounds on type parameters.** The grammar of a type parameter allows only `extends`. `<T super Integer>` is a syntax error; `super` exists only on wildcards [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4) [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java).

### Code

`Bounds` has one method per kind of bound.

1. `sum` needs `doubleValue()`, so it bounds `T` by `Number`.
2. `clamp` needs `compareTo` too, so it adds `Comparable<T>` after the class bound.
3. `max` needs only to compare, and uses `Comparable<? super T>` so that types with an inherited ordering qualify. It starts from `iterator.next()`, so an empty list throws `NoSuchElementException`.

```java
package dev.interview.javalanguage.m03.s03;

import java.util.Iterator;
import java.util.List;

// Module 03 §3: one method per kind of bound. The bound is what lets each body call a method on a T.
public final class Bounds {

    private Bounds() {}

    public static <T extends Number> double sum(List<T> values) {
        double total = 0.0;
        for (T value : values) {
            total += value.doubleValue();
        }
        return total;
    }

    public static <T extends Number & Comparable<T>> T clamp(T value, T low, T high) {
        if (value.compareTo(low) < 0) {
            return low;
        }
        if (value.compareTo(high) > 0) {
            return high;
        }
        return value;
    }

    public static <T extends Comparable<? super T>> T max(List<T> values) {
        Iterator<T> iterator = values.iterator();
        T best = iterator.next();
        while (iterator.hasNext()) {
            T candidate = iterator.next();
            if (candidate.compareTo(best) > 0) {
                best = candidate;
            }
        }
        return best;
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s03/Bounds.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s03/Bounds.java)</sub>

The strict and the robust bound, compiled against the same callers (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java
    private static final String STRICT_MAX = "static <T extends Comparable<T>> T max(List<T> v) { return v.get(0); }";
    private static final String SUPER_MAX =
            "static <T extends Comparable<? super T>> T max(List<T> v) { return v.get(0); }";
    private static final String MAX_OF_DATES =
            "java.time.LocalDate run(List<java.time.LocalDate> dates) { return max(dates); }";
    private static final String MAX_OF_TIMESTAMPS =
            "java.sql.Timestamp run(List<java.sql.Timestamp> stamps) { return max(stamps); }";

            "M03 §3 · max(List<LocalDate>) fails with <T extends Comparable<T>> and compiles with Comparable<? super T>")
    void compile_succeedsOnlyWithSuperWildcard_whenElementInheritsItsComparable() {
        assertThat(compile(STRICT_MAX + MAX_OF_DATES).errorCodes()).contains(CANNOT_APPLY);
```

What reflection sees: the declared bounds, and the erased signature (excerpt).

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java
    @Test
    @DisplayName("M03 §3 · a type variable's bounds are visible by reflection")
    void getBounds_returnsNumberThenComparable_whenTypeVariableHasTwoBounds() throws NoSuchMethodException {
        Type[] bounds = clamp().getTypeParameters()[0].getBounds();

        assertThat(bounds).hasSize(TWO_BOUNDS);
        assertThat(bounds[0]).isEqualTo(Number.class);
        assertThat(bounds[1]).isInstanceOf(ParameterizedType.class);
        assertThat(((ParameterizedType) bounds[1]).getRawType()).isEqualTo(Comparable.class);
    }

    @Test
    @DisplayName("M03 §3 · a bounded type variable erases to its leftmost bound")
    void getReturnType_returnsLeftmostBound_whenReturnTypeIsATypeVariable() throws NoSuchMethodException {
        Method max = Bounds.class.getMethod(MAX, List.class);
        Method firstOr = Elements.class.getMethod(FIRST_OR, List.class, Object.class);

        assertThat(clamp().getReturnType()).isEqualTo(Number.class);
        assertThat(clamp().getParameterTypes()).containsOnly(Number.class);
        assertThat(max.getReturnType()).isEqualTo(Comparable.class);
        assertThat(firstOr.getReturnType()).isEqualTo(Object.class);
    }

    private static Method clamp() throws NoSuchMethodException {
        return Bounds.class.getMethod(CLAMP, Number.class, Number.class, Number.class);
    }
```

### Failure modes and operations

Bounds are checked entirely at compile time, so there is nothing to observe under load. The one operational consequence is at deployment, for a library: because a type variable erases to its first bound, changing the first bound of a method's type parameter can change the erased signature of the method, and the specification notes that "this may affect binary compatibility" [Doc: JLS §13.4.13](https://docs.oracle.com/javase/specs/jls/se25/html/jls-13.html#jls-13.4.13). Callers compiled against the old version were compiled against the old erased signature, so treat such a change as one that may require recompiling them. The lab shows how visible the difference is: `max` returns `Comparable` after erasure, where the JDK's `Collections.max` keeps `Object` by listing it first [Lab: BoundReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java) [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java).

### Best practices and anti-patterns

- Bound a type parameter by the smallest type whose methods the body calls, because every extra requirement excludes callers for no benefit.
- Write `<T extends Comparable<? super T>>` instead of `<T extends Comparable<T>>` for anything that sorts or compares, because classes such as `LocalDate` and `Timestamp` inherit their `Comparable` from a supertype and fail the strict form.
- Put the class first in a multiple bound and treat that position as part of the method's binary signature, because the first bound is what the type variable erases to.
- Do not change the first bound of a public generic method in a released library without treating it as a breaking change, because the erased signature that compiled callers link against may change.
- Prefer a bound to a cast inside the body, because a bound is checked at every call site at compile time, and a cast is checked at run time or not at all.
- Reach for a recursive bound only when a method must return or accept the caller's own subtype (a comparable value, a fluent builder), because the signature is harder to read than the plain form.

### Misconceptions and traps

- *"`extends` in a bound means the type argument must be a subclass."* In a bound, `extends` means "is a subtype of", for classes and interfaces alike: the grammar has no `implements` form [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4). The myth comes from class declarations, where `extends` and `implements` are different keywords.
- *"`<T extends Comparable<T>>` works for every comparable type."* It fails for any type whose `Comparable` is declared on a supertype [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java). It looks sufficient because `String`, `Integer` and enums, the types most examples use, implement `Comparable` of themselves.
- *"The order of bounds is cosmetic."* It decides the erased type, and it is constrained: a class can only come first [Lab: BoundReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java). The belief exists because the source-level meaning, "all of these", does not depend on order.
- *"If wildcards have `super`, type parameters must have it too."* `<T super X>` is not in the grammar [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java). The symmetry is expected because `? extends` and `? super` are taught as a pair.

Questions that drill this section: [Q03.07](#q03-07), [Q03.08](#q03-08), [Exercise 03.2](#ex03-2).

## 4. Wildcards, PECS and variance
### The problem it solves

A billing module has `double total(List<Number> amounts)`. A caller holding a `List<Integer>` cannot pass it: the call does not compile, although every `Integer` is a `Number`. The usual workaround is to copy the list into a new `ArrayList<Number>` on every call, and the usual wrong fix is to drop the type argument and go back to a raw `List`. Arrays do not have this problem, since an `Integer[]` can be passed as a `Number[]`, and that convenience is paid for with an exception at run time. Wildcards are how a signature says "a list of some kind of number" and keeps the compile-time check.

### Mental model

Think of a typed container by what flows through it. A list you only take things out of is a producer: if it is declared to produce numbers, a box of integers will do. A list you only put things into is a consumer: if you want to drop integers in, a box labelled "numbers" or "objects" will do. A list you both read and write must match exactly, because each direction rules out one kind of substitution. The mnemonic is PECS, "producer `extends`, consumer `super`", from Joshua Bloch's *Effective Java*.

```mermaid
flowchart BT
    LI["List of Integer"] --> LEI["List of ? extends Integer"]
    LEI --> LEN["List of ? extends Number"]
    LN["List of Number"] --> LEN
    LEN --> LQ["List of ?"]
    LN --> LSI["List of ? super Integer"]
    LO["List of Object"] --> LSI
    LI --> LSI
    LSI --> LQ
```

What to notice: every arrow reads "is a subtype of", and there is no arrow between `List<Integer>` and `List<Number>`. The two are related only through a wildcard type above them.

### How it actually works

**Invariance.** `List<Integer>` is not a subtype of `List<Number>`. If it were, code holding the list as a `List<Number>` could add a `Double` to it, and the owner of the `List<Integer>` would later read that `Double` as an `Integer`. Generic types are therefore invariant: `List<A>` and `List<B>` are unrelated unless `A` and `B` are the same type. In the lab the assignment is a compile error [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java).

**Arrays chose the other way.** Arrays are covariant: when `S` is a subtype of `T`, `S[]` is a subtype of `T[]` [Doc: JLS §4.10.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.3). The unsafe write is therefore legal at compile time, and the language catches it at run time instead: every assignment to a component of a reference array is checked, and a value that is not assignable to the array's real component type throws `ArrayStoreException` [Doc: JLS §10.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.5). In the lab, storing an `Integer` through an `Object[]` view of a `String[]` throws, and the array is unchanged [Lab: VarianceTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java). A list cannot make that check, because its element type is erased ([§5](#5-type-erasure-and-bridge-methods)), so the compiler has to forbid the assignment.

**Wildcards.** A wildcard is a type argument written `?`, which stands for one unknown type, optionally with a bound. "Wildcards are useful in situations where only partial knowledge about the type parameter is required", and `?` alone is equivalent to `? extends Object` [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1). What you can do through each form follows from what is known about the unknown type:

| Type | Accepts | Reading gives | Writing accepts |
|---|---|---|---|
| `List<? extends Number>` | `List<Number>`, `List<Integer>`, `List<Double>`, … | `Number` | only `null` |
| `List<? super Integer>` | `List<Integer>`, `List<Number>`, `List<Object>` | `Object` | `Integer` |
| `List<?>` | any `List` | `Object` | only `null` |

Each cell is compiled in the lab: `add(1)` and `add` of a `Number` on a `List<? extends Number>` are errors while `add(null)` and a read into `Number` compile; a `List<? super Integer>` takes an `Integer` and gives back an `Object`, rejects a `Number`, and cannot be assigned a `List<Double>`; a `List<String>` can be assigned to a `List<?>` and not to a `List<Object>` [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java). The reasons are symmetrical. With `? extends Number` the list might be a `List<Double>`, so no particular number is safe to add. With `? super Integer` the list might be a `List<Object>`, so nothing more specific than `Object` is safe to assume on a read.

**Why the diagram has those arrows.** A parameterized type `C<T>` is a subtype of `C<S>` when the type argument `S` contains `T`. The containment rules are short: `T` is contained by `? extends T` and by `? super T`; `? extends T` is contained by `? extends S` when `T` is a subtype of `S`; `? super T` is contained by `? super S` when `S` is a subtype of `T`; and everything is contained by `?` [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1) [Doc: JLS §4.10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.2). The `super` rule runs in the opposite direction, which is why `? super` is called contravariant and `? extends` covariant.

**PECS in the JDK.** `Collections.copy` is declared `<T> void copy(List<? super T> dest, List<? extends T> src)`: the source produces `T`s, the destination consumes them, so one call can copy a `List<Integer>` into a `List<Number>`. `Collections.addAll(Collection<? super T> c, T... elements)` has the consumer half [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). The Java Tutorials state the same rule as "in" and "out" variables, and add two limits: when a variable is both read and written, use no wildcard, and avoid a wildcard as a return type, "because it forces programmers using the code to deal with wildcards" [Doc: The Java Tutorials, Guidelines for Wildcard Use](https://docs.oracle.com/javase/tutorial/java/generics/wildcardGuidelines.html). The collections API itself belongs to [04](04-java-collections-internals.md).

**Wildcard capture.** When the compiler types an expression of type `List<?>`, it replaces the wildcard with a fresh type variable; this is capture conversion [Doc: JLS §5.1.10](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.10). Two mentions of the same list are captured separately, so the compiler cannot see that an element read from the list may be written back to it: in the lab, `list.set(0, list.get(1))` on a `List<?>` does not compile. Passing the list to a private generic method fixes it, because inside that method the unknown type has one name, `E` [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java). The JDK's own `Collections.swap(List<?>, int, int)` takes the other route, a raw type under `@SuppressWarnings`, with a comment noting that capturing the wildcard would need a supplementary private method [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java).

**`List<?>`, `List<Object>` and raw `List`.** `List<?>` is a list of one unknown type: any list can be passed, and nothing but `null` can be added. `List<Object>` is a list that accepts any object, and only a `List<Object>` can be passed [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java). A raw `List` accepts both and checks neither ([§1](#1-why-generics-compile-time-safety-and-raw-types)). [Q03.12](#q03-12) compares the three line by line.

### Code

`Transfers` has one signature per role.

1. `total` only reads, so its parameter is a producer: `List<? extends Number>`.
2. `fillWithOnes` only writes `Integer`s, so its parameter is a consumer: `List<? super Integer>`.
3. `appendAll` does both, on two different lists, and ties them with one type parameter `T`.
4. `swapFirstTwo` needs no element type in its signature, so it takes `List<?>` and hands the list to a private helper that names the captured type.

```java
package dev.interview.javalanguage.m03.s04;

import java.util.List;

// Module 03 §4: one signature per wildcard role: a producer, a consumer, both at once, and an unbounded list.
public final class Transfers {

    private static final Integer ONE = 1;
    private static final int PAIR = 2;

    private Transfers() {}

    public static double total(List<? extends Number> numbers) {
        double total = 0.0;
        for (Number number : numbers) {
            total += number.doubleValue();
        }
        return total;
    }

    public static void fillWithOnes(List<? super Integer> sink, int count) {
        for (int added = 0; added < count; added++) {
            sink.add(ONE);
        }
    }

    public static <T> void appendAll(List<? super T> destination, List<? extends T> source) {
        for (T element : source) {
            destination.add(element);
        }
    }

    public static void swapFirstTwo(List<?> list) {
        if (list.size() < PAIR) {
            return;
        }
        swapFirstTwoCaptured(list);
    }

    // The helper gives the unknown element type a name, E, so a value read from the list can be written back.
    private static <E> void swapFirstTwoCaptured(List<E> list) {
        E first = list.get(0);
        list.set(0, list.get(1));
        list.set(1, first);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s04/Transfers.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s04/Transfers.java)</sub>

The array store check, and what a `? extends` list still allows (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java
    private static final int FIRST = 0;
    private static final String A = "a";
    private static final int ONE = 1;
    private static final int TWO = 2;
    private static final int SIZE_AFTER_ADDING_NULL = 3;
    private static final int SIZE_AFTER_REMOVE = 2;

    @Test
    @DisplayName("M03 §4 · storing an Integer through an Object[] view of a String[] throws ArrayStoreException")
    void arrayStore_throwsArrayStoreException_whenIntegerIsStoredThroughObjectArrayView() {
        String[] names = {A};
        Object[] view = names;

        assertThatThrownBy(() -> view[FIRST] = ONE).isInstanceOf(ArrayStoreException.class);
        assertThat(names[FIRST]).isEqualTo(A);
    }

    @Test
    @DisplayName("M03 §4 · a List<? extends Number> still allows null, remove and clear")
    void extendsWildcardList_allowsNullRemoveAndClear_whenAccessedThroughTheWildcardType() {
        List<? extends Number> view = new ArrayList<>(List.of(ONE, TWO));

        view.add(null);
        int sizeAfterAddingNull = view.size();
        view.remove(FIRST);
        int sizeAfterRemove = view.size();
        view.clear();

        assertThat(sizeAfterAddingNull).isEqualTo(SIZE_AFTER_ADDING_NULL);
        assertThat(sizeAfterRemove).isEqualTo(SIZE_AFTER_REMOVE);
        assertThat(view).isEmpty();
    }
```

Invariance and the `? extends` write rule, each as a rejected source next to an accepted one (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java
    private static final String LIST_OF_INTEGER_AS_LIST_OF_NUMBER =
            "void run(List<Integer> ints) { List<Number> nums = ints; }";
    private static final String LIST_OF_INTEGER_AS_EXTENDS_NUMBER =
            "void run(List<Integer> ints) { List<? extends Number> nums = ints; }";
    private static final String INTEGER_ARRAY_AS_NUMBER_ARRAY = "void run(Integer[] ints) { Number[] nums = ints; }";
    private static final String EXTENDS_ADD_INTEGER = "void run(List<? extends Number> nums) { nums.add(1); }";
    private static final String EXTENDS_ADD_NUMBER =
            "void run(List<? extends Number> nums) { Number n = 1; nums.add(n); }";
    private static final String EXTENDS_ADD_NULL_AND_READ =
            "void run(List<? extends Number> nums) { nums.add(null); Number n = nums.get(0); }";

    @Test
    @DisplayName("M03 §4 · List<Integer> is not assignable to List<Number>")
    void compile_rejectsListOfNumber_whenAssignedAListOfInteger() {
        assertThat(compile(LIST_OF_INTEGER_AS_LIST_OF_NUMBER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(LIST_OF_INTEGER_AS_EXTENDS_NUMBER).success()).isTrue();
        assertThat(compile(INTEGER_ARRAY_AS_NUMBER_ARRAY).success()).isTrue();
    }

    @Test
    @DisplayName("M03 §4 · add on List<? extends Number> does not compile")
    void compile_rejectsAdd_whenListTypeIsAnExtendsWildcard() {
        assertThat(compile(EXTENDS_ADD_INTEGER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(EXTENDS_ADD_NUMBER).errorCodes()).contains(INCOMPATIBLE_TYPES);
        assertThat(compile(EXTENDS_ADD_NULL_AND_READ).success()).isTrue();
    }
```

### Failure modes and operations

Wildcard rules are enforced at compile time, so the run-time failure in this section belongs to arrays: covariance moves the type error to the store, as an `ArrayStoreException` thrown at the assignment, and every store into a reference array carries that check [Doc: JLS §10.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.5) [Lab: VarianceTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java). What to observe is the exception itself: its stack trace points at the bad write, unlike the delayed `ClassCastException` of [§1](#1-why-generics-compile-time-safety-and-raw-types).

The cost of getting wildcards wrong shows up in the callers instead. A parameter declared `List<Number>` rejects a `List<Integer>` [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java), so each caller converts its list before the call, which allocates and copies in proportion to the list's size on every request. Nothing fails; the code is slower and noisier than the signature required. [Q03.13](#q03-13) is that incident.

### Best practices and anti-patterns

- Declare a parameter you only read as `? extends T` and one you only write as `? super T`, because that accepts every argument the body can safely use.
- Use no wildcard on a parameter that is both read and written, because each wildcard removes one of the two directions.
- Do not return a wildcard type from a public method, because every caller then has to carry the wildcard in its own variables.
- Use `List<?>` when the method needs nothing but `Object`'s methods, `size()` or iteration, because it accepts any list and still forbids inserting the wrong element.
- Use a private generic helper to capture a wildcard, because the public signature stays simple and the body gets a named type with no unchecked warning.
- Prefer a `List<T>` to a `T[]` in a generic API, because the list's type error is a compile error and the array's is an `ArrayStoreException`.
- Do not treat `List<? extends T>` as an immutable view, because `remove`, `clear` and `add(null)` still compile and run; use `List.copyOf` or `Collections.unmodifiableList` when you mean read-only ([02 §5](02-java-equality-immutability-records.md#5-immutability)).

### Misconceptions and traps

- *"`List<Integer>` is a `List<Number>`, because an `Integer` is a `Number`."* Generic types are invariant; the two lists are related only through `List<? extends Number>` [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java). The intuition comes from arrays, where `Integer[]` is a `Number[]`.
- *"`List<? extends Number>` is read-only."* It only blocks adding a non-null element. In the lab `add(null)`, `remove(0)` and `clear()` all run through such a reference [Lab: VarianceTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java), and the Java Tutorials call the read-only reading "not a strict guarantee" [Doc: The Java Tutorials, Guidelines for Wildcard Use](https://docs.oracle.com/javase/tutorial/java/generics/wildcardGuidelines.html). The myth exists because `add` is the first method anyone tries.
- *"`? super T` is for reading `T`s."* It is the reverse: a `List<? super Integer>` accepts `Integer`s and gives back `Object`s. The confusion comes from reading `super` as "a supertype comes out", when it describes what may go in.
- *"`List<?>` and `List<Object>` are the same."* `List<?>` accepts any list and almost no writes; `List<Object>` accepts any element and only one kind of list. The names look alike because both mention "anything".

Questions that drill this section: [Q03.09](#q03-09), [Q03.10](#q03-10), [Q03.11](#q03-11), [Q03.12](#q03-12), [Q03.13](#q03-13), [Exercise 03.2](#ex03-2).

## 5. Type erasure and bridge methods
### The problem it solves

A `List<String>` and a `List<Integer>` are different types to the compiler and the same class to the JVM. That one fact explains most of the "why can't I write…" questions about generics. You can't write `new T()`, `T.class` or a `static T` field. Two overloads that differ only in a type argument don't compile. A class that implements `Comparable<Money>` ends up with two `compareTo` methods. And a raw call can still fail with a `ClassCastException` inside a method you never wrote. Each of these follows from erasure, and a developer who knows the mechanism can predict them instead of memorizing them.

### Mental model

javac is the only part of the toolchain that sees type arguments. It checks every use of them, then writes the class file as if you had written the pre-generics code by hand: raw types, a cast wherever a value of a type variable is used as a concrete type, and an extra method wherever an override would otherwise not line up after erasure. The JVM runs that hand-written-looking code. What javac keeps for later readers is a description of the *declarations*, not a label on each object.

```mermaid
flowchart LR
    S["Source: Money implements Comparable of Money<br/>compareTo(Money)"] --> J["javac: check types, then erase"]
    J --> M["Class file: compareTo(Money)"]
    J --> B["Class file: bridge compareTo(Object)<br/>ACC_BRIDGE, ACC_SYNTHETIC"]
    B -->|"checkcast Money, then invokevirtual"| M
```

What to notice: the interface's method erases to `compareTo(Object)`, so only the bridge actually overrides it at run time. The bridge's cast is the run-time check that the type argument no longer provides.

### How it actually works

**The erasure rules.** The erasure of a parameterized type `G<T1,…,Tn>` is the raw `G`. The erasure of a type variable "is the erasure of its leftmost bound". An array erases to an array of the erased element type, and every other type erases to itself. Erasure also maps each method and constructor signature "to a signature that has no parameterized types or type variables" [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6). That is why the first bound of [§3](#3-bounded-type-parameters) decides the erased type. Where an erased value is used at its real type, javac inserts a cast: the JLS lists "an automatically generated cast introduced to ensure the validity of an operation on a non-reifiable type" among the casts that can fail at run time [Doc: JLS §15.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.5).

**One class for every parameterization.** A generic class defines one parameterized type per type argument, and "all of these parameterized types share the same class at run time" [Doc: JLS §8.1.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.2). In the lab, `new ArrayList<String>().getClass()` and `new ArrayList<Integer>().getClass()` are the same object, `ArrayList.class` [Lab: ErasureTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureTest.java). For the same reason a static field belongs to the one class, not to a parameterization, so its type can't mention the class's `T`. A type parameter used in a static context is a compile-time error [Doc: JLS §6.5.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.5.1), and in the lab `static T shared;` fails with `compiler.err.non-static.cant.be.ref` while an instance field `T own;` compiles [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java).

**What the class file keeps.** A `Signature` attribute on a class, field, method or record component "stores a signature … whose declaration in the Java programming language uses type variables or parameterized types" [Doc: JVMS §4.7.9](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.7.9). Reflection reads it. The lab's `Ledger` field `entries` has the erased type `List` from `getType()`, while `getGenericType()` on the field and `getGenericReturnType()` on its accessor both return the parameterized type `List<Money>` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). What no attribute records is the type argument of a particular object: a `new ArrayList<Money>()` assigned to a local variable carries nothing that says `Money`. [§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens) builds on the declared signatures to recover that argument when it is needed.

**`instanceof` and erased types.** The operand of `instanceof` "must be checked cast compatible" with the type [Doc: JLS §15.20.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.20.2), which means the cast to it must not be an unchecked one [Doc: JLS §5.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.5). From an `Object`, nothing at run time can confirm the `String` in `List<String>`, so `o instanceof List<String>` is rejected with `compiler.err.instanceof.reifiable.not.safe`. `o instanceof List<?>` asks only about the class and compiles. From a `List<String>`, `l instanceof ArrayList<String>` (and its pattern form) compiles too, because the type argument is already known statically and only the class remains to be checked [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java). The types that can always be tested this way are the *reifiable* types of [§6](#6-reifiable-types-generic-arrays-and-heap-pollution).

**No `new T()`, no `T.class`.** After erasure the method body has no class for `T` to instantiate or name. `new T()` fails with `compiler.err.type.found.req` (a class is required), and `T.class` fails with `compiler.err.type.var.cant.be.deref`. The usual fix is to pass the class in, as a `Class<T>` token, and that version compiles [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java). Tokens are the subject of §7.

**Bridge methods.** `Comparable<T>` declares `compareTo(T)`, whose erasure is `compareTo(Object)`. `Money` declares `compareTo(Money)`. In source that is an override. In the class file the two have different descriptors, `(Ljava/lang/Object;)I` against one that takes `Money` (see the `javap` output below), so javac adds a method with the interface's descriptor: `compareTo(Object)`, flagged `ACC_BRIDGE` ("a bridge method, generated by the compiler") and `ACC_SYNTHETIC` ("not present in the source code") [Doc: JVMS §4.6](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.6). Its body casts the argument to `Money` and calls the real method. The lab finds exactly one such method on `Money`, with `isBridge()` and `isSynthetic()` both true, while the declared `compareTo(Money)` has neither flag. A raw `Comparable` call with a `String` goes through the bridge, and the bridge's cast throws `ClassCastException` naming `Money` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java) [Lab: ErasureTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureTest.java).

**Overloads that clash after erasure.** "A class cannot have two member methods with the same name and type erasure" [Doc: JLS §8.4.8.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3), and constructors follow the same rule [Doc: JLS §8.8.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.2). `process(List<Order>)` and `process(List<Invoice>)` both erase to `process(List)`, so the second declaration fails with `compiler.err.name.clash.same.erasure`. Overloads whose erased types differ, such as `process(List<Order>)` and `process(Set<Invoice>)`, compile [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java). The fix is a different method name, which also reads better at the call site.

### Code

`Money` is an ordinary record. The interesting part is what javac adds to it.

```java
package dev.interview.javalanguage.m03.s05;

// Module 03 §5: implementing Comparable<Money> makes javac emit a bridge compareTo(Object) that casts and delegates.
public record Money(long cents) implements Comparable<Money> {

    @Override
    public int compareTo(Money other) {
        return Long.compare(cents, other.cents);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s05/Money.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s05/Money.java)</sub>

`javap -v -p` on the lab's compiled `Money` (JDK 25) shows the bridge, its flags and its two-step body:

```text
  public int compareTo(java.lang.Object);
    descriptor: (Ljava/lang/Object;)I
    flags: (0x1041) ACC_PUBLIC, ACC_BRIDGE, ACC_SYNTHETIC
    Code:
         0: aload_0
         1: aload_1
         2: checkcast     #8                  // class dev/interview/javalanguage/m03/s05/Money
         5: invokevirtual #19                 // Method compareTo:(Ldev/interview/javalanguage/m03/s05/Money;)I
         8: ireturn
```

The reflection test finds the bridge by name and flag, never by position, because `getDeclaredMethods` returns methods in no particular order (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java
    @Test
    @DisplayName("M03 §5 · a Comparable<Money> implementation has a bridge compareTo(Object)")
    void money_declaresSyntheticBridge_whenItImplementsComparableOfMoney() throws NoSuchMethodException {
        List<Method> bridges = bridgesNamed(COMPARE_TO);
        Method declared = Money.class.getDeclaredMethod(COMPARE_TO, Money.class);

        assertThat(bridges).singleElement().satisfies(bridge -> {
            assertThat(bridge.isSynthetic()).isTrue();
            assertThat(bridge.getParameterTypes()).containsExactly(Object.class);
        });
        assertThat(declared.isBridge()).isFalse();
        assertThat(declared.isSynthetic()).isFalse();
    }
```

The `instanceof` rule, as a rejected source beside two accepted ones (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java
    private static final String INSTANCEOF_LIST_OF_STRING =
            "boolean test(Object o) { return o instanceof List<String>; }";
    private static final String INSTANCEOF_LIST_OF_UNBOUNDED =
            "boolean test(Object o) { return o instanceof List<?>; }";
    private static final String INSTANCEOF_ARRAY_LIST_FROM_LIST = """
            boolean test(List<String> l) { return l instanceof ArrayList<String>; }
            int size(List<String> l) { return l instanceof ArrayList<String> a ? a.size() : 0; }
            """;
```

### Failure modes and operations

- **Reflection sees the bridge.** Code that scans `getDeclaredMethods()` for handlers, getters or annotated methods meets both `compareTo(Money)` and the synthetic `compareTo(Object)` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). A scanner that does not skip `isBridge()` methods registers one logical method twice. [Q03.18](#q03-18) is that incident in an event dispatcher.
- **A raw call reaches the bridge's cast.** Legacy code that holds a `Money` as a raw `Comparable` compiles with only an unchecked warning ([§1](#1-why-generics-compile-time-safety-and-raw-types)). The wrong argument then fails inside a method that appears nowhere in the source, with a `ClassCastException` whose message names the target class [Lab: ErasureTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureTest.java).
- **A late overload breaks the build.** Adding `process(List<Invoice>)` next to an existing `process(List<Order>)` fails with a name clash [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java). In a published library the rename that fixes it changes the API, so the name is best chosen when the first overload is written.
- **What to observe:** `javap -p` lists bridge methods, and `javap -v` shows their `ACC_BRIDGE` flag and each `Signature` attribute. In code, `Method.isBridge()` tells the two `compareTo` methods apart.

> [!NOTE]
> **Framework vs language.** javac decides that a bridge exists and writes the `Signature` attributes. The JVM only runs the bridge like any other method, and core reflection reports what the class file contains. Spring adds `org.springframework.core.BridgeMethodResolver`, a "helper for resolving synthetic bridge Methods to the Method being bridged" [Src: Spring Framework 7.0.10, BridgeMethodResolver](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/BridgeMethodResolver.java). Its Javadoc recommends finding the bridged method before looking up annotations, so they are read from the method you wrote. In the lab, `findBridgedMethod` maps `Money`'s bridge back to `compareTo(Money)` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). Plain Java code gets the same effect by filtering on `isBridge()`.

> [!NOTE]
> **Version notes.** Java 5: generics, erasure and bridge methods, unchanged in their core since. Java 16: `instanceof` accepts a non-reifiable type when the cast to it is checked, as in `list instanceof ArrayList<String>`. Up to Java 15 the type after `instanceof` had to be reifiable [Doc: JLS 15 §15.20.2](https://docs.oracle.com/javase/specs/jls/se15/html/jls-15.html#jls-15.20.2), and JDK 25's javac with `--release 15` still rejects that line as a feature not supported in source 15.

### Best practices and anti-patterns

- Skip `isBridge()` methods in any reflective scan of a class's own methods, because otherwise every generic override is seen twice.
- Pass a `Class<T>` (or a type token, §7) when a generic method needs to create, check or name its type at run time, because nothing in the erased body can do it.
- Give overloads that differ only in a type argument different names (`processOrders`, `processInvoices`), because they cannot coexist after erasure and the names read better anyway.
- Test with `instanceof List<?>` (or a pattern on a statically known `List<String>`) and never cast to `List<String>` from `Object`, because that cast is unchecked and defers the failure to a later read.
- Keep generic static state keyed by `Class<?>` (a `Map<Class<?>, …>`) rather than expecting one static field per parameterization, because there is only one class.
- Read `getGenericType()` and `getGenericReturnType()`, not `getType()`, when a framework needs declared type arguments, because only the generic variants read the `Signature` attribute.

### Misconceptions and traps

- *"Generic type information is completely gone at run time."* The declared types of classes, fields, methods and parameters stay in the `Signature` attribute and are readable by reflection [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). Only the type arguments of individual objects are erased. The myth comes from `getClass()`, which is indeed the same for every parameterization.
- *"Bridge methods are a JVM feature."* The JVMS defines only the flag that marks "a bridge method, generated by the compiler" [Doc: JVMS §4.6](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.6). javac decides to emit the method and writes its body. The confusion comes from seeing bridges in stack traces and reflection, which look like run-time artifacts.
- *"`instanceof` never works with a parameterized type."* It works whenever the check is safe: `List<?>` always, and `ArrayList<String>` from a `List<String>` since Java 16 [Lab: ErasureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureCompileRulesTest.java). The rule people remember is the pre-16 one.
- *"Each `Box<String>` and `Box<Integer>` has its own static fields."* There is one class, so there is one set of static fields, and a static member cannot even use `T` [Doc: JLS §6.5.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.5.1). The intuition comes from C++ templates, which generate a separate class per instantiation.

Questions that drill this section: [Q03.14](#q03-14), [Q03.15](#q03-15), [Q03.16](#q03-16), [Q03.17](#q03-17), [Q03.18](#q03-18).

## 6. Reifiable types, generic arrays and heap pollution
### The problem it solves

Arrays and generics were designed with opposite rules. An array knows its component type at run time and checks every store ([§4](#4-wildcards-pecs-and-variance)). A generic type forgets its arguments at run time and relies on the compiler ([§5](#5-type-erasure-and-bridge-methods)). Where the two meet you get generic arrays and varargs of a generic type, and there the compiler's guarantee can break without any raw type in sight. That is why `new T[n]` is illegal, why `ArrayList` keeps an `Object[]`, and why a method declared `<T> T[] toArray(T... items)` can hand a caller an array that is not what its type says.

### Mental model

Sort types into two groups by one question: can the run time check it? A *reifiable* type is one whose whole description exists at run time, such as `String`, `int`, a raw `List`, `List<?>` or `String[]`. A non-reifiable type has parts that only the compiler knew, such as `T`, `List<String>` or `List<String>[]`. An array needs a reifiable component type, because the array has to carry that type and enforce it. When code dresses an `Object[]` up as a `T[]`, it works only while nobody outside sees through the costume.

### How it actually works

**Reifiable types.** The JLS lists them: a non-generic class or interface type, a parameterized type whose type arguments are all unbounded wildcards, a raw type, a primitive type, an array whose element type is reifiable, and a nested type whose parts are all reifiable [Doc: JLS §4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.7). An array creation expression whose element type is not reifiable is a compile-time error [Doc: JLS §15.10.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10.1). In the lab `new T[n]` and `new List<String>[3]` both fail with `compiler.err.generic.array.creation`, and `new List<?>[3]` compiles [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java). If `new List<String>[3]` were allowed, an `Object[]` view of it could store a `List<Integer>`, and the store check would pass, because at run time the array only knows `List`.

**How `ArrayList<E>` stores its elements.** It does not create an `E[]`. Its field is `transient Object[] elementData`, and its accessor casts one element at a time: `E elementData(int index) { return (E) elementData[index]; }` [Src: JDK 25, java.util.ArrayList](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/ArrayList.java). The `(E)` cast erases to nothing, and the real check is the cast javac inserts at the caller that reads a `String` ([§5](#5-type-erasure-and-bridge-methods)). When the array passed to its `toArray(T[] a)` is too small, it allocates a new one of `a.getClass()`, so the caller's array supplies the real component type.

**`(T[]) new Object[n]`: safe inside, unsafe outside.** Generic code that wants an array of `T` usually writes `(T[]) new Object[n]` under `@SuppressWarnings("unchecked")`. Inside the class this works, because `T[]` erases to `Object[]` and every element that goes in is a `T`. The lab's `SnapshotBuffer<T>` does exactly that, and `get(0)` on a `SnapshotBuffer<String>` returns its `String` normally. The trouble starts when the array itself escapes. `snapshot()` returns a copy whose run-time type is still `Object[]`, so the caller's `String[] s = buffer.snapshot()` throws `ClassCastException`: "class [Ljava.lang.Object; cannot be cast to class [Ljava.lang.String;" [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). The exception is thrown in the caller, on a line with no cast in it, far from the unchecked cast that caused it.

**Getting a real `T[]`.** Someone has to supply the component type. `java.lang.reflect.Array.newInstance(type, length)` takes a `Class<T>` and returns an array whose run-time class is, for `String.class`, exactly `String[].class`. The alternative is to let the caller allocate, as `Collection.toArray(IntFunction<T[]>)` does [Changed in Java 11: `Collection.toArray(IntFunction)` added] [Src: JDK 25, java.util.Collection](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collection.java). The lab's `snapshot(String[]::new)` uses it and returns a real `String[]` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). Returning a `List<T>` avoids the question entirely.

**Varargs create generic arrays.** A variable-arity parameter `T... items` is an array parameter, so every call to `listOf(a, b)` with `List<String>` arguments makes javac create a `List<String>[]`, the very array the language forbids you to write. The JLS calls this out: such a parameter "can cause heap pollution" and gives rise to unchecked warnings [Doc: JLS §9.6.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7). Heap pollution is defined in [§1](#1-why-generics-compile-time-safety-and-raw-types). With `-Xlint:unchecked`, the declaration gets `compiler.warn.unchecked.varargs.non.reifiable.type` and the call site gets `compiler.warn.unchecked.generic.array.creation`. Without the flag they are folded into the summary note shown in §1 [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java).

**Pollution through the varargs array.** The array that javac creates for `List<String>...` is a `List[]` at run time. The lab's `VarargsPollution.firstElement` takes an `Object[]` view of it and stores a `List<Integer>`. The store check passes, because a `List<Integer>` is a `List`. The method then reads `lists[0].get(0)` as a `String` and throws `ClassCastException`, not `ArrayStoreException` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). This is the "array of a non-reifiable element type aliased unsafely" that §1's guarantee excludes.

**`@SafeVarargs`.** The annotation is "a programmer assertion that the body of the annotated method or constructor does not perform potentially unsafe operations on its varargs parameter". It suppresses the warnings at the declaration and at every call site [Src: JDK 25, java.lang.SafeVarargs](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/SafeVarargs.java). Because the promise is about one body, it is allowed only where no override can replace that body: "it is a compile-time error if a variable arity method declaration that is neither static nor final nor private is annotated" with it, and constructors are allowed too [Doc: JLS §9.6.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7). In the lab it fails on a plain instance method with `compiler.err.varargs.invalid.trustme.anno`, and compiles on private, final and static ones. On a static generic `listOf` it removes both warnings [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java). The compiler cannot check the promise. `VarargsPollution` carries a false `@SafeVarargs` on purpose, and it compiles without a warning and fails at run time. The JLS names `Collections.addAll` as the canonical target, because it only reads the array and adds its elements. [Q03.21](#q03-21) tests the line between honest and dishonest.

### Code

`SnapshotBuffer` keeps the unchecked array inside, except in the one method that lets it escape on purpose:

```java
package dev.interview.javalanguage.m03.s06;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.function.IntFunction;

// Module 03 §6: a fixed-capacity buffer over (T[]) new Object[n]. Safe while the array stays inside;
// snapshot() lets it escape on purpose, and snapshot(IntFunction) is the fix.
public final class SnapshotBuffer<T> {

    private final T[] items;
    private int size;

    @SuppressWarnings("unchecked") // T erases to Object, so this array is an Object[] at run time.
    public SnapshotBuffer(int capacity) {
        this.items = (T[]) new Object[capacity];
    }

    public void add(T item) {
        Objects.requireNonNull(item, "item");
        if (size == items.length) {
            throw new IllegalStateException("buffer is full");
        }
        items[size++] = item;
    }

    public int size() {
        return size;
    }

    public T get(int index) {
        Objects.checkIndex(index, size);
        return items[index];
    }

    // Defect on purpose: the copy is still an Object[], so a caller that assigns it to String[] fails.
    public T[] snapshot() {
        return Arrays.copyOf(items, size);
    }

    public T[] snapshot(IntFunction<T[]> generator) {
        return toList().toArray(generator);
    }

    public List<T> toList() {
        return List.of(Arrays.copyOf(items, size));
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s06/SnapshotBuffer.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s06/SnapshotBuffer.java)</sub>

The element read works and the array read fails, in the caller (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java
    @Test
    @DisplayName("M03 §6 · a (T[]) new Object[] that escapes throws ClassCastException at the caller")
    void snapshot_throwsClassCastExceptionAtCaller_whenBackingArrayIsObjectArray() {
        SnapshotBuffer<String> buffer = bufferOf(A, B);

        String first = buffer.get(FIRST);

        assertThat(first).isEqualTo(A);
        assertThatThrownBy(() -> {
                    String[] snapshot = buffer.snapshot();
                    assertThat(snapshot).isNotNull();
                })
                .isInstanceOf(ClassCastException.class)
                .hasMessageContaining(OBJECT_ARRAY);
    }
```

The polluting store, which the array accepts (excerpt):

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s06/VarargsPollution.java
    @SafeVarargs // A lie on purpose: the body stores into the array, which is what @SafeVarargs promises not to do.
    public static String firstElement(List<String>... lists) {
        Object[] view = lists;
        view[0] = List.of(NOT_A_STRING);
        return lists[0].get(0);
    }
```

### Failure modes and operations

- **Delayed `ClassCastException` from an escaped array.** The stack trace points at the caller's assignment, and the message names `[Ljava.lang.Object;` as the source type [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). That class name is the clue: no code ever meant to produce an `Object[]`, so the array came from a `(T[])` cast. Search for `(T[])` and for methods that return `T[]`.
- **Heap pollution through a stored varargs array.** A varargs method that writes into its array, or keeps it in a field, or returns it, lets a wrongly typed element reach code that trusts the declared type. The failure appears at the first typed read, possibly much later. A dishonest `@SafeVarargs` also hides the warnings that would have pointed at the method.
- **What to configure:** compile with `-Xlint:unchecked`, so that both varargs warnings are visible. Treat every `@SuppressWarnings("unchecked")` on a `(T[])` cast as a claim that the array never leaves the class, and every `@SafeVarargs` as a claim that the body only reads its array.

> [!IMPORTANT]
> **Production scenario: a metrics export fails with `ClassCastException` after a buffer refactor.** *As the interviewer frames it:* "We replaced a `List<Event>` with a home-grown fixed-size buffer to cut allocations. Unit tests of the buffer pass. In staging, the exporter that calls `Event[] batch = buffer.snapshot()` fails on every flush with `class [Ljava.lang.Object; cannot be cast to class [Lcom.acme.Event;`."
> **Reasoning.** The buffer's own tests read elements through `get`, which casts one element at a time and succeeds. The exporter is the first caller to take the array itself, and the array is an `Object[]` created by `(T[]) new Object[n]`, as the exception's source class shows. Evidence: the stack trace ends in the exporter's assignment, not inside the buffer; the buffer's constructor holds the unchecked cast under `@SuppressWarnings`; and the lab reproduces it with `SnapshotBuffer<String>` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). Fix: return `List<T>`, or take an `IntFunction<T[]>` (or a `Class<T>`) so the caller supplies the component type. Prevention: a rule that a `(T[])` cast array never leaves its class, plus a test that assigns each array-returning method's result to a concrete array type.

### Best practices and anti-patterns

- Return `List<T>` rather than `T[]` from generic code, because a list carries no run-time component type that can disagree with its static type.
- Keep a `(T[]) new Object[n]` array private and never return or pass it out, because it is an `Object[]` to everyone outside.
- Take an `IntFunction<T[]>` or a `Class<T>` when a caller really needs an array, because only the caller knows the real component type.
- Put `@SafeVarargs` only on methods whose body reads the array and does nothing else with it, because the annotation silences every call site's warning on your word.
- Do not store, return or expose a generic varargs array, because its run-time type is the erased one and pollution follows.
- Compile with `-Xlint:unchecked`, because the varargs warnings are otherwise collapsed into a single note.

### Misconceptions and traps

- *"`(T[]) new Object[n]` is always wrong."* It is the standard implementation technique, safe while the array stays inside the class. `SnapshotBuffer.get` works through it [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). The myth comes from the failures of the escaped case.
- *"`ArrayList<String>` stores a `String[]`."* It stores an `Object[]` and casts per element [Src: JDK 25, java.util.ArrayList](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/ArrayList.java). The intuition comes from arrays, which do know their component type, so a typed collection is assumed to be built on a typed array.
- *"An array would catch a wrong element with `ArrayStoreException`."* Only down to the erased type: a `List<Integer>` passes the store check of a `List<String>[]`, because the array only knows `List` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). The belief carries the array rules of §4 over to non-reifiable component types.
- *"`@SafeVarargs` makes the method safe."* It only stops the warnings. The compiler does not check the promise, and a false one compiles without a warning [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java). The name reads like a guarantee when it is an assertion.

Questions that drill this section: [Q03.19](#q03-19), [Q03.20](#q03-20), [Q03.21](#q03-21).

## 7. Capturing types at run time: class tokens and super type tokens
### The problem it solves

Erasure removes the type argument from every object, and some code needs it back at run time. A settings store has to check that the value for `"port"` really is an `Integer`. A JSON client has to know that the body is a list of `Order`s and not a list of maps. A dependency-injection container has to tell a `Repository<Order>` from a `Repository<Invoice>`. None of them can ask the object, so the caller has to hand the type over as a value. Java has two ways to do it: a `Class<T>` object, which covers plain classes, and a *super type token*, which covers full parameterized types such as `List<Order>`.

### Mental model

A type token is a type passed as an argument. A `Class<T>` is the simple version: the run time already has one object per class, and its static type `Class<T>` lets the compiler connect it to `T`. For `List<Order>` there is no such object. The trick is to make javac write the type down where reflection can find it. Declare a class whose superclass is `TypeToken<List<Order>>`, and the class file records that superclass in its `Signature` attribute ([§5](#5-type-erasure-and-bridge-methods)). An anonymous subclass `new TypeToken<List<Order>>() {}` is the shortest way to declare one.

```mermaid
sequenceDiagram
    participant Src as Caller source
    participant Javac as javac
    participant Cls as Anonymous class file
    participant Ref as ParameterizedTypeReference constructor
    participant Client as HTTP client converter
    Src->>Javac: new ParameterizedTypeReference of List of Order, anonymous body
    Javac->>Cls: Signature: superclass ParameterizedTypeReference of List of Order
    Ref->>Cls: getGenericSuperclass()
    Cls-->>Ref: ParameterizedType, argument List of Order
    Ref->>Client: getType() returns List of Order
```

What to notice: the type argument travels in the class, not in the object. That is why the token only works when the type is written out in source at the point where the subclass is declared.

### How it actually works

**`Class<T>` as a token.** `Class.cast` checks an object at run time and throws `ClassCastException` if it "is not null and is not assignable to the type T" [Src: JDK 25, java.lang.Class](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Class.java). That repairs the trap of [§2](#2-generic-types-generic-methods-and-type-inference). `<T> T get(String key)` casts nothing at run time and lets the caller fail later. The lab's `TypedSettings.get(String key, Class<T> type)` returns `type.cast(value)`. Asking for the string `"8080"` as an `Integer` throws inside `get`, with a message naming `java.lang.Integer`, and asking for it as a `String` returns it [Lab: ClassTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/ClassTokenTest.java). The JDK uses the same idiom wherever generic code must create or check something: `EnumSet.noneOf(Class<E> elementType)` [Src: JDK 25, java.util.EnumSet](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/EnumSet.java), and `Array.newInstance` in [§6](#6-reifiable-types-generic-arrays-and-heap-pollution).

**The limit of `Class<T>`.** A class literal is a type name followed by `.class` [Doc: JLS §15.8.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.8.2), and a type name has no type arguments, so `List<Order>.class` cannot be written. `List.class` is a `Class<List>`, the raw type, and it says nothing about the elements.

**Super type tokens.** The lab's `TypeToken<T>` is an abstract class whose constructor calls `getClass().getGenericSuperclass()`. For an anonymous subclass declared as `new TypeToken<List<String>>() {}`, that call returns the `ParameterizedType` `TypeToken<List<String>>`, and its single type argument is `List<String>` [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). A raw subclass has no type argument to read, and the constructor rejects it with `IllegalStateException`. The class is abstract, and its constructor protected, so a token can only be made by subclassing. The idea is usually credited to Neal Gafter's post "Super Type Tokens" [Doc: Neal Gafter, Super Type Tokens (2006)](https://gafter.blogspot.com/2006/12/super-type-tokens.html), which Spring's Javadoc links to.

**The same idea in Spring and Jackson.** Spring's `ParameterizedTypeReference<T>` is exactly this class. Its protected constructor finds the subclass, calls `getGenericSuperclass()`, asserts a `ParameterizedType` with one argument and keeps that argument for `getType()` [Src: Spring Framework 7.0.10, ParameterizedTypeReference](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ParameterizedTypeReference.java). In the lab, `new ParameterizedTypeReference<List<Order>>() {}` reports `List<Order>` [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). The HTTP clients accept it where a `Class` would lose the element type: `RestClient.ResponseSpec` has both `body(Class<T>)` and `body(ParameterizedTypeReference<T>)` [Src: Spring Framework 7.0.10, RestClient](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-web/src/main/java/org/springframework/web/client/RestClient.java), and `RestTemplate.exchange` has an overload with a `ParameterizedTypeReference<T> responseType` [Src: Spring Framework 7.0.10, RestTemplate](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-web/src/main/java/org/springframework/web/client/RestTemplate.java). The clients themselves belong to [18](18-spring-mvc-and-rest-controllers.md). Jackson's `TypeReference<T>` reads `getClass().getGenericSuperclass()` the same way. Spring Boot 4.1.2 manages Jackson 3.1.7 (group `tools.jackson`, alongside a Jackson 2.21.7 BOM) [Src: spring-boot-dependencies 4.1.2](https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.2/spring-boot-dependencies-4.1.2.pom), and in Jackson 3 the class is `tools.jackson.core.type.TypeReference` [Src: jackson-core 3.1.7, TypeReference](https://github.com/FasterXML/jackson-core/blob/jackson-core-3.1.7/src/main/java/tools/jackson/core/type/TypeReference.java). Jackson 2 code imports it from `com.fasterxml.jackson.core.type`.

**`ResolvableType`.** Spring's general wrapper around `java.lang.reflect.Type` reads the same declared signatures from fields, method parameters, return types and classes, and resolves them to classes [Src: Spring Framework 7.0.10, ResolvableType](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ResolvableType.java). In the lab, `ResolvableType.forField` on a `List<Order>` field resolves to `List`, and its generic `0` resolves to `Order` [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). This is what lets the container treat generic types as qualifiers and inject the `Repository<Order>` into a field declared with that type. Bean resolution is [15](15-spring-ioc-and-bean-lifecycle.md).

**Where tokens stop working.** A token records what is written in source at the place where the anonymous class is declared. Inside `static <T> TypeToken<List<T>> listOf() { return new TypeToken<>() {}; }` what is written is `List<T>`, so every caller, whatever its `T`, gets a token whose argument is the type variable `T`. The lab shows this for the plain token and for `ParameterizedTypeReference` alike [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). A generic helper has to receive the token, or a `Class<T>`, from its caller instead of creating it.

### Code

The plain-Java token, with nothing but the reflection API:

```java
package dev.interview.javalanguage.m03.s07;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

// Module 03 §7: a super type token in plain Java. An anonymous subclass such as new TypeToken<List<String>>() {}
// records List<String> in its Signature attribute, and getGenericSuperclass() reads it back.
public abstract class TypeToken<T> {

    static final String MISSING_TYPE_ARGUMENT = "TypeToken must be created with a type argument";

    private final Type type;

    protected TypeToken() {
        if (!(getClass().getGenericSuperclass() instanceof ParameterizedType superclass)) {
            throw new IllegalStateException(MISSING_TYPE_ARGUMENT);
        }
        this.type = superclass.getActualTypeArguments()[0];
    }

    public Type type() {
        return type;
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s07/TypeToken.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s07/TypeToken.java)</sub>

A token declared with the type written out, and one declared inside a generic method (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java
    void typeToken_capturesListOfString_whenSubclassedAnonymously() {
        TypeToken<List<String>> token = new TypeToken<>() {};

        assertListOf(token.type(), String.class);
    }
```

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java
    void typeToken_capturesTypeVariable_whenCreatedInsideGenericMethod() {
        Type captured = firstArgument(GenericTokens.<String>listOf().type());

        assertThat(captured).isInstanceOf(TypeVariable.class);
        assertThat(((TypeVariable<?>) captured).getName()).isEqualTo(TYPE_VARIABLE_NAME);
    }
```

The diamond in `new TypeToken<>() {}` infers `List<String>` from the target type. Diamond with an anonymous class is allowed since Java 9, when the inferred type is denotable [Doc: JEP 213](https://openjdk.org/jeps/213).

### Failure modes and operations

- **Maps instead of objects.** A `Class` token for a generic body carries no element type, so the JSON library falls back to its untyped model, in which a JSON object becomes a `LinkedHashMap` [Src: jackson-databind 3.1.7, UntypedObjectDeserializer](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.1.7/src/main/java/tools/jackson/databind/deser/jdk/UntypedObjectDeserializer.java). The callout below is that incident.
- **A token built inside a generic helper.** It compiles, it runs, and it describes `List<T>`. What a library then does with a type variable it cannot resolve is that library's behavior; the token was already wrong. The lab asserts the captured `TypeVariable` [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java).
- **What to observe:** log `token.getType()` (or `type()`) once. A `List<T>` or a bare `List` in that line explains every later symptom.

> [!NOTE]
> **Framework vs language.** The language guarantees the `Signature` attribute and the reflection methods that read it: `getGenericSuperclass`, `getGenericType`, `getGenericReturnType` ([§5](#5-type-erasure-and-bridge-methods)). `Class.cast` and `Class<T>` tokens are plain JDK. `ParameterizedTypeReference`, `ResolvableType` and Jackson's `TypeReference` are library code built on those methods. The lab's short `TypeToken` does what the first one does, and none of them can recover a type that was not written in source.

> [!IMPORTANT]
> **Production scenario: a REST client returns maps instead of orders.** *As the interviewer frames it:* "A service reads `List<Order> orders = restClient.get().uri(\"/orders\").retrieve().body(List.class);`. It compiles with an unchecked warning. Logging the list shows the right data, but the first `orders.get(0).total()` throws `ClassCastException: class java.util.LinkedHashMap cannot be cast to class Order`."
> **Reasoning.** `body(List.class)` tells the converter "a list of something": the element type was erased before the call, and `Class` cannot carry it. The JSON library therefore builds each element in its untyped model, a `LinkedHashMap` per JSON object [Src: jackson-databind 3.1.7, UntypedObjectDeserializer](https://github.com/FasterXML/jackson-databind/blob/jackson-databind-3.1.7/src/main/java/tools/jackson/databind/deser/jdk/UntypedObjectDeserializer.java). The unchecked assignment to `List<Order>` lets the maps through, and the cast javac inserts at `get(0)` is the first check ([§1](#1-why-generics-compile-time-safety-and-raw-types)). Evidence: the exception names `LinkedHashMap`; the debugger shows map entries where fields should be; the call site has an unchecked warning. Fix: `body(new ParameterizedTypeReference<List<Order>>() {})` [Src: Spring Framework 7.0.10, RestClient](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-web/src/main/java/org/springframework/web/client/RestClient.java). Prevention: no raw `Class` for generic bodies, `-Xlint:unchecked` with `-Werror` so the warning fails the build, and a contract test that reads one element as an `Order`. [Q03.22](#q03-22) drills the design and the generic-helper limit.

### Best practices and anti-patterns

- Take a `Class<T>` parameter when a generic method must check, create or name a non-generic type, and use `type.cast` rather than an unchecked `(T)`, because the check then happens where the value leaves your code.
- Use a super type token, such as `ParameterizedTypeReference`, whenever the target type has type arguments, because `List.class` cannot describe the elements.
- Declare tokens as constants where the type is concrete (`private static final ParameterizedTypeReference<List<Order>> ORDERS = new ParameterizedTypeReference<>() {};`), because each `new … {}` is a new anonymous class and the constant makes the type visible in one place.
- Pass tokens into generic helpers. Never create one from a type variable, because it records `T` and not the caller's type.
- Treat an unchecked warning on a client call as a bug, because it marks exactly the place where a raw `Class` replaced a full type.

### Misconceptions and traps

- *"Super type tokens defeat erasure."* They read what javac already kept, the declared superclass of an anonymous class [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). The objects stay erased, and a token made from `T` sees only `T`. The myth comes from the token appearing to "know" a type at run time.
- *"`ParameterizedTypeReference` is a Spring language feature."* It is an ordinary abstract class over `getGenericSuperclass()`, and the lab's plain `TypeToken` behaves the same way [Src: Spring Framework 7.0.10, ParameterizedTypeReference](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ParameterizedTypeReference.java). The confusion comes from meeting it first in Spring's HTTP client API.
- *"`body(List.class)` is fine because the variable is `List<Order>`."* The variable's type exists only at compile time. The converter receives `List.class` and nothing else, and the unchecked warning is the compiler saying so. The trap feels safe because the assignment compiles.
- *"The `{}` in `new ParameterizedTypeReference<…>() {}` is a typo or style."* Without the anonymous subclass there is no declared superclass to read, and the class is abstract with a protected constructor, so it cannot be created any other way. The braces are the mechanism.

Questions that drill this section: [Q03.22](#q03-22), [Exercise 03.1](#ex03-1), [Exercise 03.3](#ex03-3).

## 8. Reading generic signatures in the JDK
### The problem it solves

A developer opens the Javadoc of `Collections.max` to check whether it accepts a `List<LocalDate>` and finds `public static <T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll)`. Read as one line of punctuation, it is easier to guess than to understand, so the developer writes a cast, a copy into a `List<Comparable>`, or a hand-rolled loop. The signature already answered the question, and every wildcard in it is there so that a call like theirs compiles. This section is a method for reading such signatures, applied to four JDK methods that interviews use.

### Mental model

Read a generic signature the way you read a contract: first the parties, then the conditions, then what each party gives and receives. The parties are the type parameters in the angle brackets before the return type. The conditions are their bounds. Each parameter is then either a producer that the method reads from (`? extends`) or a consumer that the method feeds (`? super`), the PECS rule of [§4](#4-wildcards-pecs-and-variance). The return type is what the caller receives. Four questions, in that order, take apart any signature in the JDK:

| Step | Question | `Collections.max` | `Stream<T>.collect` |
|---|---|---|---|
| 1 | Which type parameters does the method declare? | `T` | `R`, `A` (and the class's `T`) |
| 2 | What bounds them? | `Object & Comparable<? super T>` | none |
| 3 | Is each parameter a producer or a consumer of `T`? | `Collection<? extends T>`: producer | `Collector<? super T, A, R>`: consumer of `T` |
| 4 | What does the caller get back? | `T` | `R` |

### How it actually works

**`Collections.max`.** The declaration in JDK 25 is `<T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll)` [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). Step 2: `Comparable<? super T>` lets `T` be a type that inherits its comparison from a supertype, such as `LocalDate`, which is `Comparable<ChronoLocalDate>` ([§3](#3-bounded-type-parameters)). Step 3: the collection only produces elements, so `? extends T` lets the method pick a `T` wider than the element type. In the lab, `Collections.max` returns the latest of three `LocalDate`s with no cast [Lab: JdkSignatureCallsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCallsTest.java). The bound `Object &` adds nothing at compile time, because every type is already an `Object`. It exists for the erasure. A type variable erases to its leftmost bound ([§5](#5-type-erasure-and-bridge-methods)), so with `Object` first the erased method returns `Object`, which is what `max` returned before generics, and class files compiled against the old signature still link. Without `Object &`, the erasure would return `Comparable`, a different method descriptor [Doc: Gilad Bracha, Generics in the Java Programming Language (2004), §10](https://www.oracle.com/technetwork/java/javase/generics-tutorial-159168.pdf). The lab reads both facts by reflection: `getReturnType()` of `Collections.max` is `Object.class`, the declared bounds are `Object` then `Comparable<? super T>`, and a look-alike declared without `Object &` erases to `Comparable` [Lab: JdkSignatureReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java).

**`Stream<T>.collect`.** The declaration is `<R, A> R collect(Collector<? super T, A, R> collector)` [Src: JDK 25, java.util.stream.Stream](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Stream.java). `T` belongs to the stream; the method adds `R` and `A`. In `Collector<T, A, R>`, `T` is the input element type, `A` the mutable accumulation type, "often hidden as an implementation detail", and `R` the result type [Src: JDK 25, java.util.stream.Collector](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Collector.java). That is why factory methods such as `Collectors.toList()` return `Collector<T, ?, List<T>>`: the caller never names `A`, and inference fills it from the collector. The collector consumes the elements, so `? super T` accepts a collector written for any supertype. In the lab, one `Collector<Object, ?, String>` collects both a `Stream<Integer>` and a `Stream<LocalDate>` [Lab: JdkSignatureCallsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCallsTest.java), and the same call against a look-alike that takes `Collector<T, A, R>` fails with `compiler.err.cant.apply.symbol` [Lab: JdkSignatureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCompileRulesTest.java). How collectors work belongs to [05](05-java-lambdas-streams-optional.md).

**`Map<K, V>.computeIfAbsent`.** The declaration is `default V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction)` [Src: JDK 25, java.util.Map](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Map.java). No new type parameter: `K` and `V` come from the map. The function consumes a key (`? super K`) and produces a value (`? extends V`), so on a `Map<String, List<String>>` a `Function<CharSequence, ArrayList<String>>` is accepted. In the lab it creates the bucket once and the second call reuses it; with `Function<K, V>` in its place the call does not compile [Lab: JdkSignatureCallsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCallsTest.java) [Lab: JdkSignatureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCompileRulesTest.java). The return type is `V`, not `? extends V`: the caller gets the map's own type back.

**`Comparator.comparing`.** The one-argument form is `<T, U extends Comparable<? super U>> Comparator<T> comparing(Function<? super T, ? extends U> keyExtractor)` [Src: JDK 25, java.util.Comparator](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Comparator.java). It combines all the pieces: `U` is the key type with the same robust bound as `max`, and the extractor consumes a `T` and produces a `U`. In the lab, `comparing(Parcel::shippedOn)` sorts parcels by a `LocalDate` key [Lab: JdkSignatureCallsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCallsTest.java). Using comparators is [02 §4](02-java-equality-immutability-records.md#4-ordering-comparable-and-comparator).

### Code

One call per signature. Each compiles only because of the wildcard or bound named in its comment:

```java
package dev.interview.javalanguage.m03.s08;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;

// Module 03 §8: one call per JDK signature read in the section. Each compiles only because of a wildcard or bound.
public final class Shipments {

    // ? super K accepts a function over a supertype of the key; ? extends V accepts a subtype of the value.
    private static final Function<CharSequence, ArrayList<String>> NEW_BUCKET = key -> new ArrayList<>();

    private Shipments() {}

    // <T extends Object & Comparable<? super T>>: LocalDate is Comparable<ChronoLocalDate>, a supertype's comparison.
    public static LocalDate latestShipDate(Collection<LocalDate> dates) {
        return Collections.max(dates);
    }

    // A Collector<Object, ?, String> fits Stream<T>.collect(Collector<? super T, A, R>) for every T.
    public static Collector<Object, ?, String> describingAnything() {
        return Collectors.mapping(String::valueOf, Collectors.joining(", "));
    }

    public static void index(Map<String, List<String>> byPrefix, String prefix, String value) {
        byPrefix.computeIfAbsent(prefix, NEW_BUCKET).add(value);
    }

    // <T, U extends Comparable<? super U>>: U is LocalDate here.
    public static List<Parcel> byShipDate(List<Parcel> parcels) {
        return parcels.stream().sorted(Comparator.comparing(Parcel::shippedOn)).toList();
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/s08/Shipments.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/s08/Shipments.java)</sub>

The erasure that `Object &` protects, read by reflection (excerpt):

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java
    @Test
    @DisplayName("M03 §8 · the erasure of Collections.max returns Object")
    void getReturnType_isObject_whenFirstBoundIsObject() throws NoSuchMethodException {
        Method max = Collections.class.getMethod(MAX, Collection.class);

        assertThat(max.getReturnType()).isEqualTo(Object.class);
        assertThat(max.toString()).isEqualTo(ERASED_MAX);
        assertThat(max.toGenericString()).isEqualTo(DECLARED_MAX);
    }

    @Test
    @DisplayName("M03 §8 · without Object & the same signature erases to Comparable")
    void getReturnType_isComparable_whenObjectBoundIsMissing() throws NoSuchMethodException {
        Method lookAlike = JdkSignatureReflectionTest.class.getDeclaredMethod(LOOK_ALIKE, Collection.class);

        assertThat(lookAlike.getReturnType()).isEqualTo(Comparable.class);
    }

    @SuppressWarnings("unused") // read by reflection only: the JDK's signature minus "Object &"
    private static <T extends Comparable<? super T>> T maxWithoutObjectBound(Collection<? extends T> values) {
        return Collections.max(values);
    }
```

The two constants hold the strings the test compares: `ERASED_MAX` is `public static java.lang.Object java.util.Collections.max(java.util.Collection)`, and `DECLARED_MAX` is `public static <T extends java.lang.Object & java.lang.Comparable<? super T>> T java.util.Collections.max(java.util.Collection<? extends T>)`.

### Failure modes and operations

Reading a signature has no run-time behavior of its own; a call that does not fit fails at compile time, and on JDK 25 the key is `compiler.err.cant.apply.symbol` [Lab: JdkSignatureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCompileRulesTest.java). The run-time risk is on the library side. The first bound decides the erased descriptor, so a library that changes it breaks callers compiled against the old one, which is the binary-compatibility rule of [§3](#3-bounded-type-parameters) and the reason `max` carries `Object &` [Doc: Gilad Bracha, Generics in the Java Programming Language (2004), §10](https://www.oracle.com/technetwork/java/javase/generics-tutorial-159168.pdf). What to observe: `Method.toString()`, `getReturnType()` and `getParameterTypes()` show the erased signature that callers link against, and `toGenericString()` shows the declared one, bounds included [Lab: JdkSignatureReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java).

### Best practices and anti-patterns

- Read a signature in the four steps (type parameters, bounds, producer or consumer, return type) before writing a cast or a copy, because the wildcards usually already allow the call.
- Copy the JDK's shapes into your own APIs: `Comparable<? super T>` for orderable types, `? extends` on inputs you read, `? super` on functions and sinks you feed, because those are the shapes that accept `LocalDate`, subtypes and general-purpose lambdas.
- Return the plain type (`V`, `T`, `List<T>`), not a wildcard, because a wildcard in a return type forces every caller to deal with a capture ([§4](#4-wildcards-pecs-and-variance)).
- When generifying an existing public method, check that its erasure is unchanged (put `Object &` first if needed), because old class files link against the erased descriptor.

### Misconceptions and traps

- *"`T extends Object & …` is redundant noise."* It changes nothing for the compiler's type checks, but it sets the erasure to `Object` [Lab: JdkSignatureReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java). The myth exists because the bound is indeed redundant in source, and erasure is invisible until you read the class file.
- *"The `A` in `collect` is something the caller must supply."* It is a type parameter of the method that inference fills from the collector; collectors hide it as `?` [Src: JDK 25, java.util.stream.Collector](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Collector.java). The confusion comes from seeing three type arguments where only one, the result, matters to the caller.
- *"`? super K` in `computeIfAbsent` means the map can hold supertypes of `K`."* The wildcard is on the function, not on the map: it widens the lambdas you may pass, and the map stays a `Map<K, V>`. The trap comes from reading wildcards as properties of the collection rather than of the parameter they sit on.

Questions that drill this section: [Q03.23](#q03-23), [Exercise 03.2](#ex03-2).

## Summary
<!-- TASK: CLOSE-M03 -->
<!-- /TASK: CLOSE-M03 -->

## Question bank

<a id="q03-01"></a>
### Q03.01 · Concept · What do generics buy you, and what does a raw type give up?

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Generics move the element check from run time to compile time: `List<String>` rejects `add(42)` at compile time, and the compiler inserts the casts on reads, so the source has none. A raw `List` switches that checking off for the variable: it accepts any element, with an `unchecked` warning at most, and the wrong element surfaces later as a `ClassCastException` far from the line that added it.

**Full explanation.** A parameterized type such as `List<String>` gives the compiler two jobs: reject a wrong argument at the call that writes, and insert a cast where an element is read as `String` ([§1](#1-why-generics-compile-time-safety-and-raw-types)). The raw type is the generic type's name without type arguments; its members are their erasures, so `add(E)` becomes `add(Object)` [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). Raw types still compile because pre-Java-5 code had to keep compiling. What they give up is the guarantee: if no unchecked warning occurs, heap pollution, a variable of a parameterized type referring to an object not of that type, cannot happen [Doc: JLS §4.12.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.12.2). In the lab, a raw-typed `add` of an `Integer` makes the exception appear in `SkuReport`, typed code with no cast in its source [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java). The cost is zero at run time: one class serves every parameterization [Lab: M03LabSmokeTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/smoke/M03LabSmokeTest.java).

**Follow-ups an interviewer will ask.**
- *Is a raw `List` the same as `List<Object>`?* No. `List<Object>` is checked like any parameterized type and is not a supertype of `List<String>`; the raw type accepts any list and any element. [Q03.12](#q03-12) takes the three forms apart.
- *How do you find the bad write in an existing code base?* Compile with `-Xlint:rawtypes,unchecked` to list the unchecked operations, and wrap the suspicious list in `Collections.checkedList` so the exception moves to the bad `add` [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java).

**Trap to avoid.** "It compiled without errors, so the types are right." A raw `add` is a warning, not an error, and default javac output hides it behind a one-line note [Lab: RawTypeCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypeCompileRulesTest.java).

</details>

<a id="q03-02"></a>
### Q03.02 · Output · A raw `List` holding a `String` and an `Integer`: what compiles, what warns, and which line throws?

Compiled with `-Xlint:rawtypes,unchecked`. What does it print, which warnings appear, and where does it fail?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_02.java
List raw = new ArrayList();
raw.add("sku-1");
raw.add(42);
List<String> skus = raw;

System.out.println(skus.size());
System.out.println(skus.get(0));
String second = skus.get(1);
System.out.println(second);
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).**

```text
2
sku-1
```

Then `String second = skus.get(1)` throws `ClassCastException` (`java.lang.Integer` cannot be cast to `java.lang.String`). Everything compiles, with five warnings: two raw-type uses, two unchecked calls to `add`, and one unchecked assignment to `List<String>`.

**Full explanation.** The raw list checks nothing, so both `add`s succeed, and `size()` and the first read, which really is a `String`, work. The assignment `List<String> skus = raw` is an unchecked conversion: allowed, with a warning [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). The third read is where javac inserted a cast to `String`, and that cast is the first check the `Integer` meets. The lab captures the two lines and the exception, and compiles the first four lines in memory to assert the warning keys in order: `compiler.warn.raw.class.use` twice, `compiler.warn.unchecked.call.mbr.of.raw.type` twice, and `compiler.warn.prob.found.req` for the assignment [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).

**Follow-ups an interviewer will ask.**
- *Does `Object o = skus.get(1);` throw?* Not with javac 25: the target is `Object`, so no cast to `String` is needed, and in the lab the read returns the `Integer` [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). That is why logging or copying a polluted list "works" and only typed use fails.
- *Which warning points at the real bug?* The two unchecked calls to `add`: they are the writes that javac could not check. The rawtypes warnings only say where checking is off.

**Trap to avoid.** Answering "the line `raw.add(42)` throws". Nothing checks the raw `add`; the failure waits for the first read that needs a `String`.

</details>

<a id="q03-03"></a>
### Q03.03 · Production scenario · A `ClassCastException` in code with no cast, after a legacy library returned a raw `List`

*As the interviewer frames it:* "After upgrading a vendor SDK, our nightly export fails with `ClassCastException: class java.lang.Long cannot be cast to class java.lang.String` in `ExportJob.writeRow`. That method takes a `List<String>` and has no cast in it. The SDK call is `List<String> ids = client.fetchIds();`, and `fetchIds()` is declared to return a raw `List`. Nothing else changed."

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** The SDK now puts `Long` values into the raw list it returns. The assignment to `List<String>` is unchecked, so nothing fails until `writeRow` reads an element as `String` through the cast javac inserted. Confirm by inspecting the list's element classes at the SDK boundary, fix it by converting explicitly there, and prevent it by treating unchecked warnings at third-party boundaries as errors.

**Full explanation.** *What the symptoms tell you:* an exception in code with no source-level cast means a compiler-inserted cast, so a typed variable holds an object of another type, which is heap pollution ([§1](#1-why-generics-compile-time-safety-and-raw-types)). *Hypotheses, ranked:* (1) the SDK's raw return now contains `Long`s, likely an ID type change in the new version; (2) some code of ours adds to the list through a raw reference; (3) a deserializer fills the list without a type token ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)). *Evidence:* the build log of the call site shows an unchecked-assignment warning under `-Xlint:unchecked` [Doc: javac, Java 25](https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html); a debugger or a one-off log of `ids.get(0).getClass()` at the boundary shows `Long`, which settles hypothesis 1; to rule out 2, wrap the list in `Collections.checkedList(ids, String.class)` in a test run, which throws at the polluting `add` instead of the read [Lab: RawTypesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s01/RawTypesTest.java). *Fix:* stop pretending at the boundary. Declare the SDK result as `List<?>` and convert each element explicitly (`String.valueOf(id)` or a typed parser), so the decision lives in one adapter. *Prevention:* keep raw SDK types inside one adapter class, compile with `-Xlint:rawtypes,unchecked` and `-Werror`, and add a contract test on the SDK's element type that runs on every dependency upgrade.

**Follow-ups an interviewer will ask.**
- *Why not just add `@SuppressWarnings("unchecked")` to the assignment?* It silences the only warning that pointed at the problem. Suppression is honest only when the code proves the cast safe, in the smallest scope, with a comment saying why.
- *Would `Collections.checkedList` fix production?* It only moves the exception to the write, which here is inside the SDK. It is a diagnostic; the conversion in the adapter is the fix.

**Trap to avoid.** Debugging `writeRow`. The stack trace shows where the wrong element was first read as a `String`, not where it entered the list.

</details>

<a id="q03-04"></a>
### Q03.04 · Difference · Generic class vs generic method: where `T` is declared and who chooses it

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** A class's type parameter (`class Box<T>`) is chosen once by whoever names the type or creates the instance, and it is fixed for that object. A method's type parameter (`static <T> T firstOr(List<T>, T)`) is declared before the return type and chosen at every call, almost always by inference.

**Full explanation.** A class is generic when its declaration declares type variables [Doc: JLS §8.1.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.2); a method is generic when it declares its own [Doc: JLS §8.4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.4). The class's `T` belongs to instances, so static members cannot use it: one class serves every parameterization. A method's `T` is local to the call, so a static utility in a non-generic class can be generic, and a generic class can add method-level parameters, as `Box.map` adds `<R>`. In the lab, a `Box<String>` stays a box of strings, while `Elements.firstOr` returns an `Integer` for one call and a `String` for the next [Lab: GenericDeclarationsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/GenericDeclarationsTest.java). Choose a class parameter when the type is part of the object's state; choose a method parameter when it only relates the call's arguments and result.

**Code.** The class fixes `T`; the method adds its own `R` per call:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s02/Box.java
    public <R> Box<R> map(Function<T, R> mapper) {
        return new Box<>(mapper.apply(value));
    }
```

**Follow-ups an interviewer will ask.**
- *Why can't a static field be of type `T`?* Static members belong to the one runtime class shared by `Box<String>` and `Box<Integer>`, so there is no single `T` for them ([§5](#5-type-erasure-and-bridge-methods)).
- *When do you write the type argument of a method call?* Only when inference has no information, for example a generic call used as the receiver of another call: `Collections.<String>emptyList().stream()` ([Q03.05](#q03-05)).

**Trap to avoid.** Making a class generic only because one method needs a type parameter. Callers then have to name a type argument that describes nothing about the object.

</details>

<a id="q03-05"></a>
### Q03.05 · Output · Diamond, target typing and `var`: which type does each declaration infer?

What does each declaration infer, and what does this print?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_05.java
List<String> a = new ArrayList<>();
var b = new ArrayList<>();
var c = new ArrayList<String>();
List<String> d = Collections.emptyList();
List<String> e = Collections.<String>emptyList().stream().toList();

b.add(1);
b.add("two");
System.out.println(b);
c.add("three");
a.addAll(c);
System.out.println(a + " " + d.size() + " " + e);
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).**

```text
[1, two]
[three] 0 []
```

`a` is `ArrayList<String>` (the declared type is the target), `b` is `ArrayList<Object>` (`var` gives the diamond no target), `c` is `ArrayList<String>` (written out), `d` infers `T = String` from its target, and `e` needs the witness `<String>`, because a call used as a receiver gets no target type.

**Full explanation.** The diamond and a generic method call are poly expressions: their type arguments come from the arguments and, in an assignment or invocation context, from the target type [Doc: JLS §15.9](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.9) [Doc: JLS §15.12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12). `var` types the variable from its initializer as if it were not in an assignment context, so `new ArrayList<>()` has nothing to infer from and becomes `ArrayList<Object>` [Doc: JLS §14.4.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1); that is why `b` takes an `Integer` and a `String`. In `e`, `emptyList()` is the receiver of `.stream()`, not the right-hand side of the assignment, so without the witness it infers `List<Object>` and the statement fails with `compiler.err.prob.found.req`. The lab asserts the printed lines and, by compiling variants in memory, that `String s = b.get(0);`, `a.add(1);` and `c.add(1);` are each rejected with `compiler.err.prob.found.req`, that `b.add(1); b.add("x");` compiles, and that the chain compiles only with the witness [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).

**Follow-ups an interviewer will ask.**
- *Is `b` a raw type?* No. It is a fully parameterized `ArrayList<Object>` and compiles without warnings; `new ArrayList()` without the diamond is the raw one ([§2](#2-generic-types-generic-methods-and-type-inference)).
- *How would you fix `b` and keep `var`?* Write the argument: `var b = new ArrayList<String>();`, as `c` does.

**Trap to avoid.** Saying `var` "copies the type from the other declarations" or "infers from later use". It looks only at the initializer, once.

</details>

<a id="q03-06"></a>
### Q03.06 · Bug hunt · `<T> T get(String key)`: why does the `ClassCastException` appear in the caller?

`Settings` stores values as `Object` and offers `@SuppressWarnings("unchecked") public <T> T get(String key) { return (T) values.get(key); }`. Where does this fail, and what is the bug?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_06.java
Settings settings = new Settings();
settings.put(PORT, PORT_TEXT);

Integer port = settings.get(PORT);
System.out.println(port + 1);
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** `PORT_TEXT` is the string `"8080"`. `Integer port = settings.get(PORT)` throws `ClassCastException`, and the top stack frame is the caller, not `get`. The `(T)` cast inside `get` is erased to `Object` and checks nothing; the real cast is the one javac inserts at the caller's assignment, for the `T` the caller's target type chose.

**Full explanation.** `T` appears only in the return type, so no argument constrains it and the target type decides: here `T = Integer` [Doc: JLS §15.12](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12). Inside `get`, `T` erases to `Object`, so `(T)` is an unchecked cast that compiles to nothing ([§5](#5-type-erasure-and-bridge-methods)); javac warns about it at the getter and never at the caller [Lab: TypeInferenceCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s02/TypeInferenceCompileRulesTest.java). The caller then needs an `Integer`, and the inserted cast fails in its frame [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). The bug is the signature: it promises any type the caller asks for, and the suppression hides that promise. The fix: take a `Class<T>` and return `type.cast(value)`, which checks inside `get` ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)).

**Code.** The checked version, from §7:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s07/TypedSettings.java
    public <T> T get(String key, Class<T> type) {
        return type.cast(values.get(key));
    }
```

**Follow-ups an interviewer will ask.**
- *What does `String.valueOf(settings.get(PORT))` do?* It throws too, with a message naming `[C`. Overload resolution picks the most specific applicable `valueOf`, which is `valueOf(char[])`, so `T` is inferred as `char[]` and the inserted cast fails [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).
- *And `Object port = settings.get(PORT);`?* No exception: `T` is `Object` and nothing needs a cast [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). The bug only shows in callers that guessed wrong.

**Trap to avoid.** Looking for the bug in the caller because the stack trace points there. The caller is the victim of a getter that lets it choose its own cast.

</details>

<a id="q03-07"></a>
### Q03.07 · Concept · Bounds and multiple bounds: what `<T extends Number & Comparable<T>>` lets the body call, and what `T` erases to

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** The body may call the members of every bound: `doubleValue()` from `Number` and `compareTo(T)` from `Comparable<T>`. Callers must pass a type that satisfies all of them, such as `Integer`. At most one bound may be a class and it must come first, and `T` erases to that first bound, `Number`.

**Full explanation.** A type variable's members are those of its bound, `Object` when none is declared, and a type argument must be a subtype of the bound [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4). With `&`, the variable is treated as the intersection of the listed types, so the body sees all their members [Doc: JLS §4.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.4). The order is constrained (a class only first) and significant for one more reason: the erasure of a type variable is the erasure of its leftmost bound [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6). In the lab, `Bounds.clamp` calls `compareTo` on a `T` that must also be a `Number`, reflection shows its bounds `Number` then `Comparable<T>` and its erased return type `Number`, and `<T extends Comparable<T> & Number>` is rejected with `compiler.err.intf.expected.here` [Lab: BoundReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundReflectionTest.java) [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java).

**Code.** Both bounds at work in one body:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s03/Bounds.java
    public static <T extends Number & Comparable<T>> T clamp(T value, T low, T high) {
        if (value.compareTo(low) < 0) {
            return low;
        }
        if (value.compareTo(high) > 0) {
            return high;
        }
        return value;
    }
```

**Follow-ups an interviewer will ask.**
- *Why does the erasure matter if the source meaning is the same?* The erased descriptor is what compiled callers link against, so reordering bounds in a published library breaks binary compatibility; `Collections.max` puts `Object` first for exactly that reason ([§8](#8-reading-generic-signatures-in-the-jdk)).
- *Can a type parameter have a lower bound?* No. `<T super Integer>` is a syntax error; `super` exists only on wildcards [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java).

**Trap to avoid.** "`extends` in a bound means subclass." In a bound it means subtype, interfaces included; there is no `implements` form.

</details>

<a id="q03-08"></a>
### Q03.08 · Output · Difference · `<T extends Comparable<T>>` vs `<T extends Comparable<? super T>>`: which compiles for a `List<LocalDate>`?

Two versions of `max(List<T>)` differ only in the bound. Which of them accept a `List<LocalDate>` and a `List<Integer>`, and what does the second version print here?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_08.java
    public static void main(String[] args) {
        System.out.println(latest(List.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 9))));
        System.out.println(latest(List.of(3, 7, 5)));
    }

    public static <T extends Comparable<? super T>> T latest(List<T> values) {
        return Collections.max(values);
    }
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** With `Comparable<T>`, `List<Integer>` compiles and `List<LocalDate>` does not (`compiler.err.cant.apply.symbol`). With `Comparable<? super T>`, both compile, and the program prints:

```text
2026-03-09
7
```

`Integer` implements `Comparable<Integer>`, but `LocalDate` implements `Comparable<ChronoLocalDate>` through its interface, so only the `? super T` bound admits it.

**Full explanation.** `Comparable<T>` demands that `T` be comparable with exactly itself. `LocalDate` implements `ChronoLocalDate`, which extends `Comparable<ChronoLocalDate>` [Src: JDK 25, java.time.chrono.ChronoLocalDate](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/time/chrono/ChronoLocalDate.java), so with `T = LocalDate` the bound `Comparable<LocalDate>` is not satisfied, and no other `T` matches the list. `Comparable<? super T>` accepts a comparison declared on any supertype of `T`, and `ChronoLocalDate` is one. The lab compiles all four combinations in memory and runs `latest` [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). The same holds for `java.sql.Timestamp`, which inherits `Comparable<Date>` [Lab: BoundCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s03/BoundCompileRulesTest.java). The JDK's `Collections.max` uses the robust form, plus `Object &` for erasure ([§8](#8-reading-generic-signatures-in-the-jdk)).

**Follow-ups an interviewer will ask.**
- *Why does the error not say "LocalDate is not comparable"?* Because it is comparable, with `ChronoLocalDate`; the message reports that no `T` satisfies the bound for that argument, which is what `cant.apply.symbol` covers.
- *Is `Comparable<? super T>` ever worse?* Not for a parameter: it accepts strictly more types and the body can still call `compareTo(T)`. It is the shape `Comparator.comparing` uses for its key type too ([§8](#8-reading-generic-signatures-in-the-jdk)).

**Trap to avoid.** Testing a sort utility only with `String` and `Integer`, which implement `Comparable` of themselves; the strict bound passes those tests and fails on the first date type.

</details>

<a id="q03-09"></a>
### Q03.09 · Output · Is a `List<Integer>` a `List<Number>`? Is a `String[]` an `Object[]`? What happens when you store an `Integer`?

`List<Number> n = new ArrayList<Integer>();` and the code below: which compile, and what does the code print?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_09.java
Object[] objects = new String[1];
System.out.println(objects.getClass().getSimpleName());
try {
    objects[0] = 42;
} catch (ArrayStoreException e) {
    System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage());
}
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** The list assignment does not compile (`compiler.err.prob.found.req`): generic types are invariant. The array code compiles, because arrays are covariant, and prints:

```text
String[]
ArrayStoreException: java.lang.Integer
```

The array remembers its real component type, `String`, and checks every store at run time.

**Full explanation.** If `List<Integer>` were a `List<Number>`, code holding it as `List<Number>` could add a `Double`, and the owner would later read it as an `Integer`; so `List<A>` and `List<B>` are unrelated unless `A` and `B` are the same, and only `List<? extends Number>` relates them [Doc: JLS §4.10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.2). Arrays took the other design: `String[]` is a subtype of `Object[]` [Doc: JLS §4.10.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.3), so the bad write compiles, and the language pays for it with a run-time check on every store into a reference array that throws `ArrayStoreException` [Doc: JLS §10.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.5). The lab asserts both printed lines and both compile outcomes [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). Generics catch the same mistake at compile time, which is possible only because they gave up covariance.

**Follow-ups an interviewer will ask.**
- *Why can arrays check at run time and lists cannot?* An array object stores its component type; a list's element type is erased ([§5](#5-type-erasure-and-bridge-methods)), so there is nothing to check against.
- *How do you pass a `List<Integer>` to a method that only reads `Number`s?* Declare the parameter `List<? extends Number>` ([Q03.10](#q03-10)).

**Trap to avoid.** "`Integer` is a `Number`, so a list of `Integer` is a list of `Number`." Subtyping of elements does not carry over to generic containers.

</details>

<a id="q03-10"></a>
### Q03.10 · Concept · PECS: when to use `? extends` and when `? super`, read through `Collections.copy`

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Producer extends, consumer super: a parameter the method reads `T`s from is `? extends T`, a parameter it writes `T`s into is `? super T`, and a parameter it does both with takes no wildcard. `Collections.copy(List<? super T> dest, List<? extends T> src)` reads the source and writes the destination, so it can copy a `List<Integer>` into a `List<Number>`.

**Full explanation.** Through `List<? extends T>` the elements are some unknown subtype of `T`, so reading gives a `T` and writing anything but `null` is rejected; through `List<? super T>` the elements are some unknown supertype of `T`, so writing a `T` is safe and reading gives only `Object` [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1). PECS (the mnemonic from Joshua Bloch's *Effective Java*) is that rule from the method's side. In `Collections.copy`, `T` is chosen so that `src` produces it and `dest` consumes it, and `Collections.addAll(Collection<? super T> c, T... elements)` has the consumer half alone [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). In the lab, `Transfers.appendAll` with the same shape copies a `List<Integer>` into a `List<Number>` [Lab: VarianceTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java). The Java Tutorials state the same rule as "in" and "out" variables and add: no wildcard for a variable that is both, and none in return types [Doc: The Java Tutorials, Guidelines for Wildcard Use](https://docs.oracle.com/javase/tutorial/java/generics/wildcardGuidelines.html).

**Code.** One producer and one consumer in a single signature:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s04/Transfers.java
    public static <T> void appendAll(List<? super T> destination, List<? extends T> source) {
        for (T element : source) {
            destination.add(element);
        }
    }
```

**Follow-ups an interviewer will ask.**
- *Is a `Comparator<? super T>` a producer or a consumer?* A consumer: the method passes `T`s into `compare`. That is why `List.sort` takes `Comparator<? super E>` and `Collections.max(coll, comp)` takes `Comparator<? super T>` [Src: JDK 25, java.util.List](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/List.java) [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java).
- *Why not put wildcards on the return type too?* The caller would receive a capture it cannot name, so every call site pays for the flexibility the method did not need.

**Trap to avoid.** Reading `super` as "a supertype comes out". `? super T` describes what may go in.

</details>

<a id="q03-11"></a>
### Q03.11 · Bug hunt · `void addDefaults(List<? extends Number> list)` does not compile: why, and what is wildcard capture?

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java
    private static final String ADD_DEFAULTS_EXTENDS = "void addDefaults(List<? extends Number> list) { list.add(0); }";
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** `list.add(0)` is rejected (`compiler.err.prob.found.req`): the list may be a `List<Double>`, and the compiler cannot prove an `Integer` belongs in it. The method writes, so its parameter is a consumer and should be `List<? super Integer>`, which compiles. Wildcard capture is how the compiler types such a list: it replaces `?` with a fresh, unnamed type variable, and nothing but `null` is a value of that type.

**Full explanation.** When an expression of type `List<? extends Number>` is used, capture conversion turns it into `List<CAP#1>`, where `CAP#1` is a new type variable whose upper bound is `Number` [Doc: JLS §5.1.10](https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.10). `add(CAP#1)` then needs an argument of that unknown type, and `Integer` is not known to be one. The lab compiles both declarations in memory [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). Each mention of the variable is captured separately, which is why even `list.set(0, list.get(1))` on a `List<?>` fails: the compiler cannot see that both captures are the same type. A private generic helper `<E> void swap(List<E> list)` gives the unknown type one name, and the call compiles [Lab: WildcardCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/WildcardCompileRulesTest.java). The fix: `void addDefaults(List<? super Integer> list)`.

**Code.** The capture helper from §4:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s04/Transfers.java
    private static <E> void swapFirstTwoCaptured(List<E> list) {
        E first = list.get(0);
        list.set(0, list.get(1));
        list.set(1, first);
    }
```

**Follow-ups an interviewer will ask.**
- *Is a `List<? extends Number>` read-only then?* No. `add(null)`, `remove(0)` and `clear()` all work through it [Lab: VarianceTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s04/VarianceTest.java), so do not use it as an immutability guarantee; use an unmodifiable list.
- *Why make the helper private?* It is an implementation detail; the public signature stays `List<?>`, which is simpler for callers.

**Trap to avoid.** Fixing it with a cast to `List<Number>` or a raw `List`. It compiles and turns the compile error into heap pollution in the caller's `List<Double>`.

</details>

<a id="q03-12"></a>
### Q03.12 · Difference · `List<?>` vs `List<Object>` vs raw `List`

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** `List<?>` is a list of one unknown type: any list can be passed, reading gives `Object`, and only `null` can be added. `List<Object>` is a list that holds any object: any element can be added, but only a `List<Object>` can be passed. A raw `List` accepts both, any list and any element, and checks neither, with warnings.

**Full explanation.** The three differ on two axes, which lists can be assigned to them and what can be added through them:

| Type | Accepts a `List<String>`? | `add(1)`? | Checked by the compiler? |
|---|---|---|---|
| `List<?>` | yes | no, only `null` | yes |
| `List<Object>` | no | yes | yes |
| raw `List` | yes | yes, with an `unchecked` warning | no |

`List<String>` is a subtype of `List<?>` because `?` contains every type argument, and not of `List<Object>`, because generic types are invariant [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1) [Doc: JLS §4.10.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.2). The raw type's members are erased, so its `add` takes `Object` [Doc: JLS §4.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.8). The lab compiles every cell of the table: the rejected ones fail with `compiler.err.prob.found.req`, and the raw `add` compiles with `rawtypes` and `unchecked` warnings [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). Use `List<?>` for code that only needs "some list" (size, printing, clearing), `List<Object>` for a genuinely heterogeneous list you own, and the raw type only where legacy code forces it.

**Follow-ups an interviewer will ask.**
- *Is `List<?>` the same as `List<? extends Object>`?* Yes: the unbounded wildcard is equivalent to `? extends Object` [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1).
- *Which one does `instanceof` accept?* `List<?>` and the raw `List`, which ask only about the class; `List<Object>` is rejected from an `Object` operand like any other type argument [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java) ([Q03.15](#q03-15)).

**Trap to avoid.** Replacing a raw `List` parameter with `List<Object>` "to remove the warning". Every caller passing a `List<String>` then stops compiling; `List<?>` is the safe replacement for read-only use.

</details>

<a id="q03-13"></a>
### Q03.13 · Production scenario · A shared library takes `List<Event>`, and every caller copies its `List<OrderPlaced>` to call it

*As the interviewer frames it:* "Our platform library has `EventBus.publishAll(List<Event> events)`. Twelve services call it. Each has a `List<OrderPlaced>` or `List<PaymentCaptured>` (both implement `Event`) and writes `bus.publishAll(new ArrayList<>(orders))`. A profiler shows those copies in the allocation hot path of the busiest service, at batch sizes around 5,000. Teams ask whether the library can be fixed without breaking anyone."

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** The parameter is invariant, so a `List<OrderPlaced>` is not a `List<Event>` and callers copy to satisfy the compiler. `publishAll` only reads, so change the parameter to `List<? extends Event>`: every subtype list is accepted directly, existing calls with a `List<Event>` still compile, and the erasure stays `publishAll(List)`, so already-compiled callers keep linking. Then remove the copies.

**Full explanation.** *What the symptoms tell you:* a defensive copy at every call site, for every subtype, points at a signature rather than at the callers. *Hypotheses, ranked:* (1) an invariant producer parameter; (2) the library mutates the list, and the copy protects callers; (3) the library keeps the list after the call, and the copy protects it. *Evidence:* read the library's `publishAll` body. If it only iterates, hypothesis 1 holds. Any `add`, `set` or stored reference supports 2 or 3, and then the copy belongs inside the library. Compiling a call with a `List<OrderPlaced>` reproduces the rejection, `compiler.err.prob.found.req`, and the same call compiles against `List<? extends Event>` [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). *Fix:* `publishAll(List<? extends Event> events)`, the producer half of PECS ([Q03.10](#q03-10)). It is source-compatible, since `List<Event>` is itself a `List<? extends Event>`, and binary-compatible, since erasure removes type arguments, so both declarations erase to `publishAll(List)` [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6). The lab compiles both versions and compares their erased parameter types [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). *Prevention:* a review rule for public APIs, `? extends` on parameters the method reads and `? super` on those it writes; a compile-only test in the library that calls each public method with a subtype collection; and the allocation profile of the busy service as the metric that confirms the copies are gone.

**Follow-ups an interviewer will ask.**
- *What if the library does store the list?* Then copy once inside the library (`List.copyOf(events)`), where the ownership decision lives, and still take `List<? extends Event>`.
- *Would `Collection<? extends Event>` be better?* If the method only iterates, yes: it also accepts sets and queues. Widening the parameter type is source-compatible for callers but changes the erasure, so it needs a new method or a major version.

**Trap to avoid.** Changing the parameter to `List<Object>` or a raw `List`. The first still rejects `List<OrderPlaced>`; the second accepts it by turning type checking off.

</details>

<a id="q03-14"></a>
### Q03.14 · Concept · Type erasure: what the compiler removes, what the class file keeps, and what reflection can still see

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** javac replaces each type variable with the erasure of its leftmost bound and each parameterized type with its raw type, and inserts casts where an erased value is used at its real type. The class file still records every declared generic signature (of classes, fields, methods and parameters) in `Signature` attributes, which reflection reads. What no longer exists is the type argument of an individual object: an `ArrayList<String>` instance does not know about `String`.

**Full explanation.** Erasure maps `G<T1,…,Tn>` to `G`, a type variable to the erasure of its leftmost bound, and every method signature to one without parameterized types or type variables [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6). So there is one class for every parameterization: in the lab `ArrayList<String>` and `ArrayList<Integer>` share `ArrayList.class` [Lab: ErasureTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureTest.java). The JVM never sees the type arguments, but a `Signature` attribute keeps the declaration for classes, fields, methods and record components that use type variables or parameterized types [Doc: JVMS §4.7.9](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.7.9). In the lab, `getType()` of the `Ledger.entries` field is the raw `List`, while `getGenericType()` returns `List<Money>` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). Erasure also forces javac to emit bridge methods where an override has a different erased descriptor ([Q03.16](#q03-16)). Everything that reads types at run time, from Spring's `ResolvableType` to super type tokens, reads those declared signatures ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)).

**Follow-ups an interviewer will ask.**
- *Why did Java choose erasure?* Migration compatibility: generic code had to run with, and be called from, pre-generics class files, which is also why raw types exist ([§1](#1-why-generics-compile-time-safety-and-raw-types)).
- *Can you get the element type of a local `List<String>` variable at run time?* No. Reflection has no API for local variables, and the object carries no type argument; pass a `Class<T>` or a type token ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)).

**Trap to avoid.** "All generic information is gone at run time." Declarations survive; only per-object type arguments are erased.

</details>

<a id="q03-15"></a>
### Q03.15 · Output · `new ArrayList<String>().getClass() == new ArrayList<Integer>().getClass()`, and `instanceof List<String>`

What does this print? And does `Object o = …; o instanceof List<String>` compile?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_15.java
List<String> strings = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
Object o = strings;

System.out.println(strings.getClass() == numbers.getClass());
System.out.println(strings.getClass().getName());
System.out.println(o instanceof List<?>);
System.out.println(strings instanceof ArrayList<String>);
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).**

```text
true
java.util.ArrayList
true
true
```

Both lists have the one runtime class `ArrayList`. `o instanceof List<String>` does not compile (`compiler.err.instanceof.reifiable.not.safe`): from an `Object`, nothing at run time can check the `String`. `List<?>` asks only about the class, and `ArrayList<String>` from a `List<String>` is safe, because the type argument is already known statically.

**Full explanation.** All parameterizations of a generic class share one class at run time [Doc: JLS §8.1.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.2), so `getClass()` cannot tell them apart and its name has no type argument. `instanceof` requires the operand to be checked cast compatible with the type, that is, the cast must not be unchecked [Doc: JLS §15.20.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.20.2). From `Object` to `List<String>` the cast would be unchecked, so javac rejects it. From `List<String>` to `ArrayList<String>` only the class needs checking, which the JVM can do, so it compiles; that is allowed since Java 16, when the rule was relaxed from requiring a reifiable type ([§5](#5-type-erasure-and-bridge-methods)). The lab asserts the four lines and the compile error key [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).

**Follow-ups an interviewer will ask.**
- *How do you check that a list from an `Object` holds only strings?* Test `instanceof List<?>`, then check the elements, or better, change the API so the type is known; `Collections.checkedList` guards future writes, not existing contents.
- *Does a pattern change the rule?* No. `o instanceof List<String> l` is rejected for the same reason; the pattern only adds a binding.

**Trap to avoid.** Reading `strings instanceof ArrayList<String>` as a check of the elements. It checks only the class; the `<String>` was already guaranteed by the static type `List<String>`.

</details>

<a id="q03-16"></a>
### Q03.16 · Output · Which methods does `getDeclaredMethods()` return for a class that implements `Comparable<Money>`?

`Money` is `record Money(long cents) implements Comparable<Money>` with one hand-written method, `compareTo(Money)`. What does this print?

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_16.java
    public static void main(String[] args) {
        Arrays.stream(Money.class.getDeclaredMethods())
                .map(Q03_16::describe)
                .sorted()
                .forEach(System.out::println);
    }

    private static String describe(Method method) {
        String parameters = Arrays.stream(method.getParameterTypes())
                .map(Class::getSimpleName)
                .collect(Collectors.joining(", "));
        String flags = (method.isBridge() ? " bridge" : "") + (method.isSynthetic() ? " synthetic" : "");
        return method.getName() + "(" + parameters + ")" + flags;
    }
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).**

```text
cents()
compareTo(Money)
compareTo(Object) bridge synthetic
equals(Object)
hashCode()
toString()
```

Two `compareTo` methods: the one in the source, and a bridge `compareTo(Object)` that javac generated because the interface method erases to `compareTo(Object)`. The other four are the record's accessor and its implicitly declared `equals`, `hashCode` and `toString`.

**Full explanation.** `Comparable<T>.compareTo(T)` erases to `compareTo(Object)`, while `Money.compareTo(Money)` has a different descriptor, so a call through the interface would not reach it. javac therefore emits `compareTo(Object)`, which casts its argument to `Money` and delegates, flagged `ACC_BRIDGE` and `ACC_SYNTHETIC` [Doc: JVMS §4.6](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.6). Reflection reports both, and `isBridge()` tells them apart [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). The bridge's cast is also why a raw call with the wrong type throws `ClassCastException` [Lab: ErasureTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/ErasureTest.java). The lab sorts the lines because the elements of the returned array "are not sorted and are not in any particular order" [Src: JDK 25, java.lang.Class](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Class.java), then asserts all six [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).

**Follow-ups an interviewer will ask.**
- *Why does this matter outside an interview?* Any code that scans methods by name, such as a home-grown event dispatcher, sees the bridge too and may call a handler twice; that incident is [Q03.18](#q03-18).
- *How does a framework find the real method behind a bridge?* Spring's `BridgeMethodResolver.findBridgedMethod` returns the method the bridge delegates to; the lab runs it on `Money` [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java).

**Trap to avoid.** Indexing into `getDeclaredMethods()` (`methods[0]`) in a test or framework. The order is unspecified; filter by name and `isBridge()`.

</details>

<a id="q03-17"></a>
### Q03.17 · Bug hunt · `process(List<Order>)` beside `process(List<Invoice>)`: why does adding the overload break the build?

A class has `void process(List<Order> orders)`. A teammate adds `void process(List<Invoice> invoices)` and the build fails. Why, and what are the fixes?

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Both methods erase to `process(List)`, and a class cannot have two methods with the same name and the same erasure, so javac reports `compiler.err.name.clash.same.erasure`. Fix it with a different name (`processInvoices`) or with a parameter whose erased type differs (`process(Set<Invoice>)`).

**Full explanation.** Overloads are legal only when their signatures differ, and type arguments do not count once they are erased: "a class cannot have two member methods with the same name and type erasure" [Doc: JLS §8.4.8.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3). Constructors follow the same rule [Doc: JLS §8.8.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.8.2). The reason is the class file: both would become the descriptor `(Ljava/util/List;)V`, and the JVM could not tell which one a call means ([§5](#5-type-erasure-and-bridge-methods)). The lab compiles the clash and both fixes in memory [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). The name is usually the better fix: two `process` methods that differ only by container type are hard to call correctly, because the caller's static type picks the overload.

**Follow-ups an interviewer will ask.**
- *Why did it compile until the second method was added?* One method has nothing to clash with. The error appears at the declaration that creates the duplicate erasure, often in a later change by someone else.
- *Would `process(List<? extends Document>)` with an `instanceof` inside work?* It compiles, but the type test on elements replaces what overloading was meant to do; a separate method per type, or a `Document` interface with polymorphic behavior, is clearer.

**Trap to avoid.** "Overloading uses the full generic type." Overload resolution happens at compile time with generic types, but declarations must still differ after erasure.

</details>

<a id="q03-18"></a>
### Q03.18 · Production scenario · A reflection-based event dispatcher calls every handler twice after handlers implement `Handler<E>`

*As the interviewer frames it:* "Our in-house event bus finds handler methods by reflection: every method named `handle` with one parameter that accepts the event. Last sprint we introduced `interface Handler<E> { void handle(E event); }` and made the handlers implement it. Since the release, every `OrderPlaced` email goes out twice. The bus code did not change, and the handlers' bodies did not change."

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Implementing `Handler<OrderPlaced>` made javac add a bridge method `handle(Object)` to each handler, next to `handle(OrderPlaced)`. The dispatcher's filter (name `handle`, one parameter that accepts the event) matches both, and the bridge delegates to the real method, so each event is delivered twice. Skip methods where `isBridge()` is true.

**Full explanation.** *What the symptoms tell you:* exactly twice, for every handler, starting with a change to the type hierarchy and not to the bodies, points at something the compiler generated. *Hypotheses, ranked:* (1) the scan finds a second, compiler-generated method; (2) handlers are registered twice (for example, once by the interface and once by the class); (3) the broker redelivers. *Evidence:* log each matched `Method` at registration; two entries per handler, one with `isBridge()` and `isSynthetic()` true and a parameter of type `Object`, confirm hypothesis 1. `javap -p` on a handler class shows the same pair, and a redelivery would show two message IDs in the broker log instead of one. *Mechanism:* `Handler<E>.handle(E)` erases to `handle(Object)`, so javac emits a bridge with that descriptor that casts and calls `handle(OrderPlaced)` [Doc: JVMS §4.6](https://docs.oracle.com/javase/specs/jvms/se25/html/jvms-4.html#jvms-4.6). `getDeclaredMethods()` returns both ([Q03.16](#q03-16)). In the lab, a dispatcher that matches by name calls the handler twice, and the same dispatcher with a `!method.isBridge()` filter calls it once [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). *Fix:* filter out bridge methods, or better, stop scanning: dispatch through the interface (`handler.handle(event)`), which the JVM routes through the bridge exactly once. If the scan must stay, Spring's `BridgeMethodResolver.findBridgedMethod` maps a bridge to the method it calls [Lab: BridgeMethodTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s05/BridgeMethodTest.java). *Prevention:* a dispatcher test with a handler that implements a generic interface, and an idempotency key on side effects such as emails, so one duplicate delivery cannot reach a customer. Monitor sent-email counts per order ID.

**Code.** The dispatcher; the `Scan` strategy decides whether bridges are skipped:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_18.java
    public static void dispatch(Object handler, Object event, Scan scan)
            throws IllegalAccessException, InvocationTargetException {
        for (Method method : handler.getClass().getDeclaredMethods()) {
            if (isHandlerFor(method, event) && scan.accepts(method)) {
                method.invoke(handler, event);
            }
        }
    }

    private static boolean isHandlerFor(Method method, Object event) {
        return method.getName().equals(HANDLE)
                && method.getParameterCount() == 1
                && method.getParameterTypes()[0].isInstance(event);
    }
```

**Follow-ups an interviewer will ask.**
- *Why does the bridge accept an `OrderPlaced`?* Its parameter type is `Object`, so `isInstance` is true for any event; the bridge then casts to `OrderPlaced` and delegates.
- *Would checking `getParameterTypes()[0] == event.getClass()` fix it?* For this case, yes, but it breaks handlers declared for a supertype of the event. Skipping bridges keeps the intended matching.

**Trap to avoid.** Looking for a double registration or a broker redelivery first. The release changed only the type hierarchy, and the duplicate is a method the source does not contain.

</details>

<a id="q03-19"></a>
### Q03.19 · Concept · Reifiable types: why `new T[]` and `new List<String>[]` are illegal, and how `ArrayList<E>` stores its elements

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** An array checks every store against its component type at run time, so it needs a component type that exists at run time: a reifiable type. `T` and `List<String>` are erased, so `new T[n]` and `new List<String>[n]` are compile errors (`compiler.err.generic.array.creation`); `new List<?>[n]` is allowed. `ArrayList<E>` avoids the problem by storing an `Object[]` and casting each element on the way out.

**Full explanation.** Reifiable types are those fully available at run time: primitives, non-generic types, raw types, parameterized types whose arguments are all unbounded wildcards, and arrays of those [Doc: JLS §4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.7). Creating an array whose element type is not reifiable is a compile-time error [Doc: JLS §15.10.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.10.1), because the array could not keep its promise: a `List<String>[]` would let a `List<Integer>` past the store check, which only knows `List` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java). The lab asserts the error keys and that `new List<?>[3]` compiles [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java). `ArrayList` declares `transient Object[] elementData` and reads with `(E) elementData[index]` [Src: JDK 25, java.util.ArrayList](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/ArrayList.java); the `(E)` erases to nothing, and the real check is the cast at the caller ([§6](#6-reifiable-types-generic-arrays-and-heap-pollution)).

**Follow-ups an interviewer will ask.**
- *How do you get a real `T[]`?* From a `Class<T>` with `Array.newInstance`, or let the caller allocate, as `Collection.toArray(IntFunction<T[]>)` does [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java).
- *Is `(T[]) new Object[n]` acceptable?* Inside a class whose array never escapes, yes, and `ArrayList` does the equivalent. Returning that array to a caller is the bug in [Q03.20](#q03-20) and the §6 callout.

**Trap to avoid.** "`ArrayList<String>` is backed by a `String[]`." It is backed by an `Object[]`; `toArray(new String[0])` is how you get a `String[]` out of it.

</details>

<a id="q03-20"></a>
### Q03.20 · Output · Bug hunt · A generic `pickTwo(T a, T b, T c)` built on a varargs `toArray(T...)`: what does `String[] s = pickTwo("a", "b", "c")` do?
<!-- ledger: core-java-240-06-20 -->

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/outputs/Q03_20.java
    public static void main(String[] args) {
        String[] picked = pickTwo("a", "b", "c");
        System.out.println(picked.length);
    }

    @SuppressWarnings("unchecked") // the generic array creation for toArray(a, b) is the bug this question shows
    public static <T> T[] pickTwo(T a, T b, T c) {
        return toArray(a, b);
    }

    @SuppressWarnings("unchecked") // the warning is right: returning the varargs array exposes it to callers
    private static <T> T[] toArray(T... args) {
        return args;
    }
```

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Nothing is printed. `String[] picked = pickTwo("a", "b", "c")` throws `ClassCastException`: `[Ljava.lang.Object;` cannot be cast to `[Ljava.lang.String;`. Inside `pickTwo`, `T` is erased to `Object`, so the array javac builds for the varargs call `toArray(a, b)` is an `Object[]`, and it escapes to a caller that needs a `String[]`.

**Full explanation.** A varargs call creates an array of the parameter's type. In `pickTwo` that type is `T[]`, and the only class javac can use for an erased `T` is `Object`, so it creates `new Object[]{a, b}`; that is the "unchecked generic array creation" javac warns about at the call [Doc: JLS §9.6.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7). `toArray` returns the array unchanged and `pickTwo` returns it as `T[]`, which costs nothing at run time. The caller chose `T = String` and needs a `String[]`, so javac inserted a cast to `String[]` there, and an `Object[]` is not one. In the lab, the call throws with both array names in the message; the same call stored in an `Object[]` variable works and holds `"a"` and `"b"`; and compiling the two methods with `-Xlint:unchecked` gives `compiler.warn.unchecked.varargs.non.reifiable.type` at `toArray` and `compiler.warn.unchecked.generic.array.creation` at the call [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java). The bug is `toArray` exposing its varargs array. The fix: return `List<T>` (`List.of(a, b)`), or take an `IntFunction<T[]>` and let the caller allocate. How varargs take part in overload resolution is [Q01.19](01-java-oop-fundamentals.md#q01-19).

**Follow-ups an interviewer will ask.**
- *Why does `toArray("a", "b")` called directly from `main` work?* There `T = String` is known at the call site, so javac creates a real `String[]`. The bug appears only when the varargs call happens inside another generic method.
- *Would `@SafeVarargs` on `toArray` fix it?* It would only remove the warnings. Returning the array is exactly what the annotation promises not to do ([Q03.21](#q03-21)).

**Trap to avoid.** Saying the exception is thrown inside `toArray` or `pickTwo`. Both run fine; the cast that fails is in the caller's assignment.

</details>

<a id="q03-21"></a>
### Q03.21 · Concept · `@SafeVarargs`: where it is allowed, what it promises, and when it is a lie

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** It is allowed on static, final and private methods and on constructors, the declarations no override can replace. It promises that the body does nothing unsafe with its varargs array: no stores into it, and no exposing it. javac does not check the promise; it only removes the heap-pollution warnings at the declaration and at every call site. It is a lie when the body writes into the array or lets it escape.

**Full explanation.** The annotation is "a programmer assertion that the body of the annotated method or constructor does not perform potentially unsafe operations on its varargs parameter" [Src: JDK 25, java.lang.SafeVarargs](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/SafeVarargs.java). Because the promise is about one body, the JLS makes it a compile-time error on a variable-arity method that is neither static, final nor private [Doc: JLS §9.6.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7); private methods are allowed since Java 9 [Doc: JEP 213](https://openjdk.org/jeps/213). In the lab, it fails on a plain instance method with `compiler.err.varargs.invalid.trustme.anno` and removes both warnings from a static `listOf` [Lab: GenericArrayCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayCompileRulesTest.java). Honest uses only read the elements, as `Collections.addAll` does, which the JLS names as the canonical example [Doc: JLS §9.6.4.7](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.6.4.7). The lab's `VarargsPollution` carries a false `@SafeVarargs`, stores a `List<Integer>` through an `Object[]` view, compiles without a warning and fails with `ClassCastException` [Lab: GenericArrayTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s06/GenericArrayTest.java).

**Code.** The lie, kept on purpose in the lab:

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m03/s06/VarargsPollution.java
    @SafeVarargs // A lie on purpose: the body stores into the array, which is what @SafeVarargs promises not to do.
    public static String firstElement(List<String>... lists) {
        Object[] view = lists;
        view[0] = List.of(NOT_A_STRING);
        return lists[0].get(0);
    }
```

**Follow-ups an interviewer will ask.**
- *Why not allow it on overridable methods?* An override could have an unsafe body, and the annotation on the parent would silence warnings at every call through the parent's type.
- *What should a reviewer check?* That the method neither assigns to the array's elements nor returns, stores or passes the array to code that might; reading and iterating are fine.

**Trap to avoid.** Adding `@SafeVarargs` to make a warning go away. The warning is the only signal that the method might pollute the heap.

</details>

<a id="q03-22"></a>
### Q03.22 · Design · Super type tokens: how `ParameterizedTypeReference<List<Order>>` keeps what erasure removes, and where it stops working

You are designing a client library method that returns a deserialized body of any type, including `List<Order>`. How do you let callers say which type they want, and what are the limits?

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Offer two overloads: one taking `Class<T>` for plain types, and one taking a super type token, `ParameterizedTypeReference<T>`, for types with type arguments. A token works because `new ParameterizedTypeReference<List<Order>>() {}` declares an anonymous subclass whose superclass, with its type argument, is written in the class file; `getGenericSuperclass()` reads it back. It stops working when the type argument is itself a type variable: a token created inside a generic helper records `T`, not the caller's type.

**Full explanation.** `Class` objects cannot express `List<Order>`; `List.class` is the raw type ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)). Erasure removes type arguments from objects, but the declared superclass of a class is kept in its `Signature` attribute ([Q03.14](#q03-14)). Spring's `ParameterizedTypeReference` has a protected constructor that reads that superclass and keeps its single type argument for `getType()` [Src: Spring Framework 7.0.10, ParameterizedTypeReference](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ParameterizedTypeReference.java), the idea of Gafter's "Super Type Tokens" [Doc: Neal Gafter, Super Type Tokens (2006)](https://gafter.blogspot.com/2006/12/super-type-tokens.html). `RestClient.ResponseSpec` follows exactly the two-overload design: `body(Class<T>)` and `body(ParameterizedTypeReference<T>)` [Src: Spring Framework 7.0.10, RestClient](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-web/src/main/java/org/springframework/web/client/RestClient.java). The limit: `static <T> … listOf() { return new ParameterizedTypeReference<List<T>>() {}; }` records `List<T>` for every caller [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java). A generic helper must therefore take the token from its caller, or build the type at run time from `Class` objects: `ResolvableType.forClassWithGenerics(List.class, elementType).getType()` gives `List<String>` for `String.class`, and `ParameterizedTypeReference.forType` wraps it [Lab: Q03OutputsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java).

**Code.** Building the type from a `Class` token inside a generic helper:

```java
// Excerpt of labs/java-language/src/test/java/dev/interview/javalanguage/m03/outputs/Q03OutputsTest.java
    private static <T> Type listTypeOf(Class<T> elementType) {
        return ResolvableType.forClassWithGenerics(List.class, elementType).getType();
    }
```

**Follow-ups an interviewer will ask.**
- *Why is the constructor protected and the class abstract?* So the only way to make one is an anonymous subclass, which is what carries the type; the lab's plain `TypeToken` rejects a raw subclass with `IllegalStateException` [Lab: SuperTypeTokenTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s07/SuperTypeTokenTest.java).
- *Each `new … {}` is a new class. Does that matter?* Each is one more class to load, so declare tokens for fixed types as `static final` constants, which also documents the expected type in one place.

**Trap to avoid.** Writing `body(List.class)` "because the variable is `List<Order>`". The converter only receives `List.class` and builds maps; that incident is the §7 callout.

</details>

<a id="q03-23"></a>
### Q03.23 · Concept · Reading JDK signatures: `Collections.max` and `Stream.collect`, part by part

<details>
<summary>Answer</summary>

**Short answer (30 seconds).** Read type parameters, then bounds, then each parameter as producer or consumer, then the return type. `<T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll)`: `T` must be comparable with itself or a supertype, the collection produces `T`s, and `Object &` makes the erased return type `Object`, as before generics. `<R, A> R collect(Collector<? super T, A, R> collector)`: the collector consumes the stream's `T`s, `A` is its hidden accumulation type, and the caller gets `R`.

**Full explanation.** Both declarations are in JDK 25 as quoted [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java) [Src: JDK 25, java.util.stream.Stream](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Stream.java). In `max`, `Comparable<? super T>` admits `LocalDate`, which is `Comparable<ChronoLocalDate>` ([Q03.08](#q03-08)), and `? extends T` lets the method choose a `T` wider than the element type. A type variable erases to its first bound, so with `Object` first the erased method still returns `Object`, which old class files depend on [Doc: Gilad Bracha, Generics in the Java Programming Language (2004), §10](https://www.oracle.com/technetwork/java/javase/generics-tutorial-159168.pdf); in the lab `getReturnType()` is `Object.class`, and a look-alike without `Object &` erases to `Comparable` [Lab: JdkSignatureReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java). In `collect`, `T` belongs to the stream and `R` and `A` to the method; the `Collector` Javadoc calls `A` "often hidden as an implementation detail", which is why `Collectors.toList()` returns `Collector<T, ?, List<T>>` [Src: JDK 25, java.util.stream.Collector](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Collector.java). `? super T` lets one `Collector<Object, ?, String>` collect a `Stream<Integer>`; an invariant look-alike rejects that call [Lab: JdkSignatureCompileRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCompileRulesTest.java). How collectors run is module [05](05-java-lambdas-streams-optional.md).

**Follow-ups an interviewer will ask.**
- *Read `Map.computeIfAbsent(K, Function<? super K, ? extends V>)`.* No new type parameters; the function consumes a key and produces a value, so a `Function<CharSequence, ArrayList<String>>` fits a `Map<String, List<String>>` [Lab: JdkSignatureCallsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureCallsTest.java).
- *Why does `max` return `T` and not `? extends T`?* A wildcard in a return type would force every caller to handle a capture; the return is the plain type, as the PECS guidelines advise ([Q03.10](#q03-10)).

**Trap to avoid.** Calling `Object &` redundant. It is redundant for type checking and decisive for the erased signature.

</details>

## Hands-on exercises

<a id="ex03-1"></a>
### Exercise 03.1 · A type-safe heterogeneous container

**Problem.** A web service keeps per-request objects (the tenant, the caller's `Locale`, a retry budget) in a `Map<String, Object>` and reads them with `<T> T get(String key)`. When a filter stores the wrong kind of value, the `ClassCastException` appears in whichever handler reads it, far from the line that stored it ([Q03.06](#q03-06)). Write a `RequestContext` that holds at most one value per type and catches a wrong value at the moment it is stored.

**Constraints.** JDK only. No `@SuppressWarnings` and no unchecked cast in the solution. The key is the value's type, so the container holds one entry per class.

**Acceptance criteria.**
- [ ] (1) `put(Class<T>, T)` then `get(Class<T>)` returns the instance with static type `T`; the caller needs no cast and compiles with no warning under `-Xlint:all`.
- [ ] (2) A value of the wrong run-time type smuggled in through a raw `Class` is rejected at `put` with `ClassCastException`, and nothing is stored.
- [ ] (3) A `null` type is rejected by `put` and by `get` with a `NullPointerException` that names it.
- [ ] (4) `String` and `Integer` entries are stored and retrieved independently.

<details><summary>Hint 1</summary>

If the key is a `Class<T>` and not a `String`, what does the compiler know about the value at `get` that it did not know before ([§2](#2-generic-types-generic-methods-and-type-inference))?

</details>

<details><summary>Hint 2</summary>

The map itself can only be `Map<Class<?>, Object>`: no single type argument relates each key to its value. Which method of `Class` checks an `Object` and hands it back as a `T` without an unchecked cast ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens))?

</details>

<details><summary>Worked solution</summary>

**Approach.** The method's type parameter ties the key to the value; `Class.cast` enforces that tie at run time, where erasure removed it ([§5](#5-type-erasure-and-bridge-methods)).
1. Store entries in a `Map<Class<?>, Object>`. The wildcard accepts any key; the map no longer promises anything about values, so the methods must.
2. Declare `<T> void put(Class<T> type, T value)`. Generic callers cannot pass a `Locale` for `Class<Integer>`, and raw callers get an unchecked warning.
3. Reject a `null` type first, then store `type.cast(value)`. `cast` throws `ClassCastException` for a non-null value that is not an instance of the class, and its message is "Cannot cast" plus both class names [Src: JDK 25, java.lang.Class](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Class.java). A smuggled value fails here, before the `put` into the map.
4. In `<T> T get(Class<T> type)`, return `type.cast(values.get(type))`. Every stored value already passed the check, so this second `cast` cannot fail; it is there because it converts `Object` to `T` with no unchecked warning. A missing entry returns `null`, which `cast` passes through.

```java
package dev.interview.javalanguage.m03.ex1;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

// Module 03 Ex03.1: a type-safe heterogeneous container. The key is the value's Class, so put and get agree on T,
// and Class.cast checks each value where it enters, not where some later caller reads it.
public final class RequestContext {

    private static final String TYPE = "type";

    private final Map<Class<?>, Object> values = new HashMap<>();

    public <T> void put(Class<T> type, T value) {
        Objects.requireNonNull(type, TYPE);
        values.put(type, type.cast(value));
    }

    public <T> T get(Class<T> type) {
        Objects.requireNonNull(type, TYPE);
        return type.cast(values.get(type));
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex1/RequestContext.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex1/RequestContext.java)</sub>

**How each criterion is met** [Lab: RequestContextTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex1/RequestContextTest.java):
- (1) `Ex03.1 · (1) get returns the stored instance with static type T`: `Locale locale = context.get(Locale.class)` returns the same `Locale.CANADA_FRENCH`. `Ex03.1 · (1) a caller compiles with no cast and no warning under -Xlint:all`: the same calls, compiled in memory against the lab class, succeed with zero warnings.
- (2) `Ex03.1 · (2) a value smuggled in through a raw Class is rejected at put`: `put(raw, "not a number")` with `raw = Integer.class` throws with `java.lang.String` and `java.lang.Integer` in the message, and `get(Integer.class)` then returns `null`. `Ex03.1 · (2) the raw-Class call compiles only with an unchecked warning`: javac reports `compiler.warn.unchecked.meth.invocation.applied` for it.
- (3) `Ex03.1 · (3) a null type is rejected by put …` and `… by get …`: both throw `NullPointerException` with the message `type`.
- (4) `Ex03.1 · (4) String and Integer entries are stored and retrieved independently`: the tenant `"acme"` and the retry budget `3` come back from their own keys.

**Alternative approach:** typed keys, `record Key<T>(String name, Class<T> type)`, with `put(Key<T>, T)` and `get(Key<T>)`. **Trade-offs:** several entries of one type become possible (two `String`s, tenant and user), and a key can carry a description, at the cost of a key constant per entry. A `Class` key is shorter and admits exactly one value per class, which suits a context of distinct types.

**Interviewer follow-ups.**
- *Can it hold a `List<Order>`?* Not as such: `List<Order>.class` cannot be written [Doc: JLS §15.8.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.8.2), and a `List.class` key would accept any list. Keying by a super type token instead is [Exercise 03.3](#ex03-3) and [§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens).
- *What does `put(int.class, 3)` do?* It compiles, because `int.class` has type `Class<Integer>` [Doc: JLS §15.8.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.8.2). `Class.isInstance` returns `false` for every object when the class represents a primitive type, so `cast` throws [Src: JDK 25, java.lang.Class](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Class.java). Use the wrapper class as the key.
- *Is it thread-safe?* No; `HashMap` is not. A request context usually lives on one thread. If it is shared, a `ConcurrentHashMap` works, but it allows no `null` key or value [Src: JDK 25, java.util.concurrent.ConcurrentHashMap](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/concurrent/ConcurrentHashMap.java), so a `null` value must then be rejected explicitly. `ConcurrentHashMap` internals are module [12](12-concurrency-locks-atomics-collections.md).

**Tests:** [RequestContextTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex1/RequestContextTest.java).

</details>

<a id="ex03-2"></a>
### Exercise 03.2 · Generic utilities with the right bounds and wildcards

**Problem.** A shared reporting library has two helpers: `<T extends Comparable<T>> T max(Collection<T> values)` and `<T> void copyMatching(List<T> src, Predicate<T> keep, Collection<T> dst)`. Callers cannot pass a `List<LocalDate>` to `max`, and cannot copy `Integer`s into a `List<Number>` with a filter written for `Object`, so they copy lists and add casts. Rewrite both signatures so that these calls compile, without changing what the methods do.

**Constraints.** JDK only; no casts and no `@SuppressWarnings`. `max` keeps its name and returns the element itself, not an `Optional`.

**Acceptance criteria.**
- [ ] (1) `max(Collection<? extends T>)` with `<T extends Comparable<? super T>>` compiles for a `List<LocalDate>` and returns the latest date; the `Comparable<T>` version rejects the same call.
- [ ] (2) `max` of an empty collection throws `NoSuchElementException`.
- [ ] (3) `copyMatching(List<? extends T> src, Predicate<? super T> keep, Collection<? super T> dst)` copies `Integer`s into a `List<Number>` with a `Predicate<Object>`; the version without wildcards rejects that call.
- [ ] (4) The signature rejects writing into `src`.

<details><summary>Hint 1</summary>

`LocalDate` is not a `Comparable<LocalDate>`. What is it comparable with ([§3](#3-bounded-type-parameters), [Q03.08](#q03-08))?

</details>

<details><summary>Hint 2</summary>

For each parameter, ask whether the method reads `T`s out of it or hands `T`s to it. Then apply "producer `extends`, consumer `super`" ([§4](#4-wildcards-pecs-and-variance)). A `Predicate` is handed the elements.

</details>

<details><summary>Worked solution</summary>

**Approach.** Each fix loosens one parameter in the direction that is safe for what the method does with it.
1. `max` compares each element with another `T`, so `T` needs `compareTo` accepting a `T`. `Comparable<? super T>` says "comparable with `T` or a supertype", and `LocalDate`, a `Comparable<ChronoLocalDate>`, satisfies it.
2. `max` only reads the collection, which makes it a producer: `Collection<? extends T>`. This is the shape of `Collections.max`, which also throws `NoSuchElementException` when the collection is empty [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java).
3. Check `hasNext()` before the first `next()` and throw with a message. The iterator would throw too, but with a message that says nothing about `max`.
4. In `copyMatching`, `src` produces elements (`? extends T`), `keep` consumes them (`? super T`), and `dst` consumes them (`? super T`). For the call in criterion (3), javac can pick `T = Integer`: the list produces `Integer`s, a `Predicate<Object>` accepts them, and a `List<Number>` stores them.
5. The comparison sits in a private `larger` helper, so `max` keeps one loop and one condition.

```java
package dev.interview.javalanguage.m03.ex2;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Predicate;

// Module 03 Ex03.2: each parameter says whether it produces T or consumes T, so callers with related types fit.
public final class Selections {

    static final String EMPTY = "max of an empty collection";

    private Selections() {}

    // Comparable<? super T> admits LocalDate (a Comparable<ChronoLocalDate>); ? extends T lets T be wider than the
    // element type.
    public static <T extends Comparable<? super T>> T max(Collection<? extends T> values) {
        Iterator<? extends T> iterator = values.iterator();
        if (!iterator.hasNext()) {
            throw new NoSuchElementException(EMPTY);
        }
        T best = iterator.next();
        while (iterator.hasNext()) {
            best = larger(best, iterator.next());
        }
        return best;
    }

    // src produces T, keep consumes T, dst consumes T: producer extends, consumer super.
    public static <T> void copyMatching(List<? extends T> src, Predicate<? super T> keep, Collection<? super T> dst) {
        for (T element : src) {
            if (keep.test(element)) {
                dst.add(element);
            }
        }
    }

    private static <T extends Comparable<? super T>> T larger(T best, T candidate) {
        return candidate.compareTo(best) > 0 ? candidate : best;
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex2/Selections.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex2/Selections.java)</sub>

**How each criterion is met** [Lab: SelectionsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex2/SelectionsTest.java):
- (1) `Ex03.2 · (1) max returns the latest LocalDate of a List<LocalDate>`: 10 January, 2 March and 14 February give 2 March. `Ex03.2 · (1) a max(List<LocalDate>) caller compiles; the Comparable<T> look-alike rejects it`: compiled in memory, the caller succeeds and the look-alike fails with `compiler.err.cant.apply.symbol`.
- (2) `Ex03.2 · (2) max of an empty collection throws NoSuchElementException`, with the message `max of an empty collection`.
- (3) `Ex03.2 · (3) copyMatching copies Integers into a List<Number> with a Predicate<Object>`: `[1, null, 3]` filtered by `Objects::nonNull` turns `[2.5]` into `[2.5, 1, 3]`. `Ex03.2 · (3) the invariant look-alike rejects the same Integer, Object, Number call`: `compiler.err.cant.apply.symbol`.
- (4) `Ex03.2 · (4) writing a T into List<? extends T> does not compile; into Collection<? super T> it does`: the `add` into the producer fails with `compiler.err.prob.found.req` (the in-memory compiler's key for it, as in [Q03.11](#q03-11)), and the same `add` into a `Collection<? super T>` compiles.

**Alternative approach:** drop the type parameter's bound and take a `Comparator<? super T>`, as the second `Collections.max` overload does: `<T> T max(Collection<? extends T> coll, Comparator<? super T> comp)` [Src: JDK 25, java.util.Collections](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collections.java). **Trade-offs:** it works for types with no natural order and for several orders of one type, at the cost of an argument at every call. Libraries usually offer both, and the `Comparable` form can delegate to the other with `Comparator.naturalOrder()`.

**Interviewer follow-ups.**
- *`Collections.max` declares `<T extends Object & Comparable<? super T>>`. Should `Selections.max` too?* Only to keep an old erased signature. `T` erases to its first bound [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6), so this `max` returns `Comparable` in the class file, as the §8 look-alike without `Object &` does in the lab [Lab: JdkSignatureReflectionTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/s08/JdkSignatureReflectionTest.java), which is fine for a new method; `Collections.max` needed `Object` because class files compiled before generics call it that way ([§8](#8-reading-generic-signatures-in-the-jdk), [Q03.23](#q03-23)).
- *A caller passes a `List<Integer>` and a `Collection<Object>`. Which `T` does javac pick, and does it matter?* Any `T` between `Integer` and the predicate's and destination's element types satisfies the bounds; inference picks one, and the body behaves the same for each, since it only reads, tests and adds. The wildcards are what make more than one choice valid ([§2](#2-generic-types-generic-methods-and-type-inference)).
- *A library already ships the strict signatures. Is widening them a breaking change?* For applicability, no: each argument type the strict signature accepted is contained by the matching wildcard [Doc: JLS §4.5.1](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1), and `Comparable<T>` is one of the types `Comparable<? super T>` admits. For binaries, both versions erase to `Comparable max(Collection)` and `void copyMatching(List, Predicate, Collection)` [Doc: JLS §4.6](https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.6), so compiled callers still link; [Q03.13](#q03-13) shows the same kind of change.

**Tests:** [SelectionsTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex2/SelectionsTest.java).

</details>

<a id="ex03-3"></a>
### Exercise 03.3 · A super type token from scratch

**Problem.** A service caches decoded configuration by target type, and some targets are generic: `List<String>`, `Map<String, List<Integer>>`. A `Class` key cannot tell `List<String>` from `List<Integer>` ([Exercise 03.1](#ex03-1)), and the project must not depend on Spring in this layer. Write `TypeRef<T>`, a super type token that captures the full type, rejects misuse, and can be used as a map key.

**Constraints.** JDK only in the main code (the test may use Spring to compare). No unchecked cast.

**Acceptance criteria.**
- [ ] (1) `new TypeRef<List<String>>() {}.type()` is a `ParameterizedType` with raw type `List` and argument `String`.
- [ ] (2) A raw `new TypeRef() {}` is rejected with `IllegalStateException` whose message names the problem.
- [ ] (3) Two tokens for the same type are `equals` with equal hash codes; tokens for different type arguments are not equal.
- [ ] (4) `type()` equals Spring's `new ParameterizedTypeReference<List<String>>() {}.getType()`.

<details><summary>Hint 1</summary>

Where does `List<String>` survive erasure ([§5](#5-type-erasure-and-bridge-methods))? Not in the object; in the class file of the anonymous subclass, which reflection can read ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)).

</details>

<details><summary>Hint 2</summary>

Every `new TypeRef<...>() {}` creates a different class. If `equals` is inherited from `Object`, what does a map with two such keys hold?

</details>

<details><summary>Worked solution</summary>

**Approach.** The constructor reads the type argument from the subclass's generic superclass; equality is delegated to that `Type`, whose implementations must compare by declaration and arguments.
1. Make the class abstract with a protected constructor, so a token exists only as a subclass, usually anonymous.
2. In the constructor, call `getClass().getGenericSuperclass()`. For `new TypeRef<List<String>>() {}` it is the `ParameterizedType` `TypeRef<List<String>>`, and its first actual type argument is `List<String>`.
3. A raw subclass has the plain `Class` `TypeRef` as its generic superclass. The pattern `instanceof ParameterizedType superclass` fails, and the constructor throws `IllegalStateException` with a message that shows the right form.
4. Base `equals` and `hashCode` on the captured `Type`, and make both `final` so no subclass can bring back identity equality. This works across classes because the `ParameterizedType` contract requires `equals` to equate "any two instances that share the same generic class or interface declaration and have equal type parameters" [Src: JDK 25, java.lang.reflect.ParameterizedType](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/reflect/ParameterizedType.java).
5. That same contract gives criterion (4): Spring's `ParameterizedTypeReference` keeps the type argument it reads the same way, and its own `equals` and `hashCode` delegate to the `Type` [Src: Spring Framework 7.0.10, ParameterizedTypeReference](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ParameterizedTypeReference.java).

```java
package dev.interview.javalanguage.m03.ex3;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

// Module 03 Ex03.3: a super type token. Each new TypeRef<...>() {} is a new anonymous class, so equality must come
// from the captured Type, never from the class.
public abstract class TypeRef<T> {

    static final String MISSING_TYPE_ARGUMENT =
            "TypeRef needs a type argument: write new TypeRef<List<String>>() {}, not a raw new TypeRef() {}";

    private final Type type;

    protected TypeRef() {
        this.type = capturedTypeArgument();
    }

    public final Type type() {
        return type;
    }

    @Override
    public final boolean equals(Object other) {
        return other instanceof TypeRef<?> that && type.equals(that.type);
    }

    @Override
    public final int hashCode() {
        return type.hashCode();
    }

    private Type capturedTypeArgument() {
        if (getClass().getGenericSuperclass() instanceof ParameterizedType superclass) {
            return superclass.getActualTypeArguments()[0];
        }
        throw new IllegalStateException(MISSING_TYPE_ARGUMENT);
    }
}
```
<sub>Source: [labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex3/TypeRef.java](../labs/java-language/src/main/java/dev/interview/javalanguage/m03/ex3/TypeRef.java)</sub>

**How each criterion is met** [Lab: TypeRefTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex3/TypeRefTest.java):
- (1) `Ex03.3 · (1) new TypeRef<List<String>>() {}.type() is List with the argument String`: the raw type is `List.class` and the arguments are exactly `String.class`.
- (2) `Ex03.3 · (2) a raw new TypeRef() {} is rejected with IllegalStateException naming the problem`: the message is the `MISSING_TYPE_ARGUMENT` text.
- (3) `Ex03.3 · (3) two tokens for the same type are equal and hash alike`: two `Map<String, List<Integer>>` tokens have different classes and are still equal with equal hash codes. `Ex03.3 · (3) tokens for different type arguments are not equal`: `List<String>` against `List<Integer>`.
- (4) `Ex03.3 · (4) type() equals Spring's ParameterizedTypeReference.getType() for List<String>`: equal, with equal hash codes.

**Alternative approach:** use Spring's `ParameterizedTypeReference` where Spring is already a dependency, or build the `Type` at run time from parts with `ResolvableType.forClassWithGenerics` ([Q03.22](#q03-22)). **Trade-offs:** the library version handles more cases (below) and is what Spring's HTTP clients accept; the hand-written one keeps a framework out of a layer that must not have it, at the price of owning those cases.

**Interviewer follow-ups.**
- *What if someone writes `class StringListRef extends TypeRef<List<String>> {}` and then `new StringListRef() {}`?* This `TypeRef` reads only the immediate generic superclass, which is now the plain class `StringListRef`, so it throws. Spring's constructor first walks up `getSuperclass()` to the class whose direct superclass is `ParameterizedTypeReference`, and reads that one [Src: Spring Framework 7.0.10, ParameterizedTypeReference](https://github.com/spring-projects/spring-framework/blob/v7.0.10/spring-core/src/main/java/org/springframework/core/ParameterizedTypeReference.java). Add the same walk if the API allows named subclasses.
- *Why `final` on `equals` and `hashCode`?* A token is a value: a subclass that overrode `equals` could make two equal tokens differ in a `HashMap`, which is the contract [Exercise 02.1](02-java-equality-immutability-records.md#ex02-1) protects.
- *How do you make a `TypeRef` for `List<T>` inside a generic method?* You cannot with an anonymous class: it captures the type variable `T` ([§7](#7-capturing-types-at-run-time-class-tokens-and-super-type-tokens)). Take the token from the caller, or build the type from a `Class<T>` as [Q03.22](#q03-22) does.

**Tests:** [TypeRefTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m03/ex3/TypeRefTest.java).

</details>

## Check your understanding
<!-- TASK: CLOSE-M03 -->
<!-- /TASK: CLOSE-M03 -->

## Connections
<!-- TASK: CLOSE-M03 -->
<!-- /TASK: CLOSE-M03 -->
