import BLOG from '@/blog.config'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

import FormattedDate from '@/components/Common/FormattedDate'

const BlogPost = ({ post }) => {
  return (
    <motion.div>
      <Link passHref href={`${BLOG.path}/${post.slug}`} scroll={false}>
        <article
          key={post.id}
          className='group flex flex-col overflow-hidden relative mb-5 md:mb-8 cursor-pointer rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-all duration-300'
        >
          <Image
            fill
            alt={`${post.title}`}
            src={post?.page_cover}
            sizes='(max-width: 768px) 100vw, 768px'
            loading='lazy'
            className='w-full h-full object-cover object-center absolute inset-0 group-hover:scale-105 transition duration-300'
          />
          <div className='hidden md:block md-cover absolute inset-0'></div>
          <div className='md:hidden sm-cover absolute inset-0'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/30 dark:to-transparent' />
          <div className='relative mt-auto'>
            <header className='flex flex-col justify-between md:flex-row md:items-baseline gap-2'>
              <h2 className='text-lg md:text-xl font-semibold mb-1 text-black dark:text-gray-100 leading-tight'>
                {post.title}
              </h2>
              <span className='text-color-fix font-light flex-shrink-0 text-slate-600 dark:text-slate-300 text-sm'>
                <FormattedDate date={post.date} />
              </span>
            </header>
            <p className='font-light hidden md:block leading-7 text-slate-700 dark:text-slate-200 line-clamp-2'>
              {post.summary}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

export default BlogPost
