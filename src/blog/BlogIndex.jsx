// Phase 4a placeholder. Phase 4b will replace with the real card grid.
import { Link } from 'react-router-dom';
import { posts } from './posts';

export default function BlogIndex() {
  return (
    <div style={{ padding: '120px 40px 80px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 48, marginBottom: 24 }}>blog (phase 4a placeholder)</h1>
      <p style={{ color: '#7a6f62', marginBottom: 32 }}>
        loaded {posts.length} post{posts.length === 1 ? '' : 's'} from src/posts/
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((p) => (
          <li key={p.slug} style={{ marginBottom: 16 }}>
            <Link to={p.href} style={{ color: '#F4A27D', textDecoration: 'underline' }}>
              {p.title || p.slug}
            </Link>
            <span style={{ color: '#9A8F85', marginLeft: 12 }}>
              ({p.type} · {p.date})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
