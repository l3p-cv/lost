import { NodeTemplate } from "pipRoot/l3pfrontend/index"


export default class ExampleStartView {
    constructor(model) {
        this.html = new NodeTemplate(`
            <div>
                <h1>START</h1>
                <h3 data-ref="title">${model.title}</h3>
                <p data-ref="info">${model.text.value}</p>
            </div>
        `)
        // The parent node gets defined after adding the node to
        // the graph by the nodes presenter.
        // All view events will be delegated to the parent node.
        this.parentNode = undefined
    }
    setInfoText(text) {
        // all changes need to be delegated from parentNode to 
        // the actual target, cause all references or event hanlders
        // will get lost after adding the node to the graph.
        // still searching for a way to fix it at dagre-d3 fork.
        $(this.parentNode).find("[data-ref='info']")[0].textContent = text
    }
}