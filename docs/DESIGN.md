# Summary

A Constructivist design system utilizing a 3D tilted stage, rigid geometric
constraints, and primary colors to create a modern digital interpretation of
1920s Bauhaus poster art.

# Style

The style essence is 'Binary Modernism'. All elements use either 0px or 100%
border-radius. Colors are restricted to a specific palette: Primary Red
(#D02020), Primary Blue (#1040C0), and Primary Yellow (#F0C020) against a light
grey (#F0F0F0) or white background. Typography is set exclusively in 'Outfit',
prioritizing heavy weights (900/800) for headlines. Interactive elements feature
a 'press effect' (2px translation) rather than standard fades, and shadows are
never blurred—only hard 8px offsets in solid black (#121212).

## Spec

Create a design system using the following specifications:

- **Typography**: Font family 'Outfit'. Headings: 60px+, font-weight: 900,
  uppercase, tracking-tight. Subheadings: 24px+, font-weight: 700, uppercase.
  Body: 16-18px, font-weight: 500.
- **Colors**: Red: #D02020; Blue: #1040C0; Yellow: #F0C020; Ink/Border: #121212;
  BG: #F0F0F0.
- **Borders & Shadows**: All containers have a 4px solid #121212 border. Shadows
  are 'hard': 8px 8px 0px #121212. Large components use 10px 10px 0px.
- **Geometry**: Border-radius is strictly 0px (rectangles) or 9999px
  (circles/ovals). No intermediate rounding.
- **3D Environment**: Root container must have perspective: 3000px. The main
  content plane is tilted at rotateX(12deg) rotateY(-8deg) rotateZ(1deg).
- **Grain Effect**: A background overlay with a subtle noise/grain texture
  (opacity 0.08) using radial gradients.

# Layout & Structure

The layout is a single, massive tilted 'board' containing sections separated by
thick 4px horizontal dividers. It relies on a CSS grid-based composition box and
bento-style card layouts.

## Perspective Stage

Container with perspective: 3000px. Inside, a main <div> with transition-all
duration-150. A scroll listener must update the transform: rotateX(12 -
scrollY * 0.015)deg and rotateY(-8 + scrollY * 0.01)deg. This creates a tilting
plane effect as the user scrolls.

## Hero Section

Split into a text column (60%) and a Bauhaus Composition Box (40%). Text column
features name in font-black 68px uppercase and a grid of 'Focus' and 'Stack'
boxes. The Composition Box is a 12x12 CSS grid containing color-blocked
rectangles (Red/Yellow/White) and a central Blue oval containing a headshot with
mix-blend-mode: multiply.

## About Section

Vertical layout or 12-column grid. Heading with a 10x10 square color accent.
Content consists of text blocks wrapped in 4px borders with hard shadows,
alternating background colors between White and #F0F0F0.

## Project Showcase

A 2 or 3 column grid of project cards. Each card has a specific primary color
border (rotating Red/Blue/Yellow). Card header includes title and a status dot
(circle). Body includes description and technology tags as small, bordered
pills. Hover state: card translates -1px and shadow increases.

## Connect Section

A grid of social links as large buttons. Each button has a 4px border, hard
shadow, and a large circular icon wrapper. Use the primary palette for button
backgrounds. Include a footer box with a copyright notice and a technical
description of the site style.

# Special Components

## Bauhaus Composition Box

An intricate geometric grid assembly that houses a profile image.

A 12x12 grid container. Top-left 5x4 cells: #D02020. Center 8x8 cells: White
background with a 300px aspect-ratio [3/4] blue oval (#1040C0). The oval
contains an image with mix-blend-mode: multiply. Bottom-right 4x5 cells:
#F0C020. All major grid intersections marked with 4px borders.

## Interactive Bauhaus Button

A tactile, geometric button with a binary state.

Border: 4px solid #121212; Background: #F0C020 (Yellow) or White; Padding: 12px
16px; Shadow: 8px 8px 0px #121212; Font: Outfit Black Uppercase. Active state:
transform: translate(2px, 2px); shadow: 6px 6px 0px #121212; transition: all
0.1s ease-in-out.

# Special Notes

MUST: Maintain the 4px border weight consistently across all elements. MUST: Use
only hard-edged shadows. MUST: Implement the scroll-parallax effect on the
container plane to achieve the 'tilted poster' feel. DO NOT: Use any gradients
(except for the background grain) or blurred effects. DO NOT: Use soft-rounded
corners; strictly sharp or circular.
