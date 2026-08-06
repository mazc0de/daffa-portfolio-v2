'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Home() {
  const planeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // --- Scroll-driven tilt ---
    const BASE_RX = 12
    const BASE_RY = -8
    const SCROLL_FACTOR_X = 0.015
    const SCROLL_FACTOR_Y = 0.01
    let ticking = false

    const updateTilt = () => {
      if (!planeRef.current) return
      const scrollY = window.scrollY || window.pageYOffset

      // Adjust based on screen width
      const isMobile = window.innerWidth <= 900
      const rxBase = isMobile ? 6 : BASE_RX
      const ryBase = isMobile ? -4 : BASE_RY

      const rx = rxBase - scrollY * SCROLL_FACTOR_X
      const ry = ryBase + scrollY * SCROLL_FACTOR_Y

      const clampedRx = Math.max(-15, Math.min(25, rx))
      const clampedRy = Math.max(-20, Math.min(10, ry))

      planeRef.current.style.setProperty('--rx', clampedRx + 'deg')
      planeRef.current.style.setProperty('--ry', clampedRy + 'deg')

      ticking = false
    }

    if (!prefersReducedMotion) {
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(updateTilt)
            ticking = true
          }
        },
        { passive: true }
      )
      updateTilt()
    }

    // --- Intersection Observer for animations ---
    const animatedElements = document.querySelectorAll('.animate-entrance')
    if (!prefersReducedMotion && animatedElements.length > 0) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const parent = entry.target.parentElement
              const siblings = Array.from(parent.children).filter(el =>
                el.classList.contains('animate-entrance')
              )
              const index = siblings.indexOf(entry.target)
              const delay = index > -1 ? index * 80 : 0

              setTimeout(() => {
                entry.target.classList.add('is-visible')
              }, delay)

              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -40px 0px'
        }
      )

      animatedElements.forEach(el => observer.observe(el))
    }

    return () => {
      window.removeEventListener('scroll', updateTilt)
    }
  }, [])

  return (
    <div className='perspective-stage flex min-h-screen items-start justify-center px-5 pt-10 pb-20'>
      <div
        ref={planeRef}
        className='tilted-plane border-ink shadow-large relative w-full max-w-[1200px] border-4 bg-white'
      >
        {/* =============== HERO =============== */}
        <section
          className='grid min-h-[520px] grid-cols-1 md:grid-cols-2'
          id='hero'
        >
          <div className='flex flex-col justify-center gap-5 p-8 md:p-10 lg:p-12'>
            <p className='text-red text-[clamp(16px,2vw,22px)] leading-none font-bold tracking-[0.08em] uppercase'>
              Frontend Web Developer
            </p>
            <h1 className='text-[clamp(40px,6vw,68px)] leading-[0.95] font-black tracking-[-0.04em] uppercase'>
              Daffa
              <br />
              Hanifisyafiq
            </h1>

            <div className='grid grid-cols-2 gap-5'>
              <div className='border-ink shadow-base flex flex-col gap-3 border-4 bg-white p-5'>
                <div className='flex items-center gap-2'>
                  <svg
                    className='text-red h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                  >
                    <path d='M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z' />
                  </svg>
                  <span className='text-[12px] font-bold tracking-[0.1em] uppercase'>
                    Focus
                  </span>
                </div>
                <p className='text-ink text-[15px] leading-[1.4] font-medium'>
                  Currently battling bugs in the javascript universe, especially
                  on the frontend side of the web.
                </p>
              </div>
              <div className='border-ink shadow-base flex flex-col gap-3 border-4 bg-white p-5'>
                <div className='flex items-center gap-2'>
                  <svg
                    className='text-blue h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                  >
                    <polygon points='12 2 2 7 12 12 22 7 12 2' />
                    <polyline points='2 12 12 17 22 12' />
                    <polyline points='2 17 12 22 22 17' />
                  </svg>
                  <span className='text-[12px] font-bold tracking-[0.1em] uppercase'>
                    Stack
                  </span>
                </div>
                <div className='flex flex-wrap gap-2.5'>
                  <span className='border-ink border-[3px] bg-white px-2 py-0.5 text-[11px] font-bold uppercase'>
                    Next
                  </span>
                  <span className='border-ink border-[3px] bg-white px-2 py-0.5 text-[11px] font-bold uppercase'>
                    React
                  </span>
                  <span className='border-ink border-[3px] bg-white px-2 py-0.5 text-[11px] font-bold uppercase'>
                    Typescript
                  </span>
                  <span className='border-ink border-[3px] bg-white px-2 py-0.5 text-[11px] font-bold uppercase'>
                    Javascript
                  </span>
                  <span className='border-ink border-[3px] bg-white px-2 py-0.5 text-[11px] font-bold uppercase'>
                    Tailwind CSS
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-2 flex flex-wrap gap-5'>
              <a
                href='#projects'
                className='border-ink shadow-base hover:shadow-hover active:shadow-press bg-yellow text-ink inline-flex cursor-pointer items-center gap-2 border-4 px-5 py-3 text-[13px] font-black tracking-[0.06em] uppercase transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]'
              >
                View Work <span className='text-lg leading-none'>→</span>
              </a>
              <a
                href='#connect'
                className='border-ink shadow-base hover:shadow-hover active:shadow-press text-ink inline-flex cursor-pointer items-center gap-2 border-4 bg-white px-5 py-3 text-[13px] font-black tracking-[0.06em] uppercase transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]'
              >
                Contact <span className='text-lg leading-none'>↗</span>
              </a>
            </div>

            <div className='grid grid-cols-2 gap-5'>
              <div className='border-ink shadow-base flex min-h-[90px] flex-col justify-between gap-3 border-4 bg-white p-4 md:p-5'>
                <div className='text-[11px] font-bold tracking-[0.1em] uppercase'>
                  Status
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <div className='text-[14px] leading-tight font-bold md:text-[15px]'>
                    Open to collabs
                  </div>
                  <div className='bg-blue border-ink h-3.5 w-3.5 shrink-0 rounded-full border-[3px] md:h-4 md:w-4'></div>
                </div>
              </div>
              <div className='border-ink shadow-base flex min-h-[90px] flex-col justify-between gap-3 border-4 bg-white p-4 md:p-5'>
                <div className='text-[11px] font-bold tracking-[0.1em] uppercase'>
                  Location
                </div>
                <div className='flex items-center justify-between gap-2'>
                  <div className='text-[14px] leading-tight font-bold md:text-[15px]'>
                    Indonesia
                  </div>
                  <div className='bg-red border-ink h-3.5 w-3.5 shrink-0 rounded-full border-[3px] md:h-4 md:w-4'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Composition Box */}
          <div className='border-ink relative grid min-h-[380px] grid-cols-12 grid-rows-12 overflow-hidden border-t-4 md:min-h-[480px] md:border-t-0 md:border-l-4'>
            <div className='comp-red bg-red z-10'></div>
            <div className='comp-yellow bg-yellow z-10'></div>
            <div className='comp-oval-wrapper z-20 flex items-center justify-center'>
              <div className='bg-blue border-ink flex aspect-[3/4] w-[200px] items-center justify-center overflow-hidden rounded-full border-4 md:w-[280px]'>
                <Image
                  src='/headshot.webp'
                  alt='Portrait of Alexei Volkov'
                  width={280}
                  height={373}
                  className='h-full w-full object-cover mix-blend-multiply brightness-[1.05] contrast-[1.1]'
                  priority
                />
              </div>
            </div>
            {/* Grid lines */}
            <div
              className='bg-ink absolute right-0 left-0 z-30 h-1'
              style={{ top: '33%' }}
            ></div>
            <div
              className='bg-ink absolute right-0 left-0 z-30 h-1'
              style={{ top: '66%' }}
            ></div>
            <div
              className='bg-ink absolute top-0 bottom-0 z-30 w-1'
              style={{ left: '41.6%' }}
            ></div>
            <div
              className='bg-ink absolute top-0 bottom-0 z-30 w-1'
              style={{ left: '66.6%' }}
            ></div>
            {/* Accent marks */}
            <div
              className='bg-ink absolute z-40 h-5 w-5 rounded-full'
              style={{ top: 'calc(33% - 10px)', left: 'calc(41.6% - 10px)' }}
            ></div>
            <div
              className='bg-ink absolute z-40 h-5 w-5 rounded-full'
              style={{ bottom: '12%', right: '10%' }}
            ></div>
            <div
              className="bg-ink after:bg-ink absolute z-40 h-1 w-6 after:absolute after:-top-[10px] after:left-[10px] after:h-6 after:w-1 after:content-['']"
              style={{ top: '8%', right: '14%' }}
            ></div>
          </div>
        </section>

        <div className='bg-ink h-1 w-full shrink-0'></div>

        {/* =============== ABOUT =============== */}
        <section
          className='grid grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-10 lg:p-14'
          id='about'
        >
          <div className='col-span-1 mb-2 flex items-start gap-4 md:col-span-2'>
            <div className='bg-red border-ink h-12 w-12 shrink-0 border-4'></div>
            <div>
              <h2>About</h2>
              <p className='text-ink/50 mt-2 text-[14px] leading-none font-bold tracking-[0.08em] uppercase'>
                Philosophy &amp; Background
              </p>
            </div>
          </div>

          {[
            {
              title: 'Approach',
              desc: 'I believe that compelling visuals must be backed by clean code architecture. Every component is built to be modular, responsive, and performance-driven without sacrificing interface aesthetics.',
              bg: 'bg-white'
            },
            {
              title: 'Background',
              desc: 'Based in Indonesia, focusing on modern frontend web application development. Experienced in building reservation systems, interactive user interfaces, and robust app architectures using React, Next.js, and Tailwind CSS.',
              bg: 'bg-bg'
            },
            {
              title: 'Process',
              desc: 'Starting from deep design system analysis in Figma, translating layouts into reusable TypeScript components, and optimizing rendering performance alongside seamless API integrations.',
              bg: 'bg-white'
            },
            {
              title: 'Services / Capabilities',
              desc: 'Responsive UI/UX slicing (Mobile-first), REST/Firestore API integration, reusable component architecture, asset & performance optimization, and scalable frontend maintenance.',
              bg: 'bg-bg'
            }
          ].map((card, i) => (
            <div
              key={i}
              className={`animate-entrance border-ink shadow-base border-4 p-7 ${card.bg}`}
            >
              <h3 className='mb-3 text-[18px]'>{card.title}</h3>
              <p className='text-[15px] leading-[1.65]'>{card.desc}</p>
            </div>
          ))}

          {/* Stats Row */}
          <div className='col-span-1 grid grid-cols-2 gap-4 md:col-span-2 lg:grid-cols-4'>
            {[
              {
                num: '15+',
                label: 'Projects Shipped',
                color: 'text-red',
                order: 'order-1 lg:order-1'
              },
              {
                num: '∞',
                label: 'curiosity',
                color: 'text-ink',
                order: 'order-2 lg:order-2'
              },
              {
                num: '3+',
                label: 'Years Experience',
                color: 'text-yellow',
                order: 'order-4 lg:order-3'
              },
              {
                num: '∞',
                label: 'Coffee',
                color: 'text-ink',
                order: 'order-3 lg:order-4'
              }
            ].map((stat, i) => (
              <div
                key={i}
                className={`animate-entrance border-ink border-4 bg-white p-5 text-center ${stat.order}`}
              >
                <div
                  className={`text-4xl leading-none font-black ${stat.color}`}
                >
                  {stat.num}
                </div>
                <div className='mt-2 text-[11px] font-bold tracking-[0.1em] uppercase'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className='bg-ink h-1 w-full shrink-0'></div>

        {/* =============== PROJECTS =============== */}
        <section className='p-6 md:p-10 lg:p-14' id='projects'>
          <div className='mb-8 flex items-start gap-4'>
            <div className='bg-blue border-ink h-12 w-12 shrink-0 rounded-full border-4'></div>
            <div>
              <h2>Selected Work</h2>
              <p className='text-ink/50 mt-2 text-[14px] leading-none font-bold tracking-[0.08em] uppercase'>
                2022 — Present
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                title: 'Manifesto Engine',
                status: 'live',
                statusColor: 'bg-red',
                desc: 'A generative typography tool that transforms manifestos into animated Constructivist posters. Real-time WebGL rendering with custom shader pipeline.',
                tags: ['WebGL', 'GLSL', 'React', 'Node.js'],
                borderColor: 'border-red',
                borderL: 'border-l-red'
              },
              {
                title: 'Spatial Archive',
                status: 'live',
                statusColor: 'bg-red',
                desc: "3D spatial interface for a museum's digital archive. Users navigate 12,000+ artifacts in a procedurally generated architectural space. Featured at Ars Electronica 2024.",
                tags: ['Three.js', 'Next.js', 'Postgres', 'R3F'],
                borderColor: 'border-blue',
                borderL: 'border-l-blue'
              },
              {
                title: 'Grid Protocol',
                status: 'dev',
                statusColor: 'bg-yellow',
                desc: 'Open-source design system framework built on strict geometric primitives. Binary border-radius, hard shadows, primary palette. Used by 200+ developers.',
                tags: ['TypeScript', 'CSS', 'Figma API', 'Open Source'],
                borderColor: 'border-yellow',
                borderL: 'border-l-yellow'
              },
              {
                title: 'Kinetic Identity',
                status: 'live',
                statusColor: 'bg-red',
                desc: 'Dynamic visual identity system for a Berlin-based architecture firm. Responsive logo generates unique compositions based on viewport and time of day.',
                tags: ['SVG', 'Canvas', 'Vue', 'Branding'],
                borderColor: 'border-red',
                borderL: 'border-l-red'
              },
              {
                title: 'Neue Galerie',
                status: 'archive',
                statusColor: 'bg-blue',
                desc: "Exhibition website for a Bauhaus retrospective. Full-screen immersive scroll experience with parallax compositions honoring the original movement's principles.",
                tags: ['GSAP', 'Nuxt', 'Headless CMS'],
                borderColor: 'border-blue',
                borderL: 'border-l-blue'
              },
              {
                title: 'Type Foundry OS',
                status: 'dev',
                statusColor: 'bg-yellow',
                desc: 'Web-based type design environment with real-time variable font preview, OpenType feature testing, and collaborative editing for distributed type design teams.',
                tags: ['Rust / WASM', 'Canvas', 'WebRTC'],
                borderColor: 'border-yellow',
                borderL: 'border-l-yellow'
              }
            ].map((proj, i) => (
              <article
                key={i}
                className={`animate-entrance shadow-base hover:shadow-hover flex flex-col border-4 bg-white transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] ${proj.borderColor} border-l-[8px] ${proj.borderL}`}
              >
                <div className='border-ink flex items-center justify-between border-b-2 p-5 pb-3'>
                  <h3 className='text-[18px] font-bold tracking-[0.02em] uppercase'>
                    {proj.title}
                  </h3>
                  <div
                    className={`border-ink h-3.5 w-3.5 shrink-0 rounded-full border-2 ${proj.statusColor}`}
                    title={proj.status}
                  ></div>
                </div>
                <div className='flex flex-1 flex-col gap-3.5 p-4 px-5 pb-5'>
                  <p className='text-[14px] leading-[1.6] font-medium'>
                    {proj.desc}
                  </p>
                  <div className='mt-auto flex flex-wrap gap-2'>
                    {proj.tags.map((tag, j) => (
                      <span
                        key={j}
                        className='border-ink bg-bg border-2 px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className='bg-ink h-1 w-full shrink-0'></div>

        {/* =============== CONNECT =============== */}
        <section className='p-6 md:p-10 lg:p-14' id='connect'>
          <div className='mb-8 flex items-start gap-4'>
            <div className='bg-yellow border-ink h-12 w-12 shrink-0 border-4'></div>
            <div>
              <h2>Connect</h2>
              <p className='text-ink/50 mt-2 text-[14px] leading-none font-bold tracking-[0.08em] uppercase'>
                Let's Build Together
              </p>
            </div>
          </div>

          <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {[
              {
                icon: '@',
                label: 'Email',
                sub: 'daffahan29@gmail.com',
                link: 'mailto:daffahan29@gmail.com',
                iconBg: 'bg-red',
                iconColor: 'text-white'
              },
              {
                icon: 'GH',
                label: 'GitHub',
                sub: 'github.com/mazc0de',
                link: 'https://github.com/mazc0de',
                iconBg: 'bg-ink',
                iconColor: 'text-white'
              },
              /*
              {
                icon: 'TW',
                label: 'Twitter / X',
                sub: '@alexeivolkov_',
                link: '#',
                iconBg: 'bg-yellow',
                iconColor: 'text-ink'
              },
              */
              {
                icon: 'in',
                label: 'LinkedIn',
                sub: 'Daffa Hanifisyafiq',
                link: 'https://www.linkedin.com/in/daffahan/',
                iconBg: 'bg-blue',
                iconColor: 'text-white'
              },
              /*
              {
                icon: 'DR',
                label: 'Dribbble',
                sub: 'alexeivolkov',
                link: '#',
                iconBg: 'bg-red',
                iconColor: 'text-white'
              },
              */
              {
                icon: 'CV',
                label: 'Read.cv',
                sub: 'daffa',
                link: '#',
                iconBg: 'bg-yellow',
                iconColor: 'text-white'
              }
            ].map((conn, i) => (
              <a
                key={i}
                href={conn.link}
                className='animate-entrance border-ink shadow-base text-ink hover:shadow-hover active:shadow-press flex cursor-pointer items-center gap-4 border-4 bg-white p-6 no-underline transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px]'
              >
                <div
                  className={`border-ink flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 text-xl font-black ${conn.iconBg} ${conn.iconColor}`}
                >
                  {conn.icon}
                </div>
                <div>
                  <div className='text-[16px] font-bold tracking-[0.05em] uppercase'>
                    {conn.label}
                  </div>
                  <div className='mt-0.5 text-[12px] font-medium opacity-60'>
                    {conn.sub}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className='border-ink bg-ink grid grid-cols-1 gap-6 border-4 p-6 text-white md:grid-cols-2 md:p-8'>
            <div className='text-[13px] leading-[1.6] font-medium'>
              <strong className='text-[14px] font-bold tracking-[0.05em] uppercase'>
                © 2025 Alexei Volkov
              </strong>
              <br />
              <br />
              Designed & engineered with obsessive precision. This portfolio is
              itself a design artifact — a living demonstration of the systems
              thinking applied to every client project.
            </div>
            <div className='text-[11px] leading-[1.7] font-medium opacity-65 md:text-right'>
              <strong className='mb-1 block text-[12px] font-bold tracking-[0.05em] uppercase opacity-100'>
                Technical Colophon
              </strong>
              Binary Modernism design system. Strictly 0px or 9999px
              border-radius. Hard 8px offset shadows in solid #121212. 4px
              border weight throughout. Outfit typeface at 900/700/500 weights.
              Primary palette: Red #D02020, Blue #1040C0, Yellow #F0C020. 3D
              perspective stage with scroll-driven parallax at 3000px depth. No
              gradients, no blur, no intermediate rounding.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
