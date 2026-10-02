# Elite motion references — exactly three

**Rules.**
- These references are for **level, not look**. Nothing below is copied, traced or reused.
- No reference file is stored in this repo. Only the official URLs are saved.
- For the two Linear films, the official MP4s were opened once in a temporary scratch folder for frame analysis
  (8-frame contact sheets plus a scene-cut pass), then deleted.
- No brand asset from these companies may appear in a Prospectify video.

Researched 2026-10-02.

---

## 1 · Product UI motion — Linear, "Agent-assisted project updates"

| Field | Value |
|---|---|
| Category | Product UI motion |
| Brand / studio | Linear (in-house design team) |
| Official URL | https://linear.app/changelog/2026-06-18-agent-assisted-project-updates |
| Media | Official MP4 embedded on that page: `webassets.linear.app/…/47ba9e0b33dfcf931ed9dee36d3aa10542316269.mp4` |
| Specs (measured) | 1920×1080, **60 fps**, 19.0 s, AAC audio |
| Downloaded? | No. Analysed in a temporary scratch folder, then deleted |

**What it does (observed).**
- The real product UI is the only subject. There is no device mockup, no stock footage and no abstract 3D.
- The camera stays extremely close to one control at a time: the Update tab, then the status change
  "In Progress → Maintenance", then the target date "Apr 2026 → May 2026".
- **No hard cuts.** A scene-cut pass found zero cuts above threshold. Each beat hands over to the next through a
  fast lateral push with directional motion blur. Each shot then settles razor-sharp, so the viewer's eye can read.
- A real cursor and typing drive the action. The agent's reply streams in ("Thinking… I'll gather what changed…").
- Next, the camera pulls back to reveal the finished update card in context.
- The film ends on a plain black frame with the logo.
- Restraint: monochrome UI, one colour (the status icons), generous negative space.

**Why it is elite.** You understand the feature in about 15 seconds without a single word of voice-over. Motion is
used only to move attention, never as decoration.

**Lesson for Prospectify.**
- Shoot the real lead card, score and outreach UI as the hero subject: tight crops, one action per beat.
- Use blur-whips between beats, and a sharp hold whenever there is something to read.
- This validates the existing `Camera` + `CameraMotionBlur` approach. The UI must be the real Prospectify UI
  (`ui/landing-hero-product-mock.png` is the closest public proof), not an invented one.

---

## 2 · Typography / brand system — Linear, "Loops for product management"

| Field | Value |
|---|---|
| Category | Typography and brand-system motion |
| Brand / studio | Linear (in-house design team) |
| Official URL | https://linear.app/changelog/2026-09-14-loops-for-product-management |
| Media | Official MP4 embedded on that page: `webassets.linear.app/…/80f59b063433c661b3aeae3f613f0cf2a58d3a35.mp4` |
| Specs (measured) | 1920×1080, **60 fps**, 28.5 s |
| Downloaded? | No. Analysed in a temporary scratch folder, then deleted |

**What it does (observed).**
- The concept ("triggers → actions") becomes one graphic object: a single glowing dot travelling along a
  tick-marked arc.
- Each trigger name sits on the arc in wide-tracked monospace caps: "PROJECT STATUS CHANGES", "CYCLE STARTS",
  "FIND RELATED ISSUES", "UPDATE PRD DOCUMENT".
- The camera rotates around the arc with heavy depth of field, so labels come out of focus and fall back into blur.
- Strictly monochrome with a single light accent.
- It resolves to one plain sentence ("Automate product work with new triggers and actions"), then the logo on black.

**Why it is elite.** One idea, one object, one motion verb. Typography is set into space and moved by the camera,
not animated letter by letter. Every frame could be a poster.

**Lesson for Prospectify.**
- Build one brand object and keep it (for example, a signal or scan line that travels and locks onto a lead).
- Set type on it in space, use depth of field instead of effects, and end on one plain sentence.
- This is the antidote to letter-flip overuse. Keep Plus Jakarta Sans as the voice; at most one mono/tracked
  caption layer.

---

## 3 · Editing / sound / storytelling — Apple, "Behind the Mac: Skywalker Sound"

| Field | Value |
|---|---|
| Category | Editing, sound design, performance storytelling |
| Brand / studio | Apple, with Lucasfilm / Skywalker Sound |
| Official URLs | Film: https://www.youtube.com/watch?v=Kd8-nAf2VNk (Apple's channel) · Teaser: https://www.youtube.com/watch?v=arDDZjcbaXI · Newsroom: https://www.apple.com/newsroom/2022/05/uncovering-the-sounds-of-a-galaxy-far-far-away-with-mac/ · Cannes Lions entry: https://www.lovethework.com/work-awards/campaigns/behind-the-mac-skywalker-sound-1540543 |
| Released | 4 May 2022 |
| Downloaded? | No (YouTube; not ours to download). Not frame-analysed here: the notes below come from Apple's newsroom text and published descriptions of the edit. The award level was not confirmed |

**What it does.**
- The film proves its own thesis with editing: it strips sound away from familiar picture so you feel what is lost,
  then rebuilds the mix stem by stem.
- Sound designers build effects from real-world sources on screen, so the audience hears the cause before the result.

**Why it is elite.** The sound is the story, not wallpaper under the picture. Silence is used as a beat.

**Lesson for Prospectify.**
- Give every UI event its own designed sound (search tick, scan sweep, score lock, message send), synced to the
  frame through the shared `timeline.json`.
- Use one deliberate drop to near-silence before the reveal (the lead locks / the client signs).
- Mix the voice-over first, then cut and duck the music around it. This matches the existing `build_audio.py`
  pipeline (ducking, −14 LUFS).

---

## PROSPECTIFY SYNTHESIS

- **Take from 1:** the real product UI as the protagonist; tight crops; one action per beat; blur-whip transitions;
  sharp reading holds; a real cursor and real typing.
- **Take from 2:** one ownable brand object that carries the concept, type placed in space, depth of field,
  restraint (black, text and one accent: `#f42562`), ending on one plain sentence.
- **Take from 3:** sound as structure. Every UI event has a designed sound, silence works as a beat, and the
  voice-over leads the mix.
- **Do not take:**
  - Linear's monochrome palette, logo or typography;
  - Apple / Lucasfilm material of any kind;
  - any shot composition copied one-to-one.
- **Prospectify's own spin:** CHAOS (a noisy map full of businesses) → SIGNAL (the opportunity surfaces) → SCAN
  (score 0-100) → LOCK (the lead card) → READY (outreach + AI prompt + tracked).
