import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const baseAxisTick = { fill: '#64748b', fontSize: 12 }
const categoryAxisTick = { ...baseAxisTick, fontSize: 10 }

function Charts({
  monthlySpend = [],
  spendByVehicle = [],
  spendByUnitType = [],
  spendByTyre = [],
  showSpend = true,
}) {
  const valueKey = showSpend ? 'spend' : 'records'
  const valueLabel = showSpend ? 'Spend (TTD)' : 'Tyres Ordered'

  return (
    <div className="chart-shell">
      <section className="chart-card">
        <h2 className="chart-title">{showSpend ? 'Monthly Spend' : 'Monthly Tyres Ordered'}</h2>
        <div className="chart-frame">
          <ResponsiveContainer>
            <LineChart data={monthlySpend} margin={{ bottom: 8 }}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={baseAxisTick} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={baseAxisTick} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={valueKey}
                name={valueLabel}
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Spend By Unit</h2>
          <p className="chart-note">Total for selected period</p>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer>
            <BarChart data={spendByVehicle} margin={{ bottom: 52 }}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="unit_number"
                tick={categoryAxisTick}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={72}
              />
              <YAxis tick={baseAxisTick} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} name={valueLabel} fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Spend By Type</h2>
          <p className="chart-note">Total for selected period</p>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer>
            <BarChart data={spendByUnitType} margin={{ bottom: 52 }}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="unit_type"
                tick={categoryAxisTick}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={72}
              />
              <YAxis tick={baseAxisTick} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} name={valueLabel} fill="#9333ea" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-header">
          <h2 className="chart-title">Spend By Tyre</h2>
          <p className="chart-note">Total for selected period</p>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer>
            <BarChart data={spendByTyre} margin={{ bottom: 52 }}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="tyre_size"
                tick={categoryAxisTick}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={72}
              />
              <YAxis tick={baseAxisTick} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey={valueKey} name={valueLabel} fill="#c2410c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default Charts
