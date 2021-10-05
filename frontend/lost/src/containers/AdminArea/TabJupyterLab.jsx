import React, { useState, useEffect } from 'react'
import actions from '../../actions'

import { Card, CardBody } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons'

import vanStripes from '../../assets/img/background.svg'


const TabJupyterLab = (props) => {
    

    const onCardClick = () => (
        window.open(window.location.protocol+'//'+window.location.hostname+':'+props.jupyterLabUrl, '_blank').focus()
    )

    if (props.jupyterLabUrl !== ''){
        return (
            <Card onClick={()=>onCardClick()} className="text-white" style={{backgroundImage: `url(${vanStripes})`, cursor:'pointer'}}>
                <CardBody className="pb-0 "style={{height: '175px'}} >
                    <div style={{ fontSize: '2em'}}>
                        JupyterLab
                    </div>
                    <div style= {{alignItems:'center', display:'flex', textAlign: 'center', fontSize: '5em', justifyContent: 'center', marginTop: '20px'}}>
                        <FontAwesomeIcon outline size='lg' icon={faCode} />
                    </div>
                </CardBody>
            </Card>
        )
    }
    else {
        return (
            <div>
                JupyterLab seems not to be configured. Please contact your administrator.
            </div>
        )
    }
}
export default TabJupyterLab
