import { useState } from 'react'
import Papa from 'papaparse'

const headerMap = {
  date: 'date',
  'unit number': 'unit_number',
  'unit no': 'unit_number',
  'unit #': 'unit_number',
  'vehicle id': 'unit_number',
  vehicle_id: 'unit_number',
  unit_number: 'unit_number',
  'unit type': 'unit_type',
  unit_type: 'unit_type',
  make: 'make',
  'tyre size': 'tyre_size',
  tyre_size: 'tyre_size',
  amount: 'quantity',
  quantity: 'quantity',
  'price/cost': 'price_cost',
  price_cost: 'price_cost',
  price: 'price_cost',
  'unit price': 'price_cost',
  'unit cost': 'price_cost',
  cost_ttd: 'cost_ttd',
  'cost ttd': 'cost_ttd',
  cost: 'cost_ttd',
  supplier: 'supplier',
}

const requiredHeaders = [
  'Date',
  'Unit Number',
  'Unit Type',
  'Make',
  'Tyre Size',
  'Amount',
  'Price/Cost',
]

const normalizeHeader = (header = '') => {
  const normalizedHeader = header.trim().toLowerCase()
  return headerMap[normalizedHeader] || normalizedHeader.replace(/\s+/g, '_')
}

const normalizeDate = (value = '') => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmedValue)) {
    return trimmedValue.slice(0, 10)
  }

  const parsedDate = new Date(trimmedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return trimmedValue
  }

  return parsedDate.toISOString().slice(0, 10)
}

const normalizeValue = (key, value) => {
  const normalizedValue = String(value ?? '').trim()

  if (key === 'date') {
    return normalizeDate(normalizedValue)
  }

  return normalizedValue
}

const normalizeRows = (rows = []) =>
  rows.map((row) =>
    Object.entries(row).reduce((normalizedRow, [header, value]) => {
      const key = normalizeHeader(header)
      normalizedRow[key] = normalizeValue(key, value)

      return normalizedRow
    }, {}),
  )

const getMissingHeaders = (rows = []) => {
  const headers = new Set(Object.keys(rows[0] || {}))

  return requiredHeaders.filter((header) => !headers.has(normalizeHeader(header)))
}

function Upload({ onDataLoaded = () => {} }) {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null

    if (!selectedFile) {
      setFile(null)
      setError('')
      return
    }

    const isCsvFile =
      selectedFile.type === 'text/csv' || selectedFile.name.toLowerCase().endsWith('.csv')

    if (!isCsvFile) {
      setFile(null)
      setError('Please select a valid CSV file.')
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleUpload = () => {
    if (!file) {
      setError('Please choose a CSV file first.')
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const normalizedData = normalizeRows(data)
        const missingHeaders = getMissingHeaders(normalizedData)

        if (missingHeaders.length > 0) {
          setParsedData([])
          setError(`CSV is missing required columns: ${missingHeaders.join(', ')}.`)
          return
        }

        setParsedData(normalizedData)
        console.log('Parsed CSV data:', normalizedData)
        onDataLoaded(normalizedData)
        setError('')
      },
      error: (parseError) => {
        setParsedData([])
        setError(parseError.message || 'Failed to parse CSV file.')
      },
    })
  }

  return (
    <div className="surface-card section-card stack-md">
      <h2>Upload CSV</h2>
      <p className="status-text">
        Select a CSV with Date, Unit Number, Unit Type, Make, Tyre Size, Amount, and Price/Cost columns.
      </p>

      <input className="file-input" type="file" accept=".csv" onChange={handleFileChange} />

      <div>
        <button className="button-primary" type="button" onClick={handleUpload} disabled={!file}>
        Upload
        </button>
      </div>

      {file && <p className="status-text">Selected file: {file.name}</p>}
      {error && <p className="error-text">{error}</p>}
      {!error && parsedData.length > 0 && (
        <p className="status-text">Loaded {parsedData.length} rows.</p>
      )}
    </div>
  )
}

export default Upload
