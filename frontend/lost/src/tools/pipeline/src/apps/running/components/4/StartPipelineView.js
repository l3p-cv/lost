import { WizardTabView } from 'l3p-frontend'

class StartPipelineTab extends WizardTabView {
    constructor(){
        super({
            icon: 'fa fa-check',
            content: /*html*/`
				// INLINE STYLE...
                <div style='width: 50%;margin: 0 auto; text-align:center'>
                    <h3>Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <button id='startPipe' class='btn btn-primary btn-lg'>
                        <i class='fa fa-play-circle-o fa-5x'></i>
                        Start Pipe
                    </button>
                </div>
            `,
        })
    }
}
export default new StartPipelineTab()