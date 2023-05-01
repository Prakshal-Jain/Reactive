import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome' // https://fontawesome.com/v5/docs/web/use-with/react
import { faClosedCaptioning, faLanguage, faLightbulb, faMoon, faPhotoVideo } from '@fortawesome/free-solid-svg-icons' // https://fontawesome.com/v5/docs/web/use-with/react
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import './App.css';
import Uploader from './Editor/Uploader';
import Editor from './Editor/Editor';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [sourceURLs, setSourceUrls] = useState<Array<string>>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<Array<{ thumbnail: string, name: string, type: string } | null>>([]);
  const [currUrlIdx, setCurrUrlidx] = useState<number>(0);

  const removeVideo = (index: number) => {
    if (sourceURLs.length === 0) {
      return;
    }
    if (sourceURLs.length === 1) {
      setSourceUrls([]);
      setVideoThumbnails([]);
      setCurrUrlidx(0);
      setShowEditor(false);
    }
    else {
      const urls = [...sourceURLs];
      urls.splice(index, 1);
      setSourceUrls(urls);

      const thumbnails = [...videoThumbnails];
      thumbnails.splice(index, 1);
      setVideoThumbnails(thumbnails);
    }
  }

  return (
    <div className={`${theme}-theme-bg page-container`}>
      <div className="video-editor-container">
        {/* Add editor here */}
        {showEditor ?
          <Editor
            sourceURLs={sourceURLs}
            videoThumbnails={videoThumbnails}
            removeVideo={removeVideo}
            currUrlIdx={currUrlIdx}
            setSourceUrls={setSourceUrls}
            setVideoThumbnails={setVideoThumbnails}
          />
          :
          <Uploader
            sourceURLs={sourceURLs}
            setSourceUrls={setSourceUrls}
            videoThumbnails={videoThumbnails}
            setVideoThumbnails={setVideoThumbnails}
            removeVideo={removeVideo}
            setShowEditor={setShowEditor}
          />}
      </div>

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
  );
}

export default App;
