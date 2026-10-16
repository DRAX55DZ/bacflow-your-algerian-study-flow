import type { Stream } from "./syllabus";
export interface Friend { id: string; name: string; stream: Stream; streak: number; pct: number; last: string; active: boolean }
// Demo classmates (shown until real accounts are connected)
export const FRIENDS: Friend[] = [
  { id: "amine", name: "Amine B.", stream: "math", streak: 21, pct: 64, last: "Finished Complex numbers 🎯", active: true },
  { id: "yasmine", name: "Yasmine K.", stream: "sci", streak: 14, pct: 58, last: "Solved Bac 2023 Physics", active: true },
  { id: "rayan", name: "Rayan M.", stream: "sci", streak: 0, pct: 31, last: "Inactive for 3 days", active: false },
  { id: "lina", name: "Lina H.", stream: "math", streak: 9, pct: 47, last: "Integrals summary done", active: true },
  { id: "walid", name: "Walid S.", stream: "sci", streak: 2, pct: 22, last: "Started Immunity unit", active: false },
];
