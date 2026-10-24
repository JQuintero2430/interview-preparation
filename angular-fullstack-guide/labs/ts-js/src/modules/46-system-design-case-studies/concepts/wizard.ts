// Section 5 model: the step model of a form wizard and the migration of a saved draft. Our model; the `linear` gate
// mirrors 36 §8's statement ("a linear stepper will not leave a step until it is valid"), not CdkStepper's code.
// Visibility is computed from the answers, so a hidden step needs no flag that can drift. Plain values only: no
// router, form library, storage, clock, randomness or network; saving a draft is the exercise's job (Exercise 46.3).

export type Answers = Readonly<Record<string, string>>;

export interface Step {
  readonly id: string;
  /** A conditional step shows only while this holds for the answers so far; no rule means always visible. */
  readonly visibleWhen?: (answers: Answers) => boolean;
  readonly isValid: (answers: Answers) => boolean;
}

export interface WizardState {
  readonly stepId: string;
  readonly answers: Answers;
}

export interface Draft {
  readonly schemaVersion: number;
  readonly answers: Answers;
}

/** One step of the chain: it turns answers saved under `from` into answers for `from + 1`. */
export interface Migration {
  readonly from: number;
  readonly migrate: (answers: Answers) => Answers;
}

export function visibleSteps(steps: readonly Step[], answers: Answers): readonly Step[] {
  return steps.filter((step) => step.visibleWhen?.(answers) ?? true);
}

function move(steps: readonly Step[], state: WizardState, offset: 1 | -1): WizardState {
  const visible = visibleSteps(steps, state.answers);
  const target = visible[visible.findIndex((step) => step.id === state.stepId) + offset];
  return target === undefined ? state : { ...state, stepId: target.id };
}

/** Leaves the current step only when it is valid; hidden steps are never visited, so never validated. */
export function next(steps: readonly Step[], state: WizardState): WizardState {
  const current = steps.find((step) => step.id === state.stepId);
  return current?.isValid(state.answers) === true ? move(steps, state, 1) : state;
}

/** Back needs no validity and never touches the answers, so later steps keep theirs. */
export function back(steps: readonly Step[], state: WizardState): WizardState {
  return move(steps, state, -1);
}

/** The first visible step that is not valid, or the last visible step when every one is. */
export function landingStep(steps: readonly Step[], answers: Answers): string {
  const visible = visibleSteps(steps, answers);
  const open = visible.find((step) => !step.isValid(answers)) ?? visible.at(-1);
  return open?.id ?? '';
}

/** Applies the migrations in version order, each only when its `from` is the draft's current version. */
export function restore(draft: Draft, migrations: readonly Migration[]): Draft {
  const ordered = [...migrations].sort((a, b) => a.from - b.from);
  return ordered.reduce<Draft>(
    (current, migration) =>
      migration.from === current.schemaVersion
        ? { schemaVersion: migration.from + 1, answers: migration.migrate(current.answers) }
        : current,
    draft,
  );
}
