import React from 'react'
import { Row, Col, Card, CardBody } from 'reactstrap'

const BaseContainer = (props) => (
    <Row>
        <Col xs="12" sm="12" lg="12">
            <Card>
                <CardBody>{props.children}</CardBody>
            </Card>
        </Col>
    </Row>
)
export default BaseContainer
