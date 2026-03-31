/**
 * retriever.mjs
 *
 * Used at runtime (every chat message) to find the most relevant
 * chunks for a given question.
 *
 * Flow:
 *   1. Load rag/index.json once into memory (cached after first call)
 *   2. Embed the user's question via Voyage AI → 1 query vector
 *   3. Run cosine similarity search against all 36 chunk vectors
 *   4. Return the top 3 chunk texts joined as a single context string
 *
 * The context string is what gets injected into Claude's system prompt.
 */

import { readFileSync } from 'fs'
import { embedQuery } from './embedder.mjs'
import { search } from './vectorStore.mjs'

// Cache the index in memory after the first load.
// Without this, we'd read and JSON.parse the file on every single message.
// With it, the file is read once when the first message arrives, then
// the parsed array lives in memory for all future requests.
let cachedIndex = null

function loadIndex() {
  if (!cachedIndex) {
    // readFileSync returns a string → JSON.parse turns it into a JS array
    const raw = readFileSync('rag/index.json', 'utf8')
    cachedIndex = JSON.parse(raw)
    console.log(`[retriever] Loaded ${cachedIndex.length} chunks from index`)
  }
  return cachedIndex
}

/**
 * retrieve — main export, called once per chat message in server.mjs
 *
 * @param {string} question  - The user's latest message
 * @param {number} topK      - How many chunks to retrieve (default 3)
 * @returns {Promise<string>} - Top K chunk texts joined with "---" separators
 */
export async function retrieve(question, topK = 5) {
  const index = loadIndex()

  // Turn the question into a vector so we can compare it against chunk vectors
  const queryVector = await embedQuery(question)

  // Score all 36 chunks, return the top K most similar
  const results = search(queryVector, index, topK)

  // Join the chunk texts into one block — the "---" helps Claude see
  // where one chunk ends and another begins
  return results.map(r => r.text).join('\n\n---\n\n')
}
