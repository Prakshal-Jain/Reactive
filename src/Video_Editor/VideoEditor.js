import React from 'react';
import { FileDrop } from 'react-file-drop'
import './css/editor.css'
import Editor from './Editor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb, faMoon } from '@fortawesome/free-solid-svg-icons'
import ReactNotification from 'react-notifications-component'
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'

class VideoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpload: true,
            videos: [],
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
                    accept={"video/*"}
                    type="file"
                    className="hidden"
                    id="up_file"
                    multiple
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

    saveVideo = (metadata) => {
        console.log(metadata)
        alert("Please check your console to see all the metadata. This can be used for video post-processing.")
    }

    render_editor = () => {
        return(
            // Props:
            // videos --> videos data
            // saveVideo(<metadata of edited video>) --> gives the cut times and if video is muted or not
            <Editor videoUrl={this.state.videos} saveVideo={this.saveVideo}/>
        )
    }

    renderNotification = (text, type) => {
        store.addNotification({
            message: text,
            type: type,
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 5000,
              onScreen: true
            }
        });
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
        for(let files of fileInput){
            if(!files.type.match("video/*")){
                this.renderNotification("Please upload only video files.", "danger")
                return
            }
        }
        this.setState({
            isUpload: false,
            videos: fileInput
        })
    }

    render = () => {
        return(
            <div>
                {this.state.isUpload ? this.render_uploader() : this.render_editor()}
                <div className={"theme_toggler"} onClick={this.toggleThemes}>{this.state.isDarkMode? (<i className="toggle" aria-hidden="true"><FontAwesomeIcon icon={faLightbulb} /></i>) : <i className="toggle"><FontAwesomeIcon icon={faMoon} /></i>}</div>
                <ReactNotification />
            </div>
        )
    }
}

export default VideoEditor