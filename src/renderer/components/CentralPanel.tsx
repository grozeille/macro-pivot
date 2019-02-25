import React from "react";
import ExecutionMacroPanel from "./ExecutionMacroPanel";
import EditorPanel from "./EditorPanel";
import { ResizeObserver } from "resize-observer";

export default class CentralPanel extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    public render() {
        return (
            <div id="editor-panel">
                <div id="editor-tab-panel">
                    <ul className="mui-tabs__bar">
                        <li className="mui--is-active">
                            <a data-mui-toggle="tab" data-mui-controls="editor-tab">Editeur</a>
                        </li>
                        <li>
                            <a data-mui-toggle="tab" data-mui-controls="macro-tab">Paramétrage</a>
                        </li>
                    </ul>

                    <div className="mui-tabs__pane mui--is-active" id="editor-tab">
                        <EditorPanel />
                    </div>

                    <div className="mui-tabs__pane" id="macro-tab">
                        <ExecutionMacroPanel />
                    </div>
                </div>
            </div>
        );
    }
}
