import type { Id } from "@convex/dataModel";
import { CRPCError } from "better-convex/server";
import { zid } from "convex-helpers/server/zod3";
import { z } from "zod";
import { authMutation, authQuery } from "../lib/crpc";
import { difficultySchema } from "../shared/schemas";
import type { Difficulty } from "../shared/schemas";

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
      .table("wordLists", "userId", (q) => q.eq("userId", ctx.userId))
      .filter((q) => q.eq(q.field("deletionTime"), undefined))
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
