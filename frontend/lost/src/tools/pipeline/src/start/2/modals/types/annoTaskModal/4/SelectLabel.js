import React, {Component} from 'react'
import Graph from 'react-graph-vis';
import {connect} from 'react-redux'


  
  const options = {
      height: '600px',
      interaction:{
        dragNodes:false,
        dragView: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: true,
        hoverConnectedEdges: false,
        keyboard: {
          enabled: false,
          speed: {x: 10, y: 10, zoom: 0.02},
          bindToWindow: true
        },
        multiselect: true,
        selectable: true,
        selectConnectedEdges: false,
        tooltipDelay: 100,
        zoomView: true
      },
      layout: {
        hierarchical: {
            enabled: true,
            sortMethod: 'directed'
        }
    },
      edges: {
          color: "#000000",
          chosen: false
      }
  };



  
  const events = {
      select: function(event) {
          var { nodes, edges } = event;
      }
  }



class SelectLabel extends Component{
    constructor(){
        super()

    }
    mapTreeToGraph(tree, parent){
        tree.children.forEach((el)=>{
            if(parent){
                this.graph.edges.push({
                    from: parent,
                    to: el.idx
                })
            }
            let nodeObj = {
                id: el.idx,
                chosen: true,
                label: el.name
            }
            if(el.children.length){
                this.mapTreeToGraph(el, el.idx)
            }else{
                nodeObj.chosen = false
            }
            this.graph.nodes.push(nodeObj)


        })
    }

    render(){
        this.graph = {
            nodes: [],
            edges: []
        }
        const tree = this.props.availableLabelTrees.filter(el=>el.idx === this.props.selectedLabelTree)[0]
        this.graph.nodes.push({
            id: tree.idx,
            label: tree.name,
            chosen: true
        })
        console.log('-------tree-----------------------------');
        console.log(tree);
        console.log('------------------------------------');
        console.log('-----------this.graph-------------------------');
        console.log(this.graph);
        console.log('------------------------------------');
        this.mapTreeToGraph(tree, tree.idx)
        
        return(
            <>
            <p style={{textAlign:"center"}}>Long press to choose multiple lables</p>
            <Graph graph={this.graph} options={options} events={events}/>
            </>
        )
    }
}

const mapStateToProps = (state, test) => {
    const element = state.pipelineStart.step1Data.elements.filter(el=>el.peN == test.peN)[0]
     return {selectedLabelTree:element.exportData.annoTask.selectedLabelTree}
             

     
}
export default connect(mapStateToProps, {})(SelectLabel)