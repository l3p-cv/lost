import { useNodesData, useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { Script } from '../../../../actions/pipeline/model/pipeline-template-response'
import CollapseCard from '../../globalComponents/modals/CollapseCard'
import ArgumentsTable from '../../globalComponents/modals/ScriptArgumentsTable'
import Table from '../../globalComponents/modals/Table'
import { ScriptNodeData } from '../nodes'
import { CModal, CModalBody, CModalHeader } from '@coreui/react'

interface ScriptModalProps {
    nodeId: string
    isOpen: boolean
    toggle: () => void
    script: Script
}

export const ScriptModal = ({ script, nodeId, isOpen, toggle }: ScriptModalProps) => {
    const nodeData = useNodesData(nodeId)
    const scriptNodeData = nodeData?.data as ScriptNodeData

    const { updateNodeData } = useReactFlow()

    const argumentTableOnInput = useCallback(
        (e) => {
            const arg = { ...scriptNodeData.arguments }
            const key = e.target.getAttribute('data-ref')
            const value = e.target.value
            arg[key].value = value
            updateNodeData(nodeId, {
                arguments: arg,
            })
        },
        [nodeId, scriptNodeData.arguments, updateNodeData],
    )

    const verifyNode = useCallback(() => {
        const verified = scriptNodeData.arguments
            ? Object.values(scriptNodeData.arguments).every((arg) => arg.value)
            : true

        updateNodeData(nodeId, {
            verified,
        })
    }, [nodeId, scriptNodeData.arguments, updateNodeData])

    return (
        // TODO: make sure it opens with one click...
        <>
            <CModal size="lg" visible={isOpen} onShow={verifyNode}
                onClose={() => {
                    if (isOpen){
                        toggle();
                    }
                    verifyNode();
                }}
            >
                <CModalHeader>Script</CModalHeader>
                <CModalBody>
                    <Table
                        data={[
                            {
                                key: 'Script Name',
                                value: script.name,
                            },
                            {
                                key: 'Description',
                                value: script.description,
                            },
                        ]}
                    />
                    <ArgumentsTable
                        onInput={argumentTableOnInput}
                        data={script.arguments}
                    />
                    <CollapseCard>
                        <Table
                            data={[
                                {
                                    key: 'Path',
                                    value: script.path,
                                },
                            ]}
                        />
                    </CollapseCard>
                </CModalBody>
            </CModal>
        </>
    )
}
