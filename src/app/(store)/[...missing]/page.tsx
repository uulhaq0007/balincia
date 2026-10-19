import { notFound } from "next/navigation";

// Routes unknown URLs through (store)/not-found.tsx so they keep the store header and footer.
export default function CatchAll() {
  notFound();
}
