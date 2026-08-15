'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import {
  fetchPostBySlug,
  hasUserLovedPost,
  togglePostLove
} from '@/lib/blog-service'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  Share2,
  Check,
  Heart
} from 'lucide-react'

export default function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [isLoved, setIsLoved] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)
  const [isToggling, setIsToggling] = useState<boolean>(false)

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true)
      const data = await fetchPostBySlug(resolvedParams.slug)
      setPost(data)
      if (data) {
        setIsLoved(hasUserLovedPost(data.id))
        setLikesCount(data.likes ?? 0)
      }
      setIsLoading(false)
    }

    loadPost()
  }, [resolvedParams.slug])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleLoveToggle = async () => {
    if (!post || isToggling) return
    setIsToggling(true)

    const nextLoved = !isLoved
    setIsLoved(nextLoved)
    setLikesCount(prev => Math.max(0, nextLoved ? prev + 1 : prev - 1))

    const res = await togglePostLove(post.id)
    if (res.success) {
      setLikesCount(res.newLikes)
      setIsLoved(res.isLoved)
    }

    setIsToggling(false)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#F0F0F0] p-6 text-[#121212]'>
        <div className='border-4 border-[#121212] bg-white p-12 text-center shadow-[10px_10px_0px_#121212]'>
          <div className='mb-4 inline-block h-8 w-8 animate-spin border-4 border-[#121212] border-t-[#D02020]' />
          <p className='text-sm font-black uppercase'>LOADING ARTICLE...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#F0F0F0] p-6 text-[#121212]'>
        <div className='max-w-lg space-y-6 border-4 border-[#121212] bg-white p-12 text-center shadow-[10px_10px_0px_#121212]'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center border-4 border-[#121212] bg-[#D02020] text-2xl font-black text-white'>
            404
          </div>
          <h1 className='text-3xl font-black uppercase'>ARTICLE NOT FOUND</h1>
          <p className='text-sm font-medium'>
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            href='/blog'
            className='group/back inline-flex items-center gap-2 border-4 border-[#121212] bg-[#F0C020] px-6 py-3 text-sm font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-colors hover:bg-[#1040C0] hover:text-white'
          >
            <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1' />
            <span>BACK TO BLOG</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='grain-overlay min-h-screen bg-[#F0F0F0] pb-24 font-sans text-[#121212]'>
      {/* Top Navbar */}
      <header className='sticky top-0 z-50 border-b-4 border-[#121212] bg-[#F0F0F0]/90 backdrop-blur'>
        <div className='mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          <Link
            href='/blog'
            className='group/back flex items-center gap-2 border-4 border-[#121212] bg-white px-4 py-2 text-xs font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#F0C020] active:translate-x-0.5 active:translate-y-0.5 sm:text-sm'
          >
            <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1' />
            <span>ALL ARTICLES</span>
          </Link>

          <div className='flex items-center gap-3'>
            {/* Love Button in Navbar */}
            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-1.5 border-2 border-[#121212] px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#121212] transition-all active:scale-95 ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-white text-[#121212] hover:bg-[#F0C020]'
              }`}
              title={isLoved ? 'Unlike Article' : 'Like Article'}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isLoved ? 'fill-white text-white' : 'text-[#D02020]'}`}
              />
              <span>
                {likesCount} {isLoved ? 'LOVED' : 'LOVE'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className='flex items-center gap-1.5 border-2 border-[#121212] bg-white px-3 py-1.5 text-xs font-black text-[#121212] uppercase shadow-[2px_2px_0px_#121212] transition-all hover:bg-[#F0C020]'
            >
              {copiedLink ? (
                <Check className='h-3.5 w-3.5' />
              ) : (
                <Share2 className='h-3.5 w-3.5' />
              )}
              <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className='mx-auto max-w-4xl space-y-8 px-4 pt-10 sm:px-6'>
        {/* Article Header Card */}
        <div className='space-y-6 border-4 border-[#121212] bg-white p-8 shadow-[10px_10px_0px_#121212] sm:p-12'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <span className='border-2 border-[#121212] bg-[#1040C0] px-3 py-1 text-xs font-black text-white uppercase'>
                {post.category}
              </span>
              <div className='flex items-center gap-1.5 text-xs font-bold text-[#121212]'>
                <Clock className='h-3.5 w-3.5 text-[#D02020]' />
                <span>{post.read_time}</span>
              </div>
              <div className='flex items-center gap-1.5 text-xs font-bold text-[#121212]'>
                <Calendar className='h-3.5 w-3.5 text-[#1040C0]' />
                <span>
                  {new Date(post.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Love Button Header */}
            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-2 border-4 border-[#121212] px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0px_#121212] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLoved ? 'fill-white text-white' : 'text-[#121212]'}`}
              />
              <span>
                {likesCount} {isLoved ? 'LOVED' : 'LOVE THIS'}
              </span>
            </button>
          </div>

          <h1 className='text-3xl leading-tight font-black tracking-tight text-[#121212] uppercase sm:text-5xl'>
            {post.title}
          </h1>

          <p className='border-l-4 border-[#F0C020] py-1 pl-4 text-lg leading-relaxed font-medium text-gray-800'>
            {post.excerpt}
          </p>

          {/* Cover image if available */}
          {post.cover_image && (
            <div className='pt-4'>
              <div className='max-h-[400px] overflow-hidden border-4 border-[#121212] shadow-[6px_6px_0px_#121212]'>
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className='h-full w-full object-cover'
                />
              </div>
            </div>
          )}
        </div>

        {/* Article Content Card */}
        <div className='space-y-8 border-4 border-[#121212] bg-white p-8 shadow-[10px_10px_0px_#121212] sm:p-12'>
          <MarkdownRenderer content={post.content} />

          {/* Interactive Love Callout Box at End of Article */}
          <div className='mt-8 flex flex-col items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFDF7] p-6 shadow-[6px_6px_0px_#121212] sm:flex-row'>
            <div className='space-y-1 text-center sm:text-left'>
              <h4 className='text-base font-black text-[#121212] uppercase'>
                ENJOYED THIS ARTICLE?
              </h4>
              <p className='text-xs font-bold text-gray-600'>
                Give it a love to show appreciation & support!
              </p>
            </div>

            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-2 border-4 border-[#121212] px-6 py-3 text-sm font-black uppercase shadow-[4px_4px_0px_#121212] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isLoved ? 'fill-white text-white' : 'text-[#121212]'}`}
              />
              <span>
                {likesCount} {isLoved ? 'YOU LOVED THIS!' : 'SEND LOVE ❤️'}
              </span>
            </button>
          </div>

          {/* Tags Footer */}
          {post.tags && post.tags.length > 0 && (
            <div className='flex flex-wrap items-center gap-2 border-t-4 border-[#121212] pt-6'>
              <span className='mr-2 text-xs font-black text-[#121212] uppercase'>
                TAGS:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className='inline-flex items-center gap-1 border-2 border-[#121212] bg-[#F0F0F0] px-3 py-1 text-xs font-black text-[#121212] uppercase'
                >
                  <Tag className='h-3 w-3 text-[#D02020]' />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Back Button Footer */}
        <div className='flex items-center justify-between pt-4'>
          <Link
            href='/blog'
            className='group/back flex items-center gap-2 border-4 border-[#121212] bg-[#F0C020] px-6 py-3 text-sm font-black text-[#121212] uppercase shadow-[4px_4px_0px_#121212] transition-all hover:bg-[#D02020] hover:text-white active:translate-x-0.5 active:translate-y-0.5'
          >
            <ArrowLeft className='h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1' />
            <span>BACK TO ALL ARTICLES</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
