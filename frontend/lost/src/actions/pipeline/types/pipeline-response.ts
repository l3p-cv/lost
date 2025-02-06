export interface PipelineResponse {
    elements: PipelineResponseElement[]
    id: number
    name: string
    description: string
    managerName: string
    templateId: number
    timestamp: Date
    isDebug: boolean
    logfilePath: string
    progress: string
    startDefinition: StartDefinition
}

export interface PipelineResponseElement {
    id: number
    peN: number
    peOut: number[]
    state: string
    datasource?: LiveDatasource
    script?: LiveScript
    annoTask?: LiveAnnoTask
    loop?: LiveLoop
    dataExport?: unknown[]
}

export interface LiveAnnoTask {
    id: number
    name: string
    type: string
    userName: string
    progress: number
    imgCount: number
    annotatedImgCount: number
    instructions: string
    configuration: Configuration
    labelLeaves: LiveLabelLeaf[]
}

export interface Configuration {
    tools: Tools
    annos: Annos
    img: Img
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
}

export interface LiveLabelLeaf {
    id: number
    name: string
    color: null
}

export interface LiveDatasource {
    id: number
    rawFilePath: string
}

export interface LiveLoop {
    id: number
    maxIteration: null
    iteration: number
    isBreakLoop: boolean
    peJumpId: number
}

export interface LiveScript {
    id: number
    isDebug: boolean
    debugSession: null
    name: string
    description: string
    path: string
    arguments: Arguments | null
    envs: string
    progress: number | null
    errorMsg: null | string
    warningMsg: null
    logMsg: null
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

export interface StartDefinition {
    name: string
    description: string
    elements: StartDefinitionElement[]
    templateId: number
}

export interface StartDefinitionElement {
    peN: number
    datasource?: FluffyDatasource
    script?: FluffyScript
    annoTask?: FluffyAnnoTask
    loop?: FluffyLoop
    dataExport?: unknown
}

export interface FluffyAnnoTask {
    name: string
    type: string
    instructions: string
    configuration: Configuration
    assignee: string
    workerId: number
    labelLeaves: FluffyLabelLeaf[]
    selectedLabelTree: number
}

export interface FluffyLabelLeaf {
    id: number
    maxLabels: string
}

export interface FluffyDatasource {
    rawFilePath: null
    selectedPath: string
    fs_id: number
}

export interface FluffyLoop {
    maxIteration: null
    peJumpId: number
}

export interface FluffyScript {
    arguments: Arguments | null
    description: string
    envs: string
    id: number
    name: string
    path: string
    isDebug: boolean
}
