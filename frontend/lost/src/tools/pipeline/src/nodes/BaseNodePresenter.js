
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
    }
    update(){
        // recreate fragment
        if(this.initialized){
            // get all real current node html content
            let content = $(this.view.parentNode).find('foreignObject')[0].firstElementChild.childNodes
			
            // and add it to a new fragment
            this.fragment = document.createDocumentFragment()
            content.forEach(n => this.fragment.appendChild(n))

            // then rerender the node by adding it again 
            this.graph.updateNode(this)
        } else {
            throw new Error('only update the node after it was initialized.')
        }
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
		// update the views root element reference, cause it gets lost when appending to dagreD3 graph.
		// Object.keys(this.view.html.refs).forEach(key => {
		// 	this.view.html.refs[key] = parentNode.querySelector(`[data-ref='${key}']`)
		// })
		this.view.html.root = parentNode

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