import Nav from './components/Nav'
import Hero from './components/Hero'

export default function App() {
  return (
    <div style={{ background: '#000', height: '100vh', overflow: 'hidden' }}>
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: '-50%',
          width: '200%',
          height: '200%',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.032,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'grain 8s steps(10) infinite',
        }}
      />
      <Nav />
      <Hero />
    </div>
  )
}
