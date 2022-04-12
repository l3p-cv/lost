import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../../actions'

const { getMiaImage, miaToggleActive } = actions

class MIAImage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            image: {
                id: this.props.image.id,
                data: '',
            },
            clicks: 0,
            timer: undefined,
            classes: '',
        }
        this.imageClick = this.imageClick.bind(this)
    }
    componentDidMount() {
        const image = this.props.getMiaImage(this.props.image)
        image.then((response) =>
            this.setState({ image: { ...this.state.image, data: response.data } }),
        )
    }

    componentWillReceiveProps(props) {
        if (props.image.is_active) {
            this.setState({
                classes: this.state.classes.replace(' mia-image-inactive', ''),
            })
        } else {
            this.setState({ classes: `${this.state.classes} mia-image-inactive` })
        }
    }
    imageClick = () => {
        let newClicks = this.state.clicks + 1
        this.setState({ clicks: newClicks })
        if (newClicks === 1) {
            this.setState({
                timer: setTimeout(() => {
                    // reset.
                    this.setState({ clicks: 0 })
                    this.setState({
                        classes: this.state.classes.replace(' mia-image-zoomed', ''),
                    })
                    if (this.props.image.is_active) {
                        this.props.miaToggleActive({
                            image: { ...this.props.image, is_active: false },
                        })
                    } else {
                        this.props.miaToggleActive({
                            image: { ...this.props.image, is_active: true },
                        })
                    }
                }, 250),
            })
        } else {
            clearTimeout(this.state.timer)
            this.setState({ clicks: 0 })
            if (this.state.classes.includes(' mia-image-zoomed')) {
                this.setState({
                    classes: this.state.classes.replace(' mia-image-zoomed', ''),
                })
            } else {
                this.setState({ classes: `${this.state.classes} mia-image-zoomed` })
            }
        }
    }

    render() {
        return (
            <img
                alt={this.props.key}
                id={this.props.key}
                onClick={this.imageClick}
                src={this.state.image.data}
                className={`mia-image ${this.state.classes}`}
                height={this.props.height}
            />
        )
    }
}

export default connect(null, { getMiaImage, miaToggleActive })(MIAImage)
