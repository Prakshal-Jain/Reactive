import React from 'react';
import './css/editor.css'
import Checkbox from '../Checkbox'

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMuted: false
        }
    }

    render = () => {
        console.log(this.props.videoUrl)
        return(
            <div>
                <div className={"uploader_container"}>
                    <video className={"video"} src={this.props.videoUrl} loop muted={this.state.isMuted} controls={true}></video>
                </div>
                <div className={"toolBar"}>

                    <Checkbox label={"Muted"} checked={this.state.isMuted} onCheck={() => {this.setState({isMuted: true})}} onUncheck={() => {this.setState({isMuted: false})}} isActive={true}/>
                </div>
            </div>
        )
    }
}

export default Editor