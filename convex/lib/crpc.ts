import { initCRPC } from 'better-convex/server';
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  action,
  internalAction,
} from '../functions/_generated/server';
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from '../functions/_generated/server';
import type { DataModel } from '../functions/_generated/dataModel';
import { getCtxWithTable } from './ents';

export type GenericCtx = QueryCtx | MutationCtx | ActionCtx;

const c = initCRPC
  .dataModel<DataModel>()
  .context({
    query: (ctx) => getCtxWithTable(ctx),
    mutation: (ctx) => getCtxWithTable(ctx),
  })
  .create({
    query,
    internalQuery,
    mutation,
    internalMutation,
    action,
    internalAction,
  });

export const publicQuery = c.query;
export const publicMutation = c.mutation;