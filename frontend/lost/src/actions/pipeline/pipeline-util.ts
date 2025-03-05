import { Edge, MarkerType, Node } from '@xyflow/react'
import { PipelineResponseElement } from './model/pipeline-response'
import { PipelineTemplateElement } from './model/pipeline-template-response'

const getReactFlowEdges = (
    elements: PipelineResponseElement[] | PipelineTemplateElement[],
) => {
    const edges: Edge[] = []
    elements.forEach((el) => {
        if (el.peOut) {
            el.peOut.forEach((targetId) => {
                edges.push({
                    id: `e${el.peN}-${targetId}`,
                    source: el.peN.toString(),
                    target: targetId.toString(),
                    markerEnd: {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                    },
                    style: { strokeWidth: 2 },
                })
            })
        }
        if (el.loop && el.loop.peJumpId !== null) {
            edges.push({
                id: `e${el.peN}-${el.loop.peJumpId}`,
                source: el.peN.toString(),
                target: el.loop.peJumpId.toString(),
                markerEnd: {
                    type: MarkerType.Arrow,
                    width: 20,
                    height: 20,
                    color: 'red',
                },
                style: { stroke: 'red', strokeWidth: 2 },
                animated: true,
                type: 'smoothstep',
            })
        }
    })
    return edges
}

export const parseLiveElementsToReactFlow = (elements: PipelineResponseElement[]) => {
    const nodes: Node[] = elements.map((el) => {
        let type = ''
        let data = {}
        if (el.datasource) {
            type = 'datasourceNode'
            data = {
                state: el.state,
            }
        } else if (el.script) {
            type = 'scriptNode'
            data = {
                name: el.script.name,
                progress: el.script.progress,
                state: el.state,
            }
        } else if (el.annoTask) {
            type = 'annoTaskNode'
            data = {
                name: el.annoTask.name,
                progress: el.annoTask.progress,
                state: el.state,
            }
        } else if (el.loop) {
            type = 'loopNode'
            data = {
                maxIteration: el.loop.maxIteration,
                state: el.state,
            }
        } else if (el.dataExport) {
            data = {
                state: el.state,
            }
            type = 'dataExportNode'
        }

        return {
            id: el.peN.toString(),
            position: { x: 0, y: 0 }, // default positioning
            data,
            type,
        }
    })

    const edges = getReactFlowEdges(elements)

    return { nodes, edges }
}

export const parseTemplateElementsToReactFlow = (elements: PipelineTemplateElement[]) => {
    const nodes: Node[] = elements.map((el) => {
        let type = ''
        let data = {}
        if (el.datasource) {
            type = 'datasourceNode'
            data = {
                type: el.datasource.type,
                verified: false,
                selectedPath: '',
            }
        } else if (el.script) {
            type = 'scriptNode'
            data = {
                name: el.script.name,
                arguments: el.script.arguments,
                verified: true,
            }
        } else if (el.annoTask) {
            type = 'annoTaskNode'
            data = {
                name: el.annoTask.name,
                type: el.annoTask.type,
                assignee: '',
                verified: false,
            }
        } else if (el.loop) {
            type = 'loopNode'
            data = {
                maxIteration: el.loop.maxIteration,
                verified: true,
            }
        } else if (el.dataExport) {
            data = {
                verified: true,
            }
            type = 'dataExportNode'
        }

        return {
            id: el.peN.toString(),
            position: { x: 0, y: 0 }, // default positioning
            data,
            type,
        }
    })

    const edges = getReactFlowEdges(elements)

    return { nodes, edges }
}
