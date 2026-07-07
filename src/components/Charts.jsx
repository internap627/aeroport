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
            <LineChart data={monthlySpend}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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
            <BarChart data={spendByVehicle}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="unit_number"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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
            <BarChart data={spendByUnitType}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="unit_type"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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
            <BarChart data={spendByTyre}>
              <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="tyre_size"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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
