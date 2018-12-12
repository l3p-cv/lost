import { Observable } from 'l3p-frontend'

export default {
    state: {
        selectedTemplateId: new Observable(-1),
        selectedTemplate: new Observable({}),
        selectedPipe: new Observable({}),
    },
    data: {
        pipelineTemplates: new Observable({}),
    }
}
