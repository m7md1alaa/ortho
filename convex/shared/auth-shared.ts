import type { Doc, Id } from "../functions/_generated/dataModel";

import type { createAuth } from "../functions/auth";

export type Auth = ReturnType<typeof createAuth>;

export type SessionUser = Omit<Doc<"user">, "_creationTime" | "_id"> & {
  id: Id<"user">;
  session: Doc<"session">;
  impersonatedBy?: string;
};
