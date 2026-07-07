import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Charts from './Charts'
import {
  getMonthlySpend,
  getSpendByVehicle,
  getSpendByTyre,
  getSpendByUnitType,
  getTyreDataSummary,
  getTopVehicle,
  getTotalSpend,
  hasSpendData,
} from '../utils/dataProcessor'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2,
  }).format(value)

const formatQuantity = (value) =>
  new Intl.NumberFormat('en-TT', {
    maximumFractionDigits: 2,
  }).format(value)

const formatDateLabel = (date) => {
  if (!date) {
    return ''
  }

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('en-TT', {
    dateStyle: 'medium',
  }).format(parsedDate)
}

const getReportPeriod = (data, startDate, endDate) => {
  const dataDates = data
    .map((row) => row.date)
    .filter(Boolean)
    .sort((dateA, dateB) => dateA.localeCompare(dateB))

  const periodStart = startDate || dataDates[0]
  const periodEnd = endDate || dataDates[dataDates.length - 1]

  if (periodStart && periodEnd) {
    return `${formatDateLabel(periodStart)} to ${formatDateLabel(periodEnd)}`
  }

  if (periodStart) {
    return `From ${formatDateLabel(periodStart)}`
  }

  if (periodEnd) {
    return `Through ${formatDateLabel(periodEnd)}`
  }

  return 'No dated records'
}

function Dashboard({ rawData = [] }) {
  const chartRef = useRef(null)
  const [isExporting, setIsExporting] = useState(false)
  const [unitFilter, setUnitFilter] = useState('')
  const [unitTypeFilter, setUnitTypeFilter] = useState('')
  const [makeFilter, setMakeFilter] = useState('')
  const [tyreSizeFilter, setTyreSizeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const unitOptions = [...new Set(rawData.map((row) => row.unit_number).filter(Boolean))].sort()
  const unitTypeOptions = [...new Set(rawData.map((row) => row.unit_type).filter(Boolean))].sort()
  const makeOptions = [...new Set(rawData.map((row) => row.make).filter(Boolean))].sort()
  const tyreSizeOptions = [...new Set(rawData.map((row) => row.tyre_size).filter(Boolean))].sort()

  const filteredData = rawData.filter((row) => {
    if (unitFilter && row.unit_number !== unitFilter) {
      return false
    }

    if (unitTypeFilter && row.unit_type !== unitTypeFilter) {
      return false
    }

    if (makeFilter && row.make !== makeFilter) {
      return false
    }

    if (tyreSizeFilter && row.tyre_size !== tyreSizeFilter) {
      return false
    }

    if (startDate && row.date && row.date < startDate) {
      return false
    }

    if (endDate && row.date && row.date > endDate) {
      return false
    }

    return true
  })

  const totalSpend = getTotalSpend(filteredData)
  const monthlySpend = getMonthlySpend(filteredData)
  const spendByVehicle = getSpendByVehicle(filteredData)
  const spendByUnitRows = spendByVehicle
  const spendByUnitType = getSpendByUnitType(filteredData)
  const spendByTyre = getSpendByTyre(filteredData)
  const topVehicle = getTopVehicle(filteredData)
  const summaryText = getTyreDataSummary(filteredData)
  const spendDataAvailable = hasSpendData(filteredData)
  const reportPeriod = getReportPeriod(filteredData, startDate, endDate)

  const handleExportPdf = async () => {
    if (filteredData.length === 0 || isExporting) {
      return
    }

    setIsExporting(true)

    const pdf = new jsPDF()
    const reportDate = new Intl.DateTimeFormat('en-TT', {
      dateStyle: 'long',
    }).format(new Date())
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const marginX = 20
    const bottomMargin = 20
    const imageWidth = pageWidth - marginX * 2

    let currentY = 20

    const addSectionHeading = (heading) => {
      if (currentY > pageHeight - 35) {
        pdf.addPage()
        currentY = 20
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.text(heading, marginX, currentY)
      currentY += 10
    }

    const addSpendByUnitTable = () => {
      if (spendByUnitRows.length === 0) {
        return
      }

      addSectionHeading('Spend By Unit Detail')

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Ordered to match the Spend By Unit chart.', marginX, currentY)
      currentY += 7

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Unit Number', marginX, currentY)
      pdf.text('Tyres Ordered', 95, currentY)
      pdf.text('Spend', 145, currentY)
      currentY += 7

      pdf.setFont('helvetica', 'normal')

      spendByUnitRows.forEach((unit) => {
        if (currentY > pageHeight - bottomMargin) {
          pdf.addPage()
          currentY = 20
          pdf.setFont('helvetica', 'bold')
          pdf.text('Unit Number', marginX, currentY)
          pdf.text('Tyres Ordered', 95, currentY)
          pdf.text('Spend', 145, currentY)
          currentY += 7
          pdf.setFont('helvetica', 'normal')
        }

        pdf.text(String(unit.unit_number), marginX, currentY)
        pdf.text(formatQuantity(unit.records), 95, currentY)
        pdf.text(formatCurrency(unit.spend), 145, currentY)
        currentY += 6
      })

      currentY += 6
    }

    try {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('Tyre Analytics Report', marginX, currentY)

      currentY += 10
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Generated: ${reportDate}`, marginX, currentY)

      currentY += 8
      pdf.text(`Report Period: ${reportPeriod}`, marginX, currentY)

      currentY += 12
      addSectionHeading('Summary')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Total Spend: ${formatCurrency(totalSpend)}`, marginX, currentY)

      currentY += 8
      pdf.text(`Top Unit: ${topVehicle?.unit_number || 'No data'}`, marginX, currentY)

      currentY += 8
      pdf.text(`Filtered Records: ${filteredData.length}`, marginX, currentY)

      if (!spendDataAvailable) {
        currentY += 8
        pdf.text('Spend note: Price/Cost values are missing or zero in the selected data.', marginX, currentY)
      }

      currentY += 12
      addSectionHeading('Dataset Notes')

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      const summaryLines = pdf.splitTextToSize(summaryText, 170)
      pdf.text(summaryLines, marginX, currentY)
      currentY += summaryLines.length * 5 + 8

      addSpendByUnitTable()

      const chartCards = Array.from(chartRef.current?.querySelectorAll('.chart-card') || [])

      if (chartCards.length > 0) {
        addSectionHeading('Charts')

        for (const chartCard of chartCards) {
          const canvas = await html2canvas(chartCard, {
            backgroundColor: '#ffffff',
            scale: 2,
          })
          const imageData = canvas.toDataURL('image/png')
          const imageHeight = (canvas.height * imageWidth) / canvas.width

          if (currentY + imageHeight > pageHeight - bottomMargin) {
            pdf.addPage()
            currentY = 20
          }

          pdf.addImage(imageData, 'PNG', marginX, currentY, imageWidth, imageHeight)
          currentY += imageHeight + 10
        }
      }

      pdf.save('tyre_report.pdf')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="stack-lg">
      <div className="surface-card section-card stack-md">
        <div className="panel-header">
          <div className="stack-sm">
            <h2>Filters</h2>
            <p className="status-text">Refine the dashboard by unit, type, make, tyre size, or date range.</p>
          </div>
          <button
            className="button-primary"
            type="button"
            onClick={handleExportPdf}
            disabled={filteredData.length === 0 || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export PDF Report'}
          </button>
        </div>

        <div className="filter-grid">
          <label className="filter-field">
            <span className="filter-label">Unit Number</span>
            <select
              className="field-input"
              value={unitFilter}
              onChange={(event) => setUnitFilter(event.target.value)}
            >
              <option value="">All units</option>
              {unitOptions.map((unitNumber) => (
                <option key={unitNumber} value={unitNumber}>
                  {unitNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">Unit Type</span>
            <select
              className="field-input"
              value={unitTypeFilter}
              onChange={(event) => setUnitTypeFilter(event.target.value)}
            >
              <option value="">All unit types</option>
              {unitTypeOptions.map((unitType) => (
                <option key={unitType} value={unitType}>
                  {unitType}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">Make</span>
            <select
              className="field-input"
              value={makeFilter}
              onChange={(event) => setMakeFilter(event.target.value)}
            >
              <option value="">All makes</option>
              {makeOptions.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">Tyre Size</span>
            <select
              className="field-input"
              value={tyreSizeFilter}
              onChange={(event) => setTyreSizeFilter(event.target.value)}
            >
              <option value="">All tyre sizes</option>
              {tyreSizeOptions.map((tyreSize) => (
                <option key={tyreSize} value={tyreSize}>
                  {tyreSize}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">Start Date</span>
            <input
              className="field-input"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">End Date</span>
            <input
              className="field-input"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <p className="metric-label">Total Spend</p>
          <p className="metric-value">{formatCurrency(totalSpend)}</p>
        </article>

        <article className="metric-card">
          <p className="metric-label">Top Unit</p>
          <p className="metric-value">{topVehicle?.unit_number || 'No data'}</p>
          <p className="metric-subtext">
            {topVehicle && spendDataAvailable
              ? formatCurrency(topVehicle.spend)
              : topVehicle
                ? `${topVehicle.records} tyres ordered`
                : 'No data available'}
          </p>
        </article>
      </div>

      {!spendDataAvailable && (
        <div className="surface-card section-card">
          <p className="status-text">
            The selected rows do not have positive Price/Cost values, so the charts are showing
            tyre quantities from the Amount column.
          </p>
        </div>
      )}

      {filteredData.length > 0 ? (
        <div ref={chartRef}>
          <Charts
            monthlySpend={monthlySpend}
            spendByVehicle={spendByUnitRows}
            spendByUnitType={spendByUnitType}
            spendByTyre={spendByTyre}
            showSpend={spendDataAvailable}
          />
        </div>
      ) : (
        <div className="surface-card section-card">
          <p className="status-text">No records match the selected filters.</p>
        </div>
      )}
    </section>
  )
}

export default Dashboard
