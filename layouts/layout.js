import { useMemo } from 'react'
import { getPageTitle } from 'notion-utils'
import { motion } from 'framer-motion'

import Container from '@/components/Container'
import Content from '@/components/Post/Content'
import Aside from '@/components/Post/Aside'
import Comments from '@/components/Post/Comments'
import PostFooter from '@/components/Post/PostFooter'

const Layout = ({ blockMap, frontMatter, fullWidth = false }) => {
  const pageTitle = getPageTitle(blockMap)
  const showSubPageTitle = useMemo(
    () => frontMatter.title !== pageTitle,
    [frontMatter.title, pageTitle]
  )

  return (
    <Container
      title={`${frontMatter.title}${frontMatter.title === pageTitle ? '' : ' | ' + pageTitle}`}
      description={frontMatter.summary}
      // date={new Date(frontMatter.publishedAt).toISOString()}
      type='article'
      fullWidth={fullWidth}
    >
      <motion.div className='flex flex-row'>
        <Content
          frontMatter={frontMatter}
          blockMap={blockMap}
          pageTitle={showSubPageTitle ? pageTitle : null}
        />
        <Aside
          frontMatter={frontMatter}
          blockMap={blockMap}
          pageTitle={showSubPageTitle ? pageTitle : null}
        />
      </motion.div>
      <PostFooter />
      <Comments frontMatter={frontMatter} />
    </Container>
  )
}

export default Layout
