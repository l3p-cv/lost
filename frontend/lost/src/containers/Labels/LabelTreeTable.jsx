import { faEdit, faEye, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

import { CAlert, CBadge } from '@coreui/react'
import { ReactFlowProvider } from '@xyflow/react'
import { FaInfoCircle } from 'react-icons/fa'
import { Card, CardBody } from 'reactstrap'
import { useExportLabelTree } from '../../actions/label/label-api'
import BaseModal from '../../components/BaseModal'
import HelpButton from '../../components/HelpButton'
import IconButton from '../../components/IconButton'
import { LabelTreeEditor } from './LabelTreeEditor/LabelTreeEditor'
import { convertLabelTreeToReactFlow } from './LabelTreeEditor/label-tree-util'
import CoreDataTable from '../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'

let amountOfLabels = 0

const LabelTreeTable = ({ labelTrees, visLevel }) => {
    const { mutate: exportLabelTree } = useExportLabelTree()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTree, setSelectedTree] = useState({ nodes: [], edges: [] })
    const [readonly, setReadonly] = useState(false)
    const defineColumns = () => {
        const columnHelper = createColumnHelper()
        let columns = []
        columns = [
            ...columns,
            columnHelper.accessor('name', {
                header: 'Tree Name',
                cell: (props) => {
                    return (
                        <>
                            <b>{props.row.original.name}</b>
                            <HelpButton
                                id={props.row.original.idx}
                                text={props.row.original.description}
                            />
                            <div className="small text-muted">
                                {`ID: ${props.row.original.idx}`}
                            </div>
                        </>)
                }
            }),
            columnHelper.accessor('d', {
                header: 'Amount of Labels',
                cell: (props) => {
                    amountOfLabels = 0
                    return getAmountOfLabels(props.row.original) - 1
                }
            }),
            columnHelper.accessor('group_id', {
                header: 'Global',
                cell: (props) => {
                    if (props.row.original.group_id) {
                        return <CBadge color="success">User</CBadge>
                    }
                    return <CBadge color="primary">Global</CBadge>
                },
            }),
            columnHelper.accessor('edit', {
                header: 'Edit',
                cell: (props) => {
                    return (
                        <IconButton
                            icon={
                                props.row.original.group_id === null
                                    ? visLevel !== 'global'
                                        ? faEye
                                        : faEdit
                                    : faEdit
                            }
                            text={
                                props.row.original.group_id === null
                                    ? visLevel !== 'global'
                                        ? 'Show'
                                        : 'Edit'
                                    : 'Edit'
                            }
                            color="primary"
                            onClick={() => {
                                const lT = labelTrees.find((labelTree) => {
                                    if (labelTree.idx === props.row.original.idx) {
                                        return labelTree
                                    }
                                })
                                if (visLevel === 'global') {
                                    setReadonly(false)
                                } else {
                                    if (lT.group_id) {
                                        setReadonly(false)
                                    } else {
                                        setReadonly(true)
                                    }
                                }

                                const graph = convertLabelTreeToReactFlow(lT)

                                setSelectedTree({
                                    // @ts-expect-error type is not an issue here
                                    nodes: graph.nodes,
                                    // @ts-expect-error type is not an issue here
                                    edges: graph.edges,
                                })
                                setIsEditModalOpen(true)
                            }}
                        />
                    )
                },
            }),
            columnHelper.accessor('export', {
                header: 'Export',
                cell: (props) => {
                    return (
                        <IconButton
                            icon={faFileExport}
                            text="Export"
                            color="primary"
                            isOutline={false}
                            onClick={() => exportLabelTree(props.row.original.idx)}
                        />
                    )
                },
            }),
        ]
        return columns
    }

    const getAmountOfLabels = (n) => {
        amountOfLabels += 1
        if (n.children === undefined) return 1
        n.children.forEach(function (c) {
            getAmountOfLabels(c)
        })
        return amountOfLabels
    }

    return (
        <>
            <BaseModal
                isOpen={isEditModalOpen}
                title={readonly ? 'View Label Tree' : 'Edit Label Tree'}
                toggle={() => setIsEditModalOpen(false)}
                onClosed={() => { }}
                size="xl"
                fullscreen
                isShowCancelButton={false}
            >
                <ReactFlowProvider>
                    <Card>
                        <CardBody>
                            {!readonly && (
                                <CAlert color="secondary" dismissible>
                                    <div className="d-flex align-items-center">
                                        <FaInfoCircle className="me-2" size={20} />
                                        <p className="mb-0">
                                            Right Click on a label to add new child
                                            labels. Click on a label to edit it. Do not
                                            forget to click <b>Save</b> after editing each
                                            label!
                                        </p>
                                    </div>
                                </CAlert>
                            )}
                            <LabelTreeEditor
                                initialNodes={selectedTree.nodes}
                                initialEdges={selectedTree.edges}
                                visLevel={visLevel}
                                readonly={readonly}
                            />
                        </CardBody>
                    </Card>
                </ReactFlowProvider>
            </BaseModal>
            <CoreDataTable columns={defineColumns()} tableData={labelTrees} />
        </>
    )
}
export default LabelTreeTable
