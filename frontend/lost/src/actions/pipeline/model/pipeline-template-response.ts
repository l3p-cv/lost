import { Model } from '../../inference-model/model-api'

export interface PipelineTemplateResponse {
    id: number
    description: string
    author: string
    namespace: string
    name: string
    availableLabelTrees: AvailableLabelTree[]
    availableGroups: AvailableGroup[]
    elements: PipelineTemplateElement[]
}

export interface AvailableGroup {
    id: number
    name: string
    groupName: string
    isUserDefault: boolean
}

export interface AvailableLabelTree {
    idx: number
    name: string
    abbreviation: null | string
    description: string
    timestamp: null
    external_id: null | string
    is_deleted: null
    parent_leaf_id: number | null
    is_root: boolean | null
    group_id: number | null
    color: null | string
    children: AvailableLabelTree[]
}

export interface PipelineTemplateElement {
    peN: number
    peOut: number[] | null
    datasource?: Datasource
    script?: Script
    annoTask?: AnnoTask
    loop?: Loop
    dataExport?: DataExport
}

export interface AnnoTask {
    name: string
    type: string
    instructions: string
    configuration: Configuration
}

export interface Configuration {
    tools: Tools
    annos: Annos
    img: Img
    type: string
    showProposedLabel: boolean
    addContext: number
    drawAnno: boolean
    inferenceModel?: Model
}

export interface Annos {
    multilabels: boolean
    actions: AnnosActions
    minArea: number
}

export interface AnnosActions {
    draw: boolean
    label: boolean
    edit: boolean
}

export interface Img {
    multilabels: boolean
    actions: ImgActions
}

export interface ImgActions {
    label: boolean
}

export interface Tools {
    point: boolean
    line: boolean
    polygon: boolean
    bbox: boolean
    junk: boolean
    sam: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DataExport {}

export interface Datasource {
    name: string
    type: string
    fileTree: DataExport
    filesystems: Filesystem[]
}

export interface Filesystem {
    name: string
    id: number
    rootPath: string
    permission: string
    fsType: string
}

export interface Loop {
    maxIteration: null
    peJumpId: number
}

export interface Script {
    path: string
    description: string
    name: string
    arguments: Arguments | null
    id: number
    envs: string
}

export interface Arguments {
    valid_imgtypes: ImgBatch
    model_name: ImgBatch
    url: ImgBatch
    port: ImgBatch
    img_batch: ImgBatch
}

export interface ImgBatch {
    value: string
    help: string
}
