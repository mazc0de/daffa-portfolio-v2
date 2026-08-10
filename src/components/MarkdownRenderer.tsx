'use client'

import React, { useState } from 'react'
import { Check, Copy, Quote, Code2, Terminal } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Basic syntax highlighter for code block keywords & strings
  const formatCodeTokens = (code: string, language: string) => {
    const lines = code.split('\n')
    return lines.map((line, i) => {
      // Highlight keywords, strings, comments, numbers
      const formattedLine = line
        .replace(/(import|export|from|function|const|let|var|return|async|await|if|else|interface|type|class|select|from|where|create|table|insert|into|values|on|policy|trigger)/g, '<span class="text-[#D02020] font-bold">$1</span>')
        .replace(/('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)/g, '<span class="text-[#F0C020]">$1</span>')
        .replace(/(\/\/.*|\/\*[\s\S]*?\*\/|--.*)/g, '<span class="text-[#888888] italic">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-[#40B0FF] font-semibold">$1</span>')

      return (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-right select-none text-gray-500 font-mono text-xs w-8">
            {i + 1}
          </span>
          <span
            className="table-cell font-mono text-sm leading-relaxed whitespace-pre"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        </div>
      )
    })
  }

  // Parse markdown content into structured blocks
  const parseMarkdownBlocks = (raw: string) => {
    const blocks: { type: string; content: string; language?: string; title?: string }[] = []
    // Normalize escaped backslash-n sequence into real newline control characters
    const normalized = (raw || '').replace(/\\n/g, '\n')
    const lines = normalized.split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // Code block start
      if (line.trim().startsWith('```')) {
        const langMatch = line.trim().match(/^```(\w+)?/)
        const language = langMatch && langMatch[1] ? langMatch[1] : 'code'
        let codeLines: string[] = []
        i++

        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }

        blocks.push({
          type: 'code',
          language: language.toUpperCase(),
          content: codeLines.join('\n'),
        })
        i++
        continue
      }

      // Blockquote start
      if (line.trim().startsWith('>')) {
        let quoteLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
          i++
        }
        blocks.push({
          type: 'quote',
          content: quoteLines.join(' '),
        })
        continue
      }

      // Headers
      if (line.trim().startsWith('# ')) {
        blocks.push({ type: 'h1', content: line.trim().replace(/^#\s+/, '') })
        i++
        continue
      }
      if (line.trim().startsWith('## ')) {
        blocks.push({ type: 'h2', content: line.trim().replace(/^##\s+/, '') })
        i++
        continue
      }
      if (line.trim().startsWith('### ')) {
        blocks.push({ type: 'h3', content: line.trim().replace(/^###\s+/, '') })
        i++
        continue
      }

      // Unordered List
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        let listItems: string[] = []
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''))
          i++
        }
        blocks.push({
          type: 'ul',
          content: JSON.stringify(listItems),
        })
        continue
      }

      // Numbered List
      if (/^\d+\.\s/.test(line.trim())) {
        let listItems: string[] = []
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
          i++
        }
        blocks.push({
          type: 'ol',
          content: JSON.stringify(listItems),
        })
        continue
      }

      // Image: ![alt](url)
      const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)/)
      if (imageMatch) {
        blocks.push({
          type: 'image',
          title: imageMatch[1],
          content: imageMatch[2],
        })
        i++
        continue
      }

      // Regular paragraph or empty line
      if (line.trim() === '') {
        i++
        continue
      }

      let paragraphLines: string[] = [line]
      i++
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('- ') &&
        !/^\d+\.\s/.test(lines[i].trim())
      ) {
        paragraphLines.push(lines[i])
        i++
      }

      blocks.push({
        type: 'paragraph',
        content: paragraphLines.join(' '),
      })
    }

    return blocks
  }

  // Format inline elements (bold, italic, inline code, links)
  const formatInlineText = (text: string) => {
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#121212]">$1</strong>')
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Inline code
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="bg-[#F0F0F0] text-[#121212] font-mono text-sm px-2 py-0.5 border-2 border-[#121212] font-bold mx-0.5 inline-block">$1</code>'
    )
    // Links [text](url)
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-bold underline decoration-4 decoration-[#D02020] hover:bg-[#F0C020] px-1 transition-all">$1</a>'
    )

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  const blocks = parseMarkdownBlocks(content)

  return (
    <div className={`space-y-6 text-[#121212] font-sans ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h1':
            return (
              <div key={index} className="pt-4 pb-2 border-b-4 border-[#121212] flex items-center gap-3">
                <span className="w-5 h-5 bg-[#D02020] inline-block border-2 border-[#121212]" />
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#121212]">
                  {block.content}
                </h1>
              </div>
            )

          case 'h2':
            return (
              <div key={index} className="pt-4 pb-1 border-b-4 border-[#121212] flex items-center gap-2">
                <span className="w-4 h-4 bg-[#1040C0] inline-block border-2 border-[#121212]" />
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#121212]">
                  {block.content}
                </h2>
              </div>
            )

          case 'h3':
            return (
              <h3 key={index} className="text-xl font-bold uppercase tracking-tight text-[#121212] pt-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-[#F0C020] inline-block border-2 border-[#121212]" />
                {block.content}
              </h3>
            )

          case 'paragraph':
            return (
              <p key={index} className="text-[17px] leading-[1.8] font-medium text-[#121212] max-w-none">
                {formatInlineText(block.content)}
              </p>
            )

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-6 relative bg-[#FFFDF7] border-4 border-[#121212] shadow-[6px_6px_0px_#121212] p-6 flex gap-4 items-start"
              >
                <div className="w-3 self-stretch bg-[#1040C0] border-2 border-[#121212] shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-[#1040C0] font-black uppercase text-xs tracking-wider">
                    <Quote className="w-4 h-4 stroke-[3]" />
                    <span>BAUHAUS QUOTE</span>
                  </div>
                  <p className="text-lg font-bold italic leading-relaxed text-[#121212]">
                    {formatInlineText(block.content)}
                  </p>
                </div>
              </blockquote>
            )

          case 'code':
            return (
              <div
                key={index}
                className="my-6 border-4 border-[#121212] shadow-[8px_8px_0px_#121212] bg-[#121212] text-white overflow-hidden"
              >
                {/* Header bar */}
                <div className="bg-[#222222] border-b-4 border-[#121212] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#F0C020]" />
                    <span className="font-mono font-black text-xs uppercase bg-[#D02020] text-white px-2 py-0.5 border-2 border-[#121212]">
                      {block.language || 'CODE'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(block.content, index)}
                    className="flex items-center gap-1.5 bg-[#F0C020] text-[#121212] hover:bg-white border-2 border-[#121212] px-3 py-1 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY CODE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Code body */}
                <div className="p-4 overflow-x-auto">
                  <div className="table min-w-full">
                    {formatCodeTokens(block.content, block.language || '')}
                  </div>
                </div>
              </div>
            )

          case 'ul':
            const ulItems: string[] = JSON.parse(block.content)
            return (
              <ul key={index} className="space-y-2.5 my-4 pl-2">
                {ulItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[17px] font-medium">
                    <span className="w-2.5 h-2.5 bg-[#D02020] border-2 border-[#121212] mt-2 shrink-0" />
                    <span className="flex-1">{formatInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            )

          case 'ol':
            const olItems: string[] = JSON.parse(block.content)
            return (
              <ol key={index} className="space-y-2.5 my-4 pl-2">
                {olItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[17px] font-medium">
                    <span className="w-6 h-6 bg-[#F0C020] border-2 border-[#121212] text-[#121212] font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{formatInlineText(item)}</span>
                  </li>
                ))}
              </ol>
            )

          case 'image':
            return (
              <div key={index} className="my-6">
                <div className="border-4 border-[#121212] shadow-[8px_8px_0px_#121212] bg-white overflow-hidden">
                  <img
                    src={block.content}
                    alt={block.title || 'Blog image'}
                    className="w-full max-h-[450px] object-cover"
                  />
                  {block.title && (
                    <div className="p-3 bg-[#F0F0F0] border-t-4 border-[#121212] text-xs font-bold uppercase text-center tracking-wider text-[#121212]">
                      {block.title}
                    </div>
                  )}
                </div>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
