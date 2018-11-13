import { NodeTemplate } from "l3p-frontend"
import "./Graph.scss"

import * as d3 from "d3"
import * as dagreD3 from "@cartok/dagre-d3"

var svg
var zoom = d3.behavior.zoom()
const DEFAULT_PARAMS = {
  nodesep: 100,
  edgesep: 40,
  rankdir: "TB",
  ranker: "network-simplex",
}
const _render = dagreD3.render()
let initCounter = 0

/**
 * @todo autoscale the svg 
 * @todo finish possibility to create multiple graphs (class)
 * @param {*} mountPoint 
 */
export default class Graph {
  constructor(mountPoint: Node | string, graphOptions: any) {
    // define container where the graphs svg gets appended
    switch (typeof (mountPoint)) {
      case "string":
        this.mountPoint = document.getElementById(mountPoint)
        break
      case "object":
        if (mountPoint.nodeType !== Node.ELEMENT_NODE) {
          throw new Error("mountPoint has invalid type, use 'string' or 'Node'")
        }
        this.mountPoint = mountPoint
        break
      default:
        throw new Error("mountPoint has invalid type, use 'string' or 'Node'")
    }

    // only one graph may be added to a 'mountPoint'
    if ($(this.mountPoint).find("[data-type='graph']")[0] !== undefined) {
      throw new Error("a graph has allready been mounted here.")
    }

    this.id = `graph-0`
    this.initialScale = 0.8
    this.marginTop = 50
    // validate width of the container where the graph gets appended.
    // the svg needs a container that as allready a computed width,
    // else the graph and its node wont get rendered propperly.
    // if a 'Node' is hidden (display=none) it has a width of 0.
    const containerWidth = $(mountPoint).width()
    if (typeof (containerWidth) !== "number" || containerWidth <= 0) {
      throw new Error("the container where the graph gets mounted must have a width greater than 0.")
    }

    // create and svg area
    this.svg = new NodeTemplate(`
            <svg data-type="graph" id="${this.id}" width="100" height="100">
              <foreignObject class="node" x="46" y="22" width="200" height="200">
              <div data-ref="title-box" id="title_box">
            </div>
            </foreignObject>
              <g id="${this.id}-content"></g>
            </svg>
        `)
    this.mountPoint.appendChild(this.svg.fragment)

    // resize svg area
    this.resize()
    $(window).on("resize", () => this.resize())

    // init dagre graph
    this.graph = new dagreD3.graphlib.Graph()
      .setGraph(Object.assign({}, DEFAULT_PARAMS, graphOptions))
    this.renderTarget = d3.select(`#${this.id}-content`)

    initCounter++

    svg = d3.select("#graph-0")    
    var inner = this.renderTarget
    $(document).keydown(function (event) {
      if (event.ctrlKey === true && (event.which === '61' || event.which === '107' || event.which === '173' || event.which === '109' || event.which === '187' || event.which === '189')) {
        alert('disabling zooming')
        event.preventDefault()
      }
    })

    $(window).bind('mousewheel DOMMouseScroll', function (event) {
      if (event.ctrlKey === true) {
        event.preventDefault()
      }
    })

    var ctrlPressed = false
    $(window).keydown(function (evt) {
      if (evt.which === 17) {
        ctrlPressed = true
      }
    }).keyup(function (evt) {
      if (evt.which === 17) {
        ctrlPressed = false
      }
    })
    var width = 500,
      height = 960,
      center = [width / 2, height / 2]
    zoom.on("zoom", zoomed)

    function zoomed() {
      inner.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
    }
    svg.call(zoom)
    svg.on("wheel.zoom", null)
    svg.on("dblclick.zoom", null)

    $('#graph-0').bind('mousewheel DOMMouseScroll', function (e) {
      if (ctrlPressed === true) {
        if (e.type === 'mousewheel') { // Zoom Chrome
          if (e.originalEvent.wheelDelta > 0) {
            zoom_by(1.03)
          } else if (e.originalEvent.wheelDelta < 0) {
            zoom_by(1 / 1.03)
          }
        } else if (e.type === 'DOMMouseScroll') { // Zoom Firefox
          if (e.originalEvent.detail < 0) {
            zoom_by(1.03)
          } else if (e.originalEvent.detail > 0) {
            zoom_by(1 / 1.03)
          }
        }
      }
    })

    var scale_graph

    function zoom_by(factor) {
      scale_graph = zoom.scale()
      var scale = zoom.scale(),
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        x = translate[0],
        y = translate[1],
        target_scale = scale * factor
      // If we're already at an extent, done
      if (target_scale === extent[0] || target_scale === extent[1]) {
        return false
      }
      // If the factor is too much, scale it down to reach the extent exactly
      var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale))
      if (clamped_target_scale !== target_scale) {
        target_scale = clamped_target_scale
        factor = target_scale / scale
      }

      // Center each vector, stretch, then put back
      x = (x - center[0]) * factor + center[0]
      y = (y - center[1]) * factor + center[1]

      // Enact the zoom immediately
      zoom.scale(target_scale)
        .translate([x, y])
      zoomed()
    }
  }


  centerGraph(){
    let width = this.graph.graph().width
    zoom
      .translate([((svg.attr("width") / 2)  - (width* this.initialScale)/2 ) , this.marginTop])
      .scale(this.initialScale)
    this.rerender()
  }

  remove(){
    this.svg.root.remove()
  }

  render() {
    _render(this.renderTarget, this.graph)
    console.warn("RENDER")
  }

  rerender() {
    var svg = d3.select("#graph-0")
    this.renderTarget.attr("transform", "translate(" + [0, 0] + ") scale(" + 1 + ")")
    
    var render = new dagreD3.render()
    this.graph.graph().transition = function (selection) {
      return selection.transition().duration(2000)
    }
    // Run the renderer. This is what draws the final graph.
    render(this.renderTarget, this.graph)
    // Center the graph
    zoom.event(svg)
    document.getElementById('graph-0').setAttribute("height", this.graph.graph().height * this.initialScale + this.marginTop*2)
  }


  resize() {
    console.log("RESIZE")
    this.svg.root.setAttribute("width", $(this.mountPoint).width())
    this.svg.root.setAttribute("height", Math.floor(window.innerHeight * 0.6))
    try{
      this.centerGraph()
    }catch(err){
    }
  }
  addNode(node: NodePresenter) {
    const nodeId = `${this.id}-node-${node.model.peN}`
    this.setNode(node)
    // give the node the created parents id
    // so that it can be used for events (click)
    node.init(document.getElementById(nodeId))

  }
  updateNode(node: NodePresenter) {
    this.setNode(node)
  }
  setNode(node: NodePresenter) {
    // the nodeId is the id of the grouping element created by dagree
    const nodeId = `${this.id}-node-${node.model.peN}`
    this.graph.setNode(
      node.model.peN, {
        nodePresenter: node,
        id: nodeId,
        labelType: "html",
        label: node.view.html.fragment,
        shape: "rect",
        padding: 0
      }
    )
    this.rerender()


  }


  // loop true or false peJump to draw red line
  addEdge(from, to, redline) {
    if (redline === true) {
      var edge_style = "stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;"
      var edge_arrow_style = "fill: #f66; stroke: none;"
    } else {
      edge_style = ""
      edge_arrow_style = ""
    }

    this.graph.setEdge(from, to, {
      label: "",
      style: edge_style,
      arrowheadStyle: edge_arrow_style,
    })
    this.rerender()
  }

}
