import React from 'react';
import { FileDrop } from 'react-file-drop'
import './css/editor.css'
import Editor from './Editor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb, faMoon } from '@fortawesome/free-solid-svg-icons'

class VideoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpload: true,
            videoUrl: "",
            isDarkMode: false,
        }
    }

    componentDidMount = () => {
        this.toggleThemes()
        document.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
          });
    }

    render_uploader = () => {
        return(
            <div className={"wrapper"}>
                <input
                    onChange={(e) => this.upload_file(e.target.files)}
                    type="file"
                    className="hidden"
                    id="up_file"
                />
                <FileDrop
                    onDrop={(e) => this.upload_file(e)}
                    onTargetClick={() => document.getElementById("up_file").click()}
                >
                    Click or drop your video here to edit!
                </FileDrop>
            </div>
        )
    }

    render_editor = () => {
        return(
            // Props:
            // videoUrl --> URL of uploaded video
            // saveVideo(<metadata of edited video>) --> gives the cut times and if video is muted or not
            <Editor videoUrl={this.state.videoUrl}/>
        )
    }

    toggleThemes = () =>{
        if(this.state.isDarkMode){
            document.body.style.backgroundColor = "#1f242a";
            document.body.style.color = "#fff";
        }
        else{
            document.body.style.backgroundColor = "#fff";
            document.body.style.color = "#1f242a";
        }
        this.setState({isDarkMode: !this.state.isDarkMode})
    }

    upload_file = (fileInput) => {
		let fileUrl = window.URL.createObjectURL(fileInput[0]);
        let filename = fileInput.name;
        this.setState({
            isUpload: false,
            videoUrl: fileUrl
        })
    }

    render = () => {
        return(
            <div>
                {this.state.isUpload ? this.render_uploader() : this.render_editor()}
                <div className={"theme_toggler"} onClick={this.toggleThemes}>{this.state.isDarkMode? (<i className="toggle" aria-hidden="true"><FontAwesomeIcon icon={faLightbulb} /></i>) : <i className="toggle"><FontAwesomeIcon icon={faMoon} /></i>}</div>
            </div>
        )
    }
}

export default VideoEditor