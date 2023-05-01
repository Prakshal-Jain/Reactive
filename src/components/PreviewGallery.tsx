import { faPlus, faRemove } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Shimmer } from "react-shimmer";
import { generateVideoThumbnails } from '@rajesh896/video-thumbnails-generator';
import "./previewgallery.css";
import { useRef } from "react";

type Props = {
    videoThumbnails: Array<{ thumbnail: string, name: string, type: string } | null>,
    setVideoThumbnails: (setSourceUrls: Array<{ thumbnail: string, name: string, type: string } | null>) => void,
    removeVideo: (index: number) => void,
    sourceURLs: Array<string>,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
}

export default function ({ videoThumbnails, removeVideo, sourceURLs, setSourceUrls, setVideoThumbnails }: Props) {
    const fileinputRef = useRef<HTMLInputElement>(null);

    const addNewVideo = async (files: (FileList | null)) => {
        if (files === null) {
            return;
        }

        const file = files[0];
        const url = URL.createObjectURL(file);
        setSourceUrls([...sourceURLs, url])

        const thumbnail = await generateVideoThumbnails(file, 1, 'jpeg');
        const previewImg = { thumbnail: thumbnail[1] ?? thumbnail[0], name: file?.name ?? `Video ${sourceURLs.length + 1}`, type: file?.type };
        setVideoThumbnails([...videoThumbnails, previewImg]);
    }


    if (videoThumbnails?.length === 0) {
        return null;
    }
    return (
        <div className="preview-container">
            {videoThumbnails.map((metadata, index) => (
                <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faRemove} className="remove-icon" onClick={() => removeVideo(index)} />
                    {(metadata?.thumbnail !== null && metadata?.thumbnail !== undefined) ? (
                        <img src={metadata?.thumbnail} className="preview-image" />
                    )
                        :
                        <div>
                            <Shimmer width={120} height={120} className='preview-image' />
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
                <div>
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