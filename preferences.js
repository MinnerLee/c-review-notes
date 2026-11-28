'use strict';

const select = (id) => document.getElementById(id);
const preferences = new Map();

function getPreference(key) {
  try { return preferences.get(key) ?? localStorage.getItem(key); }
  catch { return preferences.get(key) ?? null; }
}

function setPreference(key, value) {
  preferences.set(key, value);
  try { localStorage.setItem(key, value); }
  catch { /* Keep the preference for this page session. */ }
}

function mountTheme() {
  const themeKey = 'c-review-notes.theme.v1';
  const theme = select('theme-button');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  function drawTheme() {
    const dark = (getPreference(themeKey) ?? (systemTheme.matches ? 'dark' : 'light')) === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
  }
  theme.addEventListener('click', () => {
    setPreference(themeKey, document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    drawTheme();
  });
  systemTheme.addEventListener('change', drawTheme);
  drawTheme();
}
