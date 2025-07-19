import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const getTimeAgo = (date) => {
    if(!date) return 'Invalid date'
    return dayjs(date).fromNow()
}

export default getTimeAgo