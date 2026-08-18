'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { fetchPosts } from '@/lib/blog-service'
import { BlogCard } from '@/components/BlogCard'
import { Search, Sparkles, ArrowLeft } from 'lucide-react'

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const fetchedPosts = await fetchPosts(false)
      setPosts(fetchedPosts)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts
    }
    const q = searchQuery.toLowerCase()
    return posts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
    )
  }, [searchQuery, posts])

  return (
    <div className='grain-overlay min-h-screen bg-[#F0F0F0] pb-20 font-sans text-[#121212]'>
      {/* Top Navbar */}
      <header className='sticky top-0 z-50 border-b-4 border-[#121212] bg-[#F0F0F0]/90 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <Link
            href='/'
            className='group/back flex items-center gap-2 border-4 border-[#121212] bg-white px-4 py-2 text-sm font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#F0C020] active:translate-x-0.5 active:translate-y-0.5'
          >
            <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1' />
            <span>PORTFOLIO</span>
          </Link>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className='mx-auto max-w-7xl space-y-12 px-4 pt-10 sm:px-6'>
        {/* Hero Header */}
        <div className='relative overflow-hidden border-4 border-[#121212] bg-white p-8 shadow-[10px_10px_0px_#121212] sm:p-12'>
          {/* Geometric decorative boxes */}
          <div className='absolute top-0 right-0 hidden h-32 w-32 border-b-4 border-l-4 border-[#121212] bg-[#D02020] sm:block' />
          <div className='absolute right-32 bottom-0 hidden h-24 w-24 border-t-4 border-r-4 border-l-4 border-[#121212] bg-[#1040C0] md:block' />

          <div className='relative z-10 max-w-3xl space-y-4'>
            <div className='inline-flex items-center gap-2 border-2 border-[#121212] bg-[#F0C020] px-3 py-1 text-xs font-black text-[#121212] uppercase'>
              <Sparkles className='h-3.5 w-3.5' />
              <span>BINARY MODERNISM BLOG</span>
            </div>

            <h1 className='text-4xl font-black tracking-tight text-[#121212] uppercase sm:text-6xl'>
              JOURNAL & ARTICLES
            </h1>

            <p className='text-lg leading-relaxed font-medium text-[#121212]'>
              A collection of technical writing, engineering articles, tips &
              tricks, and personal journey notes.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className='border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <p className='text-xs font-black uppercase text-[#121212]'>
              {filteredPosts.length} ARTICLE{filteredPosts.length === 1 ? '' : 'S'} FOUND
            </p>

            {/* Search Input */}
            <div className='relative w-full md:w-80'>
              <input
                type='text'
                placeholder='SEARCH ARTICLES...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full border-2 border-[#121212] bg-[#F0F0F0] px-4 py-2 pl-10 text-xs font-bold text-[#121212] uppercase placeholder-gray-500 focus:bg-white focus:outline-none'
              />
              <Search className='absolute top-2.5 left-3 h-4 w-4 text-[#121212]' />
            </div>
          </div>
        </div>

        {/* Post Grid */}
        {isLoading ? (
          <div className='border-4 border-[#121212] bg-white p-12 text-center shadow-[8px_8px_0px_#121212]'>
            <div className='mb-4 inline-block h-8 w-8 animate-spin border-4 border-[#121212] border-t-[#D02020]' />
            <p className='text-sm font-black uppercase'>LOADING ARTICLES...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className='flex min-h-[320px] flex-col items-center justify-center space-y-4 border-4 border-[#121212] bg-white p-12 text-center shadow-[8px_8px_0px_#121212]'>
            <h3 className='text-center text-2xl font-black uppercase'>
              NO POSTS FOUND
            </h3>
            <p className='max-w-md text-center text-sm font-medium'>
              {searchQuery
                ? 'Try searching for a different keyword.'
                : 'No articles have been published yet. Check back soon!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='border-2 border-[#121212] bg-[#F0C020] px-6 py-2.5 text-xs font-black text-[#121212] uppercase shadow-[3px_3px_0px_#121212] transition-colors hover:bg-[#1040C0] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
              >
                RESET SEARCH
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPosts.map((post, idx) => (
              <BlogCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

