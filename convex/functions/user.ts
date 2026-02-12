import { z } from 'zod';
import { zid } from 'convex-helpers/server/zod4';
import { publicQuery, publicMutation } from '../lib/crpc';

export const list = publicQuery
  .input(z.object({ limit: z.number().optional() }))
  .output(z.array(z.object({
    _id: zid('user'),
    _creationTime: z.number(),
    name: z.string(),
    email: z.string(),
  })))
  .query(async ({ ctx, input }) => {
    return ctx.table('user').take(input.limit ?? 10);
  });

export const create = publicMutation
  .input(z.object({ name: z.string(), email: z.string() }))
  .output(zid('user'))
  .mutation(async ({ ctx, input }) => {
    return ctx.table('user').insert(input);
  });