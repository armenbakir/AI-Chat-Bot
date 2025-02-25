import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
  const { inputValue } = await request.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: inputValue }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { error: error.message },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
