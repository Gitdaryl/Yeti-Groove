// Prospect registry for personalized Signature Film pitch links.
//
// Every prospect gets their own URL: yetigroove.com/signature/<slug>
// The page is the same file (CDN-cached, fast); only the hero eyebrow, the
// contact line, and the lead-form prefill change. Views, dwell time, film
// plays and CTA clicks are logged per slug and alerted to the studio.
//
// To add a prospect: copy a block, pick a slug that is short and guessable
// by nobody, fill in the fields, commit, deploy. See docs/PITCH-LINKS.md.

export const PITCHES = {
  // ---- example, safe to delete once real prospects are in ----
  'demo': {
    project: 'Your Project',
    contact: '',
    company: 'Demo',
    // Optional. Overrides the hero eyebrow. Keep it short, it sits above the H1.
    eyebrow: 'Prepared for Your Project',
    // Optional. Which tier the lead form should preselect.
    tier: 'Signature Film',
    // Private. Never rendered. Shows up in the engagement report only.
    note: 'Example entry.',
  },
};

export function getPitch(slug) {
  if (!slug) return null;
  const key = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  if (!key || !PITCHES[key]) return null;
  return { slug: key, ...PITCHES[key] };
}

// What the browser is allowed to see. `note` stays server-side.
export function publicPitch(p) {
  if (!p) return null;
  const label = p.project || p.company || '';
  return {
    slug: p.slug,
    project: p.project || '',
    company: p.company || '',
    contact: p.contact || '',
    tier: p.tier || '',
    eyebrow: p.eyebrow || (label ? `Prepared for ${label}` : ''),
  };
}
