import React from 'react'
import { CWidgetStatsA } from '@coreui/react'
import { CChart } from '@coreui/react-chartjs'
import Loading from './Loading'

const LineChartWidget = ({ title, value, chartData }) => {
  const lineChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        borderWidth: 1,
        tension: 0.4,
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4,
      },
    },
  }

  if (chartData === undefined) {
    return (
      <CWidgetStatsA
        color="primary"
        title={title}
        value=""
        chart={
          <div style={{ marginLeft: '15px', marginBottom: '15px' }}>
            <Loading size="2xl" />
          </div>
        }
      ></CWidgetStatsA>
    )
  }

  return (
    <CWidgetStatsA
      color="primary"
      title={title}
      value={value}
      chart={
        <CChart
          type="line"
          className="mt-3"
          style={{ height: '70px' }}
          data={{
            labels: chartData,
            datasets: [
              {
                label: 'chart',
                data: chartData,
                borderColor: '#fff',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#fff',
              },
            ],
          }}
          options={lineChartOptions}
          label="Annotations"
          labels="days"
        />
      }
    ></CWidgetStatsA>
  )
}

export default LineChartWidget
