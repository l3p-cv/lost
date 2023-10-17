import React from 'react'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import HelpButton from '../../../../../../../../components/HelpButton'
import IconButton from '../../../../../../../../components/IconButton'
import { faTags } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { Card, CardBody } from 'reactstrap'
import ReactTable from 'react-table'

const { selectLabelTree } = actions

const SelectTree = ({ peN, availableLabelTrees, selectLabelTree, verifyTab, selectTab }) => {
    const selectRow = (row) => {
        selectLabelTree(peN, row.idx)
        verifyTab(peN, 2, true)
        selectTab(peN, 3)
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
                // getTrProps={(state, rowInfo) => ({
                //     onClick: () => this.selectRow(rowInfo.original),
                // })}
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
        <Card className="annotask-modal-card">
            <CardBody>{renderTable()}</CardBody>
        </Card>
    )
}

export default connect(null, { selectLabelTree })(SelectTree)
