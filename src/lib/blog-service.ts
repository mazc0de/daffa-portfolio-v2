import { BlogPost } from '@/types/blog'
import { supabase, isSupabaseConfigured } from './supabase'

const LOVED_POSTS_KEY = 'daffa_blog_user_loved_posts_v1'

export function getLovedPostIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOVED_POSTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
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

export async function fetchPosts(includeDrafts = false): Promise<BlogPost[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

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
      console.warn('Supabase query error:', error.message)
      return []
    }

    if (data) {
      return data.map(p => ({
        ...p,
        likes: p.likes ?? 0
      })) as BlogPost[]
    }
  } catch (err) {
    console.warn('Supabase connection exception:', err)
  }

  return []
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.warn('Supabase getPostBySlug exception:', error.message)
      return null
    }

    if (data) {
      return {
        ...data,
        likes: data.likes ?? 0
      } as BlogPost
    }
  } catch (err) {
    console.warn('Supabase getPostBySlug exception:', err)
  }

  return null
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
      console.warn('Supabase togglePostLove error:', err)
    }
  }

  return { success: true, newLikes: newLikesCount, isLoved: nextLoved }
}

export async function savePost(
  post: Partial<BlogPost>
): Promise<{ success: boolean; data?: BlogPost; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please verify your environment variables.'
    }
  }

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
    tags: post.tags && post.tags.length > 0 ? post.tags : [],
    read_time:
      post.read_time ||
      `${Math.max(1, Math.ceil((post.content || '').split(' ').length / 200))} min read`,
    likes: post.likes ?? 0,
    published: post.published ?? false,
    updated_at: now
  }

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
    console.error('Supabase save error:', err)
    return { success: false, error: err.message || 'Failed to save post to Supabase' }
  }
}

export async function deletePost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.'
    }
  }

  try {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (err: any) {
    console.error('Supabase delete post error:', err)
    return { success: false, error: err.message || 'Failed to delete post from Supabase' }
  }
}
