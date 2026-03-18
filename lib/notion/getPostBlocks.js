import BLOG from '@/blog.config'
import { NotionAPI } from 'notion-client'
import { getPreviewImageMap } from './previewImages'
import normalizeRecordMap from './normalizeRecordMap'

export async function getPostBlocks(id) {
  const authToken = BLOG.notionAccessToken || null
  const api = new NotionAPI({ authToken })
  const rawRecordMap = await api.getPage(id)
  const pageBlock = normalizeRecordMap(rawRecordMap)
  if (BLOG.previewImagesEnabled) {
    const previewImageMap = await getPreviewImageMap(pageBlock)
    pageBlock.preview_images = previewImageMap
  }
  return pageBlock
}
