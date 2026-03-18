import { useEffect } from 'react'
import { useRouter } from 'next/router'

const TransitionEffect = ({ children }) => {
  const { asPath } = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [asPath])

  return <div className='effect-1'>{children}</div>
}

export default TransitionEffect
