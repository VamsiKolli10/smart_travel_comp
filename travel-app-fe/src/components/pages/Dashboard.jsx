export default function Dashboard(){
  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back</h1>
        <p className="dashboard-location">Boston, MA • Safe travels!</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon"><i className="fa-solid fa-language"></i></div>
          <h3>Translate</h3>
          <p>Quick two‑pane translator with history.</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon"><i className="fa-solid fa-book"></i></div>
          <h3>Phrasebook</h3>
          <p>Curate and organize common phrases by category.</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon"><i className="fa-solid fa-bed"></i></div>
          <h3>Stays</h3>
          <p>Browse accommodations with ratings and amenities.</p>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <h3>Emergency</h3>
          <p>Find local emergency contacts and tips.</p>
        </div>
      </div>
    </section>
  )
}