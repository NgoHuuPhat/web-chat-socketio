import { useEffect } from 'react'

const useClickOutside = (ref, callback, condition = true) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (condition && ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [ref, callback, condition])
}

export default useClickOutside