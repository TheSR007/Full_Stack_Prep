import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  const category = searchParams.get("category") || "";

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    filterApplied: { search, priority, category },
    message: "TaskFlow API Route Handler GET endpoint",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully via Next.js Route Handler",
        task: {
          id: `task-${crypto.randomUUID()}`,
          ...body,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 500 });
  }
}
