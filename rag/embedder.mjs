/**
 * embedder.mjs
 *
 * Calls the Voyage AI REST API to turn text into float vectors.
 * Model: voyage-3-lite  (fast, cheap, great for Q&A retrieval)
 *
 * Voyage docs: https://docs.voyageai.com/reference/embeddings-api
 *
 * Two exports:
 *   embedTexts(texts[])  → float[][]   (batch, used at index-build time)
 *   embedQuery(text)     → float[]     (single, used at query time)
 */

import 'dotenv/config'

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3'

/**
 * Internal: call Voyage AI with an array of strings.
 * Returns the embeddings array (float[][]).
 */
async function callVoyage(inputs, inputType) {
  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_AI_KEY}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: inputs,
      input_type: inputType,  // 'document' for indexing, 'query' for retrieval
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage AI error ${res.status}: ${err}`)
  }

  const json = await res.json()
  // Voyage returns: { data: [{ embedding: [...] }, ...] }
  return json.data.map(d => d.embedding)
}

/**
 * Embed an array of document texts (for index building).
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function embedTexts(texts) {
  return callVoyage(texts, 'document')
}

/**
 * Embed a single query string (for retrieval at chat time).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedQuery(text) {
  const results = await callVoyage([text], 'query')
  return results[0]
}
