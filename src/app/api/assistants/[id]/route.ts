import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const projectOverride = url.searchParams.get("project") || undefined;
    const orgOverride = url.searchParams.get("org") || undefined;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Beta": "assistants=v2",
      "Content-Type": "application/json",
    };
    const orgHeader = orgOverride || process.env.OPENAI_ORG_ID;
    if (orgHeader) headers["OpenAI-Organization"] = orgHeader as string;
    const projectHeader =
      projectOverride ||
      process.env.OPENAI_PROJECT ||
      process.env.OPENAI_PROJECT_ID;
    if (projectHeader) headers["OpenAI-Project"] = projectHeader as string;

    const res = await fetch(`https://api.openai.com/v1/assistants/${id}`, {
      method: "GET",
      headers,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : { error: "empty_response" };
    if (!res.ok)
      return NextResponse.json(
        { status: res.status, data },
        { status: res.status }
      );

    const normalized = {
      id: data.id,
      name: data.name ?? "",
      instructions: data.instructions ?? "",
    };

    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
