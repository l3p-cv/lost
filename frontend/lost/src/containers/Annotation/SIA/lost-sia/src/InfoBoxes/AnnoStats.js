import React, {useState, useEffect, useRef} from 'react'
// import {connect} from 'react-redux'
import { List, Table, Button, Icon, Divider, Header, TextArea, Form, Label} from 'semantic-ui-react'
import InfoBox from './InfoBox'
// import actions from '../../../../actions'
// import * as transform from '../utils/transform'
// const { siaShowImgBar } = actions

const AnnoStats = (props) => {

    const [idToLbl, setIdToLbl] = useState({})
    const [idToColor, setIdToColor] = useState({})

    useEffect(() => {
        if (props.possibleLabels){
            // console.log('possibleLabels', props.possibleLabels)
            const temp = {}
            const color = {}
            props.possibleLabels.forEach(lbl => {
                temp[lbl.id] = lbl.label
                if (lbl.color){
                    color[lbl.id] = lbl.color
                }
            })
            temp[-1] = 'No Label'
            setIdToLbl(temp)
            setIdToColor(color)
        }
    }, [props.possibleLabels])

    useEffect(() => {
        // console.log('annos changed', props.annos)
    }, [props.annos])

    const onDismiss = () => {
        if (props.onDismiss){
            props.onDismiss()
        }
    }

    const renderRow = (s) => {
            return <List.Item key={s.class}>
            {/* <List.Icon name='circle' >{s.amount} </List.Icon> */}
            <List.Content>
                {/* {s.class} */}
            <Label as='a' tag style={{background:s.color}}>{s.class}
                <Label.Detail>{s.amount}</Label.Detail>
            </Label>
            </List.Content>
            </List.Item>
        // return <div>{s.class}: <Label as='a' tag> {s.amount}</Label></div>
        // // return <Label as='a' tag style={{background:'#ffff00'}}>{s.class}: <Label.Detail>{s.amount}</Label.Detail></Label>
        // return <Table.Row>
        //     <Table.Cell>
        //     {/* <Header as='h5' >
        //         <Header.Content>
        //         {s.class}
        //         </Header.Content>
        //     </Header> */}
        //     {s.class}: <Label as='a' tag> {s.amount}</Label>
        //     </Table.Cell>
        //     <Table.Cell>{s.amount}</Table.Cell>
        // </Table.Row>

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
                    console.log('length == 0')
                }
            }

        })
        console.log('render rows, ', stats, props.annos)
        const res = Object.entries(stats).map(([key, value]) => {
            // console.log(`${key}: ${value}`)
            return renderRow({class:idToLbl[key], amount:value, color:idToColor[key]})
        })
        return res
    }
    const renderDescription = () => {
        // return 'Hello :-) from AnnoStats'
    return <List>
        {renderRows()}
        </List>
        // return <div>
        //     <Table basic='very' celled collapsing>
        //         {/* <Table.Header>
        //         <Table.Row>
        //             <Table.HeaderCell>Label</Table.HeaderCell>
        //             <Table.HeaderCell>Amount</Table.HeaderCell>
        //         </Table.Row>
        //         </Table.Header> */}
        //         {renderRows()}

        //         <Table.Body>
        //         </Table.Body>
        //     </Table>
        // </div>

    }
    
    return <InfoBox
        header={'Annoations per Label'}
        content={renderDescription()}
        visible={props.visible}
        defaultPos={props.defaultPos}
        onDismiss={e => onDismiss()}
    />
}

export default AnnoStats