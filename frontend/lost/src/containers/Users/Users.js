import React from 'react'
import { Col, Row, Card, CardBody } from 'reactstrap'
import GroupTable from './GroupsTable'
import UserTable from './UsersTable'
import BaseContainer from '../../components/BaseContainer'



const Users = () => (
    <BaseContainer>
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
    </BaseContainer>
)

export default Users

