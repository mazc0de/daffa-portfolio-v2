'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BlogPost } from '@/types/blog'
import { fetchPosts, savePost, deletePost } from '@/lib/blog-service'
import { isSupabaseConfigured } from '@/lib/supabase'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import {
  LayoutDashboard,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Check,
  Globe,
  ArrowLeft,
  Quote,
  Code2,
  Save,
  Send,
  Search,
  Tag
} from 'lucide-react'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [pinInput, setPinInput] = useState<string>('')
  const [pinError, setPinError] = useState<boolean>(false)

  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list')
  const [posts, setPosts] = useState<BlogPost[]>([])
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
  const [tagsInput, setTagsInput] = useState<string>('')
  const [coverImage, setCoverImage] = useState<string>('')
  const [published, setPublished] = useState<boolean>(true)
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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

  // Load posts on auth
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
    const fetchedPosts = await fetchPosts(true)
    setPosts(fetchedPosts)
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
    setTagsInput('TECH, REACT, NEXTJS')
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
      `\n\n\`\`\`${lang}\n// ${lang.toUpperCase()} Code Snippet\nfunction computeData() {\n  console.log("Code execution");\n}\n\`\`\`\n\n`
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
      slug:
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      excerpt: excerpt.trim(),
      content,
      tags: tagsArray,
      cover_image: coverImage.trim() || undefined,
      published: finalPublished
    }

    const res = await savePost(payload)

    if (res.success) {
      setSaveMessage(
        editingId
          ? 'POST UPDATED IN SUPABASE SUCCESSFULLY!'
          : 'NEW POST CREATED IN SUPABASE SUCCESSFULLY!'
      )
      setTimeout(() => setSaveMessage(null), 4000)
      loadAllData()
      setActiveTab('list')
    } else {
      alert(`Error saving post: ${res.error}`)
    }
  }

  // Delete Post Handler
  const handleDeletePost = async (id: string, postTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${postTitle}" from Supabase? This cannot be undone.`
      )
    ) {
      return
    }

    const res = await deletePost(id)
    if (res.success) {
      setSaveMessage('POST DELETED FROM SUPABASE SUCCESSFULLY')
      setTimeout(() => setSaveMessage(null), 3000)
      loadAllData()
    } else {
      alert(`Error deleting post: ${res.error}`)
    }
  }

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (filterStatus === 'published' && !p.published) return false
    if (filterStatus === 'draft' && p.published) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  // PIN Login Screen
  if (!isAuthenticated) {
    return (
      <div className='grain-overlay flex min-h-screen items-center justify-center bg-[#F0F0F0] p-4 font-sans text-[#121212]'>
        <div className='w-full max-w-md border-4 border-[#121212] bg-white p-8 shadow-[12px_12px_0px_#121212] sm:p-10'>
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center border-4 border-[#121212] bg-[#F0C020] shadow-[4px_4px_0px_#121212]'>
              <Lock className='h-8 w-8 text-[#121212]' />
            </div>
            <h1 className='text-2xl font-black uppercase tracking-tight sm:text-3xl'>
              CMS DASHBOARD
            </h1>
            <p className='mt-2 text-xs font-bold uppercase tracking-wider text-gray-600'>
              DIRECT SUPABASE BACKEND
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label
                htmlFor='pin-input'
                className='text-xs font-black uppercase'
              >
                ENTER ADMIN PIN
              </label>
              <input
                id='pin-input'
                type='password'
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder='Enter PIN...'
                className='w-full border-4 border-[#121212] bg-[#F0F0F0] p-4 text-center font-mono text-xl tracking-widest focus:bg-white focus:outline-none'
                autoFocus
              />
              {pinError && (
                <p className='text-xs font-black text-[#D02020] uppercase'>
                  INVALID PIN. PLEASE TRY AGAIN.
                </p>
              )}
            </div>

            <button
              type='submit'
              className='w-full border-4 border-[#121212] bg-[#1040C0] p-4 text-sm font-black text-white uppercase shadow-[6px_6px_0px_#121212] transition-all hover:bg-[#D02020] active:translate-x-0.5 active:translate-y-0.5'
            >
              ACCESS DASHBOARD
            </button>
          </form>

          <div className='mt-8 border-t-2 border-[#121212] pt-4 text-center'>
            <Link
              href='/blog'
              className='text-xs font-bold uppercase text-gray-600 hover:text-[#1040C0] hover:underline'
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
      {/* Top Admin Navbar */}
      <header className='sticky top-0 z-50 border-b-4 border-[#121212] bg-white'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center border-2 border-[#121212] bg-[#D02020] text-white shadow-[3px_3px_0px_#121212]'>
              <LayoutDashboard className='h-5 w-5' />
            </div>
            <div>
              <h1 className='text-lg font-black uppercase tracking-tight'>
                CMS ADMIN
              </h1>
              <div className='flex items-center gap-2 text-[11px] font-bold uppercase text-gray-600'>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isSupabaseConfigured() ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span>
                  {isSupabaseConfigured()
                    ? 'SUPABASE CONNECTED'
                    : 'SUPABASE NOT CONFIGURED'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href='/blog'
              target='_blank'
              className='flex items-center gap-1.5 border-2 border-[#121212] bg-white px-3 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#121212] hover:bg-[#F0C020]'
            >
              <Globe className='h-3.5 w-3.5' />
              <span>VIEW BLOG</span>
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('daffa_cms_auth')
                setIsAuthenticated(false)
              }}
              className='border-2 border-[#121212] bg-[#121212] px-3 py-1.5 text-xs font-black text-white uppercase shadow-[3px_3px_0px_#121212] hover:bg-[#D02020]'
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* Global Status / Alert Toast */}
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
        {/* Navigation Tabs (List, Editor) */}
        <div className='flex flex-wrap gap-2 border-b-4 border-[#121212]'>
          <button
            onClick={() => setActiveTab('list')}
            className={`border-x-4 border-t-4 border-[#121212] px-6 py-3 text-sm font-black uppercase transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-[#121212]'
                : 'bg-[#F0F0F0] text-gray-600 hover:bg-white'
            }`}
          >
            POSTS LIST
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
        </div>

        {/* TAB 1: POSTS LIST */}
        {activeTab === 'list' && (
          <div className='space-y-6'>
            <div className='flex flex-col items-center justify-between gap-4 border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212] md:flex-row'>
              <div className='relative w-full md:w-64'>
                <input
                  type='text'
                  placeholder='FILTER BY TITLE...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full border-2 border-[#121212] bg-[#F0F0F0] px-3 py-2 pl-9 text-xs font-bold uppercase focus:bg-white focus:outline-none'
                />
                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-gray-500' />
              </div>

              <button
                onClick={startNewPost}
                className='flex w-full items-center justify-center gap-2 border-4 border-[#121212] bg-[#F0C020] px-6 py-2.5 text-xs font-black uppercase shadow-[4px_4px_0px_#121212] hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5 md:w-auto'
              >
                <Plus className='h-4 w-4' />
                <span>WRITE NEW ARTICLE</span>
              </button>
            </div>

            {/* Table */}
            <div className='overflow-hidden border-4 border-[#121212] bg-white shadow-[10px_10px_0px_#121212]'>
              {isLoading ? (
                <div className='p-12 text-center'>
                  <div className='mb-3 inline-block h-8 w-8 animate-spin border-4 border-[#121212] border-t-[#D02020]' />
                  <p className='text-xs font-black uppercase'>
                    FETCHING FROM SUPABASE...
                  </p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className='p-12 text-center'>
                  <p className='text-sm font-black uppercase text-gray-500'>
                    NO POSTS FOUND IN DATABASE
                  </p>
                  <button
                    onClick={startNewPost}
                    className='mt-4 inline-flex items-center gap-2 border-2 border-[#121212] bg-[#F0C020] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#121212] hover:bg-[#1040C0] hover:text-white'
                  >
                    <Plus className='h-3.5 w-3.5' />
                    <span>CREATE YOUR FIRST POST</span>
                  </button>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse text-left'>
                    <thead>
                      <tr className='border-b-4 border-[#121212] bg-[#F0F0F0] text-xs font-black uppercase'>
                        <th className='p-4'>STATUS</th>
                        <th className='p-4'>ARTICLE TITLE</th>
                        <th className='p-4'>DATE</th>
                        <th className='p-4'>LIKES</th>
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
                            {post.published ? (
                              <span className='border border-[#121212] bg-green-500 px-2 py-0.5 text-[11px] font-black text-white uppercase'>
                                LIVE
                              </span>
                            ) : (
                              <span className='border border-[#121212] bg-yellow-400 px-2 py-0.5 text-[11px] font-black text-black uppercase'>
                                DRAFT
                              </span>
                            )}
                          </td>
                          <td className='p-4'>
                            <div className='font-black text-[#121212] uppercase'>
                              {post.title}
                            </div>
                            <div className='font-mono text-xs text-gray-500'>
                              /blog/{post.slug}
                            </div>
                          </td>
                          <td className='p-4 text-xs font-bold text-gray-600 uppercase'>
                            {new Date(post.created_at).toLocaleDateString(
                              'id-ID',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }
                            )}
                          </td>
                          <td className='p-4 text-xs font-black'>
                            {post.likes ?? 0}
                          </td>
                          <td className='p-4 text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Link
                                href={`/blog/${post.slug}`}
                                target='_blank'
                                className='border-2 border-[#121212] bg-white p-1.5 text-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#F0C020]'
                                title='View Post'
                              >
                                <Eye className='h-4 w-4' />
                              </Link>
                              <button
                                onClick={() => startEditing(post)}
                                className='border-2 border-[#121212] bg-[#F0C020] p-1.5 text-[#121212] shadow-[2px_2px_0px_#121212] hover:bg-[#1040C0] hover:text-white'
                                title='Edit Post'
                              >
                                <Edit3 className='h-4 w-4' />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePost(post.id, post.title)
                                }
                                className='border-2 border-[#121212] bg-[#D02020] p-1.5 text-white shadow-[2px_2px_0px_#121212] hover:bg-black'
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: POST EDITOR */}
        {activeTab === 'editor' && (
          <div className='space-y-6'>
            {/* Action Bar */}
            <div className='flex flex-wrap items-center justify-between gap-4 border-4 border-[#121212] bg-white p-4 shadow-[8px_8px_0px_#121212]'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setActiveTab('list')}
                  className='flex items-center gap-1.5 border-2 border-[#121212] bg-[#F0F0F0] px-3 py-2 text-xs font-black uppercase hover:bg-white'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>BACK TO LIST</span>
                </button>
                <span className='font-mono text-xs text-gray-500'>
                  {editingId ? `EDITING: ${editingId}` : 'CREATING NEW POST'}
                </span>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={() => handleSave(false)}
                  className='flex items-center gap-1.5 border-4 border-[#121212] bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#121212] hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5'
                >
                  <Save className='h-4 w-4 text-[#1040C0]' />
                  <span>SAVE AS DRAFT</span>
                </button>

                <button
                  onClick={() => handleSave(true)}
                  className='flex items-center gap-1.5 border-4 border-[#121212] bg-[#1040C0] px-5 py-2 text-xs font-black text-white uppercase shadow-[3px_3px_0px_#121212] hover:bg-[#D02020] active:translate-x-0.5 active:translate-y-0.5'
                >
                  <Send className='h-4 w-4' />
                  <span>PUBLISH TO SUPABASE</span>
                </button>
              </div>
            </div>

            {/* Post Metadata Inputs */}
            <div className='border-4 border-[#121212] bg-white p-6 shadow-[10px_10px_0px_#121212]'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2 md:col-span-2'>
                  <label className='text-xs font-black uppercase'>
                    ARTICLE TITLE *
                  </label>
                  <input
                    type='text'
                    placeholder='ENTER ARTICLE TITLE...'
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    className='w-full border-4 border-[#121212] bg-[#F0F0F0] p-4 text-lg font-black uppercase focus:bg-white focus:outline-none'
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

                <div className='space-y-2'>
                  <label className='text-xs font-black uppercase'>
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type='text'
                    placeholder='REACT, SUPABASE, CSS'
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    className='w-full border-2 border-[#121212] bg-[#F0F0F0] p-3 text-sm font-bold uppercase focus:bg-white focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Markdown Editor & Toolbar */}
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
                    WRITE
                  </button>
                  <button
                    onClick={() => setEditorTab('preview')}
                    className={`border-2 border-[#121212] px-4 py-2 text-xs font-black uppercase transition-colors ${
                      editorTab === 'preview'
                        ? 'bg-[#1040C0] text-white'
                        : 'bg-white text-[#121212]'
                    }`}
                  >
                    PREVIEW
                  </button>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={insertQuoteSnippet}
                    className='border-2 border-[#121212] bg-white px-2 py-1 text-xs font-black uppercase'
                  >
                    <Quote className='h-3.5 w-3.5' />
                  </button>
                  <button
                    onClick={() => insertCodeSnippet('typescript')}
                    className='border-2 border-[#121212] bg-white px-2 py-1 text-xs font-black uppercase'
                  >
                    <Code2 className='h-3.5 w-3.5' />
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
                  <MarkdownRenderer content={content} />
                </div>
              )}
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
