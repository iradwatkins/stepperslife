import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SplitSetupClient from "./SplitSetupClient";

export default async function SplitSetupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <SplitSetupClient userId={userId} />;
}