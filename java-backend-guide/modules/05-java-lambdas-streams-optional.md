# 05. Lambdas, streams and `Optional`

> **What this covers:** functional programming in Java from the language up: functional interfaces, lambdas and method references, and how javac and the JVM compile and run them. Then the Stream API as interviews probe it: laziness and evaluation order, collectors, primitive streams, `reduce` vs `collect`, stream gatherers, parallel streams on the common `ForkJoinPool`, checked exceptions and resources inside pipelines, and `Optional` as a return type.
> **Prerequisites:** [03. Generics and type erasure § 2. Generic types, generic methods and type inference](03-java-generics.md#2-generic-types-generic-methods-and-type-inference), [§ 4. Wildcards, PECS and variance](03-java-generics.md#4-wildcards-pecs-and-variance), [04. Collections internals § 1. The Collections Framework](04-java-collections-internals.md#1-the-collections-framework-interfaces-contracts-and-sequenced-collections), [§ 8. Immutable, unmodifiable and fixed-size lists](04-java-collections-internals.md#8-immutable-unmodifiable-and-fixed-size-lists); also useful, [01. OOP fundamentals § 11. Nested types](01-java-oop-fundamentals.md#11-nested-types) for anonymous classes
> **Leads to:** [07. Modern language features](07-java-modern-language-features.md)
> **Applies to:** Java 25
> **Study time:** ~6 hours reading + ~4 hours exercises
> **Short on time:** [1. Functional interfaces and lambda expressions](#1-functional-interfaces-and-lambda-expressions), [4. Stream pipelines: laziness, short-circuiting and encounter order](#4-stream-pipelines-laziness-short-circuiting-and-encounter-order), [10. `Optional`: a return type for maybe-absent results](#10-optional-a-return-type-for-maybe-absent-results); questions [Q05.03](#q05-03), [Q05.10](#q05-10), [Q05.14](#q05-14), [Q05.24](#q05-24), [Q05.29](#q05-29); then [Summary](#summary).
> **Labs:** [`labs/java-language/`](../labs/java-language/), package `dev.interview.javalanguage.m05`. Run: `JAVA_HOME=$(/usr/libexec/java_home -v 25) mvn -q -f java-backend-guide/labs/pom.xml -pl java-language -am verify`. Needs Docker: no.

## Contents

1. [Functional interfaces and lambda expressions](#1-functional-interfaces-and-lambda-expressions)
2. [How lambdas compile and capture: `invokedynamic` and effectively final](#2-how-lambdas-compile-and-capture-invokedynamic-and-effectively-final)
3. [Method references](#3-method-references)
4. [Stream pipelines: laziness, short-circuiting and encounter order](#4-stream-pipelines-laziness-short-circuiting-and-encounter-order)
5. [Collectors: `toMap`, `groupingBy`, `teeing` and writing your own](#5-collectors-tomap-groupingby-teeing-and-writing-your-own)
6. [Primitive streams, `flatMap`, `mapMulti` and `reduce` vs `collect`](#6-primitive-streams-flatmap-mapmulti-and-reduce-vs-collect)
7. [Stream gatherers](#7-stream-gatherers)
8. [Parallel streams and the common `ForkJoinPool`](#8-parallel-streams-and-the-common-forkjoinpool)
9. [Checked exceptions and resources in lambdas and streams](#9-checked-exceptions-and-resources-in-lambdas-and-streams)
10. [`Optional`: a return type for maybe-absent results](#10-optional-a-return-type-for-maybe-absent-results)
- [Summary](#summary)
- [Question bank](#question-bank)
- [Hands-on exercises](#hands-on-exercises)
- [Check your understanding](#check-your-understanding)
- [Connections](#connections)

## 1. Functional interfaces and lambda expressions
### The problem it solves

A pricing service filters products with rules that change every quarter: "not blank", "not on the banned list", "in stock". Before Java 8 each rule was an anonymous class: five lines of `new Predicate<Product>() { @Override public boolean test(Product p) { … } }` around one line of logic. The rules were hard to read, so the team stopped composing them and wrote one long `if` chain inside the loop instead. Every new rule then meant editing that loop, and two quarters later nobody could say which conditions were still live. What was missing was a cheap way to pass *behavior* as a value: a rule you can name, store in a variable, hand to a method and combine with other rules.

### Mental model

A **lambda expression** is a function literal: parameters, an arrow and a body, `s -> s.isBlank()`. On its own it has no type. It becomes an object only when the code around it says which interface it must implement, the way a plug fits only once you know the socket. That socket is a **functional interface**: an interface with exactly one abstract method, the *functional method*. The lambda's parameters and result are matched to that one method, and the compiler checks the fit.

The JDK ships the common sockets in `java.util.function`. Each is named after its *function shape*, what goes in and what comes out:

| Interface | Shape | Where the JDK takes one |
|---|---|---|
| `Function<T, R>` | `T` → `R` | `Stream.map` |
| `Consumer<T>` | `T` → nothing | `Iterable.forEach` |
| `Supplier<T>` | nothing → `T` | `Optional.orElseGet` |
| `Predicate<T>` | `T` → `boolean` | `Stream.filter`, `Collection.removeIf` |
| `UnaryOperator<T>`, `BinaryOperator<T>` | `T` → `T`; (`T`, `T`) → `T` | `List.replaceAll`, `Stream.reduce` |
| `BiFunction<T, U, R>` | (`T`, `U`) → `R` | `Map.merge` (its remapping function) |

Each cell is a parameter type of that method in the Java 25 API, with wildcards left out ([Src: JDK 25, java.lang.Iterable](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Iterable.java) [Src: JDK 25, java.util.Collection](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Collection.java) [Src: JDK 25, java.util.List](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/List.java) [Src: JDK 25, java.util.stream.Stream](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/stream/Stream.java) [Src: JDK 25, java.util.Optional](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Optional.java) [Src: JDK 25, java.util.Map](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Map.java)).

### How it actually works

**What makes an interface functional.** JLS §9.8 defines a functional interface as "an interface that is not declared `sealed` and has just one abstract method (aside from the methods of `Object`)" [Doc: JLS 25 §9.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8). Three kinds of member therefore do not count. Default methods have a body, so they are not abstract. Static methods are not instance methods at all. An abstract method with the signature of a public `Object` method, such as `boolean equals(Object)`, is already implemented by every class, which is why `Comparator` declares both `compare` and `equals` and is still functional [Doc: JLS 25 §9.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8). In the lab, an interface with one abstract `test`, a redeclared `equals` and `toString`, a default and a static method accepts a lambda [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java). The exemption covers only *public* `Object` methods: declaring `Object clone()` in an interface adds a second abstract method, because `Object.clone` is protected, and the lab's lambda for such an interface fails with `compiler.err.prob.found.req`. A `sealed` interface with one abstract method is not functional either; the same key appears [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java).

**`@FunctionalInterface` is a check, not a switch.** The annotation tells the compiler to report an error unless the annotated type is an interface that meets the definition; "the compiler will treat any interface meeting the definition of a functional interface as a functional interface regardless of whether or not a `FunctionalInterface` annotation is present" [Src: JDK 25, java.lang.FunctionalInterface](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/FunctionalInterface.java). In the lab, annotating an interface with two abstract methods fails with `compiler.err.bad.functional.intf.anno.1` [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java). Its value is protection against a later edit: someone who adds a second abstract method gets an error at the interface, not at every lambda that used it. `Runnable` (`@since 1.0`), `Callable` (1.5) and `Comparator` (1.2) predate Java 8 and carry the annotation today [Src: JDK 25, java.lang.Runnable](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/Runnable.java) [Src: JDK 25, java.util.concurrent.Callable](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/concurrent/Callable.java) [Src: JDK 25, java.util.Comparator](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/Comparator.java).

**Target typing.** "Lambda expressions are always poly expressions": their type comes from the context, and a lambda may appear only in an assignment, invocation or casting context [Doc: JLS 25 §15.27](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27). The type the context supplies is the *target type*; the lambda is compatible with it when the target is a functional interface and the lambda's parameters, result and thrown exceptions fit its function type (JLS calls this *congruent*) [Doc: JLS 25 §15.27.3](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.3). Three lab results follow from that rule [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java):
- the same text `() -> "ready"` compiles as a `Supplier<String>` and as a `Callable<String>`, two unrelated interfaces with the same shape;
- `Object task = () -> {}` fails with `compiler.err.prob.found.req`, because `Object` is not a functional interface;
- `var same = (String s) -> s` fails with `compiler.err.cant.infer.local.var.type`, because `var` asks the initializer for a type and the lambda has none to give ([Q05.02](#q05-02) drills it; `var` itself is [03 §2](03-java-generics.md#2-generic-types-generic-methods-and-type-inference)).

Generic targets such as `Function<? super T, ? extends R>` are resolved by the inference rules of [03 §2](03-java-generics.md#2-generic-types-generic-methods-and-type-inference) and [03 §4](03-java-generics.md#4-wildcards-pecs-and-variance).

**The `java.util.function` families.** The package names four basic shapes, `Function`, `Consumer`, `Predicate` and `Supplier`, then modifies them with prefixes: an arity prefix (`BiFunction`), derived shapes (`UnaryOperator` extends `Function`, `BinaryOperator` extends `BiFunction`), and primitive specializations, where `ToXxx` specializes the result (`ToIntFunction<T>`), `Xxx` specializes arguments left to right (`IntPredicate`, `DoubleConsumer`) and `Obj` skips one (`ObjIntConsumer<T>`) [Doc: Java 25 API, java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html). The primitive forms exist so that a lambda over `int` values does not box each one into an `Integer` ([01 §13](01-java-oop-fundamentals.md#13-wrappers-autoboxing-and-the-integer-cache) covers boxing; [§6](#6-primitive-streams-flatmap-mapmulti-and-reduce-vs-collect) shows it in streams). The package is not a complete set: "other functional interfaces provided for specific purposes, such as `FileFilter`, are defined in the packages where they are used" [Doc: Java 25 API, java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html). Declare your own interface when the domain deserves a name (`PricingRule`) or a checked exception ([§9](#9-checked-exceptions-and-resources-in-lambdas-and-streams)).

**Composition.** The families carry default methods that build new functions from old ones. `f.andThen(g)` applies `f` first and then `g`; `f.compose(g)` applies `g` first [Src: JDK 25, java.util.function.Function](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/function/Function.java). In the lab, with `plusOne` and `twice`, `plusOne.andThen(twice).apply(3)` is 8 and `plusOne.compose(twice).apply(3)` is 7 [Lab: TextRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/TextRulesTest.java). `Predicate.and` and `or` short-circuit: "if this predicate is `false`, then the `other` predicate is not evaluated" [Src: JDK 25, java.util.function.Predicate](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/function/Predicate.java), and the lab records only the first call [Lab: TextRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/TextRulesTest.java). `negate()` inverts an existing predicate, and the static `Predicate.not(p)` (`@since 11`) does the same for a predicate written inline [Src: JDK 25, java.util.function.Predicate](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/function/Predicate.java). Combining small rules this way is the Strategy pattern without a class per strategy ([51](51-design-principles-and-patterns.md) names the pattern).

**Lambda vs anonymous class.** Both produce an object that implements an interface, but they differ in what the body sees:
- **`this` and names.** "Unlike code appearing in anonymous class declarations, the meaning of names and the `this` and `super` keywords appearing in a lambda body … are the same as in the surrounding context" [Doc: JLS 25 §15.27.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2). In the lab, `this.toString()` inside a lambda returns the enclosing `Greeter`'s text, and inside an anonymous class it returns the anonymous object's own [Lab: LambdaVsAnonymousTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/LambdaVsAnonymousTest.java).
- **Scope.** A lambda opens no new naming level. A lambda parameter or a local in its body may not reuse the name of a local still in scope ([Doc: JLS 25 §6.4](https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.4); in the lab, `int x = 1; IntUnaryOperator next = x -> x + 1;` fails with `compiler.err.already.defined` [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java)). An anonymous class body is a class, so it may shadow freely.
- **State and reach.** An anonymous class may declare fields, extend a class, and implement an interface with several abstract methods. A lambda can only implement one functional interface and has no fields of its own; in the lab, an anonymous `Supplier<Integer>` with a `calls` field returns 1, 2, 3 on successive calls [Lab: LambdaVsAnonymousTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/LambdaVsAnonymousTest.java).
- **What they capture and compile to.** An anonymous class declared in an instance method keeps a reference to the enclosing instance, which is how listeners leak ([01 §11](01-java-oop-fundamentals.md#11-nested-types), [Q01.26](01-java-oop-fundamentals.md#q01-26)). A lambda captures `this` only if its body uses it, and it is not compiled into a class of its own; [§2](#2-how-lambdas-compile-and-capture-invokedynamic-and-effectively-final) shows both.

Lambdas arrived in Java 8 with JEP 126, which added "lambda expressions (closures) and supporting features, including method references, enhanced type inference, and virtual extension methods" (the default methods above) [Doc: JEP 126](https://openjdk.org/jeps/126).

### Code

The approach: express each tag rule as a small lambda, then combine the rules with the default methods instead of writing one method full of conditions.

1. Write `normalizer()` as two one-line `Function`s joined with `andThen`, so the order (strip, then lower-case) is visible.
2. Write each rejection rule as a `Predicate`, and invert them with `Predicate.not` and `negate()` rather than with `!` inside the lambda.
3. Join the rules with `and`, which short-circuits.
4. Return a lambda that normalizes first and tests second, so callers pass raw input.

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m05/s01/TextRules.java
    public static Function<String, String> normalizer() {
        Function<String, String> strip = s -> s.strip();
        Function<String, String> lower = s -> s.toLowerCase(Locale.ROOT);
        return strip.andThen(lower);
    }

    public static Predicate<String> acceptedTag(Set<String> banned) {
        Predicate<String> blank = s -> s.isBlank();
        Predicate<String> isBanned = s -> banned.contains(s);
        Predicate<String> rule = Predicate.not(blank).and(isBanned.negate());
        Function<String, String> normalize = normalizer();
        return tag -> rule.test(normalize.apply(tag));
    }
```

`TextRulesTest` checks that `"  Java "` is accepted, `" SPAM"` is rejected against the banned set `{"spam"}`, and a blank tag is rejected. The lambdas here could be method references (`String::strip`); [§3](#3-method-references) covers when that reads better.

The `this` difference, side by side. The approach: return the same "describe yourself" request once as a lambda and once as an anonymous class, and let `toString` reveal which object `this` is.

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m05/s01/Greeter.java
    // In a lambda body, this is the Greeter that created the lambda.
    public Supplier<String> lambdaThis() {
        return () -> this.toString();
    }

    // In an anonymous class body, this is the anonymous object itself.
    public Supplier<String> anonymousThis() {
        return new Supplier<>() {
            @Override
            public String get() {
                return this.toString();
            }

            @Override
            public String toString() {
                return "anonymous supplier";
            }
        };
    }
```

For `new Greeter("Ada")`, the first supplier returns `"Greeter for Ada"` and the second `"anonymous supplier"` [Lab: LambdaVsAnonymousTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/LambdaVsAnonymousTest.java).

#### Legacy

Code written before Java 8, and some still written today, passes behavior as anonymous classes. The conversion is mechanical when the anonymous class implements a functional interface, declares no fields and does not use `this` to mean itself: keep the parameter list and the body, drop the rest.

```java
// Excerpt of labs/java-language/src/main/java/dev/interview/javalanguage/m05/s01/LengthOrder.java
    public static final Comparator<String> ANONYMOUS = new Comparator<String>() {
        @Override
        public int compare(String a, String b) {
            return Integer.compare(a.length(), b.length());
        }
    };

    public static final Comparator<String> LAMBDA = (a, b) -> Integer.compare(a.length(), b.length());
```

Both sort `["stream", "map", "lambda", "of"]` into `["of", "map", "stream", "lambda"]` [Lab: LengthOrderTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/LengthOrderTest.java). When the body uses `this`, a field of the anonymous class, or an abstract class as its supertype, the conversion changes behavior or does not compile, so leave those as classes (`Comparator` itself is [02 §4](02-java-equality-immutability-records.md#4-ordering-comparable-and-comparator)'s subject; `Comparator.comparingInt(String::length)` is the idiomatic form there).

### Failure modes and operations

A lambda fails the way its body fails; this section has no runtime behavior of its own beyond that. What it costs to create and run one, and how it holds on to captured objects, is [§2](#2-how-lambdas-compile-and-capture-invokedynamic-and-effectively-final); what lambdas cost inside streams is [§6](#6-primitive-streams-flatmap-mapmulti-and-reduce-vs-collect) and [§8](#8-parallel-streams-and-the-common-forkjoinpool).

> [!NOTE]
> **Version notes.** Java 8: lambda expressions, method references and default methods [Final since Java 8, JEP 126] [Doc: JEP 126](https://openjdk.org/jeps/126); `java.util.function` and `@FunctionalInterface` are `@since 1.8` [Src: JDK 25, java.lang.FunctionalInterface](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/FunctionalInterface.java) [Doc: Java 25 API, java.util.function](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/function/package-summary.html); older interfaces with one abstract method, such as `Runnable` and `Comparator`, accept lambdas without changes. Java 11: `Predicate.not` [Src: JDK 25, java.util.function.Predicate](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/util/function/Predicate.java). Java 17: `sealed` interfaces [Final since Java 17, JEP 409] [Doc: JEP 409](https://openjdk.org/jeps/409), which JLS §9.8 excludes from being functional [Doc: JLS 25 §9.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8) (sealed types are [07](07-java-modern-language-features.md)'s subject).

### Best practices and anti-patterns

- Prefer a `java.util.function` type when one fits the shape, because every reader and every JDK method already knows it; declare your own interface when the concept deserves a domain name or needs a checked exception, because `Function` cannot declare one ([§9](#9-checked-exceptions-and-resources-in-lambdas-and-streams)).
- Annotate your own functional interfaces with `@FunctionalInterface`, because a later second abstract method then fails at the interface instead of at every lambda that targets it.
- Use the primitive specializations (`IntPredicate`, `ToLongFunction<T>`) on hot paths over numbers, because the generic forms box every value.
- Keep lambda bodies to an expression or a few statements, and move longer logic into a named method, because a stack trace or a code review then points at a name, not at `lambda$…` ([§2](#2-how-lambdas-compile-and-capture-invokedynamic-and-effectively-final)).
- Combine rules with `and`, `or`, `negate`, `Predicate.not`, `andThen` and `compose` instead of nesting conditions inside one lambda, because each rule stays testable on its own.
- Do not convert an anonymous class to a lambda when its body uses `this` to mean itself or keeps a field, because the lambda's `this` is the enclosing object and it cannot hold state.

### Misconceptions and traps

- *"A functional interface can have only one method."* It can have any number of default and static methods and may redeclare public `Object` methods; only the count of other abstract methods is limited to one [Doc: JLS 25 §9.8](https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8) [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java). The shorthand comes from the informal phrase "single-method interface", used before Java 8 added default methods.
- *"`@FunctionalInterface` is what makes an interface functional."* Any interface that meets the definition is functional; the annotation only asks the compiler to check it [Src: JDK 25, java.lang.FunctionalInterface](https://github.com/openjdk/jdk/blob/jdk-25-ga/src/java.base/share/classes/java/lang/FunctionalInterface.java). The belief exists because every interface in `java.util.function` carries it.
- *"A lambda is shorter syntax for an anonymous class."* `this`, name scope and state differ ([Doc: JLS 25 §15.27.2](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27.2) [Lab: LambdaVsAnonymousTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/LambdaVsAnonymousTest.java)), and the compiled form differs too ([§2](#2-how-lambdas-compile-and-capture-invokedynamic-and-effectively-final)). The idea comes from IDEs that offer "replace with lambda" on anonymous classes, which works for the common case.
- *"A lambda has a type, so `var f = x -> x` should work."* A lambda takes its type from the target, and `var` provides none [Doc: JLS 25 §15.27](https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27) [Lab: FunctionalInterfaceRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/FunctionalInterfaceRulesTest.java). The expectation comes from languages where function literals have function types of their own.
- *"`f.andThen(g)` and `f.compose(g)` are the same thing written two ways."* They apply the functions in opposite orders [Lab: TextRulesTest](../labs/java-language/src/test/java/dev/interview/javalanguage/m05/s01/TextRulesTest.java). The mix-up comes from mathematics, where `g ∘ f` is read right to left.

Questions that drill this section: [Q05.01](#q05-01), [Q05.02](#q05-02), [Q05.03](#q05-03), [Q05.04](#q05-04).

## 2. How lambdas compile and capture: `invokedynamic` and effectively final
<!-- TASK: SEC-M05-02 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-02 -->

## 3. Method references
<!-- TASK: SEC-M05-03 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-03 -->

## 4. Stream pipelines: laziness, short-circuiting and encounter order
<!-- TASK: SEC-M05-04 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-04 -->

## 5. Collectors: `toMap`, `groupingBy`, `teeing` and writing your own
<!-- TASK: SEC-M05-05 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-05 -->

## 6. Primitive streams, `flatMap`, `mapMulti` and `reduce` vs `collect`
<!-- TASK: SEC-M05-06 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-06 -->

## 7. Stream gatherers
<!-- TASK: SEC-M05-07 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-07 -->

## 8. Parallel streams and the common `ForkJoinPool`
<!-- TASK: SEC-M05-08 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-08 -->

## 9. Checked exceptions and resources in lambdas and streams
<!-- TASK: SEC-M05-09 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-09 -->

## 10. `Optional`: a return type for maybe-absent results
<!-- TASK: SEC-M05-10 -->
### The problem it solves
### Mental model
### How it actually works
### Code
### Failure modes and operations
### Best practices and anti-patterns
### Misconceptions and traps
<!-- /TASK: SEC-M05-10 -->

## Summary
<!-- TASK: CLOSE-M05 -->
<!-- /TASK: CLOSE-M05 -->

## Question bank

<!-- TASK: QB-M05-01 -->
<a id="q05-01"></a>
### Q05.01 · Concept · What makes an interface functional: one abstract method, and why default, static and `Object` methods do not count

<a id="q05-02"></a>
### Q05.02 · Concept · Target typing: why a lambda has no type of its own, and why `var f = x -> x` does not compile

<a id="q05-03"></a>
### Q05.03 · Difference · Lambda vs anonymous class: `this`, scope, state, and what each compiles to

<a id="q05-04"></a>
### Q05.04 · Output · Composing functions: what do `andThen`, `compose`, `negate` and `Predicate.not` produce for the same input?

<a id="q05-05"></a>
### Q05.05 · Concept · How a lambda runs: the synthetic method, `invokedynamic` and `LambdaMetafactory`

<a id="q05-06"></a>
### Q05.06 · Bug hunt · "Local variables referenced from a lambda must be final or effectively final": why the rule exists, and why the one-element-array workaround is a trap

<a id="q05-07"></a>
### Q05.07 · Concept · The four kinds of method references, and which functional-interface shapes each one fits

<a id="q05-08"></a>
### Q05.08 · Output · `holder::get` vs `() -> holder.get()` when `holder` is `null`: which line throws, and when?

<!-- /TASK: QB-M05-01 -->

<!-- TASK: QB-M05-02 -->
<a id="q05-09"></a>
### Q05.09 · Concept · Anatomy of a stream pipeline: source, intermediate and terminal operations, and who pulls the elements

<a id="q05-10"></a>
### Q05.10 · Output · Laziness and vertical execution: in what order do `filter`, `map` and `peek` record their calls, with and without a terminal operation?

<a id="q05-11"></a>
### Q05.11 · Output · Short-circuiting on an infinite `Stream.iterate`: how many elements do `findFirst`, `limit` and `takeWhile` evaluate?

<a id="q05-12"></a>
### Q05.12 · Bug hunt · "stream has already been operated upon or closed": reusing a stream, and what to hold instead

<a id="q05-13"></a>
### Q05.13 · Concept · Stateless vs stateful operations and encounter order: what `sorted`, `distinct` and `unordered` change in a pipeline

<a id="q05-14"></a>
### Q05.14 · Output · `Collectors.toMap` with a duplicate key, with a `null` value, and with a merge function: what is thrown or returned?

<a id="q05-15"></a>
### Q05.15 · Concept · `groupingBy` and `partitioningBy` with downstream collectors: counting, mapping, a sorted map factory, and the two keys of a partition

<a id="q05-16"></a>
### Q05.16 · Concept · Writing a `Collector`: supplier, accumulator, combiner, finisher, characteristics, and where `teeing` fits

<!-- /TASK: QB-M05-02 -->

<!-- TASK: QB-M05-03 -->
<a id="q05-17"></a>
### Q05.17 · Difference · `reduce` vs `collect`: immutable vs mutable reduction, identity and associativity

<a id="q05-18"></a>
### Q05.18 · Bug hunt · `reduce(10, Integer::sum)` gives a different total once the stream is parallel: why, and what the identity must be

<a id="q05-19"></a>
### Q05.19 · Trade-off · `Stream<Integer>` vs `IntStream`: boxing, `sum` and `average`, and when converting is worth it

<a id="q05-20"></a>
### Q05.20 · Difference · `map`, `flatMap` and `mapMulti`: one to one, one to many, and when `mapMulti` is the better fit

<a id="q05-21"></a>
### Q05.21 · Concept · Stream gatherers: what a `Gatherer` can do that `collect`, `flatMap` and `mapMulti` cannot

<a id="q05-22"></a>
### Q05.22 · Output · `windowFixed(2)`, `windowSliding(2)` and `scan` over `1..5`: which lists come out?

<a id="q05-23"></a>
### Q05.23 · Concept · How a parallel stream splits and runs: spliterators, the common `ForkJoinPool` and its default parallelism

<a id="q05-24"></a>
### Q05.24 · Trade-off · When does a parallel stream help, and when does it hurt: size, source, ordering, blocking and shared state

<!-- /TASK: QB-M05-03 -->

<!-- TASK: QB-M05-04 -->
<a id="q05-25"></a>
### Q05.25 · Production scenario · After a report endpoint switches to `parallelStream()` with an HTTP call per element, unrelated async work across the service slows down

<a id="q05-26"></a>
### Q05.26 · Concept · Checked exceptions inside lambdas: why `Function` cannot throw `IOException`, and the workarounds ranked

<a id="q05-27"></a>
### Q05.27 · Production scenario · A nightly import reports success while skipping files: an exception caught and logged inside a lambda

<a id="q05-28"></a>
### Q05.28 · Concept · `Optional` done right: what it is for, `map` vs `flatMap`, `or`, and the anti-patterns (fields, parameters, `get()`, `Optional<List<T>>`)

<a id="q05-29"></a>
### Q05.29 · Output · `orElse(loadDefault())` vs `orElseGet(this::loadDefault)`: how many times does `loadDefault` run?

<a id="q05-30"></a>
### Q05.30 · Production scenario · `NoSuchElementException: No value present` pages the on-call after a lookup starts returning empty

<!-- /TASK: QB-M05-04 -->

## Hands-on exercises

<!-- TASK: EX-M05-01 -->
<a id="ex05-1"></a>
### Exercise 05.1 · An order report with collectors
<!-- /TASK: EX-M05-01 -->

<!-- TASK: EX-M05-02 -->
<a id="ex05-2"></a>
### Exercise 05.2 · A custom `Collector` that is correct in parallel
<!-- /TASK: EX-M05-02 -->

<!-- TASK: EX-M05-03 -->
<a id="ex05-3"></a>
### Exercise 05.3 · A gatherer: deduplicate consecutive elements and batch them
<!-- /TASK: EX-M05-03 -->

<!-- TASK: EX-M05-04 -->
<a id="ex05-4"></a>
### Exercise 05.4 · A config loader: checked exceptions, results and `Optional`
<!-- /TASK: EX-M05-04 -->

## Check your understanding
<!-- TASK: CLOSE-M05 -->
<!-- /TASK: CLOSE-M05 -->

## Connections
<!-- TASK: CLOSE-M05 -->
<!-- /TASK: CLOSE-M05 -->
