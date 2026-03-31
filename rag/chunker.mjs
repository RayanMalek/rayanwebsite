/**
 * chunker.mjs
 *
 * Splits text into overlapping sentence-window chunks.
 *
 * Strategy:
 *   1. Split text into sentences on ". " / "! " / "? "
 *   2. Slide a window of `windowSize` sentences
 *   3. Step = windowSize - overlap → adjacent chunks share sentences
 *
 * Example (windowSize=2, overlap=1):
 *   sentences: [A, B, C, D]
 *   chunk 0: A + B
 *   chunk 1: B + C
 *   chunk 2: C + D
 */

/**
 * Strip markdown syntax that pollutes embeddings:
 * - Headings (## Title → "Title")
 * - Horizontal rules (--- → removed)
 * - Bold/italic markers (** * → removed)
 * - Bullet points (- item → "item")
 * - Blank lines (collapsed to single space)
 */
function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, '')      // ## Heading → Heading
    .replace(/^---+$/gm, '')           // horizontal rules
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')       // *italic* → italic
    .replace(/^[-*]\s+/gm, '')         // bullet points
    .replace(/\n{2,}/g, ' ')           // multiple newlines → space
    .replace(/\n/g, ' ')               // remaining newlines → space
    .trim()
}

function splitSentences(text) {
  return stripMarkdown(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * @param {string} text
 * @param {string} source      - filename / identifier stored in each chunk
 * @param {number} windowSize  - sentences per chunk
 * @param {number} overlap     - sentences shared between adjacent chunks
 * @returns {{ text: string, source: string }[]}
 */
export function chunkText(text, source, windowSize = 3, overlap = 1) {
  const sentences = splitSentences(text)

  if (sentences.length === 0) return []

  if (sentences.length <= windowSize) {
    return [{ text: sentences.join(' '), source }]
  }

  const chunks = []
  const step = windowSize - overlap

  for (let i = 0; i <= sentences.length - windowSize; i += step) {
    const chunkStr = sentences.slice(i, i + windowSize).join(' ').trim()
    if (chunkStr.length >= 20) chunks.push({ text: chunkStr, source })
  }

  // Trailing sentences that didn't fill a full window
  const covered = Math.floor((sentences.length - windowSize) / step) * step + windowSize
  if (covered < sentences.length) {
    const trailing = sentences.slice(covered).join(' ').trim()
    if (trailing.length >= 20) chunks.push({ text: trailing, source })
  }

  return chunks
}
