import { serve } from "inngest/next";
import { inngest, inngestFunctions } from "@/config/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
  streaming: "allow",
  signingKey: process.env.INNGEST_SIGNING_KEY
});