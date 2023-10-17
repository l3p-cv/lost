import React from 'react'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { Card, CardBody } from 'reactstrap'
import { CBadge } from '@coreui/react'
import ReactTable from 'react-table'
import IconButton from '../../../../../../../../components/IconButton'

const { selectUser } = actions

const SelectUser = ({ peN, availableGroups, selectUser, verifyTab, selectTab }) => {
    const selectRow = (row) => {
        selectUser(peN, row.groupName, row.id)
        verifyTab(peN, 1, true)
        selectTab(peN, 2)
    }

    const renderTable = () => {
        return (
            <ReactTable
                columns={[
                    {
                        Header: 'Name',
                        accessor: 'name',
                    },
                    {
                        Header: 'User/Group',
                        accessor: 'isUserDefault',
                        Cell: function customCell(row) {
                            if (row.original.isUserDefault) {
                                return (
                                    <CBadge color="success" shape="pill">
                                        User
                                    </CBadge>
                                )
                            }
                            return (
                                <CBadge color="primary" shape="pill">
                                    Group
                                </CBadge>
                            )
                        },
                    },
                    {
                        Header: 'Choose',
                        accessor: 'name',
                        Cell: (row) => {
                            return (
                                <IconButton
                                    isOutline={false}
                                    color="primary"
                                    icon={row.original.isUserDefault ? faUser : faUsers}
                                    text="Choose"
                                    onClick={() => selectRow(row.original)}
                                />
                            )
                        },
                    },
                ]}
                // getTrProps={(state, rowInfo) => ({
                //     onClick: () => this.selectRow(rowInfo.original),
                // })}
                defaultSorted={[
                    {
                        id: 'name',
                        desc: true,
                    },
                ]}
                data={availableGroups}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        )
    }

    return (
        <Card className="annotask-modal-card">
            <CardBody>{renderTable()}</CardBody>
        </Card>
    )
}

export default connect(null, { selectUser })(SelectUser)
