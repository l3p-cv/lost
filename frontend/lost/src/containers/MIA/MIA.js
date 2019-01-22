import React, {Component} from 'react'
import Control from './Control'
import Tags from './Tags'
import Cluster from './Cluster'

class MIA extends Component{
    render(){
        return(<div>
                    <Control></Control>
                    <Tags></Tags>
                    <Cluster></Cluster>
            </div>)
    }
}

export default MIA