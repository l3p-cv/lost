import React from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'

// const brandSuccess = getStyle('success') || '#4dbd74'
const brandInfo = getStyle('info') || '#20a8d8'
const brandDanger = getStyle('danger') || '#f86c6b'

const AnnosPerHour = ({ data }) => {
    const defaultDatasets = (() => {
        return [
            {
                label: 'Annotations',
                backgroundColor: hexToRgba(brandInfo, 10),
                borderColor: brandInfo,
                pointHoverBackgroundColor: brandInfo,
                borderWidth: 2,
                yAxisID: 'A',
                data: data.amountPerHour,
            },
            {
                label: 'Average time per annotation (seconds)',
                backgroundColor: 'transparent',
                borderColor: brandDanger,
                pointHoverBackgroundColor: brandDanger,
                borderWidth: 1,
                borderDash: [8, 5],
                yAxisID: 'B',
                data: data.avgPerHour,
            },
        ]
    })()

    const defaultOptions = (() => {
        return {
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
            scales: {
                xAxes: [
                    {
                        type: 'time',
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        time: {
                            // parser: 'YYYY-MM-DD HH:mm',
                            parser: function (date) {
                                return date.toLocaleString()
                            },
                            tooltipFormat: 'll HH:mm',
                            unit: 'day',
                            unitStepSize: 1,
                            displayFormats: {
                                day: 'MMM DD',
                            },
                        },
                    },
                ],
                yAxes: [
                    {
                        id: 'A',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 5,
                        },
                        gridLines: {
                            display: true,
                        },
                    },
                    {
                        id: 'B',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 5,
                        },
                        gridLines: {
                            display: false,
                        },
                    },
                ],
            },
            elements: {
                point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                    hoverBorderWidth: 3,
                },
            },
        }
    })()

    // render
    return (
        <CChartLine
            style={{ minHeight: 350 }}
            datasets={defaultDatasets}
            options={defaultOptions}
            labels={data.labels}
        />
    )
}

export default AnnosPerHour
