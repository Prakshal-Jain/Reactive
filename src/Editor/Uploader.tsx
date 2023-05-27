import { faAngleRight, faSmile, faSmileWink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { useEffect } from 'react';
import { FileDrop } from 'react-file-drop'
import './uploader.css';
import { generateVideoThumbnails } from '@rajesh896/video-thumbnails-generator';
import PreviewGallery from '../components/PreviewGallery';
import { useContext } from 'react';
import { StateContext, StateContextType } from '../state_context';

type Props = {
    sourceURLs: Array<string>,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
    videoThumbnails: StateContextType['videoThumbnails'],
    setVideoThumbnails: StateContextType['setVideoThumbnails'],
    removeVideo: (index: number) => void,
    setShowEditor: (setShowEditor: boolean) => void,
    currUrlIdx: number,
    setCurrUrlidx: (idx: number) => void,
    splitTimeStamps: StateContextType['splitTimeStamps'],
    setSplitTimeStamps: StateContextType['setSplitTimeStamps'],
    MAX_VIDEO_LIMIT: StateContextType['MAX_VIDEO_LIMIT'],
}

export default function () {
    const fileinputRef = useRef<HTMLInputElement>(null);

    const ctx = useContext(StateContext);

    if (ctx === null || ctx === undefined) {
        return null;
    }

    const { sourceURLs, setSourceUrls, videoThumbnails, setVideoThumbnails, removeVideo, setShowEditor, currUrlIdx, setCurrUrlidx, splitTimeStamps, setSplitTimeStamps, MAX_VIDEO_LIMIT }: Props = ctx;

    useEffect(() => {
        document.addEventListener('drop', function (e) {
            e.preventDefault()
            e.stopPropagation()
        })
    }, []);

    const uploadVideo = async (files: (FileList | null)) => {
        const allFiles = Array.from(files ?? []).slice(0, MAX_VIDEO_LIMIT);

        const thumbnails: Array<{ thumbnails: Array<string>, name: string, type: string } | null> = Array(allFiles.length).fill(null);
        const toUpload: Array<string> = allFiles.map((v, i) => {
            const url: string = URL.createObjectURL(v);

            return url;
        });

        setSourceUrls([...sourceURLs, ...toUpload]);
        setSplitTimeStamps([...splitTimeStamps, ...Array(allFiles.length).fill(0).map(_ => [])]);
        setVideoThumbnails([...videoThumbnails, ...thumbnails]);

        for (let i = 0; i < allFiles.length; i++) {
            const thumbnailArray = await generateVideoThumbnails(allFiles[i], 10, 'jpeg');
            thumbnails[i] = { thumbnails: thumbnailArray, name: allFiles[i]?.name ?? `Video ${i + 1}`, type: allFiles[i]?.type };
        }
        setVideoThumbnails([...videoThumbnails, ...thumbnails]);
    }

    return (
        <div className="uploader-preview-box">
            <div className={'uploader-container'}>
                <input
                    onChange={(e) => uploadVideo(e.target.files)}
                    type='file'
                    className='hidden'
                    ref={fileinputRef}
                    multiple={true}
                    accept='video/*'
                />

                <FileDrop
                    onDrop={uploadVideo}
                    onTargetClick={() => fileinputRef?.current?.click()}
                >
                    <div>
                        Click or drop your videos here to edit!
                    </div>

                    {(sourceURLs?.length > 0) && (
                        (sourceURLs?.length >= 5) ?
                            <div style={{ fontWeight: 'normal', marginTop: '0.5rem' }}>You can only add upto 5 videos <FontAwesomeIcon icon={faSmile} style={{ color: 'rgb(255, 204, 0)' }} /></div>
                            :
                            <div style={{ fontWeight: 'normal', marginTop: '0.5rem' }}>Don't shy. You can add upto 5 videos at a time <FontAwesomeIcon icon={faSmileWink} style={{ color: 'rgb(255, 204, 0)' }} /></div>
                    )}
                </FileDrop>
            </div>

            <PreviewGallery />

            {(sourceURLs?.length > 0) && (
                <button className="start-editing-button" onClick={() => setShowEditor(true)}>
                    <div>
                        Start Editing
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </div>
                </button>
            )}
        </div>
    )
}