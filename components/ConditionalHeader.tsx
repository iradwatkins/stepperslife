"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on dashboard pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }
  
  return <Header />;
}