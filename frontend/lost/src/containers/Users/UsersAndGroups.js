import React from 'react'
import { Col, Row, Card, CardBody } from 'reactstrap'
import GroupTable from './GroupsTable'
import UserTable from './UsersTable'



const UsersAndGroups = () => (
    <Row>
        <Col xs="3">
            <Card>
                <CardBody>
                    <GroupTable />
                </CardBody>
            </Card>
        </Col>
        <Col xs="9">
            <Card>
                <CardBody>
                    <UserTable />
                </CardBody>
            </Card>
        </Col>
    </Row>
)

export default UsersAndGroups

