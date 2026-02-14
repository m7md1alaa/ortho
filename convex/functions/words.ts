import type { Id } from "@convex/dataModel";
import { CRPCError } from "better-convex/server";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import { authMutation, authQuery } from "../lib/crpc";
import type { Difficulty } from "../shared/schemas";
import { difficultySchema } from "../shared/schemas";

// =============================================================================
// Output Schemas
// =============================================================================

const wordSchema = z.object({
  id: zid("words"),
  word: z.string(),
  definition: z.string().optional(),
  example: z.string().optional(),
  difficulty: difficultySchema,
  lastPracticed: z.number().optional(),
  nextReview: z.number().optional(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  streak: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const successSchema = z.object({ success: z.literal(true) });

const wordCreatedSchema = z.object({ id: zid("words") });

const wordImportedSchema = z.object({ count: z.number() });

const practiceRecordedSchema = z.object({
  success: z.literal(true),
  streak: z.number(),
  nextReview: z.number().optional(),
});

// =============================================================================
// Queries
// =============================================================================

/** Get all words for a specific list (with ownership check) */
export const getWordsByListId = authQuery
  .input(
    z.object({
      listId: zid("wordLists"),
    })
  )
  .output(z.array(wordSchema))
  .query(async ({ ctx, input }) => {
    // First verify list ownership
    const list = await ctx
      .table("wordLists")
      .get(input.listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this list",
      });
    }

    // Get active words via edge traversal
    const words = await list.edge("words");
    const activeWords = words.filter((w) => w.deletionTime === undefined);

    return activeWords.map((w) => ({
      id: w._id,
      word: w.word,
      definition: w.definition,
      example: w.example,
      difficulty: w.difficulty as Difficulty,
      lastPracticed: w.lastPracticed,
      nextReview: w.nextReview,
      correctCount: w.correctCount,
      incorrectCount: w.incorrectCount,
      streak: w.streak,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));
  });

// =============================================================================
// Mutations
// =============================================================================

/** Add a single word to a list */
export const addWord = authMutation
  .input(
    z.object({
      listId: zid("wordLists"),
      word: z.string().min(1, "Word is required"),
      definition: z.string().optional(),
      example: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]),
    })
  )
  .output(wordCreatedSchema)
  .mutation(async ({ ctx, input }) => {
    const { listId, ...wordData } = input;

    // Verify list ownership
    const list = await ctx.table("wordLists").get(listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to add words to this list",
      });
    }

    const wordId = await ctx.table("words").insert({
      ...wordData,
      listId: listId as Id<"wordLists">,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: wordId };
  });

/** Bulk import words (max 300) */
export const bulkImportWords = authMutation
  .input(
    z.object({
      listId: zid("wordLists"),
      words: z
        .array(
          z.object({
            word: z.string().min(1),
            definition: z.string().optional(),
            example: z.string().optional(),
            difficulty: z.enum(["easy", "medium", "hard"]),
          })
        )
        .max(300, "Cannot import more than 300 words at once"),
    })
  )
  .output(wordImportedSchema)
  .mutation(async ({ ctx, input }) => {
    const { listId, words } = input;

    // Verify list ownership
    const list = await ctx.table("wordLists").get(listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to add words to this list",
      });
    }

    const wordIds = await ctx.table("words").insertMany(
      words.map((word) => ({
        ...word,
        listId: listId as Id<"wordLists">,
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }))
    );

    return { count: wordIds.length };
  });

/** Update a word's details */
export const updateWord = authMutation
  .input(
    z.object({
      wordId: zid("words"),
      word: z.string().min(1).optional(),
      definition: z.string().optional(),
      example: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    })
  )
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const { wordId, ...updates } = input;

    const word = await ctx.table("words").get(wordId as Id<"words">);

    if (!word || word.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Word not found",
      });
    }

    // Verify ownership via list
    const list = await word.edge("list");
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to update this word",
      });
    }

    await word.patch({
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  });

/** Soft delete a word */
export const deleteWord = authMutation
  .input(z.object({ wordId: zid("words") }))
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const word = await ctx.table("words").get(input.wordId as Id<"words">);

    if (!word || word.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Word not found",
      });
    }

    // Verify ownership via list
    const list = await word.edge("list");
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this word",
      });
    }

    await word.delete();

    return { success: true };
  });

/** Restore a soft-deleted word */
export const restoreWord = authMutation
  .input(z.object({ wordId: zid("words") }))
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const word = await ctx.table("words").get(input.wordId as Id<"words">);

    if (!word) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Word not found",
      });
    }

    if (word.deletionTime === undefined) {
      throw new CRPCError({
        code: "BAD_REQUEST",
        message: "Word is not deleted",
      });
    }

    // Verify ownership via list
    const list = await word.edge("list");
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to restore this word",
      });
    }

    await word.patch({ deletionTime: undefined });

    return { success: true };
  });

/** Record practice session for a word */
export const recordPractice = authMutation
  .input(
    z.object({
      wordId: zid("words"),
      correct: z.boolean(),
      timeSpent: z.number().min(0),
    })
  )
  .output(practiceRecordedSchema)
  .mutation(async ({ ctx, input }) => {
    const { wordId, correct, timeSpent } = input;

    const word = await ctx.table("words").get(wordId as Id<"words">);

    if (!word || word.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Word not found",
      });
    }

    // Verify ownership via list
    const list = await word.edge("list");
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to record practice for this word",
      });
    }

    // Re-fetch list as writer to patch it
    const listWriter = await ctx.table("wordLists").getX(list._id);

    const updates: Partial<typeof word> = {
      lastPracticed: Date.now(),
    };

    if (correct) {
      updates.correctCount = word.correctCount + 1;
      updates.streak = word.streak + 1;
      // Calculate next review using spaced repetition (1 day * streak)
      updates.nextReview = Date.now() + updates.streak * 24 * 60 * 60 * 1000;
    } else {
      updates.incorrectCount = word.incorrectCount + 1;
      updates.streak = 0;
    }

    await word.patch(updates);
    await listWriter.patch({
      totalPracticeTime: list.totalPracticeTime + timeSpent,
    });

    return {
      success: true,
      streak: updates.streak,
      nextReview: updates.nextReview,
    };
  });

/** Reset practice stats for a word */
export const resetWordStats = authMutation
  .input(z.object({ wordId: zid("words") }))
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const word = await ctx.table("words").get(input.wordId as Id<"words">);

    if (!word || word.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "Word not found",
      });
    }

    // Verify ownership via list
    const list = await word.edge("list");
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to reset stats for this word",
      });
    }

    await word.patch({
      lastPracticed: undefined,
      nextReview: undefined,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      updatedAt: Date.now(),
    });

    return { success: true };
  });
