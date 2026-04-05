import { env } from "@my-better-t-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import OpenAI from "openai";

const app = new Hono();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.post("/transcribe", async (c) => {
  const formData = await c.req.formData();
  const audioFile = formData.get("audio") as File;
  if (!audioFile) return c.json({ error: "No audio file" }, 400);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return c.json({ transcription: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return c.json({ error: "Transcription failed" }, 500);
  }
});

export default app;
