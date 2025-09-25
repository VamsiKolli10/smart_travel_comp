import { NavLink } from 'react-router-dom'

export default function BottomNav(){
  return (
    <nav className="bottom-nav">
      <div className="container bottom-nav-grid">
        <NavLink to="/dashboard" className="bottom-nav-item">
          <i className="fa-solid fa-gauge"></i><span>Dashboard</span>
        </NavLink>
        <NavLink to="/translation" className="bottom-nav-item">
          <i className="fa-solid fa-language"></i><span>Translate</span>
        </NavLink>
        <NavLink to="/phrasebook" className="bottom-nav-item">
          <i className="fa-solid fa-book"></i><span>Phrasebook</span>
        </NavLink>
        <NavLink to="/destinations" className="bottom-nav-item">
          <i className="fa-solid fa-location-dot"></i><span>Explore</span>
        </NavLink>
      </div>
    </nav>
  )
}