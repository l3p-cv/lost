import { Observable } from 'l3p-frontend'

export default {
    state: {
        pipelines: new Observable({}),
        selectedPipeline: new Observable({}),
		// auth token from redux.
		token: undefined,
    },
}
