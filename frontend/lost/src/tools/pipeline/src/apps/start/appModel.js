import { Observable } from 'l3p-frontend'

export default {
    isDebug: undefined,
    data: {
        pipelineTemplates: new Observable({}),
    },
    state: {
        selectedTemplateId: new Observable(-1),	// used?
        selectedTemplate: new Observable({}),
        checkNodesValidation: new Observable(false),
        token: undefined,
    },
    controls: {
        show1: new Observable(false),
        show2: new Observable(false),
        show3: new Observable(false),
        show4: new Observable(false),
    },
}
