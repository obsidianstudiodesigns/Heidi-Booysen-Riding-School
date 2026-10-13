# Heidi Booysen Riding School

Website for Heidi Booysen Riding School, horse riding lessons, outrides and therapeutic riding at Salmonsvlei Farm, Paarl.

Live: https://obsidianstudiodesigns.github.io/Heidi-Booysen-Riding-School/

## What's on the site

- `index.html`: stable-arch hero (the client's landing artwork, desktop and mobile versions) fading into the page, the R200 trial session, about Heidi, lessons, therapeutic riding, outrides, Ben and Flicka, your first visit and what to wear, horse treats order form, gallery with lightbox, FAQ, booking form and find us
- Booking and treat orders: no backend. Both forms write a WhatsApp message to 063 774 9148 (`WHATSAPP` at the top of `assets/js/main.js`). Nothing is sent until the visitor presses send in WhatsApp.
- `privacy.html` (POPIA, including children's and health information), `terms.html` (bookings, rider safety, therapeutic riding, yard rules, CPA, horse treats), `404.html`
- SEO and sharing: canonical URLs, Open Graph and Twitter tags with `og-image.jpg` (1200 x 630) for WhatsApp and Facebook previews, SportsActivityLocation + FAQPage JSON-LD, `sitemap.xml` (with images), `robots.txt`, favicon set and web manifest

## Content sources

- Facebook page (https://www.facebook.com/profile.php?id=61591862675695) and its flyers: services, ages from 4, trial session (15 minutes, R200), therapeutic riding benefits, Salmonsvlei Farm, taglines, horse treat prices (250 g R70, 500 g R120, 1 kg R170)
- Real photos from the Facebook page: Heidi, Ben and Flicka, the stables, arena, paddocks, horses, and three lesson photos cut from the trial-session flyer
- Client artwork: logo, desktop and mobile landing images. The stall plaques in the landing artwork named another estate (Vergelegen), so that lettering is softened in the web versions.
- Generated photoreal images (Figma AI), used where the page had no photo: little rider on the lead rein, cantering, therapeutic riding, scenic outride, horse treats

## To confirm with Heidi before promoting the site

- **WhatsApp number.** One flyer shows 064 774 9148; everything else says 063 774 9148, which the site uses.
- **Lesson, therapy and outride prices.** Not on Facebook, so the site says "ask Heidi". Add them if she wants them public.
- **Map pin.** The map shows Paarl in general; replace with an exact pin for Salmonsvlei Farm once confirmed.
- **Policies written as sensible defaults** in `terms.html`: indemnity form before the first ride, helmet lending, cancellations, dogs at the yard, photo consent. Adjust to how Heidi actually works.
- Heidi's photo is the selfie with a horse from the Facebook page. Swap if she prefers another.
- No reviews or testimonials are on the site. Add real ones when she has them.

## Tools

- `tools/make-assets.py`: builds web images, the transparent logo, favicons and app icons from `research/` and the client files (local only, not committed)
- `tools/sync-dims.py`: writes real width/height onto every `<img>` in a page
- `tools/og.html` + `tools/make-og.sh`: renders `og-image.jpg` with headless Chrome (needs the local server running)

## Local preview

```bash
python -m http.server 5193
```

## Deploying

GitHub Pages serves the `main` branch root. Commit and push to `main`.

Website designed by [Obsidian Studio Designs](https://obsidianstudiodesigns.co.za/).
