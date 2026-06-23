import type {
  Award,
  Education,
  Experience,
  JournalPost,
  NavLink,
  Project,
  Service,
  SkillGroup,
} from "@/lib/types";

export const siteConfig = {
  name: "Rizky Irawan",
  role: "Multidisciplinary Visual Artist",
  title: "Rizky Irawan — Visual Archive",
  description:
    "Visual archive of works in 3D, motion, illustration, and graphic design — atmospheric, post-industrial, editorial.",
  email: "rizkyirawan0404@gmail.com",
  social: {
    instagram: "https://www.instagram.com/rizkyirawan44/",
    behance: "https://behance.net/rizkyirawan",
    linkedin: "https://www.linkedin.com/in/rizky-irawan-b340363aa/",
    pinterest: "https://id.pinterest.com/rizkyirawan0404/_saved/",
    freelancer: "https://www.freelancer.com/u/rizkyirawan0404",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/works" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "CV", href: "/cv" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export const services: Service[] = [
  {
    category: "3D",
    description:
      "Photorealistic spatial experiences — from architectural interiors to conceptual environments and product renders.",
    items: [
      "Archviz Interior",
      "Archviz Exterior",
      "Product Render",
      "3D Concept & Environment",
      "Album Cover",
      "Poster Artwork",
    ],
  },
  {
    category: "Animation",
    description:
      "Bringing static frames to motion — product reveals, explainers, logo animations, and character-driven sequences.",
    items: [
      "2D & 3D Animation",
      "Product Animation",
      "Explainer",
      "Logo Animation",
      "Character Animation",
    ],
  },
  {
    category: "Graphic Design",
    description:
      "Visual identities and design systems built with editorial precision and typographic discipline.",
    items: [
      "UI/UX",
      "Logo & Branding",
      "Templates Design",
      "T-shirt Design",
      "Book Cover",
    ],
  },
  {
    category: "Illustration",
    description:
      "Stories drawn by hand — figurative, atmospheric, and editorial illustrations with a distinct voice.",
    items: [
      "Apparel Illustration",
      "Book Illustrations",
      "Colorful Portrait",
      "Landscape Illustration",
      "Custom Illustration",
    ],
  },
];

export const projects: Project[] = [
  // ── Personal Works — featured on homepage ────────────────────────
  {
    slug: "ghibli-interior",
    title: "Ghibli Interior Room Design",
    year: "2024",
    category: "3D",
    client: "Personal Work",
    summary: "A photorealistic interior space drawn from the soft, painterly world of Studio Ghibli.",
    description:
      "Ghibli Interior Room Design translates the warmth and atmosphere of Studio Ghibli films into a fully rendered 3D environment. Every detail — light filtering through curtains, stacked books, the quality of afternoon sun on wooden surfaces — is calibrated to evoke the feeling of stepping inside an animated frame.",
    tags: ["3D", "Archviz", "Interior", "Ghibli"],
    cover: "/images/works/ghibli-interior/cover.jpg",
    gallery: ["/images/works/ghibli-interior/01.jpg"],
    featured: true,
  },
  {
    slug: "zero-sweet",
    title: "Zero Sweet",
    year: "2023",
    category: "Graphic Design",
    client: "Zero Sweet",
    summary: "Brand identity for Zero Sweet — a clean, bold visual system for a sugar-free beverage brand.",
    description:
      "Zero Sweet required a visual identity that communicated purity and boldness simultaneously. The system uses stark type, a minimal palette, and precise geometric forms to build a brand that feels both premium and accessible.",
    tags: ["Branding", "Identity", "Packaging"],
    cover: "/images/works/zero-sweet/cover.jpg",
    gallery: ["/images/works/zero-sweet/01.jpg"],
    featured: true,
  },
  {
    slug: "echoes-misty-swamp",
    title: "Echoes of the Misty Swamp",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A series of atmospheric illustrations exploring fog, water, and the creatures that inhabit liminal natural spaces.",
    description:
      "Echoes of the Misty Swamp is a study in atmosphere — layers of mist, dark water, and the ambiguous forms of creatures half-glimpsed through reeds. The series draws on folklore and natural history to create images that sit between the documentary and the dreamlike.",
    tags: ["Illustration", "Atmospheric", "Nature"],
    cover: "/images/works/echoes-misty-swamp/cover.jpg",
    gallery: ["/images/works/echoes-misty-swamp/01.jpg"],
    featured: true,
  },
  {
    slug: "f-this-party",
    title: "F--- This Party",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "Raw poster artwork that channels the energy and defiance of underground music culture.",
    description:
      "F--- This Party is a series of aggressive poster works driven by underground energy and visual confrontation. Bold type, distorted imagery, and deliberate noise — a visual language built on tension and refusal.",
    tags: ["Illustration", "Poster", "Punk"],
    cover: "/images/works/f-this-party/cover.jpg",
    gallery: ["/images/works/f-this-party/01.jpg"],
    featured: false,
  },
  {
    slug: "echoes-void",
    title: "Echoes in the Void",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "The Inverted Serenade — figures dissolving into signal noise and structural void.",
    description:
      "Echoes in the Void: The Inverted Serenade is a series built on contradiction — sound rendered as silence, presence rendered as absence. The work references both radio astronomy and experimental music.",
    tags: ["Illustration", "Conceptual", "Dark"],
    cover: "/images/works/echoes-void/cover.jpg",
    gallery: ["/images/works/echoes-void/01.jpg"],
    featured: false,
  },
  {
    slug: "shronic",
    title: "Shronic Animation",
    year: "2023",
    category: "Animation",
    client: "Shronic",
    summary: "Brand motion for Shronic — kinetic typography and logo animation system.",
    description:
      "Shronic required animation that communicated speed, precision, and technological confidence. The system uses sharp transitions, geometric reveals, and a cold color palette to build motion that feels both technical and stylish.",
    tags: ["Animation", "Motion", "Branding"],
    cover: "/images/works/shronic/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "maya-labs",
    title: "Maya Labs",
    year: "2023",
    category: "Graphic Design",
    client: "Maya Labs",
    summary: "Visual identity and motion for a contemporary technology research studio.",
    description:
      "Maya Labs needed a brand language that bridged scientific rigor and creative experimentation. The identity uses modular grid systems, precision typography, and animated transitions to build a visual presence that is both authoritative and dynamic.",
    tags: ["Branding", "Identity", "Motion"],
    cover: "/images/works/maya-labs/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "social-security",
    title: "Social Security System",
    year: "2023",
    category: "Animation",
    client: "Government Agency",
    summary: "Explainer animation for a social security information campaign — clear, accessible, authoritative.",
    description:
      "A motion graphics campaign designed to make complex bureaucratic information clear and accessible. The visual language balances institutional authority with warmth, using simple forms and deliberate pacing to guide the viewer.",
    tags: ["Animation", "Explainer", "Public"],
    cover: "/images/works/social-security/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "tredoxa",
    title: "Tredoxa LLC",
    year: "2023",
    category: "Animation",
    client: "Tredoxa LLC",
    summary: "Corporate animation and brand motion for a B2B technology company.",
    description:
      "Tredoxa LLC required professional motion content that communicated trust, capability, and forward momentum. The animation system uses confident transitions and structured information design.",
    tags: ["Animation", "Corporate", "Branding"],
    cover: "/images/works/tredoxa/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "halo-intro",
    title: "Halo Intro Animation",
    year: "2024",
    category: "Animation",
    client: "Personal Work",
    summary: "Cinematic intro sequence inspired by the Halo game universe — epic scale, precise motion.",
    description:
      "A fan-made cinematic intro that reimagines the opening of the Halo universe with contemporary motion design. The sequence uses dramatic camera moves, particle systems, and orchestral timing to build toward a single, iconic title reveal.",
    tags: ["Animation", "Cinematic", "Gaming"],
    cover: "/images/works/halo-intro/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "roombase",
    title: "Roombase UI/UX",
    year: "2023",
    category: "Graphic Design",
    client: "Roombase",
    summary: "UI/UX design for a room-finding platform — clear spatial hierarchy, intuitive flows.",
    description:
      "Roombase needed a digital product experience that made the process of finding a room feel less stressful and more human. The design uses spatial metaphors, warm typography, and clear information hierarchy to guide users through complex decisions.",
    tags: ["UI/UX", "Product Design", "Digital"],
    cover: "/images/works/roombase/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "takeoff",
    title: "Takeoff",
    year: "2024",
    category: "3D",
    client: "Personal Work",
    summary: "A 3D visualization study of flight, velocity, and the architecture of aircraft forms.",
    description:
      "Takeoff is a personal 3D study that treats aircraft as sculptural objects — studying the geometry of wings, turbines, and fuselage under carefully controlled light. Each frame is composed as a still life, not a technical diagram.",
    tags: ["3D", "Aviation", "Render"],
    cover: "/images/works/takeoff/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "engelsen",
    title: "Engelsen",
    year: "2023",
    category: "Graphic Design",
    client: "Engelsen Frame",
    summary: "Brand identity for Engelsen Frame — a Scandinavian eyewear brand defined by restraint and craft.",
    description:
      "Engelsen Frame required an identity system that communicated Scandinavian values: restraint, quality, and precision. The visual system uses narrow type, an almost monochrome palette, and clean geometric forms to build a brand that feels both minimal and considered.",
    tags: ["Branding", "Identity", "Eyewear"],
    cover: "/images/works/engelsen/cover.jpg",
    gallery: ["/images/works/engelsen/01.jpg"],
    featured: false,
  },
  {
    slug: "cooldown",
    title: "Cooldown Urban T-shirt",
    year: "2024",
    category: "Illustration",
    client: "Cooldown",
    summary: "Apparel illustration for Cooldown — bold urban graphics rooted in street culture and nostalgia.",
    description:
      "Cooldown's apparel line required illustrations that would work on garments — bold enough to read from distance, detailed enough to reward close inspection. The series draws on urban iconography, vintage sportswear, and the visual language of the streets.",
    tags: ["Illustration", "Apparel", "Urban"],
    cover: "/images/works/cooldown/cover.jpg",
    gallery: ["/images/works/cooldown/01.jpg"],
    featured: false,
  },
  {
    slug: "thing-that-matter",
    title: "Thing That Matter",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A series of editorial illustrations meditating on ordinary objects and their hidden weight.",
    description:
      "Thing That Matter is a visual essay on the significance of ordinary things. Each illustration selects a single object and renders it with the attention usually reserved for monuments — asking what it means to care, to collect, to keep.",
    tags: ["Illustration", "Editorial", "Objects"],
    cover: "/images/works/thing-that-matter/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "dread-runaway",
    title: "Dread Runaway",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "Dark, urgent illustrations exploring the feeling of flight and fear — figures mid-escape.",
    description:
      "Dread Runaway is a series of illustrations built around a single emotional state: the desperate energy of running from something. The figures are mid-motion, always facing away, always at the edge of the frame.",
    tags: ["Illustration", "Dark", "Figurative"],
    cover: "/images/works/dread-runaway/cover.jpg",
    gallery: ["/images/works/dread-runaway/01.jpg"],
    featured: false,
  },
  {
    slug: "the-wonder",
    title: "The Wonder",
    year: "2024",
    category: "3D",
    client: "Personal Work",
    summary: "A 3D exploration of wonder — vast spaces, impossible scales, and the human figure dwarfed by environment.",
    description:
      "The Wonder uses 3D to construct spaces that provoke a specific emotional state: the feeling of being small inside something enormous and beautiful. Each scene places a single human figure against an environment so large it becomes abstract.",
    tags: ["3D", "Environment", "Conceptual"],
    cover: "/images/works/the-wonder/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "colorful-portraits",
    title: "Colorful Portrait Illustrations",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A vibrant series of portrait illustrations — bold color, expressive line, strong character.",
    description:
      "Breaking from a predominantly monochrome practice, this series allows full color to carry the weight of character and emotion. Each portrait is built around a dominant palette that defines the subject's emotional register.",
    tags: ["Illustration", "Portrait", "Color"],
    cover: "/images/works/colorful-portraits/cover.jpg",
    gallery: ["/images/works/colorful-portraits/01.jpg"],
    featured: false,
  },
  {
    slug: "colorful-landscapes",
    title: "Colorful Landscape Illustrations",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "Landscape illustrations in vivid color — natural environments rendered with emotion and atmosphere.",
    description:
      "A series of landscape illustrations that uses color not to document but to interpret — each scene filtered through a specific emotional state, rendered in a palette that makes the familiar feel strange and beautiful.",
    tags: ["Illustration", "Landscape", "Color"],
    cover: "/images/works/colorful-landscapes/cover.jpg",
    gallery: ["/images/works/colorful-landscapes/01.jpg"],
    featured: false,
  },
  {
    slug: "collage-illustrations",
    title: "3 Collage Illustrations",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A collage triptych — found imagery, cut and reassembled into new visual arguments.",
    description:
      "Three collage works that use found imagery as raw material — cutting, layering, and reassembling to construct images that could not exist any other way. The process is both destructive and generative.",
    tags: ["Illustration", "Collage", "Mixed Media"],
    cover: "/images/works/collage-illustrations/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "nasa-space-tech",
    title: "NASA Space Tech Art Challenge",
    year: "2024",
    category: "Illustration",
    client: "NASA",
    summary: "Winner — NASA Space Tech Art Challenge: Imagine Tomorrow. An illustration series exploring the visual language of space technology.",
    description:
      "Selected as a winning entry in the NASA Space Tech Art Challenge: Imagine Tomorrow. The submitted work visualizes emerging space technologies through an illustrative lens — merging scientific accuracy with atmospheric, painterly technique to make the abstract tangible.",
    tags: ["Illustration", "Space", "Award", "NASA"],
    cover: "/images/works/nasa-space-tech/cover.jpg",
    gallery: ["/images/works/nasa-space-tech/01.jpg"],
    url: "https://www.nasa.gov/image-article/winners-named-in-nasa-space-tech-art-challenge/",
    featured: true,
  },
  // ── Personal Works ───────────────────────────────────────────────
  {
    slug: "ethereal-threshold",
    title: "Ethereal Threshold",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A study of liminal spaces — the moment between presence and absence, where light dissolves into grain.",
    description:
      "Ethereal Threshold explores the boundary between the seen and the unseen. Rendered in a palette of bone white and shadow, the series captures moments of transition — doorways, thresholds, and the spaces in between.",
    tags: ["Illustration", "Atmospheric", "Personal"],
    cover: "/images/works/ethereal-threshold/cover.jpg",
    gallery: ["/images/works/ethereal-threshold/01.jpg", "/images/works/ethereal-threshold/02.jpg"],
    featured: false,
  },
  {
    slug: "veil-of-the-unseen",
    title: "Veil of the Unseen",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "Figures emerging from and dissolving into darkness — a meditation on visibility and erasure.",
    description:
      "Veil of the Unseen is a series of five illustrations examining what it means to be partially visible. Each composition balances a figure against an enveloping void.",
    tags: ["Illustration", "Figurative", "Personal"],
    cover: "/images/works/veil-of-the-unseen/cover.jpg",
    gallery: ["/images/works/veil-of-the-unseen/01.jpg", "/images/works/veil-of-the-unseen/02.jpg"],
    featured: false,
  },
  {
    slug: "shadows-on-the-wall",
    title: "Shadows on the Wall",
    year: "2024",
    category: "Animation",
    client: "Personal Work",
    summary: "An animated exploration of silhouettes, projection, and the architecture of shadow.",
    description:
      "Shadows on the Wall is a motion piece studying the interplay between light, surface, and silhouette.",
    tags: ["Animation", "Shadow", "Personal"],
    cover: "/images/works/shadows-on-the-wall/cover.jpg",
    gallery: ["/images/works/shadows-on-the-wall/01.jpg"],
    featured: false,
  },
  {
    slug: "phantom-in-the-ruins",
    title: "Phantom in the Ruins",
    year: "2024",
    category: "3D",
    client: "Personal Work",
    summary: "A spectral figure lost inside collapsed, forgotten spaces — 3D visualizations of silence and ruin.",
    description:
      "Phantom in the Ruins places a lone figure inside decaying, abandoned structures. The series explores the feeling of being present in a place that no longer exists — cold geometry, fading light, and an atmosphere caught between memory and disappearance.",
    tags: ["3D", "Architecture", "Personal"],
    cover: "/images/works/phantom-in-the-ruins/cover.jpg",
    gallery: ["/images/works/phantom-in-the-ruins/01.jpg", "/images/works/phantom-in-the-ruins/02.jpg"],
    featured: false,
  },
  {
    slug: "specter-of-the-urban-abyss",
    title: "Specter of the Urban Abyss",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A ghostly figure drifting through the vertical voids of an imagined city.",
    description:
      "Specter of the Urban Abyss places a translucent form against the overwhelming scale of urban architecture.",
    tags: ["Illustration", "Urban", "Personal"],
    cover: "/images/works/specter-of-the-urban-abyss/cover.jpg",
    gallery: ["/images/works/specter-of-the-urban-abyss/01.jpg"],
    featured: false,
  },
  {
    slug: "crimson-veil-of-desolation",
    title: "The Crimson Veil of Desolation",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A blood-red descent into ruin — the only color piece in an otherwise monochrome archive.",
    description:
      "The Crimson Veil of Desolation is a study in controlled chromatic violence — a single insistent red against a body of work defined by restraint.",
    tags: ["Illustration", "Color", "Personal"],
    cover: "/images/works/crimson-veil-of-desolation/cover.jpg",
    gallery: ["/images/works/crimson-veil-of-desolation/01.jpg"],
    featured: false,
  },
  {
    slug: "dichromatic-dream",
    title: "The Dichromatic Dream",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A four-part series exploring the emotional weight of a two-color palette.",
    description:
      "The Dichromatic Dream restricts itself to two colors across four compositions, proving that limitation is not the enemy of expression.",
    tags: ["Illustration", "Color Theory", "Personal"],
    cover: "/images/works/dichromatic-dream/cover.jpg",
    gallery: ["/images/works/dichromatic-dream/01.jpg", "/images/works/dichromatic-dream/02.jpg"],
    featured: false,
  },
  {
    slug: "palestine-poppy",
    title: "The Palestine Poppy",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A floral elegy — a single red bloom against a field of grief.",
    description:
      "The Palestine Poppy is a quiet, devastating piece. A single flower stands against a landscape of ash and absence.",
    tags: ["Illustration", "Political", "Personal"],
    cover: "/images/works/palestine-poppy/cover.jpg",
    gallery: [],
    featured: false,
  },
  {
    slug: "sky-whisperer",
    title: "The Sky Whisperer",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "A figure turned upward, listening to the atmosphere — a portrait of attention.",
    description:
      "The Sky Whisperer captures a figure in a posture of reception — head tilted skyward, attention complete.",
    tags: ["Illustration", "Portrait", "Personal"],
    cover: "/images/works/sky-whisperer/cover.jpg",
    gallery: ["/images/works/sky-whisperer/01.jpg"],
    featured: false,
  },
  {
    slug: "eye-in-the-sky",
    title: "Eye in the Sky",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary: "Surveillance, omniscience, and the gaze from above — a study of vertical power.",
    description:
      "Eye in the Sky examines the feeling of being watched from above — an image both beautiful and unsettling.",
    tags: ["Illustration", "Conceptual", "Personal"],
    cover: "/images/works/eye-in-the-sky/cover.jpg",
    gallery: ["/images/works/eye-in-the-sky/01.jpg"],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const awards: Award[] = [
  {
    title: "Winner — Space Tech Art Challenge: Imagine Tomorrow",
    organization: "NASA",
    year: "2024",
    description:
      "Selected as a winning entry in the NASA Space Tech Art Challenge for an illustration series visualizing emerging space technologies through atmospheric, painterly technique.",
  },
];

export const journalPosts: JournalPost[] = [
  {
    slug: "why-i-start-with-the-wrong-answer",
    title: "Why I Start With the Wrong Answer",
    date: "2024-12-01",
    excerpt:
      "The first idea is almost never the right one. But it is always necessary. Here is why I intentionally let myself fail before I start.",
    content:
      "Every project I take on, I make something bad first. On purpose.\n\nNot as a warmup. Not as a sketch. As a full attempt — something I would never show anyone — just to get the obvious answer out of the way. Because the obvious answer is always there, waiting, and if I don't deal with it early it will follow me through the whole project like a ghost.\n\nThe wrong answer tells you what the safe version looks like. Once you know that, you can start making something real.\n\nMost of the best work I've done came from the third or fourth attempt. Not because I got better, but because I stopped being afraid of the wrong answer. I had already made it. It already existed. There was nothing left to protect.",
    tags: ["Process", "Creative"],
  },
  {
    slug: "light-is-the-subject",
    title: "Light Is Always the Subject",
    date: "2024-11-15",
    excerpt:
      "In every image I make — 3D, illustration, photography — I am not rendering objects. I am rendering light, and everything else is just something for it to touch.",
    content:
      "I realized this slowly, then all at once: the object is never the subject. The light is.\n\nA chair in flat light is furniture. A chair in a single shaft of afternoon sun through a half-closed shutter is a feeling. Same object. Different light. Completely different image.\n\nWhen I set up a 3D scene, the geometry comes first — but I don't think I'm done until the light makes me feel something. I've spent four hours on a render and started over because the light was wrong. Not technically wrong. Emotionally wrong. Too clean. Too safe. Too much like a product photo and not enough like a memory.\n\nThe images I keep coming back to — in my own work and in the work I admire — all have light that feels like it has a source you can't quite see. Like the light has a reason for being there, even if you can't name it.",
    tags: ["3D", "Visual", "Process"],
  },
  {
    slug: "making-things-nobody-asked-for",
    title: "Making Things Nobody Asked For",
    date: "2024-10-28",
    excerpt:
      "Personal work is not a portfolio exercise. It is the only place where you find out what you actually think.",
    content:
      "Nobody asked for Phantom in the Ruins. No client brief, no budget, no deadline. Just a feeling I couldn't shake — a robed figure standing alone in a place that used to mean something.\n\nPersonal work is dangerous because there is no one to hide behind. When a client project doesn't land, you can point at the brief. When your own work doesn't land, there is nowhere to point. It's just you.\n\nBut that's also what makes it the only honest measure. The personal series I've made over the years tell me more about where I am as an artist than any client project I've ever delivered. They are the work that nobody needed, which means they are the only work I made entirely for the right reason.\n\nIf you are waiting for someone to ask you to make the thing you want to make — stop waiting. Make it first. The ask might never come, and that thing deserves to exist anyway.",
    tags: ["Personal", "Creative"],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getPostBySlug(slug: string): JournalPost | undefined {
  return journalPosts.find((p) => p.slug === slug);
}

export const experiences: Experience[] = [
  {
    role: "Freelance Visual Artist & Designer",
    organization: "Independent",
    period: "2022 — Present",
    description:
      "Working independently with creative agencies, architecture studios, product companies, music labels, and publishers across 3D, animation, illustration, and graphic design.",
    highlights: [
      "Won the NASA Space Tech Art Challenge: Imagine Tomorrow — 2024",
      "Delivered 20+ client projects across branding, animation, 3D, and illustration",
      "Collaborated with brands including Cooldown, Engelsen Frame, Roombase, Maya Labs, Tredoxa, and Zero Sweet",
      "Produced a body of personal visual works exploring atmospheric, cinematic, and surreal aesthetics",
    ],
  },
  {
    role: "3D Visualization Specialist",
    organization: "Various Studios",
    period: "2021 — 2022",
    description:
      "Focused on architectural and product visualization — rendering interior and exterior spaces with photorealistic quality.",
    highlights: [
      "Interior and exterior visualizations for architecture studios",
      "Product rendering pipelines for consumer brands",
      "Environment design and concept art for pre-production workflows",
    ],
  },
  {
    role: "Graphic Designer & Illustrator",
    organization: "Studio Work",
    period: "2019 — 2021",
    description:
      "Began professional practice in graphic design and illustration — brand identities, editorial layouts, and custom illustrations.",
    highlights: [
      "Brand identities, logos, and visual systems for startups and SMEs",
      "Editorial illustrations for print and digital publications",
      "Apparel graphics, book covers, album covers, and poster designs",
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    category: "3D",
    items: ["Archviz Interior", "Archviz Exterior", "Product Rendering", "Environment Design", "Concept Art"],
  },
  {
    category: "Animation",
    items: ["2D Animation", "3D Animation", "Product Animation", "Explainer Animation", "Logo Animation", "Character Animation"],
  },
  {
    category: "Graphic Design",
    items: ["UI/UX", "Branding", "Logo Design", "Posters", "Album Covers", "Book Covers", "Templates", "Apparel Graphics"],
  },
  {
    category: "Illustration",
    items: ["Editorial", "Portrait", "Landscape", "Apparel", "Book", "Custom Illustration"],
  },
];

export const tools: SkillGroup[] = [
  {
    category: "3D & Motion",
    items: ["Blender", "Cinema 4D", "Octane Render", "After Effects", "GSAP", "Framer Motion"],
  },
  {
    category: "Design & UI",
    items: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Procreate"],
  },
  {
    category: "Web & Development",
    items: ["Next.js", "TypeScript", "Tailwind CSS", "Radix UI", "Lenis", "Vercel"],
  },
];

export const education: Education[] = [
  {
    degree: "Multidisciplinary Visual Arts",
    institution: "Self-directed Practice",
    period: "2019 — Present",
    description:
      "Ongoing independent study across 3D visualization, animation, illustration, and graphic design — driven by atmosphere, cinematic composition, and the desire to make images that feel like they carry weight.",
  },
];

export const clientList: string[] = [
  "Cooldown",
  "Engelsen Frame",
  "Faralda",
  "Farrah Gray Advisors",
  "Gobo Revolution",
  "Jims Pay Plan",
  "Legal Touch",
  "Maya Labs",
  "Rafala Zajaca",
  "Roombase",
  "Scogen",
  "Shapeys",
  "Shronic",
  "Steelwerks",
  "Tredoxa LLC",
  "Zero Sweet",
];
