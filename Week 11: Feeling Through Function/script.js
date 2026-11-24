const STORAGE_KEY = 'farAndHere.v1';
const cities = {
  'New York': { lat: 40.7128, lon: -74.0060, zone: 'America/New_York' },
  Chicago: { lat: 41.8781, lon: -87.6298, zone: 'America/Chicago' },
  'Los Angeles': { lat: 34.0522, lon: -118.2437, zone: 'America/Los_Angeles' },
  'San Francisco': { lat: 37.7749, lon: -122.4194, zone: 'America/Los_Angeles' },
  Seattle: { lat: 47.6062, lon: -122.3321, zone: 'America/Los_Angeles' },
  Denver: { lat: 39.7392, lon: -104.9903, zone: 'America/Denver' },
  Austin: { lat: 30.2672, lon: -97.7431, zone: 'America/Chicago' },
  Miami: { lat: 25.7617, lon: -80.1918, zone: 'America/New_York' },
  Boston: { lat: 42.3601, lon: -71.0589, zone: 'America/New_York' }
};
const moodDetails = {
  Happy: ['mood-happy', 'A little golden light goes a long way.'],
  Calm: ['mood-calm', 'A quiet, easy kind of day.'],
  Cozy: ['mood-cozy', 'Making room for the softer things.'],
  Upbeat: ['mood-upbeat', 'A little extra light in your step.'],
  Okay: ['mood-okay', 'Here, just as you are.'],
  Tired: ['mood-tired', 'Taking today one gentle step at a time.'],
  'A little down': ['mood-down', 'Sending a soft thought your way.']
};
const defaults = { friends: [
  { name: 'Megan', city: 'New York', color: 'rose', mood: 'Cozy', status: '', notes: [], pokes: 0 },
  { name: 'Andy', city: 'Chicago', color: 'blue', mood: 'Upbeat', status: '', notes: [], pokes: 0 }
]};
let state = loadState();
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.friends) && saved.friends.length === 2) {
      return { friends: saved.friends.map((friend, i) => ({ ...defaults.friends[i], ...friend, notes: Array.isArray(friend.notes) ? friend.notes : [], pokes: Number.isInteger(friend.pokes) && friend.pokes >= 0 ? friend.pokes : 0 })) };
    }
  } catch (error) { console.warn('Could not read saved postcard data.', error); }
  return structuredClone(defaults);
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function get(id) { return document.getElementById(id); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char])); }
function friendlyTime(date, zone) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone }).format(date); }
function updateDate() { get('today').textContent = new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric' }).format(new Date()); }
function setMoodClass(index) {
  const card = get(`card-${index}`);
  const select = get(`mood-${index}`);
  const [className, whisper] = moodDetails[state.friends[index].mood] || moodDetails.Okay;
  card.classList.remove('mood-happy', 'mood-calm', 'mood-cozy', 'mood-upbeat', 'mood-okay', 'mood-tired', 'mood-down');
  card.classList.remove('paper-rose', 'paper-blue', 'paper-sage', 'paper-cream');
  card.classList.add(`paper-${state.friends[index].color || defaults.friends[index].color}`);
  card.classList.add(className);
  get(`mood-whisper-${index}`).textContent = whisper;
  select.value = state.friends[index].mood;
}
function updateSync() {
  const matching = state.friends[0].mood === state.friends[1].mood;
  get('sync-banner').hidden = !matching;
  for (let i = 0; i < 2; i++) get(`mood-${i}`).classList.toggle('in-sync', matching);
}
function renderNotes() {
  const allNotes = state.friends.flatMap((friend, sender) => friend.notes.map(note => ({ ...note, sender, name: friend.name }))).sort((a,b) => b.created - a.created).slice(0, 12);
  get('notes-list').innerHTML = allNotes.length ? allNotes.map(note => `<article class="note-entry"><span class="envelope" aria-hidden="true">✉</span><span class="note-copy">“${escapeHTML(note.text)}”</span><span class="note-meta">${escapeHTML(note.name)} · ${new Date(note.created).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}</span></article>`).join('') : '<p class="empty-note">Your little notes will find a home here.</p>';
  state.friends.forEach((friend, i) => {
    const last = friend.notes[friend.notes.length - 1];
    const el = get(`last-note-${i}`);
    el.hidden = !last;
    if (last) el.innerHTML = `“${escapeHTML(last.text)}”<small>Sent ${new Date(last.created).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })}</small>`;
  });
}
function render() {
  state.friends.forEach((friend, i) => {
    get(`friend-name-${i}`).textContent = friend.name;
    get(`poke-count-${i}`).textContent = `Poked ${friend.pokes} ${friend.pokes === 1 ? 'time' : 'times'}`;
    get(`city-name-${i}`).textContent = friend.city;
    get(`name-${i}`).value = friend.name;
    get(`city-${i}`).value = friend.city;
    get(`color-${i}`).value = friend.color;
    get(`status-${i}`).value = friend.status;
    setMoodClass(i);
  });
  updateSync(); renderNotes(); updateDate(); updateWorld();
}
function showToast(message) {
  const toast = get('toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
function describeWeather(code) {
  if (code === 0) return ['☀', 'Clear skies'];
  if ([1,2].includes(code)) return ['⛅', 'A little cloud'];
  if (code === 3) return ['☁', 'Overcast'];
  if ([45,48].includes(code)) return ['〰', 'Misty'];
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return ['☂', 'Rain in the air'];
  if ([71,73,75,77,85,86].includes(code)) return ['❄', 'Snowflakes'];
  if ([95,96,99].includes(code)) return ['ϟ', 'Stormy skies'];
  return ['☁', 'Clouds passing'];
}
async function updateWeather(index) {
  const friend = state.friends[index], location = cities[friend.city];
  if (!location) return;
  get(`weather-desc-${index}`).textContent = 'Checking the sky…';
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather service unavailable');
    const data = await response.json();
    const current = data.current;
    const [, desc] = describeWeather(current.weather_code);
    get(`weather-temp-${index}`).textContent = `${Math.round(current.temperature_2m)}°`;
    get(`weather-desc-${index}`).textContent = desc;
    const isDay = current.is_day === 1;
    setWindowScene(index, current.weather_code, isDay);
    get(`card-${index}`).classList.toggle('night', !isDay);
    get(`card-${index}`).classList.toggle('daylight', isDay);
    get(`sun-${index}`).textContent = isDay ? '☼' : '☾';
    get(`sky-note-${index}`).textContent = isDay ? 'Daylight drifting over the rooftops' : 'Evening settling over the rooftops';
  } catch (error) {
    const hour = Number(new Intl.DateTimeFormat('en-US', { hour:'numeric', hourCycle:'h23', timeZone:location.zone }).format(new Date()));
    const isDay = hour >= 6 && hour < 19;
    get(`weather-temp-${index}`).textContent = '—°';
    get(`weather-desc-${index}`).textContent = 'Weather is taking a little pause';
    setWindowScene(index, null, isDay);
    get(`card-${index}`).classList.toggle('night', !isDay);
    get(`card-${index}`).classList.toggle('daylight', isDay);
    get(`sun-${index}`).textContent = isDay ? '☼' : '☾';
    get(`sky-note-${index}`).textContent = 'Your postcard is here, come rain or shine';
  }
}
function setWindowScene(index, code, isDay) {
  const window = get(`weather-window-${index}`);
  const weatherClass = weatherClassForCode(code);
  window.className = `weather-window ${isDay ? 'day' : 'night'} ${weatherClass}`;
  const timeLabel = isDay ? 'daytime' : 'nighttime';
  const weatherLabel = code === null ? 'weather unavailable' : describeWeather(code)[1].toLowerCase();
  window.setAttribute('aria-label', `${timeLabel}, ${weatherLabel}`);
}
function weatherClassForCode(code) {
  if (code === null) return 'weather-cloudy';
  if (code === 0) return 'weather-clear';
  if ([1,2].includes(code)) return 'weather-partly';
  if ([45,48].includes(code)) return 'weather-fog';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return 'weather-rain';
  if ([71,73,75,77,85,86].includes(code)) return 'weather-snow';
  if ([95,96,99].includes(code)) return 'weather-storm';
  return 'weather-cloudy';
}
function updateWorld() {
  const now = new Date();
  state.friends.forEach((friend, i) => {
    const zone = cities[friend.city]?.zone || 'UTC';
    get(`local-time-${i}`).textContent = friendlyTime(now, zone);
    updateWeather(i);
  });
  document.body.classList.toggle('is-night', state.friends.every(friend => {
    const hour = Number(new Intl.DateTimeFormat('en-US', { hour:'numeric', hourCycle:'h23', timeZone:cities[friend.city].zone }).format(now));
    return hour < 6 || hour >= 19;
  }));
}
function initSettings() {
  document.querySelectorAll('.settings-grid select[id^="city-"]').forEach(select => {
    select.innerHTML = Object.keys(cities).map(city => `<option>${escapeHTML(city)}</option>`).join('');
  });
  const panel = get('settings-panel'), toggle = get('settings-toggle');
  function setOpen(open) { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.querySelector('span').textContent = open ? '−' : '＋'; }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  get('settings-close').addEventListener('click', () => setOpen(false));
  state.friends.forEach((friend, i) => {
    get(`city-${i}`).addEventListener('change', event => { friend.city = event.target.value; saveState(); render(); showToast(`${friend.name}’s city postcard updated.`); });
    get(`name-${i}`).addEventListener('change', event => { friend.name = event.target.value.trim() || defaults.friends[i].name; event.target.value = friend.name; saveState(); render(); showToast('Name saved.'); });
    get(`color-${i}`).addEventListener('change', event => { friend.color = event.target.value; saveState(); render(); showToast('Paper color changed.'); });
  });
  get('clear-data').addEventListener('click', () => {
    if (window.confirm('Clear saved notes, moods, and status updates? Your names, cities, and paper colors will stay.')) {
      state.friends.forEach(friend => { friend.notes = []; friend.status = ''; friend.mood = 'Okay'; });
      saveState(); render(); showToast('Notes and updates cleared.');
    }
  });
}
function initCards() {
  state.friends.forEach((friend, i) => {
    const nameButton = get(`friend-name-${i}`);
    nameButton.addEventListener('click', () => {
      friend.pokes += 1;
      get(`poke-count-${i}`).textContent = `Poked ${friend.pokes} ${friend.pokes === 1 ? 'time' : 'times'}`;
      saveState();
      nameButton.classList.remove('poked');
      void nameButton.offsetWidth;
      nameButton.classList.add('poked');
    });
    nameButton.addEventListener('animationend', () => nameButton.classList.remove('poked'));
    get(`mood-${i}`).addEventListener('change', event => { friend.mood = event.target.value; saveState(); setMoodClass(i); updateSync(); showToast(`${friend.name}’s mood saved.`); });
    get(`status-${i}`).addEventListener('input', event => { friend.status = event.target.value; saveState(); });
    get(`status-${i}`).addEventListener('change', () => showToast(`${friend.name}’s update saved.`));
    get(`send-${i}`).addEventListener('click', () => {
      const field = get(`note-${i}`), text = field.value.trim();
      if (!text) { showToast('Write a little note first.'); field.focus(); return; }
      friend.notes.push({ text, created: Date.now() });
      if (friend.notes.length > 30) friend.notes.shift();
      saveState(); field.value = ''; renderNotes(); showToast(`Your note is tucked into the mailbox, for ${state.friends[1-i].name}.`);
    });
  });
}
initSettings(); initCards(); render();
setInterval(() => {
  const now = new Date();
  state.friends.forEach((friend, i) => { get(`local-time-${i}`).textContent = friendlyTime(now, cities[friend.city].zone); });
}, 15000);
setInterval(() => state.friends.forEach((_, i) => updateWeather(i)), 15 * 60 * 1000);
