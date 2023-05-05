import { faPlus, faRemove } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Shimmer } from "react-shimmer";
import { generateVideoThumbnails } from '@rajesh896/video-thumbnails-generator';
import "./previewgallery.css";
import { useContext, useRef } from "react";
import { StateContext, StateContextType } from "../state_context";

type Props = {
    videoThumbnails: Array<{ thumbnail: string, name: string, type: string } | null>,
    setVideoThumbnails: (setSourceUrls: Array<{ thumbnail: string, name: string, type: string } | null>) => void,
    removeVideo: (index: number) => void,
    sourceURLs: Array<string>,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
    currUrlIdx: number,
    setCurrUrlidx: (idx: number) => void,
    splitTimeStamps: StateContextType['splitTimeStamps'],
    setSplitTimeStamps: StateContextType['setSplitTimeStamps'],
}

export default function () {
    const fileinputRef = useRef<HTMLInputElement>(null);

    const ctx = useContext(StateContext);

    if (ctx === null || ctx === undefined) {
        return null;
    }

    const { videoThumbnails, removeVideo, sourceURLs, setSourceUrls, setVideoThumbnails, currUrlIdx, setCurrUrlidx, setSplitTimeStamps, splitTimeStamps }: Props = ctx;

    const addNewVideo = async (files: (FileList | null)) => {
        if (files === null) {
            return;
        }

        const file = files[0];
        const url = URL.createObjectURL(file);
        setSourceUrls([...sourceURLs, url])

        setVideoThumbnails([...videoThumbnails, null]);
        const thumbnail = await generateVideoThumbnails(file, 1, 'jpeg');
        const previewImg = { thumbnail: thumbnail[1] ?? thumbnail[0], name: file?.name ?? `Video ${sourceURLs.length + 1}`, type: file?.type };
        setVideoThumbnails([...videoThumbnails, previewImg]);

        setSplitTimeStamps([...splitTimeStamps, []]);
    }


    if (videoThumbnails?.length === 0) {
        return null;
    }

    return (
        <div className="preview-container">
            {videoThumbnails.map((metadata, index) => (
                <div className='preview-box' onClick={() => setCurrUrlidx(index)} key={`preview-${index}`}>
                    <FontAwesomeIcon icon={faRemove} className="remove-icon" onClick={(e) => { removeVideo(index); e.stopPropagation() }} />
                    {(metadata?.thumbnail !== null && metadata?.thumbnail !== undefined) ? (
                        <img src={metadata?.thumbnail} className={`preview-image preview-image-${(currUrlIdx === index) ? 'active' : 'disabled'}`} />
                    )
                        :
                        <div>
                            <Shimmer width={120} height={120} className={`preview-image preview-image-${(currUrlIdx === index) ? 'active' : 'disabled'}`} />
                        </div>
                    }

                    {(metadata?.name !== null && metadata?.name !== undefined) ? (
                        <div style={{ fontSize: 'small', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 100, textAlign: 'center', marginTop: '0.5rem' }}>
                            {metadata?.name}
                        </div>
                    )
                        :
                        <Shimmer width={120} height={10} className='video-placeholder' />
                    }
                </div>
            ))}
            {videoThumbnails?.length < 5 && (
                <div title="Add another video">
                    <input type="file" onChange={(e) => addNewVideo(e.target.files)} className='hidden' ref={fileinputRef} multiple={false} accept='video/*' />
                    <div className='add-more-videos' onClick={() => fileinputRef?.current?.click()}>
                        <FontAwesomeIcon icon={faPlus} className='plus-icon' />
                    </div>
                    <div style={{ width: 120, height: 10, marginTop: '1.03rem' }} />
                </div>
            )}
        </div>
    )
}