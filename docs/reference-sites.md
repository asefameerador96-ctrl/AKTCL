# Reference site research (2026-09-21)

Two competitor/peer sites reviewed in the browser. Provenance notes on imagery are
judgement from inspecting the files, not statements by the site owners.

## 1. Orchid Cigarettes Dubai — orchid-cigarettes.com

**Purpose:** B2B lead generation for a contract cigarette manufacturer (Jebel Ali). Every
page ends in "Request a Quote" or WhatsApp. No e-commerce, no login.

**Structure (~28 pages, six templates)**

| Template | Pages | Detail page contents |
| --- | --- | --- |
| Home | 1 | Hero video + 4 stat counters, about blurb, 5 size cards, brand carousel, 4 service cards, factory section with 2 videos, 4 export regions, 3 blog teasers, closing CTA |
| Our Story | 1 | Who we are, capability, values, short history (~650 words) |
| Cigarette Sizes | index + 5 | Description, "why brands choose it", spec table, spec infographic, links to other sizes |
| Brands | index + 10 | Bullets, full spec table (pack/outer/carton counts, container type, MOQ), 3-image gallery, related brands |
| Services | index + 4 | ~800 words SEO copy, one image, enquiry CTA |
| Global Exports | index + 4 | ~1,350 words: formats, compliance, QA, flag grid of countries, FAQ |

Plus blog (3 posts), contact, privacy, terms. Contact form: name, company, email,
phone/WhatsApp, service dropdown, message; map below. JSON-LD on every page
(Organization, WebSite, LocalBusiness, Service, BreadcrumbList); keyword-targeted titles.

**Tech/design:** Next.js + Tailwind, single font (Manrope). Near-black `#0a0a0a`, crimson
accent, gold subtitles; dark and white sections alternate; rounded bordered cards; pill
buttons; floating WhatsApp button; light fade-in on scroll. No canvas/3D/animation library.

**Visuals**

- Hero and factory videos: real footage, WebM with MP4 fallback. Hero is a 30 s 1080p loop;
  two factory clips are vertical 720×1280 (phone footage) in rounded cards.
- Pack-on-dark-background clip: exactly 8 s at 1080p — very likely AI video of a pack render.
- Page-header smoke: looping stock smoke video behind titles.
- Pack shots: isolated 3D-style renders (~420–500 px square) on a CSS red-to-black gradient.
- Size cards: cigarette cutout + dimension line, flat WebP.
- Spec infographics: one designed image per format (pack structure, MOQ, container counts).
- Export region images and factory exterior: almost certainly AI-generated.
- CTA banner: Dubai skyline photo as CSS background with overlay. Flags are SVG; icons are a
  Lucide-style line set.

## 2. Sopariwala India LLP — sopariwala.com

**Purpose:** corporate credibility site for a 97-year-old leaf/tobacco/cigarette exporter.
Products are a catalogue; CTAs are "Enquire Now" and "Download Brochure" (one PDF per
category). No WhatsApp, no quote funnel.

**Structure (~60+ pages)**

- The Company: legacy timeline, vision & mission, leadership bios, approach, CSR
- Endeavour: farms, infrastructure, customised solutions
- Products: leaf, tobacco products, cigarettes, non-tobacco → individual product pages
- Clients, press archive, event gallery, awards, careers, contact

Homepage: 4-slide banner carousel, about block with YouTube film, chairman's message, six
counters, product categories, events gallery, press carousel, CSR photos.

Product pages are thin data cards (grade, packaging, nicotine %, sugar %, planting and
marketing months, enquire + catalogue buttons). Contact form: first/last name, phone, email,
company, country, product-interest checkboxes, reCAPTCHA, map.

**Tech/design:** WordPress custom theme; Contact Form 7, TranslatePress, Site Kit; jQuery
sliders; lazy images + scroll fade-ins. Marcellus serif headings + DM Sans body on cream;
metallic gold gradient header/footer; faint geometric pattern; dried-leaf cutouts on edges.
"Heritage luxury" versus Orchid's "dark industrial".

**Visuals:** almost nothing AI-generated.

- Hero banners: flat 1366×587 composites with headline baked into the image.
- Cigarette brand cards: designed posters — logo, tagline, four pack variants (3D mockups),
  moody stock background.
- Infrastructure/farms: real factory and warehouse photos, uneven quality (some WhatsApp).
- Legacy timeline: archival B&W photos in circles along a dotted gold SVG path, per decade.
- Press: scanned newspaper clippings. Events/CSR: real photos. Company film: YouTube embed.

## Side by side

| | Orchid | Sopariwala |
| --- | --- | --- |
| Goal | Leads for contract manufacturing | Institutional trust + catalogue |
| Proof | Specs, MOQs, container maths | Years, awards, press, leadership, CSR |
| Visuals | AI/rendered, video-led, polished | Real photos and archive, uneven, credible |
| Copy | Long SEO pages per service/region | Short, brochure-style |
| Conversion | WhatsApp + short form everywhere | Longer form, PDF brochures |
| Stack | Next.js + Tailwind | WordPress |

## Takeaway for AKTCL

Orchid's spec-driven pages and enquiry funnel + Sopariwala's proof layer (real factory
photography, legacy timeline, awards/press, leadership, brochures, brand poster cards).
Top-line layout follows Shah Agro (https://shahagro.com/), whose source is in Asef's GitHub.
