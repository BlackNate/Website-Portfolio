# Trackscribe — 30s ad: "Never miss a subscription"

Vertical 1080×1920 / 30 fps / 30 s app-install ad built with **Remotion + Lottie** (`@remotion/lottie`).
It's designed for Reels, Shorts and TikTok. Bold kinetic type carries the message with the sound off,
and an ElevenLabs voiceover backs it up. Key content sits inside the platform safe zone (y ≈ 230–1700).

## Storyboard
| Time | Beat | On screen | Voiceover |
|---|---|---|---|
| 0–5 s | **Hook** | Debit-order cards stack up with alert rings and a ringing bell; the gym card gets a "Still paying?" sticker | "Netflix. Spotify. That gym membership you forgot about." |
| 5–11.6 s | **Problem** | Red-tinted scene: a −R587.99/month counter flips to −R7,055.88/year while coins drain, then a calendar gets a red ✗ | "Every month, small subscriptions quietly drain your account… and most of us never notice." |
| 11.6–14 s | **Reveal** | Violet circle wipe, burst, the logo builds itself, wordmark | "Meet Trackscribe." |
| 14–21.7 s | **Features 01/02/03** | Checklist with a subscription list · ringing bell with renewal reminders · growing chart with monthly spend | "Track every subscription… Get reminded before you're charged… See exactly what you're spending." |
| 22–30 s | **CTA** | "Never miss a subscription again." → logo lockup → Google Play badge | "Never miss a subscription again. Trackscribe. Get it on Google Play." |

## Design system
- **Type:** Plus Jakarta Sans 800/700/500 with tight tracking. Every headline word rises out of its own mask, and key words get a hand-drawn underline.
- **Colour:** night violet `#0B0616 → #1A0B2E`, brand violet `#8B5CF6`, lilac `#C4B5FD`, yellow highlight `#FFD23F` (carried over from the comic), red `#FF4D5E` for charges and mint `#2EE6A6` for wins.
- **Lottie:** all 8 animations (bell, checklist, chart, coins, missed-date calendar, burst, logo build, alert pulse) are drawn in code in
  `scripts/make_lottie.py` as vector shape layers with eased and overshoot keyframes, so they share one illustration style.
  Run `npm run lottie` to regenerate them, and preview them in the `LottieSheet` composition.
- **Third-party services** appear as letter tiles (N / S / G), not their logos.

## Sound
`scripts/make_sfx.py` synthesises a 120 BPM score arranged to the beats: a tense A-minor pulse, a half-time drone with a ticking clock,
a riser and impact into the reveal, then a bright C-major groove. It also makes the UI sounds (notification, pop, coin, whoosh, impact, sparkle).
The music ducks under the voiceover automatically.

## Voiceover (ElevenLabs)
Narrator: **Adrian Vale – Cinematic Narrator** (`S4WoGKoPsqqSNhvzIRmc`), model `eleven_v4`, 5 lines, 24.6 s total
(flow "Trackscribe 30s Ad - Never Miss a Subscription VO").

```bash
npm install
ELEVENLABS_API_KEY=sk_... npm run fetch-audio   # pulls the 5 takes into public/audio + writes src/audio-manifest.json
npm run render                                   # -> out/trackscribe-ad-30s.mp4
```
Without the voice files the ad renders with music and SFX only.
Set `REMOTION_CHROME` to use a specific Chrome or headless-shell binary.

## Files
`src/timing.ts` (beats and VO) · `src/Ad.tsx` (scenes) · `src/ui.tsx` (kinetic type, cards, badge, backdrop) · `src/Sound.tsx` (mix) · `src/lottie/*.json`
