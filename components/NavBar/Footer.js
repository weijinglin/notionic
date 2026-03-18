import Link from 'next/link'
import BLOG from '@/blog.config'
import { lang } from '@/lib/lang'
import { useRouter } from 'next/router'
import {
  UserIcon,
  UsersIcon,
  BookOpenIcon,
  MailIcon
} from '@heroicons/react/outline'
import Social from '../Common/Social.js'

const Footer = ({ fullWidth }) => {
  const router = useRouter()
  const { locale } = router
  const t = lang[locale]

  let activeMenu = ''
  if (router.query.slug) {
    activeMenu = '/' + router.query.slug
  } else {
    activeMenu = router.pathname
  }

  const d = new Date()
  const y = d.getFullYear()
  const from = +BLOG.since

  const links = [
    {
      id: 0,
      name: t.NAV.ABOUT,
      to: BLOG.path || '/about',
      icon: <UserIcon className='inline-block mb-1 h-5 w-5' />,
      show: true
    },
    {
      id: 1,
      name: t.NAV.FRINEDS,
      to: '/friends',
      icon: <UsersIcon className='inline-block mb-1 h-5 w-5' />,
      show: BLOG.pagesShow.friends
    },
    {
      id: 2,
      name: t.NAV.BOOKS,
      to: '/books',
      icon: <BookOpenIcon className='inline-block mb-1 h-5 w-5' />,
      show: BLOG.pagesShow.books
    },
    {
      id: 3,
      name: t.NAV.CONTACT,
      to: '/contact',
      icon: <MailIcon className='inline-block mb-1 h-5 w-5' />,
      show: BLOG.pagesShow.contact
    }
  ]

  return (
    <div
      className={`mt-10 flex-shrink-0 m-auto w-full text-slate-600 dark:text-slate-300 transition-all ${
        !fullWidth ? 'max-w-3xl md:px-8' : 'px-4 md:px-24'
      }`}
    >
      <footer className='max-w-screen-2xl px-4 md:px-8 mx-auto'>
        <div className='rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/65 backdrop-blur-sm px-4 py-3'>
          <div className='flex flex-col md:flex-row justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3'>
            <ul className='flex flex-wrap justify-center md:justify-start md:gap-1'>
              {links.map(
                (link) =>
                  link.show && (
                    <Link passHref key={link.id} href={link.to} scroll={false}>
                      <li
                        key={link.id}
                        className={`${
                          activeMenu === link.to
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-300'
                        } hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer rounded-lg block py-1 px-2 nav transition-colors`}
                      >
                        <div className='font-light'>
                          {link.icon}
                          <span className='inline-block m-1'>{link.name}</span>
                        </div>
                      </li>
                    </Link>
                  )
              )}
            </ul>
            <div className='hidden md:flex'>
              <Social />
            </div>
          </div>

          <div className='text-slate-500 dark:text-slate-400 text-xs font-light pt-4'>
            © {from === y || !from ? y : `${from} - ${y}`} | {BLOG.author}
            <p className='md:float-right'>
              {t.FOOTER.COPYRIGHT_START}
              <a className='underline' href={`${t.FOOTER.COPYRIGHT_LINK}`}>
                {t.FOOTER.COPYRIGHT_NAME}
              </a>
              {t.FOOTER.COPYRIGHT_END}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
