import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.STEPS_SYNC_SECRET;
  if (!secret) return true;
  const provided =
    request.headers.get("x-sync-secret") ?? new URL(request.url).searchParams.get("secret");
  return provided === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const { date, steps } = body as { date?: unknown; steps?: unknown };
  if (typeof date !== "string" || !DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: "Date invalide (attendu YYYY-MM-DD)." }, { status: 400 });
  }
  const stepsValue = Number(steps);
  if (!Number.isFinite(stepsValue) || stepsValue <= 0) {
    return NextResponse.json({ error: "Nombre de pas invalide." }, { status: 400 });
  }

  const year = Number(date.slice(0, 4));
  const roundedSteps = Math.round(stepsValue);
  const supabase = createServerSupabaseClient();

  const { data: existing, error: findError } = await supabase
    .from("step_entries")
    .select("id")
    .eq("year", year)
    .eq("date", date)
    .eq("source", "healthkit")
    .maybeSingle();
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });

  if (existing) {
    const { error } = await supabase
      .from("step_entries")
      .update({ steps: roundedSteps })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from("step_entries").insert({
      year,
      date,
      steps: roundedSteps,
      note: "Santé iPhone",
      source: "healthkit",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, year, date, steps: roundedSteps });
}
