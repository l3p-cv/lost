import React, {Component} from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class LabelTreeTable extends Component {

    render() {
        const data = this.props.labelTrees
        return (
            <React.Fragment>
                <ReactTable
                    data={data}
                    columns={[{
                        Header: 'Users',
                        columns: [
                            {
                                Header: 'Tree Name',
                                accessor: 'name'
                            }, {
                                Header: 'Description',
                                accessor: 'description'
                            }, {
                                Header: 'Amount of Labels',
                                id: 'idx',
                                accessor: d => getAmountOfLabels(d) - 1
                            }, {
                                Header: 'Date',
                                accessor: 'timestamp'
                            }
                        ]
                    }
                ]}
                    defaultPageSize={10}
                    className='-striped -highlight'/>
            </React.Fragment>

        )
    }
}
function getAmountOfLabels(n) {
    if (n.amountOfLabels === undefined) {
        n.amountOfLabels = 1
    }
    if (n.children === undefined) 
        return 1;
    n
        .children
        .forEach(function (c) {
            var r = getAmountOfLabels(c)
            n.amountOfLabels += r
        })
    return n.amountOfLabels
}
export default LabelTreeTable
