import { Observable } from 'l3p-frontend'

export default {
	reactComponent: {
		token: undefined,
	},
	options: {
		polling: new Observable({
		 	enabled: false,
			rate: 1000,
		})
	},
    state: {
        pipelines: new Observable({}),
		selectedPipeline: new Observable({}),
		infoBox: new Observable({display: false})
    },
}
