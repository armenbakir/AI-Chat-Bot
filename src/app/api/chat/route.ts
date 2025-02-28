import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { inputValue } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const chatResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: inputValue }],
      max_tokens: 50,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const aiTextResponse = chatResponse.data.choices[0].message.content.trim();

  const ttsResponse = await axios.post(
    "https://api.openai.com/v1/audio/speech",
    {
      model: "tts-1",
      input: aiTextResponse,
      voice: "alloy",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: "arraybuffer",
    }
  );

  return new NextResponse(
    JSON.stringify({
      text: aiTextResponse,
      audio: Buffer.from(ttsResponse.data).toString("base64"),
    }),

    {
      status: 200,
      headers: {
        "Conent-Type": "application/json",
      },
    }
  );
}
