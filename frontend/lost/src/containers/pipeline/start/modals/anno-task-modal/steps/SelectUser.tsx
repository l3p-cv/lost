import { CBadge } from '@coreui/react'
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useReactFlow } from '@xyflow/react'
import ReactTable from 'react-table'
import { Card, CardBody } from 'reactstrap'
import { AvailableGroup } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import IconButton from '../../../../../../components/IconButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectUserProps {
    nodeId: string
    availableGroups: AvailableGroup[]
    goToNextStep: () => void
}

export const SelectUser = ({
    nodeId,
    availableGroups,
    goToNextStep,
}: SelectUserProps) => {
    const { updateNodeData } = useReactFlow()

    const selectRow = (row) => {
        updateNodeData(nodeId, {
            workerId: row.id,
            assignee: row.groupName,
        } as AnnoTaskNodeData)
        goToNextStep()
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
        <>
            <h4 className="mb-3 text-center">User Selection</h4>

            <Card className="annotask-modal-card">
                <CardBody>{renderTable()}</CardBody>
            </Card>
        </>
    )
}
