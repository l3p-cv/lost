import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    Alert,
    Badge,
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'
import LabelTreeTable from '../../components/Labels/LabelTreeTable';
import Graph from 'react-graph-vis';


const {getLabelTrees} = actions

const graph = {
    nodes: [
      { id: 1, label: "Node 1", color: "#e04141" },
      { id: 2, label: "Node 2", color: "#e09c41" },
      { id: 3, label: "Node 3", color: "#e0df41" },
      { id: 4, label: "Node 4", color: "#7be041" },
      { id: 5, label: "Node 5", color: "#41e0c9" }
    ],
    edges: [{ from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 }]
  };
  
  
  const options = {
    layout: {
      hierarchical: false
    },
    edges: {
      color: "#000000"
    }
  };
  
  const events = {
    select: function(event) {
      var { nodes, edges } = event;
      console.log("Selected nodes:");
      console.log(nodes);
      console.log("Selected edges:");
      console.log(edges);
    }
  };
class Label extends Component {
 
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
        const data = this.props.trees
        const nodes = this.props.trees.map((tree)=> {return({
            id: tree.idx,
            label: tree.name})
        })
        graph.nodes = nodes
        console.log(data)
        return (
            <div>
                <Row>
                    <Col xs='12' sm='12' lg='12'>
                        <Card className='text-black'>
                        <CardHeader>
                            Label Trees
                        </CardHeader>
                            <CardBody className='pb-0'>
                            <LabelTreeTable labelTrees={this.props.trees}></LabelTreeTable>
    
                              </CardBody> 
                        </Card>
                        <Card>
                            <CardBody>
                            <Graph graph={graph} options={options} events={events} />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}


function mapStateToProps(state) {
    console.log(state.label.trees)
    return {trees: state.label.trees}
}

export default connect(mapStateToProps, {getLabelTrees})(Label)
