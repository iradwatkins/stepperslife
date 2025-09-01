import { redirect } from "next/navigation";

export default function SellerPage() {
  // Server-side redirect to avoid client-side issues
  redirect("/organizer");
}
