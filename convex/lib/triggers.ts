import { Triggers } from "convex-helpers/server/triggers";
import type { DataModel } from "../functions/_generated/dataModel";

export const registerTriggers = () => {
  const triggers = new Triggers<DataModel>();

  // Example: Auto-maintain counts with aggregates
  // triggers.register('posts', aggregatePostCount.trigger());

  // Example: Activity tracking
  // triggers.register('posts', async (ctx, change) => {
  //   if (change.operation === 'insert') {
  //     console.log('Post created:', change.newDoc.title);
  //   }
  // });

  return triggers;
};
