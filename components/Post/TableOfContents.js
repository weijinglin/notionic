import PropTypes from 'prop-types'
import { getPageTableOfContents } from 'notion-utils'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import BLOG from '@/blog.config'

const levelByType = {
  header: 1,
  sub_header: 2,
  sub_sub_header: 3
}

const getNodeLevel = (node) => {
  if (typeof node.indentLevel === 'number') return node.indentLevel + 1
  if (typeof node.level === 'number') return node.level
  if (typeof node.depth === 'number') return node.depth + 1
  if (node.type && levelByType[node.type]) return levelByType[node.type]
  return 1
}

const getNodeClass = (node, isActive) => {
  const level = getNodeLevel(node)
  const activeClass = isActive
    ? 'bg-gray-200/80 text-gray-900 dark:bg-gray-700/80 dark:text-gray-100'
    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'

  if (level === 1) {
    return `${activeClass} font-semibold pl-2`
  }
  if (level === 2) {
    return `${activeClass} font-medium pl-5`
  }
  return `${activeClass} font-normal pl-8 text-[13px]`
}

const toBlockClass = (id) => `.notion-block-${id.replaceAll('-', '')}`

export default function TableOfContents ({ blockMap, frontMatter, pageTitle }) {
  const [activeId, setActiveId] = useState('')

  let collectionId, page
  if (pageTitle) {
    collectionId = Object.keys(blockMap.block)[0]
    page = blockMap.block[collectionId].value
  } else {
    collectionId = Object.keys(blockMap.collection)[0]
    page = Object.values(blockMap.block).find(block => block.value.parent_id === collectionId).value
  }

  const nodes = useMemo(() => getPageTableOfContents(page, blockMap), [page, blockMap])

  useEffect(() => {
    if (!nodes.length) return

    const updateActiveHeading = () => {
      let nextActiveId = nodes[0].id

      for (const node of nodes) {
        const target = document.querySelector(toBlockClass(node.id))
        if (!target) continue
        const rect = target.getBoundingClientRect()
        if (rect.top <= 110) {
          nextActiveId = node.id
        } else {
          break
        }
      }

      setActiveId((prev) => (prev === nextActiveId ? prev : nextActiveId))
    }

    updateActiveHeading()
    window.addEventListener('scroll', updateActiveHeading, { passive: true })
    window.addEventListener('resize', updateActiveHeading)

    return () => {
      window.removeEventListener('scroll', updateActiveHeading)
      window.removeEventListener('resize', updateActiveHeading)
    }
  }, [nodes])

  if (!nodes.length) return null

  /**
   * @param {string} id - The ID of target heading block (could be in UUID format)
   */
  function scrollTo (id) {
    const target = document.querySelector(toBlockClass(id))
    if (!target) return
    // `65` is the height of expanded nav
    // TODO: Remove the magic number
    const top = document.documentElement.scrollTop + target.getBoundingClientRect().top - 65
    document.documentElement.scrollTo({
      top,
      behavior: 'smooth'
    })
  }

  return (
    <div
      className='hidden xl:block xl:fixed ml-4 text-sm text-gray-500 dark:text-gray-400 whitespace'
    >
      {pageTitle && (
        <Link
          passHref
          href={`${BLOG.path}/${frontMatter.slug}`}
          scroll={false}
          className='block -ml-6 mb-2 p-2 hover:bg-gray-200 hover:dark:bg-gray-700 rounded-lg'
        >
          <ChevronLeftIcon className='inline-block mb-1 h-5 w-5' />
          <span className='ml-1'>{frontMatter.title}</span>
        </Link>
      )}
      {nodes.map(node => (
        <div key={node.id} className='px-2 hover:bg-gray-200 hover:dark:bg-gray-700 rounded-lg'>
          <a
            data-target-id={node.id}
            className={`block py-1.5 cursor-pointer truncate rounded-md transition-colors ${getNodeClass(node, node.id === activeId)}`}
            onClick={() => scrollTo(node.id)}
            title={node.text}
          >
            {node.text}
          </a>
        </div>
      ))}
    </div>
  )
}

TableOfContents.propTypes = {
  blockMap: PropTypes.object.isRequired,
  frontMatter: PropTypes.object.isRequired,
  pageTitle: PropTypes.string
}
