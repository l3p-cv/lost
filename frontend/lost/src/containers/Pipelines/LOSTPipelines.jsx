import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'

import { Row, Col, Card, CardBody } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'

import vanStripes from '../../assets/img/background.svg'
import proSquares from '../../assets/img/protruding-squares.svg'

const LOSTPipelines = (jupyterLabUrl) => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
    }, [])


    const renderSystemInfo = () => (
        <div>
            ToDo.
        </div>
    )

    return (
        <Row>
            <Col xs="12" sm="6" lg="6">
                <Card className="text-white" style={{backgroundImage: `url(${vanStripes})`}}>
                    <CardBody className="pb-0 "style={{height: '175px'}} >
                        <div style={{ fontSize: '2em'}}>
                            Single Image Annotation
                        </div>
                        <div style= {{alignItems:'center', display:'flex', textAlign: 'center', fontSize: '5em', justifyContent: 'center', marginTop: '20px'}}>
                            <FontAwesomeIcon outline size='lg' icon={faPlayCircle} />
                        </div>
                    </CardBody>
                </Card>
            </Col>
            <Col xs="12" sm="6" lg="6">
                <Card className="text-white" style={{backgroundImage: `url(${proSquares})`}}>
                    <CardBody className="pb-0 "style={{height: '175px'}} >
                        <div style={{ fontSize: '2em'}}>
                            Multi Image Annotation
                        </div>
                        <div style= {{alignItems:'center', display:'flex', textAlign: 'center', fontSize: '5em', justifyContent: 'center', marginTop: '20px'}}>
                            <FontAwesomeIcon size='lg' icon={faPlayCircle} />
                        </div>
                    </CardBody>
                </Card>
            </Col>
      </Row>
    )
}
export default LOSTPipelines
