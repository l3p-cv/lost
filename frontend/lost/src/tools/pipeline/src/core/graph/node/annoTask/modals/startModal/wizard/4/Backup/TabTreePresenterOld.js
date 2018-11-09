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

let DATA = {
    "name": "flare",
    "children": [{
        "name": "analytics",
        "children": [{
            "name": "cluster",
            "children": [{
                "name": "AgglomerativeCluster",
                "size": 3938
            }, {
                "name": "CommunityStructure",
                "size": 3812
            }, {
                "name": "HierarchicalCluster",
                "size": 6714
            }, {
                "name": "MergeEdge",
                "size": 743
            }]
        }, {
            "name": "graph",
            "children": [{
                "name": "BetweennessCentrality",
                "size": 3534
            }, {
                "name": "LinkDistance",
                "size": 5731
            }, {
                "name": "MaxFlowMinCut",
                "size": 7840
            }, {
                "name": "ShortestPaths",
                "size": 5914
            }, {
                "name": "SpanningTree",
                "size": 3416
            }]
        }, {
            "name": "optimization",
            "children": [{
                "name": "AspectRatioBanker",
                "size": 7074
            }]
        }]
    }, {
        "name": "animate",
        "children": [{
            "name": "Easing",
            "size": 17010
        }, {
            "name": "FunctionSequence",
            "size": 5842
        }, {
            "name": "interpolate",
            "children": [{
                "name": "ArrayInterpolator",
                "size": 1983
            }, {
                "name": "ColorInterpolator",
                "size": 2047
            }, {
                "name": "DateInterpolator",
                "size": 1375
            }, {
                "name": "Interpolator",
                "size": 8746
            }, {
                "name": "MatrixInterpolator",
                "size": 2202
            }, {
                "name": "NumberInterpolator",
                "size": 1382
            }, {
                "name": "ObjectInterpolator",
                "size": 1629
            }, {
                "name": "PointInterpolator",
                "size": 1675
            }, {
                "name": "RectangleInterpolator",
                "size": 2042
            }]
        }, {
            "name": "ISchedulable",
            "size": 1041
        }, {
            "name": "Parallel",
            "size": 5176
        }, {
            "name": "Pause",
            "size": 449
        }, {
            "name": "Scheduler",
            "size": 5593
        }, {
            "name": "Sequence",
            "size": 5534
        }, {
            "name": "Transition",
            "size": 9201
        }, {
            "name": "Transitioner",
            "size": 19975
        }, {
            "name": "TransitionEvent",
            "size": 1116
        }, {
            "name": "Tween",
            "size": 6006
        }]
    }, {
        "name": "data",
        "children": [{
            "name": "converters",
            "children": [{
                "name": "Converters",
                "size": 721
            }, {
                "name": "DelimitedTextConverter",
                "size": 4294
            }, {
                "name": "GraphMLConverter",
                "size": 9800
            }, {
                "name": "IDataConverter",
                "size": 1314
            }, {
                "name": "JSONConverter",
                "size": 2220
            }]
        }, {
            "name": "DataField",
            "size": 1759
        }, {
            "name": "DataSchema",
            "size": 2165
        }, {
            "name": "DataSet",
            "size": 586
        }, {
            "name": "DataSource",
            "size": 3331
        }, {
            "name": "DataTable",
            "size": 772
        }, {
            "name": "DataUtil",
            "size": 3322
        }]
    }, {
        "name": "display",
        "children": [{
            "name": "DirtySprite",
            "size": 8833
        }, {
            "name": "LineSprite",
            "size": 1732
        }, {
            "name": "RectSprite",
            "size": 3623
        }, {
            "name": "TextSprite",
            "size": 10066
        }]
    }, {
        "name": "flex",
        "children": [{
            "name": "FlareVis",
            "size": 4116
        }]
    }, {
        "name": "physics",
        "children": [{
            "name": "DragForce",
            "size": 1082
        }, {
            "name": "GravityForce",
            "size": 1336
        }, {
            "name": "IForce",
            "size": 319
        }, {
            "name": "NBodyForce",
            "size": 10498
        }, {
            "name": "Particle",
            "size": 2822
        }, {
            "name": "Simulation",
            "size": 9983
        }, {
            "name": "Spring",
            "size": 2213
        }, {
            "name": "SpringForce",
            "size": 1681
        }]
    }, {
        "name": "query",
        "children": [{
            "name": "AggregateExpression",
            "size": 1616
        }, {
            "name": "And",
            "size": 1027
        }, {
            "name": "Arithmetic",
            "size": 3891
        }, {
            "name": "Average",
            "size": 891
        }, {
            "name": "BinaryExpression",
            "size": 2893
        }, {
            "name": "Comparison",
            "size": 5103
        }, {
            "name": "CompositeExpression",
            "size": 3677
        }, {
            "name": "Count",
            "size": 781
        }, {
            "name": "DateUtil",
            "size": 4141
        }, {
            "name": "Distinct",
            "size": 933
        }, {
            "name": "Expression",
            "size": 5130
        }, {
            "name": "ExpressionIterator",
            "size": 3617
        }, {
            "name": "Fn",
            "size": 3240
        }, {
            "name": "If",
            "size": 2732
        }, {
            "name": "IsA",
            "size": 2039
        }, {
            "name": "Literal",
            "size": 1214
        }, {
            "name": "Match",
            "size": 3748
        }, {
            "name": "Maximum",
            "size": 843
        }, {
            "name": "methods",
            "children": [{
                "name": "add",
                "size": 593
            }, {
                "name": "and",
                "size": 330
            }, {
                "name": "average",
                "size": 287
            }, {
                "name": "count",
                "size": 277
            }, {
                "name": "distinct",
                "size": 292
            }, {
                "name": "div",
                "size": 595
            }, {
                "name": "eq",
                "size": 594
            }, {
                "name": "fn",
                "size": 460
            }, {
                "name": "gt",
                "size": 603
            }, {
                "name": "gte",
                "size": 625
            }, {
                "name": "iff",
                "size": 748
            }, {
                "name": "isa",
                "size": 461
            }, {
                "name": "lt",
                "size": 597
            }, {
                "name": "lte",
                "size": 619
            }, {
                "name": "max",
                "size": 283
            }, {
                "name": "min",
                "size": 283
            }, {
                "name": "mod",
                "size": 591
            }, {
                "name": "mul",
                "size": 603
            }, {
                "name": "neq",
                "size": 599
            }, {
                "name": "not",
                "size": 386
            }, {
                "name": "or",
                "size": 323
            }, {
                "name": "orderby",
                "size": 307
            }, {
                "name": "range",
                "size": 772
            }, {
                "name": "select",
                "size": 296
            }, {
                "name": "stddev",
                "size": 363
            }, {
                "name": "sub",
                "size": 600
            }, {
                "name": "sum",
                "size": 280
            }, {
                "name": "update",
                "size": 307
            }, {
                "name": "variance",
                "size": 335
            }, {
                "name": "where",
                "size": 299
            }, {
                "name": "xor",
                "size": 354
            }, {
                "name": "_",
                "size": 264
            }]
        }, {
            "name": "Minimum",
            "size": 843
        }, {
            "name": "Not",
            "size": 1554
        }, {
            "name": "Or",
            "size": 970
        }, {
            "name": "Query",
            "size": 13896
        }, {
            "name": "Range",
            "size": 1594
        }, {
            "name": "StringUtil",
            "size": 4130
        }, {
            "name": "Sum",
            "size": 791
        }, {
            "name": "Variable",
            "size": 1124
        }, {
            "name": "Variance",
            "size": 1876
        }, {
            "name": "Xor",
            "size": 1101
        }]
    }, {
        "name": "scale",
        "children": [{
            "name": "IScaleMap",
            "size": 2105
        }, {
            "name": "LinearScale",
            "size": 1316
        }, {
            "name": "LogScale",
            "size": 3151
        }, {
            "name": "OrdinalScale",
            "size": 3770
        }, {
            "name": "QuantileScale",
            "size": 2435
        }, {
            "name": "QuantitativeScale",
            "size": 4839
        }, {
            "name": "RootScale",
            "size": 1756
        }, {
            "name": "Scale",
            "size": 4268
        }, {
            "name": "ScaleType",
            "size": 1821
        }, {
            "name": "TimeScale",
            "size": 5833
        }]
    }, {
        "name": "util",
        "children": [{
            "name": "Arrays",
            "size": 8258
        }, {
            "name": "Colors",
            "size": 10001
        }, {
            "name": "Dates",
            "size": 8217
        }, {
            "name": "Displays",
            "size": 12555
        }, {
            "name": "Filter",
            "size": 2324
        }, {
            "name": "Geometry",
            "size": 10993
        }, {
            "name": "heap",
            "children": [{
                "name": "FibonacciHeap",
                "size": 9354
            }, {
                "name": "HeapNode",
                "size": 1233
            }]
        }, {
            "name": "IEvaluable",
            "size": 335
        }, {
            "name": "IPredicate",
            "size": 383
        }, {
            "name": "IValueProxy",
            "size": 874
        }, {
            "name": "math",
            "children": [{
                "name": "DenseMatrix",
                "size": 3165
            }, {
                "name": "IMatrix",
                "size": 2815
            }, {
                "name": "SparseMatrix",
                "size": 3366
            }]
        }, {
            "name": "Maths",
            "size": 17705
        }, {
            "name": "Orientation",
            "size": 1486
        }, {
            "name": "palette",
            "children": [{
                "name": "ColorPalette",
                "size": 6367
            }, {
                "name": "Palette",
                "size": 1229
            }, {
                "name": "ShapePalette",
                "size": 2059
            }, {
                "name": "SizePalette",
                "size": 2291
            }]
        }, {
            "name": "Property",
            "size": 5559
        }, {
            "name": "Shapes",
            "size": 19118
        }, {
            "name": "Sort",
            "size": 6887
        }, {
            "name": "Stats",
            "size": 6557
        }, {
            "name": "Strings",
            "size": 22026
        }]
    }, {
        "name": "vis",
        "children": [{
            "name": "axis",
            "children": [{
                "name": "Axes",
                "size": 1302
            }, {
                "name": "Axis",
                "size": 24593
            }, {
                "name": "AxisGridLine",
                "size": 652
            }, {
                "name": "AxisLabel",
                "size": 636
            }, {
                "name": "CartesianAxes",
                "size": 6703
            }]
        }, {
            "name": "controls",
            "children": [{
                "name": "AnchorControl",
                "size": 2138
            }, {
                "name": "ClickControl",
                "size": 3824
            }, {
                "name": "Control",
                "size": 1353
            }, {
                "name": "ControlList",
                "size": 4665
            }, {
                "name": "DragControl",
                "size": 2649
            }, {
                "name": "ExpandControl",
                "size": 2832
            }, {
                "name": "HoverControl",
                "size": 4896
            }, {
                "name": "IControl",
                "size": 763
            }, {
                "name": "PanZoomControl",
                "size": 5222
            }, {
                "name": "SelectionControl",
                "size": 7862
            }, {
                "name": "TooltipControl",
                "size": 8435
            }]
        }, {
            "name": "data",
            "children": [{
                "name": "Data",
                "size": 20544
            }, {
                "name": "DataList",
                "size": 19788
            }, {
                "name": "DataSprite",
                "size": 10349
            }, {
                "name": "EdgeSprite",
                "size": 3301
            }, {
                "name": "NodeSprite",
                "size": 19382
            }, {
                "name": "render",
                "children": [{
                    "name": "ArrowType",
                    "size": 698
                }, {
                    "name": "EdgeRenderer",
                    "size": 5569
                }, {
                    "name": "IRenderer",
                    "size": 353
                }, {
                    "name": "ShapeRenderer",
                    "size": 2247
                }]
            }, {
                "name": "ScaleBinding",
                "size": 11275
            }, {
                "name": "Tree",
                "size": 7147
            }, {
                "name": "TreeBuilder",
                "size": 9930
            }]
        }, {
            "name": "events",
            "children": [{
                "name": "DataEvent",
                "size": 2313
            }, {
                "name": "SelectionEvent",
                "size": 1880
            }, {
                "name": "TooltipEvent",
                "size": 1701
            }, {
                "name": "VisualizationEvent",
                "size": 1117
            }]
        }, {
            "name": "legend",
            "children": [{
                "name": "Legend",
                "size": 20859
            }, {
                "name": "LegendItem",
                "size": 4614
            }, {
                "name": "LegendRange",
                "size": 10530
            }]
        }, {
            "name": "operator",
            "children": [{
                "name": "distortion",
                "children": [{
                    "name": "BifocalDistortion",
                    "size": 4461
                }, {
                    "name": "Distortion",
                    "size": 6314
                }, {
                    "name": "FisheyeDistortion",
                    "size": 3444
                }]
            }, {
                "name": "encoder",
                "children": [{
                    "name": "ColorEncoder",
                    "size": 3179
                }, {
                    "name": "Encoder",
                    "size": 4060
                }, {
                    "name": "PropertyEncoder",
                    "size": 4138
                }, {
                    "name": "ShapeEncoder",
                    "size": 1690
                }, {
                    "name": "SizeEncoder",
                    "size": 1830
                }]
            }, {
                "name": "filter",
                "children": [{
                    "name": "FisheyeTreeFilter",
                    "size": 5219
                }, {
                    "name": "GraphDistanceFilter",
                    "size": 3165
                }, {
                    "name": "VisibilityFilter",
                    "size": 3509
                }]
            }, {
                "name": "IOperator",
                "size": 1286
            }, {
                "name": "label",
                "children": [{
                    "name": "Labeler",
                    "size": 9956
                }, {
                    "name": "RadialLabeler",
                    "size": 3899
                }, {
                    "name": "StackedAreaLabeler",
                    "size": 3202
                }]
            }, {
                "name": "layout",
                "children": [{
                    "name": "AxisLayout",
                    "size": 6725
                }, {
                    "name": "BundledEdgeRouter",
                    "size": 3727
                }, {
                    "name": "CircleLayout",
                    "size": 9317
                }, {
                    "name": "CirclePackingLayout",
                    "size": 12003
                }, {
                    "name": "DendrogramLayout",
                    "size": 4853
                }, {
                    "name": "ForceDirectedLayout",
                    "size": 8411
                }, {
                    "name": "IcicleTreeLayout",
                    "size": 4864
                }, {
                    "name": "IndentedTreeLayout",
                    "size": 3174
                }, {
                    "name": "Layout",
                    "size": 7881
                }, {
                    "name": "NodeLinkTreeLayout",
                    "size": 12870
                }, {
                    "name": "PieLayout",
                    "size": 2728
                }, {
                    "name": "RadialTreeLayout",
                    "size": 12348
                }, {
                    "name": "RandomLayout",
                    "size": 870
                }, {
                    "name": "StackedAreaLayout",
                    "size": 9121
                }, {
                    "name": "TreeMapLayout",
                    "size": 9191
                }]
            }, {
                "name": "Operator",
                "size": 2490
            }, {
                "name": "OperatorList",
                "size": 5248
            }, {
                "name": "OperatorSequence",
                "size": 4190
            }, {
                "name": "OperatorSwitch",
                "size": 2581
            }, {
                "name": "SortOperator",
                "size": 2023
            }]
        }, {
            "name": "Visualization",
            "size": 16540
        }]
    }]
}

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
    /*
        deactivate(){
            super.deactivate()
            document.getElementById("anno-task-modal").classList.toggle("modalAnnoTask", false)
        }
        */






    loadTemplate(data) {
        // init
        initialized = true
        this.show()
        $(this.view.html.refs["label-datatable"]).hide()
        $(this.view.html.refs["instruction"]).show()
        model.post.annoTask.labelLeaves = []
        model.meta.labelLeaves = []
        let TabTreePresenter = this
        $(this.view.html.refs["tree-container"]).empty()
        labelDatatable.clear()
        // Toggle children on click.
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

        let json = {}
        json.name = data.name
        json.children = []
        let counter = 0
        data.labelLeaves.forEach((n) => {
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

        data = json

        // Graph
        var margin = {
                top: 20,
                right: 120,
                bottom: 20,
                left: 120
            },
            width = $("#tree-container").width(),

            height = $("#tree-container").height();
        var i = 0,
            duration = 750,
            root;

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
        draw(data)

        function draw(data) {
            //if (error) throw error;
            let flare = data
            root = flare;
            root.x0 = height / 2;
            root.y0 = 0;

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }

            root.children.forEach(collapse);
            update(root);
        }

        d3.select(self.frameElement).style("height", "800px");

        function update(source) {
            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
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
        }


        // $(this.view.html.refs["table-container"]).empty()
        // $(this.view.html.refs["label-datatable"]).html(
        //     `

        //     `)


    }


}
export default TabTreePresenter