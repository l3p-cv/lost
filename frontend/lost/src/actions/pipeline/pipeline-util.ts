import { Edge, MarkerType, Node } from '@xyflow/react'
import {
  AnnoTaskNodeData,
  DatasourceNodeData,
  ScriptNodeData,
} from '../../containers/pipeline/start/nodes'
import { Element } from './model/pipeline-request'
import { PipelineResponseElement } from './model/pipeline-response'
import {
  PipelineTemplateElement,
  PipelineTemplateResponse,
} from './model/pipeline-template-response'

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
      } as DatasourceNodeData
    } else if (el.script) {
      type = 'scriptNode'
      data = {
        name: el.script.name,
        arguments: el.script.arguments,
        verified: true,
      } as ScriptNodeData
    } else if (el.annoTask) {
      type = 'annoTaskNode'
      data = {
        name: el.annoTask.name,
        type: el.annoTask.type,
        verified: false,
        instructionId: el.annoTask.instructionId,
        configuration: el.annoTask.configuration,
        labelTreeGraph: {
          nodes: [],
          edges: [],
        },
      } as AnnoTaskNodeData
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

export const getFormattedPipelineRequestElements = (
  nodes: Node[],
  templateData: PipelineTemplateResponse,
): Element[] => {
  const result: Element[] = []

  for (const element of templateData.elements) {
    const node = nodes.find((n) => n.id === element.peN.toString())
    if (node) {
      const el: Element = {
        peN: element.peN,
      }

      if (element.datasource) {
        const data = node.data as DatasourceNodeData
        el.datasource = {
          rawFilePath: null,
          selectedPath: data.selectedPath,
          fs_id: data.fsId,
        }
      }

      if (element.script) {
        const data = node.data as ScriptNodeData
        el.script = {
          arguments: data.arguments,
          description: element.script.description,
          envs: element.script.envs,
          id: element.script.id,
          isDebug: false,
          name: element.script.name,
          path: element.script.path,
        }
      }

      if (element.annoTask) {
        const data = node.data as AnnoTaskNodeData
        el.annoTask = {
          name: data.name,
          type: data.type,
          instructionId: data.instructionId,
          configuration: data.configuration,
          assignee: data.selectedUserGroup!.name,
          workerId: data.selectedUserGroup!.id,
          labelLeaves: data.labelTreeGraph.nodes
            .filter((node) => node.data.selectedAsParent)
            .map((node) => ({
              id: parseInt(node.id),
              maxLabels: '3',
            })),
          selectedLabelTree: data.selectedLabelTree!.idx,
        }

        if (data.selectedDataset) {
          el.annoTask.storage = {
            datasetId: data.selectedDataset.value,
          }
        }
      }

      if (element.loop) {
        const data = node.data as { maxIteration: number }
        el.loop = {
          maxIteration: data.maxIteration === -1 ? null : data.maxIteration,
          peJumpId: element.loop.peJumpId,
        }
      }

      if (element.dataExport) {
        el.dataExport = {}
      }

      result.push(el)
    }
  }
  return result
}
