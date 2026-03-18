import BLOG from '@/blog.config'
import dynamic from 'next/dynamic'

const SupaCommentsComponent = dynamic(
  () => {
    return import('@/components/Post/SupaComments')
  },
  { ssr: false }
)

const Comments = ({ frontMatter }) => {
  return (
    <div>
      {BLOG.comment && BLOG.comment.provider === 'supacomments' && (
        <SupaCommentsComponent frontMatter={frontMatter} />
      )}
    </div>
  )
}

export default Comments
