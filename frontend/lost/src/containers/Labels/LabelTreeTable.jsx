import { faEdit, faEye, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

import { CAlert, CBadge } from '@coreui/react'
import { ReactFlowProvider } from '@xyflow/react'
import { FaInfoCircle } from 'react-icons/fa'
import { Card, CardBody } from 'reactstrap'
import { useExportLabelTree } from '../../actions/label/label-api'
import BaseModal from '../../components/BaseModal'
import Datatable from '../../components/Datatable'
import HelpButton from '../../components/HelpButton'
import IconButton from '../../components/IconButton'
import { LabelTreeEditor } from './LabelTreeEditor/LabelTreeEditor'
import { convertLabelTreeToReactFlow } from './LabelTreeEditor/label-tree-util'

let amountOfLabels = 0

const LabelTreeTable = ({ labelTrees, visLevel }) => {
    const { mutate: exportLabelTree } = useExportLabelTree()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTree, setSelectedTree] = useState({ nodes: [], edges: [] })
    const [readonly, setReadonly] = useState(false)

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
                onClosed={() => {}}
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

            <Datatable
                data={labelTrees}
                columns={[
                    {
                        Header: 'Tree Name',
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
                        Header: 'Amount of Labels',
                        id: 'idx',
                        accessor: (d) => {
                            amountOfLabels = 0
                            return getAmountOfLabels(d) - 1
                        },
                    },
                    {
                        Header: 'Global',
                        id: 'group_id',
                        accessor: (d) => {
                            if (d.group_id) {
                                return <CBadge color="success">User</CBadge>
                            }
                            return <CBadge color="primary">Global</CBadge>
                        },
                    },
                    {
                        Header: 'Edit',
                        id: 'edit',
                        accessor: (d) => {
                            return (
                                <IconButton
                                    icon={
                                        d.group_id === null
                                            ? visLevel !== 'global'
                                                ? faEye
                                                : faEdit
                                            : faEdit
                                    }
                                    text={
                                        d.group_id === null
                                            ? visLevel !== 'global'
                                                ? 'Show'
                                                : 'Edit'
                                            : 'Edit'
                                    }
                                    color="primary"
                                    onClick={() => {
                                        const lT = labelTrees.find((labelTree) => {
                                            if (labelTree.idx === d.idx) {
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
                    },
                    {
                        Header: 'Export',
                        id: 'export',
                        accessor: (d) => {
                            return (
                                <IconButton
                                    icon={faFileExport}
                                    text="Export"
                                    color="primary"
                                    isOutline={false}
                                    onClick={() => exportLabelTree(d.idx)}
                                />
                            )
                        },
                    },
                ]}
            />
        </>
    )
}
export default LabelTreeTable
