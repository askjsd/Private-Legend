"use strict";
const { TITLE, LAST, BUDGET, MAXPER, LABEL, BLURB, STAGE_NAMES, GROUPS, LEGACY_LABEL, NOTHING, TRAITS, ENDINGS, newGame, getS, doAction, endSeason, chooseOption, finalChoose, finalOptions, availableActions, stageOf, groupOf, describe, startPhrase } = window.SmallGodsGame;
let S = null;
let VIEW = 'picker';
const PICK = Object.fromEntries(TRAITS.map(t => [t, 0]));
const pickLeft = () => BUDGET - TRAITS.reduce((s, t) => s + PICK[t], 0);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderPicker(){
  const left = pickLeft();
  return '<h1>' + esc(TITLE) + '</h1><p class="lede">You are a god nobody remembers. Before the first season, decide who you want to be.</p>' +
    '<p class="mono" id="left">Points left: ' + left + '</p>' +
    TRAITS.map(t => '<div class="trait"><label for="tr-' + t + '"><span class="tname">' + LABEL[t] + '</span><span class="tblurb">' + BLURB[t] + '</span></label>' +
      '<div class="slider"><input type="range" id="tr-' + t + '" data-trait="' + t + '" min="0" max="' + MAXPER + '" step="1" value="' + PICK[t] + '"><output id="out-' + t + '">' + PICK[t] + '</output></div></div>').join('') +
    '<div class="row"><button id="begin" class="primary"' + (left !== 0 ? ' disabled' : '') + '>Begin</button><button id="reset" class="ghost">Reset</button></div>';
}
function renderPlay(){
  const st = stageOf(S.season);
  let h = '<div class="topbar mono"><span>Season ' + S.season + ' \u00b7 ' + STAGE_NAMES[st] + '</span>' +
    (st >= 2 ? '<span>Faith ' + Math.floor(S.faith) + ' \u00b7 Praying ' + Math.round(S.bel) + '</span>' : '') + '</div>';
  h += '<div class="obs" aria-live="polite">' + S.obs.map(l => '<p>' + esc(l) + '</p>').join('') + S.results.map(l => '<p class="res">' + esc(l) + '</p>').join('') + '</div>';
  if (st >= 3) h += '<div class="panel"><p class="mono">How they speak of you</p><p>' + esc(describe(S.W, false)) + '</p></div>';
  if (S.pending){
    const ev = S.pending;
    h += '<div class="panel"><p class="mono">' + esc(ev.title) + '</p><p>' + esc(ev.text) + '</p><div class="opts">' +
      ev.options.map((o, i) => '<button data-opt="' + i + '"' + (S.faith < o.cost ? ' disabled' : '') + '>' + esc(o.label) + (st >= 2 && o.cost ? '<span class="cost">' + o.cost + ' faith</span>' : '') + '</button>').join('') + '</div></div>';
    return h;
  }
  if (S.ap > 0){
    const btn = a => '<button data-act="' + a.id + '"' + (S.faith < a.cost - 1e-9 ? ' disabled' : '') + '>' + esc(a.name) + (st >= 2 ? '<span class="cost">' + (a.cost ? a.cost + ' faith' : 'free') + '</span>' : '') + '</button>';
    if (st === 1){
      h += S.nudgeOpen ? '<div class="actions">' + availableActions().map(btn).join('') + '<button class="ghost" data-nudge="0">Never mind</button></div>' : '<button data-nudge="1">Nudge</button>';
    } else {
      for (const g of [1, 2, 3]){
        const list = availableActions().filter(a => groupOf(a) === g);
        if (list.length) h += '<p class="mono" style="margin:16px 0 0">' + GROUPS[g] + '</p><div class="actions">' + list.map(btn).join('') + '</div>';
      }
    }
  }
  if (st === 1 && S.acts === 0) h += '<p class="lede">If the season passes with nothing done, the last person who remembers you will forget.</p>';
  h += '<div class="endrow">' + (st >= 2 ? '<p class="mono">Actions left: ' + S.ap + '</p>' : '') + '<button id="end" class="primary">' + (S.season >= LAST ? 'Let the last season pass' : 'Let the season pass') + '</button></div>';
  if (S.log.length) h += '<details><summary class="mono">Earlier seasons</summary>' + S.log.map((l, i) => '<p class="mono">Season ' + (S.season - 1 - i) + '</p>' + l.map(x => '<p class="lede">' + esc(x) + '</p>').join('')).join('') + '</details>';
  return h;
}
function renderFinal(){
  return '<div class="topbar mono"><span>' + STAGE_NAMES[5] + '</span></div><div class="obs"><p>The worst is over, or the worst is still to come. This is the last choice you will make as a god.</p></div><div class="opts">' +
    finalOptions().map(o => '<button data-final="' + o.id + '">' + esc(o.label) + '</button>').join('') + '</div>';
}
function renderEnding(){
  const r = S.result;
  return (r.legacy === 'nothing' ? '' : '<div class="obs"><p class="lede">You set out to be ' + esc(startPhrase(S.p0)) + '. By the end, ' + esc(describe(S.W, true)) + '</p></div>') +
    '<h2 class="etitle">' + esc(r.title) + '</h2><p>' + esc(r.text) + '</p><div class="row"><button id="again" class="primary">Begin again</button></div>';
}
function renderGallery(){
  return '<h1>Ending gallery</h1><p class="lede">All 46 endings.</p>' +
    Object.keys(ENDINGS).map(l => '<details><summary>' + LEGACY_LABEL[l] + '</summary>' +
      ['high','medium','low'].map(c => ['thriving','scarred','broken'].map(f => { const e = ENDINGS[l][c][f]; return '<h4>' + c + ' consistency \u00b7 ' + f + ' \u2014 ' + esc(e[0]) + '</h4><p>' + esc(e[1]) + '</p>'; }).join('')).join('') + '</details>').join('') + '<details><summary>Nothing</summary><h4>' + esc(NOTHING[0]) + '</h4><p>' + esc(NOTHING[1]) + '</p></details>';
}
function render(){
  const el = document.getElementById('app');
  if (location.hash === '#endings'){ el.innerHTML = renderGallery(); return; }
  el.innerHTML = VIEW === 'picker' ? renderPicker() : S.phase === 'final' ? renderFinal() : S.phase === 'ending' ? renderEnding() : renderPlay();
}
function initUI(){
  const el = document.getElementById('app');
  el.addEventListener('input', e => {
    const t = e.target.dataset && e.target.dataset.trait; if (!t) return;
    const others = TRAITS.reduce((s, k) => k === t ? s : s + PICK[k], 0);
    const v = Math.min(+e.target.value, BUDGET - others);
    PICK[t] = v; e.target.value = v;
    document.getElementById('out-' + t).textContent = v;
    const left = pickLeft();
    document.getElementById('left').textContent = 'Points left: ' + left;
    document.getElementById('begin').disabled = left !== 0;
  });
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const d = b.dataset;
    if (b.id === 'begin'){ newGame(PICK); S = getS(); VIEW = 'play'; }
    else if (b.id === 'reset'){ TRAITS.forEach(t => PICK[t] = 0); }
    else if (b.id === 'again'){ VIEW = 'picker'; TRAITS.forEach(t => PICK[t] = 0); }
    else if (b.id === 'end'){ endSeason(); }
    else if (d.nudge !== undefined){ S.nudgeOpen = d.nudge === '1'; }
    else if (d.act){ doAction(d.act); }
    else if (d.opt !== undefined){ chooseOption(+d.opt); }
    else if (d.final){ finalChoose(d.final); }
    else return;
    render();
    if (b.id === 'end' || b.id === 'begin' || b.id === 'again' || d.final) window.scrollTo(0, 0);
  });
  window.addEventListener('hashchange', render);
  document.title = TITLE;
  render();
}
if (typeof document !== 'undefined' && document.getElementById('app')) initUI();
