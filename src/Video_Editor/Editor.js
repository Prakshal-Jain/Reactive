import React from 'react';
import './css/editor.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeUp, faPause, faPlay, faGripLinesVertical, faSync, faStepBackward, faStepForward, faCamera, faDownload, faEraser } from '@fortawesome/free-solid-svg-icons'


class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMuted: false,
            timings: [],
            playing: false,
            currently_grabbed: {"index": 0, "type": "none"},
            difference: 0.2,
            deletingGrabber: false,
            current_warning: null,
            imageUrl: ""
        }
        this.playVideo = React.createRef();
        this.progressBar = React.createRef();
        this.playBackBar = React.createRef();
    }

    warnings = {
        "delete_grabber": (<div>Please click on the grabber (either start or end) to delete it</div>)
    }

    reader = new FileReader();

    componentDidMount = () => {
        // Check if video ended
        var self = this
        this.playVideo.current.addEventListener('timeupdate', function () {
            var curr_idx = self.state.currently_grabbed.index
            var seek = (self.playVideo.current.currentTime - self.state.timings[curr_idx].start) / self.playVideo.current.duration * 100;
            self.progressBar.current.style.width = `${seek}%`;
            if ((self.playVideo.current.currentTime >= self.state.timings[self.state.timings.length-1].end)){
                self.playVideo.current.pause()
                self.setState({playing: false})
            }
            else if(self.playVideo.current.currentTime >= self.state.timings[curr_idx].end){
                if((curr_idx+1) < self.state.timings.length){
                    self.setState({currently_grabbed: {"index": curr_idx+1, "type": "start"}}, () => {
                        self.progressBar.current.style.width = '0%'
                        self.progressBar.current.style.left = `${self.state.timings[curr_idx+1].start / self.playVideo.current.duration * 100}%`;
                        self.playVideo.current.currentTime = self.state.timings[curr_idx+1].start;
                    })
                }
            }
        });

        window.addEventListener("keyup", function (event) {
            if (event.key === " ") {
                self.play_pause();
            }
        });
        var time = this.state.timings
        this.playVideo.current.onloadedmetadata = () => {
            time.push({'start': 0, 'end': this.playVideo.current.duration})
            this.setState({timings: time}, () => {
                this.addActiveSegments()
            });
        }
    }

    reset = () => {
        this.playVideo.current.pause()
        this.setState({
            isMuted: false,
            timings: [{'start': 0, 'end': this.playVideo.current.duration}],
            playing: false,
            currently_grabbed: {"index": 0, "type": "none"},
            difference: 0.2,
            deletingGrabber: false,
            current_warning: null,
            imageUrl: ""
        }, () => {
            this.playVideo.current.currentTime = this.state.timings[0].start;
            this.progressBar.current.style.left = `${this.state.timings[0].start / this.playVideo.current.duration * 100}%`;
            this.progressBar.current.style.width = "0%";
            this.addActiveSegments();
        })
    }

    captureSnapshot = () => {
        var video = this.playVideo.current
        const canvas = document.createElement("canvas");
        // scale the canvas accordingly
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // draw the video at that frame
        canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);
        // convert it to a usable data URL
        const dataURL = canvas.toDataURL();
        this.setState({imageUrl: dataURL})
    }

    downloadSnapshot = () => {
        var a = document.createElement("a"); //Create <a>
        a.href = this.state.imageUrl; //Image Base64 Goes here
        a.download = "Thumbnail.png"; //File name Here
        a.click(); //Downloaded file
    }

    skipPrevious = () => {
        if(this.state.playing){
            this.playVideo.current.pause()
        }
        var prev_idx = (this.state.currently_grabbed.index != 0) ? (this.state.currently_grabbed.index-1) : (this.state.timings.length-1)
        this.setState({currently_grabbed: {"index": prev_idx , "type": "start"}, playing: false}, () => {
            this.progressBar.current.style.left = `${this.state.timings[prev_idx].start / this.playVideo.current.duration * 100}%`;
            this.progressBar.current.style.width = '0%'
            this.playVideo.current.currentTime = this.state.timings[prev_idx].start;
        })
    }

    play_pause = () => {
        var self = this
        if(this.state.playing){
            this.playVideo.current.pause()
        }
        else{
            if ((self.playVideo.current.currentTime >= self.state.timings[self.state.timings.length-1].end)){
                self.playVideo.current.pause()
                self.setState({playing: false, currently_grabbed: {"index": 0, "type": "start"}}, () => {
                    self.playVideo.current.currentTime = self.state.timings[0].start;
                    self.progressBar.current.style.left = `${self.state.timings[0].start / self.playVideo.current.duration * 100}%`;
                    self.progressBar.current.style.width = "0%";
                })
            }
            this.playVideo.current.play()
        }
        this.setState({playing: !this.state.playing})
    }


    skipNext = () => {
        if(this.state.playing){
            this.playVideo.current.pause()
        }
        var next_idx = (this.state.currently_grabbed.index != (this.state.timings.length-1)) ? (this.state.currently_grabbed.index+1) : 0
        this.setState({currently_grabbed: {"index": next_idx , "type": "start"}, playing: false}, () => {
            this.progressBar.current.style.left = `${this.state.timings[next_idx].start / this.playVideo.current.duration * 100}%`;
            this.progressBar.current.style.width = '0%'
            this.playVideo.current.currentTime = this.state.timings[next_idx].start;
        })
    }

    updateProgress = (event) => {
        var playbackRect = this.playBackBar.current.getBoundingClientRect();
        var seekTime = ((event.clientX - playbackRect.left) / playbackRect.width) * this.playVideo.current.duration
        this.playVideo.current.pause()
        // find where seekTime is in the segment
        var index = -1;
        var counter = 0;
        for(let times of this.state.timings){
            if(seekTime >= times.start && seekTime <= times.end){
                index = counter;
            }
            counter += 1;
        }
        if(index == -1){
            return
        }
        this.setState({playing: false, currently_grabbed: {"index": index, "type": "start"}}, () => {
            this.progressBar.current.style.width = '0%' // Since the width is set later, this is necessary to hide weird UI
            this.progressBar.current.style.left = `${this.state.timings[index].start / this.playVideo.current.duration * 100}%`
            this.playVideo.current.currentTime = seekTime
        })
    }

    startGrabberMove = (event) => {
        this.playVideo.current.pause()
        var playbackRect = this.playBackBar.current.getBoundingClientRect();
        var seekRatio = (event.clientX - playbackRect.left) / playbackRect.width
        const index = this.state.currently_grabbed.index
        const type = this.state.currently_grabbed.type
        window.addEventListener("mouseup", () => {window.removeEventListener('mousemove', this.startGrabberMove); this.addActiveSegments()})
        var time = this.state.timings
        var seek = this.playVideo.current.duration * seekRatio
        if((type == "start") && (seek > ((index != 0) ? (time[index-1].end+this.state.difference+0.2) : 0)) && seek < time[index].end-this.state.difference){
            this.progressBar.current.style.left = `${seekRatio*100}%`
            this.playVideo.current.currentTime = seek
            time[index]["start"] = seek
            this.setState({timings: time, playing: false})
        }
        else if((type == "end") && (seek > time[index].start+this.state.difference) && (seek < (index != (this.state.timings.length-1) ? time[index+1].start-this.state.difference-0.2 : this.playVideo.current.duration))){
            this.progressBar.current.style.left = `${time[index].start / this.playVideo.current.duration * 100}%`
            this.playVideo.current.currentTime = time[index].start
            time[index]["end"] = seek
            this.setState({timings: time, playing: false})
        }
        this.progressBar.current.style.width = "0%"
    }

    renderGrabbers = () => {
        return this.state.timings.map((x, index) => (
            <div key={"grabber_"+index}>
                <div className="grabber start" style={{left: `${x.start / this.playVideo.current.duration * 100}%`}} onMouseDown={(event) => {
                    if(this.state.deletingGrabber){
                        this.deleteGrabber(index)
                    }
                    else{
                        this.setState({currently_grabbed: {"index": index, "type": "start"}}, () => {
                            window.addEventListener('mousemove', this.startGrabberMove);
                        });
                    }
                }}>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="10" height="14" viewBox="0 0 10 14" xmlSpace="preserve">
                        <path className="st0" d="M1 14L1 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C2 13.6 1.6 14 1 14zM5 14L5 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C6 13.6 5.6 14 5 14zM9 14L9 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C10 13.6 9.6 14 9 14z"/>
                    </svg>
                </div>
                <div className="grabber end" style={{left: `${x.end / this.playVideo.current.duration * 100}%`}} onMouseDown={(event) => {
                    if(this.state.deletingGrabber){
                        this.deleteGrabber(index)
                    }
                    else{
                        this.setState({currently_grabbed: {"index": index, "type": "end"}}, () => {
                            window.addEventListener('mousemove', this.startGrabberMove);
                        });
                    }
                }}>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="10" height="14" viewBox="0 0 10 14" xmlSpace="preserve">
                        <path className="st0" d="M1 14L1 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C2 13.6 1.6 14 1 14zM5 14L5 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C6 13.6 5.6 14 5 14zM9 14L9 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C10 13.6 9.6 14 9 14z"
                        />
                    </svg>
                </div>
            </div>
        ))
    }

    addGrabber = () => {
        var time = this.state.timings
        var end = time[time.length-1].end+this.state.difference
        this.setState({deletingGrabber: false, current_warning: null})
        if(end >= this.playVideo.current.duration){
            return
        }
        time.push({"start": end+0.2, "end": this.playVideo.current.duration})
        this.setState({timings: time}, () => {
            this.addActiveSegments()
        })
    }

    preDeleteGrabber = () => {
        if(this.state.deletingGrabber){
            this.setState({deletingGrabber: false, current_warning: null})
        }
        else{
            this.setState({deletingGrabber: true, current_warning: "delete_grabber"});
        }
    }

    deleteGrabber = (index) => {
        var time = this.state.timings
        this.setState({timings: time, deletingGrabber: false, current_warning: null, currently_grabbed: {"index": 0, "type": "start"}})
        if(time.length == 1){
            return
        }
        time.splice(index, 1);
        this.progressBar.current.style.left = `${time[0].start / this.playVideo.current.duration * 100}%`;
        this.playVideo.current.currentTime = time[0].start;
        this.progressBar.current.style.width = "0%";
        this.addActiveSegments();
    }

    addActiveSegments = () => {
        var colors = ""
        var counter = 0
        colors += `, rgb(240, 240, 240) 0%, rgb(240, 240, 240) ${this.state.timings[0].start / this.playVideo.current.duration * 100}%`
        for(let times of this.state.timings){
            if(counter > 0){
                colors += `, rgb(240, 240, 240) ${this.state.timings[counter-1].end / this.playVideo.current.duration * 100}%, rgb(240, 240, 240) ${times.start / this.playVideo.current.duration * 100}%`
            }
            colors += `, #ccc ${times.start / this.playVideo.current.duration * 100}%, #ccc ${times.end / this.playVideo.current.duration * 100}%`
            counter += 1
        }
        colors += `, rgb(240, 240, 240) ${this.state.timings[counter-1].end / this.playVideo.current.duration * 100}%, rgb(240, 240, 240) 100%`
        this.playBackBar.current.style.background = `linear-gradient(to right${colors})`;
    }

    saveVideo = () => {
        var metadata = {
            "trim_times": this.state.timings,
            "mute": this.state.isMuted
        }
        this.props.saveVideo(metadata)
    }

    render = () => {
        return(
            <div className="wrapper">
                <video className="video" autoload="metadata" muted={this.state.isMuted} ref={this.playVideo} onClick={this.play_pause.bind(this)} >
                    <source src={this.props.videoUrl} type="video/mp4" />
                </video>
                <div className="playback">
                    {this.renderGrabbers()}
                    <div className="seekable" ref={this.playBackBar} onClick={this.updateProgress}></div>
                    <div className="progress" ref={this.progressBar}></div>
                </div>

                <div className="controls">
                    <div className="player-controls">
                        <button className="settings-control" title="Reset Video" onClick={this.reset}><FontAwesomeIcon icon={faSync} /></button>
                        <button className="settings-control" title="Mute/Unmute Video" onClick={() => this.setState({isMuted: !this.state.isMuted})}>{this.state.isMuted ? <FontAwesomeIcon icon={faVolumeMute} /> : <FontAwesomeIcon icon={faVolumeUp} />}</button>
                        <button className="settings-control" title="Capture Thumbnail" onClick={this.captureSnapshot}><FontAwesomeIcon icon={faCamera} /></button>
                    </div>
                    <div className="player-controls">
                        <button className="seek-start" title="Skip to previous clip" onClick={this.skipPrevious}><FontAwesomeIcon icon={faStepBackward} /></button>
                        <button className="play-control" title="Play/Pause" onClick={this.play_pause.bind(this)} >{this.state.playing ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} /> }</button>
                        <button className="seek-end" title="Skip to next clip" onClick={this.skipNext}><FontAwesomeIcon icon={faStepForward} /></button>
                    </div>
                    <div>
                        <button title="Add grabber" className="trim-control margined" onClick={this.addGrabber}>Add <FontAwesomeIcon icon={faGripLinesVertical} /></button>
                        <button title="Delete grabber" className="trim-control margined" onClick={this.preDeleteGrabber}>Delete <FontAwesomeIcon icon={faGripLinesVertical} /></button>
                        <button title="Save changes" className="trim-control" onClick={this.saveVideo}>Save</button>
                    </div>
                </div>
                {this.state.current_warning != null ? <div className={"warning"}>{this.warnings[this.state.current_warning]}</div> : ""}
                {(this.state.imageUrl != "") ? 
                    <div className={"marginVertical"}>
                        <img src={this.state.imageUrl} className={"thumbnail"} />
                        <div className="controls">
                            <div className="player-controls">
                                <button className="settings-control" title="Reset Video" onClick={this.downloadSnapshot}><FontAwesomeIcon icon={faDownload} /></button>
                                <button className="settings-control" title="Save Video" onClick={() => {this.setState({imageUrl: ""})}}><FontAwesomeIcon icon={faEraser} /></button>
                            </div>
                        </div>
                    </div>
                : ""}
            </div>
        )
    }
}

export default Editor