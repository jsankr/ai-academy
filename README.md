# ✦ AI Adventure Academy

**A free, interactive, family-friendly, 12-week journey from first AI concepts to practical agents and published websites.**

**Live site (after GitHub Pages deployment):** https://jsankr.github.io/ai-academy/

## Who can learn?

| Path | Learner | Experience | Sample capstone |
|---|---|---|---|
| 🪁 Young Explorers | Ages 8–12, with adult supervision | Pattern games, stories, original drawings, paper flowcharts | Four-page AI comic |
| 🌱 Everyday Beginners | Teens 13+ and nontechnical adults | ChatGPT/Claude, prompts, image/video/audio and productivity | Illustrated life organizer |
| 🛠️ Practical Builders | Intermediate, no-code first | n8n/Make, 9 safe agent prototypes, vibe coding | Live personal dashboard |
| 🚀 Expert Lab | Advanced learners | Python, APIs, RAG, security, evaluation and deployment | Grounded, evaluated and controlled agent |

**Learning levels are not gatekeepers.** Adults may start with playful kids' explanations, and advanced teens may work through technical labs. Kids should only use third-party AI services that meet their age rules, with appropriate adult guidance. The academy does **not** collect children's information or provide logins.

## What is included?

- `index.html` — polished responsive single-page academy, 4 learning paths, fixed timetable, 12 weekly lesson cards, 9 agent prototypes, a glossary, official tool links, quizzes and browser-local progress.
- `workbook.html` — concrete no-code agent-building steps, all nine agent exercises, a safe Python illustration, test plans, and GitHub Pages publishing instructions.
- `course-data.json` — source content for 12 weeks, 4 learner paths, agent recipes, quiz and glossary (for future maintenance). The current static page embeds a copy of this data so it also works offline.
- `README.md` — this guide.

## How this training course was created

1. **Define outcomes:** explain AI fundamentals; make content in text, image, speech, video and slides; save time; understand nine agents; build and publish a website.
2. **Sequence learning:** begin with AI / model / GPU / tokens / weights, then move through prompts and media tools, everyday productivity, agents, and vibe coding.
3. **Differentiate for four levels:** the same concept is taught with games, everyday analogies, real workflows or advanced engineering, respectively.
4. **Use learning by doing:** each module presents a concept, a short experiment, a measurable check and a capstone.
5. **Build agent safety into the syllabus:** only use synthetic data until tests pass; distinguish prototypes from actual automation; require explicit approval for sensitive external actions.
6. **Create a standalone static UI:** use semantic HTML, modern CSS, vanilla JavaScript and `localStorage` without external scripts or accounts.
7. **Review for accuracy:** distinguish probabilistic generation from search or tool use; treat prices/features/availability as changing; link official documentation for important concepts.
8. **Validate before release:** check source syntax, linked local files, navigation, mobile breakpoints, secret-pattern presence and interactive code. Live browser end-to-end testing is a separate release step.
9. **Publish via GitHub Pages:** use a public repository, main branch and root folder. Confirm deployment and retest the public URL.

## Course timetable

Starts **Monday, 30 November 2026**. All times **IST (Asia/Kolkata)**. It is **self-guided**, not a live instructor-led course.

| Day | Time | Goal |
|---|---|---|
| Monday | 7:30–8:30 PM | Understand a new concept |
| Wednesday | 7:30–9:00 PM | Try tools and experiments |
| Saturday | 10:00 AM–12:00 PM | Build something real |
| Sunday | 10:00–10:30 AM | Quiz, reflect, check evidence |

**Total:** five hours per week for 12 weeks, or about 60 guided hours. Younger learners can use 20–30-minute adult-guided sessions rather than all five hours.

## The 12-week roadmap

1. What AI is and where it's used
2. Model mechanics: LLM, GPU, weights, parameters, tokens
3. ChatGPT and Claude: prompts, grounding, errors and fact checking
4. Image generation and editing
5. Video generation, voiceovers and subtitles
6. Slides, presentations and everyday productivity
7. Finance, trading, manufacturing, design and literature
8. Agents, tools, triggers, APIs and approvals
9. Agents 1–3: morning planner, inbox sorter, budget helper
10. Agents 4–6: research, meeting and creative assistant
11. Agents 7–9: buyer advisor, quiz coach and maintenance planner
12. Vibe coding, accessibility, security and publishing

## Getting started — students

1. Open the deployed academy site in a modern browser (or open `index.html` locally after downloading files).
2. Choose a level: Young Explorers, Everyday Beginners, Practical Builders or Expert Lab.
3. Read the four level-specific missions and the capstone.
4. Follow the 12-week timetable, selecting one week at a time.
5. Copy the tutor prompt into an AI assistant, then perform the experiment yourself.
6. Use `workbook.html` for practical agent labs and detailed deployment steps.
7. Mark weeks complete. Progress stays in **your current browser only**; use **Export saved progress** to back it up.
8. Take the six-question quiz, improve wrong answers and share a finished project rather than just screenshots.

## Getting started — educators and parents

1. Select Young Explorers for most children aged 8–12, with supervision; check every external service's age requirements.
2. Prefer drawing, group games, and adult-demonstrated sessions; no accounts or paid tools are needed to teach the central ideas.
3. Do not enter children's photos, names, addresses, school details, voices or other private information into AI tools without appropriate safeguards and permission.
4. Encourage checking AI answers against trusted materials and asking people for help.
5. Let the learner explain what surprised them and one thing AI got wrong.

## Publish this repository to GitHub Pages

1. Open **https://github.com/jsankr/ai-academy**.
2. Ensure `index.html`, `workbook.html`, `course-data.json` and `README.md` are at the **root**, not nested in another `ai-academy` directory.
3. Select **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main**, folder **/(root)**, then **Save**.
6. Look for GitHub's Pages deployment success notice.
7. Open **https://jsankr.github.io/ai-academy/**.
8. Open a private browser window and verify the home page, the workbook, navigation, four level cards, one agent prompt, glossary search, quiz and progress tracker.
9. On failures, check **Actions → Pages build and deployment** for errors. Fix the files, commit and recheck.

## How to update course lessons

The page embeds its own course data to work without a server, while `course-data.json` is a readable content reference. When editing lesson text or exercises, update both copies (or refactor the page to load JSON from a local server); run syntax and UI tests after editing. Do not assume editing the JSON alone updates the current homepage.

## Privacy and safety

- No CDN, tracker, login, third-party script or API connection is used by this static site.
- Progress is stored in browser `localStorage`; it is not synced between devices.
- Agent instructions are **copyable prototypes**, not scheduled or connected automations.
- Do not expose passwords, access tokens, private financial data or personal records in public repositories.
- Financial/trading labs are educational. They do not promise returns or execute trades.
- Confirm external actions before agents send, delete, purchase, publish or change accounts.
- Review [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) and [GitHub Pages documentation](https://docs.github.com/en/pages/quickstart).

## Validation and limitations

Static checks can verify HTML/JavaScript syntax, file presence, local navigation, layout breakpoint rules and common unsafe patterns. **Actual live GitHub Pages deployment, real-device responsiveness, accessibility and end-to-end workflow behavior must still be verified in browsers.** A static inspection is not a penetration test, a zero-vulnerability claim or a guarantee of factual correctness. Current features of third-party AI platforms may change.

## Authoring references

- [OpenAI Academy](https://openai.com/academy/ai-fundamentals/)
- [OpenAI: understanding tokens](https://help.openai.com/en/articles/4936856-understanding-and-counting-tokens)
- [Anthropic: building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [n8n AI workflow tutorial](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/quickstart/)
- [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart)

### License

This course material is offered for personal learning and adaptation. Third-party brand names and linked tools belong to their respective owners. No official certification or affiliation is implied.