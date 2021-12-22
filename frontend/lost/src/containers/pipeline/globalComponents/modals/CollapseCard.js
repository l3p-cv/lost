import React, { Component } from 'react'
import { Collapse, Button, Card, CardBody } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/free-solid-svg-icons'
class CollapseCustom extends Component {
    constructor(props) {
        super(props)
        this.toggle = this.toggle.bind(this)
        this.state = { collapse: false }
    }
    toggle() {
        this.setState({ collapse: !this.state.collapse })
    }
    render() {
        return (
            <>
                <Button
                    block
                    className="text-left m-1 p-1"
                    onClick={this.toggle}
                    style={{ marginTop: 20, marginRight: 10, marginBottom: '1rem' }}
                >
                    <h5 className="m-0 p-0">
                        {' '}
                        <FontAwesomeIcon
                            icon={this.props.icon ? this.props.icon : faInfo}
                            color="#00294B"
                            size="1x"
                        />
                        &nbsp;&nbsp;&nbsp;
                        {this.props.buttonText
                            ? this.props.buttonText
                            : 'More Information'}{' '}
                    </h5>
                </Button>
                <Collapse isOpen={this.state.collapse}>
                    <Card>
                        <CardBody>{this.props.children}</CardBody>
                    </Card>
                </Collapse>
            </>
        )
    }
}

export default CollapseCustom
