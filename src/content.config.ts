import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const days = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/days" }),
  schema: z.object({
    day: z.number().int().positive(),
    title: z.string().min(1),
    date: z.coerce.date(),
    summary: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    status: z.enum(["planned", "in-progress", "completed"]),
    duration: z.string().min(1).optional(),
  }),
});

export const collections = { days };
