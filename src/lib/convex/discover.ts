import type { Id } from "@convex/dataModel";
import { createServerFn } from "@tanstack/react-start";
import { runServerCall } from "@/lib/convex/server.server";

export const getPublicListById = createServerFn({ method: "GET" })
  .inputValidator((data: { listId: Id<"wordLists"> }) => data)
  .handler(async ({ data }) => {
    return await runServerCall((caller) =>
      caller.wordLists.getPublicListById({ listId: data.listId })
    );
  });

export const getListById = createServerFn({ method: "GET" })
  .inputValidator((data: { listId: Id<"wordLists"> }) => data)
  .handler(async ({ data }) => {
    return await runServerCall((caller) =>
      caller.wordLists.getListById({ listId: data.listId })
    );
  });
