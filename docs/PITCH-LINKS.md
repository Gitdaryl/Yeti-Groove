# Personalized pitch links

Private. Internal working notes.

Every prospect gets their own URL for the Signature page:

```
https://www.yetigroove.com/signature/harborview
```

It serves the same page as `/signature`, so it is just as fast. What changes:

- A gold line above the headline: **PREPARED FOR HARBORVIEW LANDING**
- The inquiry form opens pre-filled with their project, company and name
- Every view, minute, film play and Inquire click is logged and texted to you

The point is not the personalization. The point is knowing that a developer
watched the Cove film twice on a Tuesday night, because that is a phone call
you can actually make.

## Adding a prospect

Edit `api/_pitches.js`, add a block, commit, deploy.

```js
'harborview': {
  project: 'Harborview Landing',
  contact: 'Dave Reynolds',        // optional, prefills the form
  company: 'Reynolds Development', // optional
  eyebrow: 'Prepared for Harborview Landing',  // optional override
  tier: 'Development Package',     // optional, preselects the tier
  note: 'Site plan approved 7/14. Sent 8/6 after the Chamber meeting.',
},
```

`note` is private. It never renders. It shows up in the engagement report so
you remember why you sent it.

Pick slugs nobody would guess or share by accident. Prefer the project name,
not the person's name.

## Checking your own link

Add `?preview=1`:

```
https://www.yetigroove.com/signature/harborview?preview=1
```

Nothing is logged and no alert fires. Use it every time you QA a link, or
your own phone will report the prospect opened it.

## Alerts you will get

| Event | Fires | Meaning |
|---|---|---|
| `view` | First open, then once per 30-minute gap | They opened it. Says which visit number. |
| `play` | Every time the Cove film is started | Strongest signal on the page. |
| `hot` | Once, at 2 minutes of visible time | They are actually reading, not skimming. |
| `cta` | Every Inquire click | They opened the form. Follow up even if they never submit. |
| `lead` | Form submitted | Full inquiry email and text. |

Heartbeats every 15 seconds are logged silently for the report, capped at 10
minutes so a tab left open overnight does not lie to you.

## Engagement report

```bash
curl -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  https://www.yetigroove.com/api/pitch-report | jq
```

Every prospect, most recent activity first. Never-opened sorts to the bottom.
One slug in detail, with every raw event:

```bash
curl -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  "https://www.yetigroove.com/api/pitch-report?slug=harborview" | jq
```

## How it stores data

One blob per event under `pitches/<slug>/events/`, never read-modify-write.
Content reads on Vercel Blob are CDN-cached, so a stale read would silently
drop history. Everything the report needs is encoded in the blob key name,
which means reporting is a pure `list()` with zero content fetches.

Leads land in `leads/<leadId>/lead.json`, written before any notification is
attempted. If Resend and Twilio are both down the lead still exists.

## What it does not do

- No cookies, no fingerprinting, no third-party analytics
- Cannot tell one person at a company from another
- Link previews are the standard Signature card, not personalized
- A prospect who forwards the link makes the forwardee look like them
