import React, {Component} from 'react'

import {connect} from 'react-redux'
import {Badge, Button, Card, CardHeader, CardBody, Table} from 'reactstrap'
import { LazyLog, ScrollFollow } from 'react-lazylog'
import Modal from 'react-modal'

import actions from '../../actions'


const {getWorkers, getWorkerLogFile} = actions

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)',
      width: '85%',
      height: '85%',
      maxWidth: '85rem'
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.75)'
      },
  };

class WorkersTable extends Component {
    constructor(props){
        super(props)
        this.state = {
            logBlobUrl: '',
            modalIsOpen: false
        }

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
        // references are now sync'd and can be accessed.
        //this.subtitle.style.color = '#f00';
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    componentDidMount() {
        this
            .props
            .getWorkers()
        this.workertimer = setInterval(()=>  this.props.getWorkers(), 1000)
    }

     handleLogfileButtonClick(worker){
        //const {idx,type,status} = worker
        const logFile = this.props.getWorkerLogFile(`${worker.worker_name}.log`)
        logFile.then(response=>
            this.setState({logBlobUrl: window.URL.createObjectURL(response)})
        )

        this.openModal()
    }

    componentWillUnmount() {
        clearInterval(this.workertimer)
        this.workertimer = null
      }
    
    renderLogFile(){
        if(this.state.logBlobUrl!=='')
        {
            return( <ScrollFollow
                startFollowing={true}
                render={({ follow, onScroll }) => (
                <LazyLog url={this.state.logBlobUrl} stream follow={follow} onScroll={onScroll} />
                )}
            />)
        }
        else return <div></div>
    }

    renderLogFileModal(){
        return(
        <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            ariaHideApp={false}
            contentLabel="Logfile"
            >
            <Card style={{height:'90%'}}>
                <CardHeader><i className="fa fa-question-circle"></i> Logs</CardHeader>
                <CardBody style={{height:'100%'}}>
                    {this.renderLogFile()}
                </CardBody>
                <Button color='success' onClick={this.closeModal}><i className="fa fa-times"></i> Close</Button>
            </Card>                   
        </Modal>)    
    }

    renderTableBody() {
        return (
            <tbody>
                {this.props.workers.map((worker) => {
                    let statusColor = 'success'
                    let statusText = 'Online'

                    if (worker.timestamp){
                        const someSecondsAgo = new Date(Date.now() - 15000) // fix this to correct timestamp
                        const lastActivityDate = new Date(`${worker.timestamp}Z`)
                        if(lastActivityDate < someSecondsAgo){
                            statusColor = 'danger'
                            statusText = 'Offline'
                        }
                    }
                    return (
                        <tr key={worker.idx}>
                            <td className='text-center'>
                                <div>{worker.worker_name}</div>
                                <div className='small text-muted'>ID: {worker.idx}</div>
                            </td>
                            <td>
                                <div>{worker.env_name}</div>
                                <div className='small text-muted'>
                                    Registered at: {new Date(`${worker.register_timestamp}Z`).toLocaleString()}
                                </div>
                            </td>
                            <td className='text-center'>
                                <div><Badge color={statusColor}>{statusText}</Badge></div>
                                <div className='small text-muted'>
                                    Last life sign: {new Date(`${worker.timestamp}Z`).toLocaleString()}
                                </div>
                            </td>
                            <td className='text-center'>
                                <div>{worker.resources}</div>
                            </td>
                            <td className='text-center'>
                                <div>{worker.in_progress}</div>
                            </td>
                            <td className='text-center'>
                                <Button onClick={()=>this.handleLogfileButtonClick(worker)}>Logs</Button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>

        )
    }
    render() {
        return (
            <React.Fragment>
                {this.renderLogFileModal()}
                <Table hover responsive className='table-outline mb-0 d-none d-sm-table'>
                    <thead className='thead-light'>
                        <tr>
                            <th className='text-center'>Name</th>
                            <th className='text-center'>Environment</th>
                            <th className='text-center'>Status</th>
                            <th className='text-center'>Resources</th>
                            <th className='text-center'>Jobs</th>
                            <th className='text-center'>Logs</th>
                        </tr>
                    </thead>
                    {this.renderTableBody()}
                </Table>
            </React.Fragment>
        )

    }
}
function mapStateToProps(state) {
    return ({workers: state.worker.workers})
}

export default connect(mapStateToProps, {getWorkers, getWorkerLogFile})(WorkersTable)
