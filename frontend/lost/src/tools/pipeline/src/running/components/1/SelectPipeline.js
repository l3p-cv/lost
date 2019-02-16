import React, {Component} from 'react'
import * as http from '../../../http'

class SelectPipeline extends Component{
    constructor(){
        super()
    }
    async componentDidMount(){
        const pipelines = await http.requestPipelines()
        console.log('----------pipelines--------------------------');
        console.log(pipelines);
        console.log('------------------------------------');
    }

    render(){
        return (
            <div>DATATABLE</div>
        )
    }
}

export default SelectPipeline