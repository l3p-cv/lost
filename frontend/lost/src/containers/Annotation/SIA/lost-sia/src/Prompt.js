import React, {Component} from 'react'
import { Dimmer, Header } from 'semantic-ui-react'

class Prompt extends Component{

    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }

    handleClick(e){
        if (this.props.onClick){
            this.props.onClick(e)
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
            <Dimmer page 
                active={this.state.active} 
                style={{zIndex:7000}}
                onClick={e => this.handleClick(e)}
            >
                <Header as="h3" inverted>
                    {this.props.header}
                </Header>
                {this.props.content}
            </Dimmer>
        )
    }
}

export default Prompt