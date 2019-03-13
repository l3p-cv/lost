import React, { Component } from 'react'
import { Collapse, Button, Card, CardBody } from 'reactstrap'
class CollapseCustom extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { collapse: false };
    }
    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }
    render() {
        return (
            <>
                <Button color="primary" onClick={this.toggle} style={{ marginTop:20, marginBottom: '1rem' }}>More Information</Button>
                <Collapse isOpen={this.state.collapse}>
                    <Card>
                        <CardBody>
                            {this.props.children}
                        </CardBody>
                    </Card>
                </Collapse>
            </>
        )
    }
}

export default CollapseCustom