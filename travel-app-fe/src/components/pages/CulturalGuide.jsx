import { useState } from "react";
import Button from "../common/Button";
import "./CulturalGuide.css";

export default function CulturalGuide() {
  const [activeSection, setActiveSection] = useState("greetings");

  const culturalSections = [
    {
      id: "greetings",
      title: "Greetings & Etiquette",
      icon: "👋",
      content: [
        {
          title: "Common Greetings",
          items: [
            { phrase: "Hello", translation: "Hola", pronunciation: "OH-lah" },
            {
              phrase: "Good morning",
              translation: "Buenos días",
              pronunciation: "BWAY-nos DEE-ahs",
            },
            {
              phrase: "Good afternoon",
              translation: "Buenas tardes",
              pronunciation: "BWAY-nas TAR-des",
            },
            {
              phrase: "Good evening",
              translation: "Buenas noches",
              pronunciation: "BWAY-nas NO-ches",
            },
          ],
        },
        {
          title: "Polite Expressions",
          items: [
            {
              phrase: "Please",
              translation: "Por favor",
              pronunciation: "por fa-VOR",
            },
            {
              phrase: "Thank you",
              translation: "Gracias",
              pronunciation: "GRAH-see-ahs",
            },
            {
              phrase: "You're welcome",
              translation: "De nada",
              pronunciation: "deh NAH-dah",
            },
            {
              phrase: "Excuse me",
              translation: "Disculpe",
              pronunciation: "dis-KOOL-peh",
            },
          ],
        },
      ],
    },
    {
      id: "dining",
      title: "Dining & Food",
      icon: "🍽️",
      content: [
        {
          title: "Dining Etiquette",
          items: [
            {
              phrase: "Table for two",
              translation: "Mesa para dos",
              pronunciation: "MEH-sah PAH-rah dos",
            },
            {
              phrase: "The menu, please",
              translation: "La carta, por favor",
              pronunciation: "lah KAR-tah por fa-VOR",
            },
            {
              phrase: "I'm vegetarian",
              translation: "Soy vegetariano/a",
              pronunciation: "soy veh-heh-tah-ree-AH-no/ah",
            },
            {
              phrase: "The check, please",
              translation: "La cuenta, por favor",
              pronunciation: "lah KWEN-tah por fa-VOR",
            },
          ],
        },
        {
          title: "Tipping Culture",
          items: [
            {
              phrase: "Tip included",
              translation: "Propina incluida",
              pronunciation: "pro-PEE-nah in-kloo-EE-dah",
            },
            {
              phrase: "Keep the change",
              translation: "Quede con el cambio",
              pronunciation: "KEH-deh kon el KAHM-bee-oh",
            },
            {
              phrase: "Service charge",
              translation: "Cargo por servicio",
              pronunciation: "KAR-goh por ser-VEE-see-oh",
            },
          ],
        },
      ],
    },
    {
      id: "customs",
      title: "Local Customs",
      icon: "🏛️",
      content: [
        {
          title: "Cultural Norms",
          items: [
            {
              phrase: "Business hours",
              translation: "Horario comercial",
              pronunciation: "oh-RAH-ree-oh ko-mer-see-AHL",
            },
            {
              phrase: "Closed on Sunday",
              translation: "Cerrado los domingos",
              pronunciation: "seh-RAH-doh los doh-MEEN-gos",
            },
            {
              phrase: "Public holiday",
              translation: "Día festivo",
              pronunciation: "DEE-ah fes-TEE-voh",
            },
          ],
        },
        {
          title: "Social Customs",
          items: [
            {
              phrase: "Personal space",
              translation: "Espacio personal",
              pronunciation: "es-PAH-see-oh per-soh-NAHL",
            },
            {
              phrase: "Eye contact",
              translation: "Contacto visual",
              pronunciation: "kon-TAHK-toh vee-SWAHL",
            },
            {
              phrase: "Handshake",
              translation: "Apretón de manos",
              pronunciation: "ah-preh-TOHN deh MAH-nos",
            },
          ],
        },
      ],
    },
    {
      id: "emergency",
      title: "Emergency Situations",
      icon: "🚨",
      content: [
        {
          title: "Emergency Phrases",
          items: [
            {
              phrase: "Help!",
              translation: "¡Ayuda!",
              pronunciation: "ah-YOO-dah",
            },
            {
              phrase: "Call the police",
              translation: "Llame a la policía",
              pronunciation: "YAH-meh ah lah po-lee-SEE-ah",
            },
            {
              phrase: "I need a doctor",
              translation: "Necesito un médico",
              pronunciation: "neh-seh-SEE-toh oon MEH-dee-koh",
            },
            {
              phrase: "Where is the hospital?",
              translation: "¿Dónde está el hospital?",
              pronunciation: "DOHN-deh es-TAH el os-pee-TAHL",
            },
          ],
        },
      ],
    },
  ];

  const currentSection = culturalSections.find(
    (section) => section.id === activeSection
  );

  return (
    <section className="cultural-guide">
      {/* <div className="cultural-guide-header">
        <h1>Cultural Guide</h1>
        <p>
          Learn greetings, etiquette, tipping, and local customs to avoid faux
          pas.
        </p>
      </div>

      <div className="cultural-sections">
        {culturalSections.map((section) => (
          <button
            key={section.id}
            className={`cultural-section-tab ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="section-icon">{section.icon}</span>
            <span className="section-title">{section.title}</span>
          </button>
        ))}
      </div>

      <div className="cultural-content">
        {currentSection && (
          <div className="content-section">
            <h2 className="content-title">
              <span className="title-icon">{currentSection.icon}</span>
              {currentSection.title}
            </h2>

            {currentSection.content.map((category, index) => (
              <div key={index} className="cultural-category">
                <h3 className="category-title">{category.title}</h3>
                <div className="cultural-phrases">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="cultural-phrase">
                      <div className="phrase-content">
                        <div className="phrase-english">{item.phrase}</div>
                        <div className="phrase-translation">
                          {item.translation}
                        </div>
                        <div className="phrase-pronunciation">
                          {item.pronunciation}
                        </div>
                      </div>
                      <div className="phrase-actions">
                        <Button size="sm" variant="outline">
                          Play
                        </Button>
                        <Button size="sm" variant="outline">
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </section>
  );
}
