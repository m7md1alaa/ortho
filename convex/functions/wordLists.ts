import type { Id } from "@convex/dataModel";
import { CRPCError } from "better-convex/server";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import {
  authMutation,
  authQuery,
  internalMutation,
  publicQuery,
} from "../lib/crpc";
import type { Difficulty } from "../shared/schemas";
import { difficultySchema } from "../shared/schemas";

// =============================================================================
// Output Schemas
// =============================================================================

const wordListSchema = z.object({
  id: zid("wordLists"),
  name: z.string(),
  description: z.string().optional(),
  totalPracticeTime: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  wordCount: z.number(),
});

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

const wordListWithWordsSchema = z.object({
  id: zid("wordLists"),
  name: z.string(),
  description: z.string().optional(),
  totalPracticeTime: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  words: z.array(wordSchema),
});

const successSchema = z.object({ success: z.literal(true) });

const listCreatedSchema = z.object({ id: zid("wordLists") });

// =============================================================================
// Queries
// =============================================================================

/** Get all word lists for the current user with word counts */
export const getUserLists = authQuery
  .output(z.array(wordListSchema))
  .query(async ({ ctx }) => {
    const lists = await ctx
      .table("wordLists")
      .filter((q) =>
        q.and(
          q.eq(q.field("isSystem"), false),
          q.eq(q.field("createdBy"), ctx.userId),
          q.eq(q.field("deletionTime"), undefined)
        )
      )
      .order("desc");

    // Map to include word count using edge traversal
    return Promise.all(
      lists.map(async (list) => {
        const words = await list.edge("words");
        const activeWords = words.filter((w) => w.deletionTime === undefined);
        return {
          id: list._id,
          name: list.name,
          description: list.description,
          totalPracticeTime: list.totalPracticeTime,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          wordCount: activeWords.length,
        };
      })
    );
  });

/** Get a single list by ID with all its words */
export const getListById = authQuery
  .input(z.object({ listId: zid("wordLists") }))
  .output(wordListWithWordsSchema)
  .query(async ({ ctx, input }) => {
    const list = await ctx
      .table("wordLists")
      .get(input.listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    // Verify ownership
    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to access this list",
      });
    }

    // Get words via edge traversal
    const words = await list.edge("words");
    const activeWords = words
      .filter((w) => w.deletionTime === undefined)
      .map((w) => ({
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

    return {
      id: list._id,
      name: list.name,
      description: list.description,
      totalPracticeTime: list.totalPracticeTime,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      words: activeWords,
    };
  });

// =============================================================================
// Mutations
// =============================================================================

/** Create a new word list */
export const createList = authMutation
  .input(
    z.object({
      name: z.string().min(1, "List name is required"),
      description: z.string().optional(),
    })
  )
  .output(listCreatedSchema)
  .mutation(async ({ ctx, input }) => {
    const listId = await ctx.table("wordLists").insert({
      ...input,
      userId: ctx.userId,
      createdBy: ctx.userId,
      isPublic: false,
      isSystem: false,
      totalPracticeTime: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: listId };
  });

/** Update a word list's name and description */
export const updateList = authMutation
  .input(
    z.object({
      listId: zid("wordLists"),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    })
  )
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const { listId, ...updates } = input;
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
        message: "You don't have permission to update this list",
      });
    }

    await list.patch({
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  });

/** Soft delete a word list (cascades to words) */
export const deleteList = authMutation
  .input(z.object({ listId: zid("wordLists") }))
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
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
        message: "You don't have permission to delete this list",
      });
    }

    // Soft delete the list (cascades to words due to schema configuration)
    await list.delete();

    return { success: true };
  });

/** Restore a soft-deleted list */
export const restoreList = authMutation
  .input(z.object({ listId: zid("wordLists") }))
  .output(successSchema)
  .mutation(async ({ ctx, input }) => {
    const list = await ctx
      .table("wordLists")
      .get(input.listId as Id<"wordLists">);

    if (!list) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.userId !== ctx.userId) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to restore this list",
      });
    }

    if (list.deletionTime === undefined) {
      throw new CRPCError({
        code: "BAD_REQUEST",
        message: "List is not deleted",
      });
    }

    await list.patch({ deletionTime: undefined });

    return { success: true };
  });

// =============================================================================
// Public Queries (No Auth Required)
// =============================================================================

const publicWordListSchema = z.object({
  id: zid("wordLists"),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  totalPracticeTime: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  wordCount: z.number(),
});

const publicWordListWithWordsSchema = z.object({
  id: zid("wordLists"),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  totalPracticeTime: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  words: z.array(
    z.object({
      id: zid("words"),
      word: z.string(),
    })
  ),
});

/** Get all public system lists */
export const getPublicLists = publicQuery
  .output(z.array(publicWordListSchema))
  .query(async ({ ctx }) => {
    const lists = await ctx
      .table("wordLists")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("isSystem"), true),
          q.eq(q.field("deletionTime"), undefined)
        )
      )
      .order("desc");

    return Promise.all(
      lists.map(async (list) => {
        const words = await list.edge("words");
        const activeWords = words.filter((w) => w.deletionTime === undefined);
        return {
          id: list._id,
          name: list.name,
          description: list.description,
          category: list.category,
          difficulty: list.difficulty,
          totalPracticeTime: list.totalPracticeTime,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          wordCount: activeWords.length,
        };
      })
    );
  });

/** Get a single public list by ID */
export const getPublicListById = publicQuery
  .input(z.object({ listId: zid("wordLists") }))
  .output(publicWordListWithWordsSchema)
  .query(async ({ ctx, input }) => {
    const list = await ctx
      .table("wordLists")
      .get(input.listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (!(list.isPublic && list.isSystem)) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "This list is not public",
      });
    }

    const words = await list.edge("words");
    const activeWords = words
      .filter((w) => w.deletionTime === undefined)
      .map((w) => ({
        id: w._id,
        word: w.word,
      }));

    return {
      id: list._id,
      name: list.name,
      description: list.description,
      category: list.category,
      difficulty: list.difficulty,
      totalPracticeTime: list.totalPracticeTime,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      words: activeWords,
    };
  });

export const addWordsToPublicList = internalMutation
  .input(
    z.object({
      listId: zid("wordLists"),
      words: z.array(z.string().min(1)),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { listId, words } = input;

    // Get the list
    const list = await ctx.table("wordLists").get(listId as Id<"wordLists">);

    if (!list || list.deletionTime !== undefined) {
      throw new CRPCError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    // Verify it's a system list (admin created)
    if (!list.isSystem) {
      throw new CRPCError({
        code: "FORBIDDEN",
        message: "Can only add words to system lists",
      });
    }

    // Insert all words
    const insertedIds: Id<"words">[] = [];
    for (const word of words) {
      const wordId = await ctx.table("words").insert({
        word: word.toLowerCase().trim(),
        listId: listId as Id<"wordLists">,
        difficulty: list.difficulty || "medium",
        correctCount: 0,
        incorrectCount: 0,
        streak: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      insertedIds.push(wordId);
    }

    return {
      success: true,
      insertedCount: insertedIds.length,
      wordIds: insertedIds,
    };
  });
