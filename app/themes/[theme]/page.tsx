import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import type { ThemeConfig } from "@/lib/themes";

function s(theme: ThemeConfig) {
  return {
    page: {
      background: theme.colors.canvas,
      color: theme.colors.text,
      fontFamily: theme.fonts.bodyFamily,
    } as React.CSSProperties,
    displayFont: { fontFamily: theme.fonts.displayFamily } as React.CSSProperties,
    accent: { color: theme.colors.accent } as React.CSSProperties,
    highlight: { color: theme.colors.highlight } as React.CSSProperties,
    accentBg: { background: theme.colors.accent } as React.CSSProperties,
    darkBg: { background: theme.colors.dark, color: "#fff" } as React.CSSProperties,
  };
}

// THEME-SPECIFIC COPY
const THEME_COPY: Record<string, {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCredibility: string;
  audienceHeadline: string;
  audience: string[];
  valueHeadline: string;
  valueParagraph: string;
  outcomes: string[];
  testimonials: { quote: string; name: string; location: string }[];
  howItWorks: { step: string; title: string; description: string }[];
  faq: { q: string; a: string }[];
  bioClosing: string;
}> = {
  sacred: {
    heroEyebrow: "Live Online Ceremony",
    heroHeadline: "Read the records your soul has been keeping for lifetimes.",
    heroSubheadline: "Join Selene Voss for a live Akashic ceremony where you will touch the truth beneath the story you've been telling yourself — and receive the transmission that allows you to finally let it go.",
    heroCredibility: '"This was the most powerful spiritual experience of my life. My whole nervous system shifted in real time." — Priya M., Auckland',
    audienceHeadline: "This gathering is for you if...",
    audience: [
      "You feel like you keep attracting the same patterns no matter how much inner work you do",
      "You sense there is a deeper reason for the blocks in your relationships, abundance, or health",
      "You have explored spirituality but have never accessed the Akashic Records before",
      "You are ready for a direct soul-level transmission — not just information",
      "You know something is shifting in your life and want guidance from the highest source available",
    ],
    valueHeadline: "What the Akashic Records can show you",
    valueParagraph: "The Akashic Records are the energetic archive of every soul's journey — every choice, every wound, every gift, every agreement. When you open them with skill and intention, you receive information that your conscious mind simply cannot access on its own. In this live ceremony, Selene will guide the group through a collective opening, and then offer individual transmissions for those called forward. What emerges is always precise, always loving, and often life-changing.",
    outcomes: [
      "Identify the soul-level contracts driving your repeating patterns",
      "Receive a direct energetic transmission from your Records",
      "Understand how your past lives are influencing your present circumstances",
      "Release karmic agreements that are no longer serving your highest path",
      "Leave with a clear sense of your soul's next step",
    ],
    testimonials: [
      { quote: "Selene read something in my Records that I had never told another living person. I wept for twenty minutes and felt ten years lighter. This is real.", name: "Catherine B.", location: "Dublin, Ireland" },
      { quote: "I came in as a sceptic. I left as a believer. The information was too specific and too accurate to dismiss. Selene's gift is extraordinary.", name: "James K.", location: "Vancouver, Canada" },
      { quote: "My Akashic reading with Selene was the turning point in my healing journey. Everything shifted after that session.", name: "Nalini S.", location: "Mumbai, India" },
    ],
    howItWorks: [
      { step: "1", title: "Register & Receive", description: "Secure your place at the ceremony and receive your preparation guide — how to arrive energetically open and ready to receive." },
      { step: "2", title: "Join the Live Ceremony", description: "Selene opens the Records for the group and leads a collective transmission. Individual readings are offered to those called forward." },
      { step: "3", title: "Integrate the Transmission", description: "Leave with a recording of the ceremony and a personalised integration practice to anchor what your soul received." },
    ],
    faq: [
      { q: "Do I need to know anything about the Akashic Records to attend?", a: "Not at all. This ceremony is perfect for complete beginners. Selene will explain everything you need to know before the Records are opened." },
      { q: "Will I receive a personal reading?", a: "The ceremony includes a collective transmission for everyone present. Selene will also offer individual readings to several participants during the live session, and all attendees receive a full recording." },
      { q: "Is this ceremony right for me if I am not spiritual?", a: "Many people who attend describe themselves as spiritual-but-not-religious, or even sceptical. The Akashic Records work regardless of belief system. Curiosity is the only requirement." },
      { q: "What if I can't attend live?", a: "A full recording of the ceremony will be available within 24 hours of the live event. The energetic transmission is just as potent whether you watch live or replay." },
    ],
    bioClosing: "She makes the invisible visible, and the unbearable bearable. — From a participant in Cologne",
  },

  executive: {
    heroEyebrow: "Live Online Strategy Session",
    heroHeadline: "Most leaders are technically brilliant and strategically invisible.",
    heroSubheadline: "Join Marcus Ashford for a live executive strategy session where you will learn the specific presence signals that determine who gets promoted, who gets funded, and who gets followed — and how to deploy them starting this week.",
    heroCredibility: '"Marcus changed how I walk into a room. Within ninety days I had closed our Series A. The ROI on this session was extraordinary." — David L., CEO, Series A SaaS',
    audienceHeadline: "This session is for you if...",
    audience: [
      "You are technically excellent but feel overlooked when it comes to leadership opportunities",
      "You know you have more to contribute than your current role allows",
      "You want to understand what separates a 'good leader' from an 'indispensable one'",
      "You have tried communication training but found it generic and forgettable",
      "You are ready for a strategic framework, not motivational content",
    ],
    valueHeadline: "The Influence Architecture framework",
    valueParagraph: "After studying 400 top-1% executives across financial services, technology, healthcare, and government, Marcus identified the seven presence signals that consistently predict who rises and who stalls — regardless of technical ability, industry, or personality type. These signals are learnable, measurable, and deployable in any professional context. This session gives you the complete framework and the tools to apply it immediately.",
    outcomes: [
      "Understand the seven presence signals that determine perceived authority",
      "Identify which signals you are currently underutilising",
      "Leave with a 90-day influence architecture plan",
      "Know how to command a room before you open your mouth",
      "Have a clear strategy to accelerate your next promotion or funding round",
    ],
    testimonials: [
      { quote: "I've done leadership training at Harvard and Wharton. Marcus's framework is more practical and more immediately applicable than anything I encountered there.", name: "Sarah T.", location: "New York, USA" },
      { quote: "Within six weeks of implementing the Influence Architecture, I was invited to join the board. I attribute that directly to what I learned from Marcus.", name: "Robert A.", location: "London, UK" },
      { quote: "Marcus has a rare ability to tell you the truth you've been avoiding in a way that motivates rather than discourages. This session was a turning point.", name: "Mei L.", location: "Singapore" },
    ],
    howItWorks: [
      { step: "1", title: "Register & Pre-work", description: "Complete a brief influence audit before the session so you arrive knowing exactly which signals are currently costing you authority." },
      { step: "2", title: "Join the Live Session", description: "Marcus delivers the Influence Architecture framework and responds to live case studies from participants in real time." },
      { step: "3", title: "Implement with Precision", description: "Leave with a personalised 90-day implementation roadmap and access to the session recording and framework templates." },
    ],
    faq: [
      { q: "Is this relevant for senior leaders, or is it aimed at earlier-career professionals?", a: "The Influence Architecture is most impactful for leaders at the Director level and above, and for founders. That said, the framework is relevant at any career stage where strategic visibility matters." },
      { q: "How is this different from standard executive coaching?", a: "Most executive coaching focuses on behaviour change. The Influence Architecture focuses on signal engineering — the specific inputs that change how you are perceived, measured objectively." },
      { q: "Will there be time for questions?", a: "Yes. The second half of the session is structured Q&A where Marcus responds to real situations from the room. This is one of the most valuable parts of the session." },
      { q: "Is this available as a recording?", a: "Yes. All registered participants receive a full recording within 24 hours, including the Q&A." },
    ],
    bioClosing: "The most strategically useful two hours I have spent in my career. — Participant, CFO, FTSE 100",
  },

  wellness: {
    heroEyebrow: "Live Online Gathering",
    heroHeadline: "Your body has been trying to tell you something. This is where you finally listen.",
    heroSubheadline: "Join Aria Bloom for a live online somatic intensive where you will learn to read your body's signals, regulate your nervous system, and return to the ease that has been waiting for you underneath the tension.",
    heroCredibility: '"I have been in therapy for six years. Three hours with Aria gave me access to parts of myself that talk therapy simply could not reach." — Hannah W., Melbourne',
    audienceHeadline: "This gathering is for you if...",
    audience: [
      "You live in your head and struggle to feel connected to your body",
      "You carry chronic tension, fatigue, or a low-level sense of dread that never fully lifts",
      "You have done years of mindset work but still feel stuck in the same patterns",
      "You are a high-sensitivity person who gets easily overwhelmed in daily life",
      "You want to feel genuinely at ease in your own body — not just better at managing symptoms",
    ],
    valueHeadline: "What somatic work can unlock",
    valueParagraph: "Talk therapy works beautifully for insight. But insight alone rarely changes the body — and it is the body that holds the patterns we most want to release. Somatic work goes directly to the nervous system: the place where fear, grief, chronic stress, and old wounds actually live. In this intensive, Aria will guide you through a sequence of gentle somatic practices that help the body complete interrupted responses, discharge stored tension, and settle into its natural state of regulated, open presence.",
    outcomes: [
      "Understand your own nervous system and what drives your stress responses",
      "Learn three somatic practices you can use daily to return to regulation",
      "Experience what it feels like to be fully present in your body",
      "Identify the patterns your body holds that your mind cannot change alone",
      "Leave with a personalised embodiment practice for the weeks ahead",
    ],
    testimonials: [
      { quote: "I have tried yoga, meditation, breathwork, and every kind of therapy. Aria's approach was the first thing that actually made me feel safe in my own body.", name: "Theresa M.", location: "Portland, USA" },
      { quote: "Within an hour I felt something I haven't felt since childhood — genuinely relaxed. Not performing relaxation. Actually resting. I didn't know that was still possible for me.", name: "Yuki A.", location: "Tokyo, Japan" },
      { quote: "Aria holds space in a way that makes the most defended person feel completely safe to open. Her presence is its own medicine.", name: "Rosa C.", location: "Barcelona, Spain" },
    ],
    howItWorks: [
      { step: "1", title: "Register & Prepare", description: "Receive your pre-intensive guide with gentle arrival practices to help your nervous system settle before the gathering begins." },
      { step: "2", title: "Join the Live Intensive", description: "Aria guides the group through a sequence of somatic practices, including group sharing and individual attention for those called to go deeper." },
      { step: "3", title: "Carry It Forward", description: "Leave with a full recording and a personalised somatic practice — a simple daily sequence designed specifically for your nervous system type." },
    ],
    faq: [
      { q: "Do I need any prior experience with somatic work?", a: "No experience is needed. Aria structures the intensive to be completely accessible for beginners, while offering depth for those with an existing practice." },
      { q: "Is this suitable if I have experienced trauma?", a: "Yes, and Aria's approach is specifically trauma-informed. All practices are offered as invitations, never instructions. You set the pace." },
      { q: "Do I need to have my camera on?", a: "You are welcome to participate with your camera off if that feels safer. Many people find they open more fully with camera on, but the choice is always yours." },
      { q: "Will there be a recording available?", a: "Yes. All registered participants receive the full recording within 24 hours. The somatic transmission is present in the replay." },
    ],
    bioClosing: "Aria meets you exactly where you are — then somehow creates conditions for you to go exactly where you need to go. — From a participant in Cape Town",
  },

  highperf: {
    heroEyebrow: "Live Protocol Session",
    heroHeadline: "Your output is limited by your cognitive infrastructure. Let's fix that.",
    heroSubheadline: "Join Kai Mercer for a two-hour live session where you will learn the evidence-based protocols that top-1% performers use to make faster decisions, sustain deeper focus, and avoid the cognitive degradation that quietly caps most high-achievers.",
    heroCredibility: '"I implemented Kai\'s three core protocols in week one. By week three, my team noticed the difference before I told them what I was doing." — Alex P., Founder & CEO',
    audienceHeadline: "This session is built for you if...",
    audience: [
      "You are performing well but sense you are operating at 60–70% of your actual cognitive capacity",
      "Your calendar is full but your deep work time is fragmented and inconsistently productive",
      "You make good decisions but not reliably, and you know stress is a variable you haven't solved",
      "You have tried productivity systems but found they don't survive contact with your actual schedule",
      "You want protocols with a neurological basis, not lifestyle advice",
    ],
    valueHeadline: "The Cognitive Edge framework",
    valueParagraph: "After five years of field research with 400 top performers — athletes, founders, surgeons, and special operations personnel — Kai identified the six cognitive leverage points that consistently separate elite performers from merely excellent ones. These are not about working harder or longer. They are about engineering the biological conditions under which your brain naturally performs at its ceiling. Every protocol in this session is evidence-based, tested in high-stakes environments, and calibrated for execution — not experimentation.",
    outcomes: [
      "Identify your personal cognitive bottleneck with precision",
      "Implement the three highest-ROI focus protocols immediately",
      "Design a cognitive architecture that survives your actual schedule",
      "Eliminate the decision fatigue patterns silently costing you performance",
      "Build a 30-day implementation roadmap you can start this week",
    ],
    testimonials: [
      { quote: "Kai's protocols gave me back two hours of effective output per day. That compounds to over 700 hours a year. The ROI of this session is absurd.", name: "Morgan K.", location: "San Francisco, USA" },
      { quote: "I'm a neuroscientist. I came in prepared to be sceptical. Kai's framework is rigorous, well-cited, and more practically applied than most of what I read in journals.", name: "Dr. Chen W.", location: "Boston, USA" },
      { quote: "I've implemented every productivity system that exists. Kai's is the only one that still works three months later because it's built on biology, not habit.", name: "Jamie R.", location: "London, UK" },
    ],
    howItWorks: [
      { step: "01", title: "Pre-session audit", description: "Complete a 12-minute cognitive performance audit so you arrive knowing your baseline and your specific bottlenecks." },
      { step: "02", title: "Live protocol session", description: "Kai delivers the Cognitive Edge framework with live Q&A, case studies, and real-time calibration for the room." },
      { step: "03", title: "30-day implementation", description: "Leave with your personalised implementation roadmap, protocol stack, and full session recording." },
    ],
    faq: [
      { q: "Is this biohacking content?", a: "No. The Cognitive Edge framework is grounded in cognitive neuroscience, behavioural performance research, and validated field protocols. There are no supplements, devices, or biohacks involved." },
      { q: "How technical is the content?", a: "Kai explains the neurological basis for each protocol without requiring a science background. The focus is always on application, not theory." },
      { q: "Is this relevant for team leaders or just individual contributors?", a: "Both. Many participants implement the framework individually first, then roll out elements with their teams in the following months." },
      { q: "Will there be a recording?", a: "Yes. Full session recording including Q&A is available within 12 hours." },
    ],
    bioClosing: "The most useful two hours I have spent this year, and I have a calendar full of 'useful' meetings. — VP Engineering, Y Combinator portfolio company",
  },

  abundance: {
    heroEyebrow: "Live Energetic Transmission & Business Session",
    heroHeadline: "You were not meant to work this hard for money that feels this complicated.",
    heroSubheadline: "Join Zoe Tanaka for a live activation session where you will clear the energetic patterns blocking your receivership, receive a quantum transmission for abundance, and leave with a concrete strategy for attracting aligned clients and income.",
    heroCredibility: '"I had been stuck at the same revenue ceiling for three years. After Zoe\'s activation, I had my biggest launch ever within six weeks. I still can\'t fully explain it." — Lauren T., Business Coach',
    audienceHeadline: "This activation is for you if...",
    audience: [
      "You are doing everything right in your business but the income never quite matches the effort",
      "You feel guilty charging what you're worth, or you discount before clients even ask",
      "You attract wonderful clients but they often can't afford your premium offers",
      "You know energetically something needs to shift before the strategy will land",
      "You are ready to receive — in your body, your business, and your bank account",
    ],
    valueHeadline: "The Quantum Business Expansion method",
    valueParagraph: "Most business coaching tells you what to do. Zoe's work asks a prior question: what are you able to receive? The Quantum Business Expansion method combines quantum field theory, energy psychology, and modern marketing strategy to address both the inner and outer architecture of a thriving, aligned business. In this live session, Zoe will guide the group through a collective energetic clearing, deliver a wealth activation transmission, and then share the specific marketing and sales strategies that work beautifully once the field is prepared.",
    outcomes: [
      "Identify and dissolve the specific energetic pattern capping your income",
      "Receive a live quantum abundance activation transmission",
      "Learn the aligned marketing approach that attracts premium clients without hustle",
      "Understand how to price your offers from worth rather than fear",
      "Leave with a clear next step that integrates energy and strategy",
    ],
    testimonials: [
      { quote: "Zoe is the only business mentor I've encountered who understands that the outer strategy only works when the inner field is ready. This session cleared something I'd been carrying for years.", name: "Maya S.", location: "Sydney, Australia" },
      { quote: "I came for the business strategy. I left with that and something I didn't even know I was missing — permission to receive abundantly without guilt.", name: "Christina R.", location: "Miami, USA" },
      { quote: "Zoe's transmission hit me at a physical level. I felt something release in my chest that I hadn't even known was contracted. My relationship with money has never been the same.", name: "Asha P.", location: "London, UK" },
    ],
    howItWorks: [
      { step: "1", title: "Register & Prepare", description: "Receive your pre-session wealth frequency audit and arrival meditation to open your field for the transmission." },
      { step: "2", title: "Join the Live Activation", description: "Zoe leads the group through a collective clearing, delivers the quantum transmission, and teaches the aligned business strategy framework." },
      { step: "3", title: "Integrate & Implement", description: "Leave with the full recording, your quantum business blueprint, and a daily receivership practice to sustain the shift." },
    ],
    faq: [
      { q: "Do I need to believe in energy work for this to be effective?", a: "Openness is more useful than belief. Many participants arrive curious-but-sceptical and find the transmission lands regardless of their intellectual framework." },
      { q: "Is this practical business training or is it entirely energetic?", a: "Both, in equal measure. Zoe delivers concrete marketing and sales strategy alongside the energetic work. The two are inseparable in her method." },
      { q: "Can I attend if my business is brand new?", a: "Yes. The abundance clearing and energetic foundations are particularly powerful to set in place at the beginning of a business journey." },
      { q: "Will there be a replay?", a: "Yes. The full recording — including the transmission — is available within 24 hours. The energetic field is fully present in replay." },
    ],
    bioClosing: "Zoe understands that money is energy before it is numbers — and she helps you clear the field so the numbers can finally move. — From a participant in Toronto",
  },

  earth: {
    heroEyebrow: "Live Online Ceremony",
    heroHeadline: "Your ancestors did not survive everything they survived so that you could feel this lost.",
    heroSubheadline: "Join River Stone for a live online Medicine Circle ceremony where you will reconnect with the wisdom of your lineage, receive guidance from the earth itself, and remember the strength that has always been available to you.",
    heroCredibility: '"I have attended ceremonies on four continents. River\'s Medicine Circle was among the most potent I have ever experienced — and I was sitting in my living room." — Elena V., Denmark',
    audienceHeadline: "This circle is for you if...",
    audience: [
      "You feel a deep longing for belonging that modern life has not been able to satisfy",
      "You sense that something in your family line needs healing, and that you may be the one to do it",
      "You are called to earth-based spirituality but don't know where to begin",
      "You carry grief, heaviness, or a disconnection from your body and your place in the world",
      "You are ready to receive the medicine that your ancestors prepared for you",
    ],
    valueHeadline: "The gift of ancestral reconnection",
    valueParagraph: "We live in a time of profound disconnection — from each other, from the earth, and from the long line of people who carried us forward to this moment. Ancestral work is not about the past. It is about activating the wisdom, resilience, and love that your lineage holds — and learning to draw on it in your present life. In this Medicine Circle, River will open sacred space using traditional protocols from three lineages, guide the group through a collective ancestral reconnection practice, and offer medicine teachings from the earth that are precisely calibrated for these times.",
    outcomes: [
      "Open a living connection with your ancestral lineage",
      "Receive a transmission of ancestral strength and wisdom",
      "Learn a daily earth-connection practice grounded in traditional teaching",
      "Understand the specific medicine your lineage is offering you at this time",
      "Leave with a ceremony to honour and deepen your relationship with your ancestors",
    ],
    testimonials: [
      { quote: "River opened something in me that I have been searching for my entire life — a sense of being held by something older and wiser than my own understanding. I wept from my bones.", name: "Ingrid L.", location: "Stockholm, Sweden" },
      { quote: "I am a third-generation immigrant who felt completely severed from my ancestral roots. After River's ceremony, I felt them for the first time. I cannot overstate how healing this was.", name: "Samuel O.", location: "Toronto, Canada" },
      { quote: "River holds ceremony with a rigour and an authenticity that is increasingly rare. This is living tradition, not cultural tourism.", name: "Maria T.", location: "Mexico City, Mexico" },
    ],
    howItWorks: [
      { step: "1", title: "Register & Prepare", description: "Receive your preparation guide — how to create your altar space, the ancestral invocation prayer, and how to arrive in a ceremonial state of mind." },
      { step: "2", title: "Join the Medicine Circle", description: "River opens sacred space with traditional protocols, guides the collective ancestral reconnection, and offers individual medicine transmissions." },
      { step: "3", title: "Carry the Medicine Forward", description: "Leave with the full recording, the ancestral reconnection practice, and a ceremony to honour your lineage in your daily life." },
    ],
    faq: [
      { q: "Do I need to know my ancestral lineage to participate?", a: "No. The ceremony works with whatever connection is available to you — whether you have detailed genealogical knowledge or simply a sense of those who came before." },
      { q: "Is this practice from a specific tradition?", a: "River draws from three lineages with their explicit permission and blessing. The ceremony is respectful of each tradition's boundaries and protocols." },
      { q: "Can I attend if I have no experience with ceremony?", a: "Absolutely. Many of the most powerful experiences in River's circles come from people who have never attended ceremony before. Beginner's mind is a gift." },
      { q: "Will there be a recording?", a: "Yes. All participants receive the full recording within 24 hours. The ceremonial transmission travels through replay." },
    ],
    bioClosing: "River does not teach ceremony. River lives it — and in their presence, you remember how to live it too. — From a participant in New Zealand",
  },
};

export default async function ThemeLandingPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const styles = s(theme);
  const copy = THEME_COPY[themeSlug];
  const checkoutHref = `/themes/${themeSlug}/checkout`;

  return (
    <main style={styles.page}>
      {/* STICKY BAR */}
      <div
        style={{
          position: "sticky",
          top: "52px",
          zIndex: 100,
          background: theme.colors.dark,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 32px",
          fontSize: "14px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: theme.fonts.displayFamily, fontWeight: 600 }}>
          {theme.host.name} · {theme.event.name}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: theme.colors.highlight, fontSize: "13px" }}>
            {theme.event.date} · {theme.event.time} {theme.event.timezone}
          </span>
          <Link
            href={checkoutHref}
            style={{
              background: theme.colors.highlight,
              color: theme.colors.dark,
              padding: "8px 20px",
              borderRadius: "100px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13px",
              whiteSpace: "nowrap",
            }}
          >
            Register free →
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section
        style={{
          background: theme.colors.dark,
          color: "#fff",
          padding: "100px 40px 80px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: theme.colors.highlight,
            marginBottom: "24px",
          }}
        >
          {copy.heroEyebrow}
        </p>
        <h1
          style={{
            ...styles.displayFont,
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: "820px",
            margin: "0 auto 28px",
            letterSpacing: "-0.02em",
          }}
        >
          {copy.heroHeadline}
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            maxWidth: "600px",
            margin: "0 auto 16px",
            opacity: 0.85,
            lineHeight: 1.65,
          }}
        >
          {copy.heroSubheadline}
        </p>
        <p
          style={{
            fontSize: "13px",
            maxWidth: "540px",
            margin: "0 auto 40px",
            opacity: 0.6,
            fontStyle: "italic",
          }}
        >
          {copy.heroCredibility}
        </p>
        <Link
          href={checkoutHref}
          style={{
            display: "inline-block",
            background: theme.colors.highlight,
            color: theme.colors.dark,
            padding: "18px 44px",
            borderRadius: "100px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "16px",
            marginBottom: "16px",
          }}
        >
          Reserve your seat — free
        </Link>
        <div style={{ fontSize: "13px", opacity: 0.5, marginTop: "8px" }}>
          {theme.event.date} · {theme.event.time} {theme.event.timezone} · {theme.event.duration} · {theme.event.platform}
        </div>
      </section>

      {/* CREDIBILITY QUOTE */}
      <section
        style={{
          background: theme.colors.accent,
          color: "#fff",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <blockquote
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            fontStyle: "italic",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          {copy.testimonials[0].quote}
        </blockquote>
        <cite style={{ display: "block", marginTop: "16px", fontSize: "13px", opacity: 0.7, fontStyle: "normal" }}>
          — {copy.testimonials[0].name}, {copy.testimonials[0].location}
        </cite>
      </section>

      {/* AUDIENCE */}
      <section
        style={{
          padding: "80px 40px",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 700,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          {copy.audienceHeadline}
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          {copy.audience.map((item, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                fontSize: "1.05rem",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  color: theme.colors.accent,
                  fontWeight: 700,
                  fontSize: "18px",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link
            href={checkoutHref}
            style={{
              display: "inline-block",
              background: theme.colors.accent,
              color: "#fff",
              padding: "16px 40px",
              borderRadius: "100px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            Yes — this is for me →
          </Link>
        </div>
      </section>

      {/* VALUE PROP */}
      <section style={{ ...styles.darkBg, padding: "80px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h2
            style={{
              ...styles.displayFont,
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700,
              marginBottom: "28px",
              color: theme.colors.highlight,
            }}
          >
            {copy.valueHeadline}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.75, opacity: 0.9 }}>
            {copy.valueParagraph}
          </p>
        </div>
      </section>

      {/* OUTCOMES */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 700,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          What you will leave with
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {copy.outcomes.map((outcome, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                padding: "20px 24px",
                background: `${theme.colors.accent}10`,
                borderRadius: "12px",
                borderLeft: `4px solid ${theme.colors.accent}`,
              }}
            >
              <span
                style={{
                  ...styles.displayFont,
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: theme.colors.accent,
                  opacity: 0.4,
                  flexShrink: 0,
                  lineHeight: 1,
                  marginTop: "2px",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.6 }}>{outcome}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ ...styles.darkBg, padding: "80px 40px" }}>
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
            color: "#fff",
          }}
        >
          What past participants say
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {copy.testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "28px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  fontStyle: "italic",
                  lineHeight: 1.65,
                  marginBottom: "20px",
                  opacity: 0.9,
                  fontSize: "0.95rem",
                }}
              >
                "{t.quote}"
              </p>
              <cite style={{ fontStyle: "normal", fontSize: "13px", opacity: 0.5 }}>
                — {t.name}, {t.location}
              </cite>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {copy.howItWorks.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: theme.colors.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  flexShrink: 0,
                  fontFamily: theme.fonts.displayFamily,
                }}
              >
                {step.step}
              </div>
              <div>
                <h3 style={{ ...styles.displayFont, fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
                  {step.title}
                </h3>
                <p style={{ lineHeight: 1.65, opacity: 0.8, margin: 0 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EVENT OVERVIEW */}
      <section
        style={{
          background: `${theme.colors.accent}10`,
          borderTop: `1px solid ${theme.colors.accent}30`,
          borderBottom: `1px solid ${theme.colors.accent}30`,
          padding: "60px 40px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              ...styles.displayFont,
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              fontWeight: 700,
              marginBottom: "36px",
            }}
          >
            Event details
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "24px",
              textAlign: "left",
            }}
          >
            {[
              { label: "Date", value: theme.event.date },
              { label: "Time", value: `${theme.event.time} ${theme.event.timezone}` },
              { label: "Duration", value: theme.event.duration },
              { label: "Platform", value: theme.event.platform },
              { label: "Investment", value: theme.event.priceMin === 0 ? `Free–$${theme.event.priceMax}` : `$${theme.event.priceMin}–$${theme.event.priceMax}` },
              { label: "Host", value: theme.host.name },
            ].map((d) => (
              <div key={d.label}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.colors.accent, marginBottom: "6px" }}>
                  {d.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIO */}
      <section style={{ padding: "80px 40px", maxWidth: "760px", margin: "0 auto" }}>
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          About {theme.host.name}
        </h2>
        <p style={{ color: theme.colors.accent, fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "28px" }}>
          {theme.host.title}
        </p>
        {theme.host.bio.map((para, i) => (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: para }}
            style={{ lineHeight: 1.75, marginBottom: "20px", fontSize: "1.05rem", opacity: 0.85 }}
          />
        ))}
        <blockquote
          style={{
            ...styles.displayFont,
            borderLeft: `4px solid ${theme.colors.highlight}`,
            paddingLeft: "20px",
            fontStyle: "italic",
            opacity: 0.7,
            marginTop: "32px",
            fontSize: "1.05rem",
          }}
        >
          {copy.bioClosing}
        </blockquote>
      </section>

      {/* FAQ */}
      <section style={{ ...styles.darkBg, padding: "80px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2
            style={{
              ...styles.displayFont,
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {copy.faq.map((item, i) => (
              <details
                key={i}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  paddingBottom: "0",
                }}
              >
                <summary
                  style={{
                    padding: "20px 0",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {item.q}
                  <span style={{ color: theme.colors.highlight, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ paddingBottom: "20px", opacity: 0.75, lineHeight: 1.65, margin: 0, fontSize: "0.95rem" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: theme.colors.accent,
          color: "#fff",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            ...styles.displayFont,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Join {theme.host.name} for {theme.event.name}
        </h2>
        <p style={{ fontSize: "1.1rem", opacity: 0.85, marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
          {theme.event.date} · {theme.event.time} {theme.event.timezone}
        </p>
        <Link
          href={checkoutHref}
          style={{
            display: "inline-block",
            background: theme.colors.highlight,
            color: theme.colors.dark,
            padding: "18px 48px",
            borderRadius: "100px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          Reserve your place — free
        </Link>
        <div style={{ marginTop: "16px", fontSize: "13px", opacity: 0.6 }}>
          Choose what you pay: ${theme.event.priceMin}–${theme.event.priceMax} {theme.event.currency}
        </div>
      </section>

      {/* FTC + FOOTER */}
      <footer
        style={{
          background: theme.colors.dark,
          color: "rgba(255,255,255,0.4)",
          padding: "40px",
          fontSize: "12px",
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        <p style={{ maxWidth: "600px", margin: "0 auto 20px" }}>
          Results mentioned are individual experiences and are not typical. Your results will vary based on your individual circumstances, background, and effort applied.
        </p>
        <p>
          © {new Date().getFullYear()} {theme.host.legalEntity} · All rights reserved ·{" "}
          <a href="#" style={{ color: "inherit" }}>Privacy Policy</a> ·{" "}
          <a href="#" style={{ color: "inherit" }}>Terms</a>
        </p>
      </footer>
    </main>
  );
}
