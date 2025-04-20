import { serve } from "inngest/next";
import { inngest } from "@/config/inngest";
import functions from "@/config/inngest"; // Импорт по умолчанию

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions, // Используем импортированный массив
  signingKey: process.env.INNGEST_SIGNING_KEY
});

