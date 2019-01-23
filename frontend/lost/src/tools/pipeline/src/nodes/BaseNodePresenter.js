
export default class BaseNodePresenter {
    /**
     * This constructor creates a Graph-Node.
     * 
     * The subclass will need to create a model, view, and a modal.
     * The model is generic but view and modal differ.
     * @param {*} graph 
     */
    constructor(params) {
		const { graph, model, view, modal } = params
		this.model = model
		this.view = view
        this.graph = graph
		// modal is optional.
		if(modal){
	        this.modal = modal
		}
        this.initialized = false
		// MODEL AND VIEW BINDINGS: are in init Method here for reasons.
    }
	/**
     * This method binds all view events.
     * Must be overriden!
     */
    initViewBinding(){}

    /**
     * This method binds all model updates to view updates.
     * Must be overriden!
     */
    initModelBinding(){}

    /**
     * This method finishs the initialization of the Graph-Node. 
     * After the Graph-Node view was added to the graph, this method is 
     * called and passed the resulting root DOM-Node reference. 
     * 
     * No need to touch this method.
     * 
     * @param {*} parentNode The root node of this node inside the graph. 
     */
    init(parentNode: HTMLElement){
		console.log('init node')
		// update the views root element reference, cause it gets lost when appending to dagreD3 graph.
		// this.view.html.root = parentNode
		// Object.keys(this.view.html.refs).forEach(key => {
		// 	// console.log("updating ref: ", key)
		// 	// console.log("updating to: ", this.view.html.root.querySelector(`[data-ref='${key}']`))
		// 	this.view.html.refs[key] = this.view.html.root.querySelector(`[data-ref='${key}']`)
		// })
		// not called elsewhere...
		this.view.updateRefs(parentNode)

		// bind state and progress updates to view, in case the node has such.
		if(this.model.status){
			this.model.status.on('update', status => this.view.updateStatus(status))
		}
		if(this.model.progress){
			this.model.progress.on('update', progress => this.view.updateProgress(progress))
		}
        
        // open modal on double click.
        $(this.view.html.root).on('dblclick', () => {
			if(this.modal){
				$(this.modal.html.root).modal()                    
			}
        })
        
		// execute specific subclass view bindings.
        this.initViewBinding()
		
		// execute specific subclass model bindings.
        this.initModelBinding()

        this.initialized = true
    }
	isValidated(){
		return this.model.isValidated()
	}
}