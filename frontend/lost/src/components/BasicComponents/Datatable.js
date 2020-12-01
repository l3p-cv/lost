import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {Badge} from 'reactstrap'

const Datatable = (props) =>{
    // eslint-disable-next-line no-unused-vars
    const onRowClick = (state, rowInfo, column, instance) => {
        return {
            onClick: ()=> props.onRowClick ? props.onRowClick(rowInfo.original) : null
        }
    }

    return(
        <ReactTable
            key={props.key}
            noDataText={props.noText ? '' : 'No rows found'}
            showPageSizeOptions={props.showPageSizeOptions}
            showPageJump={false}
            pageSize={props.pageSize}
            showPagination={props.showPagination}
            getTrProps={onRowClick}
            data={props.data}
            columns={ props.columns}
            defaultPageSize={10}
            className='-striped -highlight'
        />
    )
}


const smallText = (text) =>{
    return(<p className="small text-muted">{text}</p>)
}

// https://codesandbox.io/s/react-hooks-usestate-xx4l1
// Custom Cells

Datatable.centeredCell = ({children, key}) => {
    return(
        <div
            key={key}
            style={{
                textAlign: 'center',
                position: 'relative',
                top: '50%',
                transform: 'translateY(-50%)'
            }}>{children}</div>
    )
}

Datatable.renderBadge = (key, text, color, onClick) =>{
    return(
        <div key= {key}>
            <Badge color={color}
                onClick={onClick ? onClick : null}
            >
                {text}
            </Badge>
        </div>
    )
}

Datatable.renderTitleSubtitle = (top, bottom)=>{
    return(<><p style={{margin: 0}}>{top}</p>{smallText(bottom)}</>)
}

Datatable.renderStatus = (lastActive) =>{
    lastActive.setHours(lastActive.getHours() + 2)
    const fifteenSecondsAgo = new Date()
    fifteenSecondsAgo.setSeconds(fifteenSecondsAgo.getSeconds() - 15)
    let status = 'Online'
    if(lastActive < fifteenSecondsAgo) {
        status = 'Offline'
    }
    return(
        <div>
            <Badge color={status === 'Online' ? 'success' : 'danger'}>{status}
            </Badge>
            {smallText(`Last Active: ${lastActive.toLocaleString('de-DE')}`)}
        </div>
    )
}

export default Datatable
