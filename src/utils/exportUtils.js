const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function convertToCSV(data = []) {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }

  const headers = Object.keys(data[0])
  const headerRow = headers.join(',')

  const rows = data.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(','),
  )

  return [headerRow, ...rows].join('\n')
}
