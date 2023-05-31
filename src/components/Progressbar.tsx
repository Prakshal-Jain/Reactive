import "./progressbar.css";
import { MouseEventHandler, SyntheticEvent, useContext, useEffect, useRef, useState } from "react";
import { StateContext, StateContextType } from '../state_context';
import { Shimmer } from "react-shimmer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLinesVertical } from "@fortawesome/free-solid-svg-icons";

type Props = {
    currUrlIdx: number,
    videoThumbnails: StateContextType['videoThumbnails'],
    PROGRESSBAR_IMAGES_COUNT: StateContextType['PROGRESSBAR_IMAGES_COUNT'],
    splitTimeStamps: StateContextType['splitTimeStamps'],
    setSplitTimeStamps: StateContextType['setSplitTimeStamps'],
    setMessage: StateContextType['setMessage'],
}

type CropperSectionProps = {
    left: number,
    right: number,
    onMouseDown: (position: number, type: 'start' | 'end') => void,
    onMouseUp: (position: number, type: 'start' | 'end') => void,
    isActive: boolean,
}

const addNewCroppedSectionThreshold = 7;

var throttle = require('lodash/throttle');

export default function Progressbar({ videoRef, setPlayPause, isAddCroppedSection, setIsAddCroppedSection }: { videoRef: any, setPlayPause: (always: ('play' | 'pause' | null)) => void, isAddCroppedSection: boolean, setIsAddCroppedSection: (add: boolean) => void }) {
    const ctx = useContext(StateContext);
    const progressRef = useRef<HTMLDivElement>(null);
    const [imgWidth, setimgWidth] = useState<number | null>(null);
    const [mouseMoveData, setMouseMoveData] = useState<{ index: number, type: 'start' | 'end', position: number } | null>(null)
    const [windowDimensions, setWindowDimensions] = useState<{ height: number, width: number }>({
        height: window.innerHeight,
        width: window.innerWidth
    })

    const videoDuration = videoRef.current?.duration ?? 0;

    useEffect(() => {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        if (boundingRect !== null && boundingRect !== undefined && boundingRect?.width !== imgWidth && progressRef?.current !== undefined) {
            setimgWidth(boundingRect.width / PROGRESSBAR_IMAGES_COUNT);
        }
    }, [progressRef.current?.getBoundingClientRect()]);

    useEffect(() => {
        // Check if onMouseUp on a different croppedSection or outside of any croppedSection.
        document.addEventListener('mouseup', handleMouseUpOutsideProgressBar);

        return () => document.removeEventListener('mouseup', handleMouseUpOutsideProgressBar);
    })

    useEffect(() => {
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize);
    }, [window.innerHeight, window.innerWidth])


    const handleResize = throttle(() => {
        if ((Math.abs(window.innerHeight - windowDimensions.height) > 10) || (Math.abs(window.innerWidth - windowDimensions.width) > 10)) {
            setWindowDimensions({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }
    }, 300);

    function handleMouseUpOutsideProgressBar(event: any): void {
        // When cursor leaves the container and pressed out, save the progress.
        if (progressRef && (!progressRef?.current?.contains(event.target)) && mouseMoveData !== null) {
            handleMouseUp(mouseMoveData?.index, mouseMoveData?.position, mouseMoveData?.type);
        }
    }


    function CroppedSection({ left, right, onMouseDown, onMouseUp, isActive }: CropperSectionProps) {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        const width = right - left - 17;
        if (boundingRect !== null && boundingRect !== undefined) {
            return (
                <div
                    className="cropped-section" style={{ left: `${left}px`, width: `${width}px` }}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseUp={() => {
                        if (mouseMoveData !== null && isActive === false) {
                            handleMouseUp(mouseMoveData.index, mouseMoveData.position, mouseMoveData.type);
                        }
                    }}
                >
                    <div className="start-grabber"
                        onMouseDown={(event) => onMouseDown(Math.abs(event.clientX - boundingRect?.left), 'start')}
                        onMouseUp={(event) => onMouseUp(Math.abs(event.clientX - boundingRect?.left), 'start')}
                    >
                        <FontAwesomeIcon icon={faGripLinesVertical} className="grip-icon" />
                    </div>
                    <div className="end-grabber"
                        onMouseDown={(event) => onMouseDown(Math.abs(boundingRect?.left - event.clientX), 'end')}
                        onMouseUp={(event) => onMouseUp(Math.abs(boundingRect?.left - event.clientX), 'end')}
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

    const { videoThumbnails, currUrlIdx, splitTimeStamps, setSplitTimeStamps, PROGRESSBAR_IMAGES_COUNT, setMessage }: Props = ctx;

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

    const getTimeStampfromOffset = (position: number): number => {
        const boundingRect = progressRef.current?.getBoundingClientRect();
        if (videoDuration !== undefined && boundingRect !== null && boundingRect !== undefined) {
            return ((position / boundingRect.width) * videoDuration);
        }
        return 0;
    }

    const handleMouseUp = (index: number, position: number, type: 'start' | 'end') => {
        if (mouseMoveData === null) {
            return;
        }

        const currTimestamp = getTimeStampfromOffset(position);
        if (type === 'start' && currTimestamp < (splitTimeStamps[currUrlIdx][index - 1]?.end ?? 0)) {
            position = mouseMoveData.position;
        }
        else if (type === 'end' && currTimestamp > (splitTimeStamps[currUrlIdx][index + 1]?.start ?? videoDuration)) {
            position = mouseMoveData.position;
        }

        const timestamps = [...splitTimeStamps];
        timestamps[currUrlIdx][index][type] = currTimestamp;

        setSplitTimeStamps(timestamps);

        setMouseMoveData(null);
    }

    const handleMouseMove = throttle((index: number, position: number, type: 'start' | 'end') => {
        const currTimestamp = getTimeStampfromOffset(position);
        // Set the video timestamp too
        setPlayPause('pause')
        // Check if the end doesn't exceed the maximum video duration.
        if (type === 'end' && (currTimestamp > videoDuration || currTimestamp >= (splitTimeStamps[currUrlIdx][index + 1]?.start ?? Infinity) || ((currTimestamp - splitTimeStamps[currUrlIdx][index]?.start) <= addNewCroppedSectionThreshold))) {
            return;
        }
        if (type === 'start' && ((currTimestamp <= splitTimeStamps[currUrlIdx][index - 1]?.end ?? -Infinity) || ((splitTimeStamps[currUrlIdx][index]?.end - currTimestamp) <= addNewCroppedSectionThreshold))) {
            return;
        }

        if (videoRef?.current?.currentTime !== null && videoRef?.current?.currentTime !== undefined) {
            videoRef.current.currentTime = currTimestamp;
        }

        setMouseMoveData({
            index,
            position,
            type,
        })
    }, 200)

    function findTimestampIndexHelper(startTime: number): number | null {
        const timestamps = splitTimeStamps[currUrlIdx];
        const endTime = startTime + addNewCroppedSectionThreshold;
        // Check for start or end
        if (startTime >= 0 && endTime < timestamps[0].start && (timestamps[0].start - startTime) >= addNewCroppedSectionThreshold) {
            return 0;
        }

        else if (endTime <= videoDuration && startTime > timestamps[timestamps.length - 1].end && (videoDuration - timestamps[timestamps.length - 1].end) >= addNewCroppedSectionThreshold) {
            // Add at end
            return timestamps.length;
        }

        for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i - 1].end < startTime && timestamps[i].start > endTime && (timestamps[i].start - timestamps[i - 1].end) >= addNewCroppedSectionThreshold) {
                return i;
            }
        }
        return null;
    }

    const handleAddNewCroppedSection = (event: any): void => {
        // Start adding a new CroppedSection after checking if it doesn't clash with any existing croppedSection.
        // Maybe need to check minimum amount of time before adding.
        // Add the CroppedSection, set first part fixed, and continue with how croppedSections are edited --> Handles the logic
        setIsAddCroppedSection(false);
        const boundingRect = progressRef.current?.getBoundingClientRect();

        if (videoDuration === undefined || mouseMoveData !== null || boundingRect === null || boundingRect === undefined) {
            setMessage({ type: 'error', title: 'Cannot add a new section', content: 'Something went wrong. Please try again.' });
            return
        }

        const startTime: number = getTimeStampfromOffset(Math.abs(event.clientX - boundingRect?.left));
        // Will never exceed or before videoduration because pointer event will not be triggered

        const idx = findTimestampIndexHelper(startTime);

        if (idx === null) {
            setMessage({ type: 'error', title: 'Cannot add a new section', content: "Please make sure you click on the part of progress bar that is not already a section." })
            return
        }

        // BUG: Can add overlapping sections (ends can overlap!)
        const timestamps = [...splitTimeStamps];
        timestamps[currUrlIdx]?.splice(idx, 0, { start: startTime, end: startTime + addNewCroppedSectionThreshold })
        setSplitTimeStamps(timestamps);
        setMessage(null);
    }

    return (
        <div
            className="progressbar-container"
            ref={progressRef}
            onMouseMove={(event) => {
                const boundingRect = progressRef.current?.getBoundingClientRect();
                if (videoDuration === undefined || mouseMoveData === null || boundingRect === null || boundingRect === undefined) {
                    return
                }
                handleMouseMove(mouseMoveData.index, Math.abs(event.clientX - boundingRect?.left), mouseMoveData?.type);
            }}
            key={`progressbar-${currUrlIdx}-width_${windowDimensions.width}-height_${windowDimensions.height}`}
            onClick={isAddCroppedSection ? handleAddNewCroppedSection : () => { }}
        >
            {(imgWidth !== null && videoThumbnails !== null && videoThumbnails[currUrlIdx] !== null) ? (
                videoThumbnails[currUrlIdx]?.thumbnails.map((img, index) => (
                    <div
                        style={{ width: imgWidth, height: '4rem', objectFit: 'cover', borderTopLeftRadius: (index === 0 ? 10 : 0), borderBottomLeftRadius: (index === 0 ? 10 : 0), borderTopRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0, borderBottomRightRadius: (index === ((videoThumbnails[currUrlIdx]?.thumbnails?.length ?? 1) - 1) ? 10 : 0) ? 10 : 0, backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
                        key={`preview-image-${currUrlIdx}-${index}`}
                    />
                ))
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
                        key={`cropped-section-${currUrlIdx}-${index}`}
                        isActive={true}
                    />
                }
                return (
                    <CroppedSection
                        left={getOffsetFromTimestamp(start)}
                        right={getOffsetFromTimestamp(end)}
                        onMouseDown={(position: number, type: 'start' | 'end') => handleMouseDown(index, position, type)}
                        onMouseUp={(position: number, type: 'start' | 'end') => handleMouseUp(index, position, type)}
                        key={`cropped-section-${currUrlIdx}-${index}`}
                        isActive={false}
                    />
                )
            })}
        </div>
    )

}