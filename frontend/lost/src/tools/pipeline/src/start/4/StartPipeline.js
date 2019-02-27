import React, { Component } from 'react'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Button} from 'reactstrap'
class StartPipeline extends Component {
    render() {
        return (
                <div className='pipeline-start-tab3-conainer'>
                    <h3>Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <Button color="primary" size="lg">
                        <FontAwesomeIcon icon={faPlayCircle} size="5x" />
                        Start Pipe
                    </Button>
                </div>
        )
    }
}

export default StartPipeline





{/* <div>
<div style={{width: '50%', margin: 0, textAlign:'center'}}>
    <h3 className='title-start-pipeline-completed' >Complete</h3>
    <p>You have successfully completed all steps.</p>
    <button data-ref='btnStartPipe' type='button' className='btn btn-primary btn-lg'>
        <FontAwesomeIcon icon={faPlayCircle} size="5x" />
        Start Pipe
    </button>
</div>
</div> */}
        