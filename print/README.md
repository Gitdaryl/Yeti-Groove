# Studio NFC pieces

`cd print && npm install && node build.mjs` rebuilds `out/`. Edit copy in `build.mjs`, never in the PDFs.
`print/` is in `.vercelignore`, so none of this is served on yetigroove.com.

| Piece | Chip holds | Opens | Counted as |
|---|---|---|---|
| Contact card (in the wallet) | `https://www.yetigroove.com/card/tap` | /card: save contact, email, the reel | card / tap |
| QR on the back of the card | (printed) `.../card/qr` | /card | card / qr |
| Sticker on the back of the phone case | `https://www.yetigroove.com/review/tap` | Google review form | review / tap |
| `out/review-qr.png`, saved in Photos | (image) `.../review/qr` | Google review form | review / qr |
| Link in every delivery message | `yetigroove.com/review` | Google review form | review / link |

Counts show at the top of /admin (same admin key as orders). Code: `api/tap.js`, tests: `node --test tools/test_tap.mjs`.

## How each one gets used

- **Contact card: keep it.** "Tap your phone on this." Their phone opens /card, they hit Save contact, the card goes back in the wallet. One card, plus a spare.
- **Review sticker: the client says they love it.** "Hold your phone to the back of mine." The review form opens on their phone while they are standing there.
- **Delivery message: every final delivery**, because a lot of studio work ends with a link, not a handshake. Add this line to the message that sends the finished film or site:
  > If you have a minute, a Google review means a lot to the studio: yetigroove.com/review

Ask every client, happy or not. Never offer anything for a review and never ask for five stars: Google removes reviews that were bought or only asked of happy customers.

## Ordering (prices checked Oct 9 2026)

- **Contact card:** GoToTags "Printed PVC NFC Badge - NTAG213", 54 x 85.5 mm, **no hole punch**, printed both sides, upload `out/contact-card.pdf` (2 pages, 0.125 in bleed). Quantity 1 is allowed, about $14 a card with the second side, about 1 week.
- **Phone sticker:** GoToTags "Thin On-Metal NFC Sticker - NTAG213 - 30 mm Circle - Black", pack of 10 for $5.80, ships now. On-metal means it reads through MagSafe rings and metal plates. The spares cover Holly and anyone else.

## Writing the chips (iPhone XS or newer, or Android with NFC on)

1. NFC Tools app (free) > Write > Add a record > URL/URI.
2. Type the chip URL from the table above, exactly.
3. Write, and hold the phone to the card or sticker until it says done. Do not lock the chip: a locked chip can never be rewritten.
4. Test with someone else's phone, screen awake. If your own phone keeps popping the review link from its own case, move the sticker to a key fob or the back of the card wallet.
