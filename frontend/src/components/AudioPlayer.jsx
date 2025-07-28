import { useEffect, useRef, useState } from 'react'
import { useWavesurfer } from '@wavesurfer/react'
import { Play, Pause, ChevronDown } from 'lucide-react'

const AudioPlayer = ({ src, className, messageId, currentPlayingAudio, setCurrentPlayingAudio }) => {
    const containerRef = useRef(null)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showPlaybackMenu, setShowPlaybackMenu] = useState(false)

    const { wavesurfer, isReady, isPlaying } = useWavesurfer({
        container: containerRef,
        url: src,
        waveColor: '#d1d5db',
        progressColor: '#8b5cf6',
        cursorColor: '#8b5cf6',
        barWidth: 2,
        barGap: 1,
        height: 40,
    })

    // Update duration when wavesurfer is ready
    useEffect(() => {
        if (wavesurfer && isReady) {
            setDuration(wavesurfer.getDuration())

            const handleTimeUpdate = () => {
                setCurrentTime(wavesurfer.getCurrentTime())
            }

            wavesurfer.on('timeupdate', handleTimeUpdate)

            return () => {
                wavesurfer.un('timeupdate', handleTimeUpdate)
            }
        }
    }, [wavesurfer, isReady]) 

    // Update playback rate when it changes
    useEffect(() => {
        if (wavesurfer && isReady) {
            wavesurfer.setPlaybackRate(playbackRate)
        }
    }, [playbackRate, wavesurfer, isReady])

    // Stop playing if another audio player is activated
    useEffect(() => {
      if(wavesurfer && isPlaying && currentPlayingAudio !== messageId) {
        wavesurfer.pause()
      }
    }, [currentPlayingAudio, wavesurfer, isPlaying, messageId])

    const onPlayPause = () => {
        if (wavesurfer) {
            if(!isPlaying) {
              setCurrentPlayingAudio(messageId)
              wavesurfer.play()
            } else {
              setCurrentPlayingAudio(null)
            }
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    const handlePlaybackRateChange = (rate) => {
        setPlaybackRate(rate)
        setShowPlaybackMenu(false)
    }

    return (
        <div className={`flex items-center space-x-3 p-2 bg-slate-100 rounded-2xl max-w-sm ${className}`}>
          <button
              onClick={onPlayPause}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors cursor-pointer disabled:opacity-10"
              disabled={!isReady}
          >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <div
            ref={containerRef}
            className="flex-1 min-w-0 w-[100px] h-[40px]"
          />

          <div className="text-xs text-slate-700">
              {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className='relative'>
            <button
              onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
              className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span className="text-xs">{playbackRate}x</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showPlaybackMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-24 bg-white rounded-xl shadow-lg border border-slate-200/50 py-2 z-50">
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors cursor-pointer 
                      ${playbackRate === rate ? 'text-purple-700 font-medium' : 'text-slate-700'}
                    `}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
    )
}

export default AudioPlayer