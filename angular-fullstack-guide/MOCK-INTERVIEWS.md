# Mock interviews

## How to run a mock

Each mock below is one interview of 45 to 60 minutes: six to eight prompts in the order a round usually moves (a warm-up, then mechanism, then a design or a bug to find, then a trade-off), each with follow-ups, a model-answer outline linking the question that owns the full answer, and scoring notes. The mocks train you to say an answer, not to recognize one. Run them as described here; this is our method, built on the interview craft of [module 47](modules/47-behavioral-and-interview-craft.md).

**Before you start.**

- Pick a mock whose modules you have studied, and do not read its outlines or the linked answers first. A mock you have just read tests your memory of the page, not the topic.
- Find an interviewer if you can: a colleague reads the prompts and follow-ups aloud and keeps time. Alone, read each prompt once, then answer into a voice recorder.
- Set a timer for the mock's length and keep paper at hand: Mock 7 is a whiteboard round.
- Copy the score sheet at the end of the rubric.

**During the mock.**

- Answer out loud, in full sentences. Module 47 adopts the backend guide's reason: what fails in interviews is retrieval and articulation, not recognition ([47 §1](modules/47-behavioral-and-interview-craft.md#1-the-behavioral-round-what-a-story-is-evidence-of-star-with-the-weight-on-action-and-an-explicit-result-and-a-story-bank)).
- Lead with the short version. Every question in this guide opens with a 30-second short answer; say that first and expand after it, so an answer cut off by the interviewer still contains the point.
- Spend about seven minutes on a prompt, less on a warm-up. When one runs long, say what you are leaving out and move on: the halfway time check of [47 §4](modules/47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck), and for the design round the time plan of [45 §2](modules/45-frontend-system-design-method.md#2-communicating-under-time-pressure-a-time-plan-complete-trade-off-statements-and-diagrams-at-three-zoom-levels).
- On a design or debugging prompt, clarify before you build, state each assumption aloud and check in once you have something that works. The interviewer can credit only what they see and hear, and a spoken assumption can be corrected early (47 §4).
- The interviewer asks one follow-up at a time, only after the answer has ended, and gives no hints. The candidate may ask for a prompt to be repeated or rephrased, which module 47 recommends, in a second language most of all ([47 §7](modules/47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project)).
- When stuck, say what you are trying, reduce the case to a smaller one, and ask a specific question (47 §4). Look nothing up; something you would check at work is said as such: "I believe it is X; I would confirm it in the documentation."
- Behavioral prompts are told in STAR, with your own action as the substance and an explicit result as the last sentence; their follow-ups climb the follow-up ladder of 47 §7.

**Afterwards.**

- Score every prompt at once, from memory or the recording, against the rubric and the mock's scoring notes, before you open a link.
- Then read each model-answer outline and the question it links, and score Correctness again. The gap between the two Correctness scores is the most useful number on the sheet: a large gap means you recognized more than you could recall.
- For each prompt, write down the one thing the full answer had and yours did not, and the section to re-read.
- Listen to the recording once for three habits: an answer that never reaches a conclusion, "we" where a story needed "I", and setup that delays the point.
- Re-run a mock after you have re-studied its weakest dimension. A re-run the next day mostly tests your memory of the first run (our view).

## Scoring rubric

One rubric serves every mock. Score each prompt on four dimensions: 2 for a full answer, 1 for a partial one, 0 when that part is missing or wrong. A dimension the prompt does not call for, such as a trade-off in a warm-up definition, is marked "n/a" and leaves the total. Each mock's scoring notes say, per prompt, what earns full marks, the common partial answer and the red flag.

| Dimension | Full (2) | Partial (1) | Missing (0) |
|---|---|---|---|
| **Correctness:** what you state is true for the versions the guide covers | Every fact agrees with the owning answer, with the version or status where it matters (a default that changed, an API in developer preview) | Right in substance with a slip that does not change the conclusion, or an older version's behavior said without its version | A wrong fact the conclusion rests on |
| **Mechanism:** why it behaves that way | Walks through what happens under the API, at the depth of the module's "How it actually works", and can predict a case nobody asked about | Names the right mechanism but cannot walk through it, or walks through it with a gap a follow-up exposes | Only what to type, or "Angular handles it" |
| **Trade-offs:** choosing between options | A complete trade-off statement ([Q45.04](modules/45-frontend-system-design-method.md#q45-04)): the axis, the options, the condition that decides, the cost accepted and what would make you revisit | Options and a preference, with no deciding condition or no cost | One option presented as always right, or "it depends" with nothing after it |
| **Communication:** how the answer reaches the listener | Conclusion first, then the structure; assumptions said aloud; check-ins on design prompts; the follow-up that was asked is the one answered | Correct content in an order the listener has to reassemble, or a long setup before the point | Silence, a monologue that never concludes, or an answer to a different question |

On a behavioral prompt, Mechanism becomes **Evidence**. Full: your own action, a result sentence, and a number with a source, a baseline and a kind. Partial: a result with no source, or a team story in which your part is unclear. Missing: no result, or a number that falls at the second rung of the follow-up ladder, "How do you know it worked?" ([47 §7](modules/47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project)).

**Red flags.** Each prompt's scoring notes name one red flag, usually the owning question's "Trap to avoid". Saying it scores 0 on that prompt, however good the rest of the answer is: on Correctness for a wrong fact, on Communication for a process red flag (scaffolding before asking, a score quoted as the diagnosis), on Evidence for a behavioral one.

**Reading the score.** Add each dimension's points across the mock and divide by the points available to it. The pattern says more than the total (our reading):

- Correctness high, Mechanism low: you know the API but not the model behind it. Re-read the "How it actually works" and "Under the hood" parts of the linked modules.
- Mechanism high, Trade-offs low: you explain but do not decide. Practise the complete trade-off statement.
- Communication low, the rest high: the content is slow to come out under time. Re-run the prompts aloud against a timer, short answer first.
- Correctness lower on the second scoring: study from the question banks with the answers closed.

The rubric compares your runs with each other. It is not a hiring bar: no total maps to a pass.

```text
Mock N · date · minutes used
Prompt  Correct  Mechanism/Evidence  Trade-offs  Communication  Red flag  Re-read
1       2        1                   n/a         2              no        17 §9
2       ...
Total   per dimension: points / points available
```

## Mock 1 · Angular components, templates and DI

Length 55 minutes. Modules [12](modules/12-angular-how-it-works.md) to [16](modules/16-dependency-injection.md), with [11](modules/11-accessibility.md) (warm-up) and [47 §4](modules/47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck) (live coding). Scoring focus: **Mechanism** (bootstrap, the injector walk, injection context) and **Correctness** on the v22 defaults (standalone, the file convention, `inject()`).

### Prompt 1 · Warm-up · "What does a native `<button>` give you that a `div` needs ARIA, `tabindex` and key handlers to imitate?"

**Owner:** [Q11.03](modules/11-accessibility.md#q11-03)

**Follow-ups:**

1. Button or link?
2. What must a `div` add?

**Model-answer outline:** One element gives role, focusability, keyboard activation and state. A `div` has none of them, and `role="button"` supplies only the role: in jsdom a `div role="button"` is not focusable and a keydown on it does nothing. Follow-ups: `button` for actions, `a[href]` for navigation; a `div` must add `tabindex`, key handlers and state. Full answer: [Q11.03](modules/11-accessibility.md#q11-03).

**Scoring:** Full marks name all four things and the `role` limit. Partial: names the role but misses keyboard activation or focus. Red flag: adding `role="button"` and stopping.

### Prompt 2 · Warm-up · "What is a component made of in v22, and what does `ng generate component` create?"

**Owner:** [Q13.01](modules/13-components-and-templates.md#q13-01)

**Follow-ups:**

1. Is `selector` required?
2. Why is `imports` empty in the generated class?

**Model-answer outline:** A class plus `@Component` metadata: a template (inline or a file), optional styles, `imports` for everything the template uses, and a `selector`. For `user-card` the generator writes `user-card.ts`, `.html`, `.css` and `.spec.ts`, with class `UserCard` and selector `app-user-card`. No `standalone` or `changeDetection` line: standalone has been the default since v19 and OnPush since v22. The `.component` infix went in CLI 20. Follow-ups: the typings mark `selector` optional, but no parent template can match without one; `imports` is empty because the template uses nothing yet, and unused entries raise `NG8113`. Full answer: [Q13.01](modules/13-components-and-templates.md#q13-01).

**Scoring:** Full marks give the parts and the four generated files. Partial: the parts of the class without the generated files. Red flag: the pre-v20 `.component.ts` names or a `declarations` entry.

### Prompt 3 · Mechanism · "Walk me through what `bootstrapApplication` does."

**Owner:** [Q12.14](modules/12-angular-how-it-works.md#q12-14)

**Follow-ups:**

1. Where does `NgZone` come from if no zone is installed?
2. Two initializers, one slow: do they run one after the other? Then: after a config-server outage the page is blank. Why?

**Model-answer outline:** It returns a promise. It reuses or creates the platform (one per page); creates the environment injector, the root injector, from your `providers` plus zoneless defaults; starts the initializers in provider order and waits on `Promise.all` of what they return; creates the root component where its selector matches, attaches its view and runs a first `tick()`; resolves with the `ApplicationRef`. `NgZone` is a no-op stand-in. Initializers run concurrently, and either rejecting rejects the bootstrap; a rejected one means the root is never constructed and the host stays empty ([Q12.18](modules/12-angular-how-it-works.md#q12-18)). Full answer: [Q12.14](modules/12-angular-how-it-works.md#q12-14).

**Scoring:** Full marks include the initializers' wait. Partial: the steps without it. Red flag: describing NgModule bootstrap (`bootstrapModule`, an `AppModule`'s imports) for a standalone app.

### Prompt 4 · Mechanism · "Describe how Angular resolves a dependency, from an element up to `NullInjector`."

**Owner:** [Q16.15](modules/16-dependency-injection.md#q16-15)

**Follow-ups:**

1. What does a route add?
2. Which injector does `inject(Injector)` give a component?

**Model-answer outline:** Two trees. A lookup climbs the element injectors from the asking element, then the environment tree: the route injector if a route provides, the root, the platform, and finally `NullInjector`, which throws `NG0201` or returns your fallback. The nearest provider wins. An element injector holds only what its component or directive lists in `providers`. A route with `providers` adds an environment injector below the root ([Q16.16](modules/16-dependency-injection.md#q16-16)); `inject(Injector)` in a component answers from that element. Full answer: [Q16.15](modules/16-dependency-injection.md#q16-15).

**Scoring:** Full marks give both trees in order and the end of the walk. Partial: the element tree without the environment tree. Red flag: one chain ending at the root.

### Prompt 5 · Debugging · "`inject()` works in a field initializer and throws in `ngOnInit` and in a click handler. Why?"

**Owner:** [Q16.12](modules/16-dependency-injection.md#q16-12)

**Follow-ups:**

1. Does wrapping `inject()` in a helper fix it?
2. Which injector answers under `runInInjectionContext`?

**Model-answer outline:** A field initializer runs during construction, when an injector is current; `ngOnInit` and a click handler run later, when none is, so `inject()` throws `NG0203`. Fix one: read the dependency into a field, which serves every method. Fix two: capture `inject(Injector)` and run the later code under `runInInjectionContext`, which suits a dependency chosen late; the injector you pass decides the answer. A helper only changes the message ([Q16.13](modules/16-dependency-injection.md#q16-13)). Read every dependency before an `await`. Full answer: [Q16.12](modules/16-dependency-injection.md#q16-12).

**Scoring:** Full marks give the cause and both fixes. Partial: the cause without a fix, or one fix only. Red flag: writing `injector.runInInjectionContext(...)`; the function is free, not a method.

### Prompt 6 · Design · "Retire a `CoreModule` and a `SharedModule`: where does each provider, component and re-export go in a standalone app?"

**Owner:** [Q15.15](modules/15-standalone-and-ngmodules.md#q15-15)

**Follow-ups:**

1. A library's `forRoot` you cannot change?
2. Where do layout components declared in `CoreModule` go?

**Model-answer outline:** Start with providers, where behavior can change silently. `CoreModule` services become root services, configuration moves to `ApplicationConfig`, the guard goes. `SharedModule` declarables become standalone and are imported where used; its re-exported `CommonModule` becomes control flow and single imports. Its providers need a decision: root for one instance, or a lazy route's `providers` for per-feature instances. `forRoot(config)` becomes `provideX(config)`. The standalone migration leaves a module that has `providers`. Follow-ups: `importProvidersFrom(Lib.forRoot(cfg))`; layout components become standalone, imported by the root component. Full answer: [Q15.15](modules/15-standalone-and-ngmodules.md#q15-15).

**Scoring:** Full marks place providers, declarables and re-exports, with the provider decision. Partial: the services moved, the `SharedModule` declarables and re-exports left undecided. Red flag: moving every provider to root unchecked.

### Prompt 7 · Design (live coding) · "You have 40 minutes to build a searchable, paginated list. Talk me through your first five minutes."

**Owner:** [Q47.10](modules/47-behavioral-and-interview-craft.md#q47-10), with [47 §4](modules/47-behavioral-and-interview-craft.md#4-live-coding-an-angular-task-clarify-say-the-plan-build-in-working-increments-narrate-and-recover-when-stuck)

**Follow-ups:**

1. "Just start."
2. Tests?

**Model-answer outline:** Ask about the data and states first: in memory or not, roughly how many rows, loading, empty and error states, and whether documentation or an AI assistant is allowed (the guide states no rule). Say a three-line plan: a pure filter-sort-page function, then a component holding signals, then edge cases. Build the unfiltered first page first so something runs, and check in. If told to just start, state one assumption aloud, because an unspoken one cannot be corrected. On tests, ask, then test the pure core. Full answer: [Q47.10](modules/47-behavioral-and-interview-craft.md#q47-10).

**Scoring:** Lead with Communication, since the interviewer can credit only what is said and seen. Full marks ask, say the plan and show a running first version. Partial: a plan with no clarifying question. Red flag: scaffolding before asking.

### Prompt 8 · Trade-off · "Pipe, `computed` or a method call in the template: which for formatting, filtering and derived state?"

**Owner:** [Q14.24](modules/14-directives-and-pipes.md#q14-24)

**Follow-ups:**

1. Are methods in templates always bad?
2. Does an impure pipe fix a stale list?

**Model-answer outline:** Choose by dependency. Derived from signals, such as a filtered list or a total: a `computed`. One value's presentation, fixed by its arguments and reused across templates, such as a price or a date: a pure pipe. Trivial or used once: an inline expression or a method. State mutated in place comes first, because neither a pipe nor a `computed` sees it. Methods: not always bad; a method runs on every check, and reading a signal is a cheap getter ([Q17.07](modules/17-signals.md#q17-07)). An impure pipe hides the stale list at a call on every check ([Q14.17](modules/14-directives-and-pipes.md#q14-17)); replace the array. Full answer: [Q14.24](modules/14-directives-and-pipes.md#q14-24).

**Scoring:** Full marks give a deciding condition per case and the in-place-mutation caveat. Partial: one tool for all three cases, no deciding condition. Red flag: treating a pure pipe as a `computed`; it misses in-place changes too.

## Mock 2 · Signals and change detection

Length 55 minutes. Modules [17](modules/17-signals.md) to [21](modules/21-change-detection.md), with [04](modules/04-js-async-event-loop.md) (warm-up). Scoring focus: **Mechanism** (push-dirty pull-value, what marks a view) and **Correctness** on the v22 defaults (zoneless, OnPush).

### Prompt 1 · Warm-up · "What is the difference between a task and a microtask, and which APIs queue each?"

**Owner:** [Q04.02](modules/04-js-async-event-loop.md#q04-02)

**Follow-ups:**

1. Is `requestAnimationFrame` a task or a microtask?
2. Do two task queues have a guaranteed order?

**Model-answer outline:** The loop runs one task per turn, then drains all microtasks, including ones queued while draining. Tasks: `setTimeout`, `setInterval`, UI events, I/O, `MessageChannel`. Microtasks: promise reactions, `await` continuations, `queueMicrotask`, `MutationObserver`. The reason: promise callbacks must run after the current code but before anything else can observe intermediate state, so rendering can happen between tasks but never between microtasks. `requestAnimationFrame` is neither: it runs in the update-the-rendering step ([Q04.07](modules/04-js-async-event-loop.md#q04-07)). Two queues: no guaranteed order; only tasks from one source keep theirs. Full answer: [Q04.02](modules/04-js-async-event-loop.md#q04-02).

**Scoring:** Full marks include the drain-to-empty rule. Partial: names the APIs but not that the microtask queue drains to empty. Red flag: "microtasks are higher-priority tasks".

### Prompt 2 · Warm-up · "What is a signal, and what problem does it solve in Angular?"

**Owner:** [Q17.01](modules/17-signals.md#q17-01)

**Follow-ups:**

1. Is a signal synchronous?
2. Do signals replace RxJS?

**Model-answer outline:** A signal is a getter that records who reads it and notifies those readers on change. It solves Angular not knowing what changed: instead of re-checking the whole tree after each async event, Angular refreshes the views that read the changed signal. Reading a signal in a template, a `computed` or an `effect` creates a dependency edge; that precision allows running without zone.js and OnPush as the default. Reads and writes are synchronous; reactions are scheduled and batched. For state, largely yes; for event streams and time-based logic, no (the decision rules are in [module 23 §7](modules/23-rxjs-in-depth.md#7-rxjs-and-signals-decision-rules-tosignal-toobservable-and-rxresource)). Full answer: [Q17.01](modules/17-signals.md#q17-01).

**Scoring:** Full marks say what a signal tells Angular: which views read it. Partial: "a reactive value" with nothing about that. Red flag: "signals make Angular faster"; they make updates targeted.

### Prompt 3 · Mechanism · "Explain the push-dirty, pull-value algorithm behind signals."

**Owner:** [Q17.33](modules/17-signals.md#q17-33)

**Follow-ups:**

1. What is the epoch for?
2. Why do effects and templates need scheduling, while computeds do not?

**Model-answer outline:** A write pushes only a dirty flag to dependents, recursively, and schedules live consumers; nothing recomputes during the push. A read pulls: the reader checks each dependency's version, refreshes dependencies first, and recomputes only if a version changed; an equal result keeps the old version. Laziness, glitch-freedom and the equality cutoff follow from the split. The epoch is a fast path: if no signal anywhere was written since validation, a node need not poll its producers. Effects and templates are the sinks that nothing else reads, so the system must run them; computeds wait to be read. Full answer: [Q17.33](modules/17-signals.md#q17-33).

**Scoring:** Full marks give both halves, push and pull. Partial: the dirty push without the version check on read. Red flag: describing signals as observables that push values to subscribers.

### Prompt 4 · Mechanism · "What marks an OnPush view dirty, and what does not?"

**Owner:** [Q21.04](modules/21-change-detection.md#q21-04)

**Follow-ups:**

1. Does an event refresh only its own component?
2. Does a plain field ever render alone?

**Model-answer outline:** Six announcements: a new input reference, an event in the view or a descendant, a changed signal the template reads, `markForCheck`, an `async` pipe emission and `ComponentRef.setInput`. An in-place edit of an input object and a plain-field write mark nothing, because a mutation announces nothing and inputs are compared by reference. An event refreshes the view, its ancestors and Eager siblings, and skips OnPush siblings. A plain field renders only when another mark refreshes the view, such as a click in that component ([Q17.02](modules/17-signals.md#q17-02)). Full answer: [Q21.04](modules/21-change-detection.md#q21-04).

**Scoring:** Full marks give all six and both non-triggers. Partial: lists inputs and events, forgets signals read by the template or `markForCheck`. Red flag: expecting a timer callback or an `await` to mark the view.

### Prompt 5 · Debugging · "A teammate keeps a filtered list in sync with an `effect`. What is wrong?"

**Owner:** [Q17.15](modules/17-signals.md#q17-15)

**Follow-ups:**

1. When is syncing with an effect acceptable?
2. How do you catch this in review?

**Model-answer outline:** The effect propagates state: `visible` is derived and should be a `computed`. Three costs: staleness, since readers see the old list until the effect runs; extra passes, since the effect's write notifies the template in a second step; fragility, since an effect that later reads `visible` writes what it reads. If the user must also override the derived value, use `linkedSignal`, never an effect. An effect is acceptable when the target is not a signal: a URL parameter, storage, a third-party imperative API. In review, search for `effect(` whose body only calls `.set`; the angular-eslint signal rules do not flag it. Full answer: [Q17.15](modules/17-signals.md#q17-15).

**Scoring:** Full marks replace it with a `computed` and name the costs. Partial: replaces it but cannot say what the effect cost. Red flag: `untracked` or `allowSignalWrites` as the fix.

### Prompt 6 · Debugging · "Review this `@for`: `track $index` on an editable list, an uninvoked track function and duplicate keys."

**Owner:** [Q18.07](modules/18-control-flow-and-defer.md#q18-07)

**Follow-ups:**

1. Is `NG8115` an error?
2. When is `track $index` fine?

**Model-answer outline:** Three bugs. `track $index` on rows with an input: after a reorder the typed text stays at position 0, beside another order. `track trackById` is not a call, so every key is the method itself: `NG8115` at build, `NG0955` on the first update. `track o.customer` repeats a key: `NG0955` on the first update. Fix all three with `track o.id`. `NG8115` is a warning, so the build passes. `track $index` is fine for a collection that never changes. `track` takes an expression, so porting `trackBy: trackById` needs a call or a property. Full answer: [Q18.07](modules/18-control-flow-and-defer.md#q18-07).

**Scoring:** Full marks find all three with the fix. Partial: finds one or two. Red flag: porting `trackBy: trackById` as `track trackById`.

### Prompt 7 · Design · "Plan the migration of a zone-based app to zoneless, in order, with a check for each step."

**Owner:** [Q21.22](modules/21-change-detection.md#q21-22)

**Follow-ups:**

1. Must every component be OnPush first?
2. Reactive forms?

**Model-answer outline:** Make every change announce itself before the zone goes. One: find silent updates with `provideCheckNoChangesConfig({ exhaustive: true })`; a plain-field write makes `tick()` throw `NG0100`. Two: announce them with a signal, `async` or `markForCheck`; the value renders after `whenStable`. Three: replace `onStable` waits with `afterNextRender`. Four: wrap awaited work in `PendingTasks.run`. Five: force zoneless in tests with `provideZonelessChangeDetection()`. Six: remove `zone.js`; build and tests pass. OnPush first is recommended, not required. Reactive forms: the docs say model updates schedule no detection (documented only). Full answer: [Q21.22](modules/21-change-detection.md#q21-22).

**Scoring:** Full marks give the order and a check after each step. Partial: the right steps with no check after each. Red flag: removing the polyfill first.

### Prompt 8 · Trade-off · "`ngOnChanges`, `computed`, `linkedSignal` or `effect` to react to an input change: which when?"

**Owner:** [Q20.08](modules/20-lifecycle-and-render-hooks.md#q20-08)

**Follow-ups:**

1. Can an `effect` replace `ngOnInit`?
2. Is `ngOnChanges` still called for a signal input?

**Model-answer outline:** Default to `computed` for a value derived from an input. Use `linkedSignal` when the derived value must also be writable. Use `effect` for a side effect outside the signal graph: logging, storage, a third-party widget. Keep `ngOnChanges` when you need the previous value or `firstChange`, which only its `SimpleChange` objects carry; its cost is a second place where derived state can drift. An `effect` is not a once-only hook: it runs at first render after `ngOnInit` and again on each change. `ngOnChanges` is still called for a signal input. Full answer: [Q20.08](modules/20-lifecycle-and-render-hooks.md#q20-08).

**Scoring:** Full marks give a deciding condition per tool. Partial: `effect` as the default. Red flag: an `effect` that copies an input into another signal; that is a `computed` that runs later.

## Mock 3 · RxJS and state

Length 60 minutes. Modules [22](modules/22-rxjs-foundations.md), [23](modules/23-rxjs-in-depth.md) and [28](modules/28-state-management.md), with [02](modules/02-js-scope-closures-this.md) (warm-up) and [46 §2](modules/46-system-design-case-studies.md#2-autocomplete-and-typeahead-search-a-request-policy-a-prefix-cache-ranking-on-the-server-and-an-accessible-combobox) (the design case). Scoring focus: **Trade-offs** (which operator, which state home) and **Mechanism** (what each flattening operator does with a running inner).

### Prompt 1 · Warm-up · "What is the difference between debounce and throttle, and when do you use each?"

**Owner:** [Q02.19](modules/02-js-scope-closures-this.md#q02-19)

**Follow-ups:**

1. What is a leading-edge debounce?
2. How do you test either one without waiting?

**Model-answer outline:** Debounce runs once, after calls have stopped for the wait period. Throttle runs at most once per interval while calls keep coming. The deciding question: must the user see updates during the activity (throttle) or only the final state (debounce)? Debounce a search box; throttle scroll, resize or drag. A throttle must decide its edges, and without the trailing call the last position of a burst is lost. In Angular use `debounceTime` and `throttleTime`, passing `{ leading: true, trailing: true }` to `throttleTime`, whose default drops the trailing value. A leading-edge debounce runs on the first call, then ignores calls until a quiet period passes. Test with fake timers. Full answer: [Q02.19](modules/02-js-scope-closures-this.md#q02-19).

**Scoring:** Full marks give both definitions, a use case each and the deciding question. Partial: no use case for each. Red flag: forgetting the trailing call in a throttle.

### Prompt 2 · Warm-up · "What is an Observable, and how does it differ from a function, an iterator and a Promise?"

**Owner:** [Q22.01](modules/22-rxjs-foundations.md#q22-01)

**Follow-ups:**

1. Is `subscribe` like calling a function?
2. How do I get a Promise out of one?

**Model-answer outline:** An Observable is a lazy collection of zero to many values that a producer pushes to a consumer. Nothing runs until `subscribe`, and each `subscribe` starts its own run. A function returns one value when called, an iterator is pulled, and a Promise pushes one value that its executor started producing at creation. It is not asynchronous by nature: `of(1, 2, 3)` reached the consumer before `subscribe` returned. Calling `subscribe` is analogous to calling a function, except one call may deliver many values, later. `firstValueFrom` or `lastValueFrom` make a Promise; an empty source rejects with `EmptyError`. Full answer: [Q22.01](modules/22-rxjs-foundations.md#q22-01).

**Scoring:** Full marks include "each `subscribe` starts its own run". Partial: lazy and many values, without that. Red flag: "a Promise for many values".

### Prompt 3 · Mechanism · "`switchMap`, `mergeMap`, `concatMap` and `exhaustMap`: what does each do with a new value while an inner is running?"

**Owner:** [Q23.03](modules/23-rxjs-in-depth.md#q23-03)

**Follow-ups:**

1. Do results come out in request order?
2. Which operator loses data?

**Model-answer outline:** `switchMap` unsubscribes the running inner and starts the new one. `mergeMap` starts the new one and keeps the old, so both run. `concatMap` queues the new value until the running inner completes. `exhaustMap` ignores it. With no inner running, all four just subscribe. Pick by what a second value means: it replaces the first, is independent, must follow in order, or is a duplicate. Order: only `concatMap` keeps request order; `mergeMap` forwards in arrival order, so a slow stale response can land last. Data loss: `exhaustMap` loses outer values and `switchMap` the old inner's pending results; `concatMap` loses none, but its buffer has no size limit. Full answer: [Q23.03](modules/23-rxjs-in-depth.md#q23-03).

**Scoring:** Full marks give all four behaviors with the meaning of a second value. Partial: right for `switchMap` and `mergeMap`, vague on the other two. Red flag: `concatMap` said to drop values while busy; that is `exhaustMap`.

### Prompt 4 · Mechanism · "Server cache, UI, form, URL and session state: what is each, and where does each live?"

**Owner:** [Q28.01](modules/28-state-management.md#q28-01)

**Follow-ups:**

1. Where does session state go?
2. Which kind needs a store library?
3. Two sibling components must stay in sync: lift the state, share a service with signals, or use a `Subject`? ([Q19.06](modules/19-component-communication-and-projection.md#q19-06))

**Model-answer outline:** Classify by who owns the truth and how long it must live. Server cache: a copy the server owns, in `httpResource` or a query library. URL: what must survive a reload or be shared, in query parameters. Form: a draft, in the forms API. UI: local to a component. Session: user and preferences, in a root service. A store is a container, not a kind of state. Session state: a root service, which an `effect` may mirror to storage ([Q09.18](modules/09-web-networking-storage-security.md#q09-18)). A store library is for the small client state left over. Siblings: lift for close neighbours, a signal service for far or many readers (the default), a `Subject` for events that are not state. Full answer: [Q28.01](modules/28-state-management.md#q28-01).

**Scoring:** Full marks give the kinds with where each lives. Partial: names the kinds without where each lives. Red flag: everything in one global store.

### Prompt 5 · Debugging · "A search shows stale results, a submit posts twice and an autosave drops edits. Find the wrong operator in each."

**Owner:** [Q23.06](modules/23-rxjs-in-depth.md#q23-06)

**Follow-ups:**

1. Is `switchMap` ever right for a save?
2. Does `exhaustMap` make a payment safe?

**Model-answer outline:** All three are wrong, each a rule meeting the wrong kind of work. The search is a query on `mergeMap`, so a slow stale response can arrive last; use `switchMap`. The submit is a command on `mergeMap`, so every click posts; use `exhaustMap`. The autosave is an ordered write on `switchMap`, so the next edit unsubscribes the save in flight; use `concatMap`. `switchMap` suits a save only when each save carries the whole state, so an older one is worthless. `exhaustMap` guards one subscription; a second tab or a retry still posts, so the server must tolerate repeats. Full answer: [Q23.06](modules/23-rxjs-in-depth.md#q23-06).

**Scoring:** Full marks give the operator and the reason per case. Partial: the right operators with no reason tied to query, command or ordered write. Red flag: `switchMap` everywhere because the typeahead tutorial used it.

### Prompt 6 · Design · "Design the client side of product search with autocomplete: when a request goes out, what the client caches, and what the user sees when search is slow or down."

The prompt narrows [Q46.02](modules/46-system-design-case-studies.md#q46-02), whose answer also covers the search API and its ranking, to the client side.

**Owner:** [Q46.02](modules/46-system-design-case-studies.md#q46-02), with [46 §2](modules/46-system-design-case-studies.md#2-autocomplete-and-typeahead-search-a-request-policy-a-prefix-cache-ranking-on-the-server-and-an-accessible-combobox)

**Follow-ups:**

1. Why a minimum length?
2. Which pipeline sends the request? ([Q23.28](modules/23-rxjs-in-depth.md#q23-28))
3. Why `aria-activedescendant`?

**Model-answer outline:** State assumptions aloud: 200,000 products, 8 suggestions, a 2-character minimum, a 250 ms pause, and only the latest answer shows. The contract is `GET /api/search/suggest?q=&limit=8`, returning `items` and `complete`. Client state: results keyed by the normalized query, with a prefix cache that answers longer queries only from complete results. Slow or 429: keep the last results, and watch latency and the 429 rate. The input is an APG combobox. Minimum length: one letter matches too much to rank. The pipeline wins when rate, order and combination are the problem; `rxResource` when the screen wants `status`, `value` and `error`. `aria-activedescendant` keeps focus in the input while the option is announced. Full answer: [Q46.02](modules/46-system-design-case-studies.md#q46-02).

**Scoring:** Full marks give the request policy, the cache and the failure behavior. Partial: a pause and a request, with no cache or failure behavior. Red flag: naming a search engine instead of the contract.

### Prompt 7 · Design · "Design a feature store as a service with signals: state shape, selectors, methods, loading and errors."

**Owner:** [Q28.04](modules/28-state-management.md#q28-04)

**Follow-ups:**

1. Why one write for `query` and `status`?
2. Why not an `effect` to load?
3. When would you reach for a store library instead? ([Q28.32](modules/28-state-management.md#q28-32))

**Model-answer outline:** One private `signal` holds a typed state: `query`, `items`, `status`. Public `computed` selectors read it, so no value is stored twice. Named methods are the only writers and patch related fields in one write, because a reader between two writes would see a state that never existed. A `Subject` with `switchMap` loads and drops stale responses; `catchError` inside it sets `status: 'error'` and keeps the last list. Methods start loads, not an `effect`. A library is justified for client state shared across features, with several writers and a need for traceability; server data never justifies a client store. Full answer: [Q28.04](modules/28-state-management.md#q28-04).

**Scoring:** Full marks give shape, selectors, writers, the stale-response rule and the error path. Partial: a signal and methods, with no handling of a stale response. Red flag: handing out the writable signal.

### Prompt 8 · Trade-off · "Signals or RxJS: what are your decision rules, and where do the conversions belong?"

**Owner:** [Q23.23](modules/23-rxjs-in-depth.md#q23-23)

**Follow-ups:**

1. Should a service keep a `BehaviorSubject` per field? ([Q17.40](modules/17-signals.md#q17-40))
2. Where do errors go?

**Model-answer outline:** Ask whether the value has a when. State the template reads now is a signal; events, time, cancellation and coordination of async sources stay RxJS; convert once at the edge, with `toSignal` or `rxResource`. Each conversion has a price: `toObservable` hands over the last of a batch, `toSignal` needs an injection context and an errored source makes every read throw, and `rxResource` shows `value()` `undefined` while it loads new params (`reload()` keeps the old value). So a search box has the term as a signal, the timing in RxJS and the answer back as a signal. A field read synchronously fits a signal; migrate gradually. Errors are handled in the pipe, before `toSignal`. Full answer: [Q23.23](modules/23-rxjs-in-depth.md#q23-23).

**Scoring:** Full marks give the rule, the conversion point and a cost of each conversion. Partial: "signals for state, RxJS for streams" with no place for the conversion. Red flag: converting a stream to a signal and straight back.

## Mock 4 · Routing, forms and HTTP

Length 60 minutes. Modules [24](modules/24-routing.md) to [27](modules/27-http-client.md), with [09](modules/09-web-networking-storage-security.md) (warm-up). Scoring focus: **Correctness** (guard return types, retry-safe methods) and **Trade-offs** (which forms API, where retry lives).

### Prompt 1 · Warm-up · "Safe, idempotent and cacheable methods: what does each property let a client or proxy do?"

**Owner:** [Q09.01](modules/09-web-networking-storage-security.md#q09-01)

**Follow-ups:**

1. How do you retry a `POST` safely?
2. Is `DELETE` safe?

**Model-answer outline:** Safe, essentially read-only: prefetch or call freely. Idempotent, where repeating has the same intended effect as once: retry after a timeout. Cacheable: a cache may store and reuse the response. `GET` is all three; `PUT` and `DELETE` are idempotent only; `POST` and `PATCH` are neither safe nor idempotent. Retrying a `POST` safely takes an idempotency key that your API deduplicates. `DELETE` is not safe, since it changes state; repeating it gives the same end state. Full answer: [Q09.01](modules/09-web-networking-storage-security.md#q09-01).

**Scoring:** Full marks classify the methods. Partial: the three definitions with no method classified. Red flag: equating idempotent with harmless.

### Prompt 2 · Mechanism · "What does `provideRouter` register, and how does the router choose the route for a URL?"

**Owner:** [Q24.01](modules/24-routing.md#q24-01)

**Follow-ups:**

1. How does this differ from `RouterModule.forRoot`? ([Q15.09](modules/15-standalone-and-ngmodules.md#q15-09))
2. What is a router feature?

**Model-answer outline:** `provideRouter(routes, ...features)` returns `EnvironmentProviders` that register the route table (a multi `ROUTES` provider), a root `ActivatedRoute`, a listener that starts the first navigation after bootstrap, and each feature's providers. The router tries the table in array order and the first match wins; a route with children matches only if its children consume the rest of the URL, otherwise the next sibling is tried. Versus `forRoot`: the same machinery in different packaging; `forRoot` is a `ModuleWithProviders` with options in one object, `provideRouter` takes feature functions and directives are imported per component. A feature is a `with...` call such as `withDebugTracing()`. Full answer: [Q24.01](modules/24-routing.md#q24-01).

**Scoring:** Full marks give the registered providers and the matching rule. Partial: route matching described, the registered providers not. Red flag: "the most specific route wins".

### Prompt 3 · Mechanism · "What are the functional guards, what may they return, and which navigation step does each control?"

**Owner:** [Q24.14](modules/24-routing.md#q24-14)

**Follow-ups:**

1. Where does the unsaved-changes check go? ([Q24.20](modules/24-routing.md#q24-20))
2. May a guard be the access control?

**Model-answer outline:** Four function types, one step each: `CanMatchFn` asks whether a route may be matched at all, during recognition; `CanActivateFn` whether it may activate; `CanActivateChildFn` whether its children may; `CanDeactivateFn<T>` whether the current component may be left. Each returns a `GuardResult`, `boolean | UrlTree | RedirectCommand`, directly or as an Observable or Promise. `false` cancels, and the other two cancel and redirect; only `canMatch` treats `false` softly, dropping its route so the next is tried. Unsaved changes go in `canDeactivate`, which gets the component and the next URL; closing the tab is `beforeunload`, not a guard. A guard is not the access control: the docs warn against it as the sole one. Full answer: [Q24.14](modules/24-routing.md#q24-14).

**Scoring:** Full marks give each guard's step and return type. Partial: the four guards without their return types. Red flag: every `false` read as "try the next route".

### Prompt 4 · Debugging · "An admin area hides behind a role guard that reads `localStorage`, and the API trusts the guard. What is wrong?"

**Owner:** [Q24.19](modules/24-routing.md#q24-19)

**Follow-ups:**

1. Does `canMatch` fix it? ([Q24.12](modules/24-routing.md#q24-12))
2. Does holding the role in a signal fix it?

**Model-answer outline:** Two bugs, one cause: the check runs where the user controls it. The guard trusts a value the user can write; in the lab `/admin` was admitted after `localStorage.setItem('role', 'admin')`. The API trusts the guard, so anyone who skips the page, with a modified bundle or a direct HTTP call, gets the data. The guard is UX; authorization is the server's, on every request. Fix the API first: verify identity and role on every request, answer `401` or `403`; keep the guard as courtesy, reading the role from the session. `canMatch` keeps the router from loading the chunk but is the same client-side check. A signal changes nothing: all code in the browser can be modified. Full answer: [Q24.19](modules/24-routing.md#q24-19).

**Scoring:** Full marks fix both the guard and the API. Partial: fixes the guard and leaves the API trusting it. Red flag: calling the route "secured" because the link and page are hidden.

### Prompt 5 · Design · "Design a 'username taken' check: one server call per typing pause, none for invalid input, never stuck in `PENDING`."

**Owner:** [Q25.18](modules/25-forms-reactive-and-template-driven.md#q25-18)

**Follow-ups:**

1. What if the request fails?
2. A cheaper option? ([Q25.24](modules/25-forms-reactive-and-template-driven.md#q25-24))
3. And with Signal Forms? ([Q26.20](modules/26-signal-forms.md#q26-20))

**Model-answer outline:** Put the pause inside the validator: `timer(300)` before a `switchMap` to the request, so a new value cancels the timer and only the last value of a burst reaches `check`. Sync rules go in `validators`; while they fail the async validator is not called. Keep `check` completing, since validators wait for each other. Disable submit on `!form.valid`, because a `PENDING` form is not invalid. A failed request is mapped to a result inside the validator, for example with `catchError`, so the stream still ends (a design, not run). Cheaper: `updateOn: 'blur'` validates once per visit, with later feedback. Signal Forms: `required` and `minLength` first, `validateAsync` with `debounce`, `pending()` in the template, and `onError` with its own kind. Full answer: [Q25.18](modules/25-forms-reactive-and-template-driven.md#q25-18).

**Scoring:** Full marks give the pause, the sync-first rule, the `PENDING` handling and the failure path. Partial: a pause and sync rules, with no plan for a failing request. Red flag: debouncing `valueChanges` and expecting fewer validator calls.

### Prompt 6 · Design · "Order an interceptor stack for auth, a correlation ID, retry, error mapping and logging, and justify each position."

**Owner:** [Q27.14](modules/27-http-client.md#q27-14)

**Follow-ups:**

1. Where does a cache interceptor go?
2. Logging innermost instead?

**Model-answer outline:** `withInterceptors([logging, correlationId, errorMapping, retry, auth])`; list order is run order. Logging outermost sees the logical request and its outcome. The correlation ID, set before retry, rides on every attempt. Error mapping outside retry maps the final failure once. Auth innermost gives every attempt the current token, including one refreshed between attempts. Mapping in services keeps the raw status for callers; both are defensible. A cache interceptor goes innermost, after auth, skipping `Authorization` requests, because a URL-keyed hit must not cross users. Logging innermost would log each attempt, not the logical call; pick by purpose. Full answer: [Q27.14](modules/27-http-client.md#q27-14).

**Scoring:** Full marks give an order with a reason per position. Partial: an order without a reason per position. Red flag: auth listed before retry; the retried request keeps the token cloned on the first attempt.

### Prompt 7 · Trade-off · "Template-driven or reactive forms: which do you choose for which form?"

**Owner:** [Q25.02](modules/25-forms-reactive-and-template-driven.md#q25-02)

**Follow-ups:**

1. Where does Signal Forms fit?
2. Can one form use both?

**Model-answer outline:** Reactive for a rule across fields, async validation, run-time fields or logic to test without a DOM; template-driven for a short, fixed form the built-in directives validate, such as an email signup. One API per form. Reactive wins on testing, because the model exists in the constructor and a spec asserts values with no render. Template-driven wins on size, and costs a microtask: code that reads the form before controls register sees `{}`. Signal Forms is the third API, listed as stable public API (experimental in v21); the two older APIs remain. One form cannot use both: `<form [formGroup]>` is not an `NgForm`. Full answer: [Q25.02](modules/25-forms-reactive-and-template-driven.md#q25-02).

**Scoring:** Full marks give the form traits that decide, and where Signal Forms fits. Partial: a choice without those traits. Red flag: "reactive is always right".

### Prompt 8 · Trade-off · "Retry in an interceptor or at the call site: which methods and statuses are safe to retry?"

**Owner:** [Q27.18](modules/27-http-client.md#q27-18)

**Follow-ups:**

1. Where does `Retry-After` fit?
2. Both layers at once?

**Model-answer outline:** An interceptor gives every request one policy from the method, the status and an opt-out token; the call site knows the user's intent and can retry a `POST` it knows safe, for example with a client-generated key the server deduplicates. Retry only idempotent methods and only status 0, 408, 429 and 5xx; a 4xx other than 408 and 429 is the client's fault. Cap attempts and delay. Jitter spreads clients that failed together; an idempotency key lets the server apply a retried `POST` once. `Retry-After` is read in `delay` on a 429 or 503 (a design, not run). Both layers multiply attempts, so one layer owns retry. Full answer: [Q27.18](modules/27-http-client.md#q27-18).

**Scoring:** Full marks give methods, statuses, a cap and jitter. Partial: "retry idempotent methods" without the statuses, a cap or jitter. Red flag: a global `retry(3)` with no method or status check.

## Mock 5 · Testing, performance and SSR

Length 60 minutes. Modules [29](modules/29-testing-angular.md), [31](modules/31-performance.md) and [32](modules/32-ssr-ssg-hydration.md), with [08](modules/08-browser-rendering-dom-events.md) (warm-up). Scoring focus: **Mechanism** (hydration, what a check costs) and **Communication** in the diagnosis prompt (measure before changing).

### Prompt 1 · Warm-up · "LCP, INP and CLS: what does each measure, and what are the thresholds?"

**Owner:** [Q08.16](modules/08-browser-rendering-dom-events.md#q08-16)

**Follow-ups:**

1. Why the 75th percentile?

**Model-answer outline:** LCP is when the largest image, text block or video in the viewport rendered; good is 2.5 s or less, poor above 4 s. INP is the latency of clicks, taps and key presses during the visit; good is 200 ms or less, poor above 500 ms. CLS is the largest burst of unexpected layout shifts; good is 0.1 or less, poor above 0.25. INP replaced FID as a Core Web Vital on 12 March 2024. Each metric is judged at the 75th percentile, because most visits must be good, not the average one. Full answer: [Q08.16](modules/08-browser-rendering-dom-events.md#q08-16).

**Scoring:** Full marks give what each measures, both thresholds and the 75th percentile. Partial: thresholds without the 75th percentile. Red flag: FID quoted as current.

### Prompt 2 · Mechanism · "Unit, integration, component and end-to-end tests in an Angular app: what does each exercise, and which tool runs it?"

**Owner:** [Q29.01](modules/29-testing-angular.md#q29-01)

**Follow-ups:**

1. Is a component test in jsdom end-to-end?
2. Where do accessibility checks go? ([Q11.19](modules/11-accessibility.md#q11-19))

**Model-answer outline:** The levels differ in how much real code runs. A unit test runs one function or class with doubles for its collaborators. A component test renders one template in `TestBed`. An integration test runs several real units and fakes only the network, for example with `HttpTestingController`. An end-to-end test drives the built app in a real browser. `ng test` runs the first three; the fourth belongs to a browser-driven tool. A jsdom test is not end-to-end: jsdom does no layout or painting and no server runs. Accessibility checks go in the layer that can see the defect: lint and component tests on every change, end-to-end scans and manual passes less often. Full answer: [Q29.01](modules/29-testing-angular.md#q29-01).

**Scoring:** Full marks give the four levels, the tool for each and the jsdom limit. Partial: the four levels without the tool that runs each. Red flag: calling every `TestBed` test a unit test.

### Prompt 3 · Mechanism · "What is hydration, and why does Angular reuse the server's DOM?"

**Owner:** [Q32.10](modules/32-ssr-ssg-hydration.md#q32-10)

**Follow-ups:**

1. Does hydration fetch the data again?
2. What if the DOM differs from the template? ([Q32.12](modules/32-ssr-ssg-hydration.md#q32-12))

**Model-answer outline:** Hydration is the browser's Angular taking over the server-rendered DOM: it walks its templates, claims each existing node as if it had created it, and attaches listeners. Rendering again would discard the nodes the user already sees and rebuild them, which may cause a visible UI flicker. The server writes an `ngh` attribute on each component host and an entry in the state script, so the client finds what each view rendered. Before 16.0 Angular discarded the DOM. For `HttpClient` calls the data is not fetched again: the cached response is reused. A DOM that differs makes hydration throw, because a shifted node cannot be told from a foreign one. Full answer: [Q32.10](modules/32-ssr-ssg-hydration.md#q32-10).

**Scoring:** Full marks give the takeover and why: no rebuild, no flicker. Partial: "takes over the DOM" without why. Red flag: "hydration renders the page again in the browser"; that was true before 16.0.

### Prompt 4 · Debugging · "A spec queries `.btn-primary` and reads `componentInstance` state. What breaks on the next refactor?"

**Owner:** [Q29.17](modules/29-testing-angular.md#q29-17)

**Follow-ups:**

1. Is `By.css` ever acceptable?
2. Is reading `componentInstance` always wrong?

**Model-answer outline:** Renaming `btn-primary` breaks the query with no behavior changed, because a class is styling. A `lastAction` field is an internal, so the test passes even if the template stops wiring the button. Test from the user's side: find the control by its accessible name, click through the DOM, and assert the rendered result or the output's emission. `By.css` is acceptable for an element with no role or label, through an agreed attribute, never a styling class. Reading `componentInstance` is not always wrong: subscribing to an `OutputEmitterRef` is the contract; private fields and internal signals are not. Full answer: [Q29.17](modules/29-testing-angular.md#q29-17).

**Scoring:** Full marks give both couplings and query by role and accessible name. Partial: names the brittleness but does not query by role and name. Red flag: swapping the class for another class or an `id`.

### Prompt 5 · Design · "'The app feels slow': how do you find out where, before changing any code?"

**Owner:** [Q31.01](modules/31-performance.md#q31-01), with [31 §1](modules/31-performance.md#1-measure-first-the-loop-lab-versus-field-and-what-each-tool-answers)

**Follow-ups:**

1. What if there is no field data?
2. Which tool for a slow click?

**Model-answer outline:** Turn the feeling into one symptom a user can name: a slow first view, a slow interaction or growing memory. Ask field data how bad it is and for whom, reproduce it in the lab with the tool for that symptom, and record a baseline. Only then change one thing and measure again with the same tool, because a change without a before and an after is a guess. Take load numbers from the production build. With no field data, say so: a lab number speaks for one controlled load, not for users; add real user monitoring first. For a slow click, the Performance panel; the Angular profiler only when the flame chart points at change detection. Full answer: [Q31.01](modules/31-performance.md#q31-01).

**Scoring:** Lead with Communication: the symptom, the baseline and the order are said before any fix. Partial: reproduces in the lab with no field data or baseline. Red flag: quoting a Lighthouse score as the diagnosis.

### Prompt 6 · Debugging · "Typing in a dashboard's search box is slow: a template method over 5,000 rows, `track $index` on a sortable table, an `Eager` clock. Find the costs."

**Owner:** [Q31.07](modules/31-performance.md#q31-07)

**Follow-ups:**

1. Which fix first?
2. Could a pure pipe replace the `computed`?

**Model-answer outline:** Three costs. The method filters 5,000 rows on every check of its view: use a `computed`. `track $index` keys rows by position, so a sort rewrites every row; track by id so Angular moves nodes instead. The `Eager` clock is checked whenever a refresh passes through, keystrokes included: drop `Eager` and keep the time in a signal. A keystroke is an event, which refreshes the path to the root and any `Eager` siblings, so the clock rides along and re-runs the method. Fix first what you measure; the method is the usual suspect, not proof. A pure pipe runs 0 times for unrelated writes, but is stale after an in-place `push`. Full answer: [Q31.07](modules/31-performance.md#q31-07).

**Scoring:** Full marks find all three costs with the fix for each. Partial: finds the template method but misses `track $index` or the `Eager` clock. Red flag: debouncing the input; the filter still runs on every unrelated check.

### Prompt 7 · Debugging · "Three hydration mismatches: `document.createElement`, a `<div>` in a `<p>`, an `@if` on `isPlatformBrowser`. Which error does each raise?"

**Owner:** [Q32.12](modules/32-ssr-ssg-hydration.md#q32-12)

**Follow-ups:**

1. Where does the canvas go? ([Q20.13](modules/20-lifecycle-and-render-hooks.md#q20-13))
2. Why not `ngSkipHydration`? ([Q32.11](modules/32-ssr-ssg-hydration.md#q32-11))

**Model-answer outline:** The canvas raises `NG0500`, printed as the code alone in production: create it in `afterNextRender` or the template. The `<div>` in a `<p>` raises `NG0502`, because the parser closes the `<p>` early: nest validly. The `@if` raises nothing: the browser's branch replaces the server's element, so the page changes under the reader; render the same elements on both sides and keep the browser-only part in `afterNextRender`. The canvas goes in `afterNextRender`, in a `write` phase; the constructor and `ngOnInit` are too early. On the root, `ngSkipHydration` would effectively disable hydration for the whole application, and a skipped child's server work is discarded. Full answer: [Q32.12](modules/32-ssr-ssg-hydration.md#q32-12).

**Scoring:** Full marks give both error codes and the silent `@if` case. Partial: the two errors without the silent case. Red flag: reading a quiet console as a match.

### Prompt 8 · Trade-off · "When is server rendering not worth it?"

**Owner:** [Q32.02](modules/32-ssr-ssg-hydration.md#q32-02)

**Follow-ups:**

1. Does SSR improve LCP? ([31 §10](modules/31-performance.md#10-rendering-strategy-as-a-performance-decision-csr-ssr-and-ssg))
2. Is prerendering free?

**Model-answer outline:** When nobody but the signed-in user reads the HTML, or when the page cannot render without a browser. Each server-rendered route pays a render per request, a possibly higher time to first byte and hydration before it is interactive. Pages the same for everyone can pay once at build time (`Prerender`); per-request pages use `Server`; login-only pages can stay `Client`. This answer is the cost side: module 31 owns first paint and LCP. Prerendering is not free: every update needs a rebuild, a page of user data cannot be prerendered, and it may add significant time to production builds. Full answer: [Q32.02](modules/32-ssr-ssg-hydration.md#q32-02).

**Scoring:** Full marks give the costs and the page type that decides. Partial: costs listed with no page type that decides. Red flag: server-rendering an admin tool because the template did.

## Mock 6 · Full stack with Spring Boot

Length 60 minutes. Modules [41](modules/41-fullstack-api-contracts.md), [42](modules/42-fullstack-authentication.md) and [44](modules/44-fullstack-delivery-and-operations.md), with [09](modules/09-web-networking-storage-security.md) (warm-up), [33](modules/33-security.md) (follow-ups) and [46 §8](modules/46-system-design-case-studies.md#8-under-the-hood-a-money-transfer-with-idempotency-keys-optimistic-ui-that-never-claims-success-and-the-unknown-outcome) (the design case). Scoring focus: **Correctness** across the boundary (what the browser enforces and what the server must) and **Trade-offs** (where the token lives).

### Prompt 1 · Warm-up · "What does the same-origin policy block, what does CORS relax, and who enforces it?"

**Owner:** [Q09.12](modules/09-web-networking-storage-security.md#q09-12)

**Follow-ups:**

1. Same site?
2. A fix without CORS?

**Model-answer outline:** The policy lets pages send writes (links, forms) and embed cross-origin resources, but typically disallows reading cross-origin responses. CORS lets the other server opt in with response headers. The browser enforces it; curl, Postman and Node do not. A request that was sent is still run by the server; only the script's read is blocked, so CORS protects nothing against a forged request or a non-browser client. Same site is a looser, registrable-domain match. A fix without CORS: a same-origin proxy. Full answer: [Q09.12](modules/09-web-networking-storage-security.md#q09-12).

**Scoring:** Full marks say who enforces it and what a sent request still does. Partial: "CORS allows cross-origin requests" without who enforces it. Red flag: "CORS protects my API".

### Prompt 2 · Mechanism · "A cross-origin Angular app calls a Spring Boot API: what must Spring configure, and why answer the preflight before authentication?"

**Owner:** [Q41.01](modules/41-fullstack-api-contracts.md#q41-01)

**Follow-ups:**

1. Does it stop curl? ([Q09.13](modules/09-web-networking-storage-security.md#q09-13))
2. What does the answer carry?

**Model-answer outline:** Declare a `UrlBasedCorsConfigurationSource` with exact origins, methods and headers, and enable `.cors(withDefaults())`. The preflight carries no cookies, so authentication would reject it. MVC checks CORS only after mapping a handler, but security filters run first, so `@CrossOrigin` never sees the preflight; `.cors(...)` adds a filter that ends it. CORS does not stop curl: only requests with an `Origin` are checked. The answer carries the allowed origin, methods and `Max-Age`. Full answer: [Q41.01](modules/41-fullstack-api-contracts.md#q41-01).

**Scoring:** Full marks give the configuration and why the preflight must pass first. Partial: the CORS configuration without that reason. Red flag: `@CrossOrigin` alone once Spring Security is on; every POST preflight is then a 401.

### Prompt 3 · Mechanism · "Walk through the Authorization Code flow with PKCE: who talks to whom, and what do `state`, `nonce` and the verifier protect?"

**Owner:** [Q42.04](modules/42-fullstack-authentication.md#q42-04)

**Follow-ups:**

1. PKCE instead of `state`?
2. Why compare `iss`?

**Model-answer outline:** The app redirects to the IdP with `code_challenge`, `state` and `nonce`. Back comes `code`; the app posts it with `code_verifier` to the token endpoint. The verifier stops a stolen code, `state` a forged callback, `nonce` a replayed ID token; the app checks `nonce` in the ID token. PKCE can stand in for `state` only if the IdP supports PKCE. Comparing `iss` catches a mix-up. Full answer: [Q42.04](modules/42-fullstack-authentication.md#q42-04).

**Scoring:** Full marks give the redirects, the code exchange and what each parameter protects. Partial: the redirects and exchange without the protections. Red flag: "PKCE replaces `nonce`"; PKCE guards the code exchange, and only `nonce` ties the ID token to this login.

### Prompt 4 · Debugging · "After moving to a BFF every POST gets 403 from Spring Security. The raw cookie value is sent, the token was read before login, and someone suggests `csrf.disable()`. Find each bug."

**Owner:** [Q42.18](modules/42-fullstack-authentication.md#q42-18)

**Follow-ups:**

1. And from another origin? ([Q27.27](modules/27-http-client.md#q27-27))
2. When may CSRF be off? ([Q33.24](modules/33-security.md#q33-24))

**Model-answer outline:** Three bugs. One: no `csrf.spa()`, so the raw cookie value is rejected. Two: login cleared the token read before it, since the strategy clears the cookie at sign-in and the logout handler at logout; refetch after login and logout. Three: `csrf.disable()` removes the defence, and the session cookie is what a forged post rides; cookies are ambient credentials, so keep the check. From another origin, Angular compares origins and sends no `X-XSRF-TOKEN` header on a mismatch. CSRF may be off with no ambient credential, such as a bearer header that script sets. Full answer: [Q42.18](modules/42-fullstack-authentication.md#q42-18).

**Scoring:** Full marks find the token bugs and refuse `csrf.disable()`. Partial: finds one of the two token bugs. Red flag: `csrf.disable()` as the fix.

### Prompt 5 · Debugging · "Behind the proxy, `/api/orders` arrives as `/orders`, redirects point at `http://`, WebSockets fail, and an SSE stream arrives in bursts and drops after a minute."

**Owner:** [Q44.07](modules/44-fullstack-delivery-and-operations.md#q44-07)

**Follow-ups:**

1. Why a heartbeat under 60 seconds?
2. Who sends it?

**Model-answer outline:** Four faults. A URI on `proxy_pass` replaces the prefix, so drop it; without a URI the path is unchanged. Spring never learns the scheme: forward it, and set `forward-headers-strategy: native`. `Upgrade` is hop-by-hop, so it is not forwarded: set it. The stream is buffered: `proxy_buffering off`, plus a heartbeat. The heartbeat must come in under 60 seconds because the timeout counts between reads. The app sends it, because only the app knows the stream is idle. Full answer: [Q44.07](modules/44-fullstack-delivery-and-operations.md#q44-07).

**Scoring:** Full marks find all four faults. Partial: finds the path and scheme faults, misses buffering. Red flag: "a trailing `/` is cosmetic"; it is a URI, so it rewrites the path.

### Prompt 6 · Design · "Design the error contract an Angular app and a Spring API share."

**Owner:** [Q41.12](modules/41-fullstack-api-contracts.md#q41-12)

**Follow-ups:**

1. Why not just the status?
2. An unknown type?

**Model-answer outline:** RFC 9457 everywhere: a `type` URI per kind, field data in `errors`. The client keys on `type`, else the status. Answer a stale `If-Match` with 412, which stops concurrent modification; the UI rolls back. Make a retried `POST` safe with a key: this guide's example contract uses an `Idempotency-Key` header, not a standard; the server keeps the first result per key. Status alone is not enough because several kinds share one status, such as two different 409 conflicts, so only `type` picks the message. An unknown `type` falls back to the status. Full answer: [Q41.12](modules/41-fullstack-api-contracts.md#q41-12).

**Scoring:** Full marks give `type`, field data, the 412 and the keyed retry. Partial: statuses only, no `type`. Red flag: retrying a keyless `POST`; it may apply twice.

### Prompt 7 · Design · "Design a money transfer flow end to end: the steps, the idempotency key's life, the states, what the screen shows while pending."

**Owner:** [Q46.22](modules/46-system-design-case-studies.md#q46-22), with [46 §8](modules/46-system-design-case-studies.md#8-under-the-hood-a-money-transfer-with-idempotency-keys-optimistic-ui-that-never-claims-success-and-the-unknown-outcome)

**Follow-ups:**

1. The key across a reload?
2. On unknown?

**Model-answer outline:** Confirm makes one key; the screen is pending until a final answer. The contract is `POST /api/transfers` with a quoted `Idempotency-Key`, plus a status read. States: `submitting`, `unknown`, `succeeded`, `failed`. "Sent" and the balance wait for a 201 or a 200 read. A lost response is `unknown`, retried with the same key. The key is made once at confirm and kept by every retry. Across a reload it is stored with the pending intent, since a new key moves the money again. On unknown, show "checking", by retry or status read; "failed" would invite a resend. Full answer: [Q46.22](modules/46-system-design-case-studies.md#q46-22).

**Scoring:** Full marks give the key's life, the four states and the screen's wording. Partial: a new key per retry, or "sent" before the server confirms. Red flag: building the key from an email.

### Prompt 8 · Trade-off · "A browser-only OAuth client, a token-mediating backend or a BFF: what can injected script steal in each, and what does each cost?"

**Owner:** [Q42.08](modules/42-fullstack-authentication.md#q42-08)

**Follow-ups:**

1. Does a BFF stop XSS?
2. Where should the token live? ([Q33.21](modules/33-security.md#q33-21))

**Model-answer outline:** Browser-only: script can steal every token. Token-mediating backend: the access token. BFF: no tokens, though script can still call the API as the user. The BFF costs most: a session, a proxy, and CSRF defense for its cookie. A BFF does not stop XSS: client hijacking remains. For the token, keep it where script cannot read it: a BFF if you can, so the browser holds only a session cookie. Otherwise a short-lived access token in memory and the refresh token in an `HttpOnly` cookie; Web Storage last. Every option lets script in the page act as the user; the choice limits what is stolen. Full answer: [Q42.08](modules/42-fullstack-authentication.md#q42-08).

**Scoring:** Full marks give what script steals in each option and the cost. Partial: the three options without what script can steal in each. Red flag: "a BFF solves XSS".

## Mock 7 · Front-end system design: a team task board

Length 60 minutes, one case on a whiteboard. Module [45](modules/45-frontend-system-design-method.md). Prompt 1 is the brief; prompts 2 to 8 are the interviewer's steers in the method's order, so draw as you answer. The outline of the whole round is the time plan and trade-off statement of [45 §2](modules/45-frontend-system-design-method.md#2-communicating-under-time-pressure-a-time-plan-complete-trade-off-statements-and-diagrams-at-three-zoom-levels). Scoring focus: **Trade-offs** (complete statements, [Q45.04](modules/45-frontend-system-design-method.md#q45-04)) and **Communication** (the time plan and checkpoints of [Q45.03](modules/45-frontend-system-design-method.md#q45-03)).

### Prompt 1 · Requirements · "Design a team task board. Take the first five minutes."

**Owner:** [Q45.06](modules/45-frontend-system-design-method.md#q45-06)

**Follow-ups:**

1. Why devices and networks?
2. Why the card count?

**Model-answer outline:** Ask who uses it, on which devices and networks, how many cards, and what must update live. Functional: view, move, edit, comment. Assume 200 cards of about 1 KB and three sequential requests, and say so. Write the non-functional requirements as numbers: LCP, INP and CLS good at field p75; a first-screen budget on a named lab profile, `mobileSlow4G`, where a load has no INP; accessibility at WCAG 2.2 AA. A profile fixes round-trip time and throughput, which changes the byte budget. The card count decides windowing. Full answer: [Q45.06](modules/45-frontend-system-design-method.md#q45-06).

**Scoring:** Full marks ask, assume aloud and write numbers on a named profile. Partial: functional requirements only, no non-functional ones. Red flag: "it should be fast" with no number.

### Prompt 2 · Components · "Draw the component tree and the client-side model."

**Owner:** [Q45.08](modules/45-frontend-system-design-method.md#q45-08)

**Follow-ups:**

1. Why a container per route? ([Q38.06](modules/38-architecture-and-production-structure.md#q38-06))
2. Why normalize? ([Q28.29](modules/28-state-management.md#q28-29))

**Model-answer outline:** A lazy route, `/boards/:id`, holds one container, `BoardPage`, that loads the board and passes inputs down; `ColumnList`, `Column` and `Card` emit events up. Draw the model too: columns hold id lists, and cards sit in one map, so the cards stay normalized. Only the container calls the service, so no card fetches its own comments and builds a waterfall. A container per route owns loading. Normalizing means a move replaces two id lists, not cards, and the selectors pay for it. Full answer: [Q45.08](modules/45-frontend-system-design-method.md#q45-08).

**Scoring:** Full marks draw the tree and the model of the cards. Partial: a component tree with no client-side model of the cards. Red flag: drawing the folder tree; it shows files.

### Prompt 3 · API · "Design the board's API: resources, the first read, pagination, moving a card, errors and live updates."

**Owner:** [Q45.11](modules/45-frontend-system-design-method.md#q45-11)

**Follow-ups:**

1. Why cursors? ([Q41.13](modules/41-fullstack-api-contracts.md#q41-13))
2. Why `If-Match`? ([Q41.12](modules/41-fullstack-api-contracts.md#q41-12))

**Model-answer outline:** Boards and cards are resources. The first screen is one read, which saves round trips: `GET /api/boards/42` returns the board, columns and the first 50 cards. Later pages use cursors. A move is a conditional `PATCH` carrying `If-Match` with the version it read, refused when stale. Errors are problem details, and an event stream pushes changes. Cursors, because inserts do not shift pages. `If-Match`, because a stale write must not overwrite. Say the contract is illustrative. Full answer: [Q45.11](modules/45-frontend-system-design-method.md#q45-11).

**Scoring:** Full marks cover all six parts, with the conditional write for the move. Partial: no conditional write for the move. Red flag: exposing tables; the first screen then needs five requests.

### Prompt 4 · Trade-off · "The first screen: one request per resource, one aggregated endpoint, or GraphQL?"

**Owner:** [Q45.10](modules/45-frontend-system-design-method.md#q45-10)

**Follow-ups:**

1. Why cache per resource?
2. When does the aggregate win?

**Model-answer outline:** Make it a complete statement. Per resource when requests run in parallel; one aggregated endpoint when sequential round trips on a high-RTT profile dominate, accepting its coupling to the screen. A query language lets the client shape the response. Caching per resource, because each has its own key and invalidation, where the aggregate caches as one unit. The aggregate wins on a high-RTT first screen, where a trip is 150 ms. The cost: an aggregate changes when any part of it does, and a BFF can build it. Full answer: [Q45.10](modules/45-frontend-system-design-method.md#q45-10).

**Scoring:** Full marks state the axis, the deciding condition and the cost accepted. Partial: one option picked without the round-trip condition. Red flag: "one endpoint per screen always wins".

### Prompt 5 · Performance and accessibility · "Someone proposes lazy-loading everything, virtual-scrolling the board, drag and drop only, and a spinner per request. What is wrong?"

**Owner:** [Q45.12](modules/45-frontend-system-design-method.md#q45-12)

**Follow-ups:**

1. Why a keyboard path too?
2. When is windowing right?

**Model-answer outline:** Four problems. Lazy-loading the first route delays everything: load it up front. Windowing costs, so the card count decides; 200 cards skip it, and it is right with thousands of rows. Drag-only excludes users who cannot drag: add a menu path. WCAG SC 2.5.7 asks for a single-pointer path, a keyboard path alone does not meet it, and CDK drag and drop has none. A keyboard path is still needed, because 2.1.1 is a separate criterion. A spinner shifts layout: reserve space. Full answer: [Q45.12](modules/45-frontend-system-design-method.md#q45-12).

**Scoring:** Full marks find all four with the fix for each. Partial: finds two or three of the four. Red flag: "ARIA makes drag accessible"; roles add no way to operate.

### Prompt 6 · Caching · "Every cache between the user and the database: what does each hold, who invalidates it, how stale can it be?"

**Owner:** [Q45.13](modules/45-frontend-system-design-method.md#q45-13)

**Follow-ups:**

1. Why clear deeper layers?
2. Why does `index.html` differ?

**Model-answer outline:** Five layers, nearest first: component, in-memory cache, service worker, HTTP cache and CDN ([45 §7](modules/45-frontend-system-design-method.md#7-rendering-strategy-and-caching-layers-a-rendering-choice-per-route-and-every-cache-from-the-cdn-to-the-component)). Each holds a copy under a key, has its own invalidator and is stale at most its own age. The nearest fresh copy answers, so a write must clear deeper ones: a reload asks them first. A write clears only the layer its code reaches; the rest answer until they expire. `index.html` differs because `no-cache` makes the HTTP cache revalidate it ([09 §4](modules/09-web-networking-storage-security.md#4-http-caching)), so without a service worker a deploy shows on the next load; an installed worker keeps serving its own copy until it updates ([09 §9](modules/09-web-networking-storage-security.md#9-service-workers-and-the-pwa-manifest)). Full answer: [Q45.13](modules/45-frontend-system-design-method.md#q45-13).

**Scoring:** Full marks name the layers with the invalidator and the staleness bound of each. Partial: names the layers without who invalidates each. Red flag: clearing only memory after a save; the worker still holds the old copy.

### Prompt 7 · Trade-off · "Offline and write consistency per interaction: which interactions get which?"

**Owner:** [Q45.16](modules/45-frontend-system-design-method.md#q45-16)

**Follow-ups:**

1. Why operation ids?
2. Why not optimistic for deleting a board?

**Model-answer outline:** Our suggestion, per interaction: reads come from cache offline; a card move is queued, optimistic and sent with `If-Match`; a title edit is conditional; deleting a board is pessimistic, online only. The cost: queued writes need an outbox and bring conflicts, so only moves earn them; revisit if users work offline. Operation ids, because a replay after a lost response must not apply twice. A board delete is irreversible, so confirm first. A stale conditional write is refused, or may get a 2xx. Full answer: [Q45.16](modules/45-frontend-system-design-method.md#q45-16).

**Scoring:** Full marks give a policy per interaction with its cost and a revisit trigger. Partial: a policy per interaction with no cost named. Red flag: "offline-first everywhere"; each queued write can conflict.

### Prompt 8 · Failure modes · "Last step: what breaks, what does the user see, and how do you know?"

**Owner:** [Q45.15](modules/45-frontend-system-design-method.md#q45-15)

**Follow-ups:**

1. Why a signal per row?
2. Why degrade per widget?

**Model-answer outline:** One row per dependency: network, API, session, conflict, live stream, deploy, one widget. Each row has what the user sees and the signal that reports it. For the API: a retry message with the card unchanged, and an error report with a trace. Each failure needs a fallback the user can use and a signal a person can read. A signal per row, because an unseen failure cannot be fixed. Degrade per widget, because an error boundary keeps the rest of the board usable. Full answer: [Q45.15](modules/45-frontend-system-design-method.md#q45-15).

**Scoring:** Full marks give a user-facing behavior and a signal per dependency. Partial: failures listed without the signal that reports each. Red flag: "we log errors"; a log naming no dependency does not say what broke.

## Mock 8 · Architecture, migrations and a behavioral close

Length 60 minutes. Modules [38](modules/38-architecture-and-production-structure.md), [39](modules/39-version-history-and-migrations.md), [40](modules/40-framework-comparisons.md) and [47](modules/47-behavioral-and-interview-craft.md), with [05](modules/05-js-modules-memory-modern-features.md) (warm-up). Prompts 1 to 6 are technical; 7 and 8 are the behavioral close, told in STAR as [47 §1](modules/47-behavioral-and-interview-craft.md#1-the-behavioral-round-what-a-story-is-evidence-of-star-with-the-weight-on-action-and-an-explicit-result-and-a-story-bank) describes, with follow-ups that climb the ladder of [47 §7](modules/47-behavioral-and-interview-craft.md#7-under-the-hood-how-one-story-is-drilled-into-numbers-you-can-defend-and-telling-a-design-or-a-migration-as-your-own-project). Scoring focus: **Trade-offs** (dependency rules, migration order, "why Angular" with costs) and **Evidence** on the behavioral prompts.

### Prompt 1 · Warm-up · "What does a bundler need in order to tree-shake, and why does CommonJS defeat it?"

**Owner:** [Q05.07](modules/05-js-modules-memory-modern-features.md#q05-07)

**Follow-ups:**

1. Why can a Babel or TypeScript setting break it?
2. How does Angular benefit?

**Model-answer outline:** It must prove two things: that an export is never imported, and that dropping its module has no side effects. Static `import` and `export` give the first; `"sideEffects"` in `package.json` and `/* @__PURE__ */` annotations give the second. CommonJS exports are assigned at run time and `require(name)` can be computed, so a bundler has nothing static to analyze and keeps the whole module. A Babel or TypeScript setting that compiles `import` and `export` to CommonJS removes the static structure. Angular benefits because standalone components and `providedIn: 'root'` services are referenced through imports, so unused ones can drop out, though one scratch build kept unused services re-exported through an index. Full answer: [Q05.07](modules/05-js-modules-memory-modern-features.md#q05-07).

**Scoring:** Full marks give both proofs and the CommonJS reason. Partial: static imports without side-effect freedom. Red flag: marking a package `"sideEffects": false` while it imports CSS or polyfills.

### Prompt 2 · Mechanism · "Folders by type or by feature: what does each optimize for, and what does the style guide recommend?"

**Owner:** [Q38.02](modules/38-architecture-and-production-structure.md#q38-02)

**Follow-ups:**

1. Where do shared pieces go?
2. Is by-type ever right?

**Model-answer outline:** By type optimizes for finding a kind of file: every service is in one place. By feature optimizes for changing or deleting a feature: its components, services and tests sit together. The style guide recommends features: "Organize your project by feature areas". By type is easy while the app is small; at 200 files per folder a change to orders touches several folders, and deleting a feature leaves orphans. Shared pieces go in `shared/` if they have no feature knowledge, else in their feature. By type is fine inside a feature. Full answer: [Q38.02](modules/38-architecture-and-production-structure.md#q38-02).

**Scoring:** Full marks give both optimizations and the style guide's recommendation. Partial: the difference without the recommendation. Red flag: a `shared/` full of feature code; it recreates the by-type problem.

### Prompt 3 · Mechanism · "What are library types and scope tags, and which dependency rules follow?"

**Owner:** [Q38.10](modules/38-architecture-and-production-structure.md#q38-10)

**Follow-ups:**

1. Does this need Nx?
2. May `shared` import a feature?

**Model-answer outline:** A type says what code does: `feature` (screens), `ui` (presentational pieces), `data-access` (HTTP, store, mapping) and `util` (pure code). A scope tag says who owns it, such as `orders` or `shared`. The rules: `feature` may use `ui`, `data-access` and `util`; `ui` only `ui` and `util`; `data-access` only itself and `util`; `util` only `util`; a scope imports itself and `shared`. Arrows run toward `util`. In Nx the labels are tags enforced by `depConstraints`, but Nx is not required: folders plus `no-restricted-imports` or a custom checker enforce it. `shared` may not import a feature, since every scope would then depend on it. Full answer: [Q38.10](modules/38-architecture-and-production-structure.md#q38-10).

**Scoring:** Full marks give the four types, the scope rule and the enforcement. Partial: the four types without the rules between them. Red flag: treating tags as documentation, with no lint rule that reads them.

### Prompt 4 · Debugging · "A ui library injects `HttpClient`, a util library imports a component, a data-access library imports a ui file through `../../`. Which rules break?"

**Owner:** [Q38.11](modules/38-architecture-and-production-structure.md#q38-11)

**Follow-ups:**

1. Which break is worst?
2. How does the ui piece get its data?

**Model-answer outline:** Three different rules. The ui library breaks the intent of the type rule: `ui` holds no data access, and `HttpClient` is data access. The util library breaks "`util` imports only `util`". The data-access library breaks two: `data-access` may not import `ui`, and a relative path into another project bypasses its public entry. Costs: a ui piece that cannot render without HTTP, rendering code pulled into every consumer of the util, and a path that breaks when the other project renames a folder. The util break is worst: `ui` imports `util`, so a cycle forms, and ng-packagr refuses cycles between entry points. The ui piece gets its data through inputs from a container. Full answer: [Q38.11](modules/38-architecture-and-production-structure.md#q38-11).

**Scoring:** Full marks find all the breaks with a cost each. Partial: finds the breaks without their costs. Red flag: reading the type table as complete; external packages and relative paths need their own lint rules.

### Prompt 5 · Design · "Modernize a 300-component v15 NgModule app: in which order do you run the migrations, and why?"

**Owner:** [Q39.20](modules/39-version-history-and-migrations.md#q39-20)

**Follow-ups:**

1. Which order is free?
2. Why separate pull requests for the builder and the runner?

**Model-answer outline:** First reach v22, one hop per major. Then run standalone, then lazy-route conversion: only two edges are required, and `route-lazy-loading` converts only standalone components. Control flow and `inject()` have no prerequisite. Run the signal schematics, then review OnPush, remove `NgZone` waits, then go zoneless; signals before OnPush is our recommendation. Move the builder and the test runner in their own pull requests. Free order: control flow, `inject()`, builder and tests; keep one schematic per commit. Each of the builder and the runner changes how everything builds or runs, so a failure should point at one change. Full answer: [Q39.20](modules/39-version-history-and-migrations.md#q39-20).

**Scoring:** Full marks give the order, the two required edges and the reasons. Partial: the right steps in an order with no reasons. Red flag: running every schematic in one commit.

### Prompt 6 · Trade-off · "Why Angular?"

**Owner:** [Q40.13](modules/40-framework-comparisons.md#q40-13)

**Follow-ups:**

1. Which evidence is fact?
2. What do you tell a team already on Angular?
3. Is "Angular is for enterprises" an answer?

**Model-answer outline:** Five steps: the gates that left Angular in, what it gives, what it costs, when another framework wins, and what would flip the answer. It gives one release group moved by `ng update`, first-party router, forms, HTTP, SSR and test runner, and a time-based release schedule. It costs more to learn first, one shared calendar, and a library whose Angular peer range lags can hold an upgrade back. Costs are stated as plainly as strengths. Fact: versions, ranges and quotes are dated reads; the criteria order is the team's. A team already on Angular asks how to lower its costs: which migrations remove them. "For enterprises" is not an answer: nothing in the packages limits size. Full answer: [Q40.13](modules/40-framework-comparisons.md#q40-13).

**Scoring:** Full marks give all five steps with costs. Partial: a structure for a team still choosing, none for a team already on Angular. Red flag: a pitch with no costs; the interviewer hears advocacy.

### Prompt 7 · Behavioral · "Tell me about a migration you were part of deciding: incremental or a rewrite."

**Owner:** [Q47.08](modules/47-behavioral-and-interview-craft.md#q47-08)

**Follow-ups:**

1. And if it failed?
2. How did you order the work?
3. How do you know it worked? ([Q47.15](modules/47-behavioral-and-interview-craft.md#q47-15))

**Model-answer outline:** Tell the decision, your part and the result, in STAR with your own action as the substance. Use the migration beats: the options weighed then, why the team chose, your part, and the result, good or mixed, stated last. Our advice: the incremental migration that kept shipping is the more credible story. If it failed, give the result and what you would change, because a negative result stated clearly beats a good one left implied. Order the work by highest risk or most unblocking first, with a reason. To "how do you know", the interviewer climbs a six-rung ladder, so keep every number sourced and name field or lab. Full answer: [Q47.08](modules/47-behavioral-and-interview-craft.md#q47-08).

**Scoring:** Evidence in place of Mechanism: full marks give your own action, a result sentence and a sourced number. Partial: the decision told, the result left implied. Red flag: "we chose" when you advised; your role in the decision is the evidence.

### Prompt 8 · Behavioral close · "What would you like to ask us about our front-end practice?"

**Owner:** [Q47.14](modules/47-behavioral-and-interview-craft.md#q47-14)

**Follow-ups:**

1. Would you ask a manager or a peer?
2. Every answer was vague: then what?

**Model-answer outline:** Pick two or three areas per interviewer, ask one question each, and one follow-up if the answer is vague, because roles own different answers. The areas: the Angular version and update cadence, testing, the design system and accessibility, performance measurement, contracts and releases. For example: which Angular major are you on and when did you last update; what runs on every pull request; do you measure real users' page speed. Read answers for a current state and a plan: an old major means a migration, a cost you would carry. A manager for releases, a peer for testing. If all are vague, ask who owns it: no owner is itself the answer. Full answer: [Q47.14](modules/47-behavioral-and-interview-craft.md#q47-14).

**Scoring:** Evidence and Trade-offs are n/a here, since no story is told. Full marks ask by area for the role, with a follow-up on a vague answer. Partial: one generic question. Red flag: asking about the stack the ad already lists.
