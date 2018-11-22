import React, {Component} from 'react'
import {Progress, Table} from 'reactstrap'
import AmountPerLabel from './AmountPerLabel'

class MyAnnoTasks extends Component {
    render() {

        return (
            <Table hover responsive className='table-outline mb-0 d-none d-sm-table'>
                <thead className='thead-light'>
                    <tr>
                        <th className='text-center'>Name</th>
                        <th className='text-center'>Pipeline</th>
                        <th className='text-center'>Group/User</th>
                        <th>Progress</th>
                        <th className='text-center'>Annotation Type</th>
                        <th className='text-center'>Activity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/1.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-success'></span>
                            </div>
                        </td>
                        <td>
                            <div>Yiorgos Avraamu</div>
                            <div className='small text-muted'>
                                <span>New</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-us h4 mb-0' title='us' id='us'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>50%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='success' value='50'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-cc-mastercard'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>10 sec ago</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/2.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-danger'></span>
                            </div>
                        </td>
                        <td>
                            <div>Avram Tarasios</div>
                            <div className='small text-muted'>

                                <span>Recurring</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-br h4 mb-0' title='br' id='br'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>10%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='info' value='10'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-cc-visa'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>5 minutes ago</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/3.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-warning'></span>
                            </div>
                        </td>
                        <td>
                            <div>Quintin Ed</div>
                            <div className='small text-muted'>
                                <span>New</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-in h4 mb-0' title='in' id='in'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>74%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='warning' value='74'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-cc-stripe'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>1 hour ago</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/4.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-secondary'></span>
                            </div>
                        </td>
                        <td>
                            <div>Enéas Kwadwo</div>
                            <div className='small text-muted'>
                                <span>New</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-fr h4 mb-0' title='fr' id='fr'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>98%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='danger' value='98'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-paypal'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>Last month</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/5.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-success'></span>
                            </div>
                        </td>
                        <td>
                            <div>Agapetus Tadeáš</div>
                            <div className='small text-muted'>
                                <span>New</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-es h4 mb-0' title='es' id='es'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>22%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='info' value='22'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-google-wallet'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>Last week</strong>
                        </td>
                    </tr>
                    <tr>
                        <td className='text-center'>
                            <div className='avatar'>
                                <img
                                    src={'assets/img/avatars/6.jpg'}
                                    className='img-avatar'
                                    alt='admin@bootstrapmaster.com'/>
                                <span className='avatar-status badge-danger'></span>
                            </div>
                        </td>
                        <td>
                            <div>Friderik Dávid</div>
                            <div className='small text-muted'>
                                <span>New</span>
                                | Registered: Jan 1, 2015
                            </div>
                        </td>
                        <td className='text-center'>
                            <i className='flag-icon flag-icon-pl h4 mb-0' title='pl' id='pl'></i>
                        </td>
                        <td>
                            <div className='clearfix'>
                                <div className='float-left'>
                                    <strong>43%</strong>
                                </div>
                                <div className='float-right'>
                                    <small className='text-muted'>Jun 11, 2015 - Jul 10, 2015</small>
                                </div>
                            </div>
                            <Progress className='progress-xs' color='success' value='43'/>
                        </td>
                        <td className='text-center'>
                            <i
                                className='fa fa-cc-amex'
                                style={{
                                fontSize: 24 + 'px'
                            }}></i>
                        </td>
                        <td>
                            <div className='small text-muted'>Last login</div>
                            <strong>Yesterday</strong>
                        </td>
                    </tr>
                </tbody>
            </Table>
        )

    }
}

export default MyAnnoTasks
