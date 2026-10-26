/* Travora — static demo layer. Replaces the Laravel backend (auth, favorites, bookings, planner, AI concierge).
   Everything lives in the browser (localStorage). Nothing is sent to a server. */
(function () {
  'use strict';
  var D = window.TRV_DATA || { destinations: [], users: [], bookings: [], favDefault: [] };
  var script = document.currentScript || document.querySelector('script[src$="js/travora-static.js"]');
  var ROOT = (script && script.getAttribute('src') || 'js/travora-static.js').replace(/js\/travora-static\.js$/, '');
  var PAGE = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  var AREA = ROOT ? 'admin' : '';

  /* ---------------- state ---------------- */
  var KEY = 'trv-static-state-v1';
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.favorites) return s; } catch (e) {}
    var n = { session: null, favorites: D.favDefault.slice(), bookings: [], extraUsers: [], nextId: 100 };
    try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {}
    return n;
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function users() { return D.users.concat(S.extraUsers); }
  function me() { return S.session ? users().filter(function (u) { return u.email === S.session; })[0] || null : null; }
  function dest(id) { return D.destinations.filter(function (d) { return d.id === +id; })[0]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function priceNum(d) { return parseFloat(String(d.price).replace(/[$,]/g, '')); }
  function homeFor(u) { return ROOT + (u && u.role === 'admin' ? 'admin/dashboard.html' : (ROOT ? '../' : '') + 'index.html').replace(/^(\.\.\/)?(\.\.\/)/, '../'); }
  function homeUrl(u) { return u && u.role === 'admin' ? ROOT + 'admin/dashboard.html' : ROOT + 'index.html'; }

  /* ---------------- toast (uses the site's own .travora-toast styles) ---------------- */
  function toast(msg, type) {
    var ex = document.querySelector('.travora-toast'); if (ex) ex.remove();
    var t = document.createElement('div'); t.className = 'travora-toast' + (type === 'error' ? ' removed' : '');
    t.innerHTML = '<i class="fas ' + (type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle') + '"></i><span>' + esc(msg) + '</span>';
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 50);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2800);
  }
  window.trvToast = toast;

  /* ---------------- AI concierge (port of AiAssistantController::generateResponse) ---------------- */
  function fixLinks(t) {
    return t.replace(/\]\(\/planner\)/g, '](' + ROOT + 'planner.html)').replace(/\]\(\/destination\/(\d+)\)/g, '](' + ROOT + 'destination-$1.html)').replace(/\]\(\/booking\/(\d+)\)/g, '](' + ROOT + 'booking-$1.html)');
  }
  function aiResponse(message) {
    var msg = message.toLowerCase(), i, d;
    for (i = 0; i < D.destinations.length; i++) {
      d = D.destinations[i];
      if (msg.indexOf(d.title.toLowerCase()) > -1 || msg.indexOf(d.country.toLowerCase()) > -1 || msg.indexOf(d.region.toLowerCase()) > -1) return destResp(d, message);
    }
    if (/\b(hi|hello|hey|salam|assalam|hola)\b/.test(msg)) return { intent: 'greeting', text: "Hello! 👋 I'm Travora AI, your personal travel concierge. I can help you:\n\n✈️ **Plan a trip** — Tell me a destination and I'll create an itinerary\n💰 **Budget your journey** — Get a cost breakdown\n🧳 **Packing lists** — What to bring\n🍜 **Food tips** — Where and what to eat\n🏨 **Where to stay** — Smart area tips\n\nWhat would you like to explore today?" };
    if (/\b(budget|cost|price|money|expensive|cheap|afford)\b/.test(msg)) {
      var bm = msg.match(/\$?(\d{3,6})/), b = bm ? parseInt(bm[1], 10) : 2000;
      return { intent: 'budget', text: "Here's a suggested budget breakdown for a **$" + b + "** trip:\n\n✈️ **Flights:** $" + Math.round(b * 0.30) + "\n🏨 **Accommodation:** $" + Math.round(b * 0.35) + "\n🍽️ **Food:** $" + Math.round(b * 0.20) + "\n🎯 **Activities:** $" + Math.round(b * 0.15) + "\n\n**Total: $" + b + "**\n\n💡 *Tip: Book flights 6-8 weeks in advance for the best deals. Travel during shoulder season (April-May or September-October) to save 20-30%.*" };
    }
    if (/\b(pack|packing|bring|carry|suitcase|bag)\b/.test(msg)) return { intent: 'packing', text: "Here's a **smart packing list** for your trip:\n\n📄 **Essentials**\n☑ Passport & visa\n☑ Travel insurance\n☑ Boarding passes\n☑ Credit cards & cash\n\n👕 **Clothing**\n☑ 5-7 T-shirts\n☑ 2 pairs of pants/jeans\n☑ 1 jacket (weather-dependent)\n☑ Comfortable walking shoes\n☑ Sleepwear\n\n🔌 **Electronics**\n☑ Phone + charger\n☑ Power adapter\n☑ Power bank\n☑ Camera\n☑ Headphones\n\n💊 **Health**\n☑ Prescription meds\n☑ Pain relievers\n☑ Band-aids\n☑ Hand sanitizer\n\n💡 *Tip: Roll your clothes instead of folding — saves 30% space!*" };
    if (/\b(food|eat|restaurant|cuisine|dish|breakfast|lunch|dinner|hungry)\b/.test(msg)) return { intent: 'food', text: "🍜 **Food Recommendations**\n\nWhen traveling, I always recommend:\n\n🌅 **Breakfast:** Find a local café away from tourist areas — usually 50% cheaper and 10x better\n🌞 **Lunch:** Street food is your friend! Look for busy stalls with locals\n🌙 **Dinner:** Ask your hotel/hostel staff for their favorite local spot\n\n**Must-try experiences:**\n☑ Local market tour\n☑ Cooking class (2-3 hours)\n☑ Food walking tour\n☑ Family-run restaurant\n\n💡 *Tell me a specific destination and I'll give you personalized food recommendations!*" };
    if (/\b(plan|itinerary|schedule|days?|trip|journey)\b/.test(msg)) {
      var dm = msg.match(/(\d+)\s*days?/), days = dm ? dm[1] : 5;
      return { intent: 'itinerary', text: "I'd love to plan a **" + days + "-day trip** for you! 🌍\n\nTo create the perfect itinerary, tell me:\n\n1️⃣ **Where** do you want to go? (e.g., Turkey, Japan, Italy)\n2️⃣ **What's your budget?** (e.g., $2000)\n3️⃣ **Travel style?** (Solo / Couple / Family / Friends)\n4️⃣ **Interests?** (Adventure / Culture / Food / Relaxation)\n\n💡 *Or just say: \"Plan 7 days in Turkey with $2500 budget\" and I'll create it instantly!*\n\nFor a detailed AI-powered itinerary, try our [AI Trip Planner](/planner) →" };
    }
    if (/\b(weather|rain|sunny|cold|hot|temperature|season)\b/.test(msg)) return { intent: 'weather', text: "🌤️ **Weather-Aware Travel Tips**\n\nBefore you go, always check:\n\n📱 **Apps:** Weather.com, AccuWeather, or Windy\n🌡️ **Best seasons:**\n• Europe: April-June & September-October\n• Asia: November-February (dry season)\n• Tropics: Avoid monsoon months\n\n💡 *Pro tip: Travel during shoulder season — fewer crowds, lower prices, and still great weather!*\n\nTell me your destination and I'll suggest the best time to visit." };
    if (/\b(hotel|hostel|stay|accommodation|where to stay|sleep)\b/.test(msg)) return { intent: 'hotel', text: "🏨 **Where to Stay — Smart Tips**\n\nInstead of picking a random hotel, choose an **area** first:\n\n📍 **Near attractions** — Convenient, but pricier\n📍 **Local neighborhoods** — Authentic, cheaper, better food\n📍 **Near transit** — Best for exploring multiple areas\n\n**Booking tips:**\n☑ Book 6-8 weeks ahead\n☑ Read recent reviews (last 3 months)\n☑ Check cancellation policy\n☑ Compare on Booking.com, Agoda, and direct hotel sites\n\n💡 *Tell me a destination and I'll recommend the best areas to stay!*" };
    if (/\b(flight|fly|airline|airport|plane)\b/.test(msg)) return { intent: 'flights', text: "✈️ **Flight Booking Tips**\n\n📅 **Best time to book:** 6-8 weeks before departure\n📆 **Cheapest days to fly:** Tuesday, Wednesday, Saturday\n⏰ **Best time to search:** Tuesday mornings\n\n**Tools to use:**\n☑ Google Flights (best for flexibility)\n☑ Skyscanner (best for deals)\n☑ Kayak (best for price alerts)\n☑ Momondo (best for hidden fares)\n\n💡 *Pro tip: Set price alerts and be flexible with dates — can save you 40%!*" };
    return { intent: 'general', text: "I'm here to help with your travel planning! 🌍\n\nHere's what I can do:\n\n✈️ **\"Plan 7 days in Turkey\"** — Get a full itinerary\n💰 **\"Budget for Japan trip\"** — Get cost breakdown\n🧳 **\"What to pack for Iceland\"** — Packing list\n🍜 **\"Best food in Italy\"** — Food recommendations\n🏨 **\"Where to stay in Paris\"** — Hotel area tips\n🌤️ **\"Best time to visit Bali\"** — Weather info\n🌍 **\"Recommend a beach destination\"** — Get suggestions\n\nTry asking me anything about travel! For a full AI itinerary, visit our [Trip Planner](/planner)." };
  }
  function destResp(d, original) {
    var msg = original.toLowerCase(), t;
    if (/\b(plan|itinerary|days?|schedule)\b/.test(msg)) {
      var dm = msg.match(/(\d+)\s*days?/), days = dm ? dm[1] : 5;
      t = '🌍 **' + days + '-Day Itinerary for ' + d.title + ', ' + d.country + '**\n\n📍 **Region:** ' + d.region + '\n⭐ **Rating:** ' + d.rating + '/5\n💰 **Starting from:** ' + d.price + ' per person\n📅 **Best time:** ' + d.best_time + '\n\n**Highlights to experience:**\n';
      d.highlights.forEach(function (h) { t += '☑ ' + h + '\n'; });
      t += '\n💡 *For a detailed day-by-day itinerary, visit our [AI Trip Planner](/planner) and enter "' + d.title + '".*';
      return { intent: 'destination_itinerary', text: t, cards: [d] };
    }
    t = '🌟 **' + d.title + ', ' + d.country + '**\n\n' + d.description + '\n\n**Quick Facts:**\n📅 **Best time:** ' + d.best_time + '\n🗣️ **Language:** ' + d.language + '\n💵 **Currency:** ' + d.currency + '\n⭐ **Rating:** ' + d.rating + '/5\n💰 **From:** ' + d.price + ' per person\n\n**Top Highlights:**\n';
    d.highlights.slice(0, 4).forEach(function (h) { t += '☑ ' + h + '\n'; });
    t += '\n[View full details](/destination/' + d.id + ') • [Book this trip](/booking/' + d.id + ')';
    return { intent: 'destination_info', text: t, cards: [d] };
  }

  /* ---------------- Trip planner (port of PlannerController::generateLocalItinerary) ---------------- */
  var ACT = {
    morning: ['Start with a local breakfast at a recommended café', 'Visit the main landmark and take a guided tour', 'Explore the historic old town on foot', 'Take a sunrise photography walk', 'Join a local cooking class', 'Visit the famous local market'],
    afternoon: ['Try regional cuisine at a hidden gem restaurant', 'Visit museums and cultural sites', 'Take a scenic boat or walking tour', 'Explore local artisan shops', 'Relax at a nearby beach or park', 'Join a guided adventure activity'],
    evening: ['Watch the sunset from a viewpoint', 'Enjoy dinner at a rooftop restaurant', 'Experience local nightlife', 'Take an evening walking tour', 'Attend a cultural performance', 'Relax at a spa or hammam'],
    tip: ['Book tickets online to skip queues', 'Learn a few local phrases — locals love it', 'Carry cash for small vendors', 'Visit popular spots early morning to avoid crowds', "Try street food — it's often the best", 'Use public transport for authentic experience', 'Dress modestly when visiting religious sites', 'Keep a day free for spontaneous exploration']
  };
  function planTrip(b) {
    var destination = b.destination || 'Anywhere interesting', style = b.style || 'Explorer', days = Math.max(1, Math.min(30, parseInt(b.days, 10) || 1)), budget = parseInt(b.budget, 10) || 0, interests = (b.interests && b.interests.length) ? b.interests : ['General'];
    var it = [];
    for (var i = 1; i <= days; i++) {
      var title = i === 1 ? 'Arrival & First Impressions' : (i === days ? 'Final Day & Departure' : 'Exploring ' + destination + ' — Day ' + i);
      it.push({ day: i, title: title, morning: ACT.morning[(i - 1) % ACT.morning.length], afternoon: ACT.afternoon[(i - 1) % ACT.afternoon.length], evening: ACT.evening[(i - 1) % ACT.evening.length], tip: ACT.tip[(i - 1) % ACT.tip.length] });
    }
    return { success: true, source: 'local', itinerary: it, summary: { destination: destination, days: days, budget: budget, style: style, interests: interests },
      costs: { flights: Math.round(budget * 0.30), accommodation: Math.round(budget * 0.35), food: Math.round(budget * 0.20), activities: Math.round(budget * 0.15), total: budget } };
  }

  /* ---------------- fetch shim ---------------- */
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  function route(url, method, body) {
    var u = String(url);
    if (/favorites\.toggle|\/favorites\/toggle/.test(u)) {
      var id = parseInt(body.id, 10), i = S.favorites.indexOf(id), action;
      if (i > -1) { S.favorites.splice(i, 1); action = 'removed'; } else { S.favorites.push(id); action = 'added'; }
      save(); return { status: 200, data: { success: true, action: action, count: S.favorites.length, id: id } };
    }
    if (/favorites\.clear|\/favorites\/clear/.test(u)) { S.favorites = []; save(); return { status: 200, data: { success: true, message: 'All favorites cleared' } }; }
    if (/planner\.generate|\/planner\/generate/.test(u)) {
      if (!body.days || !body.budget) return { status: 422, data: { message: 'The days and budget fields are required.' } };
      return { status: 200, data: planTrip(body) };
    }
    if (/ai\.assistant\.chat|\/ai-assistant\/chat/.test(u)) {
      var msg = String(body.message || '').trim(); if (!msg) return { status: 422, data: { message: 'The message field is required.' } };
      var r = aiResponse(msg); r.text = fixLinks(r.text);
      return { status: 200, data: { success: true, response: r.text, intent: r.intent, cards: r.cards || [], conversation_id: Date.now() } };
    }
    if (/admin\/bookings\/[^/]+\/status|bookings\.status/.test(u)) { var st = body.status || 'pending'; return { status: 200, data: { success: true, message: 'Booking status updated to ' + st.charAt(0).toUpperCase() + st.slice(1), status: st } }; }
    return null;
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '', method = ((init && init.method) || 'GET').toUpperCase(), body = {};
    try { body = init && init.body ? JSON.parse(init.body) : {}; } catch (e) {}
    var r = route(url, method, body);
    if (r) return new Promise(function (resolve) { setTimeout(function () { resolve(new Response(JSON.stringify(r.data), { status: r.status, headers: { 'Content-Type': 'application/json' } })); }, 350); });
    return realFetch ? realFetch(input, init) : Promise.reject(new Error('offline'));
  };

  /* ---------------- access rules (was the auth / guest / admin middleware) ---------------- */
  function redirect(u) { location.replace(u); return true; }
  (function guard() {
    var u = me();
    var needsLogin = /^(profile|booking-\d+|booking-success)\.html$/.test(PAGE) && !ROOT;
    if (needsLogin && !u) return redirect(ROOT + 'login.html?next=' + encodeURIComponent(PAGE + location.search));
    if (AREA === 'admin' && PAGE !== 'login.html' && (!u || u.role !== 'admin')) return redirect(ROOT + (u ? 'index.html' : 'admin/login.html'));
    if (((/^(login|register)\.html$/.test(PAGE) && !ROOT) || (AREA === 'admin' && PAGE === 'login.html')) && u) return redirect(homeUrl(u));
  })();

  /* ---------------- page sync ---------------- */
  var DEMO = { name: 'Demo User', email: 'user@travora.com', first: 'Demo' };
  function retext(u) {
    if (!u || u.email === DEMO.email || u.role === 'admin') return;
    var first = (u.name || '').split(' ')[0], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = walker.nextNode())) { if (n.parentNode && !/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) list.push(n); }
    list.forEach(function (t) { var v = t.nodeValue, o = v; v = v.split(DEMO.name).join(u.name).split(DEMO.email).join(u.email).replace(/\bDemo\b/g, first); if (v !== o) t.nodeValue = v; });
    document.querySelectorAll('input').forEach(function (i) { if (i.value === DEMO.name) i.value = u.name; else if (i.value === DEMO.email) i.value = u.email; });
  }
  function syncNav() {
    var u = me(), role = u && u.role === 'admin' ? 'admin' : 'customer';
    document.querySelectorAll('[data-nav-role]').forEach(function (n) { if (n.getAttribute('data-nav-role') !== role) n.remove(); });
    document.querySelectorAll('[data-auth="user"]').forEach(function (el) { el.hidden = !u; });
    document.querySelectorAll('[data-auth="guest"]').forEach(function (el) { el.hidden = !!u; });
    var c = document.getElementById('navFavCount'); if (c) { c.textContent = S.favorites.length; c.classList.toggle('d-none', S.favorites.length === 0); }
    document.querySelectorAll('.favorite-btn[data-id], .favorite-btn-large[data-id]').forEach(function (b) {
      var on = S.favorites.indexOf(+b.getAttribute('data-id')) > -1, ic = b.querySelector('i');
      b.classList.toggle('active', on); if (ic) ic.className = (on ? 'fas' : 'far') + ' fa-heart';
      var ft = b.querySelector('.fav-text'); if (ft) ft.textContent = on ? 'Saved to Favorites' : 'Add to Favorites';
    });
    if (u) retext(u);
  }
  function renderFavorites() {
    var grid = document.getElementById('favoritesGrid'); if (!grid || PAGE !== 'favorites.html') return;
    var list = S.favorites.map(dest).filter(Boolean);
    var sec = grid.closest('.container-fluid');
    if (!list.length) {
      sec.innerHTML = '<div class="empty-state text-center py-5"><div class="empty-icon mb-4"><i class="far fa-heart"></i></div><h2 class="font-syne fw-bold mb-3">No favorites yet</h2><p class="text-white-50 mb-4" style="max-width: 500px; margin: 0 auto;">Start exploring and tap the heart icon on any destination to save it here for later.</p><a href="explore.html" class="btn travora-btn-primary magnetic-btn"><i class="fas fa-compass me-2"></i> Explore Destinations</a></div>';
      return;
    }
    var cnt = document.getElementById('favPageCount'); if (cnt) cnt.textContent = list.length;
    grid.innerHTML = list.map(function (d) {
      return '<div class="col-md-6 col-lg-4" data-fav-id="' + d.id + '"><div class="glass-card p-3 p-md-4 rounded-4 position-relative overflow-hidden h-100 destination-card"><button class="favorite-btn active" data-id="' + d.id + '" title="Remove from favorites"><i class="fas fa-heart"></i></button>' +
        '<a href="destination-' + d.id + '.html" class="text-decoration-none"><div class="card-image-wrapper position-relative rounded-3 overflow-hidden mb-4"><img src="' + esc(d.image) + '" alt="' + esc(d.title) + '" class="w-100 h-100 object-fit-cover card-image"><div class="badge-featured">FEATURED ESCAPE</div><div class="badge-number">' + esc(d.number) + '</div><div class="badge-rating"><i class="fas fa-star"></i> ' + esc(d.rating) + '</div></div></a>' +
        '<div class="d-flex justify-content-between align-items-end"><div><p class="text-accent small mb-1 letter-spacing">' + esc(d.country) + '</p><a href="destination-' + d.id + '.html" class="text-decoration-none"><h3 class="font-syne fw-bold h4 mb-2 card-title">' + esc(d.title) + '</h3></a>' +
        '<p class="card-meta mb-0"><i class="far fa-clock me-1"></i> ' + esc(d.days) + ' <span class="mx-2">•</span> ' + esc(d.price) + '</p></div><a href="destination-' + d.id + '.html" class="btn arrow-btn rounded-circle"><i class="fas fa-arrow-right"></i></a></div></div></div>';
    }).join('');
  }
  function renderSuccess() {
    if (PAGE !== 'booking-success.html') return;
    var ref = new URLSearchParams(location.search).get('ref'); if (!ref) return;
    var b = S.bookings.filter(function (x) { return x.reference === ref; })[0] || D.bookings.filter(function (x) { return x.reference === ref; })[0]; if (!b) return;
    var code = document.querySelector('.reference-code'); if (code) code.textContent = b.reference;
    var vals = document.querySelectorAll('.summary-value');
    var arr = [b.destination_name, b.destination_country, b.full_name, b.email, b.travel_date, b.travelers + (b.travelers == 1 ? ' person' : ' people'), b.return_date || '—', b.travel_style || '—'];
    arr.forEach(function (v, i) { if (vals[i]) vals[i].textContent = v; });
    var tot = document.querySelector('.total-amount'); if (tot) tot.textContent = money(b.total_price);
    var st = document.querySelector('.booking-total .text-accent'); if (st) st.textContent = ({ pending: 'Pending Confirmation', confirmed: 'Confirmed', cancelled: 'Cancelled' })[b.status] || b.status;
  }
  function renderProfile() {
    if (PAGE !== 'profile.html') return; var u = me(); if (!u) return;
    var tbody = document.querySelector('#bookings-pane tbody'); if (!tbody) return;
    var mine = S.bookings.filter(function (b) { return b.user_id === u.id; });
    if (u.email !== DEMO.email) tbody.innerHTML = '';
    tbody.insertAdjacentHTML('afterbegin', mine.map(function (b) {
      return '<tr><td><span class="text-accent fw-bold small">' + esc(b.reference) + '</span></td><td><p class="mb-0 fw-semibold">' + esc(b.destination_name) + '</p><p class="mb-0 small text-white-50">' + esc(b.destination_country) + '</p></td><td class="small">' + esc(b.travel_date) + '</td><td class="small text-center">' + b.travelers + '</td><td class="text-accent fw-bold">' + money(b.total_price) + '</td><td><span class="status-badge status-pending"> Pending </span></td></tr>';
    }).join(''));
    var rows = tbody.querySelectorAll('tr').length, stats = document.querySelectorAll('.stat-value');
    if (stats[0]) stats[0].textContent = rows; if (stats[1]) stats[1].textContent = S.favorites.length;
    var spent = 0; tbody.querySelectorAll('tr').forEach(function (tr) { var tds = tr.querySelectorAll('td'); if (tds[4]) spent += parseFloat(tds[4].textContent.replace(/[$,]/g, '')) || 0; });
    if (stats[2]) stats[2].textContent = money(spent);
    if (!rows) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-white-50 py-4">No bookings yet.</td></tr>';
  }

  /* ---------------- forms ---------------- */
  function login(email, pass, adminOnly) {
    email = String(email || '').trim().toLowerCase();
    var u = users().filter(function (x) { return x.email.toLowerCase() === email; })[0];
    if (adminOnly && (!u || u.role !== 'admin')) return toast('You are not authorized to access admin panel.', 'error');
    if (!u || u.password !== pass) return toast('The provided credentials do not match our records.', 'error');
    S.session = u.email; save();
    var next = new URLSearchParams(location.search).get('next'); next = next && /^[a-z0-9_\-]+\.html(\?[\w=&\-]*)?$/i.test(next) ? next : '';
    toast(u.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back, ' + u.name + '!');
    setTimeout(function () { location.href = u.role === 'admin' ? ROOT + 'admin/dashboard.html' : ROOT + (next || 'index.html'); }, 700);
  }
  function createBooking(f) {
    var u = me(); if (!u) return;
    var v = function (n) { return f.elements[n] ? f.elements[n].value : ''; };
    var d = dest(v('destination_id')); if (!d) return toast('Invalid destination', 'error');
    var td = v('travel_date'), rd = v('return_date'), trv = parseInt(v('travelers'), 10) || 1;
    if (!td) return toast('Please choose a travel date.', 'error');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(td) < today) return toast('The travel date must be today or later.', 'error');
    if (rd && new Date(rd) <= new Date(td)) return toast('The return date must be after the travel date.', 'error');
    var fmt = function (s) { return s ? new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''; };
    var ref = 'TRV-' + Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, '0');
    S.bookings.push({ reference: ref, user_id: u.id, destination_id: d.id, destination_name: d.title, destination_country: d.country, full_name: v('full_name'), email: v('email'), phone: v('phone'),
      travel_date: fmt(td), return_date: fmt(rd), travelers: trv, travel_style: v('travel_style'), total_price: priceNum(d) * trv, status: 'pending' });
    save(); toast('Booking received!');
    setTimeout(function () { location.href = ROOT + 'booking-success.html?ref=' + ref; }, 700);
  }
  function handleForm(f) {
    var act = f.getAttribute('data-action') || '', v = function (n) { return f.elements[n] ? f.elements[n].value : ''; };
    if (/admin\.login|admin\/login/.test(act) || (AREA === 'admin' && PAGE === 'login.html')) return login(v('email'), v('password'), true);
    if (/(^|\/)login\.html$/.test(act)) return login(v('email'), v('password'));
    if (/(^|\/)register\.html$/.test(act)) {
      var pw = v('password'), mail = v('email').trim().toLowerCase();
      if (pw.length < 6) return toast('The password must be at least 6 characters.', 'error');
      if (pw !== v('password_confirmation')) return toast('The password confirmation does not match.', 'error');
      if (users().some(function (x) { return x.email.toLowerCase() === mail; })) return toast('The email has already been taken.', 'error');
      var nu = { id: S.nextId++, name: v('name') || mail.split('@')[0], email: mail, password: pw, role: 'user', country: v('country') || '', phone: v('phone') || '' };
      S.extraUsers.push(nu); S.session = nu.email; save(); toast('Welcome to Travora, ' + nu.name + '!');
      return setTimeout(function () { location.href = ROOT + 'index.html'; }, 700);
    }
    if (/logout/.test(act)) { S.session = null; save(); toast('Logged out'); return setTimeout(function () { location.href = ROOT + (AREA === 'admin' ? 'admin/login.html' : 'index.html'); }, 500); }
    if (/booking\.store/.test(act)) return createBooking(f);
  }
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.matches || !f.matches('form[data-static]')) return;
    if (e.defaultPrevented) return;
    e.preventDefault(); handleForm(f);
  });

  function init() { syncNav(); renderFavorites(); renderSuccess(); renderProfile(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  // keep the heart badge in sync after toggles made by main.js
  setInterval(function () { var c = document.getElementById('navFavCount'); if (c && String(c.textContent) !== String(S.favorites.length) && document.body) { c.textContent = S.favorites.length; c.classList.toggle('d-none', !S.favorites.length); } }, 600);
})();
