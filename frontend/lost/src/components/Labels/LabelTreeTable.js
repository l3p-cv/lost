import React, {Component} from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import LabelTreeContextMenu from './LabelTreeContextMenu'
import {NotificationManager, NotificationContainer} from 'react-notifications'
import 'react-notifications/lib/notifications.css';

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
                            }, {
                                Cell: row => (<LabelTreeContextMenu userId={row.original.idx}/>),
                                maxWidth: 35,
                                filterable: false,
                                sortable: false
                            }
                        ]
                    }
                ]}
                    defaultPageSize={10}
                    className='-striped -highlight'/>
                <NotificationContainer/>
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
