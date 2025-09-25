import { useState } from "react";
import Button from "../common/Button";
import "./Phrasebook.css";

export default function Phrasebook() {
  const categories = ["Basics", "Travel", "Food", "Emergency", "Shopping"];
  const [activeCategory, setActiveCategory] = useState("Basics");

  // Sample phrases data
  const phrases = [
    {
      id: 1,
      english: "Where is the station?",
      translation: "¿Dónde está la estación?",
      category: "Travel",
    },
    {
      id: 2,
      english: "How much does this cost?",
      translation: "¿Cuánto cuesta esto?",
      category: "Shopping",
    },
    {
      id: 3,
      english: "I need help",
      translation: "Necesito ayuda",
      category: "Emergency",
    },
    {
      id: 4,
      english: "Hello, how are you?",
      translation: "Hola, ¿cómo estás?",
      category: "Basics",
    },
    {
      id: 5,
      english: "I would like to order",
      translation: "Me gustaría pedir",
      category: "Food",
    },
    {
      id: 6,
      english: "Thank you very much",
      translation: "Muchas gracias",
      category: "Basics",
    },
  ];

  const filteredPhrases = phrases.filter(
    (phrase) => phrase.category === activeCategory
  );

  const handlePlay = (phrase) => {
    // Text-to-speech functionality would go here
    console.log("Playing:", phrase.english);
  };

  const handleCopy = (phrase) => {
    navigator.clipboard.writeText(phrase.translation);
    // Could add a toast notification here
    console.log("Copied:", phrase.translation);
  };

  const handleSave = (phrase) => {
    // Save to favorites functionality would go here
    console.log("Saved:", phrase.english);
  };

  return (
    <section className="phrasebook">
      <div className="phrasebook-controls">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <Button variant="outline">+ Add Phrase</Button>
      </div>

      <div className="phrases-grid">
        {filteredPhrases.map((phrase) => (
          <div className="phrase-card" key={phrase.id}>
            <div className="phrase-english">{phrase.english}</div>
            <div className="phrase-translation">{phrase.translation}</div>
            <div className="phrase-actions">
              <Button size="sm" onClick={() => handlePlay(phrase)}>
                Play
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(phrase)}
              >
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSave(phrase)}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
