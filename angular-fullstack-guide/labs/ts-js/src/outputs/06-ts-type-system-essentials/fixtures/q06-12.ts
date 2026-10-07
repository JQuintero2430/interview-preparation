type Admin = { name: string; permissions: string[] };
type Guest = { name: string; expiresAt: number };
type Clash = { id: string } & { id: number };
type Conflict = { kind: 'admin'; level: number } & { kind: 'guest' };

declare const either: Admin | Guest;
declare const both: Admin & Guest;
declare const clash: Clash;
declare const conflict: Conflict;

export const a = either.name;
export const b = either.permissions;
export const c = both.permissions.length + both.expiresAt;
export const d = clash.id;
export const e: Clash = { id: 'x' };
export const f = conflict.level;
