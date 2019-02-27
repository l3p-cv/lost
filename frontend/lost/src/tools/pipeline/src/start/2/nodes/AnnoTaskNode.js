import React from 'react'
import { faDatabase, faFontAwesomeLogoFull } from '@fortawesome/free-solid-svg-icons'
import VerificationTitle from './VerificationTitle'
import NodeBody from './NodeBody'
const AnnoTaskNode = (props) => {
    console.log('-------props-----------------------------');
    console.log(props);
    console.log('------------------------------------');
    return (
        <div className='graph-node'>
            <VerificationTitle
                verified={props.verified}
                title={props.title}
                icon={faDatabase}
            />
            <NodeBody
                data={[
                    {
                        key: 'Name',
                        value: props.exportData.annoTask.name
                    },
                    {
                        key: 'Type',
                        value: props.exportData.annoTask.type
                    },
                    {
                        key: 'Assignee',
                        value: props.exportData.annoTask.assignee

                    }
                ]}
            />
            <div className='graph-node-footer'></div>
        </div>
    )
}


export default AnnoTaskNode