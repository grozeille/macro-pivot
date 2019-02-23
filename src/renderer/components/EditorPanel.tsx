import React from "react";

interface IEditorPanelProps {
    someDefaultValue?: string;
}

interface IEditorPanelState {
    someValue: string;
}

export default class EditorPanel extends React.Component<IEditorPanelProps, IEditorPanelState> {
    constructor(props: IEditorPanelProps) {
        super(props);
        this.state = { someValue: this.props.someDefaultValue || "" };
    }

    public render() {
        return (
            <div id="editor-container"></div>
        );
    }
}
