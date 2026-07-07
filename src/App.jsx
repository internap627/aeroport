import { useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import AIInsights from './components/AIInsights'
import './App.css'

function App() {
  const [tyreData, setTyreData] = useState([])

  return (
    <main className="app-shell">
      <section className="app-header">
        <p className="app-eyebrow">Tyre Usage Analytics</p>
        <h1>Upload CSV data and review spend trends.</h1>
        <p className="app-copy">
          Load a tyre usage dataset to see summary metrics, unit spending patterns,
          and AI-generated operational insights.
        </p>
      </section>

      <section className="app-panel">
        <Upload onDataLoaded={setTyreData} />
      </section>

      {tyreData.length > 0 && (
        <div className="app-content">
          <section className="app-panel">
            <Dashboard rawData={tyreData} />
          </section>

          <section className="app-panel">
            <AIInsights rawData={tyreData} />
          </section>
        </div>
      )}
    </main>
  )
}

export default App
