import type { ApiOutputs } from "@convex/types";
import type { GenericId } from "convex/values";

export type Word = ApiOutputs["words"]["getWordsByListId"][number];
export type WordList = ApiOutputs["wordLists"]["getUserLists"][number];

export type Difficulty =
  ApiOutputs["words"]["getWordsByListId"][number]["difficulty"];

export type Id<T extends string> = GenericId<T>;

export function asId<T extends string>(id: string): Id<T> {
  return id as Id<T>;
}
