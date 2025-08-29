import React from 'react'
import PropTypes from 'prop-types'
import { getColor } from '@coreui/utils'
import { CChartBar } from '@coreui/react-chartjs'

const ChartBarSimple = ({
    backgroundColor = 'rgba(0,0,0,.2)',
    dataPoints = [10, 22, 34],
    label = 'Sales',
    pointHoverBackgroundColor,
    pointed,
    tag,
    ...attributes
}) => {

    const defaultDatasets = (() => {
        return [
            {
                data: dataPoints,
                backgroundColor: getColor(backgroundColor),
                pointHoverBackgroundColor: getColor(pointHoverBackgroundColor),
                label: label,
                barPercentage: 0.5,
                categoryPercentage: 1,
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
                        display: false,
                    },
                ],
                yAxes: [
                    {
                        display: false,
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        }
    })()

    // render
    return (
        <CChartBar
            {...attributes}
            datasets={defaultDatasets}
            options={defaultOptions}
            labels={label}
        />
    )
}

ChartBarSimple.propTypes = {
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    className: PropTypes.string,
    //
    backgroundColor: PropTypes.string,
    pointHoverBackgroundColor: PropTypes.string,
    dataPoints: PropTypes.array,
    label: PropTypes.string,
    pointed: PropTypes.bool,
}


export default ChartBarSimple
