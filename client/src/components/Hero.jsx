import { useState, useEffect, useRef } from 'react'
import BackgroundMesh from './BackgroundMesh'
import ChatEmbed from './ChatEmbed'

const WORDS = ['freelancer', 'tech guy', 'nerd']
const TYPE_SPEED = 72
const DELETE_SPEED = 42
const PAUSE_AFTER_TYPE = 1800
const PAUSE_AFTER_DELETE = 400

export default function Hero() {
  const [displayed, setDisplayed] = useState('')
  const state = useRef({ wordIndex: 0, charIndex: 0, isDeleting: false, pausing: false })
  const timerRef = useRef(null)

  useEffect(() => {
    const tick = () => {
      const s = state.current
      const word = WORDS[s.wordIndex]

      if (s.pausing) {
        s.pausing = false
        if (s.isDeleting) {
          s.wordIndex = (s.wordIndex + 1) % WORDS.length
          s.isDeleting = false
          s.charIndex = 0
        } else {
          s.isDeleting = true
        }
        timerRef.current = setTimeout(tick, s.isDeleting ? TYPE_SPEED : DELETE_SPEED)
        return
      }

      if (!s.isDeleting) {
        s.charIndex = Math.min(s.charIndex + 1, word.length)
        setDisplayed(word.slice(0, s.charIndex))
        if (s.charIndex === word.length) {
          s.pausing = true
          timerRef.current = setTimeout(tick, PAUSE_AFTER_TYPE)
        } else {
          timerRef.current = setTimeout(tick, TYPE_SPEED)
        }
      } else {
        s.charIndex = Math.max(s.charIndex - 1, 0)
        setDisplayed(word.slice(0, s.charIndex))
        if (s.charIndex === 0) {
          s.pausing = true
          timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETE)
        } else {
          timerRef.current = setTimeout(tick, DELETE_SPEED)
        }
      }
    }

    timerRef.current = setTimeout(tick, TYPE_SPEED)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '700px',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Animated background */}
      <BackgroundMesh />

      {/* Nav clearance + content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 72px',
        }}
      >
        {/* Heading — vertically centered, left-aligned */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '72px',   // clear fixed nav
            paddingBottom: '100px',
            maxWidth: '700px',
          }}
        >
          {/* Line 1: "Hello, I'm Rayan Malek." — mixed weight on one line */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 5vw, 72px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              marginBottom: '0.08em',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: '0.25em',
            }}
          >
            <span style={{ fontWeight: 300 }}>Hello, I'm</span>
            <span style={{ fontWeight: 700 }}>Rayan Malek.</span>
          </div>

          {/* Line 2: "I'm a [typewriter]" — mixed weight on one line */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(42px, 5vw, 72px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              marginBottom: '36px',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontWeight: 300 }}>I'm a&nbsp;</span>
            <span style={{ fontWeight: 700 }}>
              {displayed}
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '0.78em',
                  background: '#ffffff',
                  marginLeft: '2px',
                  verticalAlign: 'baseline',
                  position: 'relative',
                  top: '0.07em',
                  animation: 'blink 1.1s step-end infinite',
                }}
              />
            </span>
          </div>

          {/* Subtext */}
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13.5px',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0em',
              maxWidth: '280px',
            }}
          >
            Crafting clean digital experiences for local<br />businesses in Enschede and beyond.
          </p>
        </div>
      </div>

      {/* Chat — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          right: '72px',
          width: '400px',
          zIndex: 2,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <ChatEmbed />
      </div>

      {/* Scroll indicator — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.4,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        />
      </div>
    </section>
  )
}
