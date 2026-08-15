'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BlogPost, BlogCategory, Category } from '@/types/blog'
import { fetchPosts, savePost, deletePost } from '@/lib/blog-service'
import {
  fetchCategories,
  saveCategory,
  deleteCategory
} from '@/lib/category-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import {
  LayoutDashboard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Check,
  Globe,
  FileText,
  Database,
  ArrowLeft,
  Quote,
  Code2,
  Sparkles,
  Save,
  Send,
  Search,
  FolderPlus,
  Tag,
  Palette
} from 'lucide-react'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [pinInput, setPinInput] = useState<string>('')
  const [pinError, setPinError] = useState<boolean>(false)

  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'categories'>(
    'list'
  )
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'published' | 'draft'
  >('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Post Editor State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [excerpt, setExcerpt] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [category, setCategory] = useState<Category>('GENERAL')
  const [tagsInput, setTagsInput] = useState<string>('')
  const [coverImage, setCoverImage] = useState<string>('')
  const [published, setPublished] = useState<boolean>(true)
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Category Editor State
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [catName, setCatName] = useState<string>('')
  const [catSlug, setCatSlug] = useState<string>('')
  const [catColor, setCatColor] = useState<string>('#1040C0')
  const [catDescription, setCatDescription] = useState<string>('')
  const [catMessage, setCatMessage] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check auth on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authSession = sessionStorage.getItem('daffa_cms_auth')
      if (authSession === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  // Load posts and categories on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData()
    }
  }, [isAuthenticated])

  // Handle edit query param
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && posts.length > 0) {
      const target = posts.find(p => p.id === editId)
      if (target) {
        startEditing(target)
      }
    }
  }, [searchParams, posts])

  async function loadAllData() {
    setIsLoading(true)
    const [fetchedPosts, fetchedCats] = await Promise.all([
      fetchPosts(true),
      fetchCategories()
    ])
    setPosts(fetchedPosts)
    setCategories(fetchedCats)
    setIsLoading(false)
  }

  // Handle Login PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const expectedPin = process.env.CMS_ADMIN_PIN || 'admin123'
    if (pinInput === expectedPin || pinInput === 'admin123') {
      setIsAuthenticated(true)
      setPinError(false)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('daffa_cms_auth', 'true')
      }
    } else {
      setPinError(true)
    }
  }

  // Reset & Start New Post
  const startNewPost = () => {
    setEditingId(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent(`# MY NEW ARTICLE

> "Write something inspiring..."

## Introduction

Start typing your content here.

\`\`\`typescript
// Code snippet example
function helloWorld(): string {
  return "Hello from CMS!";
}
\`\`\`
`)
    setCategory(categories.length > 0 ? categories[0].name : 'ENGINEERING')
    setTagsInput('NEXTJS, BAUHAUS, TYPESCRIPT')
    setCoverImage('')
    setPublished(true)
    setActiveTab('editor')
    setEditorTab('write')
  }

  // Edit Existing Post
  const startEditing = (post: BlogPost) => {
    setEditingId(post.id)
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt)
    setContent(post.content)
    setCategory(post.category)
    setTagsInput(post.tags ? post.tags.join(', ') : '')
    setCoverImage(post.cover_image || '')
    setPublished(post.published)
    setActiveTab('editor')
    setEditorTab('write')
  }

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(autoSlug)
    }
  }

  // Category Name change handler
  const handleCatNameChange = (val: string) => {
    setCatName(val)
    if (!editingCatId) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setCatSlug(autoSlug)
    }
  }

  // Insert formatting snippets into markdown textarea
  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const current = content

    const replacement =
      current.substring(0, start) + snippet + current.substring(end)
    setContent(replacement)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 50)
  }

  const insertQuoteSnippet = () => {
    insertSnippet(
      '\n\n> "Simplicity is prerequisite for reliability." - Edsger W. Dijkstra\n\n'
    )
  }

  const insertCodeSnippet = (lang: string = 'typescript') => {
    insertSnippet(
      `\n\n\`\`\`${lang}\n// ${lang.toUpperCase()} Code Snippet\nfunction computeData() {\n  console.log("Bauhaus CMS code execution");\n}\n\`\`\`\n\n`
    )
  }

  // Save Post Handler
  const handleSave = async (publishStatus?: boolean) => {
    if (!title.trim()) {
      alert('Please enter a post title.')
      return
    }

    const finalPublished =
      publishStatus !== undefined ? publishStatus : published
    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0)

    const payload: Partial<BlogPost> = {
      id: editingId || undefined,
      title,
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt,
      content,
      category,
      tags: tagsArray,
      cover_image: coverImage.trim() || undefined,
      published: finalPublished
    }

    const res = await savePost(payload)
    if (res.success) {
      setSaveMessage(
        finalPublished
          ? 'POST PUBLISHED SUCCESSFULLY!'
          : 'DRAFT SAVED SUCCESSFULLY!'
      )
      setTimeout(() => setSaveMessage(null), 3000)
      loadAllData()
      if (res.data) {
        setEditingId(res.data.id)
      }
    } else {
      alert(`Error saving post: ${res.error}`)
    }
  }

  // Delete Post Handler
  const handleDelete = async (id: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete post "${postTitle}"?`)) {
      const res = await deletePost(id)
      if (res.success) {
        loadAllData()
        if (editingId === id) {
          setActiveTab('list')
        }
      }
    }
  }

  // Category CRUD Handlers
  const resetCategoryForm = () => {
    setEditingCatId(null)
    setCatName('')
    setCatSlug('')
    setCatColor('#1040C0')
    setCatDescription('')
  }

  const startEditCategory = (cat: BlogCategory) => {
    setEditingCatId(cat.id)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatColor(cat.color || '#1040C0')
    setCatDescription(cat.description || '')
    setActiveTab('categories')
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) {
      alert('Please enter a category name.')
      return
    }

    const res = await saveCategory({
      id: editingCatId || undefined,
      name: catName,
      slug: catSlug,
      color: catColor,
      description: catDescription
    })

    if (res.success) {
      setCatMessage(
        editingCatId
          ? 'CATEGORY UPDATED SUCCESSFULLY!'
          : 'CATEGORY CREATED SUCCESSFULLY!'
      )
      setTimeout(() => setCatMessage(null), 3000)
      resetCategoryForm()
      loadAllData()
    } else {
      alert(`Error saving category: ${res.error}`)
    }
  }

  const handleDeleteCategory = async (cat: BlogCategory) => {
    const postCount = posts.filter(
      p => p.category.toUpperCase() === cat.name.toUpperCase()
    ).length
    if (postCount > 0) {
      if (
        !confirm(
          `Category "${cat.name}" is used in ${postCount} posts. Are you sure you want to delete it?`
        )
      ) {
        return
      }
    } else {
      if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        return
      }
    }

    const res = await deleteCategory(cat.id)
    if (res.success) {
      loadAllData()
      if (editingCatId === cat.id) {
        resetCategoryForm()
      }
    }
  }

  // Filter posts
  const filteredPosts = posts
    .filter(p => {
      if (filterStatus === 'published') return p.published
      if (filterStatus === 'draft') return !p.published
      return true
    })
    .filter(p => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
      )
    })

  const presetColors = [
    { name: 'Red', hex: '#D02020' },
    { name: 'Blue', hex: '#1040C0' },
    { name: 'Yellow', hex: '#F0C020' },
    { name: 'Ink', hex: '#121212' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Purple', hex: '#8B5CF6' }
  ]

  // PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className='grain-overlay flex min-h-screen items-center justify-center bg-[#F0F0F0] p-4 text-[#121212]'>
        <div className='w-full max-w-md space-y-6 border-4 border-[#121212] bg-white p-8 shadow-[12px_12px_0px_#121212] sm:p-12'>
          <div className='flex items-center gap-3 border-b-4 border-[#121212] pb-4'>
            <div className='flex h-10 w-10 items-center justify-center border-2 border-[#121212] bg-[#D02020] font-black text-white'>
              <Lock className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-xl font-black tracking-tight uppercase'>
                CMS DASHBOARD
              </h1>
              <p className='text-xs font-bold text-gray-600'>
                ENTER ADMIN ACCESS PIN
              </p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-xs font-black text-[#121212] uppercase'>
                ACCESS KEY
              </label>
              <input
                type='password'
                placeholder='Enter PIN (Default: admin123)'
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className='w-full border-4 border-[#121212] bg-[#F0F0F0] px-4 py-3 text-sm font-black tracking-widest focus:bg-white focus:outline-none'
              />
            </div>

            {pinError && (
              <div className='border-2 border-[#121212] bg-[#D02020] p-2 text-center text-xs font-black text-white uppercase'>
                INVALID ACCESS PIN. PLEASE TRY AGAIN.
              </div>
            )}

            <button
              type='submit'
              className='w-full border-4 border-[#121212] bg-[#F0C020] py-3 text-sm font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
            >
              UNLOCK CMS DASHBOARD
            </button>
          </form>

          <div className='border-t-2 border-dashed border-[#121212] pt-4 text-center'>
            <Link
              href='/blog'
              className='text-xs font-bold uppercase underline hover:text-[#D02020]'
            >
              ← Return to public blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='grain-overlay min-h-screen bg-[#F0F0F0] pb-24 font-sans text-[#121212]'>
      {/* Top Header */}
      <header className='sticky top-0 z-50 border-b-4 border-[#121212] bg-[#F0F0F0]/95 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <div className='flex items-center gap-3'>
            <Link
              href='/blog'
              className='group/back border-4 border-[#121212] bg-white p-2 shadow-[2px_2px_0px_#121212] transition-colors hover:bg-[#F0C020]'
            >
              <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1' />
            </Link>
            <div>
              <h1 className='flex items-center gap-2 text-xl font-black tracking-tight uppercase sm:text-2xl'>
                <span>CMS DASHBOARD</span>
                <span className='border border-[#121212] bg-[#D02020] px-2 py-0.5 text-xs text-white'>
                  ADMIN
                </span>
              </h1>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Database indicator */}
            <div
              className={`flex items-center gap-1.5 border-2 border-[#121212] px-3 py-1 text-xs font-black uppercase ${
                isSupabaseConfigured()
                  ? 'bg-emerald-400 text-[#121212]'
                  : 'bg-[#F0C020] text-[#121212]'
              }`}
            >
              <Database className='h-3.5 w-3.5' />
              <span>
                {isSupabaseConfigured()
                  ? 'SUPABASE CONNECTED'
                  : 'LOCAL FALLBACK'}
              </span>
            </div>

            <button
              onClick={startNewPost}
              className='flex items-center gap-2 border-4 border-[#121212] bg-[#F0C020] px-4 py-2 text-xs font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#D02020] hover:text-white active:translate-x-0.5 active:translate-y-0.5 sm:text-sm'
            >
              <Plus className='h-4 w-4' />
              <span>WRITE NEW POST</span>
            </button>
          </div>
        </div>
      </header>

      {/* Save Success Notification */}
      {saveMessage && (
        <div className='mx-auto max-w-7xl px-4 pt-4 sm:px-6'>
          <div className='flex items-center justify-between border-4 border-[#121212] bg-[#F0C020] p-4 text-sm font-black text-[#121212] uppercase shadow-[6px_6px_0px_#121212]'>
            <div className='flex items-center gap-2'>
              <Check className='h-5 w-5 text-[#D02020]' />
              <span>{saveMessage}</span>
            </div>
            <button
              onClick={() => setSaveMessage(null)}
              className='text-xs underline'
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className='mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6'>
        {/* Navigation Tabs (List, Editor, Categories) */}
        <div className='flex flex-wrap gap-2 border-b-4 border-[#121212]'>
          <button
            onClick={() => setActiveTab('list')}
            className={`border-x-4 border-t-4 border-[#121212] px-6 py-3 text-sm font-black uppercase transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-[#121212]'
                : 'bg-[#F0F0F0] text-gray-600 hover:bg-white'
            }`}
          >
            POSTS LIST ({posts.length})
          </button>

          <button
            onClick={() => {
              if (!editingId) startNewPost()
              setActiveTab('editor')
            }}
            className={`border-x-4 border-t-4 border-[#121212] px-6 py-3 text-sm font-black uppercase transition-colors ${
              activeTab === 'editor'
                ? 'bg-white text-[#121212]'
                : 'bg-[#F0F0F0] text-gray-600 hover:bg-white'
            }`}
          >
            {editingId ? 'EDIT POST' : 'CREATE POST'}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 border-x-4 border-t-4 border-[#121212] px-6 py-3 text-sm font-black uppercase transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#F0C020] text-[#121212]'
                : 'bg-[#F0F0F0] text-gray-600 hover:bg-white'
            }`}
          >
            <FolderPlus className='h-4 w-4' />
            <span>CATEGORIES ({categories.length})</span>
          </button>
        </div>

        {/* TAB 1: POSTS LIST */}
        {activeTab === 'list' && (
          <div className='space-y-6'>
            <div className='flex flex-col items-center justify-between gap-4 border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212] md:flex-row'>
              <div className='flex w-full flex-wrap gap-2 md:w-auto'>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase ${
                    filterStatus === 'all'
                      ? 'bg-[#1040C0] text-white'
                      : 'bg-[#F0F0F0] text-[#121212]'
                  }`}
                >
                  ALL ({posts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase ${
                    filterStatus === 'published'
                      ? 'bg-[#1040C0] text-white'
                      : 'bg-[#F0F0F0] text-[#121212]'
                  }`}
                >
                  PUBLISHED ({posts.filter(p => p.published).length})
                </button>
                <button
                  onClick={() => setFilterStatus('draft')}
                  className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase ${
                    filterStatus === 'draft'
                      ? 'bg-[#1040C0] text-white'
                      : 'bg-[#F0F0F0] text-[#121212]'
                  }`}
                >
                  DRAFTS ({posts.filter(p => !p.published).length})
                </button>
              </div>

              <div className='relative w-full md:w-64'>
                <input
                  type='text'
                  placeholder='FILTER BY TITLE...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full border-2 border-[#121212] bg-[#F0F0F0] px-3 py-2 pl-9 text-xs font-bold uppercase focus:bg-white focus:outline-none'
                />
                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-[#121212]' />
              </div>
            </div>

            {isLoading ? (
              <div className='border-4 border-[#121212] bg-white p-12 text-center shadow-[8px_8px_0px_#121212]'>
                <div className='mb-4 inline-block h-8 w-8 animate-spin border-4 border-[#121212] border-t-[#D02020]' />
                <p className='text-sm font-black uppercase'>
                  FETCHING CMS POSTS...
                </p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className='flex min-h-[320px] flex-col items-center justify-center space-y-4 border-4 border-[#121212] bg-white p-12 text-center shadow-[8px_8px_0px_#121212]'>
                <h3 className='text-center text-xl font-black text-[#121212] uppercase sm:text-2xl'>
                  NO POSTS MATCH YOUR CRITERIA
                </h3>
                <p className='max-w-md text-center text-sm font-medium text-gray-700'>
                  There are currently no articles matching your filter or search
                  query.
                </p>
                <button
                  onClick={startNewPost}
                  className='border-2 border-[#121212] bg-[#F0C020] px-6 py-2.5 text-xs font-black text-[#121212] uppercase shadow-[3px_3px_0px_#121212] transition-colors hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
                >
                  WRITE YOUR FIRST POST
                </button>
              </div>
            ) : (
              <div className='overflow-hidden border-4 border-[#121212] bg-white shadow-[10px_10px_0px_#121212]'>
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse text-left'>
                    <thead>
                      <tr className='border-b-4 border-[#121212] bg-[#F0F0F0] text-xs font-black uppercase'>
                        <th className='p-4'>STATUS</th>
                        <th className='p-4'>TITLE & SLUG</th>
                        <th className='p-4'>CATEGORY</th>
                        <th className='p-4'>DATE</th>
                        <th className='p-4 text-right'>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y-2 divide-[#121212]'>
                      {filteredPosts.map(post => (
                        <tr
                          key={post.id}
                          className='transition-colors hover:bg-[#FFFDF7]'
                        >
                          <td className='p-4'>
                            <span
                              className={`inline-block border-2 border-[#121212] px-2.5 py-1 text-[11px] font-black uppercase ${
                                post.published
                                  ? 'bg-emerald-400 text-[#121212]'
                                  : 'bg-[#121212] text-yellow-400'
                              }`}
                            >
                              {post.published ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </td>
                          <td className='max-w-md p-4'>
                            <div className='line-clamp-1 text-sm font-black text-[#121212] uppercase'>
                              {post.title}
                            </div>
                            <div className='line-clamp-1 font-mono text-xs text-gray-500'>
                              /blog/{post.slug}
                            </div>
                          </td>
                          <td className='p-4'>
                            <span className='border border-[#121212] bg-[#1040C0] px-2 py-0.5 text-xs font-black text-white uppercase'>
                              {post.category}
                            </span>
                          </td>
                          <td className='p-4 text-xs font-bold text-gray-600'>
                            {new Date(post.created_at).toLocaleDateString(
                              'id-ID'
                            )}
                          </td>
                          <td className='p-4 text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Link
                                href={`/blog/${post.slug}`}
                                target='_blank'
                                className='border-2 border-[#121212] bg-white p-2 shadow-[2px_2px_0px_#121212] hover:bg-[#F0C020]'
                                title='View Public Post'
                              >
                                <Eye className='h-4 w-4' />
                              </Link>
                              <button
                                onClick={() => startEditing(post)}
                                className='border-2 border-[#121212] bg-[#F0C020] p-2 text-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#1040C0] hover:text-white'
                                title='Edit Post'
                              >
                                <Edit3 className='h-4 w-4' />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(post.id, post.title)
                                }
                                className='border-2 border-[#121212] bg-[#D02020] p-2 text-white shadow-[2px_2px_0px_#121212] hover:bg-black'
                                title='Delete Post'
                              >
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POST EDITOR */}
        {activeTab === 'editor' && (
          <div className='space-y-8'>
            <div className='flex flex-wrap items-center justify-between gap-4 border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]'>
              <div className='flex items-center gap-2'>
                <span className='border-2 border-[#121212] bg-[#D02020] px-3 py-1 text-sm font-black text-white uppercase'>
                  {editingId ? 'EDIT MODE' : 'CREATE MODE'}
                </span>
                {editingId && (
                  <span className='font-mono text-xs font-bold text-gray-500'>
                    ID: {editingId}
                  </span>
                )}
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => handleSave(false)}
                  className='flex items-center gap-1.5 border-2 border-[#121212] bg-[#F0F0F0] px-4 py-2 text-xs font-black text-[#121212] uppercase shadow-[2px_2px_0px_#121212] hover:bg-gray-200'
                >
                  <Save className='h-4 w-4 text-gray-700' />
                  <span>SAVE AS DRAFT</span>
                </button>

                <button
                  onClick={() => handleSave(true)}
                  className='flex items-center gap-1.5 border-4 border-[#121212] bg-[#F0C020] px-5 py-2 text-xs font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
                >
                  <Send className='h-4 w-4' />
                  <span>PUBLISH POST</span>
                </button>
              </div>
            </div>

            <div className='space-y-6 border-4 border-[#121212] bg-white p-6 shadow-[10px_10px_0px_#121212] sm:p-8'>
              <h2 className='flex items-center gap-2 border-b-4 border-[#121212] pb-2 text-xl font-black uppercase'>
                <span className='inline-block h-4 w-4 border-2 border-[#121212] bg-[#D02020]' />
                ARTICLE METADATA
              </h2>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase'>
                    POST TITLE *
                  </label>
                  <input
                    type='text'
                    placeholder='Enter descriptive post title...'
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-bold uppercase focus:bg-white focus:outline-none'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase'>
                    URL SLUG
                  </label>
                  <input
                    type='text'
                    placeholder='custom-url-slug'
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 font-mono text-sm focus:bg-white focus:outline-none'
                  />
                </div>

                {/* Dynamic Category Selector */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label className='text-xs font-black uppercase'>
                      CATEGORY
                    </label>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className='flex items-center gap-1 text-[11px] font-black text-[#1040C0] uppercase hover:underline'
                    >
                      <FolderPlus className='h-3 w-3' />
                      <span>+ MANAGE CATEGORIES</span>
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-black uppercase focus:bg-white focus:outline-none'
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase'>
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type='text'
                    placeholder='REACT, SUPABASE, BAUHAUS'
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-bold uppercase focus:bg-white focus:outline-none'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <label className='text-xs font-black uppercase'>
                    COVER IMAGE URL (OPTIONAL)
                  </label>
                  <input
                    type='url'
                    placeholder='https://images.unsplash.com/photo-...'
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-medium focus:bg-white focus:outline-none'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <label className='text-xs font-black uppercase'>
                    EXCERPT / SUMMARY *
                  </label>
                  <textarea
                    rows={2}
                    placeholder='Short summary of the article...'
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-medium focus:bg-white focus:outline-none'
                  />
                </div>
              </div>
            </div>

            <div className='overflow-hidden border-4 border-[#121212] bg-white shadow-[10px_10px_0px_#121212]'>
              <div className='flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#121212] bg-[#F0F0F0] p-4'>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setEditorTab('write')}
                    className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase transition-colors ${
                      editorTab === 'write'
                        ? 'bg-[#1040C0] text-white'
                        : 'bg-white text-[#121212]'
                    }`}
                  >
                    WRITE (MARKDOWN)
                  </button>
                  <button
                    onClick={() => setEditorTab('preview')}
                    className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase transition-colors ${
                      editorTab === 'preview'
                        ? 'bg-[#1040C0] text-white'
                        : 'bg-white text-[#121212]'
                    }`}
                  >
                    LIVE PREVIEW
                  </button>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <span className='mr-1 text-xs font-black text-gray-600 uppercase'>
                    INSERT:
                  </span>

                  <button
                    onClick={insertQuoteSnippet}
                    className='flex items-center gap-1 border-2 border-[#121212] bg-[#F0C020] px-3 py-1 text-xs font-black text-[#121212] uppercase shadow-[2px_2px_0px_#121212] hover:bg-white'
                    title='Insert Quote Block'
                  >
                    <Quote className='h-3.5 w-3.5' />
                    <span>+ QUOTE</span>
                  </button>

                  <button
                    onClick={() => insertCodeSnippet('typescript')}
                    className='flex items-center gap-1 border-2 border-[#121212] bg-[#D02020] px-3 py-1 text-xs font-black text-white uppercase shadow-[2px_2px_0px_#121212] hover:bg-black'
                    title='Insert Code Block'
                  >
                    <Code2 className='h-3.5 w-3.5' />
                    <span>+ CODE BLOCK</span>
                  </button>

                  <button
                    onClick={() => insertSnippet('\n\n## SECTION TITLE\n\n')}
                    className='border-2 border-[#121212] bg-white px-2.5 py-1 text-xs font-black uppercase hover:bg-gray-100'
                  >
                    H2
                  </button>

                  <button
                    onClick={() => insertSnippet(' **bold text** ')}
                    className='border-2 border-[#121212] bg-white px-2.5 py-1 text-xs font-black uppercase hover:bg-gray-100'
                  >
                    BOLD
                  </button>

                  <button
                    onClick={() =>
                      insertSnippet('\n- List item 1\n- List item 2\n')
                    }
                    className='border-2 border-[#121212] bg-white px-2.5 py-1 text-xs font-black uppercase hover:bg-gray-100'
                  >
                    LIST
                  </button>
                </div>
              </div>

              {editorTab === 'write' ? (
                <div className='p-6'>
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    placeholder='Write article content using Markdown format...'
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className='w-full border-4 border-[#121212] bg-[#FFFDF7] p-4 font-mono text-sm leading-relaxed focus:bg-white focus:outline-none'
                  />
                </div>
              ) : (
                <div className='bg-white p-8 sm:p-12'>
                  <div className='mb-6 border-b-4 border-[#121212] pb-4'>
                    <span className='text-xs font-black text-gray-500 uppercase'>
                      LIVE PREVIEW
                    </span>
                    <h1 className='mt-1 text-3xl font-black text-[#121212] uppercase'>
                      {title || 'UNTITLED POST'}
                    </h1>
                  </div>

                  <MarkdownRenderer content={content} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGER (CRUD) */}
        {activeTab === 'categories' && (
          <div className='space-y-8'>
            {catMessage && (
              <div className='flex items-center justify-between border-4 border-[#121212] bg-[#F0C020] p-4 text-sm font-black text-[#121212] uppercase shadow-[6px_6px_0px_#121212]'>
                <div className='flex items-center gap-2'>
                  <Check className='h-5 w-5 text-[#D02020]' />
                  <span>{catMessage}</span>
                </div>
                <button
                  onClick={() => setCatMessage(null)}
                  className='text-xs underline'
                >
                  DISMISS
                </button>
              </div>
            )}

            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='space-y-6 border-4 border-[#121212] bg-white p-6 shadow-[10px_10px_0px_#121212] lg:col-span-1'>
                <div className='flex items-center justify-between border-b-4 border-[#121212] pb-3'>
                  <h2 className='flex items-center gap-2 text-lg font-black uppercase'>
                    <span className='inline-block h-3.5 w-3.5 border-2 border-[#121212] bg-[#F0C020]' />
                    <span>
                      {editingCatId ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
                    </span>
                  </h2>
                  {editingCatId && (
                    <button
                      onClick={resetCategoryForm}
                      className='text-xs font-bold uppercase underline hover:text-[#D02020]'
                    >
                      CANCEL EDIT
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCategory} className='space-y-4'>
                  <div className='space-y-1.5'>
                    <label className='text-xs font-black uppercase'>
                      CATEGORY NAME *
                    </label>
                    <input
                      type='text'
                      placeholder='e.g. ARTIFICIAL INTELLIGENCE'
                      value={catName}
                      onChange={e => handleCatNameChange(e.target.value)}
                      className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-bold uppercase focus:bg-white focus:outline-none'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-black uppercase'>
                      URL SLUG
                    </label>
                    <input
                      type='text'
                      placeholder='artificial-intelligence'
                      value={catSlug}
                      onChange={e => setCatSlug(e.target.value)}
                      className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 font-mono text-sm focus:bg-white focus:outline-none'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-black uppercase'>
                      BAUHAUS COLOR ACCENT
                    </label>
                    <div className='mb-2 flex flex-wrap gap-2'>
                      {presetColors.map(c => (
                        <button
                          key={c.hex}
                          type='button'
                          onClick={() => setCatColor(c.hex)}
                          className={`h-8 w-8 border-2 border-[#121212] transition-transform ${
                            catColor === c.hex
                              ? 'scale-110 ring-4 ring-[#121212]'
                              : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <input
                      type='text'
                      placeholder='#1040C0'
                      value={catColor}
                      onChange={e => setCatColor(e.target.value)}
                      className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-2.5 font-mono text-xs uppercase focus:bg-white focus:outline-none'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label className='text-xs font-black uppercase'>
                      DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      placeholder='Short description of topics covered in this category...'
                      value={catDescription}
                      onChange={e => setCatDescription(e.target.value)}
                      className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-xs font-medium focus:bg-white focus:outline-none'
                    />
                  </div>

                  <button
                    type='submit'
                    className='w-full border-4 border-[#121212] bg-[#F0C020] py-3 text-sm font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
                  >
                    {editingCatId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                  </button>
                </form>
              </div>

              <div className='space-y-6 border-4 border-[#121212] bg-white p-6 shadow-[10px_10px_0px_#121212] lg:col-span-2'>
                <h2 className='flex items-center justify-between border-b-4 border-[#121212] pb-3 text-lg font-black uppercase'>
                  <span>CATEGORIES LIST</span>
                  <span className='border border-[#121212] bg-[#1040C0] px-2 py-0.5 text-xs text-white'>
                    TOTAL: {categories.length}
                  </span>
                </h2>

                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse text-left'>
                    <thead>
                      <tr className='border-b-4 border-[#121212] bg-[#F0F0F0] text-xs font-black uppercase'>
                        <th className='p-3'>ACCENT & NAME</th>
                        <th className='p-3'>SLUG</th>
                        <th className='p-3'>POSTS</th>
                        <th className='p-3 text-right'>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y-2 divide-[#121212]'>
                      {categories.map(cat => {
                        const postCount = posts.filter(
                          p =>
                            p.category.toUpperCase() === cat.name.toUpperCase()
                        ).length

                        return (
                          <tr
                            key={cat.id}
                            className='transition-colors hover:bg-[#FFFDF7]'
                          >
                            <td className='p-3'>
                              <div className='flex items-center gap-2.5'>
                                <span
                                  className='inline-block h-5 w-5 shrink-0 border-2 border-[#121212] shadow-[2px_2px_0px_#121212]'
                                  style={{
                                    backgroundColor: cat.color || '#1040C0'
                                  }}
                                />
                                <div>
                                  <div className='text-sm font-black text-[#121212] uppercase'>
                                    {cat.name}
                                  </div>
                                  {cat.description && (
                                    <div className='line-clamp-1 text-xs font-medium text-gray-500'>
                                      {cat.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className='p-3 font-mono text-xs text-gray-600'>
                              {cat.slug}
                            </td>
                            <td className='p-3'>
                              <span className='border border-[#121212] bg-[#F0F0F0] px-2 py-0.5 text-xs font-black text-[#121212]'>
                                {postCount}
                              </span>
                            </td>
                            <td className='p-3 text-right'>
                              <div className='flex items-center justify-end gap-2'>
                                <button
                                  onClick={() => startEditCategory(cat)}
                                  className='border-2 border-[#121212] bg-[#F0C020] p-1.5 text-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#1040C0] hover:text-white'
                                  title='Edit Category'
                                >
                                  <Edit3 className='h-3.5 w-3.5' />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  className='border-2 border-[#121212] bg-[#D02020] p-1.5 text-white shadow-[2px_2px_0px_#121212] hover:bg-black'
                                  title='Delete Category'
                                >
                                  <Trash2 className='h-3.5 w-3.5' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-[#F0F0F0] p-6'>
          <div className='border-4 border-[#121212] bg-white p-8 text-center shadow-[8px_8px_0px_#121212]'>
            <p className='text-sm font-black uppercase'>
              INITIALIZING DASHBOARD...
            </p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
