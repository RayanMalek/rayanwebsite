import { useState } from 'react'

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rayan-malek-987183303/',
  },
  {
    label: 'Email',
    href: 'mailto:r.malek@student.utwente.nl',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/31681828328',
  },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 48px',
          fontFamily: 'var(--font-display)',
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            color: open ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: 0,
            transition: 'color 0.2s ease',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = open ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)'}
        >
          <span style={{ fontSize: '15px', lineHeight: 1, letterSpacing: 0 }}>
            {open ? '✕' : '≡'}
          </span>
          {open ? 'Close' : 'Menu'}
        </button>

        <span
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          R.M.
        </span>
      </nav>

      {/* Dropdown panel */}
      <div
        style={{
          position: 'fixed',
          top: '72px',
          left: '48px',
          zIndex: 99,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '8px 0',
          minWidth: '180px',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {SOCIALS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '10px 20px',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
