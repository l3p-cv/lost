import React, {useEffect, useState} from 'react'
import { Divider, Image, Card, Header } from 'semantic-ui-react'
import InfoBox from './InfoBox'
import SiaPopup from '../SiaPopup'
import AnnoExampleViewer from '../AnnoExampleViewer'
const LabelInfo = (props) => {

    const [showExampleViewer, setShowExampleViewer] = useState(false)
    const [myLbl, setMyLbl] = useState(undefined)
    // const { data: exampleImg, mutate: getAnnoExample } = exampleApi.useGetAnnoExampleImg({})
    useEffect(() => {
        if (props.selectedAnno){
            const selectedLabelIds = props.selectedAnno.labelIds
            if (selectedLabelIds) {
                const lbl = props.possibleLabels.find( e => {
                    return selectedLabelIds[0] === e.id
                })
                if (lbl){
                    if (lbl !== myLbl){
                        setMyLbl(lbl)
                        if (props.visible)
                            // getAnnoExample({llId:lbl.id, type:'annoBased', drawAnno: true, addContext:0.05})
                            requestImg(lbl, props.selectedAnno)
                    }
                }
            }
        }
    }, [props.selectedAnno])
    const onDismiss = () => {
        if (props.onDismiss){
            props.onDismiss()
        }
    }

    const requestImg = (lbl, anno) => {
        if (props.onGetAnnoExample){
            props.onGetAnnoExample({lbl:lbl, anno:anno})
        }
    }

    const handleImgClick = () => {
        console.log('clicked img')
        // setShowExampleViewer(true)
        // requestImg(myLbl, props.selectedAnno)

        setShowExampleViewer(true)
        // getAnnoExample({llId:myLbl.id, type:'annoBased', drawAnno: true, addContext:0.05})
    }

    const renderExampleImg = () => {
        if (!props.exampleImg) return null
        return <div>
              <Divider onClick={() => handleImgClick()} horizontal> Example </Divider>
              <SiaPopup trigger={<Image src={props.exampleImg.img} rounded centered size='medium'
                onClick={() => handleImgClick()}
              />}
                content={'Click on image to view more examples'} />
              {/* <Image src='https://www.gstatic.com/webp/gallery3/1.png'/> */}
        </div>
    }

    const renderDescription = () => {
        // if (props.selectedAnno){
        // if (myLbl){
            // const selectedLabelIds = props.selectedAnno.labelIds
            // if (!selectedLabelIds) return 'No Label'
            // const lbl = props.possibleLabels.find( e => {
            //     return selectedLabelIds[0] === e.id
            // })
            if (!myLbl) return "No Label"
            return <div>
                <Header>{
                    myLbl.label
                }</Header>
              <div dangerouslySetInnerHTML={{__html: myLbl.description}} />
              {renderExampleImg()}
              <AnnoExampleViewer onRequestExample={() => requestImg(myLbl, props.selectedAnno)} onClose={() => {setShowExampleViewer(false)}} active={showExampleViewer} lbl={myLbl} exampleImg={props.exampleImg} />
            </div>
        // } else {
        //     return 'No Label'
        // }
    }


    return <InfoBox
        header="Label Info"
        content={renderDescription()}
        visible={props.visible}
        defaultPos={props.defaultPos}
        onDismiss={() => onDismiss()}
    />
}


export default LabelInfo
