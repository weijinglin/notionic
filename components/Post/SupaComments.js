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
    <article className={`${isReply ? 'mt-4 ml-5 md:ml-8' : 'mt-4'} relative reveal-fade`}>
      {isReply && (
        <span className='absolute -left-4 top-5 h-[1px] w-3 bg-slate-300 dark:bg-slate-600' />
      )}

      <div className='rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm transition-all duration-300 dark:border-slate-700/80 dark:bg-slate-800/80 hover:shadow-md'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
              {node.nickname}
            </p>
            {node.website && (
              <a
                href={node.website}
                target='_blank'
                rel='noreferrer'
                className='mt-0.5 block truncate text-xs text-cyan-600 hover:text-cyan-700 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300'
              >
                {node.website}
              </a>
            )}
          </div>

          <time className='text-xs text-slate-500 dark:text-slate-400'>
            {formatTime(node.created_at, locale)}
          </time>
        </div>

        <p className='mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-200'>
          {node.content}
        </p>

        <div className='mt-3 flex items-center'>
          <button
            type='button'
            className='rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700/50'
            onClick={() => onReply(node)}
          >
            {text.reply}
          </button>
        </div>
      </div>

      {node.replies.length > 0 && (
        <div className='ml-1 border-l border-dashed border-slate-300 pl-3 dark:border-slate-600'>
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
      )}
    </article>
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
        const detail = await res.text()
        throw new Error(`failed to fetch comments: ${res.status} ${detail}`)
      }

      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
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
        const detail = await res.text()
        throw new Error(`failed to post comment: ${res.status} ${detail}`)
      }

      setForm((prev) => ({ ...prev, content: '' }))
      setReplyTo(null)
      setSuccess(text.sendSuccess)
      await fetchComments()
    } catch (error) {
      console.error(error)
      setError(text.sendError)
    } finally {
      setSubmitting(false)
    }
  }

  const commentTree = useMemo(() => buildTree(rows), [rows])

  return (
    <section id='comments' className='mt-16 reveal-up'>
      <h3 className='text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100'>{text.title}</h3>

      <form onSubmit={onSubmit} className='mt-4 space-y-3 rounded-2xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/60'>
        {replyTo && (
          <div className='flex items-center justify-between rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-100'>
            <span>
              {text.replyingTo}: <span className='font-semibold'>{replyTo.nickname}</span>
            </span>
            <button
              type='button'
              className='text-xs font-medium hover:underline'
              onClick={onCancelReply}
            >
              {text.cancelReply}
            </button>
          </div>
        )}

        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <input
            value={form.nickname}
            onChange={(e) => onInputChange('nickname', e.target.value)}
            placeholder={text.nickname}
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-700'
          />
          <input
            value={form.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder={text.email}
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-700'
          />
          <input
            value={form.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder={text.website}
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-700'
          />
        </div>

        <textarea
          value={form.content}
          onChange={(e) => onInputChange('content', e.target.value)}
          placeholder={text.content}
          rows={4}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-slate-400 dark:focus:ring-slate-700'
        />

        {error && <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>}
        {success && <p className='text-sm text-emerald-600 dark:text-emerald-400'>{success}</p>}

        <button
          type='submit'
          disabled={submitting}
          className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'
        >
          {submitting ? text.submitting : text.submit}
        </button>
      </form>

      <div className='mt-6'>
        {loading && <p className='text-sm text-slate-500 dark:text-slate-400'>{activeLocale === 'zh' ? '加载中...' : 'Loading...'}</p>}
        {!loading && commentTree.length === 0 && (
          <p className='text-sm text-slate-500 dark:text-slate-400'>{text.empty}</p>
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
