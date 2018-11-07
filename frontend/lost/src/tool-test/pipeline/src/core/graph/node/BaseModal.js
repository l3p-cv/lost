import { NodeTemplate } from "l3p-core"
import { log } from "util";
import { ENGINE_METHOD_CIPHERS } from "constants";


const DEFAULTS = {
    id: "",
    visible: true,
    title: "no title", 
    content: "<h4>no content</h4>",
}

export default class BaseModal {
    constructor(params: any){
        // if any object memeber of the params is not given,
        // use the default member to be able to destructure the params.
        params = Object.assign({}, DEFAULTS, params)
        // const { id, class, visible, title, content } = params
        this.visible = params.visible
        this.view = new NodeTemplate(`
            <div class="modal fade" id="${params.id}">
                <div data-ref="outerModal" class="modal-dialog" id="style-${params.id}" role="dialog">
                    <div class="modal-content">                        
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title">${params.title}</h4>
                        </div>
                        <div id="modal-body" class="modal-body">
                            ${params.content}
                        </div>                       
                        <div class="modal-footer">
                            <button 
                                type="submit" 
                                class="btn btn-primary" 
                                data-dismiss="modal" 
                            >OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `)
        $(document).keypress(function(e) {
            if(e.which == 13) {                
                $('.modal').modal('hide');   
            }         
        });
    }    
}