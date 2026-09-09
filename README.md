# mishleyotis.github.io

Portfolio of Mishley Otiende — AI engineer, financial services.
Live at <https://mishleyotis.github.io/>.

A static site: pure HTML, CSS and one small script. No build step, no package
manager, no third-party requests at runtime. Open `index.html` locally or serve
this directory with any web server.

```
index.html                    home
my-story.html                 background and experience
projects.html                 the six projects
dma-insights.html             ┐
dma-plugin.html               │
capability-intelligence.html  │ the six case studies
pmo-knowledge-agent.html      │
automation-fabric.html        │
float-desserts.html           ┘
volunteer-work.html
tech-stack.html
prototype/   9 static walkthrough screens of the DMA Insights client surface
docs/        12 specification documents (PRDs, TRDs, schemas, plans)
work/        3 interactive prototype apps, each a self-contained bundle
assets/      fonts, images, shared stylesheet and script
```

## Notes for future edits

**Fonts are self-hosted.** `assets/site.css` carries the `@font-face` rules.
DM Sans is a single variable font (`wght 100–1000`), so one pair of files
covers every weight the pages and documents use. Don't re-add the Google Fonts
link — it was removed deliberately, so the site has no runtime dependency.

**`assets/site.js` is load-bearing.** It drives the scroll reveals, the hero
portrait tilt, and the anchor re-apply that makes an inbound `index.html#…`
land on the right section once layout settles. The reveal is opt-in: the
script releases everything already on screen *before* arming the hidden state,
so the first painted frame is complete and the page still reads with
JavaScript disabled. Delete the script and the page stays readable; the
animation is what's lost.

**The three prototype apps run in the page.** On `dma-insights.html` and
`capability-intelligence.html` the browser-chrome card holds a real `<iframe>`
of the app, not a screenshot. `assets/site.js` attaches the frame only as the
card approaches the viewport — the native `loading="lazy"` was not enough, it
still fetched several megabytes before the reader had scrolled anywhere near.
The screenshot remains as the card's CSS background, so the card shows the
right thing while the bundle unpacks, and is what a reader without JavaScript
sees. Each bundle is 2.4–4.7MB, and two sit on one page, so this deferral is
what keeps those pages light.

**`work/` holds bundles, not pages.** Each unpacks itself at runtime and
replaces the document. They're byte-sensitive — edit the source they were
exported from, not these files.

**`.nojekyll` is intentional.** Nothing here needs Jekyll, and bypassing it
keeps GitHub Pages from reinterpreting paths.

## Custom domain

Add a `CNAME` file at the repository root containing the bare domain, e.g.:

```
mishleyotiende.com
```

Then at your DNS provider point the apex at GitHub Pages with four `A` records
— `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
— and add a `CNAME` record for `www` pointing at `mishleyotis.github.io`.
GitHub issues the TLS certificate automatically once DNS resolves; then tick
*Enforce HTTPS* under Settings → Pages.
