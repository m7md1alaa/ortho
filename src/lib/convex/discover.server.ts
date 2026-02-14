import type { Id } from "@convex/dataModel";
import { createServerFn } from "@tanstack/react-start";
import { runServerCall } from "@/lib/convex/server.server";

export const getPublicLists = createServerFn({ method: "GET" }).handler(
  async () => {
    return await runServerCall((caller) => caller.wordLists.getPublicLists({}));
  }
);

export const getPublicListById = createServerFn({
  method: "GET",
}).handler(async (ctx) => {
  const listId = (ctx as unknown as { data: Id<"wordLists"> }).data;
  return await runServerCall((caller) =>
    caller.wordLists.getPublicListById({ listId })
  );
});
