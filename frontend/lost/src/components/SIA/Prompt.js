import React, {Component} from 'react'
import { Dimmer, Header, Card, Icon, Segment, Menu, Input, Message, Statistic, Divider, Button, List, Label } from 'semantic-ui-react'

class Prompt extends Component{

    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }

    componentDidMount(){
        this.setState({active: this.props.active})
    }

    componentDidUpdate(prevProps){
        if (this.props.active !== prevProps.active){
            this.setState({active: this.props.active})
        }
    }

    
    render(){
        return (
            <Dimmer page active={this.state.active} style={{zIndex:2000}}>
                <Header as="h3" inverted>
                    {this.props.header}
                </Header>
                {this.props.content}
            </Dimmer>
        )
    }
}

export default Prompt