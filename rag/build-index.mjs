/**
 * build-index.mjs
 *
 * Run this ONCE (or whenever you update knowledge/about.md):
 *   node rag/build-index.mjs
 *
 * What it does:
 *   1. Reads knowledge/about.md
 *   2. Chunks it into overlapping sentence windows
 *   3. Sends all chunk texts to Voyage AI in one batch → gets embeddings
 *   4. Zips each chunk with its embedding into one object
 *   5. Saves the result to rag/index.json
 *
 * Output index.json shape:
 *   [
 *     { "text": "Rayan Malek is 21...", "source": "about.md", "embedding": [0.12, -0.45, ...] },
 *     ...36 entries
 *   ]
 */

import { readFileSync, writeFileSync } from 'fs'
import { chunkText } from './chunker.mjs'
import { embedTexts } from './embedder.mjs'

const KNOWLEDGE_FILE = 'knowledge/about.md'
const OUTPUT_FILE = 'rag/index.json'

// ── Step 1: Read the markdown file ───────────────────────────────────────────
console.log(`Reading ${KNOWLEDGE_FILE}...`)
const text = readFileSync(KNOWLEDGE_FILE, 'utf8')

// ── Step 2: Chunk into overlapping sentence windows ───────────────────────────
console.log('Chunking...')
const chunks = chunkText(text, 'about.md')
console.log(`  → ${chunks.length} chunks`)

// ── Step 3: Embed all chunks in one Voyage AI API call ────────────────────────
// We extract just the text strings because that's all Voyage needs.
// The chunks array and embeddings array will be the same length
// and stay in sync by position (index 0 matches index 0, etc.)
console.log('Embedding chunks via Voyage AI...')
const texts = chunks.map(c => c.text)
const embeddings = await embedTexts(texts)
console.log(`  → ${embeddings.length} embeddings (${embeddings[0].length} dimensions each)`)

// ── Step 4: Zip chunks + embeddings into one object per chunk ─────────────────
// chunks[i] was sent to Voyage and came back as embeddings[i].
// We merge them so each saved entry has: text + source + its vector.
const index = chunks.map((chunk, i) => ({
  text: chunk.text,
  source: chunk.source,
  embedding: embeddings[i],
}))

// ── Step 5: Save to disk ──────────────────────────────────────────────────────
writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2))
console.log(`\n✓ Index saved to ${OUTPUT_FILE}`)
console.log(`  ${index.length} chunks, each with a ${embeddings[0].length}-dim embedding`)
