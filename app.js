/* ---------- store data ---------- */
const DEFAULT_STORES = [
["Tomson Electronics","https://www.tomsonelectronics.com/"],
["ETstore","https://www.etstore.in/"],
["Makerbazar","https://makerbazar.in/"],
["Robocraze","https://robocraze.com/"],
["Hubtronics","https://hubtronics.in/"],
["Robu.in","https://robu.in/"],
["Flyrobo","https://www.flyrobo.in/"],
["Rytronics","https://www.rytronics.in/"],
["Techtonics","https://techtonics.in/"],
["Evelta","https://evelta.com/"],
["iFuture Tech","https://ifuturetech.org/"],
["Robodo","https://robodo.in/"],
["PCB Cupid","https://pcbcupid.com/"],
["ThinkRobotics","https://thinkrobotics.com/"],
["KTRON India","https://www.ktron.in/"],
["Silverline Electronics","https://www.silverlineelectronics.in/"],
["rhydoLABZ","https://www.rhydolabz.com/"],
["OceanLabz","https://www.oceanlabz.in/"],
["Technetronics","https://www.tenettech.com/"],
["Stemvolt","https://stemvolt.in/"],
["Olo Bit Shop","https://www.olobit.in/"],
["Harish Projects","https://harishprojects.com/"],
["Indian Hobby Center","https://www.indianhobbycenter.com/"],
["Hacktronics","https://hacktronics.co/"],
["techiesms","https://techiesms.com/"],
["ESCLabs","https://www.esclabs.in/"],
["Mifira Electronics","https://mifraelectronics.com/"],
["REES52","https://rees52.com/"],
["ChipTronicX","https://chiptronicx.com/"],
["The Engineer Store","https://www.theengineerstore.in/"],
["Robobazar","https://robobazar.in/"],
["RoboTools","https://robotools.in/"],
["DEPOKE","https://www.depoke.in/"],
["BonziCart","https://www.bonzicart.com/"],
["Punoscho","https://punoscho.in/"],
["PandaByte","https://www.pandabyte.in/"],
["TechHobby","https://techhobby.in/"],
["Silicon TechnoLabs","https://silicontechnolabs.in/"],
["Rare Components","https://rarecomponents.com/"],
["OpenELAB","https://openelab.com/"],
["Controllers Tech","https://shop.controllerstech.com/"],
["ERL Tech Online","https://erltechonline.com/"],
["AtoZ Electronix","https://atozelectronix.com/"],
["Elecsynergy","https://elecsynergy.in/"],
["Roboracter","https://roboracter.in/"],
["KitsGuru","https://kitsguru.com/"]
].map((s,i)=>({id:"s"+i, name:s[0], url:s[1], tmpl:"", selected:true, added:i, used:0}));

// ---------- storage: chrome.storage.sync (chunked, since each item caps at
// 8KB) with automatic fallback to chrome.storage.local, and one-time
// migration from this extension's older localStorage-only versions. ----------
const SYNC_CHUNK = 6000;
async function syncSet(key, value){
  const json = JSON.stringify(value);
  try{
    const chunks = [];
    for(let i=0;i<json.length;i+=SYNC_CHUNK) chunks.push(json.slice(i,i+SYNC_CHUNK));
    const old = await chrome.storage.sync.get(key+'_meta');
    const oldCount = old[key+'_meta'] || 0;
    const obj = { [key+'_meta']: chunks.length };
    chunks.forEach((c,i)=>{ obj[key+'_c'+i] = c; });
    await chrome.storage.sync.set(obj);
    if(oldCount > chunks.length){
      const toRemove = [];
      for(let i=chunks.length;i<oldCount;i++) toRemove.push(key+'_c'+i);
      await chrome.storage.sync.remove(toRemove);
    }
  }catch(e){
    try{ await chrome.storage.local.set({ [key]: json }); }catch(e2){ /* give up silently */ }
  }
}
async function syncGet(key){
  try{
    const metaRes = await chrome.storage.sync.get(key+'_meta');
    const count = metaRes[key+'_meta'];
    if(count){
      const keys = []; for(let i=0;i<count;i++) keys.push(key+'_c'+i);
      const res = await chrome.storage.sync.get(keys);
      let json = ''; for(let i=0;i<count;i++) json += res[key+'_c'+i] || '';
      return JSON.parse(json);
    }
  }catch(e){}
  try{
    const localRes = await chrome.storage.local.get(key);
    if(localRes && localRes[key]) return JSON.parse(localRes[key]);
  }catch(e){}
  try{ const legacy = localStorage.getItem(key); if(legacy) return JSON.parse(legacy); }catch(e){}
  return null;
}

async function loadStoresAsync(){ const v = await syncGet('ch_stores'); return v || DEFAULT_STORES; }
async function save(){ await syncSet('ch_stores', stores); }
let stores = DEFAULT_STORES;
let storeSort = 'name-asc', filterText = '', manageOpen = false;

function domainOf(url){ try{ return new URL(url).hostname.replace('www.',''); }catch(e){ return url; } }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderStores(){
  const grid = document.getElementById('grid');
  grid.style.display = manageOpen ? 'grid' : 'none';
  let list = stores.filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()) || domainOf(s.url).includes(filterText.toLowerCase()));
  if(storeSort==='name-asc') list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(storeSort==='name-desc') list.sort((a,b)=>b.name.localeCompare(a.name));
  else if(storeSort==='recent') list.sort((a,b)=>b.added-a.added);
  else if(storeSort==='used') list.sort((a,b)=>(b.used||0)-(a.used||0));

  grid.innerHTML = list.length ? list.map(s => `
    <div class="store">
      <div class="top">
        <input type="checkbox" class="selChk" data-id="${s.id}" ${s.selected?'checked':''}>
        <div style="flex:1">
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="domain">${escapeHtml(domainOf(s.url))}</div>
        </div>
      </div>
      <input class="tmpl" data-id="${s.id}" placeholder="optional: native search URL with {q}" value="${escapeHtml(s.tmpl||'')}">
      <div class="actions">
        <button class="small danger removeBtn" data-id="${s.id}">Remove</button>
      </div>
    </div>`).join('') : '<div class="empty">No stores match that filter.</div>';

  document.getElementById('selCount').textContent = stores.filter(s=>s.selected).length + ' of ' + stores.length + ' stores selected';
}
function toggleSel(id,val){ const s=stores.find(x=>x.id===id); if(s){ s.selected=val; save(); renderStores(); } }
function setTmpl(id,val){ const s=stores.find(x=>x.id===id); if(s){ s.tmpl=val.trim(); save(); } }
function removeStore(id){ stores=stores.filter(x=>x.id!==id); save(); renderStores(); }

// Extension pages run under a strict default CSP that silently blocks inline
// onclick/onchange="..." attributes (they'd count as inline script). The grid's
// contents are rebuilt often, so instead of re-attaching handlers per render,
// one listener on the container (event delegation) covers every card forever.
document.getElementById('grid').addEventListener('change', e=>{
  const id = e.target.dataset.id;
  if(!id) return;
  if(e.target.classList.contains('selChk')) toggleSel(id, e.target.checked);
  else if(e.target.classList.contains('tmpl')) setTmpl(id, e.target.value);
});
document.getElementById('grid').addEventListener('click', e=>{
  const btn = e.target.closest('.removeBtn');
  if(btn) removeStore(btn.dataset.id);
});

document.getElementById('filterBox').oninput = e=>{ filterText=e.target.value; renderStores(); };
document.getElementById('storeSortSel').onchange = e=>{ storeSort=e.target.value; renderStores(); };
document.getElementById('selAll').onclick = ()=>{ stores.forEach(s=>s.selected=true); save(); renderStores(); };
document.getElementById('selNone').onclick = ()=>{ stores.forEach(s=>s.selected=false); save(); renderStores(); };
document.getElementById('toggleManage').onclick = ()=>{ manageOpen=!manageOpen; renderStores(); };
document.getElementById('toggleAdd').onclick = ()=>{
  const b=document.getElementById('addBox'); b.style.display = b.style.display==='none'?'block':'none';
};
document.getElementById('cancelNew').onclick = ()=>{ document.getElementById('addBox').style.display='none'; };

document.getElementById('saveNew').onclick = async ()=>{
  const name = document.getElementById('newName').value.trim();
  let url = document.getElementById('newUrl').value.trim();
  if(!name || !url){ alert('Enter both a name and a URL.'); return; }
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const host = domainOf(url);
  const granted = await chrome.permissions.request({ origins: [`https://*.${host}/*`] });
  if(!granted){ alert('Permission was not granted, so this store can only be opened manually, not searched live. Add it anyway?') ; }
  stores.push({id:'s'+Date.now(), name, url, tmpl:'', selected:true, added:Date.now(), used:0});
  save();
  document.getElementById('newName').value=''; document.getElementById('newUrl').value='';
  document.getElementById('addBox').style.display='none';
  manageOpen = true;
  renderStores();
};

/* ---------- search + parse pipeline ---------- */
let allProducts = [];
let prodSort = 'price-asc';

async function loadWishlistAsync(){ const v = await syncGet('ch_wishlist'); return v || []; }
async function saveWishlist(){ await syncSet('ch_wishlist', wishlist); }
let wishlist = [];
function isWished(url){ return wishlist.some(w=>w.url===url); }
function toggleWish(url){
  const idx = wishlist.findIndex(w=>w.url===url);
  if(idx>=0){ wishlist.splice(idx,1); }
  else{
    const p = allProducts.find(x=>x.url===url);
    if(p) wishlist.push({title:p.title, price:p.price, priceNum:p.priceNum, store:p.store, url:p.url, image:p.image, savedAt:Date.now()});
  }
  saveWishlist();
  renderWishlist();
  renderProducts();
}
function renderWishlist(){
  document.getElementById('wishSummary').textContent = `♡ Wishlist (${wishlist.length})`;
  document.getElementById('wishGrid').innerHTML = wishlist.length ? wishlist.slice().reverse().map(p => `
    <div class="prod">
      ${p.image ? `<img src="${escapeHtml(p.image)}" loading="lazy">` : ''}
      <div class="body">
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="price">${escapeHtml(p.price || 'price on site')}${p.priceDropped && p.previousPrice ? `<span class="dropNote">🔻 was ${escapeHtml(p.previousPrice)}</span>` : ''}</div>
        <div class="store">${escapeHtml(p.store)}</div>
        <div class="cardActions">
          <a class="buy" href="${p.url}" target="_blank" rel="noopener">View ↗</a>
          <button class="small danger unwishBtn" data-url="${escapeHtml(p.url)}">Remove</button>
        </div>
      </div>
    </div>`).join('') : '<div class="empty">No saved items yet — tap ♡ on any product card to save it here for later.</div>';
}
let wishOpen = false;
document.getElementById('wishToggle').onclick = ()=>{
  wishOpen = !wishOpen;
  document.getElementById('wishGrid').style.display = wishOpen ? 'grid' : 'none';
  document.getElementById('wishChev').textContent = wishOpen ? '▾' : '▸';
};
document.getElementById('wishGrid').addEventListener('click', e=>{
  const btn = e.target.closest('.unwishBtn');
  if(btn) toggleWish(btn.dataset.url);
});

// ---------- search history ----------
async function loadHistoryAsync(){ const v = await syncGet('ch_history'); return v || []; }
async function saveHistory(){ await syncSet('ch_history', searchHistory); }
let searchHistory = [];
function addHistory(q){
  q = q.trim(); if(!q) return;
  searchHistory = searchHistory.filter(h=>h.toLowerCase() !== q.toLowerCase());
  searchHistory.unshift(q);
  if(searchHistory.length > 8) searchHistory = searchHistory.slice(0,8);
  saveHistory();
  renderHistory();
}
function renderHistory(){
  const el = document.getElementById('historyChips');
  if(!searchHistory.length){ el.innerHTML=''; el.style.display='none'; return; }
  el.style.display = 'flex';
  el.innerHTML = searchHistory.map(h => `<button class="chip historyChip" data-q="${escapeHtml(h)}">${escapeHtml(h)}</button>`).join('');
}
document.getElementById('historyChips').addEventListener('click', e=>{
  const btn = e.target.closest('.historyChip');
  if(btn){ document.getElementById('query').value = btn.dataset.q; runSearch(); }
});

// ---------- export / import backup ----------
document.getElementById('exportBtn').onclick = ()=>{
  const payload = { stores, wishlist, searchHistory, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'antonys-garage-warehouse-backup.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 3000);
};
document.getElementById('importBtn').onclick = ()=>{ document.getElementById('importFile').click(); };
document.getElementById('importFile').addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async ()=>{
    try{
      const data = JSON.parse(reader.result);
      if(Array.isArray(data.stores)) stores = data.stores;
      if(Array.isArray(data.wishlist)) wishlist = data.wishlist;
      if(Array.isArray(data.searchHistory)) searchHistory = data.searchHistory;
      await save(); await saveWishlist(); await saveHistory();
      renderStores(); renderWishlist(); renderHistory(); renderProducts();
      alert('Backup imported.');
    }catch(err){ alert('That file could not be read as a valid backup.'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

function parsePrice(text){
  if(!text) return null;
  const m = text.replace(/,/g,'').match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}
function abs(base, href){ try{ return new URL(href, base).href; }catch(e){ return href; } }

// A wrong search-URL guess often 200s into a homepage/related-products/
// "no results, but you might like..." section instead of real results.
// Matching on ANY shared word was too loose - a stray generic word like
// "module" or "board" let a totally unrelated product pass as relevant.
// Fix: prefer digit-containing tokens (part numbers like "esp32", "5807m",
// "sx1278") as decisive matches, and drop overly generic filler words from
// the pool entirely so they can't count on their own.
const GENERIC_WORDS = new Set(['for','with','and','the','module','board','kit','sensor','set',
  'pack','pcs','piece','pieces','new','original','pro','mini','type','model','item',
  'buy','online','price','india','set','the','a','an']);
function queryTokens(q){
  const raw = q.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>=2);
  const meaningful = raw.filter(w=>!GENERIC_WORDS.has(w) && w.length>=3);
  return meaningful.length ? meaningful : raw.filter(w=>w.length>=3);
}
function isRelevant(title, qTokens){
  if(!title) return false;
  if(qTokens.length===0) return true;
  const t = title.toLowerCase().replace(/[^a-z0-9\s]/g,' ');
  const strong = qTokens.filter(w=>/\d/.test(w));
  const pool = strong.length ? strong : qTokens;
  const matches = pool.filter(w=>t.includes(w));
  if(strong.length) return matches.length > 0; // a real part-number match is decisive on its own
  return matches.length >= Math.max(1, Math.ceil(pool.length/2)); // otherwise require most of the words
}

// Prefer the *current* price: strip crossed-out original price (del/s/strike)
// before reading text, so a "₹999 ₹799" sale block returns ₹799, not ₹999.
function priceFromElement(container){
  if(!container) return '';
  const priceEl = container.querySelector('.price');
  if(priceEl){
    const clone = priceEl.cloneNode(true);
    clone.querySelectorAll('del, s, strike').forEach(n=>n.remove());
    const t = clone.textContent.replace(/\s+/g,' ').trim();
    if(t) return t;
  }
  const amt = container.querySelector('.amount, .money');
  if(amt) return amt.textContent.trim();
  return (container.textContent||'').trim();
}

async function fetchWithTimeout(url, ms){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), ms);
  try{ const r = await fetch(url, {signal: ctrl.signal}); return r; } finally{ clearTimeout(t); }
}

async function fetchStoreProducts(store, q){
  const origin = new URL(store.url).origin;

  // 1) Shopify predictive-search JSON endpoint (fast, structured, no HTML parsing needed)
  const qTokensJson = queryTokens(q);
  try{
    const jUrl = origin + '/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=10';
    const r = await fetchWithTimeout(jUrl, 7000);
    if(r.ok){
      const data = await r.json();
      const items = data && data.resources && data.resources.results && data.resources.results.products;
      if(items && items.length){
        const mapped = items.filter(p=>isRelevant(p.title, qTokensJson)).map(p => ({
          title: p.title, price: p.price || p.price_max || '', priceNum: parsePrice(p.price||''),
          url: abs(origin, p.url), image: p.image || '', store: store.name
        }));
        if(mapped.length) return mapped;
      }
    }
  }catch(e){ /* not shopify or blocked, fall through */ }

  // 2) HTML search page - try store's custom template, else common guesses
  const qTokens = queryTokens(q);
  const candidates = [];
  if(store.tmpl && store.tmpl.includes('{q}')) candidates.push(store.tmpl.replace('{q}', encodeURIComponent(q)));
  candidates.push(origin + '/search?q=' + encodeURIComponent(q));
  candidates.push(origin + '/?s=' + encodeURIComponent(q) + '&post_type=product');

  for(const url of candidates){
    try{
      const r = await fetchWithTimeout(url, 8000);
      if(!r.ok) continue;
      const html = await r.text();
      // If the page text doesn't mention any word from the search at all,
      // it's almost certainly not a real results page (e.g. a redirect to
      // the homepage) - skip it rather than parse whatever happens to be there.
      const lowerHtml = html.toLowerCase();
      if(qTokens.length && !qTokens.some(w=>lowerHtml.includes(w))) continue;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      let items = [];

      if(html.toLowerCase().includes('woocommerce')){
        doc.querySelectorAll('li.product, .products .product, .product-grid-item').forEach(el=>{
          const title = (el.querySelector('.woocommerce-loop-product__title, h2, h3')||{}).textContent;
          const priceText = priceFromElement(el);
          const link = (el.querySelector('a')||{}).href;
          const img = (el.querySelector('img')||{}).src;
          if(title && link && isRelevant(title, qTokens)) items.push({title:title.trim(), price:(priceText||'').trim(), priceNum:parsePrice(priceText), url:abs(origin,link), image:img||'', store:store.name});
        });
      }
      if(!items.length){
        doc.querySelectorAll('.product-card, .card-wrapper, .grid-product, .product-item, .grid__item').forEach(el=>{
          const title = (el.querySelector('.card__heading, .product-card__title, .grid-product__title, h2, h3, a')||{}).textContent;
          const priceText = priceFromElement(el);
          const link = (el.querySelector('a')||{}).href;
          const img = (el.querySelector('img')||{}).src;
          if(title && link && isRelevant(title, qTokens)) items.push({title:title.trim(), price:(priceText||'').trim(), priceNum:parsePrice(priceText), url:abs(origin,link), image:img||'', store:store.name});
        });
      }
      if(!items.length){
        // generic best-effort: anchors near a currency-looking price
        doc.querySelectorAll('a').forEach(a=>{
          const txt = a.textContent || '';
          const parent = a.closest('li, div, article') || a.parentElement;
          const blockText = parent ? parent.textContent : txt;
          const m = blockText.match(/(₹|Rs\.?|INR)\s?[\d,]+(\.\d+)?/i);
          if(m && a.href && items.length < 15){
            const img = parent ? parent.querySelector('img') : null;
            const heading = parent ? parent.querySelector('h1,h2,h3,h4') : null;
            const title = (heading && heading.textContent.trim()) || a.getAttribute('title') || txt.trim();
            if(title && isRelevant(title, qTokens)) items.push({title:title.slice(0,120), price:m[0], priceNum:parsePrice(m[0]), url:abs(origin,a.href), image: img?img.src:'', store:store.name});
          }
        });
      }
      if(items.length) return items.slice(0,12);
    }catch(e){ /* try next candidate */ }
  }
  return null; // nothing parsed
}

function buildManualLink(store, q){
  if(store.tmpl && store.tmpl.includes('{q}')) return store.tmpl.replace('{q}', encodeURIComponent(q));
  return new URL(store.url).origin + '/search?q=' + encodeURIComponent(q);
}

function renderStatus(rows){
  const found = rows.filter(r=>r.ok).length;
  document.getElementById('statusSummary').textContent = `Store status — ${found} of ${rows.length} stores returned results`;
  document.getElementById('statusline').innerHTML = rows.map(r => `
    <div class="statusrow">
      <span>${escapeHtml(r.name)}</span>
      <span>${r.ok ? `<span class="ok">${r.count} found</span>` : `<span class="warn">no results parsed</span> — <a href="${r.link}" target="_blank" rel="noopener">open manually ↗</a>`}</span>
    </div>`).join('');
}

let statusOpen = false;
document.getElementById('statusToggle').onclick = ()=>{
  statusOpen = !statusOpen;
  document.getElementById('statusline').style.display = statusOpen ? 'flex' : 'none';
  document.getElementById('statusChev').textContent = statusOpen ? '▾' : '▸';
};

function getPriceBounds(){
  const min = parseFloat(document.getElementById('minPrice').value);
  const max = parseFloat(document.getElementById('maxPrice').value);
  return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
}

function renderProducts(){
  const { min, max } = getPriceBounds();
  let list = allProducts.filter(p => {
    if(min===null && max===null) return true;
    if(p.priceNum==null) return false; // can't tell if it fits a price range without a parsed price
    if(min!==null && p.priceNum < min) return false;
    if(max!==null && p.priceNum > max) return false;
    return true;
  });
  if(prodSort==='price-asc') list.sort((a,b)=>(a.priceNum??Infinity)-(b.priceNum??Infinity));
  else if(prodSort==='price-desc') list.sort((a,b)=>(b.priceNum??-Infinity)-(a.priceNum??-Infinity));
  else if(prodSort==='store') list.sort((a,b)=>a.store.localeCompare(b.store));
  else if(prodSort==='title') list.sort((a,b)=>a.title.localeCompare(b.title));

  const pricedNums = list.map(p=>p.priceNum).filter(n=>n!=null);
  const bestPrice = pricedNums.length ? Math.min(...pricedNums) : null;

  const filteredNote = (min!==null || max!==null) ? ` (of ${allProducts.length} total)` : '';
  document.getElementById('resultCount').textContent = list.length + ' products found' + filteredNote;
  document.getElementById('prodgrid').innerHTML = list.map(p => `
    <div class="prod ${bestPrice!=null && p.priceNum===bestPrice ? 'best' : ''}">
      ${bestPrice!=null && p.priceNum===bestPrice ? '<div class="bestBadge">Best price</div>' : ''}
      <button class="wishBtn ${isWished(p.url)?'active':''}" data-url="${escapeHtml(p.url)}" title="Save for later">${isWished(p.url)?'❤':'♡'}</button>
      ${p.image ? `<img src="${escapeHtml(p.image)}" loading="lazy">` : ''}
      <div class="body">
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="price">${escapeHtml(p.price || 'price on site')}</div>
        <div class="store">${escapeHtml(p.store)}</div>
        <a class="buy" href="${p.url}" target="_blank" rel="noopener">View on site ↗</a>
      </div>
    </div>`).join('');
}
// <img onerror> attributes are inline handlers too (same CSP block as before) -
// delegate the 'error' event instead. It doesn't bubble, so listen in the capture phase.
document.getElementById('prodgrid').addEventListener('error', e=>{
  if(e.target.tagName === 'IMG') e.target.style.display = 'none';
}, true);
document.getElementById('prodgrid').addEventListener('click', e=>{
  const btn = e.target.closest('.wishBtn');
  if(btn) toggleWish(btn.dataset.url);
});

document.getElementById('prodSortSel').onchange = e=>{ prodSort=e.target.value; renderProducts(); };
document.getElementById('minPrice').oninput = renderProducts;
document.getElementById('maxPrice').oninput = renderProducts;

async function runSearch(){
  const q = document.getElementById('query').value.trim();
  if(!q){ alert('Type a product to search first.'); return; }
  const sel = stores.filter(s=>s.selected);
  if(!sel.length){ alert('Select at least one store.'); return; }

  addHistory(q);
  allProducts = [];
  document.getElementById('resultsbar').style.display = 'flex';
  document.getElementById('resultCount').textContent = 'Searching ' + sel.length + ' stores...';
  document.getElementById('prodgrid').innerHTML = '';
  document.getElementById('statusAccordion').style.display = 'block';
  const statusRows = sel.map(s=>({name:s.name, ok:false, count:0, link:buildManualLink(s,q), done:false}));
  renderStatus(statusRows);
  sel.forEach(s=>{ s.used=(s.used||0)+1; }); save();

  sel.forEach((store, idx) => {
    fetchStoreProducts(store, q).then(items=>{
      if(items && items.length){
        allProducts.push(...items);
        statusRows[idx].ok = true; statusRows[idx].count = items.length;

        // If any of these results match something already in the wishlist
        // at a lower price than what was saved, update it and flag the drop.
        let wlChanged = false;
        items.forEach(it=>{
          const w = wishlist.find(x=>x.url===it.url);
          if(w && it.priceNum!=null && (w.priceNum==null || it.priceNum < w.priceNum)){
            w.previousPrice = w.price; w.price = it.price; w.priceNum = it.priceNum; w.priceDropped = true;
            wlChanged = true;
          }
        });
        if(wlChanged){ saveWishlist(); renderWishlist(); }
      }
      renderStatus(statusRows);
      renderProducts();
    }).catch(()=>{ renderStatus(statusRows); renderProducts(); });
  });
}

async function init(){
  stores = await loadStoresAsync();
  wishlist = await loadWishlistAsync();
  searchHistory = await loadHistoryAsync();
  renderStores();
  renderWishlist();
  renderHistory();
  // persist once so pre-update localStorage data (if any) migrates into sync storage
  save(); saveWishlist(); saveHistory();
}
init();

document.getElementById('doSearch').onclick = runSearch;
document.getElementById('query').addEventListener('keydown', e=>{
  if(e.key === 'Enter') runSearch();
});