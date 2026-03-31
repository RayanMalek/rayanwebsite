import 'dotenv/config'
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { retrieve } from './rag/retriever.mjs'

const app = express()
app.use(express.json())

// Allow requests from any Vercel deployment (and localhost for dev)
app.use((req, res, next) => {
  const origin = req.headers.origin || ''
  if (
    origin.endsWith('.vercel.app') ||
    origin.startsWith('https://rayanmalek') ||
    origin.startsWith('http://localhost')
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.get('/health', (req, res) => res.json({ ok: true }))

app.post('/chat', async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    // Get the user's latest question (last message in the array)
    const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content ?? ''

    // Retrieve the 3 most relevant chunks from the knowledge base
    const context = await retrieve(lastUserMessage)

    // Build the system prompt dynamically with the retrieved context
    const systemPrompt = `You are Rayan Malek's personal assistant on his portfolio website.
Answer questions about Rayan using ONLY the context provided below.
Be warm, direct, and concise (2-4 sentences).
If the answer is not in the context, say you don't have that information.
IMPORTANT: Write in plain conversational prose only. No markdown — no bullet points, no bold, no numbered lists, no headers. Just natural sentences.

CONTEXT:
${context}`

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Anthropic error:', err.message)
    res.write(`data: ${JSON.stringify({ delta: 'Sorry, something went wrong.' })}\n\n`)
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
