import WizardTabView from "wizard/WizardTabView"
import $ from "jquery"
import "datatables.net"
import "datatables.net-buttons"

class TabUserView extends WizardTabView {
    constructor(model){
        // the config object can be declared outside
        // of the class or directly into the super call aswell.
        let config = {
            title: " ",
            icon: "fa fa-user fa-1x",
            content: `
            <div class="container-fluid">            
              <table data-ref ="dataTableUser" class="table table-striped table-bordered" cellspacing="0" width="100%"></table>
            </div>
            `,
        }
        super(config)

    }
}
export default TabUserView

/* Dont DELETE DEPRECATED NAME HEADER
<h3 > Selected User:  <span style = "color: red;" data-ref="spanUser"><span> </h4>  
*/


/* DONT DELETE GROUP TABEL
</div>
<div class="col-sm-6"> 
<h3> Select Group </h3>
<h4> Selected Group: <span style = "color: red;" data-ref="spanGroup"><span> </h4>                            
<table data-ref ="dataTableGroup" class="table table-striped table-bordered" cellspacing="0" width="100%"></table>
</div>
</div>

*/