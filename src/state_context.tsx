import React from "react";

export interface StateContextType {
    theme: 'light' | 'dark',
    setTheme: (theme: 'light' | 'dark') => void,
    showEditor: boolean,
    setShowEditor: (setShowEditor: boolean) => void,
    sourceURLs: Array<string>,
    videoThumbnails: Array<{ thumbnails: Array<string>, name: string, type: string } | null>,
    setVideoThumbnails: (setSourceUrls: Array<{ thumbnails: Array<string>, name: string, type: string } | null>) => void,
    removeVideo: (index: number) => void,
    currUrlIdx: number,
    setCurrUrlidx: (idx: number) => void,
    setSourceUrls: (setSourceUrls: Array<string>) => void,
    splitTimeStamps: Array<Array<{ start: number, end: number }>>
    setSplitTimeStamps: (split: StateContextType['splitTimeStamps']) => void,
    PROGRESSBAR_IMAGES_COUNT: number,
}

export const StateContext = React.createContext<StateContextType | null>(null);