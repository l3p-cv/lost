import { WizardTabView } from 'l3p-frontend'

import './StartPipeline.scss'


class StartPipelineTab extends WizardTabView {
    constructor() {
        const config = {
            title: 'Start the Pipeline',            
            icon: 'fa fa-check',
            content: /*html*/`
				// INLINE STYLE...
                <div style='width: 50%;margin: 0 auto; text-align:center'>
                    <h3 class='title-start-pipeline-completed' >Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <button data-ref='btnStartPipe' type='button' class='btn btn-primary btn-lg'>
                        <i class='fa fa-play-circle-o fa-5x'></i>
                        Start Pipe
                    </button>
                </div>
            `,
        }
        super(config)
    }
}
export default new StartPipelineTab()