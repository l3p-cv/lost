import './BaseNodeStyle.scss'
import { NodeTemplate } from 'l3p-frontend'


const DEFAULTS = {
	header: {
		icon: undefined,
		title: '',
		colorInvalidated: undefined,	// bootstrap bg-colors
		colorValidated: undefined,		// bootstrap bg-colors
	},
	content: [],
	footer: undefined,
	validated: false,
}
export default class BaseNodeView {
	constructor(params){
		params = Object.assign({}, DEFAULTS, params)
		const { header, footer } = params
		const { icon, title, colorInvalidated, colorValidated } = header

		let { content, validated } = params
		content = Array.isArray(content) ? content : [ content ]
		// validated = validated || true

		// The parent node reference will be added by Graph.js calling BaseNodePresenter.init().
        this.parentNode = undefined

		// REWRITE COLORS TO USE FUNCTIONS ?
		// expose colors for methods
		this.colorInvalidated = colorInvalidated
		this.colorValidated = colorValidated

		// create html
		// could need some cleanup.
		this.html = new NodeTemplate(/*html*/`
			<div class='card pipeline-graph-node'>
				// color depends on validation.
				// icon is optional.
                <div class='card-header' data-ref='header'>
					${icon ? /*html*/`
						<i class='${icon}'></i>
					` : ``}
					<span>${title}</span>
                </div>
				// content derives from objects or html strings.
                <div class='card-body'>
					${content.map(row => {
						if(typeof(row) === 'object'){
							if(row.icon){
								return /*html*/`
									<i class='${row.icon}'></i>
								`
							}
							if(row.progress){
								return /*html*/`
									<div data-ref='progress-bar' class='progress-bar' role='progressbar'
                            			style='width:${row.progress}%'
									>
										<p data-ref='progress-bar-text' class='color-black'>
											${row.progress ? row.progress : 0}%
										<p>
                        			</div>
								`
							}
							if(row.attribute){
								return /*html*/`
									<div class='attribute'>${row.attribute}</div>
									<div ${row.ref ? `data-ref='${row.ref}'` : ''}>${row.value}</div>
								`
							}
						}
						return row
					}).join('\n')}
                </div>
				// footer shows status of running pipeline nodes.
				${footer ? /*html*/`
					<div class='card-footer' data-ref='footer'>
						<div data-ref='status' class='panel-footer 
							${ footer.state === 'script_error'   ? 'bg-red '  	: 	' ' }
							${ footer.state === 'pending'        ? 'bg-blue '  	: 	' ' }
							${ footer.state === 'in_progress'    ? 'bg-orange '	: 	' ' }
							${ footer.state === 'finished'       ? 'bg-green ' 	: 	' ' }
							'>
							<p2 data-ref='status-text' class='color-white footer-text'>${footer.text}</p2>
						</div>
					</div>
				` : ``}
            </div>
		`)
		this.setColor(validated)
	}
	updateRefs(refs: any){
		for(const ref in refs){
			this.html.refs[ref] = refs[ref]
		}
	}
	setColor(validated: Boolean){
		if(validated){
			if(this.colorValidated){
				this.html.refs['header'].classList.toggle(`bg-${this.colorInvalidated}`, false)
				this.html.refs['header'].classList.toggle(`bg-${this.colorValidated}`, true)
			}
		} else {
			if(this.colorInvalidated){
				this.html.refs['header'].classList.toggle(`bg-${this.colorValidated}`, false)
				this.html.refs['header'].classList.toggle(`bg-${this.colorInvalidated}`, true)
			}
		}
	}
	updateProgress(progress: Number){
		progress = progress ? progress : 0
		this.html.refs['progress-bar'].style.width = `${progress}%`
		this.html.refs['progress-bar-text'].textContent = `${progress}`
	}
	updateStaus(status: String){
		this.html.refs['status'].setAttribute('class', `panel-footer 
			${ status === 'script_error'   ? 'bg-red'      : '' }
			${ status === 'pending'        ? 'bg-blue'     : '' }
			${ status === 'in_progress'    ? 'bg-orange'   : '' }
			${ status === 'finished'       ? 'bg-green'    : '' }
		`)
		this.view.html.refs('status-text').textContent = status.replace('_', ' ')
	}
}