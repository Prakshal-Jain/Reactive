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
    onMouseDown: (position: number, type: 'start' | 'end') => void,
    onMouseUp: (position: number, type: 'start' | 'end') => void,
    onMouseMove: (position: number, type: 'start' | 'end') => void,
}

var throttle = require('lodash/throttle');

export default function Progressbar({ videoDuration }: { videoDuration: number | undefined }) {
    const ctx = useContext(StateContext);
    const progressRef = useRef<HTMLDivElement>(null);
    const [imgWidth, setimgWidth] = useState<number | null>(null);
    const [mouseMoveData, setMouseMoveData] = useState<{ index: number, type: 'start' | 'end', position: number } | null>(null)

    useEffect(() => {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        if (boundingRect !== null && boundingRect !== undefined && boundingRect?.width !== imgWidth && progressRef?.current !== undefined) {
            setimgWidth(boundingRect.width / PROGRESSBAR_IMAGES_COUNT);
        }
    }, [progressRef.current?.getBoundingClientRect()]);


    function CroppedSection({ left, right, onMouseDown, onMouseUp, onMouseMove }: CropperSectionProps) {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        const width = right - left - 17;
        if (boundingRect !== null && boundingRect !== undefined) {
            return (
                <div className="cropped-section-left" style={{ left: `${left}px`, width: `${width}px` }}>
                    <div className="start-grabber"
                        onMouseDown={(event) => onMouseDown(Math.abs(event.clientX - boundingRect?.left), 'start')}
                        onMouseUp={(event) => onMouseUp(Math.abs(event.clientX - boundingRect?.left), 'start')}
                        onMouseMove={(event) => onMouseMove(Math.abs(event.clientX - boundingRect?.left), 'start')}
                    >
                        <FontAwesomeIcon icon={faGripLinesVertical} className="grip-icon" />
                    </div>
                    <div className="end-grabber"
                        onMouseDown={(event) => onMouseDown(Math.abs(boundingRect?.left - event.clientX), 'end')}
                        onMouseUp={(event) => onMouseUp(Math.abs(boundingRect?.left - event.clientX), 'end')}
                        onMouseMove={(event) => onMouseMove(Math.abs(boundingRect?.left - event.clientX), 'end')}
                    >
                        <FontAwesomeIcon icon={faGripLinesVertical} className="grip-icon" />
                    </div>
                </div>)
        }
        return null;
    }


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

    const handleMouseDown = (index: number, position: number, type: 'start' | 'end') => {
        if (mouseMoveData !== null) {
            return;
        }

        setMouseMoveData({
            index,
            position,
            type,
        })
    }

    const handleMouseUp = (index: number, position: number, type: 'start' | 'end') => {
        if (mouseMoveData === null) {
            return;
        }

        setMouseMoveData(null);
    }

    const handleMouseMove = (index: number, position: number, type: 'start' | 'end') => {
        setMouseMoveData({
            index,
            position,
            type,
        })
    }

    return (
        <div className="progressbar-container" ref={progressRef}>
            {(imgWidth !== null && videoThumbnails !== null && videoThumbnails[currUrlIdx] !== null) ? (
                videoThumbnails[currUrlIdx]?.thumbnails.map((img, index) => (<img src={img} style={{ width: imgWidth, height: '4rem', objectFit: 'cover', borderTopLeftRadius: (index === 0 ? 10 : 0), borderBottomLeftRadius: (index === 0 ? 10 : 0), borderTopRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0, borderBottomRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0 }} key={`preview-image-${currUrlIdx}-${index}`} />))
            )
                :
                <Shimmer width={500} height={64} className="progressbar-container" />
            }

            {(videoDuration !== undefined) && splitTimeStamps[currUrlIdx]?.map(({ start, end }, index) => {
                if (mouseMoveData?.index === index) {
                    return <CroppedSection
                        left={mouseMoveData?.type === 'start' ? mouseMoveData?.position : getOffsetFromTimestamp(start)}
                        right={mouseMoveData?.type === 'end' ? mouseMoveData?.position : getOffsetFromTimestamp(end)}
                        onMouseDown={(position: number, type: 'start' | 'end') => handleMouseDown(index, position, type)}
                        onMouseUp={(position: number, type: 'start' | 'end') => handleMouseUp(index, position, type)}
                        onMouseMove={(position: number, type: 'start' | 'end') => handleMouseMove(index, position, type)}
                        key={`cropped-section-${currUrlIdx}-${index}`}
                    />
                }
                return (
                    <CroppedSection
                        left={getOffsetFromTimestamp(start)}
                        right={getOffsetFromTimestamp(end)}
                        onMouseDown={(position: number, type: 'start' | 'end') => handleMouseDown(index, position, type)}
                        onMouseUp={(position: number, type: 'start' | 'end') => handleMouseUp(index, position, type)}
                        onMouseMove={() => { }}
                        key={`cropped-section-${currUrlIdx}-${index}`}
                    />
                )
            })}
        </div>
    )

}