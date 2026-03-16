/**
 * Compute the Levenshtein distance between two strings (case-insensitive).
 */
export function levenshteinDistance(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const m = al.length;
  const n = bl.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = al[i - 1] === bl[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }

  return prev[n];
}

/**
 * Check whether `query` fuzzy-matches `target`.
 *
 * Returns `{ match, score }` where lower score = better match.
 * - Empty query matches everything (score 0).
 * - Substring containment is score 0 (best).
 * - Otherwise slides a window of query-length across target and picks the
 *   minimum Levenshtein distance. Matches if distance <= threshold
 *   (default: floor(query.length / 3)).
 */
export function fuzzyMatch(
  query: string,
  target: string,
  threshold?: number,
): { match: boolean; score: number } {
  if (query.length === 0) return { match: true, score: 0 };

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring match — best score
  if (t.includes(q)) return { match: true, score: 0 };

  const maxDist = threshold ?? Math.max(1, Math.floor(q.length / 3));

  // For very short targets, compare directly
  if (t.length <= q.length) {
    const d = levenshteinDistance(q, t);
    return { match: d <= maxDist, score: d };
  }

  // Slide a window of q.length across target, find minimum distance
  let minDist = Infinity;
  const windowSize = q.length;
  for (let i = 0; i <= t.length - windowSize; i++) {
    const sub = t.slice(i, i + windowSize);
    const d = levenshteinDistance(q, sub);
    if (d < minDist) {
      minDist = d;
      if (d === 0) break;
    }
  }

  return { match: minDist <= maxDist, score: minDist };
}

/**
 * Filter and sort items by fuzzy-matching a query against multiple fields.
 *
 * Returns items whose best field score is within threshold, sorted by score
 * (best first). When query is empty, returns items unchanged.
 */
export function fuzzySearchItems<T>(
  items: T[],
  query: string,
  fields: (item: T) => string[],
): T[] {
  if (query.trim().length === 0) return items;

  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    let bestScore = Infinity;
    let matched = false;

    for (const field of fields(item)) {
      if (!field) continue;
      const result = fuzzyMatch(query.trim(), field);
      if (result.match && result.score < bestScore) {
        bestScore = result.score;
        matched = true;
      }
    }

    if (matched) {
      scored.push({ item, score: bestScore });
    }
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.item);
}
