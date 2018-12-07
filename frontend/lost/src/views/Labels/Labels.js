import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {
    CardHeader,
    Card,
    CardBody,
    Col,
    Row
} from 'reactstrap'
import LabelTreeTable from '../../components/Labels/LabelTreeTable';
import LabelTree from '../../components/Labels/LabelTree';



const {getLabelTrees} = actions
  

class Label extends Component {
 
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
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
                            <LabelTree labelTree={this.props.trees[0]}></LabelTree>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {trees: state.label.trees}
}

export default connect(mapStateToProps, {getLabelTrees})(Label)
