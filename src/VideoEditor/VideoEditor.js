/* eslint-disable func-names */
import {useState, useEffect} from 'react'
import {FileDrop} from 'react-file-drop' // https://github.com/sarink/react-file-drop
import '../editor.css'
import Editor from './Editor'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome' // https://fontawesome.com/v5/docs/web/use-with/react
import {faLightbulb, faMoon} from '@fortawesome/free-solid-svg-icons' // https://fontawesome.com/v5/docs/web/use-with/react

function VideoEditor() {

	//Boolean state handling whether upload has occured or not
	const [isUpload, setIsUpload] = useState(true)

	//State handling storing of the video
	const [videoUrl, setVideoUrl] = useState('')
	const [videoBlob, setVideoBlob] = useState('')

	//Boolean state handling whether light or dark mode has been chosen
	const [isDarkMode, setIsDarkMode] = useState(false)

	//Stateful array handling storage of the start and end times of videos
	const [timings, setTimings] = useState([])


	//Lifecycle handling light and dark themes
	useEffect(() => {
		toggleThemes()
		document.addEventListener('drop', function(e) {
			e.preventDefault()
			e.stopPropagation()
		})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	//Function handling file input as well as file drop library and rendering of those elements
	const renderUploader = () => {
		return (
			<div className={'wrapper'}>
				<input
					onChange={(e) => uploadFile(e.target.files)}
					type='file'
					className='hidden'
					id='up_file'
				/>
				<FileDrop
					onDrop={(e) => uploadFile(e)}
					onTargetClick={() => document.getElementById('up_file').click()}
				>
                    Click or drop your video here to edit!
				</FileDrop>
			</div>
		)
	}

	//Function handling rendering the Editor component and passing props to that child component
	const renderEditor = () => {
		return (
		// videoUrl --> URL of uploaded video
			<Editor
				videoUrl={videoUrl}
				videoBlob={videoBlob}
				setVideoUrl={setVideoUrl}
				timings={timings}
				setTimings={setTimings}
			/>
		)
	}

	//Function handling the light and dark themes logic
	const toggleThemes = () => {
		if(isDarkMode) {
			document.body.style.backgroundColor = '#1f242a'
			document.body.style.color = '#fff'
		}
		if(!isDarkMode){
			document.body.style.backgroundColor = '#fff'
			document.body.style.color = '#1f242a'
		}
		setIsDarkMode(!isDarkMode)
	}

	//Function handling the file upload file logic
	const uploadFile = async (fileInput) => {
		console.log(fileInput[0])
		let fileUrl = URL.createObjectURL(fileInput[0])
		setIsUpload(false)
		setVideoUrl(fileUrl)
		setVideoBlob(fileInput[0])
	}

	return (
		<div>
			{/* Boolean to handle whether to render the file uploader or the video editor */}
			{isUpload ? renderUploader() : renderEditor()}
			<div className={'theme_toggler'} onClick={toggleThemes}>
				{isDarkMode ?
					(<i className='toggle' aria-hidden='true'>
						<FontAwesomeIcon icon={faLightbulb} /></i>)
					:
					<i className='toggle'><FontAwesomeIcon icon={faMoon} /></i>}
			</div>
		</div>
	)
}

export default VideoEditor