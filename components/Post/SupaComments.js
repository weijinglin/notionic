import BLOG from '@/blog.config'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'

const COMMENTS_TABLE = 'comments'

const labels = {
  zh: {
    title: '评论区',
    nickname: '昵称',
    email: '邮箱（可选）',
    website: '网站（可选）',
    content: '写下你的评论...',
    submit: '发布评论',
    submitting: '发布中...',
    reply: '回复',
    cancelReply: '取消回复',
    replyingTo: '正在回复',
    empty: '还没有评论，来抢个沙发吧。',
    loadError: '评论加载失败，请稍后刷新重试。',
    sendError: '提交失败，请稍后重试。',
    sendSuccess: '评论发布成功。',
    required: '请至少填写昵称和评论内容。'
  },
  en: {
    title: 'Comments',
    nickname: 'Name',
    email: 'Email (optional)',
    website: 'Website (optional)',
    content: 'Write your comment...',
    submit: 'Post Comment',
    submitting: 'Posting...',
    reply: 'Reply',
    cancelReply: 'Cancel reply',
    replyingTo: 'Replying to',
    empty: 'No comments yet.',
    loadError: 'Failed to load comments. Please refresh and try again.',
    sendError: 'Failed to post comment. Please try again.',
    sendSuccess: 'Comment posted.',
    required: 'Please fill in your name and comment content.'
  }
}

const toLocale = (locale) => {
  if (!locale) return 'en'
  return locale.startsWith('zh') ? 'zh' : 'en'
}

const formatTime = (value, locale) => {
  try {
    const date = new Date(value)
    return date.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return value
  }
}

const buildTree = (rows) => {
  const map = new Map()
  rows.forEach((row) => {
    map.set(row.id, { ...row, replies: [] })
  })

  const roots = []
  rows.forEach((row) => {
    const node = map.get(row.id)
    if (row.parent_id && map.has(row.parent_id)) {
      map.get(row.parent_id).replies.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const normalizeWebsite = (value) => {
  const raw = value.trim()
  if (!raw) return null

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

const CommentNode = ({ node, locale, text, onReply, depth = 0 }) => {
  const isReply = depth > 0
  return (
    <div className={`${isReply ? 'ml-6 md:ml-10 mt-4' : 'mt-5'} border-l border-gray-200 dark:border-gray-700 pl-4`}>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='font-medium text-gray-900 dark:text-gray-100'>{node.nickname}</span>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {formatTime(node.created_at, locale)}
        </span>
      </div>
      <p className='mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300'>{node.content}</p>
      {node.website && (
        <a
          href={node.website}
          target='_blank'
          rel='noreferrer'
          className='inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
        >
          {node.website}
        </a>
      )}
      <button
        type='button'
        className='mt-2 text-sm text-gray-600 dark:text-gray-300 hover:underline'
        onClick={() => onReply(node)}
      >
        {text.reply}
      </button>

      {node.replies.map((reply) => (
        <CommentNode
          key={reply.id}
          node={reply}
          locale={locale}
          text={text}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

const SupaComments = ({ frontMatter }) => {
  const { locale } = useRouter()
  const activeLocale = toLocale(locale)
  const text = labels[activeLocale]

  const postId = useMemo(() => {
    return frontMatter?.id || frontMatter?.slug || ''
  }, [frontMatter])

  const supabaseUrl = BLOG.comment?.supaCommentsConfig?.supabaseUrl
  const anonKey = BLOG.comment?.supaCommentsConfig?.supabaseAnonKey

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rows, setRows] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [form, setForm] = useState({
    nickname: '',
    email: '',
    website: '',
    content: ''
  })

  const fetchComments = useCallback(async () => {
    if (!postId || !supabaseUrl || !anonKey) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = `${supabaseUrl}/rest/v1/${COMMENTS_TABLE}?select=id,parent_id,post_id,nickname,email,website,content,created_at&post_id=eq.${encodeURIComponent(postId)}&order=created_at.asc`
      const res = await fetch(url, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      })

      if (!res.ok) {
        throw new Error('failed to fetch comments')
      }

      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setError(text.loadError)
    } finally {
      setLoading(false)
    }
  }, [anonKey, postId, supabaseUrl, text.loadError])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const onInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onReply = (comment) => {
    setReplyTo(comment)
  }

  const onCancelReply = () => {
    setReplyTo(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.nickname.trim() || !form.content.trim()) {
      setError(text.required)
      return
    }

    if (!postId || !supabaseUrl || !anonKey) {
      setError(text.sendError)
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        post_id: postId,
        parent_id: replyTo?.id || null,
        nickname: form.nickname.trim(),
        email: form.email.trim() || null,
        website: normalizeWebsite(form.website),
        content: form.content.trim()
      }

      const res = await fetch(`${supabaseUrl}/rest/v1/${COMMENTS_TABLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error('failed to post comment')
      }

      setForm((prev) => ({ ...prev, content: '' }))
      setReplyTo(null)
      setSuccess(text.sendSuccess)
      await fetchComments()
    } catch {
      setError(text.sendError)
    } finally {
      setSubmitting(false)
    }
  }

  const commentTree = useMemo(() => buildTree(rows), [rows])

  return (
    <section id='comments' className='mt-12'>
      <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>{text.title}</h3>

      <form onSubmit={onSubmit} className='mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3'>
        {replyTo && (
          <div className='text-sm text-gray-600 dark:text-gray-300'>
            {text.replyingTo}: <span className='font-medium'>{replyTo.nickname}</span>
            <button
              type='button'
              className='ml-3 hover:underline'
              onClick={onCancelReply}
            >
              {text.cancelReply}
            </button>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={form.nickname}
            onChange={(e) => onInputChange('nickname', e.target.value)}
            placeholder={text.nickname}
            className='rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm'
          />
          <input
            value={form.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder={text.email}
            className='rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm'
          />
          <input
            value={form.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder={text.website}
            className='rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm'
          />
        </div>

        <textarea
          value={form.content}
          onChange={(e) => onInputChange('content', e.target.value)}
          placeholder={text.content}
          rows={4}
          className='w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm'
        />

        {error && <p className='text-sm text-red-600'>{error}</p>}
        {success && <p className='text-sm text-green-600'>{success}</p>}

        <button
          type='submit'
          disabled={submitting}
          className='rounded-md bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 text-sm disabled:opacity-60'
        >
          {submitting ? text.submitting : text.submit}
        </button>
      </form>

      <div className='mt-6'>
        {loading && <p className='text-sm text-gray-500 dark:text-gray-400'>{activeLocale === 'zh' ? '加载中...' : 'Loading...'}</p>}
        {!loading && commentTree.length === 0 && (
          <p className='text-sm text-gray-500 dark:text-gray-400'>{text.empty}</p>
        )}
        {commentTree.map((comment) => (
          <CommentNode
            key={comment.id}
            node={comment}
            locale={activeLocale}
            text={text}
            onReply={onReply}
          />
        ))}
      </div>
    </section>
  )
}

export default SupaComments
