const toNumber = (value) => {
  const parsedValue = Number.parseFloat(String(value ?? '').replace(/[$,]/g, ''))
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

const roundCurrency = (value) => Number(value.toFixed(2))

const getValidRows = (data = []) =>
  data.filter((row) => row && typeof row === 'object')

const getRowQuantity = (row) => {
  if (row.quantity === undefined || row.quantity === null || row.quantity === '') {
    return 1
  }

  return toNumber(row.quantity)
}

const getRowSpend = (row) => {
  if (row.price_cost !== undefined && row.price_cost !== null && row.price_cost !== '') {
    return getRowQuantity(row) * toNumber(row.price_cost)
  }

  return toNumber(row.cost_ttd)
}

const getUnitNumber = (row) => row.unit_number || row.vehicle_id || 'Unknown'

const getGroupSpend = (data, keyGetter, keyName) => {
  const totals = getValidRows(data).reduce((groupTotals, row) => {
    const key = keyGetter(row) || 'Unknown'
    const currentGroup = groupTotals[key] || { spend: 0, records: 0 }

    groupTotals[key] = {
      spend: currentGroup.spend + getRowSpend(row),
      records: currentGroup.records + getRowQuantity(row),
    }

    return groupTotals
  }, {})

  return Object.entries(totals)
    .map(([key, totals]) => ({
      [keyName]: key,
      spend: roundCurrency(totals.spend),
      records: totals.records,
    }))
    .sort((groupA, groupB) => groupB.spend - groupA.spend || groupB.records - groupA.records)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    minimumFractionDigits: 2,
  }).format(value)

export function getTotalSpend(data) {
  const total = getValidRows(data).reduce(
    (sum, row) => sum + getRowSpend(row),
    0,
  )

  return roundCurrency(total)
}

export function hasSpendData(data) {
  return getValidRows(data).some((row) => getRowSpend(row) > 0)
}

export function getMonthlySpend(data) {
  const monthlyTotals = getValidRows(data).reduce((totals, row) => {
    if (!row.date) {
      return totals
    }

    const month = row.date.slice(0, 7)
    const currentMonth = totals[month] || { spend: 0, records: 0 }
    totals[month] = {
      spend: currentMonth.spend + getRowSpend(row),
      records: currentMonth.records + getRowQuantity(row),
    }

    return totals
  }, {})

  return Object.entries(monthlyTotals)
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, totals]) => ({
      month,
      spend: roundCurrency(totals.spend),
      records: totals.records,
    }))
}

export function getSpendByVehicle(data) {
  return getGroupSpend(data, getUnitNumber, 'unit_number')
}

export function getSpendByUnitType(data) {
  return getGroupSpend(data, (row) => row.unit_type, 'unit_type')
}

export function getSpendByTyre(data) {
  return getGroupSpend(data, (row) => row.tyre_size, 'tyre_size')
}

export function getTopVehicle(data) {
  const [topVehicle] = getSpendByVehicle(data)

  return topVehicle || null
}

const getMostUsedVehicle = (data) => {
  const usageByVehicle = getValidRows(data).reduce((totals, row) => {
    const unitNumber = getUnitNumber(row)
    totals[unitNumber] = (totals[unitNumber] || 0) + getRowQuantity(row)

    return totals
  }, {})

  const [unitNumber, quantity] =
    Object.entries(usageByVehicle).sort(([, quantityA], [, quantityB]) => quantityB - quantityA)[0] ||
    []

  if (!unitNumber) {
    return null
  }

  return {
    unit_number: unitNumber,
    quantity,
  }
}

const getHighestSpendingMonth = (monthlySpend) =>
  monthlySpend.reduce(
    (highestMonth, currentMonth) =>
      !highestMonth || currentMonth.spend > highestMonth.spend
        ? currentMonth
        : highestMonth,
    null,
  )

const getSpendingIncreaseNote = (monthlySpend) => {
  if (monthlySpend.length < 2) {
    return 'Not enough monthly data to identify a spending trend.'
  }

  let largestIncrease = null

  for (let index = 1; index < monthlySpend.length; index += 1) {
    const previousMonth = monthlySpend[index - 1]
    const currentMonth = monthlySpend[index]
    const increase = currentMonth.spend - previousMonth.spend

    if (increase > 0 && (!largestIncrease || increase > largestIncrease.increase)) {
      largestIncrease = {
        from: previousMonth.month,
        to: currentMonth.month,
        increase,
      }
    }
  }

  if (!largestIncrease) {
    return 'No noticeable increase in spending across the available months.'
  }

  return `Spending increased most from ${largestIncrease.from} to ${largestIncrease.to} by ${formatCurrency(largestIncrease.increase)}.`
}

export function getTyreDataSummary(data) {
  const totalSpend = getTotalSpend(data)
  const monthlySpend = getMonthlySpend(data)
  const spendByType = getSpendByUnitType(data)
  const spendByTyre = getSpendByTyre(data)
  const highestSpendingMonth = getHighestSpendingMonth(monthlySpend)
  const mostUsedVehicle = getMostUsedVehicle(data)
  const [topType] = spendByType
  const [topTyre] = spendByTyre

  return [
    `Total spend: ${formatCurrency(totalSpend)}`,
    `Highest spending month: ${highestSpendingMonth ? `${highestSpendingMonth.month} (${formatCurrency(highestSpendingMonth.spend)})` : 'No data'}`,
    `Most used unit: ${mostUsedVehicle ? `${mostUsedVehicle.unit_number} (${mostUsedVehicle.quantity} tyres ordered)` : 'No data'}`,
    `Top unit type by spend: ${topType ? `${topType.unit_type} (${formatCurrency(topType.spend)})` : 'No data'}`,
    `Top tyre size by spend: ${topTyre ? `${topTyre.tyre_size} (${formatCurrency(topTyre.spend)})` : 'No data'}`,
    `Spending increase: ${getSpendingIncreaseNote(monthlySpend)}`,
  ].join('\n')
}
