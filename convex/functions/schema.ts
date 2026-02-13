import { v } from "convex/values";
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";

const schema = defineEntSchema({
  user: defineEnt({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    username: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("email", ["email"])
    .edges("sessions", { to: "session", ref: "userId" })
    .edges("accounts", { to: "account", ref: "userId" })
    .edges("wordLists", { to: "wordLists", ref: "userId" }),

  session: defineEnt({
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("token", ["token"])
    .edge("user", { to: "user", field: "userId" }),

  account: defineEnt({
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("accountId", ["accountId"])
    .edge("user", { to: "user", field: "userId" }),

  verification: defineEnt({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("identifier", ["identifier"]),

  jwks: defineEnt({
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
  }),

  wordLists: defineEnt({
    name: v.string(),
    description: v.optional(v.string()),
    totalPracticeTime: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .deletion("soft")
    .edge("user", { to: "user", field: "userId" })
    .edges("words", { to: "words", ref: "listId", deletion: "soft" }),

  words: defineEnt({
    word: v.string(),
    definition: v.optional(v.string()),
    example: v.optional(v.string()),
    difficulty: v.string(),
    lastPracticed: v.optional(v.number()),
    nextReview: v.optional(v.number()),
    correctCount: v.number(),
    incorrectCount: v.number(),
    streak: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .deletion("soft")
    .edge("list", { to: "wordLists", field: "listId" }),
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
