import * as React from 'react';
import { faPause, faPlay, faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useRef } from 'react';
import "./editor.css";
import PreviewGallery from '../components/PreviewGallery';
import { StateContext, StateContextType } from '../state_context';
import { useEffect } from 'react';
import Progressbar from '../components/Progressbar';

type Props = {
    sourceURLs: Array<string>,
    videoThumbnails: StateContextType['videoThumbnails'],
    setVideoThumbnails: StateContextType['setVideoThumbnails'],
    removeVideo: (index: number) => void,
    currUrlIdx: number,
    setCurrUrlidx: (idx: number) => void,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
    splitTimeStamps: StateContextType['splitTimeStamps'],
    setSplitTimeStamps: StateContextType['setSplitTimeStamps'],
}

var throttle = require('lodash/throttle');

export default function () {

    useEffect(() => {
        const unloadCallback = (event: Event) => {
            event.preventDefault();
            event.returnValue = false;
            return null;
        };

        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, []);

    const ctx = React.useContext(StateContext);

    if (ctx === null || ctx === undefined) {
        return null;
    }

    const { sourceURLs, videoThumbnails, removeVideo, currUrlIdx, setSourceUrls, setVideoThumbnails, setCurrUrlidx, splitTimeStamps, setSplitTimeStamps }: Props = ctx;

    const videoRef = useRef<HTMLVideoElement>(null);
    const playBackBarRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);


    const [isPortrait, setIsPortrait] = useState<boolean>(false);
    const [seekTime, setSeekTime] = useState<{ time: string, offset: number } | null>(null);

    const [isMuted, setIsMuted] = useState<boolean>(false);

    const [isPlaying, setIsPlaying] = useState<boolean>(videoRef?.current?.paused ?? false);

    const handleLoadedVideo = (videoElement: any) => {
        if (videoElement.clientHeight > videoElement.clientWidth) {
            setIsPortrait(true);
        }
        else {
            setIsPortrait(false);
        }

        if (splitTimeStamps[currUrlIdx].length === 0) {
            const splitVideo = [...splitTimeStamps];
            splitVideo[currUrlIdx].push({ start: 0, end: videoElement.duration });
            setSplitTimeStamps(splitVideo);
        }
    }

    function getVideoDuration(durationInSeconds: number) {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return formattedDuration;
    }

    const getSeekTimeFromOffset = (offset: number) => {
        if (playBackBarRef?.current && videoRef?.current) {
            const playbackRect: DOMRect = playBackBarRef.current.getBoundingClientRect();
            const seekTime = ((offset - playbackRect.left) / playbackRect.width) * videoRef.current.duration;
            return seekTime;
        }
        return 0;
    }

    const displayVideoSeekTime = throttle((offset: number) => {
        if (playBackBarRef?.current && videoRef?.current) {
            const playbackRect: DOMRect = playBackBarRef.current.getBoundingClientRect();
            const seekTime = ((offset - playbackRect.left) / playbackRect.width) * videoRef.current.duration;
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

    const updateProgress = (offset: number) => {
        const seekTime = getSeekTimeFromOffset(offset);
        videoRef?.current?.pause();
        setIsPlaying(false);
    }

    return (
        <div>
            <h3 style={{ textAlign: 'center' }}>{videoThumbnails[currUrlIdx]?.name}</h3>
            <div className='video-editor-container' key={`${videoThumbnails[currUrlIdx]?.name}-${currUrlIdx}-video`}>
                <video
                    ref={videoRef}
                    onLoadedMetadata={(event) => handleLoadedVideo(event.target)}
                    // onLoadedData={(e) => console.log(e)}
                    className={`video-element ${isPortrait ? 'portrait' : 'landscape'}`}
                    muted={isMuted}
                    onClick={setPlayPause}
                    key={`${videoThumbnails[currUrlIdx]?.name}-${currUrlIdx}-video-element`}
                >
                    <source src={sourceURLs[currUrlIdx]} type='video/mp4' />
                </video>

                <div className="progressbar-container">
                    {seekTime !== null && (
                        <div style={{ left: seekTime?.offset }} className='seektime'>
                            {seekTime?.time}
                        </div>
                    )}

                    <Progressbar videoRef={videoRef} />

                    {/* <div
                        className='progressbar-base'
                        ref={playBackBarRef}
                        onClick={(event) => updateProgress(event.clientX)}
                        onMouseEnter={() => { setSeekTime(null); }}
                        onMouseMove={(event) => displayVideoSeekTime(event.clientX)}
                        onMouseLeave={() => { setSeekTime(null); displayVideoSeekTime.cancel() }}
                    /> */}
                </div>

                <div className='controls'>
                    <div className="controls-group">
                        <button className='control-btn' title='Mute/Unmute Video' onClick={() => setIsMuted(!isMuted)}>{isMuted ? <FontAwesomeIcon icon={faVolumeMute} className='control-icon' /> : <FontAwesomeIcon icon={faVolumeUp} className='control-icon' />}</button>
                    </div>
                    <div className="controls-group">
                        <button className='control-btn' title='Play/Pause Video' onClick={setPlayPause}>{isPlaying ? <FontAwesomeIcon icon={faPause} className='control-icon' /> : <FontAwesomeIcon icon={faPlay} className='control-icon' />}</button>
                    </div>
                </div>

                <PreviewGallery />
            </div>
        </div>
    )
}