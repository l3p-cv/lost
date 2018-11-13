import React from 'react'

import {Menu, Item} from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'

export const MyMenu = ({menuId, drawBox}) => (
    <Menu id='myMenu'>
        <Item onClick={() => drawBox('blue')}>
            <span>icon</span>
            Turn box to blue
        </Item>
        <Item onClick={() => drawBox('red')}>
            <i className="fa fa-camera-retro"></i> Turn box to red
            
        </Item>
        <Item onClick={() => drawBox()}>
            <span>icon</span>
            Reset
        </Item>
    </Menu>
);