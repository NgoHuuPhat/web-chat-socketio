import { useReactMediaRecorder } from 'react-media-recorder'

const useAudioRecorder = ({ onStopRecording }) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ 
        audio: true,
        onStop: (blobUrl, blob) => {
            if(onStopRecording) {
            onStopRecording(blob)
            }
        }
    })

    return {
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
        isRecording: status === 'recording',
    }
}

export default useAudioRecorder