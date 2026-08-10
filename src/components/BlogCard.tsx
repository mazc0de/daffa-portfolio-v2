'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/types/blog'
import { hasUserLovedPost, togglePostLove } from '@/lib/blog-service'
import { ArrowUpRight, Clock, Tag, Heart } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
  index?: number
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const [isLoved, setIsLoved] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0)
  const [isToggling, setIsToggling] = useState<boolean>(false)

  useEffect(() => {
    setIsLoved(hasUserLovedPost(post.id))
    setLikesCount(post.likes ?? 0)
  }, [post.id, post.likes])

  const handleLoveToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isToggling) return
    setIsToggling(true)

    // Optimistic UI update
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

  // Rotate border & accent colors based on index
  const accentColors = [
    { bg: 'bg-[#D02020]', text: 'text-white', border: 'border-[#D02020]' },
    { bg: 'bg-[#1040C0]', text: 'text-white', border: 'border-[#1040C0]' },
    { bg: 'bg-[#F0C020]', text: 'text-[#121212]', border: 'border-[#F0C020]' },
  ]
  const accent = accentColors[index % accentColors.length]

  return (
    <article className="group relative flex flex-col bg-white border-4 border-[#121212] shadow-[8px_8px_0px_#121212] hover:-translate-y-1 hover:shadow-[12px_12px_0px_#121212] transition-all duration-150">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between border-b-4 border-[#121212] bg-[#F0F0F0] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-[#121212] ${accent.bg} ${accent.text}`}>
            {post.category}
          </span>
          {!post.published && (
            <span className="px-2 py-0.5 text-xs font-black uppercase border-2 border-[#121212] bg-[#121212] text-yellow-400">
              DRAFT
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Love Button */}
          <button
            onClick={handleLoveToggle}
            className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-black border-2 border-[#121212] transition-all active:scale-95 ${
              isLoved
                ? 'bg-[#D02020] text-white shadow-[2px_2px_0px_#121212]'
                : 'bg-white text-[#121212] hover:bg-gray-100 shadow-[2px_2px_0px_#121212]'
            }`}
            title={isLoved ? 'Unlike Article' : 'Like Article'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLoved ? 'fill-white text-white' : 'text-[#D02020]'}`} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-1 text-xs font-bold text-[#121212]">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.read_time}</span>
          </div>
        </div>
      </div>

      {/* Cover Image if present */}
      {post.cover_image && (
        <div className="border-b-4 border-[#121212] overflow-hidden max-h-48 bg-gray-100">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#121212] group-hover:text-[#1040C0] transition-colors">
            <Link href={`/blog/${post.slug}`} className="focus:outline-none">
              {post.title}
            </Link>
          </h2>
          <p className="text-[#121212] text-sm leading-relaxed font-medium line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-black uppercase bg-[#F0F0F0] text-[#121212] border-2 border-[#121212]"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer details & link button */}
          <div className="pt-2 border-t-2 border-[#121212] flex items-center justify-between text-xs font-bold">
            <span className="text-gray-600 uppercase">
              {new Date(post.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>

            <Link
              href={`/blog/${post.slug}`}
              className="flex items-center gap-1 bg-[#F0C020] text-[#121212] hover:bg-[#D02020] hover:text-white border-2 border-[#121212] px-3 py-1.5 font-black uppercase transition-colors shadow-[2px_2px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>READ ARTICLE</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
