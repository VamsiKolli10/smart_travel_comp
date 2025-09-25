import { useState } from "react";
import Button from "../common/Button";
import "./Emergency.css";

export default function Emergency() {
  const [selectedContact, setSelectedContact] = useState(null);

  const emergencyContacts = [
    {
      id: "police",
      name: "Police",
      number: "911",
      icon: "🚔",
      description: "For crimes, accidents, and immediate threats",
      color: "#1976d2",
    },
    {
      id: "fire",
      name: "Fire Department",
      number: "911",
      icon: "🚒",
      description: "For fires, medical emergencies, and rescue",
      color: "#d32f2f",
    },
    {
      id: "ambulance",
      name: "Ambulance",
      number: "911",
      icon: "🚑",
      description: "For medical emergencies and injuries",
      color: "#388e3c",
    },
    {
      id: "poison",
      name: "Poison Control",
      number: "1-800-222-1222",
      icon: "☠️",
      description: "For poisonings and toxic exposures",
      color: "#f57c00",
    },
    {
      id: "suicide",
      name: "Suicide Prevention",
      number: "988",
      icon: "🆘",
      description: "Crisis support and suicide prevention",
      color: "#7b1fa2",
    },
    {
      id: "embassy",
      name: "US Embassy",
      number: "+1-202-501-4444",
      icon: "🏛️",
      description: "For US citizens abroad",
      color: "#455a64",
    },
  ];

  const emergencyTips = [
    {
      title: "Stay Calm",
      description: "Take deep breaths and assess the situation before acting.",
      icon: "🧘",
    },
    {
      title: "Know Your Location",
      description: "Be able to provide your exact address or nearby landmarks.",
      icon: "📍",
    },
    {
      title: "Share Location",
      description: "Share your live location with trusted contacts.",
      icon: "📱",
    },
    {
      title: "Keep Documents",
      description:
        "Have your ID, insurance, and emergency contacts accessible.",
      icon: "📄",
    },
  ];

  const handleCall = (contact) => {
    setSelectedContact(contact.id);
    // In a real app, this would initiate a phone call
    console.log(`Calling ${contact.name}: ${contact.number}`);
    setTimeout(() => setSelectedContact(null), 2000);
  };

  return (
    <section className="emergency">
      <div className="emergency-header">
        <h1>Emergency Contacts</h1>
        <p>Quick access to emergency services and important contacts.</p>
      </div>

      <div className="emergency-alert">
        <div className="alert-icon">⚠️</div>
        <div className="alert-content">
          <strong>Emergency Tips:</strong> Know your local numbers and share
          your live location with a trusted contact.
        </div>
      </div>

      <div className="emergency-tips">
        <h3>Emergency Preparedness</h3>
        <div className="tips-grid">
          {emergencyTips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <div className="tip-content">
                <h4 className="tip-title">{tip.title}</h4>
                <p className="tip-description">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="emergency-contacts">
        <h3>Emergency Services</h3>
        <div className="contacts-grid">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className={`emergency-contact ${
                selectedContact === contact.id ? "calling" : ""
              }`}
              style={{ "--contact-color": contact.color }}
            >
              <div className="contact-header">
                <div className="contact-icon">{contact.icon}</div>
                <div className="contact-info">
                  <h4 className="contact-name">{contact.name}</h4>
                  <p className="contact-description">{contact.description}</p>
                </div>
              </div>

              <div className="contact-number">{contact.number}</div>

              <div className="contact-actions">
                <Button
                  size="sm"
                  onClick={() => handleCall(contact)}
                  disabled={selectedContact === contact.id}
                >
                  {selectedContact === contact.id ? "Calling..." : "Call Now"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(contact.number)}
                >
                  Copy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="emergency-footer">
        <div className="footer-note">
          <strong>Remember:</strong> In a life-threatening emergency, call 911
          immediately. For non-emergency situations, use the appropriate service
          number.
        </div>
      </div>
    </section>
  );
}
