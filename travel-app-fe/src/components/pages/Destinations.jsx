import { useState } from "react";
import Button from "../common/Button";
import "./Destinations.css";

export default function Destinations() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "all",
    "museums",
    "parks",
    "restaurants",
    "shopping",
    "landmarks",
  ];

  const destinations = [
    {
      id: 1,
      name: "Museum of Fine Arts",
      category: "museums",
      type: "Museum",
      rating: 4.8,
      distance: "2.3 km",
      image: "🎨",
      description:
        "World-class art collection spanning 5,000 years of human creativity.",
      hours: "10:00 AM - 5:00 PM",
      price: "$25",
      features: ["Audio Guide", "Cafe", "Gift Shop", "Wheelchair Accessible"],
    },
    {
      id: 2,
      name: "Boston Common",
      category: "parks",
      type: "Public Park",
      rating: 4.6,
      distance: "1.8 km",
      image: "🌳",
      description:
        "America's oldest public park, perfect for walking and relaxation.",
      hours: "6:00 AM - 11:30 PM",
      price: "Free",
      features: [
        "Walking Trails",
        "Playground",
        "Historic Site",
        "Dog Friendly",
      ],
    },
    {
      id: 3,
      name: "Faneuil Hall Marketplace",
      category: "shopping",
      type: "Shopping Center",
      rating: 4.4,
      distance: "3.1 km",
      image: "🛍️",
      description:
        "Historic marketplace with shops, restaurants, and street performers.",
      hours: "10:00 AM - 9:00 PM",
      price: "Free",
      features: ["Food Court", "Street Performers", "Historic", "Gift Shops"],
    },
    {
      id: 4,
      name: "Fenway Park",
      category: "landmarks",
      type: "Sports Venue",
      rating: 4.7,
      distance: "4.2 km",
      image: "⚾",
      description: "Historic baseball stadium, home of the Boston Red Sox.",
      hours: "Varies by game",
      price: "$15+",
      features: ["Tours Available", "Gift Shop", "Historic", "Sports"],
    },
    {
      id: 5,
      name: "Isabella Stewart Gardner Museum",
      category: "museums",
      type: "Art Museum",
      rating: 4.5,
      distance: "3.8 km",
      image: "🏛️",
      description:
        "Unique museum in a Venetian-style palace with beautiful gardens.",
      hours: "11:00 AM - 5:00 PM",
      price: "$20",
      features: ["Gardens", "Historic Building", "Art Collection", "Cafe"],
    },
    {
      id: 6,
      name: "North End",
      category: "restaurants",
      type: "Historic District",
      rating: 4.6,
      distance: "2.7 km",
      image: "🍝",
      description:
        "Boston's Little Italy with authentic Italian restaurants and bakeries.",
      hours: "Varies by restaurant",
      price: "$$",
      features: ["Italian Food", "Historic", "Walking Tours", "Bakeries"],
    },
  ];

  const filteredDestinations = destinations.filter((destination) => {
    const matchesCategory =
      activeCategory === "all" || destination.category === activeCategory;
    const matchesSearch =
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      museums: "🏛️",
      parks: "🌳",
      restaurants: "🍽️",
      shopping: "🛍️",
      landmarks: "🏛️",
      all: "📍",
    };
    return icons[category] || "📍";
  };

  const getCategoryName = (category) => {
    const names = {
      museums: "Museums",
      parks: "Parks",
      restaurants: "Restaurants",
      shopping: "Shopping",
      landmarks: "Landmarks",
      all: "All Places",
    };
    return names[category] || "All Places";
  };

  return (
    <section className="destinations">
      {/* <div className="destinations-header">
        <h1>Destinations</h1>
        <p>Explore popular places, trails, and museums in Boston.</p>
      </div>

      <div className="destinations-controls">
        <div className="search-section">
          <div className="search-form">
            <input
              className="search-input"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline">Search</Button>
          </div>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-filter ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="filter-icon">{getCategoryIcon(category)}</span>
              <span className="filter-name">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="destinations-grid">
        {filteredDestinations.map((destination) => (
          <div key={destination.id} className="destination-card">
            <div className="destination-image">
              <span className="destination-emoji">{destination.image}</span>
            </div>

            <div className="destination-content">
              <div className="destination-header">
                <h3 className="destination-name">{destination.name}</h3>
                <div className="destination-rating">
                  <span className="rating-stars">★</span>
                  <span className="rating-value">{destination.rating}</span>
                </div>
              </div>

              <div className="destination-meta">
                <span className="destination-type">{destination.type}</span>
                <span className="destination-distance">
                  {destination.distance}
                </span>
              </div>

              <p className="destination-description">
                {destination.description}
              </p>

              <div className="destination-details">
                <div className="detail-item">
                  <span className="detail-label">Hours:</span>
                  <span className="detail-value">{destination.hours}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">{destination.price}</span>
                </div>
              </div>

              <div className="destination-features">
                {destination.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
                {destination.features.length > 3 && (
                  <span className="feature-tag more">
                    +{destination.features.length - 3} more
                  </span>
                )}
              </div>

              <div className="destination-actions">
                <Button size="sm" variant="outline">
                  Directions
                </Button>
                <Button size="sm">Save</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No destinations found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )} */}
    </section>
  );
}
