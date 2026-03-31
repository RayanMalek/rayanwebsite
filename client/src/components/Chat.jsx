import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'What do you do?',
  'Where are you based?',
  'What kind of projects do you take on?',
]

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontFamily: 'var(--font-display)',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.05em',
            flexShrink: 0,
            marginRight: '12px',
            marginTop: '2px',
          }}
        >
          R
        </div>
      )}
      <div
        style={{
          maxWidth: '68%',
          padding: isUser ? '12px 16px' : '0',
          background: isUser ? 'rgba(255,255,255,0.07)' : 'transparent',
          border: isUser ? '1px solid rgba(255,255,255,0.1)' : 'none',
          borderRadius: isUser ? '16px 16px 4px 16px' : '0',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          fontWeight: 300,
          lineHeight: 1.7,
          color: isUser ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)',
          letterSpacing: '0.01em',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
        {!content && (
          <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', height: '18px' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0s infinite' }} />
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0.2s infinite' }} />
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0.4s infinite' }} />
          </span>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return

    setStarted(true)
    setInput('')
    const userMsg = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setLoading(true)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok) throw new Error('Server error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE lines
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.delta) {
                assistantText += parsed.delta
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantText }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Make sure the server is running.',
        }
        return updated
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <section
      id="chat"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '120px 48px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '64px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          Ask me anything
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#fff',
          }}
        >
          Let's talk.
        </h2>
      </div>

      {/* Chat window */}
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Suggestions (shown before first message) */}
        {!started && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px',
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 300,
                  padding: '8px 18px',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, marginBottom: '32px', minHeight: started ? '200px' : 0 }}>
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '14px 16px',
            transition: 'border-color 0.2s ease',
          }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask something about me…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 300,
              lineHeight: 1.6,
              color: '#fff',
              letterSpacing: '0.01em',
              caretColor: '#fff',
              overflow: 'hidden',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'rgba(255,255,255,0.06)' : '#fff',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s ease, opacity 0.2s ease',
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
                stroke={loading || !input.trim() ? '#fff' : '#000'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <p
          style={{
            marginTop: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.18)',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          Powered by Claude · Answers reflect Rayan's actual background
        </p>
      </div>
    </section>
  )
}
