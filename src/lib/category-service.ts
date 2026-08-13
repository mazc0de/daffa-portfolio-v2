import { BlogCategory } from '@/types/blog'
import { supabase, isSupabaseConfigured } from './supabase'

const INITIAL_SEED_CATEGORIES: BlogCategory[] = [
  {
    id: 'seed-cat-1',
    name: 'ENGINEERING',
    slug: 'engineering',
    color: '#D02020',
    description: 'Software development, React 19 & architecture',
    created_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'seed-cat-2',
    name: 'DESIGN',
    slug: 'design',
    color: '#1040C0',
    description: 'Bauhaus UI, spatial design systems & CSS',
    created_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'seed-cat-3',
    name: 'THOUGHTS',
    slug: 'thoughts',
    color: '#F0C020',
    description: 'Career insights and engineering philosophy',
    created_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'seed-cat-4',
    name: 'TUTORIAL',
    slug: 'tutorial',
    color: '#121212',
    description: 'Step by step guides and code walkthroughs',
    created_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'seed-cat-5',
    name: 'GENERAL',
    slug: 'general',
    color: '#1040C0',
    description: 'General updates and announcements',
    created_at: '2026-08-01T10:00:00.000Z'
  }
]

const CATEGORIES_STORAGE_KEY = 'daffa_portfolio_blog_categories_v1'

function getLocalCategories(): BlogCategory[] {
  if (typeof window === 'undefined') return INITIAL_SEED_CATEGORIES
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(
        CATEGORIES_STORAGE_KEY,
        JSON.stringify(INITIAL_SEED_CATEGORIES)
      )
      return INITIAL_SEED_CATEGORIES
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed reading local categories fallback:', err)
    return INITIAL_SEED_CATEGORIES
  }
}

function saveLocalCategories(categories: BlogCategory[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
  } catch (err) {
    console.error('Failed saving local categories fallback:', err)
  }
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        return data as BlogCategory[]
      }
      if (error) {
        console.warn(
          'Supabase categories fetch error, fallback local:',
          error.message
        )
      }
    } catch (err) {
      console.warn('Supabase categories exception, fallback local:', err)
    }
  }

  return getLocalCategories()
}

export async function saveCategory(
  category: Partial<BlogCategory>
): Promise<{ success: boolean; data?: BlogCategory; error?: string }> {
  const isNew = !category.id
  const now = new Date().toISOString()
  const name = category.name?.trim().toUpperCase() || 'NEW CATEGORY'
  const slug =
    category.slug?.trim().toLowerCase() ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  const color = category.color || '#1040C0'
  const description = category.description?.trim() || ''

  if (isSupabaseConfigured() && supabase) {
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name,
            slug,
            color,
            description
          })
          .select()
          .single()

        if (error) throw error
        return { success: true, data: data as BlogCategory }
      } else {
        const { data, error } = await supabase
          .from('categories')
          .update({
            name,
            slug,
            color,
            description
          })
          .eq('id', category.id)
          .select()
          .single()

        if (error) throw error
        return { success: true, data: data as BlogCategory }
      }
    } catch (err: any) {
      console.warn(
        'Supabase saveCategory error, writing fallback local:',
        err.message || err
      )
    }
  }

  // Local Storage Fallback
  const local = getLocalCategories()
  let resultCategory: BlogCategory

  if (isNew) {
    resultCategory = {
      id: `local-cat-${Date.now()}`,
      name,
      slug,
      color,
      description,
      created_at: now
    }
    local.push(resultCategory)
  } else {
    const idx = local.findIndex(c => c.id === category.id)
    if (idx !== -1) {
      resultCategory = {
        ...local[idx],
        name,
        slug,
        color,
        description
      }
      local[idx] = resultCategory
    } else {
      resultCategory = {
        id: category.id || `local-cat-${Date.now()}`,
        name,
        slug,
        color,
        description,
        created_at: now
      }
      local.push(resultCategory)
    }
  }

  saveLocalCategories(local)
  return { success: true, data: resultCategory }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    } catch (err: any) {
      console.warn(
        'Supabase deleteCategory error, fallback local:',
        err.message || err
      )
    }
  }

  const local = getLocalCategories()
  const filtered = local.filter(c => c.id !== id)
  saveLocalCategories(filtered)
  return { success: true }
}
