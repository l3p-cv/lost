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

const {getLabelTrees} = actions

class Label extends Component {
 
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
        const data = this.props.trees
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
