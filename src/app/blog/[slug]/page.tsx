'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { fetchPostBySlug, hasUserLovedPost, togglePostLove } from '@/lib/blog-service'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ArrowLeft, Clock, Tag, Calendar, Share2, Check, Heart } from 'lucide-react'

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
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
      <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex items-center justify-center p-6">
        <div className="bg-white border-4 border-[#121212] p-12 text-center shadow-[10px_10px_0px_#121212]">
          <div className="inline-block w-8 h-8 border-4 border-[#121212] border-t-[#D02020] animate-spin mb-4" />
          <p className="font-black uppercase text-sm">LOADING ARTICLE...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex items-center justify-center p-6">
        <div className="bg-white border-4 border-[#121212] p-12 text-center shadow-[10px_10px_0px_#121212] max-w-lg space-y-6">
          <div className="w-16 h-16 bg-[#D02020] text-white border-4 border-[#121212] mx-auto flex items-center justify-center font-black text-2xl">
            404
          </div>
          <h1 className="text-3xl font-black uppercase">ARTICLE NOT FOUND</h1>
          <p className="font-medium text-sm">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-[#F0C020] text-[#121212] border-4 border-[#121212] px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_#121212] hover:bg-[#1040C0] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO BLOG</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] grain-overlay font-sans pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#F0F0F0]/90 backdrop-blur border-b-4 border-[#121212]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 bg-white text-[#121212] hover:bg-[#F0C020] border-4 border-[#121212] px-4 py-2 text-xs sm:text-sm font-black uppercase shadow-[4px_4px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ALL ARTICLES</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Love Button in Navbar */}
            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 border-[#121212] transition-all active:scale-95 shadow-[2px_2px_0px_#121212] ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-white text-[#121212] hover:bg-[#F0C020]'
              }`}
              title={isLoved ? 'Unlike Article' : 'Like Article'}
            >
              <Heart className={`w-3.5 h-3.5 ${isLoved ? 'fill-white text-white' : 'text-[#D02020]'}`} />
              <span>{likesCount} {isLoved ? 'LOVED' : 'LOVE'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-white text-[#121212] hover:bg-[#F0C020] border-2 border-[#121212] px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#121212] transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Article Header Card */}
        <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_#121212] p-8 sm:p-12 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#1040C0] text-white border-2 border-[#121212] px-3 py-1 text-xs font-black uppercase">
                {post.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                <Clock className="w-3.5 h-3.5 text-[#D02020]" />
                <span>{post.read_time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#121212]">
                <Calendar className="w-3.5 h-3.5 text-[#1040C0]" />
                <span>
                  {new Date(post.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Love Button Header */}
            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase border-4 border-[#121212] shadow-[4px_4px_0px_#121212] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLoved ? 'fill-white text-white' : 'text-[#121212]'}`} />
              <span>{likesCount} {isLoved ? 'LOVED' : 'LOVE THIS'}</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#121212] leading-tight">
            {post.title}
          </h1>

          <p className="text-lg font-medium text-gray-800 leading-relaxed border-l-4 border-[#F0C020] pl-4 py-1">
            {post.excerpt}
          </p>

          {/* Cover image if available */}
          {post.cover_image && (
            <div className="pt-4">
              <div className="border-4 border-[#121212] shadow-[6px_6px_0px_#121212] overflow-hidden max-h-[400px]">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Article Content Card */}
        <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_#121212] p-8 sm:p-12 space-y-8">
          <MarkdownRenderer content={post.content} />

          {/* Interactive Love Callout Box at End of Article */}
          <div className="mt-8 p-6 bg-[#FFFDF7] border-4 border-[#121212] shadow-[6px_6px_0px_#121212] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-black uppercase text-base text-[#121212]">ENJOYED THIS ARTICLE?</h4>
              <p className="text-xs font-bold text-gray-600">Give it a love to show appreciation & support!</p>
            </div>

            <button
              onClick={handleLoveToggle}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-black uppercase border-4 border-[#121212] shadow-[4px_4px_0px_#121212] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                isLoved
                  ? 'bg-[#D02020] text-white'
                  : 'bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLoved ? 'fill-white text-white' : 'text-[#121212]'}`} />
              <span>{likesCount} {isLoved ? 'YOU LOVED THIS!' : 'SEND LOVE ❤️'}</span>
            </button>
          </div>

          {/* Tags Footer */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t-4 border-[#121212] flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase text-[#121212] mr-2">TAGS:</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-[#F0F0F0] text-[#121212] border-2 border-[#121212] px-3 py-1 text-xs font-black uppercase"
                >
                  <Tag className="w-3 h-3 text-[#D02020]" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Back Button Footer */}
        <div className="flex justify-between items-center pt-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white border-4 border-[#121212] px-6 py-3 text-sm font-black uppercase shadow-[4px_4px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL ARTICLES</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
