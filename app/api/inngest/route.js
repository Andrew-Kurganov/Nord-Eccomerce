// app/api/inngest/route.js
import { serve } from "inngest/next";
import { inngest, functions } from "@/config/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  streaming: "allow",
  signingKey: process.env.INNGEST_SIGNING_KEY
});