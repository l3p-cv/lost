import { Observable } from 'l3p-frontend'

export default {
	options: {
		polling: new Observable({
		 	enabled: false,
			rate: 1000,
		})
	},
    state: {
        pipelines: new Observable({}),
        selectedPipeline: new Observable({}),
		// auth token from redux.
		token: undefined,
    },
}
