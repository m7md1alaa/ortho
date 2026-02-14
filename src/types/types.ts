import type { ApiOutputs } from "@convex/types";

export type Word = ApiOutputs["words"]["getWordsByListId"][number];
export type WordList = ApiOutputs["wordLists"]["getUserLists"][number];

export type Difficulty =
  ApiOutputs["words"]["getWordsByListId"][number]["difficulty"];
