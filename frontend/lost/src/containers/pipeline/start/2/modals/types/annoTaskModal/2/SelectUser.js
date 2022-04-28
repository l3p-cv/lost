import React, { Component } from 'react'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { Card, CardBody } from 'reactstrap'
import { CBadge } from '@coreui/react'
import ReactTable from 'react-table'
import IconButton from '../../../../../../../../components/IconButton'
const { selectUser } = actions
class SelectUser extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }

    selectRow(row) {
        this.props.selectUser(this.props.peN, row.groupName, row.id)
        this.props.verifyTab(this.props.peN, 1, true)
        this.props.selectTab(this.props.peN, 2)
    }

    renderTable() {
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
                                    onClick={() => this.selectRow(row.original)}
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
                data={this.props.availableGroups}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        )
    }
    render() {
        return (
            <Card className="annotask-modal-card">
                <CardBody>{this.renderTable()}</CardBody>
            </Card>
        )
    }
}

export default connect(null, { selectUser })(SelectUser)
