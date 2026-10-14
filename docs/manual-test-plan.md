# Manual test plan

Everything built so far, as checks you can click through on web. Each check names the testIDs it touches, so it can become a Playwright test later. When a check moves to Playwright, delete it here. Add checks in the same PR as the feature.

_Covers: sign-in, sign-up, Basecamp, fellow nomads, the Adventure Page road map, Degauss, and Plot a stop (through WAB-42)._

## Before you start

1. Docker running, then `npx supabase start`.
2. `npx supabase db reset` for a clean slate: just the two seed nomads, not connected, no stops.
3. In separate terminals: `npx supabase functions serve --env-file supabase/functions/.env` (search needs it) and `npx expo start --web`.
4. Open http://localhost:8081. Use two browser windows (one normal, one private) to be two nomads at once.

Seed nomads: `bart-harley-jarvis@dev.local` and `paul-bufano@dev.local`. The password is in `supabase/seed.sql`.

Check at a **wide window (900 px or more)** and a **narrow one (under 900 px)** wherever the layout changes.

## 1. Sign in and out

- [ ] Signed out, the app shows the sign-in screen with **Continue with Google** (`sign-in-google`) and the **DEV ONLY: test nomads** form.
- [ ] Wrong password in the dev form shows a red error (`email-sign-in-error`) and stays on sign-in.
- [ ] Bart's email and password (`email-sign-in-email`, `-password`, `-submit`) land on Basecamp.
- [ ] Reloading the page keeps you signed in.
- [ ] Your avatar and `OPERATOR: BART-HARLEY-JARVIS` (`account-button`) open **Sign out** (`account-sign-out`), which returns to sign-in. Works the same from the Adventure Page.
- [ ] Google sign-in works for Eben and Jake (test users on the consent screen).

## 2. Sign up: pick a username and avatar

Needs a user without a profile. Either sign in with a Google account that hasn't signed up locally, or make one in Studio (http://127.0.0.1:54323 → Authentication → Add user, with an `@dev.local` email, never `@test.local`) and sign in through the dev form.

- [ ] You land on **Pick a username** instead of Basecamp.
- [ ] Spaces and underscores turn into dashes as you type (`pick-username-input`).
- [ ] Half a second after you stop typing a valid name: "… is available" (`pick-username-availability`). `paul-bufano` (any capitals) says "… is taken".
- [ ] A bad name (`ab`, `-taffy`, `taffy--lee`) shows "Usernames are 3 to 24 letters or numbers, with single dashes between words" on **Continue** (`pick-username-error`).
- [ ] A good name with no picture says "Pick an avatar first".
- [ ] **Pick an avatar** (`pick-username-avatar-button`) opens the file picker and shows a round preview (`pick-username-avatar-preview`).
- [ ] **Continue** (`pick-username-continue`) lands on Basecamp with your picture in the header.
- [ ] **Sign out** (`pick-username-sign-out`) works from this screen.

## 3. Basecamp and fellow nomads

As Bart, with nobody connected yet:

- [ ] Header: "MEDIA ADVISORY BOARD · DEEP FIELD UNIT MAB-1", the red eye, BASECAMP, your account button, the hazard stripe.
- [ ] CH-01 shows `00` (`fellow-nomads-count`) and NO SIGNAL (`fellow-nomads-empty`).
- [ ] The `#username` placeholder (`add-nomad-input`) hides when you click in. **Send** (`add-nomad-send`) is disabled while the field is empty.
- [ ] `nobody-here` → red "No nomad named …" (`add-nomad-error`).
- [ ] Your own username → red "You can't connect with yourself".
- [ ] `paul-bufano` → "REQUEST SENT TO …" (`add-nomad-sent`). CH-02 shows OUTGOING TRANSMISSION · waiting for a yes (`outgoing-paul-bufano`).
- [ ] Sending to Paul again doesn't make a second request.

As Paul (second window):

- [ ] CH-02 shows INCOMING TRANSMISSION from Bart with Accept and Decline (`incoming-bart-harley-jarvis-accept`, `-decline`).
- [ ] **Decline:** the request disappears for Paul. Bart still sees "waiting for a yes".
- [ ] After declining, Paul sends a request to Bart → they're connected straight away (a declined nomad can change their mind).
- [ ] Or **Accept:** both see each other in CH-01 with their pictures, and the count reads `01`. Rows are `fellow-nomad-<username>`.
- [ ] With nothing pending, CH-02 says NO TRANSMISSIONS.

## 4. Adventure Page: getting there and the layout

Bart and Paul connected, no stops yet.

- [ ] Tapping a fellow nomad row opens `/adventure/<username>`.
- [ ] Header: back (`adventure-back`), ADVENTURE plate, both avatars, "You & paul-bufano" (`adventure-title`), `@paul-bufano · Fellow Nomad` (`adventure-nomad`), your account button.
- [ ] Back returns to Basecamp. Back also works after a reload of the Adventure Page (it goes home).
- [ ] Visiting `/adventure/someone-else` or a pending nomad shows NO SIGNAL (`adventure-not-found`).
- [ ] Tabs: **Movies** works. **Series** and **Books** are disabled with SOON (`adventure-tab-movies`, `-series`, `-books`).
- [ ] **Wide:** the road (2/3) and the Nav Console (1/3) side by side.
- [ ] **Narrow:** a switch between MY ROAD and PLOT <NAME>'S ROUTE (`adventure-view-road`, `adventure-view-console`).
- [ ] With no stops: road says NO STOPS YET (`road-empty`). Console says NO STOPS PLOTTED, 3 empty pips, "3 SLOTS OPEN. MAKE THEM COUNT." (`console-slots`).

## 5. Plot a stop (open slots)

As Bart, on Paul's page, Nav Console:

- [ ] **Plot a stop for paul-bufano** (`plot-stop-open`) opens the panel. Web: centered over a dark backdrop. Narrow/phone: full screen.
- [ ] Header reads "PLOT A STOP FOR PAUL-BUFANO · STOP 1 OF 3". Chips: **1 · SEARCH** lit, 2 · REASONS dim (`plot-stop-step-search`, `-plot`).
- [ ] ✕ (`plot-stop-close`) and clicking the backdrop (`plot-stop-backdrop`) both close it. Reopening starts with an empty search.

Search:

- [ ] One letter doesn't search. Two or more letters show SCANNING… then results (`media-search-input`, `media-search-result-<external_id>`) with posters (or a tape tile when there's none) and the TMDB notice.
- [ ] Nonsense like `zzqqxx` shows "NO SIGNAL. Nothing matches …".
- [ ] Stop `functions serve` and search → "Search is having trouble. Try again in a moment." Start it again afterwards.

Reasons:

- [ ] Picking a result moves to **2 · REASONS**: cover, title, year, and TMDB's first sentence (`plot-stop-overview`; cut with "…" when long, missing when TMDB has none).
- [ ] "GREAT STOP BECAUSE:" with REASON 1 · REQUIRED and REASON 2, 3 · OPTIONAL (`plot-stop-reason-1..3`).
- [ ] Reason 1's placeholder "Why should paul-bufano stop here?" hides when you click in. The focused field's border lights up.
- [ ] Fields stop at 140 characters.
- [ ] **Back to search** (`plot-stop-back`) shows your query and results again.
- [ ] **Plot it** (`plot-stop-submit`) with no reasons (or only spaces) → red "Give 1 to 3 reasons" (`plot-stop-error`). Typing clears it.
- [ ] **Plot it** with one reason → **STOP 1 PLOTTED** (`plot-stop-done-line`), "paul-bufano will see it on their road." **Back to the console** (`plot-stop-done`) closes it.
- [ ] The console shows stop 1 (`console-stop-<external_id>`) with a filled pip and "2 SLOTS OPEN…". Tapping it opens its reasons and "PAUL-BUFANO HASN'T REACHED IT YET".
- [ ] Reasons are saved trimmed, with blank fields dropped.

Already on your route:

- [ ] Plot again and search the same movie: it's dimmed with "ALREADY ON YOUR ROUTE" (`plot-stop-unavailable-<external_id>`) and tapping does nothing.
- [ ] Plot stops 2 and 3. After the 3rd, the done screen still says "STOP 3 PLOTTED" (its header doesn't flip to "Replace…"), and the console then shows "ROUTE FULL" in red with 3 pips.

## 6. Replace a stop (full route)

Bart's route for Paul has 3 stops.

- [ ] The console button is red: **Replace a stop on paul-bufano's route**.
- [ ] The panel header reads "REPLACE A STOP ON PAUL-BUFANO'S ROUTE". Chips: 1 · STOP TO REPLACE, 2 · SEARCH, 3 · REASONS.
- [ ] "PAUL-BUFANO'S ROUTE IS FULL. WHICH STOP ARE YOU REPLACING?" with your 3 stops (`plot-stop-replace-1..3`): rank, cover, title.
- [ ] **Find its replacement** (`plot-stop-replace-next`) is disabled until you choose one. The chosen row gets a red outline and REPLACING. You can change your choice.
- [ ] Search dims all 3 current stops, including the one being replaced.
- [ ] Reasons step shows the swap card (`plot-stop-swap`): STOP 2 · THE SWAP, **OUT** the old stop, dimmed (`plot-stop-swap-out`), **IN** the new one (`plot-stop-swap-in`). The button says **Replace**.
- [ ] **Replace** → **STOP 2 REPLACED**. The console shows the new movie at stop 2 and the old one is gone. Still ROUTE FULL.
- [ ] As Paul, Bart's road shows the new movie as stop 2.

## 7. Your road (what your navigator plotted for you)

As Paul, after Bart plotted 3 stops:

- [ ] **Wide:** the CRT map with a grid, a blinking YOU ARE HERE (`road-here`), and 3 stops spread out (`road-stop-<external_id>`), each with its own dotted line from YOU ARE HERE (line 1 boldest).
- [ ] No stop label is cut off, including two-line titles on stop 2.
- [ ] The faint green scan line sweeps down the map every 4 seconds.
- [ ] Tapping a stop shows it in the detail screen below (`road-detail`). Stop 1 shows at first.
- [ ] **Narrow:** a strip map top to bottom. Each stop opens in place to its reasons.
- [ ] Paul's own stops for Bart are NOT on Paul's road. Your road only shows what the other nomad plotted for you; your route for them lives in the console.

## 8. Degauss

Wide map, at least one stop on your road.

- [ ] The road map's header shows a small DEGAUSS key (`road-degauss`) with a green glowing LED (`road-degauss-light`).
- [ ] Pressing it: the map screen (`road-screen`) wobbles and flickers for about half a second, then the scan line stops and the LED goes dark.
- [ ] Reload: the line is still off. Press again: wobble, line back, LED lit.
- [ ] The choice is per browser: the private window still has its own setting.
- [ ] Mashing the key: the line ends up matching the LED, never out of step.
- [ ] Turn on reduce motion (macOS: System Settings → Accessibility → Display → Reduce motion): pressing switches straight away, no wobble.
- [ ] Narrow window: no DEGAUSS key and no scan line.

## 9. Privacy

- [ ] With a third nomad (made as in section 2) connected to Bart only: they can't see Bart and Paul's stops, and `/adventure/paul-bufano` shows NO SIGNAL for them.

## Not built yet (don't test)

Rating, rerouting and field reports (WAB-43). "Already reached: <encounter>" dimming (WAB-43). The Nomad's Log (WAB-44). Removing, reordering or editing stops. Series and books. Removing or blocking a nomad (WAB-30). Phones beyond a quick look (sign-in on phones needs a development build, WAB-6).
