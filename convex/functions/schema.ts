import { v } from 'convex/values';
import { defineEnt, defineEntSchema } from 'convex-ents';

const schema = defineEntSchema({
  user: defineEnt({
    name: v.string(),
    email: v.string(),
  }).index('email', ['email']),
});

export default schema;