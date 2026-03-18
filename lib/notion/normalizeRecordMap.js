const unwrapRecordValue = (record) => {
  if (!record || typeof record !== 'object') return record
  if (record.value && record.value.value) {
    return {
      ...record,
      value: record.value.value
    }
  }
  return record
}

const normalizeTable = (table) => {
  if (!table || typeof table !== 'object') return null
  const normalized = {}
  for (const [key, value] of Object.entries(table)) {
    normalized[key] = unwrapRecordValue(value)
  }
  return normalized
}

const sanitizeUndefined = (value) => {
  if (value === undefined) return null
  if (value === null) return null
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUndefined(item))
  }
  if (typeof value === 'object') {
    const output = {}
    for (const [key, item] of Object.entries(value)) {
      output[key] = sanitizeUndefined(item)
    }
    return output
  }
  return value
}

export default function normalizeRecordMap(recordMap) {
  if (!recordMap || typeof recordMap !== 'object') return recordMap

  const normalized = {
    ...recordMap,
    block: normalizeTable(recordMap.block),
    collection: normalizeTable(recordMap.collection),
    collection_view: normalizeTable(recordMap.collection_view),
    notion_user: normalizeTable(recordMap.notion_user),
    space: normalizeTable(recordMap.space)
  }

  return sanitizeUndefined(normalized)
}
