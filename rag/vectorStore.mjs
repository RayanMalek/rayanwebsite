/**
 * vectorStore.mjs
 *
 * Pure JS cosine similarity search — no dependencies, no magic.
 *
 * What it does:
 *   Given a query vector (the user's question as 1024 numbers) and
 *   the full index (36 chunks each with their own 1024 numbers),
 *   it scores every chunk against the query and returns the top K.
 *
 * The math — cosine similarity:
 *
 *   Imagine two arrows in space. Cosine similarity measures how much
 *   they point in the same direction, regardless of how long they are.
 *
 *   score = dot(a, b) / (|a| × |b|)
 *
 *   dot(a, b) = a[0]×b[0] + a[1]×b[1] + ... + a[1023]×b[1023]
 *               (sum of element-wise products)
 *
 *   |a|       = sqrt(a[0]² + a[1]² + ... + a[1023]²)
 *               (length/magnitude of the vector)
 *
 *   Dividing by the magnitudes normalises for length — so a short
 *   chunk and a long chunk can still score equally if they're about
 *   the same topic.
 *
 *   score = 1.0  → same direction, maximally similar
 *   score = 0.0  → perpendicular, unrelated
 *   score = -1.0 → opposite direction
 */

/**
 * Dot product of two equal-length numeric arrays.
 *
 * Example:
 *   dot([1, 2, 3], [4, 5, 6]) = 1×4 + 2×5 + 3×6 = 32
 */
function dot(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

/**
 * Euclidean magnitude (length) of a vector.
 *
 * Example:
 *   magnitude([3, 4]) = sqrt(3² + 4²) = sqrt(25) = 5
 */
function magnitude(a) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i]
  }
  return Math.sqrt(sum)
}

/**
 * Cosine similarity between two vectors.
 * Returns a number in [-1, 1].
 *
 * Guard: if either vector is all zeros (magnitude = 0),
 * return 0 to avoid dividing by zero.
 */
function cosineSimilarity(a, b) {
  const magA = magnitude(a)
  const magB = magnitude(b)
  if (magA === 0 || magB === 0) return 0
  return dot(a, b) / (magA * magB)
}

/**
 * Search the in-memory index for the chunks most similar to a query.
 *
 * Steps:
 *   1. Score every chunk against the query vector
 *   2. Sort all 36 scores descending
 *   3. Return the top K
 *
 * @param {number[]} queryVector
 *   The embedded user question — 1 float[] from embedQuery()
 *
 * @param {Array<{ text: string, source: string, embedding: number[] }>} index
 *   The full index loaded from rag/index.json
 *
 * @param {number} topK
 *   How many chunks to return (default 3)
 *
 * @returns {Array<{ text: string, source: string, score: number }>}
 *   Top K chunks sorted by relevance score, highest first
 */
export function search(queryVector, index, topK = 3) {
  // Score every chunk
  const scored = index.map(entry => ({
    text: entry.text,
    source: entry.source,
    score: cosineSimilarity(queryVector, entry.embedding),
  }))

  // Sort descending by score, take top K
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
