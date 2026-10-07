import { notFound } from "next/navigation";

// Unknown paths under a locale render [locale]/not-found.tsx inside the
// storefront layout. Without this catch-all they would fall through to
// the app-level 404, which has no root layout to render the shop chrome.
export default function CatchAllNotFound() {
  notFound();
}
