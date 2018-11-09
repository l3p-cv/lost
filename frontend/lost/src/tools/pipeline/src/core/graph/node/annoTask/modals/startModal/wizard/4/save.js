import WizardTabPresenter from "wizard/WizardTabPresenter"
import TabTreeView from "./TabTreeView"
import StartView from "../../../../views/StartView"
import $ from "jquery"
import "datatables.net"
import "datatables.net-buttons"
import d3 from 'd3';
import appModel from "../../AnnoTaskStartModalModel"
import "./graph.scss"
import swal from "sweetalert2"
import DATA from "./ExampleData"
import DATA2 from "./ExampleData2"




let ctrlPressed = false;
let model
let presenter
let labelDatatable
let initialized = false
let counter = 0
let eachRecursive = (obj, n) => {
    for (var k in obj) {
        if (obj.id === n.parentLeafId) {
            obj.children = []
            obj.children.push(n)
        }
        if (typeof obj[k] === "object" && obj[k] !== null) {
            eachRecursive(obj[k], n);
        } else {}
    }
}



class TabTreePresenter extends WizardTabPresenter {
    constructor(getPresenter) {
        super()
        model = getPresenter.model
        presenter = getPresenter
        this.view = new TabTreeView(model)
        appModel.controls.show4.on("update", (data) => this.loadTemplate(data))

        // change modal size
        $(this.view.nav.refs["a"]).on("click", () => {

            if (initialized) {
                $("#anno-task-modal").addClass("modal-anno-Task-step4")
                $("#anno-task-modal").removeClass("modal-anno-Task-step3")
            }
        })

        $(window).keydown(function (evt) {
            if (evt.which === 17) {
                ctrlPressed = true
            }
        }).keyup(function (evt) {
            if (evt.which === 17) {
                ctrlPressed = false;
            }
        });


        labelDatatable = $(this.view.html.refs["label-datatable"]).DataTable({
            columnDefs: [{
                targets: [0],
                visible: false,
            }],
            "paging": false,
            "info": false,
            "searching": false
        });

        // DELETE ROW
        $(this.view.html.refs["label-datatable"]).on("click", "span", (e) => {

            let id = labelDatatable.row($(e.currentTarget).parent()).data()[0]
            labelDatatable.row($(e.currentTarget).parents('tr')).remove().draw()
            var index = model.post.annoTask.labelLeaves.indexOf(model.post.annoTask.labelLeaves.find(o => o.id === id));
            if (index > -1) {
                model.post.annoTask.labelLeaves.splice(index, 1);
                model.meta.labelLeaves.splice(index, 1)

                presenter.view = new StartView(model)
            }
            if (labelDatatable.data().count() === 0) {
                $(this.view.html.refs["label-datatable"]).hide()
                $(this.view.html.refs["instruction"]).fadeIn()
            }
        })
        // INPUT MAX LABEL
        $(this.view.html.refs["label-datatable"]).on("input", "tr", (e) => {
            let id = labelDatatable.row($(e.currentTarget)).data()[0]
            var index = model.post.annoTask.labelLeaves.indexOf(model.post.annoTask.labelLeaves.find(o => o.id === id));
            model.post.annoTask.labelLeaves[index].maxLabels = parseInt($(e.currentTarget).find("input").val())
        });


    }
    isValidated() {
        return true
    }




    loadTemplate(getData) {
        // init
        console.log('=================getData===================');
        console.log(getData);
        console.log('====================================');
        this.show()
        $(this.view.html.refs["label-datatable"]).hide()
        $(this.view.html.refs["instruction"]).show()
        model.post.annoTask.labelLeaves = []
        model.meta.labelLeaves = []
        let TabTreePresenter = this
         $(this.view.html.refs["tree-container"]).empty()
        // Toggle children on click.


        let json = {}
        json.name = getData.name
        json.depth = 0
        json.id = 11
        json.x= 248
        json.x0 = 248
        json.y = 0
        json.y0 = 0
        json.children = []
        let counter = 0
        getData.labelLeaves.forEach((n) => {
            if (n.parentLeafId === null) {
                json.children.push({
                    id: n.id,
                    name: n.name,
                    parentLeafId: n.parentLeafId,
                    userName: n.userName,
                    leafId: n.leafId,
                })
            }
            try {
                eachRecursive(json.children, n)
            } catch (err) {
                swal(
                    'Error',
                    'Something went wrong. Please reload the Page',
                    'error'
                )
                throw new Error(err)
            }
        })

        console.log('===========json=========================');
        console.log(json);
        console.log('====================================');

        console.log('=========Example DATA===========================');
        console.log(DATA);
        console.log('====================================');

        let dataD3 = DATA


        if(initialized){
            dataD3 = json
        }

        console.log('===============dataD3 anfang=====================');
        console.log(dataD3);
        console.log('====================================');
        // Graph

        function click(d) {
            if (ctrlPressed) {
                $(TabTreePresenter.view.html.refs["label-datatable"]).fadeIn()
                $(TabTreePresenter.view.html.refs["instruction"]).hide()
                let id = null
                if (model.post.annoTask.labelLeaves.find(o => o.id === d.id) === undefined) {
                    id = parseInt(d.id)
                    model.post.annoTask.labelLeaves.push({
                        id: parseInt(d.id),
                        maxLabels: 1
                    })
                    labelDatatable.row.add(
                        [
                            id,
                            d.name,
                            `<input data-ref=${d.id} class='labelmax form-control'  
                                     type='number' name='max_label' min='0' max='99' value='1'>`,
                            `<span data-ref=${d.id} class = "delete-labelLeave annotask-span-modal-default bg-red">
                                     <i class="fa fa-times fa-lg" aria-hidden="true"></i>
                                     </span>`
                        ]).draw(false)

                    model.meta.labelLeaves.push({
                        name: d.name
                    })
                    presenter.view = new StartView(model)
                }
            } else {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
        }

        var margin = {
                top: 20,
                right: 120,
                bottom: 20,
                left: 120
            },
            width = $("#tree-container").width(),

            height = $("#tree-container").height();
        var i = 0,
            duration = 750

        var tree = d3.layout.tree()
            .size([height, width]);

        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.y, d.x];
            });

        var zoom = d3.behavior.zoom()
            .on("zoom", zoomed);

        function zoomed() {
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        var svg = d3.select("#tree-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            //if (error) throw error;
            dataD3.x0 = height / 2;
            dataD3.y0 = 0;

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }
            dataD3.children.forEach(collapse);
            update(dataD3);

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {
            // Compute the new tree layout.
            var nodes = tree.nodes(dataD3).reverse(),
                links = tree.links(nodes);

            //  Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", click);


            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });
            nodeEnter.append("text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                })
                .style("fill", "black");

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
            console.log('===============dataD3 ende=====================');
            console.log(dataD3);
            console.log('====================================');
            initialized = true
        }


        // $(this.view.html.refs["table-container"]).empty()
        // $(this.view.html.refs["label-datatable"]).html(
        //     `

        //     `)


    }


}
export default TabTreePresenter