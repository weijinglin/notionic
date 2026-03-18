import Link from 'next/link'

const Tags = ({ tags, currentTag }) => {
  if (!tags) return null

  return (
    <div className='tag-container'>
      <div className='flex flex-wrap justify-center mt-4'>
        {Object.keys(tags).map((key) => {
          const selected = key === currentTag
          return (
            <div
              key={key}
              className={`m-1 font-medium rounded-full whitespace-nowrap transition-colors border ${
                selected
                  ? 'text-white border-cyan-500 bg-gradient-to-r from-cyan-500 to-sky-500 shadow'
                  : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/75 hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-700 dark:hover:text-cyan-300'
              }`}
            >
              <Link
                key={key}
                scroll={false}
                href={selected ? '/search' : `/tag/${encodeURIComponent(key)}`}
                className='px-4 py-2 block'
              >
                {`${key} (${tags[key]})`}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Tags
