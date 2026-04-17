export type LessonCheck =
  | {
      kind: "includes";
      value: string;
      message: string;
    }
  | {
      kind: "regex";
      value: string;
      flags?: string;
      message: string;
    };

export type LessonStep = {
  title: string;
  body: string;
};

export type LessonRuntime =
  | {
      mode: "html" | "css" | "javascript";
      editableLabel: string;
      starterCode: string;
      baseHtml: string;
      baseCss: string;
      baseJs: string;
      target: "html" | "css" | "js";
      outputMode: "preview";
      challengePrompt: string;
      hint: string;
      checks: LessonCheck[];
    }
  | {
      mode: "python";
      editableLabel: string;
      starterCode: string;
      outputMode: "python";
      challengePrompt: string;
      hint: string;
      checks: LessonCheck[];
    };

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  xp: number;
  steps: LessonStep[];
  runtime: LessonRuntime;
};

export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  accent: string;
  icon: string;
  proRequired: boolean;
  lessons: Lesson[];
};

export const learningPaths = [
  {
    slug: "html",
    title: "HTML",
    tagline: "Build the structure of every web page.",
    description:
      "Learn how headings, paragraphs, links, lists, and semantic layout pieces fit together.",
    accent: "from-orange-400/30 via-orange-500/20 to-transparent",
    icon: "</>",
    proRequired: false,
    lessons: [
      {
        id: "html-first-page",
        slug: "first-page",
        title: "Your first page",
        summary: "Create a tiny page with a headline and one supporting paragraph.",
        minutes: 6,
        xp: 40,
        steps: [
          {
            title: "HTML gives content a structure",
            body: "Browsers read tags like <h1> or <p> to understand what kind of content they should render.",
          },
          {
            title: "Headings set the hierarchy",
            body: "A page should usually start with one clear <h1> so both readers and screen readers know what the page is about.",
          },
          {
            title: "Paragraphs carry the supporting message",
            body: "Use <p> for readable text instead of dumping everything into headings or divs.",
          },
        ],
        runtime: {
          mode: "html",
          editableLabel: "index.html",
          starterCode: `<main>\n  <!-- Add a heading and a paragraph here -->\n</main>`,
          baseHtml: `{{code}}`,
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #f8fafc; color: #0f172a; } main { max-width: 36rem; margin: 0 auto; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12); }",
          baseJs: "",
          target: "html",
          outputMode: "preview",
          challengePrompt: "Add one <h1> and one <p> that introduce DevPath.",
          hint: "Your solution can live inside the existing <main> element.",
          checks: [
            {
              kind: "includes",
              value: "<h1",
              message: "Add a main heading with <h1>.",
            },
            {
              kind: "includes",
              value: "<p",
              message: "Add one paragraph with <p>.",
            },
          ],
        },
      },
      {
        id: "html-links-lists",
        slug: "links-and-lists",
        title: "Links and lists",
        summary: "Turn plain content into something navigable with links and readable with lists.",
        minutes: 8,
        xp: 55,
        steps: [
          {
            title: "Links create movement",
            body: "Use <a href=\"...\"> so users can open another page, project, or resource.",
          },
          {
            title: "Lists scan faster",
            body: "Use <ul> and <li> when you have a set of related points instead of stacking paragraphs.",
          },
          {
            title: "Good HTML is predictable",
            body: "Predictable structure makes later CSS and JavaScript work easier too.",
          },
        ],
        runtime: {
          mode: "html",
          editableLabel: "index.html",
          starterCode: `<section>\n  <h1>Why learn on DevPath?</h1>\n  <!-- Add a link and a bulleted list -->\n</section>`,
          baseHtml: `{{code}}`,
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: linear-gradient(180deg, #fff7ed 0%, #fffbeb 100%); color: #7c2d12; } section { max-width: 38rem; margin: 0 auto; background: rgba(255,255,255,0.85); padding: 1.5rem; border-radius: 1rem; box-shadow: 0 20px 45px rgba(124, 45, 18, 0.15); } a { color: #ea580c; }",
          baseJs: "",
          target: "html",
          outputMode: "preview",
          challengePrompt: "Add one link and a 2-item unordered list.",
          hint: "Use <a>, <ul>, and two <li> items.",
          checks: [
            {
              kind: "includes",
              value: "<a",
              message: "Add at least one link tag.",
            },
            {
              kind: "includes",
              value: "<ul",
              message: "Add an unordered list with <ul>.",
            },
            {
              kind: "regex",
              value: "<li[\\s>]",
              flags: "g",
              message: "Add list items with <li>.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "css",
    title: "CSS",
    tagline: "Make interfaces look deliberate instead of default.",
    description:
      "Practice selectors, spacing, colors, and layouts that make simple markup feel polished.",
    accent: "from-sky-400/30 via-cyan-500/20 to-transparent",
    icon: "{ }",
    proRequired: false,
    lessons: [
      {
        id: "css-selectors-color",
        slug: "selectors-and-color",
        title: "Selectors and color",
        summary: "Use CSS rules to style a simple card with type, spacing, and color.",
        minutes: 8,
        xp: 50,
        steps: [
          {
            title: "Selectors target what you want to style",
            body: "You can style tags like h1, classes like .card, or IDs depending on how specific you need to be.",
          },
          {
            title: "Spacing makes content breathable",
            body: "Padding creates room inside an element. Margin creates room around it.",
          },
          {
            title: "Color should support hierarchy",
            body: "Background and text color should improve readability, not just look flashy.",
          },
        ],
        runtime: {
          mode: "css",
          editableLabel: "styles.css",
          starterCode:
            ".card {\n  /* add a background, padding, and border radius */\n}\n\n.card h1 {\n  /* give the title a new color */\n}",
          baseHtml:
            "<article class=\"card\"><p class=\"eyebrow\">Lesson card</p><h1>Style me</h1><p>Make this simple card feel polished.</p></article>",
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #020617; color: #e2e8f0; } .card { max-width: 32rem; margin: 0 auto; border: 1px solid rgba(148,163,184,.25); } .eyebrow { text-transform: uppercase; letter-spacing: .18em; font-size: .75rem; color: #38bdf8; } .card p { line-height: 1.7; }",
          baseJs: "",
          target: "css",
          outputMode: "preview",
          challengePrompt: "Give .card a background, padding, and border radius, then recolor the h1.",
          hint: "Try background, padding, border-radius, and color.",
          checks: [
            {
              kind: "includes",
              value: "background",
              message: "Add a background property to .card.",
            },
            {
              kind: "includes",
              value: "padding",
              message: "Add padding to .card.",
            },
            {
              kind: "includes",
              value: "border-radius",
              message: "Round the card corners with border-radius.",
            },
            {
              kind: "regex",
              value: "card h1[\\s\\S]*color",
              message: "Add a color rule for the title.",
            },
          ],
        },
      },
      {
        id: "css-flex-layout",
        slug: "flex-layouts",
        title: "Flex layouts",
        summary: "Use Flexbox to arrange cards in a responsive row.",
        minutes: 10,
        xp: 65,
        steps: [
          {
            title: "Flexbox helps line things up fast",
            body: "display: flex lets you control horizontal or vertical alignment without hard-coded spacing hacks.",
          },
          {
            title: "Gap is cleaner than margin juggling",
            body: "Instead of manually spacing each card, use gap to keep the layout consistent.",
          },
          {
            title: "Responsive starts with simple rules",
            body: "flex-wrap lets items move naturally when the screen gets smaller.",
          },
        ],
        runtime: {
          mode: "css",
          editableLabel: "styles.css",
          starterCode:
            ".stack {\n  /* turn this into a wrapping row */\n}\n\n.card {\n  /* make each card flexible */\n}",
          baseHtml:
            "<section class=\"stack\"><article class=\"card\">HTML</article><article class=\"card\">CSS</article><article class=\"card\">JavaScript</article></section>",
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #082f49; color: #e0f2fe; } .stack { max-width: 48rem; margin: 0 auto; } .card { padding: 1rem; border-radius: 1rem; background: rgba(125, 211, 252, 0.15); border: 1px solid rgba(125,211,252,.2); min-height: 100px; display: flex; align-items: center; justify-content: center; font-weight: 600; }",
          baseJs: "",
          target: "css",
          outputMode: "preview",
          challengePrompt: "Make the cards sit in a wrapping row with spacing between them.",
          hint: "Use display: flex, gap, and flex-wrap on .stack.",
          checks: [
            {
              kind: "includes",
              value: "display: flex",
              message: "Turn the stack into a flex container.",
            },
            {
              kind: "includes",
              value: "gap",
              message: "Add gap so the cards have space between them.",
            },
            {
              kind: "includes",
              value: "flex-wrap",
              message: "Let the cards wrap on smaller screens.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "javascript",
    title: "JavaScript",
    tagline: "Make pages react and think.",
    description:
      "Learn the basics of variables, logs, DOM updates, and event-driven interactions.",
    accent: "from-yellow-300/30 via-amber-500/20 to-transparent",
    icon: "JS",
    proRequired: false,
    lessons: [
      {
        id: "js-variables-console",
        slug: "variables-and-console",
        title: "Variables and console output",
        summary: "Store data in a variable and print a readable message to the console.",
        minutes: 8,
        xp: 55,
        steps: [
          {
            title: "Variables hold values you need later",
            body: "let creates a variable you can reuse or update as your program runs.",
          },
          {
            title: "console.log is your debugging friend",
            body: "Use it to inspect values and explain what your code is doing while you learn.",
          },
          {
            title: "Strings let you communicate meaning",
            body: "A short message in the output is better than a random number with no context.",
          },
        ],
        runtime: {
          mode: "javascript",
          editableLabel: "script.js",
          starterCode:
            "const xp = 120;\n// Create a second variable and log a sentence about your progress.\n",
          baseHtml:
            "<main><h1>Console challenge</h1><p>Open the output pane to see your logs.</p></main>",
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #111827; color: #f9fafb; } main { max-width: 32rem; margin: 0 auto; }",
          baseJs: "{{code}}",
          target: "js",
          outputMode: "preview",
          challengePrompt: "Create one more variable and log a message with console.log.",
          hint: "Your code should include let or const and a console.log call.",
          checks: [
            {
              kind: "regex",
              value: "(let|const)\\s+[a-zA-Z_$][\\w$]*",
              message: "Create at least one variable.",
            },
            {
              kind: "includes",
              value: "console.log",
              message: "Log a message with console.log.",
            },
          ],
        },
      },
      {
        id: "js-dom-events",
        slug: "dom-events",
        title: "DOM updates and clicks",
        summary: "Use JavaScript to react to a button click and change on-screen text.",
        minutes: 11,
        xp: 70,
        steps: [
          {
            title: "The DOM is the page in memory",
            body: "JavaScript can find elements, read them, and update them after the page loads.",
          },
          {
            title: "Events make pages interactive",
            body: "addEventListener tells the browser what should happen after a click, input, or key press.",
          },
          {
            title: "Small interactions create momentum",
            body: "Even tiny feedback loops help learners feel like their code is doing something real.",
          },
        ],
        runtime: {
          mode: "javascript",
          editableLabel: "script.js",
          starterCode:
            "const button = document.querySelector('button');\nconst message = document.querySelector('#message');\n\n// When the button is clicked, change the text inside #message.\n",
          baseHtml:
            "<section class=\"panel\"><h1>DevPath demo</h1><p id=\"message\">Waiting for your code...</p><button>Complete lesson</button></section>",
          baseCss:
            "body { font-family: Inter, Arial, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; } .panel { max-width: 36rem; margin: 0 auto; background: rgba(15,23,42,.72); border: 1px solid rgba(148,163,184,.25); border-radius: 1rem; padding: 1.5rem; } button { margin-top: 1rem; padding: .85rem 1rem; border-radius: 999px; background: #facc15; color: #111827; font-weight: 700; border: none; }",
          baseJs: "{{code}}",
          target: "js",
          outputMode: "preview",
          challengePrompt: "Add a click listener that changes the paragraph text.",
          hint: "Use addEventListener('click', ... ) and message.textContent = ...",
          checks: [
            {
              kind: "includes",
              value: "addEventListener",
              message: "Listen for the button click.",
            },
            {
              kind: "includes",
              value: "textContent",
              message: "Update the message text when the button is clicked.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "python",
    title: "Python",
    tagline: "Write readable code that feels approachable fast.",
    description:
      "Practice the Python basics with a browser-based runtime powered by Pyodide.",
    accent: "from-emerald-300/30 via-green-500/20 to-transparent",
    icon: "Py",
    proRequired: true,
    lessons: [
      {
        id: "python-print-variables",
        slug: "print-and-variables",
        title: "Print and variables",
        summary: "Use variables and print() to describe your daily coding goal.",
        minutes: 8,
        xp: 60,
        steps: [
          {
            title: "Python favors readability",
            body: "The syntax is intentionally clean, which is why it is often used to teach programming fundamentals.",
          },
          {
            title: "Variables store values",
            body: "Use a name like streak_days or lesson_name so your code stays easy to read later.",
          },
          {
            title: "print() shows program output",
            body: "It is the quickest way to confirm your code ran and inspect the result.",
          },
        ],
        runtime: {
          mode: "python",
          editableLabel: "main.py",
          starterCode:
            "goal = \"finish one DevPath lesson\"\n# Create another variable and print a sentence using both values.\n",
          outputMode: "python",
          challengePrompt: "Create one more variable and print a sentence with print().",
          hint: "Try using an f-string for the sentence.",
          checks: [
            {
              kind: "regex",
              value: "^[a-zA-Z_][\\w_]*\\s*=",
              flags: "m",
              message: "Create at least one variable assignment.",
            },
            {
              kind: "includes",
              value: "print(",
              message: "Use print() to show output.",
            },
          ],
        },
      },
      {
        id: "python-loops-functions",
        slug: "loops-and-functions",
        title: "Loops and functions",
        summary: "Use a function and a loop to cheer through a short study streak.",
        minutes: 12,
        xp: 80,
        steps: [
          {
            title: "Functions package reusable behavior",
            body: "Use def to name a tiny unit of logic you can call whenever you need it.",
          },
          {
            title: "Loops repeat predictable work",
            body: "for lets you run the same code over a sequence without copying and pasting.",
          },
          {
            title: "Readable code compounds fast",
            body: "Small, named pieces make your logic easier to test, explain, and improve.",
          },
        ],
        runtime: {
          mode: "python",
          editableLabel: "main.py",
          starterCode:
            "def cheer(day):\n    return f\"Day {day}: keep going!\"\n\n# Loop through 3 days and print the cheer each time.\n",
          outputMode: "python",
          challengePrompt: "Use a function and a loop that prints three lines.",
          hint: "Call cheer(day) inside a for loop with range(1, 4).",
          checks: [
            {
              kind: "includes",
              value: "def ",
              message: "Keep or create a function with def.",
            },
            {
              kind: "includes",
              value: "for ",
              message: "Use a for loop to repeat the output.",
            },
            {
              kind: "includes",
              value: "print(",
              message: "Print the function result inside the loop.",
            },
          ],
        },
      },
    ],
  },
] satisfies LearningPath[];

export const freePathSlugs = learningPaths
  .filter((path) => !path.proRequired)
  .map((path) => path.slug);

export function getPathBySlug(pathSlug: string) {
  return learningPaths.find((path) => path.slug === pathSlug) ?? null;
}

export function getLessonBySlugs(pathSlug: string, lessonSlug: string) {
  const path = getPathBySlug(pathSlug);
  const lesson = path?.lessons.find((entry) => entry.slug === lessonSlug) ?? null;

  if (!path || !lesson) {
    return null;
  }

  return { path, lesson };
}

export function getLessonIndex(pathSlug: string, lessonSlug: string) {
  const path = getPathBySlug(pathSlug);

  if (!path) {
    return -1;
  }

  return path.lessons.findIndex((entry) => entry.slug === lessonSlug);
}

export function getNextLesson(pathSlug: string, lessonSlug: string) {
  const path = getPathBySlug(pathSlug);
  const currentIndex = getLessonIndex(pathSlug, lessonSlug);

  if (!path || currentIndex < 0 || currentIndex >= path.lessons.length - 1) {
    return null;
  }

  return path.lessons[currentIndex + 1];
}

export function isPathLocked(pathSlug: string, isPro: boolean) {
  const path = getPathBySlug(pathSlug);
  return Boolean(path?.proRequired && !isPro);
}

export function getLessonById(lessonId: string) {
  for (const path of learningPaths) {
    const lesson = path.lessons.find((entry) => entry.id === lessonId);

    if (lesson) {
      return {
        path,
        lesson,
      };
    }
  }

  return null;
}

export function getTotalXp(): number {
  return learningPaths.reduce((totalXp, path) => {
    return (
      totalXp +
      path.lessons.reduce((pathXp, lesson) => pathXp + lesson.xp, 0)
    );
  }, 0);
}
