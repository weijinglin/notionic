import BLOG from '@/blog.config'
import Link from 'next/link'
import Avatar from './Avatar.js'
import Social from '../Common/Social.js'
import { lang } from '@/lib/lang'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'
import {
  MailIcon,
  RssIcon,
  ClipboardCheckIcon
} from '@heroicons/react/outline'
import NotionRenderer from '@/components/Post/NotionRenderer'

const Hero = ({ blockMap }) => {
  const [showCopied, setShowCopied] = useState(false)
  const copyTimerRef = useRef(null)
  const { locale } = useRouter()
  const t = lang[locale]

  const clickCopy = async () => {
    setShowCopied(true)
    navigator.clipboard.writeText(BLOG.link + '/feed')

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current)
    }

    copyTimerRef.current = setTimeout(() => {
      setShowCopied(false)
      copyTimerRef.current = null
    }, 1000)
  }

  return (
    <>
      <div className='container mx-auto flex px-5 py-2 mb-12 md:flex-row flex-col items-center gap-8'>
        <div className='reveal-up flex flex-col md:w-3/5 md:items-start mb-6 md:mb-0 text-left'>
          <div className='home-intro-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/82 px-6 py-5 shadow-xl shadow-slate-200/60 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/65 dark:shadow-slate-950/40'>
            <div className='home-intro-glow pointer-events-none absolute -top-16 -right-8 h-44 w-44 rounded-full'></div>
            <NotionRenderer
              className='md:ml-0'
              blockMap={blockMap}
              frontMatter={{}}
              subPageTitle={null}
            />
          </div>
          <div className='reveal-fade reveal-delay-1 mt-5'>
            <Social />
          </div>
          <div className='reveal-up reveal-delay-2 flex flex-col sm:flex-row sm:justify-center gap-4 mt-7'>
            <Link passHref href='/contact' scroll={false}>
              <button className='w-full card-lift border border-slate-200/80 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex py-3 px-5 rounded-xl items-center shadow-sm'>
                <MailIcon className='inline-block text-slate-600 dark:text-day h-7 w-7 mt-1' />
                <span className='ml-4 flex items-start flex-col leading-none'>
                  <span className='text-xs text-slate-500 dark:text-slate-300 mb-1'>
                    {t.HERO.HOME.CONTACT_BUTTON_DES}
                  </span>
                  <span className='font-medium'>{t.HERO.HOME.CONTACT_BUTTON}</span>
                </span>
              </button>
            </Link>
            {showCopied ? (
              <button
                disabled
                className='border border-emerald-300/70 bg-emerald-50/90 dark:bg-emerald-900/30 dark:border-emerald-700 inline-flex py-3 px-5 rounded-xl items-center shadow-sm'
              >
                <ClipboardCheckIcon className='inline-block text-emerald-700 dark:text-emerald-300 h-7 w-7' />
                <span className='ml-4 flex items-start flex-col leading-none'>
                  <span className='text-xs text-emerald-700 dark:text-emerald-300 mb-1'>
                    {t.HERO.RSS_BUTTON_DES_COPIED}
                  </span>
                  <span className='font-medium text-emerald-800 dark:text-emerald-200'>
                    {t.HERO.RSS_BUTTON_COPIED}
                  </span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => clickCopy()}
                className='card-lift border border-slate-200/80 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex py-3 px-5 rounded-xl items-center shadow-sm'
              >
                <RssIcon className='inline-block text-slate-600 dark:text-day h-7 w-7' />
                <span className='ml-4 flex items-start flex-col leading-none'>
                  <span className='text-xs text-slate-500 dark:text-slate-300 mb-1'>
                    {t.HERO.RSS_BUTTON_DES}
                  </span>
                  <span className='font-medium'>{t.HERO.HOME.RSS_BUTTON}</span>
                </span>
              </button>
            )}
          </div>
        </div>
        <div className='reveal-up reveal-delay-3 w-2/5 float-soft'>
          <Avatar className='text-gray-600 dark:text-gray-300' />
        </div>
      </div>
    </>
  )
}

export default Hero
