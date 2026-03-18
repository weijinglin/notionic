import { useState } from 'react'
import BlogPost from '@/components/BlogPost'
import Container from '@/components/Container'
import Tags from '@/components/Common/Tags'
import PropTypes from 'prop-types'
import { lang } from '@/lib/lang'
import { useRouter } from 'next/router'

const SearchLayout = ({ tags, posts, currentTag }) => {
  const [searchValue, setSearchValue] = useState('')
  const { locale } = useRouter()
  const t = lang[locale]

  let filteredBlogPosts = []
  if (posts) {
    filteredBlogPosts = posts.filter((post) => {
      const tagContent = post.tags ? post.tags.join(' ') : ''
      const searchContent = post.title + post.summary + tagContent
      return searchContent.toLowerCase().includes(searchValue.toLowerCase())
    })
  }

  return (
    <Container>
      <section className='reveal-up mb-3'>
        <div className='rounded-2xl border border-slate-200/80 bg-white/85 dark:bg-slate-800/75 dark:border-slate-700/80 px-4 py-4 shadow-sm backdrop-blur-sm'>
          <div className='relative'>
            <input
              type='text'
              placeholder={
                currentTag
                  ? `${t.SEARCH.ONLY_SEARCH} #${currentTag}`
                  : `${t.SEARCH.PLACEHOLDER}`
              }
              className='w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70 outline-none focus:shadow-md focus:border-slate-400 dark:focus:border-slate-500 px-3 py-3 transition'
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <svg
              className='absolute right-3 top-3 h-5 w-5 text-slate-400'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              ></path>
            </svg>
          </div>
        </div>
      </section>

      <section className='reveal-fade reveal-delay-1'>
        <Tags tags={tags} currentTag={currentTag} />
      </section>

      <section className='article-container my-8 reveal-up reveal-delay-2'>
        {!filteredBlogPosts.length && (
          <div className='rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/65 px-4 py-5 text-slate-500 dark:text-slate-300'>
            {t.SEARCH.NOT_FOUND}
          </div>
        )}
        {filteredBlogPosts.slice(0, 20).map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </section>
    </Container>
  )
}

SearchLayout.propTypes = {
  posts: PropTypes.array.isRequired,
  tags: PropTypes.object.isRequired,
  currentTag: PropTypes.string
}

export default SearchLayout
