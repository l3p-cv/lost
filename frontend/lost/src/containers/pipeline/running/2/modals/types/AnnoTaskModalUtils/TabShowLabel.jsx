import React from 'react'
import { Badge } from 'reactstrap'

const TabShowLabels = (props) => {
    return (
        <>
            <div>
                <b>All children of the label tree(s):</b>
            </div>
            <h5>
                <Badge color="primary" pill>
                    {props.annoTask.labelLeaves.map((l) => {
                        return l.name
                    })}
                </Badge>
            </h5>
        </>
    )
}

export default TabShowLabels
