import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = ['What do you do?', 'Where are you based?', 'What tech do you use?']

function Bubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontFamily: 'var(--font-display)',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.04em',
            flexShrink: 0,
            marginRight: '10px',
            marginTop: '2px',
          }}
        >
          R
        </div>
      )}
      <div
        style={{
          maxWidth: '78%',
          padding: isUser ? '9px 14px' : '2px 0',
          background: isUser ? 'rgba(255,255,255,0.06)' : 'transparent',
          border: isUser ? '1px solid rgba(255,255,255,0.09)' : 'none',
          borderRadius: isUser ? '14px 14px 3px 14px' : '0',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: 300,
          lineHeight: 1.65,
          color: isUser ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.65)',
          letterSpacing: '0.005em',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content || (
          <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', height: '16px' }}>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0s infinite' }} />
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0.2s infinite' }} />
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'blink 1.2s 0.4s infinite' }} />
          </span>
        )}
      </div>
    </div>
  )
}

export default function ChatEmbed() {
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
        const lines = decoder.decode(value, { stream: true }).split('\n')
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
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Make sure the server is running.' }
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
    <div>
      {/* Label */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}
      >
        Ask me anything
      </p>

      {/* Suggestion chips — shown before first message */}
      {!started && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '100px',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'var(--font-display)',
                fontSize: '11.5px',
                fontWeight: 300,
                padding: '6px 14px',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Message history */}
      {started && (
        <div
          style={{
            maxHeight: '160px',
            overflowY: 'auto',
            marginBottom: '12px',
            paddingRight: '4px',
          }}
        >
          {messages.map((msg, i) => (
            <Bubble key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '12px',
          padding: '11px 14px',
          transition: 'border-color 0.2s ease',
        }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask something about me…"
          disabled={loading}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 300,
            color: '#fff',
            letterSpacing: '0.01em',
            caretColor: '#fff',
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? 'transparent' : '#fff',
            border: loading || !input.trim() ? '1px solid rgba(255,255,255,0.12)' : 'none',
            borderRadius: '8px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s ease, opacity 0.2s ease',
            opacity: loading || !input.trim() ? 0.35 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 10V2M6 2L2 6M6 2L10 6"
              stroke={loading || !input.trim() ? '#fff' : '#000'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
