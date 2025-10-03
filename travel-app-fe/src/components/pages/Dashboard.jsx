import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentActivity] = useState([
    { action: "Translated", text: "Where is the bathroom?", time: "2 min ago" },
    { action: "Saved phrase", text: "Thank you very much", time: "1 hour ago" },
    { action: "Viewed", text: "Museum of Fine Arts", time: "3 hours ago" },
  ]);

  const dashboardCards = [
    {
      title: "Translate",
      description: "Quick two‑pane translator with history.",
      icon: "🌐",
      path: "/translation",
      color: "#21808d",
    },
    {
      title: "Phrasebook",
      description: "Curate and organize common phrases by category.",
      icon: "📚",
      path: "/phrasebook",
      color: "#4a9ba8",
    },
    {
      title: "Destinations",
      description: "Explore popular places, trails, and museums.",
      icon: "📍",
      path: "/destinations",
      color: "#7b1fa2",
    },
    {
      title: "Cultural Guide",
      description: "Learn greetings, etiquette, and local customs.",
      icon: "🏛️",
      path: "/cultural-guide",
      color: "#f57c00",
    },
    {
      title: "Stays",
      description: "Browse accommodations with ratings and amenities.",
      icon: "🏨",
      path: "/accommodation",
      color: "#388e3c",
    },
    {
      title: "Emergency",
      description: "Find local emergency contacts and tips.",
      icon: "🚨",
      path: "/emergency",
      color: "#d32f2f",
    },
  ];

  const quickActions = [
    {
      label: "Quick Translate",
      icon: "⚡",
      action: () => navigate("/translation"),
    },
    { label: "Emergency", icon: "🆘", action: () => navigate("/emergency") },
    {
      label: "Find Places",
      icon: "🔍",
      action: () => navigate("/destinations"),
    },
  ];

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back</h1>
          <p>Boston, MA • Safe travels!</p>
        </div>

        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={action.action}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
            style={{ "--card-color": card.color }}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
            <div className="card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {/* {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.action === "Translated"
                    ? "🌐"
                    : activity.action === "Saved phrase"
                    ? "💾"
                    : "👁️"}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-detail">"{activity.text}"</span>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))} */}
          </div>
        </div>

        <div className="dashboard-tips">
          <h3>Travel Tips</h3>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <span className="tip-text">
                Save important phrases for offline access
              </span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📍</span>
              <span className="tip-text">
                Share your location with trusted contacts
              </span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📱</span>
              <span className="tip-text">
                Keep emergency contacts easily accessible
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
