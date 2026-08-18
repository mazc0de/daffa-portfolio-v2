import { BlogPost } from '@/types/blog'
import { supabase, isSupabaseConfigured } from './supabase'

const INITIAL_SEED_POSTS: BlogPost[] = []

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
    const parsed: BlogPost[] = JSON.parse(raw)
    const cleaned = parsed.filter(p => !p.id?.startsWith('seed-post-'))
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    }
    return cleaned
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
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (!includeDrafts) {
        query = query.eq('published', true)
      }
      const { data, error } = await query
      if (error) {
        console.warn(
          'Supabase query error, falling back to local posts:',
          error.message
        )
        return getLocalPosts().filter(p => includeDrafts || p.published)
      }
      if (data) {
        return data.map(p => ({
          ...p,
          likes: p.likes ?? 0
        })) as BlogPost[]
      }
    } catch (err) {
      console.warn('Supabase connection exception, using local fallback:', err)
    }
  }

  // Fallback mode
  const local = getLocalPosts()
  return local
    .filter(p => includeDrafts || p.published)
    .map(p => ({
      ...p,
      likes: p.likes ?? 0
    }))
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) {
        console.warn('Supabase getPostBySlug exception, fallback local:', error.message)
      } else if (data) {
        return {
          ...data,
          likes: data.likes ?? 0
        } as BlogPost
      } else {
        return null
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
    likes: found.likes ?? 0
  }
}

export async function togglePostLove(
  postId: string
): Promise<{ success: boolean; newLikes: number; isLoved: boolean }> {
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
      newLikesCount = Math.max(
        0,
        nextLoved ? currentLikes + 1 : currentLikes - 1
      )

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
    const calcLikes = Math.max(
      0,
      nextLoved ? currentLikes + 1 : currentLikes - 1
    )
    local[idx].likes = calcLikes
    saveLocalPosts(local)
    newLikesCount = calcLikes
  }

  return { success: true, newLikes: newLikesCount, isLoved: nextLoved }
}

export async function savePost(
  post: Partial<BlogPost>
): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  const isNew = !post.id
  const now = new Date().toISOString()

  const payload: Partial<BlogPost> = {
    ...post,
    title: post.title?.trim() || 'Untitled Post',
    slug:
      post.slug?.trim() ||
      (post.title
        ? post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : `post-${Date.now()}`),
    excerpt: post.excerpt?.trim() || '',
    content: post.content || '',
    category: post.category || 'GENERAL',
    tags: post.tags && post.tags.length > 0 ? post.tags : ['GENERAL'],
    read_time:
      post.read_time ||
      `${Math.max(1, Math.ceil((post.content || '').split(' ').length / 200))} min read`,
    likes: post.likes ?? 0,
    published: post.published ?? false,
    updated_at: now
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
            published: payload.published
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
            updated_at: now
          })
          .eq('id', post.id)
          .select()
          .single()

        if (error) throw error
        return { success: true, data: data as BlogPost }
      }
    } catch (err: any) {
      console.warn(
        'Supabase save error, writing to local storage fallback:',
        err
      )
    }
  }

  // Local storage save fallback
  const local = getLocalPosts()
  let resultPost: BlogPost

  if (isNew) {
    resultPost = {
      ...payload,
      id: `local-post-${Date.now()}`,
      created_at: now
    } as BlogPost
    local.unshift(resultPost)
  } else {
    const idx = local.findIndex(p => p.id === post.id)
    if (idx !== -1) {
      resultPost = {
        ...local[idx],
        ...payload
      } as BlogPost
      local[idx] = resultPost
    } else {
      resultPost = {
        ...payload,
        id: post.id || `local-post-${Date.now()}`,
        created_at: now
      } as BlogPost
      local.unshift(resultPost)
    }
  }

  saveLocalPosts(local)
  return { success: true, data: resultPost }
}

export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
    } catch (err: any) {
      console.warn(
        'Supabase delete post error, removing from local storage:',
        err
      )
    }
  }

  const local = getLocalPosts()
  const filtered = local.filter(p => p.id !== id)
  saveLocalPosts(filtered)
  return { success: true }
}
