import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'

import AnnoTaskStartView from '../../../../views/AnnoTaskStartView'

import TabTreeView from './TabTreeView'

import 'datatables.net'
import 'datatables.net-buttons'

import swal from 'sweetalert2'

import d3 from 'd3'
import d3Tip from 'd3-tip'

let ctrlPressed = false
let initialized = false
d3.tip = d3Tip
var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return  `<h4>Description</h4><p style='text-align:center'>${d.description}<p>`
    })

class TabTreePresenter extends WizardTabPresenter {
    constructor(getPresenter, modalView) {
        super()
        this.model = getPresenter.model
        this.presenter = getPresenter
        this.view = new TabTreeView(this.model)
        getPresenter.modalModel.controls.show4.on('update', (data) => this.loadTemplate(data))

        // change modal size
        $(this.view.nav.root).on('click', (e) => {
            if(!this.isLocked()){
                modalView.view.refs['outerModal'].style.width = '90%'
            }
        })

        $(window).keydown(function (evt) {
            if (evt.which === 17) {
                ctrlPressed = true
            }
        }).keyup(function (evt) {
            if (evt.which === 17) {
                ctrlPressed = false
            }
        })


        this.labelDatatable = $(this.view.html.refs['label-datatable']).DataTable({
            columnDefs: [{
                targets: [0],
                visible: false,
            }],
            'paging': false,
            'info': false,
            'searching': false
        })

        // DELETE ROW
        $(this.view.html.refs['label-datatable']).on('click', 'span', (e) => {
            let id = this.labelDatatable.row($(e.currentTarget).parent().parent()).data()[0]
            this.labelDatatable.row($(e.currentTarget).parents('tr')).remove().draw()
            var index = this.model.post.annoTask.labelLeaves.indexOf(this.model.post.annoTask.labelLeaves.find(o => o.id === id))
            if (index > -1) {
                this.model.post.annoTask.labelLeaves.splice(index, 1)
                this.model.meta.labelLeaves.splice(index, 1)

                this.presenter.view = new AnnoTaskStartView(this.model)
            }
            if (this.labelDatatable.data().count() === 0) {
                $(this.view.html.refs['label-datatable']).hide()
                $(this.view.html.refs['instruction']).fadeIn()
            }
        })
        // INPUT MAX LABEL
        $(this.view.html.refs['label-datatable']).on('input', 'tr', (e) => {
            let id = this.labelDatatable.row($(e.currentTarget)).data()[0]
            var index = this.model.post.annoTask.labelLeaves.indexOf(this.model.post.annoTask.labelLeaves.find(o => o.id === id))
            this.model.post.annoTask.labelLeaves[index].maxLabels = parseInt($(e.currentTarget).find('input').val())
        })


    }
    isValidated() {
        return true
    }




    loadTemplate(getData) {
        initialized = true
        this.labelDatatable.clear()
        this.show()
        $(this.view.html.refs['label-datatable']).hide()
        $(this.view.html.refs['instruction']).show()


        this.model.post.annoTask.labelLeaves = []
        this.model.meta.labelLeaves = []
        this.presenter.view = new AnnoTaskStartView(this.model)        
        let TabTreePresenter = this
        $(this.view.html.refs['tree-container']).empty()
        // Toggle children on click.
        let json = {}
        json.name = getData.name
        json.children = []

        function find(arr, condition) {
            if (!arr) return null
            for (let obj of arr) {
                if (condition(obj)) return obj
                let retVal = find(obj.children, condition)
                if (retVal) return retVal
            }
            return null
        }
        getData.labelLeaves.forEach((n) => {
            if (n.parentLeafId === null) {
                json.children.push({
                    rawId: n.id,
                    name: n.name,
                    description: n.description,
                    parentLeafId: n.parentLeafId,
                    userName: n.userName,
                    leafId: n.leafId,
                })
            } else {
                let obj = find(json.children, o => o.rawId === n.parentLeafId)
                if (obj !== undefined) {
                    if (obj.children === undefined) {
                        obj.children = []
                    }
                    obj.children.push({
                        rawId: n.id,
                        name: n.name,
                        description: n.description,
                        parentLeafId: n.parentLeafId,
                        userName: n.userName,
                        leafId: n.leafId
                    })
                }
            }
        })
        let treeData = json
        var margin = {
                top: 20,
                right: 120,
                bottom: 20,
                left: 120
            },
            width = $(this.view.html.refs['tree-container']).width(),

            height = $(this.view.html.refs['tree-container']).height()
        var i = 0,
            duration = 750

        var tree = d3.layout.tree()
            .size([height, width])

        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.y, d.x]
            })

        var zoom = d3.behavior.zoom()
            .on('zoom', zoomed)

        function zoomed() {
            svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')')
        }

        var svg = d3.select(this.view.html.refs['tree-container'])
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(zoom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(toolTip)
            

        //if (error) throw error

        treeData.x = height / 2
        treeData.x0 = height / 2
        treeData.y0 = 0
        treeData.y = 0

        function collapse(d) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }
        treeData.children.forEach(collapse)
        update(treeData, this)
        d3.select(self.frameElement).style('height', '800px')
        function update(source, that) {
            // Compute the new tree layout.
            var nodes = tree.nodes(treeData).reverse(),
                links = tree.links(nodes)

            //  Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180
            })

            // Update the nodes…
            var node = svg.selectAll('g.node')
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i)
                })

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr('transform', function (d) {
                    return 'translate(' + source.y0 + ',' + source.x0 + ')'
                })
                .on('click', (d) => {
                    if (ctrlPressed) {
                        if(d.depth === 0){
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Sorry',
                                text: `Can't add first label`,
                                showConfirmButton: false,
                                timer: 1500
                                })
                              return
                        }
                        if(!d._children && !d.children){
                            swal({
                                position: 'top-right',
                                type: 'error',
                                title: 'Sorry',
                                text: `Can't add label with out children`,
                                showConfirmButton: false,
                                timer: 1500
                                })
                              return
                        }
                        $(TabTreePresenter.view.html.refs['label-datatable']).fadeIn()
                        $(TabTreePresenter.view.html.refs['instruction']).hide()
                        console.log('========d============================')
                        console.log(d)
                        console.log('====================================')
                        // Check if already there
                        if (that.model.post.annoTask.labelLeaves.find(o => o.rawId === d.rawId) === undefined) {
                            const rawId = parseInt(d.rawId)
                            that.model.post.annoTask.labelLeaves.push({
                                id: parseInt(d.rawId),
                                maxLabels: 1
                            })
                            that.labelDatatable.row.add(
                                [
                                    rawId,
                                    d.name,
                                    `<input data-ref=${d.id} class='labelmax form-control'  
                                             type='number' name='max_label' min='0' max='99' value='1'>`,
                                    `<span data-ref=${d.id} class = 'delete-labelLeave annotask-span-modal-default bg-red'>
                                             <i class='fa fa-times fa-lg' aria-hidden='true'></i>
                                             </span>`
                                ]).draw(false)
        
                            that.model.meta.labelLeaves.push({
                                name: d.name
                            })
                            that.presenter.view = new AnnoTaskStartView(that.model)
                        }
                    } else {
                        if (d.children) {
                            d._children = d.children
                            d.children = null
                        } else {
                            d.children = d._children
                            d._children = null
                        }
                        update(d, that)
                    }
                }
            )
                .on('mouseover', toolTip.show)
                .on('mouseout', toolTip.hide)
            nodeEnter.append('circle')
                .attr('r', 1e-6)
                .style('fill', function (d) {
                    return d._children ? 'lightsteelblue' : '#fff'
                })
            nodeEnter.append('text')
                .attr('x', function (d) {
                    return d.children || d._children ? -10 : 10
                })
                .attr('dy', '.35em')
                .attr('text-anchor', function (d) {
                    return d.children || d._children ? 'end' : 'start'
                })
                .text(function (d) {
                    return d.name
                })
                .style('fill', 'black')

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr('transform', function (d) {
                    return 'translate(' + d.y + ',' + d.x + ')'
                })

            nodeUpdate.select('circle')
                .attr('r', 4.5)
                .style('fill', function (d) {
                    return d._children ? 'lightsteelblue' : '#fff'
                })

            nodeUpdate.select('text')
                .style('fill-opacity', 1)

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr('transform', function (d) {
                    return 'translate(' + source.y + ',' + source.x + ')'
                })
                .remove()

            nodeExit.select('circle')
                .attr('r', 1e-6)

            nodeExit.select('text')
                .style('fill-opacity', 1e-6)

            // Update the links…
            var link = svg.selectAll('path.link')
                .data(links, function (d) {
                    return d.target.id
                })

            // Enter any new links at the parent's previous position.
            link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d', function (d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    }
                    return diagonal({
                        source: o,
                        target: o
                    })
                })

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr('d', diagonal)

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    }
                    return diagonal({
                        source: o,
                        target: o
                    })
                })
                .remove()

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x
                d.y0 = d.y
            })
        }
    }
}
export default TabTreePresenter