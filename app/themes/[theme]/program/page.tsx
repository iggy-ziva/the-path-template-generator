import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

const PROGRAM_COPY: Record<string, {
  heroHeadline: string;
  heroSubheadline: string;
  promise: string;
  promiseBody: string;
  includes: { title: string; description: string }[];
  weeks: { week: string; title: string; bullets: string[] }[];
  outcomes: string[];
  testimonials: { quote: string; name: string; location: string; context: string }[];
  bonuses: { title: string; description: string; value: number }[];
  faq: { q: string; a: string }[];
  guarantee: string;
}> = {
  sacred: {
    heroHeadline: "Eight weeks to decode, dissolve, and rewrite your soul's agreements",
    heroSubheadline: "Soul Contract Mastery is a live, small-group training with Selene Voss for people who are ready to do the deep Akashic work — not just touch it once and walk away.",
    promise: "What if the patterns that keep repeating in your life are not personal failures — but instructions?",
    promiseBody: "Every soul arrives with a set of agreements — contracts made before this lifetime that shape everything from the relationships you attract, to the money you allow yourself to receive, to the fears that seem to have no rational origin. Soul Contract Mastery is the training that teaches you to read these agreements with precision, dissolve the ones that no longer serve you, and consciously author the ones that will carry your next chapter forward.",
    includes: [
      { title: "Eight live weekly sessions with Selene", description: "2.5-hour live calls every Tuesday evening. All sessions recorded." },
      { title: "Monthly group Akashic Records ceremony", description: "A full group ceremonial opening of the Records — included throughout the programme duration." },
      { title: "The Soul Contracts Workbook", description: "Selene's complete written guide to Akashic inquiry — 120 pages." },
      { title: "Private community access", description: "A dedicated group space for questions, sharing, and peer support between sessions." },
      { title: "Lifetime access to all recordings", description: "Every session and ceremony recording available indefinitely." },
      { title: "Post-programme integration session", description: "A 90-minute live Q&A with Selene one month after the programme ends." },
    ],
    weeks: [
      { week: "Week 1", title: "The Architecture of the Akashic Field", bullets: ["What the Records are and how to access them", "The difference between intuition and Akashic knowing", "Opening your personal Records for the first time"] },
      { week: "Week 2", title: "Reading Your Primary Soul Contract", bullets: ["Identifying your soul's primary agreement in this lifetime", "The three categories of soul contracts and how to distinguish them", "What your soul chose — and why"] },
      { week: "Week 3", title: "Karmic Patterns and Their Origins", bullets: ["Tracing repeating patterns to their soul-level source", "Past life influences on present circumstances", "The role of karmic debt and how it is resolved"] },
      { week: "Week 4", title: "Dissolution and Release", bullets: ["The five-step Akashic release protocol", "Working with resistant patterns", "Energetic clearing practices for after dissolution"] },
      { week: "Week 5", title: "Soul Contracts in Relationships", bullets: ["Reading the contracts that bind you to key people in your life", "Releasing relationship contracts that have completed", "Inviting the relationships your soul is truly calling for"] },
      { week: "Week 6", title: "Abundance, Receiving, and Soul-Level Blocks", bullets: ["The soul-level origins of scarcity patterning", "Dissolving money contracts and worthiness blocks", "Rewriting your soul's agreement with abundance"] },
      { week: "Week 7", title: "Your Soul's Gifts and Purpose", bullets: ["Reading your soul's innate gifts from the Records", "Understanding your soul's purpose in this lifetime", "Aligning your work and creative expression with soul intention"] },
      { week: "Week 8", title: "Authoring Your Next Chapter", bullets: ["Writing new soul contracts consciously and with integrity", "Establishing a sustainable Akashic practice for life", "Closing ceremony and graduation"] },
    ],
    outcomes: [
      "Read your own and others' Akashic Records with confidence",
      "Identify the soul-level source of your most persistent patterns",
      "Dissolve karmic agreements that have been running your life unconsciously",
      "Consciously author new soul contracts aligned with your next chapter",
      "Establish a daily Akashic practice you will sustain for life",
    ],
    testimonials: [
      { quote: "Soul Contract Mastery was the most transformative eight weeks of my life. Selene is a genuinely gifted teacher and an even more gifted Akashic practitioner. I left a different person.", name: "Christine V.", location: "Amsterdam, Netherlands", context: "Soul Contract Mastery, Cohort 3" },
      { quote: "I had been in therapy for twelve years. Eight weeks with Selene reached things that twelve years of talking never touched. The Akashic Records are astonishing. Selene's teaching of them is even more so.", name: "Marcus L.", location: "Cape Town, South Africa", context: "Soul Contract Mastery, Cohort 5" },
      { quote: "I am now a certified Akashic Records practitioner and Selene's teaching is the foundation of my entire practice. She gives you everything — the theory, the technique, and the wisdom to use both responsibly.", name: "Tara B.", location: "Dublin, Ireland", context: "Soul Contract Mastery, Cohort 2" },
    ],
    bonuses: [
      { title: "The Akashic Inquiry Card Deck (Digital)", description: "72 guided inquiry prompts for working in the Records independently.", value: 97 },
      { title: "Past Life Reading Session with Selene", description: "A private 45-minute recorded reading exploring your most relevant past life for current healing.", value: 397 },
    ],
    faq: [
      { q: "Do I need prior experience with the Akashic Records?", a: "No. The programme begins with the fundamentals and builds systematically. Complete beginners have consistently been among the most powerful students." },
      { q: "How much time will this require each week?", a: "The live session is 2.5 hours. Allow an additional 2–3 hours per week for the workbook practices and community engagement." },
      { q: "What if I miss a live session?", a: "All sessions are recorded and available within 24 hours. Attendance is encouraged but not required." },
      { q: "Is there a money-back guarantee?", a: "Yes. If you complete the first two weeks of the programme and do not feel it is right for you, Selene will refund your investment in full — no questions asked." },
    ],
    guarantee: "Complete the first two weeks. If you don't feel a genuine shift in your relationship with the Records and with yourself, receive a full refund — no questions asked.",
  },

  executive: {
    heroHeadline: "Twelve weeks to build the presence that makes you impossible to ignore",
    heroSubheadline: "The Influence Architecture is a live, small-group intensive with Marcus Ashford for senior leaders, founders, and executives who are ready to systematically close the gap between their capability and their perceived authority.",
    promise: "There is a reason some leaders walk into rooms and immediately command them — and it has almost nothing to do with charisma.",
    promiseBody: "It is a learnable set of presence signals — seven specific inputs that the human brain is wired to read and respond to with authority attribution. Most leaders deploy two or three of these signals naturally. The leaders who operate at the very top of their field have all seven working in concert. The Influence Architecture is the twelve-week intensive that teaches you to engineer all seven — deliberately, measurably, and permanently.",
    includes: [
      { title: "Twelve live weekly sessions with Marcus", description: "90-minute live calls every Thursday lunchtime. All sessions recorded." },
      { title: "Monthly one-on-one strategy call", description: "A 30-minute private call with Marcus each month to calibrate your implementation." },
      { title: "The Influence Architecture Framework", description: "Marcus's complete system — 200 pages of frameworks, case studies, and implementation guides." },
      { title: "The Presence Signal Assessment (Full)", description: "Marcus's proprietary 90-minute diagnostic measuring all seven signals with precision." },
      { title: "Private mastermind access", description: "A cohort of 15 senior leaders — a permanent professional network." },
      { title: "12 months of post-programme strategy briefings", description: "Monthly intelligence briefings from Marcus for twelve months after the programme ends." },
    ],
    weeks: [
      { week: "Weeks 1–2", title: "The Influence Audit", bullets: ["Establishing your baseline across all seven presence signals", "Identifying your highest-ROI signal improvements", "Designing your personalised 12-week architecture"] },
      { week: "Weeks 3–4", title: "Signals 1–2: Spatial Authority and Physical Presence", bullets: ["How your body communicates authority before you speak", "The specific posture, movement, and spatial positioning protocols", "Application across virtual and in-person contexts"] },
      { week: "Weeks 5–6", title: "Signals 3–4: Vocal Architecture and Linguistic Precision", bullets: ["The vocal patterns that signal authority and those that undermine it", "The fifteen linguistic structures that command respect", "Real-time feedback on your specific patterns"] },
      { week: "Weeks 7–8", title: "Signals 5–6: Strategic Silence and Decision Presence", bullets: ["How and when silence increases authority", "Decision-making presence under pressure", "The specific protocols elite leaders use before high-stakes interactions"] },
      { week: "Weeks 9–10", title: "Signal 7: Narrative Authority", bullets: ["Building the personal narrative that positions you as indispensable", "The three-layer story architecture for executive communication", "Application to pitches, board presentations, and media"] },
      { week: "Weeks 11–12", title: "Architecture Integration and Long-Game Design", bullets: ["Integrating all seven signals into a coherent, natural presence", "Designing your influence architecture for the next 3–5 years", "Final assessment and graduation"] },
    ],
    outcomes: [
      "Deploy all seven presence signals with precision in every professional context",
      "Close the gap between your technical capability and your perceived authority",
      "Command virtual and in-person rooms before you open your mouth",
      "Navigate high-stakes interactions — board meetings, pitches, media — with measurable confidence",
      "Design a 5-year influence architecture for the leadership level you are moving toward",
    ],
    testimonials: [
      { quote: "Marcus is the first executive coach I have encountered who can tell me not just what to change, but precisely why it works neurologically. The framework is rigorous, the results are immediate, and the cohort is exceptional.", name: "Helena W.", location: "London, UK", context: "The Influence Architecture, Cohort 4" },
      { quote: "I was promoted to Managing Director three months into the programme. My MD told me, unprompted, that my 'presence in meetings had completely changed'. That was the framework working.", name: "James K.", location: "Sydney, Australia", context: "The Influence Architecture, Cohort 6" },
      { quote: "I came in as a founder who had built a great company but couldn't raise institutional capital. Eight weeks in, I closed our Series B. Marcus's framework changed how investors perceive me before I say a word.", name: "Priya M.", location: "Singapore", context: "The Influence Architecture, Cohort 7" },
    ],
    bonuses: [
      { title: "The Influence Architecture App (12-Month Access)", description: "Marcus's mobile tool for daily signal tracking, protocol reminders, and performance metrics.", value: 497 },
      { title: "VIP Strategy Day with Marcus (Virtual)", description: "A private 3-hour strategy intensive with Marcus at the conclusion of the programme.", value: 2997 },
    ],
    faq: [
      { q: "Is this suitable for senior leaders or earlier-career professionals?", a: "The programme is designed for Director level and above, and for founders at Series A and beyond. A strong track record is assumed — this is not a foundational leadership programme." },
      { q: "How much time is required each week?", a: "The live session is 90 minutes. Implementation typically requires 2–3 hours per week in real professional contexts — not additional homework." },
      { q: "Is this available virtually?", a: "Yes, entirely. All sessions are live on Zoom. The framework is equally rigorous for virtual presence engineering." },
      { q: "What is the guarantee?", a: "If you complete the first four weeks and implement the protocols without experiencing measurable improvement in how you are perceived, Marcus will refund your full investment." },
    ],
    guarantee: "Complete the first four weeks and implement the protocols. If your colleagues and peers do not comment unprompted on a change in your presence, receive a full refund.",
  },

  wellness: {
    heroHeadline: "Eight weeks to regulate your nervous system and feel genuinely at home in yourself",
    heroSubheadline: "The Somatic Freedom Collective is a live, small-group programme with Aria Bloom for people who are ready to stop managing their nervous system and start trusting it.",
    promise: "The peace you have been chasing through mindset work, therapy, and self-help already lives in your body.",
    promiseBody: "The nervous system is not your enemy — it is your most loyal protector, doing exactly what it learned to do to keep you safe. The Somatic Freedom Collective teaches you to work with it rather than against it: to complete the interrupted responses it has been holding for years, to restore the felt sense of safety that makes real presence possible, and to build a body-based practice that sustains you through anything life brings.",
    includes: [
      { title: "Eight live weekly sessions with Aria", description: "3-hour somatic immersions every Sunday morning. All sessions recorded." },
      { title: "Bi-weekly nervous system check-ins", description: "Small-group integration calls between sessions for accountability and support." },
      { title: "The Somatic Freedom Practice Library", description: "Over 40 guided somatic practices — audio and video — for daily use." },
      { title: "The Sensitivity Handbook", description: "Aria's complete resource for high-sensitivity people — 150 pages." },
      { title: "Private community access", description: "A warm, moderated space for peer support between sessions." },
      { title: "Post-programme integration month", description: "Four weeks of integration support with Aria after the formal programme ends." },
    ],
    weeks: [
      { week: "Week 1", title: "Meeting Your Nervous System", bullets: ["Understanding polyvagal theory in plain language", "Mapping your personal nervous system states", "Your first daily somatic practice"] },
      { week: "Week 2", title: "Orienting to Safety", bullets: ["The physiological foundations of felt safety", "Orienting practices for daily regulation", "Working with the window of tolerance"] },
      { week: "Week 3", title: "Completing Incomplete Responses", bullets: ["What incomplete responses are and how they accumulate", "The somatic completion sequence", "Identifying and moving through your specific held patterns"] },
      { week: "Week 4", title: "Embodied Boundaries", bullets: ["The body's intelligence around limit-setting", "Somatic practices for healthy boundary expression", "Reclaiming the no that lives in your body"] },
      { week: "Week 5", title: "Emotions as Sensation", bullets: ["Working with emotion somatically rather than cognitively", "The specific somatic signatures of grief, fear, anger, and joy", "Allowing emotion to move without being overwhelmed by it"] },
      { week: "Week 6", title: "Somatic Presence in Relationships", bullets: ["How our nervous systems co-regulate with others", "Maintaining presence in difficult interactions", "Choosing connection without losing self"] },
      { week: "Week 7", title: "The Body's Intelligence in Daily Life", bullets: ["Reading somatic signals as guidance", "Integrating embodiment into work, creativity, and parenting", "The high-sensitivity person's guide to sustainable living"] },
      { week: "Week 8", title: "Building Your Lifelong Practice", bullets: ["Designing a somatic practice that will sustain you for life", "Working with future activation using your new tools", "Closing ceremony and celebration"] },
    ],
    outcomes: [
      "Understand and work with your nervous system rather than fighting it",
      "Build a daily somatic practice that you will maintain for life",
      "Complete the interrupted responses your body has been holding for years",
      "Feel genuinely at ease in your body — not just better at managing symptoms",
      "Have tools for navigating difficult emotions and interactions from a regulated state",
    ],
    testimonials: [
      { quote: "The Somatic Freedom Collective is the first programme that has genuinely changed my relationship with my body. Eight weeks ago I felt like a stranger in my own skin. Now I feel like I am home.", name: "Rachel T.", location: "Bristol, UK", context: "Somatic Freedom Collective, Cohort 2" },
      { quote: "I am a somatic therapist myself, and I found Aria's teaching profoundly enriching both personally and professionally. Her capacity to hold space for a group is extraordinary.", name: "Dr. Leila M.", location: "Toronto, Canada", context: "Somatic Freedom Collective, Cohort 4" },
      { quote: "I cried in the first session. I laughed in the last one. In between, something fundamental shifted in how I inhabit my life. Aria is a genuinely gifted teacher.", name: "Yuki A.", location: "Tokyo, Japan", context: "Somatic Freedom Collective, Cohort 5" },
    ],
    bonuses: [
      { title: "The 30-Day Somatic Morning Practice Audio Series", description: "30 guided somatic morning practices — one for each day of the first post-programme month.", value: 147 },
      { title: "Private Somatic Session with Aria", description: "A private 60-minute recorded somatic session with Aria to work on your specific patterns.", value: 497 },
    ],
    faq: [
      { q: "Do I need any prior somatic experience?", a: "No. The programme begins with the foundations. Many of the most powerful transformations have come from complete beginners." },
      { q: "Is this suitable if I have a trauma history?", a: "Yes, and Aria's approach is specifically trauma-informed. All practices are offered as invitations. You always set the pace." },
      { q: "How much time will I need each week?", a: "The live session is 3 hours on Sunday mornings. The bi-weekly check-in calls are 60 minutes. Daily practice is 15–20 minutes." },
      { q: "What is the guarantee?", a: "Complete the first two weeks. If you don't feel a meaningful shift in your relationship with your body, receive a full refund." },
    ],
    guarantee: "Complete the first two weeks and do the daily practices. If you don't feel a genuine difference in how you inhabit your body, receive a full refund — no questions asked.",
  },

  highperf: {
    heroHeadline: "Ten weeks to build the cognitive architecture of a top-1% performer",
    heroSubheadline: "The Peak Protocol is a live, small-cohort programme with Kai Mercer for founders and operators who are ready to move from high performance to elite performance — and have the data to prove it.",
    promise: "Your cognitive ceiling is not fixed. It is engineered — and right now, most of the engineering is working against you.",
    promiseBody: "The average high-achiever operates at 60–70% of their actual cognitive capacity — not because of a lack of discipline, intelligence, or effort, but because the biological infrastructure supporting cognition has never been deliberately engineered. The Peak Protocol is the ten-week programme that changes this. Every protocol is evidence-based, every outcome is measurable, and every implementation is calibrated to your specific cognitive profile.",
    includes: [
      { title: "Ten live weekly sessions with Kai", description: "90-minute live protocol sessions every Wednesday. All sessions recorded." },
      { title: "Monthly one-on-one performance call", description: "A 30-minute private calibration call with Kai each month." },
      { title: "The Cognitive Edge Protocol Library", description: "Complete access to all 40+ evidence-based protocols with implementation guides." },
      { title: "Weekly performance tracking dashboard", description: "Kai's proprietary tool for measuring cognitive performance metrics in real time." },
      { title: "Private cohort access", description: "A high-signal community of 12 founders and operators — a permanent network." },
      { title: "Post-programme performance audit", description: "A 45-minute recorded review of your performance data at programme completion." },
    ],
    weeks: [
      { week: "Weeks 1–2", title: "Baseline and Bottleneck Identification", bullets: ["Your personalised cognitive performance audit", "Identifying your specific bottleneck in the six-lever model", "Designing your personalised 10-week protocol stack"] },
      { week: "Weeks 3–4", title: "Deep Work Architecture", bullets: ["Engineering 4-hour deep work blocks that actually produce output", "The attention reset protocol", "Calendar and environment design for sustained focus"] },
      { week: "Weeks 5–6", title: "Decision Quality and Cognitive Load", bullets: ["The decision fatigue elimination protocol", "Cognitive load audit and offloading system design", "High-stakes decision frameworks from special operations"] },
      { week: "Weeks 7–8", title: "Stress Calibration and Recovery", bullets: ["The stress-as-performance-input model", "Recovery engineering for sustained elite output", "The 72-hour performance cycle optimisation"] },
      { week: "Weeks 9–10", title: "Integration and Long-Game Architecture", bullets: ["Building a self-sustaining cognitive performance system", "Protocol handoff for team and organisational deployment", "Final performance audit and 12-month architecture design"] },
    ],
    outcomes: [
      "Identify and eliminate your specific cognitive bottleneck with precision",
      "Build a deep work architecture that produces measurably more in fewer hours",
      "Eliminate the decision fatigue patterns costing you performance daily",
      "Design a cognitive system that improves rather than degrades under sustained high performance",
      "Have a permanent protocol library calibrated to your specific cognitive profile",
    ],
    testimonials: [
      { quote: "The Peak Protocol gave me back 2.5 hours of effective output per day. I tracked it. That compounds to over 900 hours a year. The ROI is impossible to overstate.", name: "Sofia M.", location: "Berlin, Germany", context: "Peak Protocol, Cohort 3" },
      { quote: "I've hired performance coaches before. Kai is in a different category. Every protocol is cited, every outcome is measurable, and every calibration is specific to your actual situation. Nothing generic.", name: "Tom W.", location: "New York, USA", context: "Peak Protocol, Cohort 5" },
      { quote: "My team asked me what had changed after week four. I hadn't told them about the programme. That's how you know it's real.", name: "Ananya R.", location: "Bangalore, India", context: "Peak Protocol, Cohort 6" },
    ],
    bonuses: [
      { title: "The Cognitive Performance App (12-Month Access)", description: "Kai's mobile performance tracking tool — daily protocol reminders, output metrics, and weekly reviews.", value: 297 },
      { title: "Team Protocol Workshop", description: "A 90-minute live session with Kai to roll out the core protocols with your team.", value: 1497 },
    ],
    faq: [
      { q: "Is this biohacking content?", a: "No. The Peak Protocol is grounded in cognitive neuroscience and behavioural performance science. No supplements, devices, or biohacks are involved." },
      { q: "How much time is required each week?", a: "The live session is 90 minutes. Protocol implementation is integrated into your existing schedule — this is by design." },
      { q: "Is this right for executives as well as founders?", a: "Yes. The protocol stack is calibrated to your specific role and cognitive profile in week one." },
      { q: "What is the guarantee?", a: "Track your performance metrics using Kai's dashboard for four weeks. If you cannot demonstrate measurable improvement, receive a full refund." },
    ],
    guarantee: "Track your performance metrics for four weeks. If you cannot demonstrate a measurable improvement in your primary cognitive output metric, receive a full refund.",
  },

  abundance: {
    heroHeadline: "Nine weeks to build a business that receives as powerfully as it gives",
    heroSubheadline: "Quantum Business Expansion is a live, intimate programme with Zoe Tanaka for purpose-led coaches, creatives, and practitioners who are ready to build real, sustained abundance — without sacrificing their soul to do it.",
    promise: "The gap between what you offer and what you earn is not a marketing problem. It is a receivership problem.",
    promiseBody: "You cannot out-strategy an energetic ceiling. If your nervous system, your belief system, or the invisible field around your business is calibrated to receive a certain amount — that is what you will receive, regardless of your tactics. Quantum Business Expansion addresses the root. Nine weeks of energetic clearing, quantum field work, and concrete business strategy — integrated so that when the field opens, the strategy lands.",
    includes: [
      { title: "Nine live weekly sessions with Zoe", description: "3-hour live calls every Friday afternoon. All sessions recorded." },
      { title: "Monthly quantum field clearing ceremony", description: "A group energetic clearing and transmission specifically calibrated for business abundance." },
      { title: "The Quantum Business Blueprint", description: "Zoe's complete business strategy framework — 180 pages of aligned marketing, pricing, and sales guidance." },
      { title: "Private sisterhood community", description: "A sacred, moderated space for peer support, accountability, and celebration." },
      { title: "The Receivership Ritual Kit", description: "Zoe's complete daily practice system for sustaining an open abundance field." },
      { title: "Post-programme integration month", description: "Four weeks of community support and bi-weekly group calls after the programme ends." },
    ],
    weeks: [
      { week: "Week 1", title: "Mapping Your Abundance Field", bullets: ["Identifying the specific energetic patterns capping your income", "The quantum business audit", "Establishing your receivership baseline"] },
      { week: "Week 2", title: "The Clearing", bullets: ["Group quantum field clearing ceremony", "Releasing inherited poverty and scarcity programming", "Opening to a new receivership set point"] },
      { week: "Week 3", title: "Worth, Pricing, and Permission", bullets: ["Pricing from energetic worth rather than market fear", "The permission structures that determine what you allow yourself to receive", "Raising your prices in alignment"] },
      { week: "Week 4", title: "Aligned Marketing", bullets: ["The energetically aligned content creation system", "Speaking to the soul of your ideal client rather than their pain point", "Visibility as an act of service rather than a performance"] },
      { week: "Week 5", title: "Sacred Sales", bullets: ["Selling from service rather than scarcity", "The aligned enrolment conversation", "Releasing the fear of the 'no'"] },
      { week: "Week 6", title: "Quantum Offer Design", bullets: ["Designing offers that match your energetic field and your client's transformation", "The signature offer architecture", "Quantum pricing — charging at the level of the transformation"] },
      { week: "Week 7", title: "Sustainable Receivership", bullets: ["The daily practice system for maintaining an open abundance field", "Working with financial triggers and setbacks energetically", "The monthly wealth ceremony"] },
      { week: "Week 8", title: "Your Abundant Business Architecture", bullets: ["Designing the business model that sustains you without depleting you", "The seasons of a soulful business", "Planning your next quantum leap"] },
      { week: "Week 9", title: "Integration and Expansion", bullets: ["Integrating energy and strategy into a coherent, living system", "Your personal abundance declaration", "Closing ceremony and graduation"] },
    ],
    outcomes: [
      "Clear the specific energetic pattern that has been capping your income",
      "Price your offers from energetic worth rather than market fear",
      "Build an aligned marketing system that attracts premium clients without hustle",
      "Establish a daily receivership practice that sustains your abundance field",
      "Design a business model that nourishes rather than depletes you",
    ],
    testimonials: [
      { quote: "I had my first five-figure month in the third week of QBE. Not because I changed my marketing. Because I finally cleared what was blocking the marketing I already had from landing.", name: "Lauren T.", location: "Austin, USA", context: "Quantum Business Expansion, Cohort 3" },
      { quote: "Zoe is the only business mentor I've found who truly understands that energy and strategy are not separate. Her programme gave me both — and they work beautifully together.", name: "Natalia S.", location: "Amsterdam, Netherlands", context: "Quantum Business Expansion, Cohort 5" },
      { quote: "I raised my prices by 40% in week three and filled my programme to capacity. The energetic work was the missing piece I hadn't known to look for.", name: "Grace O.", location: "Lagos, Nigeria", context: "Quantum Business Expansion, Cohort 6" },
    ],
    bonuses: [
      { title: "The Quantum Pricing Calculator", description: "Zoe's tool for identifying the energetically aligned price point for any offer.", value: 197 },
      { title: "Private Field Clearing Session with Zoe", description: "A private 60-minute recorded quantum clearing targeted at your specific abundance blocks.", value: 597 },
    ],
    faq: [
      { q: "Is this a business training or a spiritual programme?", a: "It is both, in equal measure and fully integrated. If you are looking for purely tactical business training, this programme is not the right fit. If you know that strategy alone has not been the answer, you are in the right place." },
      { q: "Do I need an existing business to join?", a: "Yes. This programme is most impactful for coaches, creatives, and practitioners who already have an offer and some clients, and want to scale in alignment." },
      { q: "How much time is required each week?", a: "The live session is 3 hours on Friday afternoons. Daily receivership practice is 20–30 minutes. Community engagement is optional but highly recommended." },
      { q: "What is the guarantee?", a: "Complete the first three weeks and do the energetic practices. If you don't feel a genuine shift in your relationship with receiving, receive a full refund." },
    ],
    guarantee: "Complete the first three weeks and do the energetic practices. If you do not feel a genuine shift in your relationship with money and receiving, receive a full refund — no questions asked.",
  },

  earth: {
    heroHeadline: "Twelve weeks to heal your lineage and reclaim the power it has been holding for you",
    heroSubheadline: "Ancestral Wisdom Path is a live, ceremonial programme with River Stone for people who feel the call to heal not just themselves, but the line that runs through them.",
    promise: "Your healing is not just for you. It is for everyone who came before you, and everyone who will come after.",
    promiseBody: "Ancestral work is the most powerful and least understood healing modality of our time. When you heal a pattern in yourself, you heal it in the lineage — backwards to its origin and forward through all who will carry your blood or your teaching. The Ancestral Wisdom Path is twelve weeks of ceremonial work, traditional teaching, and deep personal healing guided by River Stone — a practitioner who has been trained in three lineages over twenty years.",
    includes: [
      { title: "Twelve live weekly ceremonial sessions with River", description: "4-hour ceremonial gatherings every Saturday morning. All sessions recorded." },
      { title: "Seasonal solstice and equinox ceremonies", description: "Full group ceremonies at each seasonal turning point during the programme." },
      { title: "The Ancestral Wisdom Teachings", description: "River's complete written teachings — drawn from three living traditions, 200 pages." },
      { title: "Monthly one-on-one ancestral consultation", description: "A private 45-minute session with River to work specifically with your lineage." },
      { title: "Sacred community access", description: "A private, moderated ceremonial space for sharing, support, and peer connection." },
      { title: "Post-programme integration season", description: "Three months of community access and monthly group ceremonies after the formal programme ends." },
    ],
    weeks: [
      { week: "Weeks 1–2", title: "Opening the Line", bullets: ["Preparing your altar and ceremonial space", "The ancestral opening prayer — learning and embodying it", "Meeting the ancestors who are ready to work with you"] },
      { week: "Weeks 3–4", title: "The Gifts in the Wound", bullets: ["Identifying the gifts that are encoded in your lineage's wounds", "Understanding intergenerational transmission — how patterns travel", "Beginning the ancestral healing sequence"] },
      { week: "Weeks 5–6", title: "Earth Medicine", bullets: ["The traditional earth connection practices from three lineages", "Working with the land as a living teacher", "Seasonal medicine and the intelligence of the natural year"] },
      { week: "Weeks 7–8", title: "The Healing Ceremony", bullets: ["River-guided ancestral healing ceremony for the full group", "Individual transmission work for each participant", "The integration practices that anchor the healing"] },
      { week: "Weeks 9–10", title: "Reclaiming the Gifts", bullets: ["Activating the dormant gifts encoded in your lineage", "The gratitude ceremony for those who carried you forward", "Bringing ancestral wisdom into your work and creative expression"] },
      { week: "Weeks 11–12", title: "The Living Practice", bullets: ["Building a daily ancestral practice you will sustain for life", "Passing the medicine forward — responsible transmission", "Closing ceremony, graduation, and ancestral blessing"] },
    ],
    outcomes: [
      "Open and sustain a living relationship with your ancestral lineage",
      "Heal the specific patterns that have been transmitted through your family line",
      "Reclaim the gifts and strengths that your lineage has been holding for you",
      "Build a daily earth connection and ancestral practice you will maintain for life",
      "Understand how to pass this medicine forward responsibly",
    ],
    testimonials: [
      { quote: "The Ancestral Wisdom Path changed my understanding of who I am and where I come from at the deepest level. River is a genuinely gifted practitioner and a profound teacher. I am forever different.", name: "Elena V.", location: "Copenhagen, Denmark", context: "Ancestral Wisdom Path, Cohort 2" },
      { quote: "I am a third-generation immigrant who felt completely severed from my ancestral roots before this programme. Twelve weeks with River restored that connection. I cannot measure what that is worth.", name: "Samuel O.", location: "Toronto, Canada", context: "Ancestral Wisdom Path, Cohort 3" },
      { quote: "River holds the most rigorous, authentic, and respectful ceremonial container I have encountered in twenty years of earth-based practice. This programme is the real thing.", name: "Maria T.", location: "Mexico City, Mexico", context: "Ancestral Wisdom Path, Cohort 4" },
    ],
    bonuses: [
      { title: "The Seasonal Ceremony Collection", description: "River's complete guide to the eight seasonal ceremonies — solstices, equinoxes, and cross-quarter days — with full ceremonial protocols.", value: 247 },
      { title: "Private Ancestral Session with River", description: "A private 75-minute recorded ancestral consultation to work specifically with your lineage.", value: 597 },
    ],
    faq: [
      { q: "Do I need to know my ancestral lineage to participate?", a: "No. River works with whatever connection is available to you — whether detailed or fragmentary. The ancestors find ways to communicate regardless." },
      { q: "Is this practice from a specific tradition?", a: "River draws from three lineages with their explicit permission. The teachings are respectful of each tradition's protocols and boundaries." },
      { q: "How much time is required each week?", a: "The live ceremonial session is 4 hours on Saturday mornings. Daily earth connection practice is 15–20 minutes. Altar maintenance is 5–10 minutes daily." },
      { q: "What is the guarantee?", a: "Complete the first four weeks and engage with the daily practices. If you do not feel a genuine deepening of your relationship with your ancestral line, receive a full refund." },
    ],
    guarantee: "Complete the first four weeks and do the daily practices. If you do not feel a genuine connection with your ancestral lineage beginning to deepen, receive a full refund — no questions asked.",
  },
};

function s(theme: ThemeConfig) {
  return {
    page: { background: theme.colors.canvas, color: theme.colors.text, fontFamily: theme.fonts.bodyFamily } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = PROGRAM_COPY[themeSlug];
  const checkoutHref = `/themes/${themeSlug}/program-checkout`;

  const totalBonusValue = copy.bonuses.reduce((s, b) => s + b.value, 0);

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={{ ...styles.darkBg, padding: "100px 40px 80px", textAlign: "center" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "20px" }}>
          {theme.program.duration} Live Programme
        </p>
        <h1 style={{ ...styles.displayFont, fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.15, maxWidth: "840px", margin: "0 auto 20px" }}>
          {copy.heroHeadline}
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.8, maxWidth: "580px", margin: "0 auto 48px", lineHeight: 1.65 }}>
          {copy.heroSubheadline}
        </p>

        {/* PRICE CARD */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${theme.colors.highlight}40`,
            borderRadius: "20px",
            padding: "36px 48px",
            display: "inline-block",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.highlight, marginBottom: "12px" }}>
            Enrolment now open
          </p>
          <div style={{ fontSize: "3.5rem", fontWeight: 800, fontFamily: theme.fonts.displayFamily, lineHeight: 1 }}>
            ${theme.program.price.toLocaleString()}
          </div>
          <div style={{ opacity: 0.6, marginBottom: "24px", fontSize: "14px" }}>
            or {theme.program.paymentPlan}
          </div>
          <Link
            href={checkoutHref}
            style={{
              display: "block",
              background: theme.colors.highlight,
              color: theme.colors.dark,
              padding: "16px 40px",
              borderRadius: "100px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Enrol now →
          </Link>
        </div>
      </section>

      {/* PROMISE */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, marginBottom: "24px", lineHeight: 1.3 }}>
          {copy.promise}
        </h2>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.75, opacity: 0.85 }}>{copy.promiseBody}</p>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ ...styles.darkBg, padding: "80px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
            What's included
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {copy.includes.map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: theme.colors.highlight, marginBottom: "10px", fontSize: "20px" }}>✦</div>
                <h3 style={{ ...styles.displayFont, fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>{item.title}</h3>
                <p style={{ margin: 0, opacity: 0.65, fontSize: "0.9rem", lineHeight: 1.55 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
          The curriculum
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {copy.weeks.map((week, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${theme.colors.text}15` }}>
              <summary
                style={{
                  padding: "20px 0",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  fontWeight: 600,
                }}
              >
                <span>
                  <span style={{ color: theme.colors.accent, fontSize: "13px", marginRight: "12px", fontFamily: theme.fonts.accentFamily ?? theme.fonts.bodyFamily }}>{week.week}</span>
                  {week.title}
                </span>
                <span style={{ color: theme.colors.accent, flexShrink: 0, fontSize: "20px" }}>+</span>
              </summary>
              <ul style={{ paddingBottom: "20px", paddingLeft: "20px", opacity: 0.75 }}>
                {week.bullets.map((b, j) => <li key={j} style={{ marginBottom: "6px", lineHeight: 1.55, fontSize: "0.95rem" }}>{b}</li>)}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* OUTCOMES */}
      <section style={{ background: `${theme.colors.accent}10`, borderTop: `1px solid ${theme.colors.accent}20`, borderBottom: `1px solid ${theme.colors.accent}20`, padding: "72px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "36px", textAlign: "center" }}>
            What you will leave with
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {copy.outcomes.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ color: theme.colors.accent, fontWeight: 700, fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>✓</span>
                <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.6 }}>{o}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ ...styles.darkBg, padding: "80px 40px" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, textAlign: "center", marginBottom: "48px" }}>
          From past participants
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {copy.testimonials.map((t, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "28px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontStyle: "italic", lineHeight: 1.65, marginBottom: "20px", opacity: 0.9, fontSize: "0.95rem" }}>"{t.quote}"</p>
              <cite style={{ fontStyle: "normal", fontSize: "13px" }}>
                <span style={{ fontWeight: 700 }}>{t.name}</span>
                <span style={{ opacity: 0.5 }}> · {t.location}</span>
                <br />
                <span style={{ opacity: 0.4, fontSize: "11px" }}>{t.context}</span>
              </cite>
            </div>
          ))}
        </div>
      </section>

      {/* BONUSES */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
          Bonuses — included when you enrol now
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          {copy.bonuses.map((b, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", padding: "24px", background: `${theme.colors.highlight}15`, borderRadius: "14px", border: `1px solid ${theme.colors.highlight}30` }}>
              <div>
                <h3 style={{ ...styles.displayFont, fontWeight: 700, marginBottom: "6px" }}>{b.title}</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem", lineHeight: 1.5 }}>{b.description}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "11px", textDecoration: "line-through", opacity: 0.45 }}>Value</div>
                <div style={{ fontWeight: 800, color: theme.colors.accent, fontFamily: theme.fonts.displayFamily }}>${b.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: "13px", opacity: 0.5 }}>
          Total bonus value: ${totalBonusValue.toLocaleString()} — included at no additional cost
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ ...styles.darkBg, padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "48px" }}>
          Enrolment
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", maxWidth: "800px", margin: "0 auto 40px" }}>
          {[
            { label: "Full investment", amount: `$${theme.program.price.toLocaleString()}`, sub: "One payment · Best value", recommended: true },
            { label: "Payment plan", amount: theme.program.paymentPlan, sub: "Spread over 3 months", recommended: false },
          ].map((plan) => (
            <div
              key={plan.label}
              style={{
                background: plan.recommended ? theme.colors.highlight : "rgba(255,255,255,0.06)",
                color: plan.recommended ? theme.colors.dark : "#fff",
                borderRadius: "16px",
                padding: "32px",
                border: plan.recommended ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {plan.recommended && <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Most popular</div>}
              <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "8px" }}>{plan.label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: theme.fonts.displayFamily, marginBottom: "8px" }}>{plan.amount}</div>
              <div style={{ fontSize: "12px", opacity: 0.6 }}>{plan.sub}</div>
            </div>
          ))}
        </div>
        <Link href={checkoutHref} style={{ display: "inline-block", background: theme.colors.highlight, color: theme.colors.dark, padding: "18px 48px", borderRadius: "100px", textDecoration: "none", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>
          Enrol in {theme.program.name} →
        </Link>
        <div style={{ fontSize: "13px", opacity: 0.5, maxWidth: "400px", margin: "0 auto" }}>
          {copy.guarantee}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 40px", maxWidth: "720px", margin: "0 auto" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "40px", textAlign: "center" }}>
          Questions
        </h2>
        <div>
          {copy.faq.map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${theme.colors.text}15` }}>
              <summary style={{ padding: "20px 0", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
                {item.q}
                <span style={{ color: theme.colors.accent, flexShrink: 0, marginLeft: "16px" }}>+</span>
              </summary>
              <p style={{ paddingBottom: "20px", opacity: 0.75, lineHeight: 1.65, margin: 0, fontSize: "0.95rem" }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: theme.colors.accent, color: "#fff", padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ ...styles.displayFont, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: "16px" }}>
          Ready to begin?
        </h2>
        <p style={{ opacity: 0.85, marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
          Enrolment closes when the programme begins. Cohort size is limited.
        </p>
        <Link href={checkoutHref} style={{ display: "inline-block", background: theme.colors.highlight, color: theme.colors.dark, padding: "18px 48px", borderRadius: "100px", textDecoration: "none", fontWeight: 700, fontSize: "16px" }}>
          Enrol now →
        </Link>
      </section>

      <footer style={{ ...styles.darkBg, padding: "32px 40px", textAlign: "center", fontSize: "12px", opacity: 0.4 }}>
        <p>Results mentioned are individual and not typical. {copy.guarantee}</p>
        <p style={{ marginTop: "12px" }}>© {new Date().getFullYear()} {theme.host.legalEntity}</p>
      </footer>
    </main>
  );
}
