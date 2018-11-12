import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../actions'
import {
    Card,
    CardBody,
    Col,
    Row,
    Input,
    InputGroup,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap'

// Import React Table
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import {Menu, Item, contextMenu} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

const {getUsers, getGroups} = actions

const MyMenu = ({menuId, drawBox}) => (
    <Menu id='myMenu'>
        <Item onClick={() => drawBox('blue')}>
            <span>icon</span>
            Turn box to blue
        </Item>
        <Item onClick={() => drawBox('red')}>
            <span>icon</span>
            Turn box to red
        </Item>
        <Item onClick={() => drawBox()}>
            <span>icon</span>
            Reset
        </Item>
    </Menu>
);

class User extends Component {
    constructor(props) {
        super(props);

        this.toggle = this
            .toggle
            .bind(this);
        this.state = {
            dropdownOpen: false,
            isGoing: true,
            groups: this.props.groups.reduce((acc, curr) => {
                acc[curr] = false
                return acc
            }, {}),
        };
        this.handleCheckboxChange = this
            .handleCheckboxChange
            .bind(this);

    }
    handleCheckboxChange(event) {
        let target = event.target 
        if(!(target instanceof HTMLInputElement)){
            target = event.target.querySelector(`input[type="checkbox"]`)
        }

        const groupName = target.name
        this.setState((state) => {
            const groups = state.groups
            const groupValue = groups[groupName]
            groups[groupName] = groupValue === true ? false : true // toggle
            return { groups }
        })
    }
    handleContextMenu(e, row) {
        // always prevent default behavior
        e.preventDefault();
        console.log(e)
        console.log(row)
        // Don't forget to pass the id and the event and voila!
        contextMenu.show({id: 'myMenu', event: e});
    }

    componentDidMount() {
        this
            .props
            .getUsers()
        this
            .props
            .getGroups()
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    renderCreateUserGroups() {
        return (
            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    Groups
                </DropdownToggle>
                <DropdownMenu>
                    {this.props.groups.map((group)=>{return(
                         <DropdownItem
                            key={group.name}
                            onClick={this.handleCheckboxChange}
                         >
                         <input
                             type="checkbox"
                             name={group.name}
                             value={group.name}
                             defaultChecked={this.state.groups[group.name] ? true : false}
                             />{` ${group.name}`}
                         </DropdownItem>
                    )})}
                </DropdownMenu>
            </ButtonDropdown>
        )
    }
    render() {
        const data = this.props.users
        return (
            <div>
                <Row style={{
                    padding: '0 0 10px 0'
                }}>
                    <Col xs='12' sm='12' lg='12'>
                        <InputGroup>
                            <Input placeholder="username"></Input>
                            <Input placeholder="email"></Input>
                            <Input placeholder="full name"></Input>
                            {this.renderCreateUserGroups()}
                            <Button className='btn-info'>Create</Button>
                        </InputGroup>

                    </Col>
                </Row>
                <div></div>
                <Row>
                    <Col xs='12' sm='12' lg='12'>
                        <Card className='text-black'>
                            <CardBody className='pb-0'>
                                <ReactTable
                                    data={data}
                                    filterable
                                    columns={[{
                                        Header: 'Users',
                                        columns: [
                                            {
                                                Header: 'Name',
                                                accessor: d => `${d.first_name} ${d.last_name}`,
                                                id: 'user_name'
                                            }, {
                                                Header: 'User name',
                                                accessor: 'user_name',
                                                id: 'name'
                                            }, {
                                                Header: 'Email',
                                                accessor: 'email'
                                            }, {
                                                Header: 'Groups',
                                                id: 'idx',
                                                accessor:  d => d.groups.map((group) => `${group.name},`).join(' ').slice(0, -1),
                                            },{
                                                Cell: row => (
                                                    <div>
                                                        <span onClick={(e) => this.handleContextMenu(e, row)}>
                                                            More ...
                                                        </span>
                                                        <MyMenu/>
                                                    </div>
                                                )
                                            }
                                        ]
                                    }
                                ]}
                                    defaultPageSize={10}
                                    className='-striped -highlight'
                                    getTrProps={(state, rowInfo, column) => getProps(state, rowInfo, column)}/>
                                <br/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

            </div>
        )
    }
}

function getProps(state, rowInfo, column) {
    return {
        onDoubleClick: (e, handleOriginal) => {
            //alert('Clicked on ' + rowInfo.row.id)
            console.log('Cell - Double Click', {state, rowInfo, column, event: e})
            if (handleOriginal) {
                handleOriginal()
            }

        }
    }
}

function mapStateToProps(state) {
    return {users: state.user.users, groups: state.group.groups}
}

export default connect(mapStateToProps, {getUsers, getGroups})(User)
