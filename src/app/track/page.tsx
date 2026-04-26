import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";

async function track(formData: FormData) {
  "use server";
  const raw = String(formData.get("orderNumber") ?? "").trim();
  if (!raw) redirect("/track?error=empty");
  const orderNumber = raw.toUpperCase().replace(/\s+/g, "");
  redirect(`/order/${orderNumber}`);
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; n?: string }>;
}) {
  const { error, n } = await searchParams;
  const { dict, fallback } = await getDictionary();
  const s = (k: string) => (dict[k] ?? fallback[k]) as string;
  const sFmt = (k: string, vars: Record<string, string>): string => {
    const tpl = (dict[k] ?? fallback[k] ?? k) as string;
    return tpl.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="glass-card rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">{s("track.title")}</h1>
        <p className="text-text-dim text-sm mb-6">{s("track.subtitle")}</p>
        <form action={track} className="space-y-4">
          <input
            type="text"
            name="orderNumber"
            placeholder="ECM-XXXXXX-XXXX"
            defaultValue={error === "notfound" ? n ?? "" : ""}
            autoFocus
            required
            className="w-full glass-card rounded-xl px-4 py-3.5 text-sm focus:border-gold/40 focus:outline-none font-mono tracking-wider uppercase"
          />
          {error === "empty" && (
            <p className="text-[11px] text-error">{s("track.errEmpty")}</p>
          )}
          {error === "notfound" && (
            <p className="text-[11px] text-error">
              {n
                ? sFmt("track.errNotFound", { n })
                : s("track.errNotFoundGeneric")}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-3.5 rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)]"
          >
            {s("track.submit")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/contacts" className="text-xs text-text-dim hover:text-gold">
            {s("track.contactMissing")}
          </Link>
        </div>
      </div>
    </div>
  );
}
