import React, {useState, useEffect, useRef} from 'react'
// import {connect} from 'react-redux'
import { List, Table, Button, Icon, Divider, Header, TextArea, Form, Label} from 'semantic-ui-react'
import InfoBox from './InfoBox'
import * as colorlut from '../utils/colorlut'
// import actions from '../../../../actions'
// import * as transform from '../utils/transform'
// const { siaShowImgBar } = actions

const AnnoStats = (props) => {

    const [hideList, setHideList] = useState([])

    useEffect(() => {
        setHideList([])
    }, [props.imgLoadCount])

    const onDismiss = () => {
        if (props.onDismiss){
            props.onDismiss()
        }
    }

    const onLblClick = (lbl) => {
        let hideLbl = false
        if (hideList.includes(lbl.id)){
            setHideList(hideList.filter(e => e !== lbl.id))
            hideLbl = false
        } else {
            // hideList.push(lbl.id)
            setHideList([...hideList, lbl.id])
            hideLbl = true
        }
        if (props.onHideLbl){
            props.onHideLbl(lbl, hideLbl)
        }
    }

    const renderRow = (s) => {

            const opacity = hideList.includes(s.id) ? 0.5 : 1.0
            return <List.Item key={s.id}>
            <List.Content>
            <Label as='a' tag style={{background:s.color, opacity:opacity}}
                onClick={() => onLblClick(s)}
            >
                {s.label}
                <Label.Detail>{s.amount}</Label.Detail>
            </Label>
            </List.Content>
            </List.Item>
    }

    const renderRows = () => {
        let stats = {}
        props.annos.forEach(a => {
            // console.log('render rows', a)
            if (a.status !== 'deleted'){
                a.labelIds.forEach(lblId => {
                    if (lblId in stats){
                        stats[lblId] += 1
                    } else {
                        stats[lblId] = 1
                    } 
                })
                if (a.labelIds.length === 0) {
                    if (-1 in stats){
                        stats[-1] += 1
                    } else {
                        stats[-1] = 1
                    } 
                }
            }

        })
        const res = Object.entries(stats).map(([key, value]) => {
            let lbl = props.possibleLabels.find(e => {
                return e.id === parseInt(key)})
            if (!lbl){
                lbl = {'id':-1, 'label': 'No Label', 'color':colorlut.getDefaultColor()}
            }

            lbl.amount = value
            // return renderRow({class:idToLbl[key], amount:value, color:idToColor[key]})
            return renderRow(lbl)
        })
        return res
    }
    const renderDescription = () => {
    return <List>
        {renderRows()}
        </List>
    }
    
    return <InfoBox
        header={'Annotations per Label'}
        content={renderDescription()}
        visible={props.visible}
        defaultPos={props.defaultPos}
        onDismiss={e => onDismiss()}
    />
}

export default AnnoStats