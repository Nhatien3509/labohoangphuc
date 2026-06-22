import { z } from "zod";

/** Colocated Zod schemas for this route — keep regex in `@{{SLUG}}/_lib/validators`. */
export const exampleQuerySchema = z.object({
  q: z.string().optional(),
});
