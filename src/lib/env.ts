import { z } from "zod";

// CONTENT_SOURCE has no default on purpose: falling back to fixtures would
// let a misconfigured production build publish fake speakers without failing.
const envSchema = z.discriminatedUnion("CONTENT_SOURCE", [
  z.object({
    CONTENT_SOURCE: z.literal("fixtures"),
  }),
  z.object({
    CONTENT_SOURCE: z.literal("webflow"),
    WEBFLOW_API_TOKEN: z.string().trim().min(1, "WEBFLOW_API_TOKEN is required when CONTENT_SOURCE=webflow"),
  }),
]);

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`);
    throw new Error(
      [
        "Invalid environment variables:",
        ...problems,
        'Set CONTENT_SOURCE to "fixtures" (no token needed) or "webflow". See .env.example.',
      ].join("\n"),
    );
  }
  return result.data;
}

// Read on demand rather than at import time, so modules that never touch
// content can be built and tested without any variables set.
export function getEnv(): Env {
  return parseEnv(process.env);
}
