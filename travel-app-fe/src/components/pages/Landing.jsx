import Button from '../common/Button'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-content">
          <h1>Travel Smarter, Safer, and Happier</h1>
          <p>Your all‑in‑one companion for translations, phrasebook, stays, emergency help, and cultural tips.</p>
          <div>
            <Link to="/dashboard"><Button size="lg">Open Dashboard</Button></Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">50K+</span>
              <span className="hero-stat-label">Phrases</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">120+</span>
              <span className="hero-stat-label">Languages</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">190+</span>
              <span className="hero-stat-label">Countries</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container features-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-language"></i></div>
            <h3>Instant Translations</h3>
            <p>Translate on the go with history saved to your phrasebook.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-bed"></i></div>
            <h3>Find Stays</h3>
            <p>Filter accommodations by price, safety, and amenities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fa-solid fa-shield-heart"></i></div>
            <h3>Emergency Ready</h3>
            <p>Local emergency numbers and quick‑access safety tips.</p>
          </div>
        </div>
      </section>
    </div>
  )
}