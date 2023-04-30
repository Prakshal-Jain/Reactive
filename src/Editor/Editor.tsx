import * as React from 'react';
import { faPause, faPlay, faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useRef } from 'react';
import "./editor.css";
import { useEffect } from 'react';

type Props = {
    sourceURLs: Array<string>,
    videoThumbnails: Array<{ thumbnail: string, name: string } | null>,
    removeVideo: (index: number) => void,
    currUrlIdx: number,
}

var throttle = require('lodash/throttle');

export default function ({ sourceURLs, videoThumbnails, removeVideo, currUrlIdx }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playBackBarRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);


    const [isPortrait, setIsPortrait] = useState<boolean>(false);
    const [seekTime, setSeekTime] = useState<{ time: string, offset: number } | null>(null);

    const [isMuted, setIsMuted] = useState<boolean>(false);

    const [isPlaying, setIsPlaying] = useState<boolean>(videoRef?.current?.paused ?? false);

    const handleLoadedVideo = (videoElement: any) => {
        if (videoElement.clientHeight > window.innerHeight) {
            setIsPortrait(true);
        }
        else {
            setIsPortrait(false);
        }
    }

    function getVideoDuration(durationInSeconds: number) {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return formattedDuration;
    }

    const displayVideoSeekTime = throttle((offset: number) => {
        if (playBackBarRef?.current && videoRef?.current) {
            const playbackRect: DOMRect = playBackBarRef.current.getBoundingClientRect()
            const seekTime = ((offset - playbackRect.left) / playbackRect.width) * videoRef.current.duration
            const time = getVideoDuration(seekTime);
            setSeekTime({ time, offset: (offset - playbackRect.left) - 35 });
        }
    }, 500, { leading: false });

    const setPlayPause = () => {
        if (isPlaying) {
            videoRef?.current?.pause();
        }
        else {
            videoRef?.current?.play();
        }
        setIsPlaying(!isPlaying);
    }

    return (
        <div className='video-editor-container'>
            <video
                ref={videoRef}
                onLoadedMetadata={(event) => handleLoadedVideo(event.target)}
                onLoadedData={(e) => console.log(e)}
                className={`video-element ${isPortrait ? 'portrait' : 'landscape'}`}
                muted={isMuted}
                onClick={setPlayPause}
            >
                <source src={sourceURLs[currUrlIdx]} type='video/mp4' />
            </video>

            <div className="progressbar-container">
                {seekTime !== null && (
                    <div style={{ left: seekTime?.offset }} className='seektime'>
                        {seekTime?.time}
                    </div>
                )}

                <div
                    className='progressbar-base'
                    ref={playBackBarRef}
                    onClick={() => {/* Update Progress here */ }}
                    onMouseEnter={() => { setSeekTime(null); }}
                    onMouseMove={(event) => displayVideoSeekTime(event.clientX)}
                    onMouseLeave={() => { setSeekTime(null); displayVideoSeekTime.cancel() }}
                />
                <div className='progress' ref={progressBarRef}></div>
            </div>

            <div className='controls'>
                <div className="controls-group">
                    <button className='control-btn' title='Mute/Unmute Video' onClick={() => setIsMuted(!isMuted)}>{isMuted ? <FontAwesomeIcon icon={faVolumeMute} className='control-icon' /> : <FontAwesomeIcon icon={faVolumeUp} className='control-icon' />}</button>
                </div>
                <div className="controls-group">
                    <button className='control-btn' title='Play/Pause Video' onClick={setPlayPause}>{isPlaying ? <FontAwesomeIcon icon={faPause} className='control-icon' /> : <FontAwesomeIcon icon={faPlay} className='control-icon' />}</button>
                </div>
            </div>
        </div>
    )
}