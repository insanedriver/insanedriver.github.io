# Cyberpunk Newsletter Context

**Gathered:** 2026-09-12
**Spec:** `.specs/features/newsletter-cyberpunk/spec.md`
**Status:** Ready for implementation after spec approval

---

## Feature Boundary

Redesign the existing newsletter page with the site's established cyberpunk language, refresh its English copy, preserve its Mailchimp contract, and improve responsive and accessible form behavior.

---

## Implementation Decisions

### Visual hierarchy

- Use three panels: an introduction, a benefits display, and the signup form.
- Draw from the HUD panels, neon borders, clipped corners, scanlines, separators, and ticker used by Band and Contact.
- Keep newsletter-specific labels and data text so the page has its own purpose within the shared visual system.

### Content

- Lead with `Join the Insane Network`.
- Keep all page copy in English.
- State the three existing benefits clearly: early news, promotions and prizes, and exclusive content.
- Use cyberpunk flavor in short interface labels without obscuring instructions or benefits.

### Form behavior

- Preserve the existing Mailchimp URL, audience fields, bot trap, POST method, and new-tab target.
- Keep email and the complete country list.
- Use native required and email constraints before external submission.
- Style visible focus and invalid states within the cyberpunk palette.
- Do not create real subscriber data during verification.

### Responsive behavior and motion

- Use one column on mobile and a centered readable width on larger viewports.
- Prevent text, select controls, and decorative layers from causing horizontal page overflow.
- Disable nonessential animation under `prefers-reduced-motion: reduce`.

### Agent's Discretion

- Exact HUD labels, ticker copy, icon choices, spacing, and breakpoint values within the approved structure.
- CSS organization, provided Newsletter styles remain isolated and Band and Contact output stays unchanged.

### Declined / Undiscussed Gray Areas → Assumptions

- None. All identified visual, content, external-flow, validation, responsive, and motion decisions were resolved.

---

## Specific References

- `/band/` for rich cyberpunk content treatment and responsive components.
- `/contact/` for concise panel composition, HUD labels, separators, and ticker treatment.

---

## Deferred Ideas

- Shared extraction of cyberpunk primitives across Band, Contact, and Newsletter.
- In-page AJAX integration with custom Mailchimp success and error handling.
