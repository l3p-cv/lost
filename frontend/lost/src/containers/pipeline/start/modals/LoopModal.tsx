import { useNodesData, useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'
import { Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import Table from '../../globalComponents/modals/Table'
import { LoopNodeData } from '../nodes'

interface LoopModalProps {
    nodeId: string
    isOpen: boolean
    toggle: () => void
}

export const LoopModal = ({ nodeId, isOpen, toggle }: LoopModalProps) => {
    const nodeData = useNodesData(nodeId)
    const loopNodeData = nodeData?.data as LoopNodeData

    const { updateNodeData } = useReactFlow()

    const onInput = useCallback(
        (e) => {
            const number = Number(e.target.value)
            if (!isNaN(number)) {
                updateNodeData(nodeId, {
                    maxIteration: number,
                })
            }
        },
        [nodeId, updateNodeData],
    )

    return (
        <>
            <Modal size="lg" isOpen={isOpen} toggle={toggle}>
                <ModalHeader>Loop</ModalHeader>
                <ModalBody>
                    <Table
                        data={[
                            {
                                key: 'Max Iteration',
                                value:
                                    typeof loopNodeData.maxIteration === 'number' ? (
                                        <Input
                                            min={-1}
                                            onInput={onInput}
                                            defaultValue={loopNodeData.maxIteration}
                                            placeholder="Amount"
                                            type="number"
                                            step="1"
                                        />
                                    ) : (
                                        'Infinity'
                                    ),
                            },
                        ]}
                    />
                </ModalBody>
                <ModalFooter />
            </Modal>
        </>
    )
}
