import { BlogPost } from '@/types/blog'
import { supabase, isSupabaseConfigured } from './supabase'

const INITIAL_SEED_POSTS: BlogPost[] = [
  {
    id: 'seed-post-1',
    title: 'BUILDING BINARY MODERNISM: CONSTRUCTIVIST WEB ARCHITECTURE',
    slug: 'building-binary-modernism-constructivist-web-architecture',
    excerpt:
      'Exploring how 1920s Bauhaus poster art can inspire modern web interfaces with rigid geometric grid structures, primary color palettes, and tactile micro-interactions.',
    content: `# Building Binary Modernism

Modern web design often falls into the trap of generic pastel gradients, soft rounded corners, and subtle dropshadows. **Binary Modernism** takes a radical step backwards to 1920s Bauhaus and Constructivist poster design to create high-impact, memorable web experiences.

> "Art is not a mirror to reflect the world, but a hammer with which to shape it." - Auguste Rodin

## Core Principles

1. **Binary Geometry**: Radius is strictly \`0px\` or \`100%\` (ovals/circles). Intermediate border radii are eliminated to enforce crisp structural alignment.
2. **Primary Palette**: Primary Red (\`#D02020\`), Blue (\`#1040C0\`), and Yellow (\`#F0C020\`) contrast against sharp Ink borders (\`#121212\`).
3. **Tactile Interaction**: Physical press effects instead of standard opacity fades.

### Spatial Math Matrix

Below is a snippet demonstrating how 3D rotation vectors are dynamically computed based on page scroll offset:

\`\`\`typescript
// Example: CSS Matrix Transformation for 3D Perspective Plane
function computeTilt(scrollY: number): { rx: number; ry: number } {
  const BASE_RX = 12;
  const BASE_RY = -8;
  return {
    rx: Math.max(-15, Math.min(25, BASE_RX - scrollY * 0.015)),
    ry: Math.max(-20, Math.min(10, BASE_RY + scrollY * 0.01))
  };
}
\`\`\`

> "Good design is as little design as possible. Less, but better – because it concentrates on the essential aspects." - Dieter Rams

### High Contrast Typography

Typography is set exclusively in **Outfit**, prioritizing heavy weights (900/800) for headlines and tight letter tracking.

Stay tuned as we dive deeper into spatial web performance!`,
    category: 'DESIGN',
    tags: ['BAUHAUS', 'CSS', 'NEXTJS'],
    cover_image:
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    read_time: '4 min read',
    likes: 18,
    published: true,
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'seed-post-2',
    title: 'OPTIMIZING HIGH PERFORMANCE REACT 19 SERVER COMPONENTS',
    slug: 'optimizing-high-performance-react-19-server-components',
    excerpt:
      'A practical guide to leveraging async server components, selective rehydration, and zero-bundle layout primitives for ultra fast page load performance.',
    content: `# React 19 Server Architecture

With React 19, Server Components are no longer an experimental opt-in feature; they are the default paradigm for building scalable frontend systems.

> "Simplicity is prerequisite for reliability." - Edsger W. Dijkstra

## Code Example

\`\`\`tsx
// Next.js App Router Server Component
import { createClient } from '@/lib/supabase/server'

export async function PostList() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts?.map(post => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  )
}
\`\`\`

## Key Advantages

- **Zero Bundle Overhead**: Server logic stays strictly on the server node.
- **Direct Database Access**: Query Supabase directly without boilerplate middleware.
- **Streaming SSR**: Progressively stream UI chunks as data resolves.

> "Premature optimization is the root of all evil in software development." - Donald Knuth

By keeping heavy dependencies on the server, your initial bundle size drops drastically while maintaining fluid interactive experiences.`,
    category: 'ENGINEERING',
    tags: ['REACT', 'SUPABASE', 'TYPESCRIPT'],
    cover_image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    read_time: '5 min read',
    likes: 24,
    published: true,
    created_at: '2026-08-05T14:30:00.000Z',
    updated_at: '2026-08-05T14:30:00.000Z',
  },
  {
    id: 'seed-post-3',
    title: 'FULLSTACK CMS INTEGRATION WITH SUPABASE & MARKDOWN',
    slug: 'fullstack-cms-integration-with-supabase-and-markdown',
    excerpt:
      'How to build a lightweight, custom CMS for portfolio sites using Supabase RLS, live preview markdown editors, and syntax highlighted code blocks.',
    content: `# Fullstack CMS Integration

Having complete control over your content stack without relying on bulky third-party headless CMS subscriptions gives developers unmatched flexibility.

> "Controlling your data schema means controlling your site destiny."

## Database Schema Design

\`\`\`sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_policy_id(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

## Features Built-in

- **Live Markdown Preview**: See your quotes, code snippets, and headers formatted in real-time.
- **Tag & Search Indexing**: Filter through topics effortlessly.
- **Supabase Sync**: Direct CRUD sync with automated timestamp triggers.

\`\`\`bash
# Run Supabase migrations locally or in Cloud Console
npx supabase db push
\`\`\`

Write once, publish anywhere!`,
    category: 'TUTORIAL',
    tags: ['CMS', 'SUPABASE', 'MARKDOWN'],
    cover_image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
    read_time: '3 min read',
    likes: 12,
    published: true,
    created_at: '2026-08-08T09:15:00.000Z',
    updated_at: '2026-08-08T09:15:00.000Z',
  },
]

const STORAGE_KEY = 'daffa_portfolio_blog_posts_v1'
const LOVED_POSTS_KEY = 'daffa_blog_user_loved_posts_v1'

export function getLovedPostIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOVED_POSTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    return []
  }
}

export function hasUserLovedPost(postId: string): boolean {
  const ids = getLovedPostIds()
  return ids.includes(postId)
}

export function setUserLovedPost(postId: string, loved: boolean): void {
  if (typeof window === 'undefined') return
  try {
    const ids = getLovedPostIds()
    let updated: string[]
    if (loved) {
      updated = Array.from(new Set([...ids, postId]))
    } else {
      updated = ids.filter(id => id !== postId)
    }
    localStorage.setItem(LOVED_POSTS_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed saving user loved status:', err)
  }
}

// Helper for local storage persistence fallback
function getLocalPosts(): BlogPost[] {
  if (typeof window === 'undefined') return INITIAL_SEED_POSTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_POSTS))
      return INITIAL_SEED_POSTS
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed reading local posts fallback:', err)
    return INITIAL_SEED_POSTS
  }
}

function saveLocalPosts(posts: BlogPost[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch (err) {
    console.error('Failed saving local posts fallback:', err)
  }
}

export async function fetchPosts(includeDrafts = false): Promise<BlogPost[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (!includeDrafts) {
        query = query.eq('published', true)
      }
      const { data, error } = await query
      if (error) {
        console.warn('Supabase query error, falling back to local posts:', error.message)
        return getLocalPosts().filter(p => includeDrafts || p.published)
      }
      if (data && data.length > 0) {
        return data.map(p => ({
          ...p,
          likes: p.likes ?? 0,
        })) as BlogPost[]
      }
    } catch (err) {
      console.warn('Supabase connection exception, using local fallback:', err)
    }
  }

  // Fallback mode
  const local = getLocalPosts()
  return local.filter(p => includeDrafts || p.published).map(p => ({
    ...p,
    likes: p.likes ?? 0,
  }))
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!error && data) {
        return {
          ...data,
          likes: data.likes ?? 0,
        } as BlogPost
      }
    } catch (err) {
      console.warn('Supabase getPostBySlug exception, fallback local:', err)
    }
  }

  const local = getLocalPosts()
  const found = local.find(p => p.slug === slug)
  if (!found) return null
  return {
    ...found,
    likes: found.likes ?? 0,
  }
}

export async function togglePostLove(postId: string): Promise<{ success: boolean; newLikes: number; isLoved: boolean }> {
  const currentlyLoved = hasUserLovedPost(postId)
  const nextLoved = !currentlyLoved
  setUserLovedPost(postId, nextLoved)

  let newLikesCount = 0

  if (isSupabaseConfigured() && supabase) {
    try {
      // Fetch current likes count
      const { data: currentPost } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .single()

      const currentLikes = currentPost?.likes ?? 0
      newLikesCount = Math.max(0, nextLoved ? currentLikes + 1 : currentLikes - 1)

      await supabase
        .from('posts')
        .update({ likes: newLikesCount })
        .eq('id', postId)
    } catch (err) {
      console.warn('Supabase togglePostLove error, using local fallback:', err)
    }
  }

  // Update local fallback storage
  const local = getLocalPosts()
  const idx = local.findIndex(p => p.id === postId)
  if (idx !== -1) {
    const currentLikes = local[idx].likes ?? 0
    const calcLikes = Math.max(0, nextLoved ? currentLikes + 1 : currentLikes - 1)
    local[idx].likes = calcLikes
    saveLocalPosts(local)
    newLikesCount = calcLikes
  }

  return { success: true, newLikes: newLikesCount, isLoved: nextLoved }
}

export async function savePost(post: Partial<BlogPost>): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  const isNew = !post.id
  const now = new Date().toISOString()

  const payload: Partial<BlogPost> = {
    ...post,
    title: post.title?.trim() || 'Untitled Post',
    slug: post.slug?.trim() || (post.title ? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `post-${Date.now()}`),
    excerpt: post.excerpt?.trim() || '',
    content: post.content || '',
    category: post.category || 'GENERAL',
    tags: post.tags && post.tags.length > 0 ? post.tags : ['GENERAL'],
    read_time: post.read_time || `${Math.max(1, Math.ceil((post.content || '').split(' ').length / 200))} min read`,
    likes: post.likes ?? 0,
    published: post.published ?? false,
    updated_at: now,
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt,
            content: payload.content,
            category: payload.category,
            tags: payload.tags,
            cover_image: payload.cover_image,
            read_time: payload.read_time,
            likes: payload.likes,
            published: payload.published,
          })
          .select()
          .single()

        if (error) throw error
        return { success: true, data: data as BlogPost }
      } else {
        const { data, error } = await supabase
          .from('posts')
          .update({
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt,
            content: payload.content,
            category: payload.category,
            tags: payload.tags,
            cover_image: payload.cover_image,
            read_time: payload.read_time,
            likes: payload.likes,
            published: payload.published,
            updated_at: now,
          })
          .eq('id', post.id)
          .select()
          .single()

        if (error) throw error
        return { success: true, data: data as BlogPost }
      }
    } catch (err: any) {
      console.warn('Supabase save error, writing to local storage fallback:', err)
    }
  }

  // Local storage save fallback
  const local = getLocalPosts()
  let resultPost: BlogPost

  if (isNew) {
    resultPost = {
      ...payload,
      id: `local-post-${Date.now()}`,
      created_at: now,
    } as BlogPost
    local.unshift(resultPost)
  } else {
    const idx = local.findIndex(p => p.id === post.id)
    if (idx !== -1) {
      resultPost = {
        ...local[idx],
        ...payload,
      } as BlogPost
      local[idx] = resultPost
    } else {
      resultPost = {
        ...payload,
        id: post.id || `local-post-${Date.now()}`,
        created_at: now,
      } as BlogPost
      local.unshift(resultPost)
    }
  }

  saveLocalPosts(local)
  return { success: true, data: resultPost }
}

export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
    } catch (err: any) {
      console.warn('Supabase delete post error, removing from local storage:', err)
    }
  }

  const local = getLocalPosts()
  const filtered = local.filter(p => p.id !== id)
  saveLocalPosts(filtered)
  return { success: true }
}
