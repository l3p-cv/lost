import React, {useState} from 'react'
import { Divider, Image, Card, Header } from 'semantic-ui-react'
import InfoBox from './InfoBox'
import SiaPopup from '../SiaPopup'
import LabelExampleViewer from '../LabelExampleViewer'
import * as exampleApi from '../../../../../../actions/annoExample/annoExample_api'
const LabelInfo = (props) => {

    const [showExampleViewer, setShowExampleViewer] = useState(false)
    const { data: dataRaw, mutate: getAnnoExample } = exampleApi.useGetAnnoExampleImg({})
    const onDismiss = () => {
        if (props.onDismiss){
            props.onDismiss()
        }
    }

    const handleImgClick = () => {
        console.log('clicked img')
        // setShowExampleViewer(true)
        getAnnoExample({id:1})
    }

    const renderExampleImg = () => {
        return <div>
              <Divider horizontal> Example </Divider>
              <SiaPopup trigger={<Image src={props.exampleImg} rounded
                onClick={() => handleImgClick()}
              />}
                content={'Click on image to view more examples'} />
              {/* <Image src='https://www.gstatic.com/webp/gallery3/1.png'/> */}
        </div>
    }

    const renderDescription = () => {
        if (props.selectedAnno){
            const selectedLabelIds = props.selectedAnno.labelIds
            if (!selectedLabelIds) return 'No Label'
            const lbl = props.possibleLabels.find( e => {
                return selectedLabelIds[0] === e.id
            })
            if (!lbl) return "No Label"
            return <div>
                <LabelExampleViewer active={showExampleViewer} />
                <Header>{
                    lbl.label
                }</Header>
              <div dangerouslySetInnerHTML={{__html: lbl.description}} />
              {renderExampleImg()}
            </div>
        } else {
            return 'No Label'
        }
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
