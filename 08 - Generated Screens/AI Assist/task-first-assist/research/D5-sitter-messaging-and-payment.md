# D5 · How parents message and pay a sitter who doesn't have Sprout

17 Nov 2026 · for Ahmad, then Tony. Feedback: sitters won't have the Sprout app (not now, maybe later). Sprout should
open WhatsApp or iMessage with a pre-written message. How the parent pays is open.

> **Update 17 Nov (Ahmad):** the reply link is parked. Sitters will just text back ("yes, I can"), which Sprout
> can't read, so the parent tells Sprout who's free: a "Who can make it?" card with Free / Can't per sitter, and a nudge an
> hour later if nobody's marked. The booking (with the address) and a thank-you to the others also go from the
> parent's phone. Payment section unchanged.

## The constraint that drives everything

If the message goes from the **parent's own phone**, Sprout can't see the reply. The prototype today says "I'll tell
you when someone answers" and shows replies coming back. That only works if the reply comes through Sprout somehow.

## 1 · Messaging: four ways

| | How it works | Sprout sees replies? | Cost and rules | Trust for the sitter |
|---|---|---|---|---|
| **A. Parent's phone, plain text** | Sprout opens the native Messages compose sheet (in-app, MessageUI) or a WhatsApp chat (`wa.me/<number>?text=`) with the text filled in. Parent taps Send. | No. Parent has to tell Sprout ("Alex said yes"). | Free, no registration | High: it's the parent's number |
| **B. Parent's phone + reply link** ✅ | Same as A, but the message ends with a short Sprout link. The sitter taps it (web page, no app, no login), picks *I'm free* / *Can't make it*, adds a rate. | **Yes**, for anyone who taps the link. Text replies still go to the parent, who can mark them in Sprout. | Free, no registration | High |
| C. Sprout's own number | Sprout texts the sitter from a Sprout number; sitter replies YES/NO. | Yes | US A2P 10DLC brand + campaign registration (paid account, days to approve), carrier consent rules, STOP handling. Sitters never opted in to Sprout. | Low: unknown number |
| D. WhatsApp Business API | Sprout sends from a WhatsApp Business account | Yes | Pre-approved templates, opt-in, per-message cost | Low to medium |

Facts that shape this:
- A `wa.me` link opens one chat with the text as a draft; the parent still presses Send. There is **no link for
  several people or a group**, and the link tells Sprout nothing about whether it was sent or answered.
  Prefilled text is reported as capped around 140 characters, so the WhatsApp version must be short.
- iOS: an in-app compose sheet (MessageUI / `expo-sms`) opens with recipient + text filled and reports *sent* or
  *cancelled* back to the app. An `sms:` URL with `&body=` also works but is undocumented by Apple, so use the sheet.
  Multiple recipients in one sheet = a group text, which would share numbers; we send one per sitter instead.
- Sprout's own number (C) needs 10DLC registration and documented consent from each recipient. A sitter who only got
  a parent's request never consented to Sprout, so this is the riskiest path.

**Recommendation: B.** It keeps the parent's number (the sitter knows who's asking), costs nothing, needs no
carrier registration, and still lets Sprout show "Alex is free" and nudge the parent. Per sitter the parent picks the
channel once (Messages or WhatsApp) and Sprout remembers it.

What the parent does for 3 sitters: tap *Send to Alex* → compose sheet → Send → back in Sprout → *Send to Sam* → … (one
sheet per sitter, numbers stay private). That's 3 extra taps versus today's single "Send to 3 sitters" button.

Example message (fits WhatsApp's limit):
> Hi Alex! Free to watch Maya (7) and Jake (5) Sat Aug 1, 6:30–10 PM? Tap to answer: spr.to/r/7KQ2 · Tony

The reply page (sitter's phone, web): Tony's name and photo, date and time, kids' first names and ages, *I'm free*
/ *Can't make it*, optional rate, optional note. No address until the parent books. Same pattern as our web
group-chat join page.

## 2 · Payment: three ways

| | How it works | Who does this today | Sprout earns? | Effort and risk |
|---|---|---|---|---|
| **1. Pay directly** ✅ now | Parent pays cash, Venmo, Zelle, Apple Cash. Sprout shows the estimate, and at the end of the night offers *Pay Alex $88*: opens Venmo with amount + note filled (if Alex's Venmo is saved) or *Paid in cash*. Sprout records it. | Most families; Care.com writes about paying sitters by Venmo; cash still most common for paying teens | No | Very low. Venmo's documented web link (`venmo.com/?txn=pay&recipients=…&amount=…&note=…`) prefills; the `venmo://` app scheme is undocumented, test on device |
| 2. Pay in Sprout (Stripe Connect Express) | Sitter sets up payouts once through a Stripe web link (no app; Stripe hosts identity and bank), parent pays with the saved card / Link we already use, money lands in 2–5 days | Bambino (cashless, Stripe, service fee on the parent); UrbanSitter (membership, pays into the sitter's synced bank) | Yes: a booking fee | High: sitter onboarding friction for a $90 night, tax forms (1099-K), refunds and disputes, under-18 sitters need a guardian (Bambino handles this) |
| 3. Both | Direct by default; *Pay in Sprout* appears only for sitters who set up payouts | — | Some | Medium |

**Recommendation: 1 now, keep 2 as a later business-model decision for Tony.** Most of our sitters are someone the
family already knows. Asking them to verify identity with Stripe before a Saturday night is the kind of friction
that makes parents text them directly instead. Revisit Stripe Connect when Sprout starts finding new sitters for
families (then a fee is earned).

## What changes in the prototype if this is approved

1. Message preview card: the button becomes **Send to Alex** and opens a Messages or WhatsApp compose sheet (shown as
   a mock sheet), one sitter at a time, with a *Sent to Alex ✓* row after each.
2. New phone: **the sitter's reply page** (web, no app): *I'm free* / *Can't make it* + rate.
3. Replies: tapped answers arrive automatically; a quiet *Got a text reply? Mark it* link covers sitters who just
   text back.
4. Saved sitter gets a **channel** (Messages / WhatsApp) and an optional **Venmo**.
5. After the night (push the next morning): *How was Alex?* + **Pay Alex $88** (Venmo) / **Paid in cash**, then it's
   logged. This also feeds the "Sat for you 5 times" count.

## Decisions needed

1. Messaging B (parent's phone + reply link)? Or A only (no link, parent marks replies)?
2. Payment: direct now, Stripe Connect later?
3. Default channel per sitter: Messages unless the parent picks WhatsApp?

## Sources

- WhatsApp click-to-chat: [Bird](https://bird.com/explained/whatsapp/what-is-a-whatsapp-click-to-chat-link), [Unipile](https://www.unipile.com/fr/?p=275019), [Zipchat](https://zipchat.ai/whatsapp-link-generator)
- iOS compose: [expo-sms docs](https://docs.expo.dev/versions/latest/sdk/sms), [Apple MFMessageComposeViewController](https://developer.apple.com/tutorials/data/documentation/messageui/mfmessagecomposeviewcontroller.md), [sms: body separator (Sendblue)](https://docs.sendblue.com/guides/imessage-link-button/), [West Wind](https://weblog.west-wind.com/posts/2013/Oct/09/Prefilling-an-SMS-on-Mobile-Devices-with-the-sms-Uri-Scheme)
- 10DLC: [Twilio A2P 10DLC quickstart](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart), [Twilio SMS compliance](https://support.twilio.com/hc/en-us/articles/4408675845019-SMS-Compliance-and-A2P-10DLC-in-the-US), [Twilio approval tips](https://www.twilio.com/en-us/blog/insights/best-practices/improving-your-chances-of-a2p10dlc-registration-approval)
- Sitter apps: [Bambino payments](https://support.bambinoapp.com/support/solutions/articles/14000138880-how-does-payment-work-), [Bambino under 18](https://support.bambinoapp.com/support/solutions/articles/14000158606-how-do-payments-work-for-sitters-under-18-), [UrbanSitter blog](https://blog.urbansitter.com/?p=2704), [UrbanSitter fee history (VatorNews)](https://vator.tv/2016-05-21-how-does-urbansitter-make-money/)
- Stripe Connect Express: [Stripe Express onboarding](https://stripe.com/ie/blog/connect-express-onboarding), [Stripe connected accounts](https://docs.stripe.com/docs/connect/accounts)
- Paying sitters: [Venmo payment links](https://venmo.com/paymentlinks), [Care.com on Venmo](https://www.care.com/c/wp-json/wp/v2/posts/211684), [MissionSquare 2025 teens and money](https://research.missionsq.org/content/media/document/2025/6/113053_How%20Teens%20Handle%20Money_S.pdf)
