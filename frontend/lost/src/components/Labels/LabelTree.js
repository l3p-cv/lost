import React, {Component} from 'react'
import Graph from 'react-graph-vis';
import mapTreeToGraph from 'libs/graph-vis/mapTreeToGraph'

const options = {
    autoResize: true,
    height: '600px',
    layout: {
        hierarchical: {
            enabled: true,
            sortMethod: 'directed'
        }
    },
    edges: {
        color: "#000000"
    }
};

const events = {
    doubleClick: function (event) {
        var {nodes} = event;
        console.log("DBL CLICK - Selected nodes:");
        console.log(nodes);
    }
};
class LabelTree extends Component {

    render() {
        const tree = this.props.labelTree
        if(tree){
            const graph = mapTreeToGraph(tree)
            console.log(graph)
            return (<Graph graph={graph} options={options} events={events}/>)
        } else {
            return (
                <div>No Tree selected.</div>
            )
        }
    }
}

export default LabelTree