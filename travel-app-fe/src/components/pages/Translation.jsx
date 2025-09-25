import { useState } from 'react'
import Button from '../common/Button'

export default function Translation(){
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')

  return   <section className="translation">
      <div className="translation-header">
        <h1>Translator</h1>
      </div>

      <div className="language-selector">
        <select className="form-control language-select" defaultValue="en">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="hi">Hindi</option>
          <option value="zh">Chinese</option>
        </select>

        <button className="language-swap" title="Swap languages">
          <i className="fa-solid fa-right-left"></i>
        </button>

        <select className="form-control language-select" defaultValue="es">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="hi">Hindi</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <div className="translation-interface">
        <div className="translation-panel">
          <h3>Source</h3>
          <textarea className="translation-textarea" placeholder="Type text..." value={source} onChange={e=>setSource(e.target.value)} />
        </div>
        <div className="translation-panel">
          <h3>Result</h3>
          <textarea readOnly className="translation-textarea" placeholder="Translated text..." value={target} />
        </div>
      </div>

      <div className="translation-actions">
        <Button onClick={()=>setTarget(source.split('').reverse().join(''))}>Translate (demo)</Button>
        <Button variant="secondary">Copy</Button>
        <Button variant="outline">Save to Phrasebook</Button>
      </div>
    </section>
  
}