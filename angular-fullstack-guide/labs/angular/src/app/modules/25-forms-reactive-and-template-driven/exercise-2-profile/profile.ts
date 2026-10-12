/** The profile the form edits. Dates are ISO `YYYY-MM-DD` strings, so text order is date order. */
export interface Profile {
  name: string;
  email: string;
  start: string;
  end: string;
}

export const INITIAL_PROFILE: Profile = {
  name: 'Ann Lee',
  email: 'ann@lab-m25.test',
  start: '2026-01-01',
  end: '2026-12-31',
};
