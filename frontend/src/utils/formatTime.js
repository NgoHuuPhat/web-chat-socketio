import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'

dayjs.extend(relativeTime)
dayjs.extend(isToday)

const getTimeAgo = (date) => {
    if(!date) return 'Invalid date'
    return dayjs(date).fromNow()
}

const formatSeenAt = (timestamp) => {
    const seen = dayjs(timestamp)

    if(seen.isToday()) {
        return seen.format('HH:mm')
    } else {
          return seen.format('HH:mm YYYY-MM-DD')
    }
}

const formatTime = (timestamp) => {
    const time = dayjs(timestamp)
    return time.format('YYYY-MM-DD')
}

export { getTimeAgo, formatSeenAt, formatTime }


