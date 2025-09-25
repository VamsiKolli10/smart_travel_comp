import { NavLink, Link } from 'react-router-dom'

export default function Navbar(){
  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">Smart Travel Companion</Link>
        <nav>
          <ul className="navbar-nav">
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/translation">Translation</NavLink></li>
            <li><NavLink to="/phrasebook">Phrasebook</NavLink></li>
            <li><NavLink to="/accommodation">Stays</NavLink></li>
            <li><NavLink to="/emergency">Emergency</NavLink></li>
            <li><NavLink to="/cultural-guide">Culture</NavLink></li>
            <li><NavLink to="/destinations">Destinations</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}