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
    "A curated visual archive of works in 3D, motion, illustration, and graphic design. Atmospheric, post-industrial, editorial.",
  email: "rizkyirawan0404@gmail.com",
  social: {
    instagram: "https://instagram.com/rizkyirawan",
    behance: "https://behance.net/rizkyirawan",
    linkedin: "https://linkedin.com/in/rizkyirawan",
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
      "Photorealistic visuals and atmospheric environments — translating concepts into immersive spatial experiences.",
    items: [
      "Interior Visualization",
      "Exterior Visualization",
      "Product Rendering",
      "Environment Design",
      "Concept Art",
    ],
  },
  {
    category: "Animation",
    description:
      "Bringing static frames to life through motion — from subtle product reveals to character-driven narratives.",
    items: [
      "2D Animation",
      "3D Animation",
      "Product Animation",
      "Explainer Animation",
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
      "Branding",
      "Logo",
      "Posters",
      "Album Covers",
      "Book Covers",
      "Templates",
      "Apparel Graphics",
    ],
  },
  {
    category: "Illustration",
    description:
      "Stories drawn by hand — editorial, figurative, and atmospheric illustrations with a distinct voice.",
    items: [
      "Editorial",
      "Portrait",
      "Landscape",
      "Apparel",
      "Book",
      "Custom Illustration",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "ethereal-threshold",
    title: "Ethereal Threshold",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary:
      "A study of liminal spaces — the moment between presence and absence, where light dissolves into grain.",
    description:
      "Ethereal Threshold explores the boundary between the seen and the unseen. Rendered in a palette of bone white and shadow, the series captures moments of transition — doorways, thresholds, and the spaces in between. Heavy grain and atmospheric haze give each frame the quality of a half-remembered dream.",
    tags: ["Illustration", "Atmospheric", "Editorial"],
    cover: "/images/works/ethereal-threshold/cover.jpg",
    gallery: [
      "/images/works/ethereal-threshold/01.jpg",
      "/images/works/ethereal-threshold/02.jpg",
    ],
    featured: true,
  },
  {
    slug: "veil-of-the-unseen",
    title: "Veil of the Unseen",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary:
      "Figures emerging from and dissolving into darkness — a meditation on visibility and erasure.",
    description:
      "Veil of the Unseen is a series of five illustrations examining what it means to be partially visible. Each composition balances a figure against an enveloping void, creating tension between revelation and concealment. The work draws on post-punk visual culture and the aesthetics of analog film degradation.",
    tags: ["Illustration", "Figurative", "Dark"],
    cover: "/images/works/veil-of-the-unseen/cover.jpg",
    gallery: [
      "/images/works/veil-of-the-unseen/01.jpg",
      "/images/works/veil-of-the-unseen/02.jpg",
      "/images/works/veil-of-the-unseen/03.jpg",
      "/images/works/veil-of-the-unseen/04.jpg",
    ],
    featured: true,
  },
  {
    slug: "shadows-on-the-wall",
    title: "Shadows on the Wall",
    year: "2024",
    category: "Animation",
    client: "Personal Work",
    summary:
      "An animated exploration of silhouettes, projection, and the architecture of shadow.",
    description:
      "Shadows on the Wall is a motion piece studying the interplay between light, surface, and silhouette. The animation references the primal act of casting shadows — hands against walls, figures against light — and translates it into a contemporary visual language driven by rhythm and decay.",
    tags: ["Animation", "Motion", "Shadow"],
    cover: "/images/works/shadows-on-the-wall/cover.jpg",
    gallery: ["/images/works/shadows-on-the-wall/01.jpg"],
    featured: true,
  },
  {
    slug: "phantom-in-the-ruins",
    title: "Phantom in the Ruins",
    year: "2024",
    category: "3D",
    client: "Personal Work",
    summary:
      "A spectral presence haunting brutalist architecture — 3D visualizations of abandoned spaces.",
    description:
      "Phantom in the Ruins renders a spectral figure within decaying brutalist structures. The series pairs cold architectural geometry with an ethereal, ghost-like presence, creating a dialogue between permanence and impermanence. Each frame is composed as a still from an imaginary film.",
    tags: ["3D", "Architecture", "Atmospheric"],
    cover: "/images/works/phantom-in-the-ruins/cover.jpg",
    gallery: [
      "/images/works/phantom-in-the-ruins/01.jpg",
      "/images/works/phantom-in-the-ruins/02.jpg",
      "/images/works/phantom-in-the-ruins/03.jpg",
    ],
    featured: true,
  },
  {
    slug: "specter-of-the-urban-abyss",
    title: "Specter of the Urban Abyss",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary:
      "A ghostly figure drifting through the vertical voids of an imagined city.",
    description:
      "Specter of the Urban Abyss places a translucent, spectral form against the overwhelming scale of urban architecture. The work explores feelings of alienation and dissolution within the modern city — the individual reduced to a trace, a blur, a stain on the urban fabric.",
    tags: ["Illustration", "Urban", "Spectral"],
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
    summary:
      "A blood-red descent into ruin — the only color piece in an otherwise monochrome archive.",
    description:
      "The Crimson Veil of Desolation is a study in controlled chromatic violence. Against a body of work defined by monochrome restraint, this series introduces a single, insistent red — the color of rust, of blood, of warning. The result is a meditation on desolation that refuses to look away.",
    tags: ["Illustration", "Color", "Desolation"],
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
    summary:
      "A four-part series exploring the emotional weight of a two-color palette.",
    description:
      "The Dichromatic Dream restricts itself to two colors across four compositions, proving that limitation is not the enemy of expression. Each piece builds a distinct emotional register — longing, dread, reverie, resolve — using nothing but the relationship between two pigments.",
    tags: ["Illustration", "Color Theory", "Series"],
    cover: "/images/works/dichromatic-dream/cover.jpg",
    gallery: [
      "/images/works/dichromatic-dream/01.jpg",
      "/images/works/dichromatic-dream/02.jpg",
      "/images/works/dichromatic-dream/03.jpg",
    ],
    featured: false,
  },
  {
    slug: "palestine-poppy",
    title: "The Palestine Poppy",
    year: "2024",
    category: "Illustration",
    client: "Personal Work",
    summary:
      "A floral elegy — a single red bloom against a field of grief.",
    description:
      "The Palestine Poppy is a quiet, devastating piece. A single flower, rendered in crimson, stands against a landscape of ash and absence. It is a work about resilience, memory, and the insistence of beauty in the face of erasure.",
    tags: ["Illustration", "Political", "Memorial"],
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
    summary:
      "A figure turned upward, listening to the atmosphere — a portrait of attention.",
    description:
      "The Sky Whisperer captures a figure in a posture of reception — head tilted skyward, body still, attention complete. The work is about the act of listening to something larger than yourself, and the visual language is calibrated to evoke that stillness.",
    tags: ["Illustration", "Portrait", "Atmospheric"],
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
    summary:
      "Surveillance, omniscience, and the gaze from above — a study of vertical power.",
    description:
      "Eye in the Sky examines the feeling of being watched from above. The composition places a singular, unblinking eye within an atmospheric sky, creating an image that is both beautiful and unsettling. It is a work about surveillance, divinity, and the verticality of power.",
    tags: ["Illustration", "Conceptual", "Surveillance"],
    cover: "/images/works/eye-in-the-sky/cover.jpg",
    gallery: ["/images/works/eye-in-the-sky/01.jpg"],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const awards: Award[] = [
  {
    title: "Winner — Space Tech Art Challenge",
    organization: "NASA",
    year: "2024",
    description:
      "Selected as a winning entry in the NASA Space Tech Art Challenge for an illustration series exploring space technology.",
  },
];

export const journalPosts: JournalPost[] = [
  {
    slug: "on-shadow-and-silence",
    title: "On Shadow and Silence",
    date: "2024-12-01",
    excerpt:
      "Why negative space matters more than the things we put inside it — a meditation on atmosphere in visual design.",
    content:
      "There is a difference between empty space and silence. Empty space is an accident. Silence is a choice.\n\nIn my work, I keep returning to the idea that what is not shown is as important as what is. A frame with too much information leaves no room for the viewer. A frame with too little feels lazy. The work lives in the tension between the two.\n\nThis is why I am drawn to the visual language of post-punk and industrial design — the refusal to fill every corner, the confidence to let a single element carry the weight of an entire composition.",
    tags: ["Design", "Essay"],
  },
  {
    slug: "the-grid-is-a-feeling",
    title: "The Grid Is a Feeling",
    date: "2024-11-15",
    excerpt:
      "Swiss design is not just about alignment. It is about the emotional discipline of structure.",
    content:
      "The Swiss grid is often taught as a technical system — columns, baselines, margins. But the grid is more than a measurement tool. It is an emotional framework.\n\nWhen I design within a grid, I am not just organizing content. I am creating a rhythm that the viewer feels before they understand. The grid is the heartbeat of a composition, and everything placed on top of it is the melody.",
    tags: ["Design", "Typography"],
  },
  {
    slug: "rendering-as-photography",
    title: "Rendering as Photography",
    date: "2024-10-28",
    excerpt:
      "Approaching 3D visualization with the eye of a photographer — composition, light, and the decisive moment.",
    content:
      "A 3D render is not a technical exercise. It is a photograph of a place that does not exist.\n\nI approach every visualization the way a photographer approaches a scene — looking for the angle that tells the story, waiting for the light to fall just right, and knowing when to stop. The software is just the camera. The image lives in the decisions.",
    tags: ["3D", "Process"],
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
      "Produced 10+ personal visual works exploring atmospheric and post-punk aesthetics",
      "Collaborated with 15+ brands including Cooldown, Engelsen Frame, Faralda, and Steelwerks",
      "Won the NASA Space Tech Art Challenge for an illustration series on space technology",
      "Delivered full visual identity systems, 3D visualizations, and animated content",
    ],
  },
  {
    role: "3D Visualization Specialist",
    organization: "Various Studios",
    period: "2021 — 2022",
    description:
      "Focused on architectural and product visualization — rendering interior and exterior spaces with photorealistic quality and atmospheric composition.",
    highlights: [
      "Created interior and exterior visualizations for architecture studios",
      "Developed product rendering pipelines for consumer brands",
      "Built environment design and concept art for pre-production workflows",
    ],
  },
  {
    role: "Graphic Designer & Illustrator",
    organization: "Studio Work",
    period: "2019 — 2021",
    description:
      "Began professional practice in graphic design and illustration — building brand identities, editorial layouts, and custom illustrations for print and digital.",
    highlights: [
      "Designed brand identities, logos, and visual systems for startups and SMEs",
      "Created editorial illustrations for print publications and digital media",
      "Produced apparel graphics, book covers, album covers, and poster designs",
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    category: "3D",
    items: [
      "Interior Visualization",
      "Exterior Visualization",
      "Product Rendering",
      "Environment Design",
      "Concept Art",
    ],
  },
  {
    category: "Animation",
    items: [
      "2D Animation",
      "3D Animation",
      "Product Animation",
      "Explainer Animation",
      "Logo Animation",
      "Character Animation",
    ],
  },
  {
    category: "Graphic Design",
    items: [
      "UI/UX",
      "Branding",
      "Logo",
      "Posters",
      "Album Covers",
      "Book Covers",
      "Templates",
      "Apparel Graphics",
    ],
  },
  {
    category: "Illustration",
    items: [
      "Editorial",
      "Portrait",
      "Landscape",
      "Apparel",
      "Book",
      "Custom Illustration",
    ],
  },
];

export const tools: SkillGroup[] = [
  {
    category: "3D & Motion",
    items: [
      "Blender",
      "Cinema 4D",
      "Octane Render",
      "After Effects",
      "GSAP",
      "Framer Motion",
    ],
  },
  {
    category: "Design & UI",
    items: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe InDesign",
      "Procreate",
    ],
  },
  {
    category: "Web & Development",
    items: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Radix UI",
      "Lenis",
      "Vercel",
    ],
  },
];

export const education: Education[] = [
  {
    degree: "Multidisciplinary Visual Arts",
    institution: "Self-directed Practice",
    period: "2019 — Present",
    description:
      "Ongoing independent study across 3D visualization, animation, illustration, and graphic design — informed by post-punk aesthetics, Swiss editorial discipline, and brutalist architecture.",
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
  "Rafala Zajaca",
  "Roombase",
  "Scogen",
  "Se",
  "Shapeys",
  "Steelwerks",
  "VH",
  "Zero Sweet",
];
