import React, {Component} from 'react'
// import {Bar} from 'react-chartjs-2'
// import {CustomTooltips} from '@coreui/coreui-plugin-chartjs-custom-tooltips';

const options = {
    tooltips: {
        enabled: false,
        custom: undefined
    },
    maintainAspectRatio: false
}

class AmountPerLabel extends Component {
    getBarData() {
        const labels = this
            .props
            .data
            .map((d) => {
                return (d.label)
            })
        const data = this
            .props
            .data
            .map((d) => {
                return (d.amount)
            })
        const bar = {
            labels: labels,
            datasets: [
                {
                    label: 'Amount per label',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: data
                }
            ]
        }
        return bar
    }
    render() {
        const barData = this.getBarData()
        if (barData.labels.length > 0) {
            return (

                <div className="chart-wrapper">
                    {/* <Bar data={barData} options={options} height={100}/> */}
                </div>

            )
        } else {
            return (
                <React.Fragment>No Data available yet.</React.Fragment>
            )
        }

    }
}

export default AmountPerLabel
