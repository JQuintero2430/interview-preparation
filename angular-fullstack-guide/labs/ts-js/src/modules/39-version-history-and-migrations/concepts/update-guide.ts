// Our classifier, mirroring showUpdatePath (internal) in the Update Guide's source, angular/angular
// adev/src/app/features/update/update.component.ts (branch main, read 2026-10-19, not run). It is ours, not the Guide:
// no rendering, no Markdown, no URL update and no pre-v6 install step. Steps use the shape of `Step` in
// recommendations.ts; versions are the numbers of the Guide's own list (21.0 is 2100, 10.2 is 1020).

/** The application levels of recommendations.ts's `ApplicationComplexity`: 1 basic, 2 medium, 3 advanced. */
export type GuideLevel = 1 | 2 | 3;

/** One step, in the shape of `Step` in recommendations.ts (without `action` and `renderedStep`). */
export interface GuideStep {
  readonly step: string;
  readonly possibleIn: number;
  readonly necessaryAsOf: number;
  readonly level: GuideLevel;
  readonly ngUpgrade?: boolean;
  readonly material?: boolean;
  readonly windows?: boolean;
  readonly angularCLI?: boolean;
  readonly pwa?: boolean;
}

/** The three options the Guide's `optionList` offers; `angularCLI` and `pwa` are in `Step` but not in that list. */
export type GuideOptions = Readonly<Record<'ngUpgrade' | 'material' | 'windows', boolean>>;

/** The step names in each list, in the order of the input. */
export interface Checklist {
  readonly before: string[];
  readonly during: string[];
  readonly after: string[];
}

const optionIds = ['ngUpgrade', 'material', 'windows'] as const;

// A step that needs an option the user did not select, or needs it off while it is on, is skipped.
function failsOptions(step: GuideStep, options: GuideOptions): boolean {
  return optionIds.some((id) => (step[id] === true && !options[id]) || (step[id] === false && options[id]));
}

/**
 * Sorts the steps into before, during and after for one update.
 * 1. Refuse a downgrade, with the Guide's message.
 * 2. Keep a step whose `level` fits and whose `necessaryAsOf` is after `from`, unless an option rules it out.
 * 3. Before: possible by `from` and not yet overdue; during: possible only after `from` and due by `to`;
 *    after: possible by `to`. A step that is none of these is left out.
 */
export function classifySteps(steps: readonly GuideStep[], from: number, to: number, level: GuideLevel, options: GuideOptions): Checklist {
  if (to < from) throw new Error('We do not support downgrading versions of Angular.');
  const checklist: Checklist = { before: [], during: [], after: [] };
  for (const step of steps) {
    if (step.level > level || step.necessaryAsOf <= from || failsOptions(step, options)) continue;
    if (step.possibleIn <= from && step.necessaryAsOf >= from) checklist.before.push(step.step);
    else if (step.possibleIn > from && step.necessaryAsOf <= to) checklist.during.push(step.step);
    else if (step.possibleIn <= to) checklist.after.push(step.step);
  }
  return checklist;
}
