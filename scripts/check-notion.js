#!/usr/bin/env node

// Usage:
//   node scripts/check-notion.js              # uses NOTION_PAGE_ID from env
//   node scripts/check-notion.js <notionId>   # uses passed id

async function main() {
  const BLOG = (await import('../blog.config.js')).default
  const { idToUuid } = await import('notion-utils')
  const { NotionAPI } = await import('notion-client')

  const rawId = process.argv[2] || process.env.NOTION_PAGE_ID || BLOG.notionPageId
  if (!rawId) {
    console.error('ERROR: No NOTION_PAGE_ID provided.\n' +
      '  - Set NOTION_PAGE_ID env var, or\n' +
      '  - Run: node scripts/check-notion.js <your-notion-page-or-db-id>')
    process.exit(1)
  }

  const id = idToUuid(rawId)
  const authToken = process.env.NOTION_ACCESS_TOKEN || BLOG.notionAccessToken || null

  console.log('Using Notion ID:', rawId)
  console.log('UUID (idToUuid):', id)
  console.log('Using auth token:', authToken ? 'yes' : 'no')

  const api = new NotionAPI({ authToken })

  try {
    const response = await api.getPage(id)

    const collectionKeys = Object.keys(response.collection || {})
    const collectionQueryKeys = Object.keys(response.collection_query || {})
    const blockKeys = Object.keys(response.block || {})

    console.log('response.collection keys:', collectionKeys.length)
    console.log('response.collection_query keys:', collectionQueryKeys.length)
    console.log('response.block keys:', blockKeys.length)

    const rawMetadata = response.block?.[id]?.value
    console.log('rawMetadata.type:', rawMetadata?.type)

    if (rawMetadata?.type !== 'collection_view_page' && rawMetadata?.type !== 'collection_view') {
      console.warn('\n⚠️ 这个页面不是「数据库」(collection view) 类型，可能是单篇页面。')
      console.warn('   需要一个数据库页面（含有多条记录的列表），而不是单篇内容页面。')
    } else {
      console.log('\n✅ 该 ID 对应的是一个数据库页面 (collection_view*).')
      console.log('   现在它应该可以正常运行 getAllPosts() 了。')
    }

    console.log('\n--- 额外信息（只供排查）---')
    console.log('页面标题 (rawMetadata.properties.title):',
      rawMetadata?.properties?.title?.[0]?.[0] || '<unknown>')

  } catch (err) {
    console.error('Notion API call failed:')
    console.error(err)
    process.exit(1)
  }
}

main()