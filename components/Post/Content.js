import BLOG from '@/blog.config'
import PropTypes from 'prop-types'
import Link from 'next/link'

import FormattedDate from '@/components/Common/FormattedDate'
import TagItem from '@/components/Common/TagItem'
import NotionRenderer from '@/components/Post/NotionRenderer'

import { ChevronLeftIcon } from '@heroicons/react/outline'

export default function Content (props) {
  const { frontMatter, blockMap, pageTitle } = props

  return (
    <article className='flex-none md:overflow-x-visible overflow-x-scroll w-full'>
      {pageTitle && (
        <Link
          passHref
          href={`${BLOG.path}/${frontMatter.slug}`}
          scroll={false}
          className='reveal-fade inline-flex items-center gap-1 md:-ml-6 mb-4 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 transition-colors'
        >
          <ChevronLeftIcon className='h-5 w-5' />
          <span>{frontMatter.title}</span>
        </Link>
      )}

      <header className='reveal-up mb-9'>
        <h1 className='font-bold text-3xl md:text-4xl leading-tight tracking-tight text-slate-900 dark:text-white'>
          {pageTitle ? pageTitle : frontMatter.title}
        </h1>

        {frontMatter.type[0] !== 'Page' && (
          <nav className='mt-5 flex flex-wrap items-center gap-x-3 gap-y-3 text-slate-500 dark:text-slate-400'>
            <div className='inline-flex items-center rounded-full border border-slate-200 bg-white/75 px-3 py-1 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800/70'>
              <FormattedDate date={frontMatter.date} />
            </div>
            {frontMatter.tags && (
              <div className='flex flex-nowrap max-w-full overflow-x-auto article-tags'>
                {frontMatter.tags.map((tag) => (
                  <TagItem key={tag} tag={tag} />
                ))}
              </div>
            )}
          </nav>
        )}
      </header>

      <div className='-mt-1 relative reveal-up reveal-delay-1'>
        <NotionRenderer
          blockMap={blockMap}
          previewImages={BLOG.previewImagesEnabled}
          {...props}
        />
      </div>
    </article>
  )
}

Content.propTypes = {
  frontMatter: PropTypes.object.isRequired,
  blockMap: PropTypes.object.isRequired,
  pageTitle: PropTypes.string
}
