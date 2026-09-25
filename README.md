# Antony's Garage Warehouse

**Source smarter, build faster.**

A Chrome/Edge extension that searches all your electronics seller sites at
once and shows real product titles, prices, and images side by side — pulled
live from each store, not a static database.

Built for [Antony's Garage](https://instagram.com/code_antony) — comes
pre-loaded with 46 Indian electronics/maker sellers (Robu.in, Makerbazar,
Robocraze, Evelta, KitsGuru, and more), but you can add or remove any store.

## Features

- **Live multi-store search** — searches every selected store in parallel and
  parses real results (Shopify JSON search API, WooCommerce markup, or a
  generic best-effort fallback for anything else).
- **Price range filter, sort by price/store/title, "Best price" badge** on
  the cheapest matching result.
- **Wishlist (♡)** — save any product for later; automatically flags it if a
  later search finds it cheaper somewhere.
- **Search history** — one-click re-run of your last 8 searches.
- **Export / Import backup** — your store list + wishlist as a JSON file.
- **Synced across devices** via `chrome.storage.sync` (falls back to local
  storage automatically if you're not signed into Chrome).
- **Keyboard shortcut**: `Ctrl+Shift+H` (`Cmd+Shift+H` on Mac) opens it
  instantly — rebind at `chrome://extensions/shortcuts` if it clashes with
  something.

## Install

Chrome doesn't allow one-click installs for extensions outside the Web
Store, so this loads the same way any developer-mode extension does — takes
about 30 seconds:

1. **Download this repo**: click the green **Code** button above →
   **Download ZIP** (or `git clone` if you're comfortable with that), then
   unzip it somewhere permanent — Chrome loads the extension from this
   folder every time, so don't delete it after installing.
2. Open `chrome://extensions` (or `edge://extensions` in Edge).
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the unzipped folder.
5. Click the puzzle-piece icon in your toolbar and pin **Antony's Garage
   Warehouse**.

## Use it

1. Click the icon (or hit `Ctrl+Shift+H`) — it opens a full tab.
2. Type a product, hit **Search** (or press Enter).
3. Each store is fetched live. You'll get real product cards where parsing
   succeeds, or "no results parsed — open manually" with a fallback link
   where it doesn't.
4. Tap **Manage stores** to add/remove/filter sellers — adding a new one
   will ask Chrome's permission to access that site (needed to read its
   search results).
5. Tap ♡ on any card to save it to your wishlist.

## How the parsing works, honestly

- **Shopify** stores: results come from the shop's predictive-search JSON
  API — fast and clean.
- **WooCommerce** stores: parsed from the standard WooCommerce product-loop
  markup.
- Anything else: a generic best-effort scan for prices near links, filtered
  to require an actual match on your search term (not just any shared word).
  It won't be perfect on every theme.
- A few stores run bot-protection (Cloudflare challenge pages, etc.) that
  blocks even this — those fall back to a manual "open" link.

If a store parses badly for you, open an issue with the store name and a
product page URL and it can get a tailored parser.

## Privacy

Everything (store list, wishlist, search history) is stored only in your own
browser via `chrome.storage`, synced through your own Chrome account if
you're signed in. Nothing is sent to any server this project controls —
requests go directly from your browser to the seller sites you've added.

## License

MIT — see [LICENSE](LICENSE). Fork it, add your own stores, send a pull
request if you build something worth sharing back.

## Connect

- GitHub: https://github.com/antonys-garage
- LinkedIn: https://www.linkedin.com/company/antonys-garage
- Instagram: https://www.instagram.com/code_antony/
- YouTube: https://www.youtube.com/@code_antony
- Facebook: https://www.facebook.com/codeantony
- Threads: https://www.threads.com/@code_antony/
- Email: info.antonysgarage@gmail.com
