import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import SearchClient from "./SearchClient";

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  
  let searchResults = [];
  
  try {
    // Fetch search results server-side
    searchResults = await fetchQuery(api.events.search, { searchTerm: query });
    console.log(`Server-side search: Found ${searchResults.length} events for query "${query}"`);
  } catch (error) {
    console.error("Error searching events:", error);
    searchResults = [];
  }

  return <SearchClient initialEvents={searchResults} searchQuery={query} />;
}
