import React from 'react'
import { Col, Row, Card, CardBody } from 'reactstrap'
import GroupTable from './GroupsTable'
import UserTable from './UsersTable'

const UsersAndGroups = () => (
    <Row>
        <Col xs="3">
            <GroupTable />
        </Col>
        <Col xs="9">
            <UserTable />
        </Col>
    </Row>
)

export default UsersAndGroups
