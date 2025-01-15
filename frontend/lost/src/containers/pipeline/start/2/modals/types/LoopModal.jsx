import React, { Component } from "react";
import Table from "../../../../globalComponents/modals/Table";

// import actions from "actions/pipeline/pipelineStartModals/loop";
import actions from "../../../../../../actions/pipeline/pipelineStartModals/loop"
import { Input } from "reactstrap";
import { connect } from "react-redux";
const { inputMaxIteration } = actions;

class LoopModal extends Component {
  constructor() {
    super();
    this.onInput = this.onInput.bind(this);
  }
  onInput(e) {
    let number = Number(e.target.value);
    if (typeof number === "number") {
      this.props.inputMaxIteration(this.props.peN, number);
    }
  }
  render() {
    return (
      <Table
        data={[
          {
            key: "Max Iteration",
            value:
              typeof this.props.exportData.loop.maxIteration === "number" ? (
                <Input
                  min={-1}
                  onInput={this.onInput}
                  defaultValue={this.props.exportData.loop.maxIteration}
                  placeholder="Amount"
                  type="number"
                  step="1"
                />
              ) : (
                "Infinity"
              )
          }
        ]}
      />
    );
  }
}

export default connect(
  null,
  { inputMaxIteration }
)(LoopModal);
