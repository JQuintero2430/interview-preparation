// ONE EXAMPLE TEAM'S JUDGMENTS, not facts about the frameworks: a team of several squads with a long-lived back
// office and little experience of any of the three. Another team would weigh and score differently. Each score cites
// the anchor of the section of module 40 whose reading the team leaned on; no score rests on a popularity or speed claim.
import type { Evidence, Gate, Score, Team } from '../decision';

const section = {
  s1: `#1-library-framework-progressive-framework-what-each-project-decides-for-you`,
  s2: `#2-templates-jsx-and-single-file-components-what-the-compiler-knows`,
  s3: `#3-reacts-model-re-rendering-reconciliation-memoization-and-the-react-compiler`,
  s4: `#4-signals-beyond-angular-vue-refs-solid-svelte-runes-preact-and-qwik`,
  s6: `#6-routing-forms-data-fetching-tooling-and-testing-first-party-or-ecosystem`,
  s7: `#7-ecosystem-size-release-policies-and-breaking-changes`,
};

const all = { Angular: true, React: true, Vue: true };

export const gates: readonly Gate[] = [
  { id: 'skills', text: 'the team can learn a template syntax or JSX', passes: all, source: section.s2 },
  { id: 'server-rendering', text: 'server rendering from the project or its recommended meta-framework', passes: all, source: section.s6 },
  { id: 'deprecation-policy', text: 'the project states how it treats deprecated features', passes: all, source: section.s7 },
];

/** A gate the example team does not set, used by tests: React's router is another project's package (section 6). */
export const firstPartyRouter: Gate = {
  id: 'first-party-router',
  text: "a router maintained by the framework's own project",
  passes: { Angular: true, React: false, Vue: true },
  source: section.s6,
};

const e = (candidate: string, criterion: string, score: Score, source: string): Evidence => ({ candidate, criterion, score, source });

export const evidence: readonly Evidence[] = [
  e('Angular', 'integration', 5, section.s6), e('React', 'integration', 2, section.s6), e('Vue', 'integration', 3, section.s6),
  e('Angular', 'upgrade-cost', 4, section.s6), e('React', 'upgrade-cost', 3, section.s6), e('Vue', 'upgrade-cost', 2, section.s7),
  e('Angular', 'reactivity', 5, section.s4), e('React', 'reactivity', 2, section.s3), e('Vue', 'reactivity', 4, section.s4),
  e('Angular', 'ecosystem-fit', 3, section.s7), e('React', 'ecosystem-fit', 5, section.s7), e('Vue', 'ecosystem-fit', 4, section.s7),
  e('Angular', 'tooling', 5, section.s6), e('React', 'tooling', 3, section.s6), e('Vue', 'tooling', 4, section.s6),
  e('Angular', 'learning-curve', 2, section.s2), e('React', 'learning-curve', 3, section.s1), e('Vue', 'learning-curve', 3, section.s1),
];

export const exampleTeam: Team = {
  label: "one example team's judgments, not facts about the frameworks",
  candidates: ['Angular', 'React', 'Vue'],
  gates,
  criteria: [
    { id: 'integration', weight: 4 },
    { id: 'upgrade-cost', weight: 2 },
    { id: 'reactivity', weight: 2 },
    { id: 'ecosystem-fit', weight: 4 },
    { id: 'tooling', weight: 2 },
    { id: 'learning-curve', weight: 6 },
  ],
  evidence,
};
