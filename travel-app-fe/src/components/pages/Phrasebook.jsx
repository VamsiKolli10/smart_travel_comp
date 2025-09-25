import Button from '../common/Button'

export default function Phrasebook(){
  const categories = ['Basics', 'Travel', 'Food', 'Emergency', 'Shopping']
  return (
    <section className="phrasebook">
      <div className="phrasebook-controls">
        <div className="category-tabs">
          {categories.map(c => <button key={c} className="category-tab">{c}</button>)}
        </div>
        <Button variant="outline">+ Add Phrase</Button>
      </div>

      <div className="phrases-grid">
        {[1,2,3,4,5,6].map(i => (
          <div className="phrase-card" key={i}>
            <div className="phrase-english">Where is the station?</div>
            <div className="phrase-translation">¿Dónde está la estación?</div>
            <div className="phrase-actions">
              <Button size="sm">Play</Button>
              <Button size="sm" variant="secondary">Copy</Button>
              <Button size="sm" variant="outline">Save</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}