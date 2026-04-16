// Phase 4a placeholder. Phase 4b will replace with the styled post page layout.
import { Link, useParams } from 'react-router-dom';
import { getPostBySlug } from './posts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div style={{ padding: '120px 40px', maxWidth: 720, margin: '0 auto' }}>
        <h1>post not found</h1>
        <Link to="/blog">back to all writing</Link>
      </div>
    );
  }

  const Body = post.Component;
  return (
    <div style={{ padding: '120px 40px 80px', maxWidth: 720, margin: '0 auto' }}>
      <Link to="/blog" style={{ color: '#7a6f62', textDecoration: 'none' }}>← all writing</Link>
      <h1 style={{ fontSize: 48, margin: '24px 0 16px' }}>{post.title}</h1>
      <p style={{ color: '#9A8F85', marginBottom: 32 }}>
        {post.type} · {post.date}
      </p>
      <article>
        <Body />
      </article>
    </div>
  );
}
