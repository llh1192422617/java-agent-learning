import type { CollectionEntry } from "astro:content";

export const statusLabels = {
  planned: "计划中",
  "in-progress": "学习中",
  completed: "已完成",
} as const;

export function daySlug(day: number): string {
  return `day-${String(day).padStart(2, "0")}`;
}

export function dayUrl(day: number): string {
  return `/days/${daySlug(day)}/`;
}

export function sortDays(entries: CollectionEntry<"days">[]) {
  return [...entries].sort((a, b) => a.data.day - b.data.day);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}
