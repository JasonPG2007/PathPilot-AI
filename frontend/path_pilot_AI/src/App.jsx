import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import CreateJourneyPage from './pages/CreateJourneyPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import ProcessingPage from './pages/ProcessingPage.jsx'
import RoadmapPage from './pages/RoadmapPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="create" element={<CreateJourneyPage />} />
        <Route path="processing" element={<ProcessingPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
      </Route>
    </Routes>
  )
}

export default App
