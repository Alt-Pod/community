import { serve } from "inngest/next";
import { inngest } from "@community/backend";
import { inngestFunctions } from "@community/ai";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: inngestFunctions,
});
