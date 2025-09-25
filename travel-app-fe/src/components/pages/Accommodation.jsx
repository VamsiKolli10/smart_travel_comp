import Button from "../common/Button";
import "./Accommodation.css";

export default function Accommodation() {
  return (
    <section className="accommodation">
      <div className="accommodation-search">
        <div className="search-form">
          <input className="form-control" placeholder="City or area..." />
          <Button>Search</Button>
        </div>
      </div>

      <div className="accommodation-grid">
        {[1, 2, 3].map((i) => (
          <article key={i} className="accommodation-card">
            <div className="accommodation-image" />
            <div className="accommodation-content">
              <div className="accommodation-header">
                <h3 className="accommodation-name">Cozy Stay #{i}</h3>
                <div className="accommodation-price">$120/night</div>
              </div>
              <div className="accommodation-location">
                <i className="fa-solid fa-location-dot"></i> Boston, MA
              </div>
              <div className="accommodation-rating">
                <div className="rating-stars">★★★★★</div>
                <div className="rating-text">4.{i} (120 reviews)</div>
              </div>
              <div className="accommodation-amenities">
                <span className="amenity-tag">Wi‑Fi</span>
                <span className="amenity-tag">Breakfast</span>
                <span className="amenity-tag">Near Transit</span>
              </div>
              <div className="safety-rating">
                <i className="fa-solid fa-shield-heart"></i> Safe area
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
