import React, {Component} from 'react'
import {Bar} from 'react-chartjs-2'
import {CustomTooltips} from '@coreui/coreui-plugin-chartjs-custom-tooltips';

const bar = {
    labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July'
    ],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [
                65,
                59,
                80,
                81,
                56,
                55,
                40
            ]
        }
    ]
};

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}

class AmountPerLabel extends Component {
    render() {

        return (

            <div className="chart-wrapper">
                <Bar data={bar} options={options} height={100}/>
            </div>

        )

    }
}

export default AmountPerLabel
