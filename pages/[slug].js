import Layout from '@/layouts/layout'
import { getAllPosts, getPostBlocks } from '@/lib/notion'
import BLOG from '@/blog.config'
import { useRouter } from 'next/router'
import Loading from '@/components/Loading'
import NotFound from '@/components/NotFound'

const Post = ({ post, blockMap }) => {
  const router = useRouter()
  if (router.isFallback) {
    return (
      <Loading />
    )
  }
  if (!post) {
    return <NotFound statusCode={404} />
  }
  return (
    <Layout blockMap={blockMap} frontMatter={post} fullWidth={post.fullWidth} />
  )
}

export async function getStaticPaths() {
  const posts = await getAllPosts({ onlyNewsletter: false })

  if (!Array.isArray(posts)) {
    console.warn('getStaticPaths: getAllPosts did not return an array:', posts)
    return {
      paths: [],
      fallback: true
    }
  }

  return {
    paths: posts.map((row) => `${BLOG.path}/${row.slug}`),
    fallback: true
  }
}

export async function getStaticProps({ params: { slug } }) {
  const posts = await getAllPosts({ onlyNewsletter: false })
  const post = Array.isArray(posts) ? posts.find((t) => t.slug === slug) : null

  if (!post) {
    return {
      notFound: true
    }
  }

  try {
    const blockMap = await getPostBlocks(post.id)

    if (process.env.NODE_ENV === 'development') {
      const size = Buffer.byteLength(JSON.stringify({ post, blockMap }), 'utf8')
      console.log('props size KB:', (size / 1024).toFixed(1))
    }

    return {
      props: {
        post,
        blockMap
      },
      revalidate: 1
    }
  } catch (err) {
    console.error(err)
    return {
      notFound: true
    }
  }
}

export default Post
