"use client"

import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  Cell,
  Bar,
  Line,
} from "recharts"
import { useEffect } from "react"

export const BarChart = ({ data, options }) => {
  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      // Force cleanup of any lingering ResizeObservers
      if (window.ResizeObserver) {
        const resizeObservers = /_reactResizeObserver/.test(window.ResizeObserver.toString())
          ? Array.from(document.querySelectorAll('[data-observe-resize="true"]'))
          : []

        resizeObservers.forEach((el) => {
          el.removeAttribute("data-observe-resize")
        })
      }
    }
  }, [])

  // Transform the data if needed
  const transformedData = data.labels.map((label, index) => {
    const dataPoint = { name: label }
    data.datasets.forEach((dataset, datasetIndex) => {
      dataPoint[dataset.label] = dataset.data[index]
    })
    return dataPoint
  })

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <RechartsBarChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {data.datasets.map((dataset, index) => (
          <Bar key={`bar-${index}`} dataKey={dataset.label} fill={dataset.backgroundColor || "#8884d8"} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export const LineChart = ({ data, options }) => {
  useEffect(() => {
    return () => {
      // Force cleanup of any lingering ResizeObservers
      if (window.ResizeObserver) {
        const resizeObservers = /_reactResizeObserver/.test(window.ResizeObserver.toString())
          ? Array.from(document.querySelectorAll('[data-observe-resize="true"]'))
          : []

        resizeObservers.forEach((el) => {
          el.removeAttribute("data-observe-resize")
        })
      }
    }
  }, [])
  // Transform the data if needed
  const transformedData = data.labels.map((label, index) => {
    const dataPoint = { name: label }
    data.datasets.forEach((dataset, datasetIndex) => {
      dataPoint[dataset.label] = dataset.data[index]
    })
    return dataPoint
  })

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <RechartsLineChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {data.datasets.map((dataset, index) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor || "#8884d8"}
            fill={dataset.backgroundColor || "transparent"}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export const PieChart = ({ data, options }) => {
  useEffect(() => {
    return () => {
      // Force cleanup of any lingering ResizeObservers
      if (window.ResizeObserver) {
        const resizeObservers = /_reactResizeObserver/.test(window.ResizeObserver.toString())
          ? Array.from(document.querySelectorAll('[data-observe-resize="true"]'))
          : []

        resizeObservers.forEach((el) => {
          el.removeAttribute("data-observe-resize")
        })
      }
    }
  }, [])
  // Transform the data into the format expected by Recharts
  const transformedData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor[index] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <RechartsPieChart>
        <Pie
          data={transformedData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry.name}
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
