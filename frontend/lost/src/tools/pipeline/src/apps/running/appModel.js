import { Observable } from "pipRoot/l3pfrontend/index"

export default {
    isDebug: undefined,
    isCompleted: undefined,
    environment: {
        rules: {
        },
    },
    state: {
        selectedTemplateId: new Observable(-1),
        selectedTemplate: new Observable({}),
        selectedPipe: new Observable({}),
    },
    controls: {
    },
    data: {
        pipelineTemplates: new Observable({}),
    }
}
