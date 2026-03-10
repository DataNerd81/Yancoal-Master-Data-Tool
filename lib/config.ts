import { z } from "zod";

const envSchema = z.object({
  WORKOS_CLIENT_ID: z.string().min(1),
  WORKOS_API_KEY: z.string().min(1),
  WORKOS_COOKIE_PASSWORD: z.string().min(32),
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: z.string().url(),
  DATABASE_URL: z.string().min(1),
  INNGEST_EVENT_KEY: z.string().optional(),
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Missing required environment variables");
  }

  return parsed.data;
}

export const env = getEnv();
