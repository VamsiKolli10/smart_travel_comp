export default function Emergency(){
  return (
    <section className="emergency">
      <div className="emergency-alert">
        <i className="fa-solid fa-triangle-exclamation emergency-alert-icon"></i>
        <div>
          <strong>Emergency tips:</strong> Know your local numbers and share your live location with a trusted contact.
        </div>
      </div>

      <div className="emergency-contacts">
        <div className="emergency-contact">
          <i className="fa-solid fa-phone emergency-contact-icon"></i>
          <h3>Police</h3>
          <span className="emergency-contact-number">911</span>
        </div>
        <div className="emergency-contact">
          <i className="fa-solid fa-fire emergency-contact-icon"></i>
          <h3>Fire</h3>
          <span className="emergency-contact-number">911</span>
        </div>
        <div className="emergency-contact">
          <i className="fa-solid fa-truck-medical emergency-contact-icon"></i>
          <h3>Ambulance</h3>
          <span className="emergency-contact-number">911</span>
        </div>
      </div>
    </section>
  )
}