export default {
    title: "Datasource Typ Model Trees",
    content: `
        <div class="row">
            <table data-ref="table-model-trees" class="table table-striped table-bordered" cellspacing="0" width="100%"></table>
                
                <div class="row">
                
                <div class="col-xs-4">
                    <div data-ref="div-dropdown" class="dropdown center">
                        <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Modelleaves
                            <span class="caret"></span> 
                        </button>
                        <ul data-ref="dropdown" class="dropdown-menu">
                        </ul>
                    </div>
                </div>
                
                <div class="row">
                
                <table class="table table-hover">
                    <tbody data-ref="leave-information"></tbody>
                </table>
            </table>
        </div>
    `
}