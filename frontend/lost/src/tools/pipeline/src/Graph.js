import { NodeTemplate, mouse, keyboard } from 'pipRoot/l3pfrontend/index'
import './Graph.scss'

import * as d3 from 'd3'
import * as dagreD3 from '@cartok/dagre-d3'

const d3Zoom = d3.behavior.zoom()
let initCounter = 0

const DEFAULT_PARAMS = {
  nodesep: 100,
  edgesep: 40,
  rankdir: 'TB',
  ranker: 'network-simplex',
}
/**
 * @todo autoscale the svg 
 * @todo finish possibility to create multiple graphs (class)
 * @param {*} mountPoint 
 */
export default class Graph {
  constructor(mountPoint: Node | String, options: any){
    initCounter++

    // merge default options
    options = Object.assign({}, DEFAULT_PARAMS, options)
    // ------------------------------------------------------------------------------------------------
    // process mount point
    if(mountPoint instanceof HTMLElement){
      this.mountPoint = mountPoint
    } else if(typeof(mountPoint) === 'string'){
      this.mountPoint = document.getElementById(mountPoint)
    } else {
      throw new Error(`Parameter 'mountPoint' has invalid type, use 'String' or 'Node'`)
    }

    // only one graph may be added to a 'mountPoint'
    if(this.mountPoint.querySelector(`[data-type='graph']`) !== null) {
      // replace???
      throw new Error('Another dagreD3 Graph has allready been mounted at the given mount point.')
    }

    // validate width of the container where the graph gets appended.
    // the svg needs a container that as allready a computed width,
    // else the graph and its node wont get rendered propperly.
    // if a 'Node' is hidden (display: 'none') it has a width of 0.
    if(mountPoint.getBoundingClientRect().width === 0){
      throw new Error('Mount Element has no width.')
    }

    // create base svg
    this.id = `graph-${initCounter}`
    this.initialScale = 0.8
    this.marginTop = 50
    this.svg = new NodeTemplate(`
      <svg data-type='graph' id='${this.id}'> // data-type?
        <foreignObject class='node' x='50' y='20'>
          <div data-ref='title'></div>
        </foreignObject>
        <g data-ref="dagre-graph"></g>
      </svg>
    `)
    this.mountPoint.appendChild(this.svg.fragment)

    // create and dagreD3 graph
    this.dagreD3Graph = new dagreD3.graphlib.Graph().setGraph(options)
    this.dagreD3Graph.graph().transition = (selection) => selection.transition().duration(1000)
    this.resize()
  
    // ------------------------------------------------------------------------------------------------

    
    $(window).on('resize', () => this.resize())


    // ------------------------------------------------------------------------------------------------


    d3.select(this.svg.root)
      .call(d3Zoom)
      .on('wheel.zoom', () => {
        console.log("zoom 1")
      })
      .on('dblclick.zoom', () => {
        console.log("zoom 2")
      })

    d3Zoom.on('zoom', () => {
      console.log('zoom 3')
      // drag?
    })

    // disable browser scroll while holding ctrl
    $(window).on('wheel', $event => {
      if(keyboard.isModifierHit($event, "ctrl")){
        $event.preventDefault()
      }
    })

    // zoom while holding ctrl
    $(this.svg.root).on('wheel', $event => {
      if(keyboard.isModifierHit($event, "ctrl")){
        if ($event.type === 'mousewheel') { // Zoom Chrome
          if ($event.originalEvent.wheelDelta > 0) {
            zoom_by(1.03)
          } else if ($event.originalEvent.wheelDelta < 0) {
            zoom_by(1 / 1.03)
          }
        } else if ($event.type === 'DOMMouseScroll') { // Zoom Firefox
          if ($event.originalEvent.detail < 0) {
            zoom_by(1.03)
          } else if ($event.originalEvent.detail > 0) {
            zoom_by(1 / 1.03)
          }
        }
      }
    })


    // function zoom_by(factor) {
    //   let scale = d3Zoom.scale()
    //   let extent = d3Zoom.scaleExtent()
    //   let translate = d3Zoom.translate()
    //   let x = translate[0]
    //   let y = translate[1]
    //   let target_scale = scale * factor
    //   // If we're already at an extent, done
    //   if (target_scale === extent[0] || target_scale === extent[1]) {
    //     return false
    //   }
    //   // If the factor is too much, scale it down to reach the extent exactly
    //   var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale))
    //   if (clamped_target_scale !== target_scale) {
    //     target_scale = clamped_target_scale
    //     factor = target_scale / scale
    //   }

    //   // Center each vector, stretch, then put back
    //   x = (x - center[0]) * factor + center[0]
    //   y = (y - center[1]) * factor + center[1]

    //   // Enact the zoom immediately
    //   d3Zoom.scale(target_scale).translate([x, y])
    // }
  }
  resize(){
    this.svg.root.setAttribute('width', this.mountPoint.getBoundingClientRect().width)
    this.svg.root.setAttribute('height', Math.floor(window.innerHeight * 0.6))
    this.centerGraph()
  }
  remove(){
    this.svg.root.remove()
  }
  centerGraph(){
    const x = (this.svg.root.getAttribute('width') / 2) - ((this.dagreD3Graph.graph().width * this.initialScale) / 2)
    const y = this.marginTop
    // not centering
    console.log({x,y})
    d3Zoom.translate(x, y).scale(this.initialScale)
    this.rerender()
  }

  render(){
    const d3Selection = d3.select(this.svg.refs["dagre-graph"])
    dagreD3.render()(d3Selection, this.dagreD3Graph)
  }
  rerender(){
    // this.svg.refs["dagre-graph"].setAttribute('transform', `translate(0, 0) scale(1)`)
    this.render()

    // center the graph
    const d3Selection = d3.select(this.svg.root)
    d3Zoom.event(d3Selection)

    // // update height?????
    // const height = (this.dagreD3Graph.graph().height * this.initialScale) + (2 * this.marginTop)
    // this.svg.root.setAttribute('height', height)
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
    this.dagreD3Graph.setNode(
      node.model.peN, {
        nodePresenter: node,
        id: nodeId,
        labelType: 'html',
        label: node.view.html.fragment,
        shape: 'rect',
        padding: 0
      }
    )
    this.rerender()
  }
  addEdge(from, to, redline) {
    // loop true or false peJump to draw red line
    if(redline === true) {
      var edge_style = 'stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;'
      var edge_arrow_style = 'fill: #f66; stroke: none;'
    } else {
      edge_style = ''
      edge_arrow_style = ''
    }

    this.dagreD3Graph.setEdge(from, to, {
      label: '',
      style: edge_style,
      arrowheadStyle: edge_arrow_style,
    })
    this.rerender()
  }
}
