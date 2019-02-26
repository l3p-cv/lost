import React, {Component} from 'react'
import Graph from 'react-graph-vis';
import {connect} from 'react-redux'

const graph = {
    nodes: [
        {id: 1, label: 'Node 1'},
        {id: 2, label: 'Node 2'},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
        {id: 5, label: 'Node 5', chosen: false}
      ],
    edges: [
        {from: 1, to: 2},
        {from: 1, to: 3},
        {from: 2, to: 4},
        {from: 2, to: 5}
      ]
  };
  
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
          hierarchical: true
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

    render(){
        console.log('---------this.props---------------------------');
        console.log(this.props);
        console.log('------------------------------------');
        return(
            <Graph graph={graph} options={options} events={events}/>
        )
    }
}

const mapStateToProps = (state, test) => {
    const element = state.pipelineStart.step1Data.elements.filter(el=>el.peN == test.peN)[0]
     return {selectedLabelTree:element.exportData.annoTask.selectedLabelTree}
             

     
}
export default connect(mapStateToProps, {})(SelectLabel)