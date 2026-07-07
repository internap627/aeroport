import { useState } from 'react'
import { getTyreDataSummary } from '../utils/dataProcessor'

const insightSections = [
  {
    key: 'trends',
    title: 'Trends',
    pattern:
      /^(?:\d+[).\s-]*)?(?:key\s+)?trends?(?:\s+in\s+tyre\s+spending)?[:-]?\s*(.*)$/i,
  },
  {
    key: 'anomalies',
    title: 'Anomalies',
    pattern:
      /^(?:\d+[).\s-]*)?(?:identified\s+)?anomal(?:y|ies)(?:\s+in.+)?[:-]?\s*(.*)$/i,
  },
  {
    key: 'forecast',
    title: 'Forecast',
    pattern:
      /^(?:\d+[).\s-]*)?(?:future\s+tyre\s+demand\s+)?forecast(?:\s+of.+)?[:-]?\s*(.*)$/i,
  },
  {
    key: 'recommendations',
    title: 'Recommendations',
    pattern:
      /^(?:\d+[).\s-]*)?(?:cost\s+reduction\s+)?recommendations?(?:\s+to.+)?[:-]?\s*(.*)$/i,
  },
]

const emptySections = () => ({
  trends: [],
  anomalies: [],
  forecast: [],
  recommendations: [],
})

const normalizeLine = (line) =>
  line
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*•]\s*/, '')
    .replace(/^\d+[).\s-]*/, '')
    .replace(/\*\*/g, '')
    .trim()

const detectSection = (line) =>
  insightSections.find(({ pattern }) => pattern.test(normalizeLine(line)))

const fallbackSectionKey = (text, index) => {
  const normalizedText = text.toLowerCase()

  if (/(anomal|spike|outlier|unusual|high usage|abnormal)/i.test(normalizedText)) {
    return 'anomalies'
  }

  if (/(forecast|future|demand|next month|upcoming|projected|likely)/i.test(normalizedText)) {
    return 'forecast'
  }

  if (/(recommend|reduce cost|cost control|optimi[sz]e|plan|procure|action)/i.test(normalizedText)) {
    return 'recommendations'
  }

  if (/(trend|increase|decrease|monthly|spend)/i.test(normalizedText)) {
    return 'trends'
  }

  return insightSections[index]?.key || 'recommendations'
}

const formatInsights = (text) => {
  const sections = emptySections()

  if (!text.trim()) {
    return sections
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let currentSection = null

  for (const line of lines) {
    const normalizedLine = normalizeLine(line)
    const matchedSection = detectSection(line)

    if (matchedSection) {
      currentSection = matchedSection.key
      const match = normalizedLine.match(matchedSection.pattern)
      const remainder = match?.[1]?.trim()

      if (remainder) {
        sections[currentSection].push(remainder)
      }

      continue
    }

    if (currentSection) {
      sections[currentSection].push(normalizedLine)
    }
  }

  const hasStructuredContent = Object.values(sections).some((items) => items.length > 0)

  if (hasStructuredContent) {
    return sections
  }

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  paragraphs.forEach((paragraph, index) => {
    const key = fallbackSectionKey(paragraph, index)
    sections[key].push(paragraph)
  })

  return sections
}

function AIInsights({ rawData = [] }) {
  const [insights, setInsights] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const structuredInsights = formatInsights(insights)

  const handleGenerateInsights = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
      setError('Missing VITE_OPENAI_API_KEY environment variable.')
      return
    }

    if (rawData.length === 0) {
      setError('No data available to analyze.')
      return
    }

    const summary = getTyreDataSummary(rawData)

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a business and data analyst reviewing tyre usage and spend data for an operations team. Provide practical, decision-ready analysis. Focus on business impact, operational patterns, and cost control. Format the response as short paragraphs or bullet points with clear headings when useful.',
            },
            {
              role: 'user',
              content: `Use the processed tyre dataset summary below to produce an executive-style analysis.

Please cover:
1. Key trends in tyre spending
2. Any anomalies, including unusual spikes in cost or unusually high unit usage
3. A short forecast of future tyre demand based on the trend data
4. Recommendations to reduce cost and improve planning

Keep the response readable and concise, using paragraphs or bullet points.

Processed summary data:
${summary}`,
            },
          ],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to generate AI insights.')
      }

      setInsights(result.choices?.[0]?.message?.content || 'No insights returned.')
    } catch (requestError) {
      setError(requestError.message || 'Failed to generate AI insights.')
      setInsights('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="surface-card section-card stack-md">
      <div className="panel-header">
        <h2>AI Insights</h2>
        <button
          className="button-primary"
          type="button"
          onClick={handleGenerateInsights}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate AI Insights'}
        </button>
      </div>

      <p className="status-text">
        Generate a concise operational summary from the uploaded tyre usage data.
      </p>

      {error && <p className="error-text">{error}</p>}

      <div className="insights-sections">
        {insightSections.map(({ key, title }) => {
          const items = structuredInsights[key]

          return (
            <section key={key} className="insight-section">
              <h3 className="insight-heading">{title}</h3>
              {items.length > 0 ? (
                items.length === 1 ? (
                  <p className="insight-text">{items[0]}</p>
                ) : (
                  <ul className="insight-list">
                    {items.map((item, index) => (
                      <li key={`${key}-${index}`}>{item}</li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="insight-placeholder">
                  {insights
                    ? `No ${title.toLowerCase()} were identified in the response.`
                    : 'AI-generated insights will appear here.'}
                </p>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}

export default AIInsights
