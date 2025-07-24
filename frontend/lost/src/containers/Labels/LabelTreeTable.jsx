import { faEdit, faEye, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

import { CAlert, CBadge, CCard, CCardBody } from '@coreui/react'
import { ReactFlowProvider } from '@xyflow/react'
import { FaInfoCircle } from 'react-icons/fa'
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
    const [highlightLatestRow, setHighlightLatestRow] = useState(false)

    const newlyCreatedTreeId = Number(localStorage.getItem('newlyCreatedLabelTreeId'))

    useEffect(() => {
        const joyrideRunning = localStorage.getItem('joyrideRunning') === 'true'
        const currentStep = localStorage.getItem('currentStep')

        if (joyrideRunning && currentStep === '4') {
            setHighlightLatestRow(true)
        }
    }, [labelTrees.length])

    useEffect(() => {
        if (highlightLatestRow) {
            const checkRow = () => {
                const el = document.getElementById('latest-label-tree')
                if (el) {
                    window.dispatchEvent(
                        new CustomEvent('joyride-next-step', {
                            detail: { step: 'latest-label-tree' },
                        })
                    )
                } else {
                    setTimeout(checkRow, 100)
                }
            }
            checkRow()
        }
    }, [highlightLatestRow])

    const getAmountOfLabels = (n) => {
        amountOfLabels += 1
        if (n.children === undefined) return 1
        n.children.forEach(getAmountOfLabels)
        return amountOfLabels
    }

    const getRowClassName = (original, index) => {
        const isNewTree = original.idx === newlyCreatedTreeId
        return isNewTree ? 'latestLabelTree' : ''
    }

    const defineColumns = () => {
        const columnHelper = createColumnHelper()
        return [
            columnHelper.accessor('name', {
                header: 'Tree Name',
                cell: (props) => {
                    const isNewTree = props.row.original.idx === newlyCreatedTreeId
                    return (
                        <div
                            id={
                                isNewTree &&
                                localStorage.getItem('joyrideRunning') === 'true' &&
                                localStorage.getItem('currentStep') === '4'
                                    ? 'latest-label-tree'
                                    : undefined
                            }
                        >
                            <b>{props.row.original.name}</b>
                            <HelpButton
                                id={props.row.original.idx}
                                text={props.row.original.description}
                            />
                            <div className="small text-muted">
                                {`ID: ${props.row.original.idx}`}
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('d', {
                header: 'Amount of Labels',
                cell: (props) => {
                    amountOfLabels = 0
                    return getAmountOfLabels(props.row.original) - 1
                },
            }),
            columnHelper.accessor('group_id', {
                header: 'Global',
                cell: (props) =>
                    props.row.original.group_id ? (
                        <CBadge color="success">User</CBadge>
                    ) : (
                        <CBadge color="primary">Global</CBadge>
                    ),
            }),
            columnHelper.accessor('edit', {
                header: 'Edit',
                cell: (props) => {
                    const isNewlyCreated = props.row.original.idx === newlyCreatedTreeId
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
                            color="warning"
                            className={isNewlyCreated ? 'latest-edit-button' : ''}
                            onClick={() => {
                                const lT = labelTrees.find(
                                    (labelTree) => labelTree.idx === props.row.original.idx
                                )
                                setReadonly(
                                    visLevel === 'global'
                                        ? false
                                        : !!lT.group_id
                                            ? false
                                            : true
                                )

                                const graph = convertLabelTreeToReactFlow(lT)
                                setSelectedTree({
                                    nodes: graph.nodes,
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
                cell: (props) => (
                    <IconButton
                        icon={faFileExport}
                        text="Export"
                        color="info"
                        isOutline={true}
                        onClick={() => exportLabelTree(props.row.original.idx)}
                    />
                ),
            }),
        ]
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
                    <CCard>
                        <CCardBody>
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
                        </CCardBody>
                    </CCard>
                </ReactFlowProvider>
            </BaseModal>

            <CoreDataTable 
                columns={defineColumns()} 
                tableData={labelTrees} 
                getRowClassName={getRowClassName}
            />
        </>
    )
}

export default LabelTreeTable