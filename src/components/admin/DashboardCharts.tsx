'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

type ChartData = {
  reportsChartData: any[]
  cities: string[]
  statusChartData: any[]
  categoryChartData: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c']

export default function DashboardCharts({ data }: { data: ChartData | null }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Memuat grafik...
      </div>
    )
  }

  const { reportsChartData, cities, statusChartData, categoryChartData } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', marginTop: 'var(--spacing-6)' }}>
      
      {/* Line Chart: Reports Trend */}
      <div className="tableContainer" style={{ padding: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Tren Laporan Harian (Per Daerah)</h3>
        {reportsChartData.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportsChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)' }} />
                <YAxis allowDecimals={false} stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {cities.map((city, index) => (
                  <Line 
                    key={city} 
                    type="monotone" 
                    dataKey={city} 
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada data laporan di rentang tanggal ini.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
        {/* Pie Chart: Status Laporan */}
        <div className="tableContainer" style={{ padding: 'var(--spacing-6)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Status Laporan Keseluruhan</h3>
          {statusChartData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Tidak ada data status laporan.</p>
          )}
        </div>

        {/* Pie Chart: Persebaran Destinasi */}
        <div className="tableContainer" style={{ padding: 'var(--spacing-6)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Persebaran Destinasi per Kategori</h3>
          {categoryChartData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#82ca9d"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Tidak ada data destinasi.</p>
          )}
        </div>
      </div>

    </div>
  )
}
