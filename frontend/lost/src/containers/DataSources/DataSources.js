import React from 'react'
import { Col, Row, Card, CardBody } from 'reactstrap'
import GroupTable from './GroupsTable'
import DSTable from './DSTable'
import BaseContainer from '../../components/BaseContainer'



const DataSources = () => (
    <BaseContainer>
        <DSTable></DSTable>
    </BaseContainer>
)

export default DataSources

