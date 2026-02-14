import { z } from "zod";

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export type Difficulty = z.infer<typeof difficultySchema>;
