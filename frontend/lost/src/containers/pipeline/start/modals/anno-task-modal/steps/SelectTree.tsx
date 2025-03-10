import { CCol, CRow } from '@coreui/react'
import { useNodesData, useReactFlow } from '@xyflow/react'
import Select from 'react-select'
import { Form, FormGroup, Label } from 'reactstrap'
import { AvailableLabelTree } from '../../../../../../actions/pipeline/model/pipeline-template-response'
import HelpButton from '../../../../../../components/HelpButton'
import { AnnoTaskNodeData } from '../../../nodes'

interface SelectTreeProps {
    nodeId: string
    availableLabelTrees: AvailableLabelTree[]
}

export const SelectTree = ({ nodeId, availableLabelTrees }: SelectTreeProps) => {
    const { updateNodeData } = useReactFlow()
    const nodeData = useNodesData(nodeId)
    const annoTaskNodeData = nodeData?.data as AnnoTaskNodeData

    const selectTree = (selectedOption) => {
        if (!selectedOption) return

        updateNodeData(nodeId, {
            selectedLabelTree: selectedOption,
            labelTreeGraph: {
                nodes: [],
                edges: [],
            },
        })
    }

    return (
        <div>
            <h4 className="mb-3 text-center">Label Tree Selection</h4>
            <CRow className="justify-content-center">
                <CCol sm="6">
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <FormGroup>
                            <Label for="treeSelect" className="text-start">
                                Label Tree
                            </Label>
                            <HelpButton
                                id="label-tree-select"
                                text="Choose a label tree to categorize your annotations. You can select the labels in the next step."
                            />
                            <Select
                                options={availableLabelTrees}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.idx.toString()}
                                onChange={selectTree}
                                placeholder="Select a label tree..."
                                id="treeSelect"
                                defaultValue={annoTaskNodeData.selectedLabelTree}
                            />
                        </FormGroup>
                    </Form>
                </CCol>
            </CRow>
        </div>
    )
}
