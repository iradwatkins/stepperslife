import { redirect } from "next/navigation";

export default function AuthCallback() {
  // Simple server-side redirect to avoid client-side issues
  redirect("/profile");
}