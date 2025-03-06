import { faTags } from '@fortawesome/free-solid-svg-icons'
import { useReactFlow } from '@xyflow/react'
import ReactTable from 'react-table'
import { Card, CardBody } from 'reactstrap'
import { AvailableLabelTree } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import HelpButton from '../../../../../../components/HelpButton'
import IconButton from '../../../../../../components/IconButton'

interface SelectTreeProps {
    nodeId: string
    availableLabelTrees: AvailableLabelTree[]
    goToNextStep: () => void
}

export const SelectTree = ({
    nodeId,
    availableLabelTrees,
    goToNextStep,
}: SelectTreeProps) => {
    const { updateNodeData } = useReactFlow()

    const selectRow = (row) => {
        updateNodeData(nodeId, {
            labelTreeId: row.idx,
        })
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
                        Header: 'Description',
                        accessor: 'description',
                        Cell: (row) => {
                            return (
                                <HelpButton
                                    id={row.original.idx}
                                    text={row.original.description}
                                />
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
                                    icon={faTags}
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
                data={availableLabelTrees}
                defaultPageSize={10}
                className="-striped -highlight"
            />
        )
    }

    return (
        <>
            <h4 className="mb-3 text-center">Label Tree Selection</h4>
            <Card className="annotask-modal-card">
                <CardBody>{renderTable()}</CardBody>
            </Card>
        </>
    )
}
