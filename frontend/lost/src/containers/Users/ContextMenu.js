import React, {Component} from 'react'

import {Menu, Item, contextMenu} from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'


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


class UserContextMenu extends Component {
    constructor(props){
        super(props)
        this.handleContextMenu = this
        .handleContextMenu
        .bind(this);

    }
    handleContextMenu(e) {
        // always prevent default behavior
        e.preventDefault();
        console.log(e)
        // Don't forget to pass the id and the event and voila!
        contextMenu.show({id: 'myMenu', event: e});
    }
    render() {
        return (
            <div>
                <span onClick={(e) => this.handleContextMenu(e)}>
                    More ...
                </span>
                <MyMenu/>
            </div>
        )
    }
}
export default UserContextMenu

