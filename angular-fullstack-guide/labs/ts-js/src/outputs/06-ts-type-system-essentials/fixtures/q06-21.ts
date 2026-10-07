interface Profile {
  nick?: string;
  bio?: string | undefined;
}
const scores: number[] = [10, 20];
const env: Record<string, string> = { HOME: '/home/ada' };

export const a: Profile = { nick: undefined };
export const b: Profile = { bio: undefined };
export const c: Profile = {};
export const first: number = scores[0];
export const maybe: number | undefined = scores[0];
export const home: string = env['HOME'];
export const sum = scores.reduce((total, score) => total + score, 0);
export const labels = scores.map((score) => score.toFixed(1));
