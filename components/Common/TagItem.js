import Link from 'next/link'

const TagItem = ({ tag }) => (
  <Link href={`/tag/${encodeURIComponent(tag)}`} scroll={false}>
    <p className='mr-2 rounded-full px-3 py-1 border border-slate-200 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 leading-none text-sm text-slate-700 dark:text-slate-200 transition-colors'>
      {tag}
    </p>
  </Link>
)

export default TagItem
