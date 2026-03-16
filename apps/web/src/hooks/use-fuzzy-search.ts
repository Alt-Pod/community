import { useState, useMemo } from "react";
import { fuzzySearchItems } from "@community/shared";

export function useFuzzySearch<T>(
  items: T[],
  fieldExtractor: (item: T) => string[],
): { query: string; setQuery: (q: string) => void; results: T[] } {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => fuzzySearchItems(items, query, fieldExtractor),
    [items, query, fieldExtractor],
  );

  return { query, setQuery, results };
}
