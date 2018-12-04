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
		const { header, footer, validated } = params
		const { icon, title, colorInvalidated, colorValidated } = header
		let { content } = params
		content = Array.isArray(content) ? content : [ content ]

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
				// footer is optional and contains text only.
				${footer ? /*html*/`
					<div class='card-footer' data-ref='footer'>${footer}</div>
				` : ``}
            </div>
		`)
		this.setColor(validated)
	}
	setColor(validated){
		console.log("setcolor:", validated)
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
}