import React from "react";

interface ILeftPanelProps {
    someDefaultValue?: string;
}

interface ILeftPanelState {
    someValue: string;
}

export default class LeftPanel extends React.Component<ILeftPanelProps, ILeftPanelState> {
    constructor(props: ILeftPanelProps) {
        super(props);
        this.state = { someValue: this.props.someDefaultValue || "" };
    }

    public render() {
        return (
            <div id="file-container">
                Value set as {this.state.someValue}
            </div>
        );
    }
}
