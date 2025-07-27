import { useState } from 'react'
import WavesurferPlayer from '@wavesurfer/react'
import { Play, Pause } from 'lucide-react'

const AudioPlayer = ({ src, className }) => {
  const [wavesurfer, setWavesurfer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const onReady = (ws) => {
    setWavesurfer(ws)
    setDuration(ws.getDuration())
    setIsPlaying(false)
  }

  const onPlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className={`flex items-center space-x-3 p-2 bg-slate-100 rounded-2xl max-w-sm ${className}`}>
      <button
        onClick={onPlayPause}
        className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors cursor-pointer disabled:opacity-50"
        disabled={!wavesurfer}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div
        className="flex-1 min-w-0 w-[150px] h-[40px]"
      >
        <WavesurferPlayer
          height={40}
          waveColor="#d1d5db"
          progressColor="#8b5cf6"
          cursorColor="#8b5cf6"
          barWidth={2}
          barGap={2}
          url={src}
          onReady={onReady}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeupdate={(ws) => setCurrentTime(ws.getCurrentTime())}
        />
      </div>
      <div className="text-xs text-slate-700">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  )
}

export default AudioPlayer