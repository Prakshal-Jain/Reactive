import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' // https://fontawesome.com/v5/docs/web/use-with/react
import { faClosedCaptioning, faLanguage, faLightbulb, faMoon, faPhotoVideo } from '@fortawesome/free-solid-svg-icons' // https://fontawesome.com/v5/docs/web/use-with/react
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './App.css';
import Uploader from './Editor/Uploader';
import Editor from './Editor/Editor';
import { StateContext, StateContextType } from './state_context';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const MAX_VIDEO_LIMIT: number = 5;
const PROGRESSBAR_IMAGES_COUNT: number = 10;

function App() {
  const [theme, setTheme] = useState<StateContextType['theme']>('dark')
  const [showEditor, setShowEditor] = useState<StateContextType['showEditor']>(false);
  const [sourceURLs, setSourceUrls] = useState<StateContextType['sourceURLs']>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<StateContextType['videoThumbnails']>([]);
  const [currUrlIdx, setCurrUrlidx] = useState<StateContextType['currUrlIdx']>(0);
  const [splitTimeStamps, setSplitTimeStamps] = useState<StateContextType['splitTimeStamps']>([]);
  const [message, setMessage] = useState<StateContextType['message']>(null);

  const removeVideo = (index: number) => {
    if (sourceURLs.length === 0) {
      return;
    }
    else {
      const confirmationDialog = window.confirm("Are you sure you want to delete this video?\nAll your progress will be lost for this video.");
      if (confirmationDialog === true) {
        if (sourceURLs.length === 1) {
          setSourceUrls([]);
          setVideoThumbnails([]);
          setCurrUrlidx(0);
          setShowEditor(false);
          setSplitTimeStamps([]);
        }
        else {
          if (currUrlIdx === index && currUrlIdx === (sourceURLs.length - 1)) {
            setCurrUrlidx(index - 1);
          }

          const urls = [...sourceURLs];
          urls.splice(index, 1);
          setSourceUrls(urls);

          const thumbnails = [...videoThumbnails];
          thumbnails.splice(index, 1);
          setVideoThumbnails(thumbnails);

          const splits = [...splitTimeStamps];
          splits.splice(index, 1);
          setSplitTimeStamps(splits);
        }
      }
    }
  }

  return (
    <StateContext.Provider value={{ theme, setTheme, showEditor, setShowEditor, sourceURLs, setSourceUrls, videoThumbnails, setVideoThumbnails, currUrlIdx, setCurrUrlidx, removeVideo, splitTimeStamps, setSplitTimeStamps, PROGRESSBAR_IMAGES_COUNT, MAX_VIDEO_LIMIT, message, setMessage }} >
      <div className={`${theme}-theme-bg page-container`}>
        <div className="video-editor-container">
          {/* Add editor here */}
          {showEditor ?
            <Editor />
            :
            <Uploader />
          }
        </div>

        {message !== null && (
          <Alert style={{ minWidth: '50%' }} severity={message.type}>
            {(message?.title !== null && message?.title !== undefined) && (
              <AlertTitle>{message?.title}</AlertTitle>
            )}
            {message.content}
          </Alert>
        )}

        <div className={`footer-container ${theme === 'dark' ? 'dark-footer' : 'light-footer'}`}>
          <div className={`hover-bg-${theme}`}
            onClick={() => {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            title="Switch light and dark themes"
          >
            <FontAwesomeIcon icon={theme === 'light' ? faLightbulb : faMoon} style={{ color: 'rgb(255, 204, 0)', width: '1.5rem', height: '1.5rem' }}
            />
          </div>
          <div title="Add closed captions">
            <FontAwesomeIcon icon={faClosedCaptioning} style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div title="Video language translation">
            <FontAwesomeIcon icon={faLanguage} style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div title="Video filters">
            <FontAwesomeIcon icon={faPhotoVideo} style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div title="Github repository" onClick={() => window.open('https://github.com/Prakshal-Jain/Reactive', '_blank')}>
            <FontAwesomeIcon icon={faGithub} style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
          </div>
        </div>
      </div>
    </StateContext.Provider>
  );
}

export default App;
