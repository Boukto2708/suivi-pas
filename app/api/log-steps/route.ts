import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMBEDDED_DATE_PATTERN = /(\d{4}-\d{2}-\d{2})/;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.STEPS_SYNC_SECRET;
  if (!secret) return true;
  const provided =
    request.headers.get("x-sync-secret") ?? new URL(request.url).searchParams.get("secret");
  return provided === secret;
}

/** Les raccourcis iOS envoient parfois une date mal formatée (locale, heure
 * incluse...) malgré l'action "Formater" — on essaie de récupérer un YYYY-MM-DD
 * exploitable avant d'abandonner, plutôt que de rejeter une entrée par ailleurs valide. */
function normalizeDate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (DATE_PATTERN.test(raw)) return raw;

  const embedded = raw.match(EMBEDDED_DATE_PATTERN);
  if (embedded) return embedded[1];

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
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

  const { date: rawDate, steps: rawSteps } = body as { date?: unknown; steps?: unknown };
  const date = normalizeDate(rawDate);
  if (!date) {
    return NextResponse.json(
      { error: "Date invalide (attendu YYYY-MM-DD).", received: rawDate ?? null },
      { status: 400 }
    );
  }
  const stepsValue = Number(rawSteps);
  if (!Number.isFinite(stepsValue) || stepsValue <= 0) {
    return NextResponse.json(
      { error: "Nombre de pas invalide.", received: rawSteps ?? null },
      { status: 400 }
    );
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
