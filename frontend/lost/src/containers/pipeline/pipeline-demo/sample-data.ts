import { Edge, MarkerType, Node, Position } from '@xyflow/react'

export const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 500, y: 200 },
        data: { label: 'Hello', handlePosition: Position.Left },
        type: 'datasourceNode',
    },
    {
        id: '2',
        position: { x: 500, y: 400 },
        data: { label: 'World' },
        type: 'annoTaskNode',
    },

    {
        id: '3',
        position: { x: 500, y: 600 },
        data: { label: 'World' },
        type: 'dataExportNode',
    },
    {
        id: '4',
        position: { x: 800, y: 800 },
        data: { label: 'World' },
        type: 'loopNode',
    },
]

export const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        markerEnd: {
            type: MarkerType.Arrow,
            width: 30,
            height: 30,
        },
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
        markerEnd: {
            type: MarkerType.Arrow,
            width: 30,
            height: 30,
        },
    },
    {
        id: 'e3-4',
        source: '3',
        target: '4',
        markerEnd: {
            type: MarkerType.Arrow,
            width: 30,
            height: 30,
        },
    },

    {
        id: 'e4-1',
        source: '4',
        target: '1',
        markerEnd: {
            type: MarkerType.Arrow,
            width: 30,
            height: 30,
            color: 'red',
        },
        style: { stroke: 'red' },
        animated: true,
        type: 'smoothstep',
    },
]
