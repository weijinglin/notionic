import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'
import { idToUuid } from 'notion-utils'
import dayjs from '@/lib/day'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

const unwrapRecordValue = (record) => record?.value?.value || record?.value || null

/**
 * @param {{ onlyNewsletter: boolean }} - false: all types / true: newsletter only
 * @param {{ onlyPost: boolean }} - false: all types / true: post only
 * @param {{ onlyHidden: boolean }} - false: all types / true: hidden only
 */
export async function getAllPosts({
  onlyNewsletter = false,
  onlyPost = false,
  onlyHidden = false
}) {
  let id = BLOG.notionPageId
  if (!id) {
    console.warn('NOTION_PAGE_ID is empty. Returning empty posts list.')
    return []
  }

  const authToken = BLOG.notionAccessToken || null
  const api = new NotionAPI({ authToken })
  let response
  try {
    response = await api.getPage(id)
  } catch (error) {
    console.error(`Failed to load Notion page '${id}'. Returning empty posts list.`)
    console.error(error)
    return []
  }

  id = idToUuid(id)
  const collection = unwrapRecordValue(Object.values(response.collection || {})[0])
  const collectionQuery = response.collection_query
  const block = response.block || {}
  const schema = collection?.schema

  const rawMetadata = unwrapRecordValue(block[id])

  // Check Type
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.warn(`pageId '${id}' is not a database, returning empty posts list`)
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(collectionQuery)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null

      const blockValue = unwrapRecordValue(block[id])
      // Add fullwidth to properties
      properties.fullWidth = blockValue?.format?.page_full_width ?? false
      // Convert date (with timezone) to unix milliseconds timestamp
      properties.date = (
        properties.date?.start_date
          ? dayjs.tz(properties.date?.start_date)
          : dayjs(blockValue?.created_time)
      ).valueOf()

      data.push(properties)
    }

    // remove all the the items doesn't meet requirements
    const posts = filterPublishedPosts({
      posts: data,
      onlyNewsletter,
      onlyPost,
      onlyHidden
    })

    // Sort by date
    if (BLOG.sortByDate) {
      posts.sort((a, b) => b.date - a.date)
    }
    return posts
  }
}
