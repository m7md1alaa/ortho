/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  user: {
    getSessionUser: FunctionReference<
      "query",
      "public",
      {},
      { email: string; id: any; image?: string | null; name: string }
    >;
  };
  wordLists: {
    createList: FunctionReference<
      "mutation",
      "public",
      { description?: string; name: string },
      any
    >;
    deleteList: FunctionReference<"mutation", "public", { listId: any }, any>;
    getListById: FunctionReference<"query", "public", { listId: any }, any>;
    getUserLists: FunctionReference<"query", "public", {}, any>;
    restoreList: FunctionReference<"mutation", "public", { listId: any }, any>;
    updateList: FunctionReference<
      "mutation",
      "public",
      { description?: string; listId: any; name?: string },
      any
    >;
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {
  auth: {
    beforeCreate: FunctionReference<
      "mutation",
      "internal",
      { data: any; model: string },
      any
    >;
    beforeDelete: FunctionReference<
      "mutation",
      "internal",
      { doc: any; model: string },
      any
    >;
    beforeUpdate: FunctionReference<
      "mutation",
      "internal",
      { doc: any; model: string; update: any },
      any
    >;
    create: FunctionReference<
      "mutation",
      "internal",
      {
        beforeCreateHandle?: string;
        input: { data: any; model: string };
        onCreateHandle?: string;
        select?: Array<string>;
      },
      any
    >;
    deleteMany: FunctionReference<
      "mutation",
      "internal",
      {
        beforeDeleteHandle?: string;
        input: { model: string; where?: Array<any> };
        onDeleteHandle?: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      any
    >;
    deleteOne: FunctionReference<
      "mutation",
      "internal",
      {
        beforeDeleteHandle?: string;
        input: { model: string; where?: Array<any> };
        onDeleteHandle?: string;
      },
      any
    >;
    findMany: FunctionReference<
      "query",
      "internal",
      {
        join?: any;
        limit?: number;
        model: string;
        offset?: number;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        sortBy?: { direction: "asc" | "desc"; field: string };
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "not_in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    findOne: FunctionReference<
      "query",
      "internal",
      {
        join?: any;
        model: string;
        select?: Array<string>;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "not_in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    getLatestJwks: FunctionReference<"action", "internal", {}, any>;
    onCreate: FunctionReference<
      "mutation",
      "internal",
      { doc: any; model: string },
      any
    >;
    onDelete: FunctionReference<
      "mutation",
      "internal",
      { doc: any; model: string },
      any
    >;
    onUpdate: FunctionReference<
      "mutation",
      "internal",
      { model: string; newDoc: any; oldDoc: any },
      any
    >;
    rotateKeys: FunctionReference<"action", "internal", {}, any>;
    updateMany: FunctionReference<
      "mutation",
      "internal",
      {
        beforeUpdateHandle?: string;
        input: { model: string; update: any; where?: Array<any> };
        onUpdateHandle?: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      any
    >;
    updateOne: FunctionReference<
      "mutation",
      "internal",
      {
        beforeUpdateHandle?: string;
        input: { model: string; update: any; where?: Array<any> };
        onUpdateHandle?: string;
      },
      any
    >;
  };
};

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
