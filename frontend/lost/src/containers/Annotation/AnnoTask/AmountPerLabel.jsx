import React, { useState, useEffect } from 'react'
import { CChart } from '@coreui/react-chartjs'

const chartOptions = {
    maintainAspectRatio: true,
}

const AmountPerLabel = ({ stats }) => {
    const [barData, setBarData] = useState({ datasets: [], labels: [], colors: [] })

    useEffect(() => {
        getBarData()
    }, [stats])

    const getBarData = () => {
        const labels = stats.map((d) => {
            return d.label
        })
        const data = stats.map((d) => {
            return d.amount
        })
        const colors = stats.map((d) => {
            if (d.color !== '') {
                return d.color
            }
            return '#10515F'
        })
        const bar = {
            labels: labels,
            datasets: [
                {
                    label: 'Amount per label',
                    backgroundColor: colors,
                    background: 'rgb(16, 81, 95,0.8)',
                    borderColor: 'rgb(16, 81, 95,0.8)',
                    borderWidth: 0,
                    hoverBackgroundColor: 'rgb(16, 81, 95,0.4)',
                    hoverBorderColor: 'rgb(16, 81, 95,0.4)',
                    data: data,
                },
            ],
        }
        setBarData(bar)
    }
    if (barData.labels.length > 0) {
        return (
            <div className="chart-wrapper">
                <CChart
                    type="bar"
                    datasets={barData.datasets}
                    options={chartOptions}
                    labels={barData.labels}
                />
            </div>
        )
    } else {
        return <React.Fragment>No Data available yet.</React.Fragment>
    }
}

export default AmountPerLabel
