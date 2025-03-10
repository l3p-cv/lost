import { CCol, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import { Form, FormGroup, Input, Label } from 'reactstrap'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface UserInfoProps {
    nodeId: string
}

export const AnnoTaskInfo = ({ nodeId }: UserInfoProps) => {
    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const { updateNodeData } = useReactFlow()

    return (
        <div>
            <h4 className="mb-3 text-center">Task Information</h4>
            <CRow className="justify-content-center">
                <CCol sm="6">
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <FormGroup>
                            <Label for="name" className="text-start">
                                Name
                            </Label>
                            <HelpButton
                                id="anno-start-name"
                                text="Give your AnnotationTask a name. The name can also be seen by your annotators."
                            />
                            <Input
                                defaultValue={annoTaskNodeData.name}
                                onChange={(e) =>
                                    updateNodeData(nodeId, { name: e.target.value })
                                }
                                type="text"
                                name="name"
                                id="name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="instruction" className="text-start">
                                Instructions
                            </Label>
                            <HelpButton
                                id="anno-start-desc"
                                text="Give instructions / hints to your annotators so they know what to do."
                            />
                            <Input
                                defaultValue={annoTaskNodeData.instructions}
                                onChange={(e) =>
                                    updateNodeData(nodeId, {
                                        instructions: e.target.value,
                                    })
                                }
                                type="textarea"
                                name="instruction"
                                id="instruction"
                            />
                        </FormGroup>
                    </Form>
                </CCol>
            </CRow>
        </div>
    )
}
