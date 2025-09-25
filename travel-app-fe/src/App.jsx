import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'

import Landing from './components/pages/Landing'
import Dashboard from './components/pages/Dashboard'
import Translation from './components/pages/Translation'
import Phrasebook from './components/pages/Phrasebook'
import Accommodation from './components/pages/Accommodation'
import Emergency from './components/pages/Emergency'
import CulturalGuide from './components/pages/CulturalGuide'
import Destinations from './components/pages/Destinations'

export default function App(){
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="translation" element={<Translation />} />
          <Route path="phrasebook" element={<Phrasebook />} />
          <Route path="accommodation" element={<Accommodation />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="cultural-guide" element={<CulturalGuide />} />
          <Route path="destinations" element={<Destinations />} />
        </Route>
      </Routes>
    </div>
  )
}