import "./progressbar.css";
import { MouseEventHandler, SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import { StateContext, StateContextType } from '../state_context';
import { Shimmer } from "react-shimmer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faGripLinesVertical, faGripVertical } from "@fortawesome/free-solid-svg-icons";

type Props = {
    currUrlIdx: number,
    videoThumbnails: StateContextType['videoThumbnails'],
    PROGRESSBAR_IMAGES_COUNT: StateContextType['PROGRESSBAR_IMAGES_COUNT'],
    splitTimeStamps: StateContextType['splitTimeStamps'],
    setSplitTimeStamps: StateContextType['setSplitTimeStamps'],
}

type CropperSectionProps = {
    left: number,
    right: number,
    onMouseDown: (event: any) => void,
    onMouseUp: (event: any) => void,
}

function CroppedSection({ left, right, onMouseDown, onMouseUp }: CropperSectionProps) {
    const width = right - left - 17;
    return (
        <div className="cropped-section-left" style={{ left: `${left}px`, width: `${width}px` }}>
            <div className="start-grabber" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
                <FontAwesomeIcon icon={faGripLinesVertical} className="grip-icon" />
            </div>
            <div className="end-grabber">
                <FontAwesomeIcon icon={faGripLinesVertical} className="grip-icon" />
            </div>
        </div>)
}

export default function Progressbar({ videoDuration }: { videoDuration: number | undefined }) {
    const ctx = useContext(StateContext);
    const progressRef = useRef<HTMLDivElement>(null);
    const [imgWidth, setimgWidth] = useState<number | null>(null);

    useEffect(() => {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        if (boundingRect !== null && boundingRect !== undefined && boundingRect?.width !== imgWidth && progressRef?.current !== undefined) {
            setimgWidth(boundingRect.width / PROGRESSBAR_IMAGES_COUNT);
        }
    }, [progressRef.current?.getBoundingClientRect()])


    if (ctx === null || ctx === undefined) {
        return null;
    }

    const { videoThumbnails, currUrlIdx, splitTimeStamps, setSplitTimeStamps, PROGRESSBAR_IMAGES_COUNT }: Props = ctx;

    const getOffsetFromTimestamp = (timestamp: number) => {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        if (videoDuration !== undefined && boundingRect !== null && boundingRect !== undefined) {
            return (timestamp / videoDuration) * boundingRect?.width;
        }
        return 50;
    }

    return (
        <div className="progressbar-container" ref={progressRef}>
            {(imgWidth !== null && videoThumbnails !== null && videoThumbnails[currUrlIdx] !== null) ? (
                videoThumbnails[currUrlIdx]?.thumbnails.map((img, index) => (<img src={img} style={{ width: imgWidth, height: '4rem', objectFit: 'cover', borderTopLeftRadius: (index === 0 ? 10 : 0), borderBottomLeftRadius: (index === 0 ? 10 : 0), borderTopRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0, borderBottomRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0 }} />))
            )
                :
                <Shimmer width={500} height={64} className="progressbar-container" />
            }

            {(videoDuration !== undefined) && splitTimeStamps[currUrlIdx]?.map(({ start, end }, index) => (
                <CroppedSection left={getOffsetFromTimestamp(start)} right={getOffsetFromTimestamp(end)} onMouseDown={() => console.log('mouse down')} onMouseUp={() => console.log('mouse up')} />
            ))}
        </div>
    )
}