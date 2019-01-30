import React, {Component} from 'react'
import {Col, Row} from 'reactstrap'

class Facts extends Component {
    render() {

        return (

            <Row>
                <Col xs='12' md='12' xl='12'>
                    <Row>
                        <Col sm='3'>
                            <div className='callout callout-danger'>
                                <small className='text-muted'>seconds/annotation</small>
                                <br/>
                                <strong className='h4'>&#8709; 7,5</strong>
                            </div>
                        </Col>
                        <Col sm='3'>
                            <div className='callout callout-warning'>
                                <small className='text-muted'>seconds/image</small>
                                <br/>
                                <strong className='h4'>&#8709; 20,56</strong>
                            </div>
                        </Col>
                        <Col sm='3'>
                            <div className='callout callout-info'>
                                <small className='text-muted'>Overall time spent</small>
                                <br/>
                                <span className='icon-clock'></span>
                                <strong className='h4'>
                                    &nbsp;427:45</strong>
                            </div>
                        </Col>
                        <Col sm='3'>
                            <div className='callout callout-success'>
                                <small className='text-muted'>Today</small>
                                <br/>
                                <span className='icon-clock'></span>
                                <strong className='h4'>
                                    &nbsp;2:45</strong>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>

        )

    }
}

export default Facts
