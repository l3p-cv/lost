import React, {Component} from 'react'
import {Card, CardBody, Col, Row} from 'reactstrap'

import WorkersTable from '../components/Workers/WorkersTable'

class Workers extends Component {
    render() {
        return (
            <Row>
                <Col xs='12' sm='12' lg='12'>
                    <Card className='text-black'>
                        <CardBody className='pb-0'>
                            <WorkersTable></WorkersTable>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

        )
    }
}
export default Workers