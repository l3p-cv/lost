import { WizardTabView } from 'l3p-frontend'

import './PipelineGraph.scss'


class PipelineGraphTab extends WizardTabView {
	constructor(){
		super({
			title: 'Inspect Pipeline Elements',
			icon: 'fa fa-pencil',
			content: /*html*/`
				// update indicator.
				<div class='update-indicator'>
					<label data-ref='update-label'>update</label>
				</div>

				// toolbar (customized bootstrap flexbox).
				<div class='toolbar'>
					<div class='btn-group toolbar'>
						<button class='btn btn-default' data-ref='btn-toggle-infobox' id='pipe-infobox'>
							<i class='fa fa-info' data-ref='btn-toggle-infobox-icon'></i>
							<span>Pipe Info<span>
						</button>
						<button class='btn btn-default' data-ref='btn-delete-pipeline'>
							<i class='fa fa-trash'></i>
							<span>Delete Pipeline<span>
						</button>
						<button class='btn btn-default' data-ref='btn-download-logfile'>
							<i class='fa fa-download'></i>
							<span>Download Logfile<span>
						</button>
						<a data-ref="download-hidden-logfile-btn" hidden href=''></a>
						<button class='btn btn-default' data-ref='btn-pause-pipe'>
							<i class='fa fa-pause'></i>
							<span>Pause Pipeline<span>
						</button>
						<button class='btn btn-default' data-ref='btn-play-pipe'>
							<i class='fa fa-play'></i>
							<span>Continue Pipeline<span>
						</button>
						<button class='btn btn-default' data-ref='btn-regenerate-pipe'>
							<i class='fa fa-copy'></i>
							<span>Regenerate Pipeline<span>
						</button>
					</div>
				</div>

				// graph container.
				<div data-ref='dagre'></div>
			`,
		})
	}
	togglePlayPause({ running }){
		if(running){
			// enable pause button.
			this.html.refs['btn-pause-pipe'].classList.toggle('disabled', false)
			// disable play button.
			this.html.refs['btn-play-pipe'].classList.toggle('disabled', true)
		} else {
			// enable play button.
			this.html.refs['btn-play-pipe'].classList.toggle('disabled', false)
			// disable pause button.
			this.html.refs['btn-pause-pipe'].classList.toggle('disabled', true)
		}
	}
	toggleInfoBox({ enabled }){
		if(enabled){
			this.html.refs['btn-toggle-infobox-icon'].classList.toggle('fa-toggle-on', true)
			this.html.refs['btn-toggle-infobox-icon'].classList.toggle('fa-toggle-off', false)
		} else {
			this.html.refs['btn-toggle-infobox-icon'].classList.toggle('fa-toggle-on', false)
			this.html.refs['btn-toggle-infobox-icon'].classList.toggle('fa-toggle-off', true)
		}
	}
}
export default new PipelineGraphTab()