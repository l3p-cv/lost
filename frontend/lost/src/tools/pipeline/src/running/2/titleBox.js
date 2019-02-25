import React from 'react'

const titleBox = (props) =>{

    return(
        <div>
            <div>
                Name: {props.name}
            </div>
            <div>
                LogfilePath: {props.logfilePath}
            </div>
            <div>
                managerName: {props.managerName}
            </div>
            <div>
                timestamp: {props.timestamp}
            </div>
        </div>
    )

}

export default titleBox