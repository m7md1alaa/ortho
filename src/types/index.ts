import { z } from "zod";

export const wordSchema = z.object({
	id: z.string(),
	word: z.string().min(1, "Word is required"),
	definition: z.string().optional(),
	example: z.string().optional(),
	difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
	lastPracticed: z.date().optional(),
	nextReview: z.date().optional(),
	correctCount: z.number().default(0),
	incorrectCount: z.number().default(0),
	streak: z.number().default(0),
});

export const wordListSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "List name is required"),
	description: z.string().optional(),
	words: z.array(wordSchema).default([]),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
	totalPracticeTime: z.number().default(0),
});

export const practiceSessionSchema = z.object({
	id: z.string(),
	listId: z.string(),
	startedAt: z.date(),
	endedAt: z.date().optional(),
	wordsPracticed: z
		.array(
			z.object({
				wordId: z.string(),
				attempts: z.number(),
				correct: z.boolean(),
				timeSpent: z.number(),
			}),
		)
		.default([]),
});

export type Word = z.infer<typeof wordSchema>;
export type WordList = z.infer<typeof wordListSchema>;
export type PracticeSession = z.infer<typeof practiceSessionSchema>;
