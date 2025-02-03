import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Card, ModalBody, ModalHeader } from 'reactstrap'
import actions from '../../../../../../actions/pipeline/pipelineRunning'

const { downloadImage } = actions

const VisualOutputModal = ({ visualOutput, downloadImage }) => {
    const [items, setItems] = useState([])

    useEffect(() => {
        const arr = visualOutput.map((el) => downloadImage(el.imagePath))

        Promise.all(arr).then((images) => {
            const itemsArr = images.map((el, i) => ({
                url: el,
                html: visualOutput[i].htmlOutput,
            }))
            setItems(itemsArr)
        })
    }, [visualOutput, downloadImage])

    return (
        <>
            <ModalHeader>VisualOutput Modal</ModalHeader>
            <ModalBody>
                {items.map((el, index) => (
                    <Card key={index}>
                        <div
                            style={{ textAlign: 'center' }}
                            dangerouslySetInnerHTML={{ __html: el.html }}
                        />
                        <img
                            style={{ padding: '15px' }}
                            width="100%"
                            height="auto"
                            alt="noImage"
                            src={el.url}
                        />
                    </Card>
                ))}
            </ModalBody>
        </>
    )
}

export default connect(null, { downloadImage })(VisualOutputModal)
