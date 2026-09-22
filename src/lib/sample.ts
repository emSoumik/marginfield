import type { Briefing, Source } from "./model";
const day = Date.UTC(2026, 8, 22, 9);
const stories = [
  [
    "The web is becoming personal again",
    "Field Notes",
    "article",
    "A quieter, more human internet is emerging as independent creators reclaim their spaces.",
    "Personal websites make room for ideas that do not need to win an algorithm. A small corner of the web can reflect the person who tends it, rather than the platform that distributes it.\n\nThe shift is not about abandoning connection. It is about choosing its shape. A newsletter, a carefully kept journal, or a useful little tool can offer a more lasting relationship than a stream of updates.\n\nFor independent makers, the opportunity is to build a place people return to on purpose. Start with a clear point of view, let readers set the pace, and leave enough space for attention.",
  ],
  [
    "Designing for a smaller audience",
    "Design Observer",
    "newsletter",
    "Narrower audiences can lead to deeper work, stronger communities, and more sustainable tools.",
    "A product does not have to be for everyone to be useful. Choosing a specific audience makes the hard decisions easier: what to include, what to remove, and whose needs to understand first.\n\nDepth often matters more than reach. People return to tools that solve a familiar problem well. The best starting point is a conversation with the people who already care about that problem.\n\nSmall is not a limitation to hide. It can be a deliberate design decision that protects clarity as a product grows.",
  ],
  [
    "The case for slower software",
    "The Long Read",
    "article",
    "Why a more deliberate approach to building can lead to better tools and happier users.",
    "Speed is useful when it removes friction. It is less useful when it becomes the purpose of the product. Software can make space for thought instead of demanding a reaction to every event.\n\nA slower interface is not a sluggish one. Its interactions should be immediate, while its rhythm respects the user. Quiet defaults, fewer notifications, and clear stopping points make that possible.\n\nBuild a tool around a repeatable habit rather than a bottomless feed. Let people finish what they came to do, then get out of the way.",
  ],
  [
    "A studio built around attention",
    "Studio Notes",
    "newsletter",
    "How an independent studio is designing a calmer, more intentional creative practice.",
    "Attention is a finite part of a creative practice. Protecting it is less about finding a perfect productivity system and more about making a few dependable choices.\n\nKeep a short reading list. Leave time between meetings. Write down a thought before opening another tab. These modest boundaries make space for sustained work.",
  ],
  [
    "Why useful tools stay small",
    "Fieldwork",
    "article",
    "Small tools thrive when they solve a real problem for a specific group of people.",
    "A useful tool has a clear promise. It lets people do something they already wanted to do with less effort and greater confidence.\n\nKeeping that promise sometimes means declining an attractive feature. Every addition asks people to learn a little more. Make that cost worthwhile.",
  ],
  [
    "Notes from the independent web",
    "Your notebook",
    "note",
    "On sustainability, ownership, and what comes next for a healthier internet.",
    "Questions for this week:\n\nWhat would this product look like without a feed?\nWhich parts of the experience should belong to the reader?\nWhat is the smallest useful version we can finish?",
  ],
] as const;
export const sampleSources: Source[] = stories.map(
  ([title, author, kind, excerpt, content], i) => ({
    _id: `sample-${i + 1}`,
    title,
    author,
    kind,
    excerpt,
    content,
    imageUrl: i === 0 ? "/images/quiet-reading.png" : undefined,
    status: "ready",
    read: i > 3,
    bookmarked: i === 0 || i === 3,
    createdAt: day - i * 86400000,
  }),
);
export const sampleBriefing: Briefing = {
  _id: "sample-briefing",
  title: "A quieter internet is taking shape",
  summary:
    "Across independent publishing and smaller tools, a common idea emerges: prioritize focus over scale, ownership over dependency, and a human pace over constant noise. These sample perspectives point toward a more intentional way to build.",
  status: "ready",
  createdAt: day,
  sections: [
    {
      title: "Small is a design decision",
      body: "A narrower audience makes priorities clearer. Rather than optimizing for everyone, build a dependable tool around a specific problem and the people who care about it.",
      sourceIds: ["sample-1", "sample-2"],
    },
    {
      title: "Ownership changes the relationship",
      body: "A personal website or newsletter lets a creator choose the shape of their work. The relationship becomes a deliberate invitation rather than another interruption.",
      sourceIds: ["sample-1", "sample-3"],
    },
    {
      title: "Build for a habit, not a feed",
      body: "The most enduring tools fit naturally into daily life. Make the interaction fast, the rhythm calm, and the stopping point clear.",
      sourceIds: ["sample-2", "sample-3"],
    },
  ],
};
