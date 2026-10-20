"use strict";
const { TITLE, LAST, BUDGET, MAXPER, LABEL, BLURB, STAGE_NAMES, GROUPS, LEGACY_LABEL, NOTHING, TRAITS, ENDINGS, newGame, getS, doAction, answerPrayer, actOnVillager, actOnSettlement, availableSettlementActions, tendThreat, spreadWord, endSeason, chooseOption, finalChoose, finalOptions, availableActions, actionCapacity, stageOf, groupOf, describe, startPhrase } = window.SmallGodsGame;
let S = null;
let VIEW = 'picker';
let GAME_PAGE = 'people';
let SELECTED = 'mara';
const PICK = Object.fromEntries(TRAITS.map(t => [t, 0]));
const pickLeft = () => BUDGET - TRAITS.reduce((s, t) => s + PICK[t], 0);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const beliefMeter = n => { const full=Math.round(n*10); return '['+'#'.repeat(full)+'.'.repeat(10-full)+'] '+Math.round(n*100)+'%'; };

function renderPicker(){
  const left = pickLeft();
  return '<h1>' + esc(TITLE) + '</h1><p class="lede">You are a god nobody remembers. Before the first season, decide who you want to be.</p>' +
    '<p class="mono" id="left">Points left: ' + left + '</p>' +
    TRAITS.map(t => '<div class="trait"><label for="tr-' + t + '"><span class="tname">' + LABEL[t] + '</span><span class="tblurb">' + BLURB[t] + '</span></label>' +
      '<div class="slider"><input type="range" id="tr-' + t + '" data-trait="' + t + '" min="0" max="' + MAXPER + '" step="1" value="' + PICK[t] + '"><output id="out-' + t + '">' + PICK[t] + '</output></div></div>').join('') +
    '<div class="row"><button id="randomize" class="ghost">Randomize traits</button><button id="begin" class="primary"' + (left !== 0 ? ' disabled' : '') + '>Begin</button><button id="reset" class="ghost">Reset</button></div>';
}
const HOUSE_FAME={mara:0,kit:.6,oren:1.6,leni:2.5,hester:2.8,ada:3,tomas:3.5,bram:3.8,vale:4.5};
const RELATIONSHIP_REVEAL_BELIEF=.3;
const unrestRecoveryActive=person=>!!(person.unrestShaken&&person.unrestShakenRun===S.runId);
function relationshipLinks(id){
  const source=S.villagers.find(v=>v.id===id);
  if(!source||source.dead||source.belief<RELATIONSHIP_REVEAL_BELIEF)return [];
  return (source.ties||[]).map(tie=>({person:S.villagers.find(v=>v.id===tie.id),trust:tie.trust})).filter(x=>x.person);
}
function relationshipPercents(links){
  const total=links.reduce((sum,link)=>sum+link.trust,0)||1;
  const exact=links.map(link=>link.trust/total*100),values=exact.map(Math.floor);
  let remainder=100-values.reduce((sum,value)=>sum+value,0);
  const order=exact.map((value,index)=>({index,fraction:value-values[index]})).sort((a,b)=>b.fraction-a.fraction);
  for(let i=0;i<remainder;i++)values[order[i%order.length].index]++;
  return values;
}
function unlockedVillagers(){
  const mara=S.villagers.find(v=>v.id==='mara');
  const believers=S.villagers.filter(v=>!v.dead&&v.belief>0);
  const root=mara&&!mara.dead&&mara.belief>0?mara:believers.slice().sort((a,b)=>b.belief*b.influence-a.belief*a.influence)[0];
  const unlocked=root?[root.id]:[];
  let changed=true;
  while(changed){changed=false;
    for(const person of S.villagers){
      if(person.dead||person.belief<=0||unlocked.includes(person.id)||S.fame<(HOUSE_FAME[person.id]??Infinity))continue;
      if(unlocked.some(sourceId=>relationshipLinks(sourceId).some(link=>link.person.id===person.id))){unlocked.push(person.id);changed=true;}
    }
  }
  return unlocked;
}
function lockedNeighbors(unlocked){
  const found=new Map();
  for(const sourceId of unlocked){
    const source=S.villagers.find(v=>v.id===sourceId);
    for(const link of relationshipLinks(sourceId)){
      if(link.person.dead||unlocked.includes(link.person.id))continue;
      if(!found.has(link.person.id))found.set(link.person.id,[]);
      found.get(link.person.id).push({source,trust:link.trust});
    }
  }
  return [...found].map(([id,links])=>({person:S.villagers.find(v=>v.id===id),links}));
}
function renderLockedPerson(person,links,art){
  const connected=links.map(x=>esc(x.source.name)+'’s ties · '+esc(person.name)+' '+Math.round(x.trust*100)+'%').join('<br>');
  const faithNote=person.belief<=0&&unrestRecoveryActive(person)?'<p class="mono lost-belief">No longer believes in you</p>':'';
  let h='<div class="ascii-entry locked-entry"><button class="ascii-house locked-house '+(person.belief<=0?'faithless-house':'')+'" disabled aria-label="'+esc(person.name)+'’s house is not yet available"><span>'+art[0]+'</span><span>'+art[1]+'</span><span>'+art[2]+'</span><small>'+esc(person.name)+'</small></button><div class="inline-info locked-info"><p class="mono">'+esc(person.faction==='hearth'?'Hearth Circle':'Stone Wardens')+' · '+esc(person.trade)+'</p><p class="mono">Known through<br>'+connected+'</p><p class="mono">Influence '+person.influence+'/5</p>'+faithNote+'</div></div>';
  return h;
}
function renderDeceasedPerson(person,art){
  const lost=(person.fameContributionAtDeath||0).toFixed(2);
  return '<div class="ascii-entry deceased-entry"><div class="ascii-house deceased-house"><span>'+art[0]+'</span><span>'+art[1]+'</span><span>'+art[2]+'</span><small>'+esc(person.name)+' · DECEASED</small></div><div class="inline-info deceased-info"><p class="mono">'+esc(person.home)+'</p><p class="mono">Their belief is gone.</p><p class="mono">Fame lost · '+lost+'</p></div></div>';
}
function renderPersonInfo(person, crime, prayer){
  let h='<div class="inline-info"><p class="mono">'+esc(person.faction==='hearth'?'Hearth Circle':'Stone Wardens')+' · '+esc(person.trade)+'</p><p class="mono belief-line">Belief: '+Math.round(person.belief*100)+'% · Influence '+person.influence+'/5</p>';
  const ties=relationshipLinks(person.id).sort((a,b)=>b.trust-a.trust);
  if(ties.length){const percentages=relationshipPercents(ties);h+='<p class="mono belief-line">'+esc(person.name)+'’s ties · '+ties.map((t,i)=>esc(t.person.name)+' '+percentages[i]+'% · influence '+t.person.influence+'/5').join('<br>')+'</p>';}
  if(crime)h+='<p class="crime">Tomas took Leni’s winter grain. She asks you to judge him.</p>';
  else if(prayer){
    const traits=Object.entries(person.prayer.traits||{}).sort((a,b)=>b[1]-a[1]).map(([t,n])=>esc(LABEL[t])+' '+Math.round(n*100)+'%').join(' · ');
    h+='<p class="prayer-text">“'+esc(person.prayer.text)+'”</p><p class="mono belief-line">'+traits+'</p>';
  }
  else if(person.id==='vale')h+='<p>Lord Vale’s tenants are quiet for now. His influence reaches every household.</p>';
  else if(person.satisfied)h+='<p>'+esc(person.name)+' is satisfied for now. The house is quiet.</p>';
  else h+='<p>'+esc(person.name)+' goes about the day, with ordinary worries.</p>';
  if(S.ap>0&&!S.pending){
    if(person.id==='vale'&&prayer)h+='<div class="actions compact-actions"><button title="Gain fame and influence; worsen hunger and unrest" data-person="favor" data-villager="vale">Back Vale</button><button class="danger" title="Protect tenants; lose Vale’s favor" data-person="oppose" data-villager="vale">Protect tenants</button></div>';
    else if(person.id!=='vale')h+='<div class="actions compact-actions">'+(prayer?'<button data-prayer="help" data-villager="'+person.id+'">Help <span class="cost">1 faith</span></button><button data-prayer="refuse" data-villager="'+person.id+'">Refuse</button><button data-prayer="exploit" data-villager="'+person.id+'">Exploit</button>':'<button data-person="comfort" data-villager="'+person.id+'">Comfort <span class="cost">1 faith</span></button><button data-person="bless" data-villager="'+person.id+'">Bless <span class="cost">1 faith</span></button><button data-person="warn" data-villager="'+person.id+'">Warn</button>')+(crime?'<button data-person="forgive" data-villager="tomas">Forgive</button><button class="danger" data-person="punish" data-villager="tomas">Punish</button>':'')+'</div>';
  }
  return h+'</div>';
}
function renderPlaceInfo(id){
  let h='<div class="inline-info"><p class="mono">'+(id==='shrine'?'SHRINE · its rites strengthen belief across every household':'CHURCH · its rites strengthen belief and support village prosperity')+'</p><p class="mono">Village prosperity '+Math.round(S.prosperity)+'/100</p><p>'+esc(describe(S.W,false))+'</p>';
  if(S.ap>0&&!S.pending){for(const g of [1,2,3]){const xs=availableActions().filter(a=>groupOf(a)===g);if(xs.length)h+='<p class="mono">'+GROUPS[g]+'</p>'+xs.map(a=>'<button data-act="'+a.id+'" data-place="'+id+'"'+(S.faith<a.cost?' disabled':'')+'>'+esc(a.name)+' <span class="cost">'+(a.cost?a.cost+' faith':'free')+'</span></button>').join('');}}
  return h+'</div>';
}
function renderOutlyingInfo(id){
  const west=id==='westmere', name=west?'Westmere':'Eastbank', cost=west?2:3, sent=S.flags['word_'+id], place=S.settlements[id];
  let h='<div class="inline-info"><p class="mono">'+name+' · beyond the valley</p>';
  if(!sent)h+='<p>The road carries rumors this far.</p>';
  else {
    h+='<p class="mono belief-line">Village belief '+beliefMeter(place.belief)+'</p><p class="mono">Prosperity '+Math.round(place.prosperity)+'/100</p><p>'+esc(describe(place.opinion,false))+'</p>';
    h+='<p>Village requests are answered on the Villages page.</p><button data-page="villages">Open Villages</button>';
  }
  if(!sent&&S.ap>0&&!S.pending)h+='<button data-spread="'+id+'"'+(S.faith<cost?' disabled':'')+'>Send word · '+cost+' faith</button>';
  return h+'</div>';
}
function renderVillagesPage(){
  const open=Object.entries(S.settlements).filter(([,place])=>place.open);
  let h='<section class="villages-page"><p class="mono page-intro">Villages · their belief brings tenfold seasonal faith, and their choices leave a strong mark on your nature.</p><div class="village-cards">';
  for(const [id,place] of open){
    const home=id==='valley',belief=home?S.bel/Math.max(1,S.pop):place.belief;
    const relations=Object.entries(place.relations||{}).filter(([otherId])=>S.settlements[otherId]?.open).map(([otherId,strength])=>esc(S.settlements[otherId].name)+' '+strength+'%');
    h+='<article class="village-card"><h2>'+esc(place.name)+'</h2><p class="mono">Belief '+Math.round(belief*100)+'% · Prosperity '+Math.round(place.prosperity)+'/100</p>';
    if(relations.length)h+='<p class="mono">Relations · '+relations.join(' · ')+'</p>';
    h+='<p>'+esc(describe(place.opinion,false))+'</p>';
    if(home)h+='<p class="mono">Tend individual requests on the People page.</p>';
    else if(place.praying&&place.requestMode==='counsel'){
      const question=place.question;
      const prompt={strangers:'Travelers arrive with little food. What should the village do?',trade:'A neighboring village asks to share the old road. How should you answer?',custom:'The elders disagree about which custom to keep. Which one should guide them?'}[question]||'The elders ask what the village should do next.';
      h+='<p class="village-request">“'+esc(prompt)+'”</p>';
    }else if(place.praying){const needs={harvest:'a poor harvest',sickness:'a fever moving through several homes',dispute:'a bitter boundary dispute',flood:'water rising along the lower fields'};h+='<p class="village-request">“We need help with '+esc(needs[place.need]||'a hard season')+'. What can you do?”</p>';}
    else h+='<p class="mono">The village is satisfied for now.</p>';
    if(!home&&place.praying){
      if(S.settlementChoice===id)h+='<p class="mono">You answered this village this season.</p>';
      else if(S.settlementChoice)h+='<p class="mono">You answered '+esc(S.settlements[S.settlementChoice].name)+' this season. This village must wait.</p>';
      else if(S.ap>0&&!S.pending){
        const choices=availableSettlementActions(id);
        h+='<div class="village-choices">'+choices.map(choice=>'<button data-settlement="'+id+'" data-choice="'+choice.id+'"'+(S.faith<choice.cost?' disabled':'')+'>'+esc(choice.name)+' <span class="cost">'+choice.cost+' faith</span></button>').join('')+'</div>';
      }
    }
    h+='</article>';
  }
  return h+'</div></section>';
}
function renderPlay(){
  const st=stageOf(S.season);
  let h='<div class="game-head"><div class="game-head-main"><div class="topbar mono"><span>Season '+S.season+' · '+STAGE_NAMES[st]+'</span><span>Actions '+S.ap+'/'+S.actionCap+' · Fame '+S.fame.toFixed(1)+(st>=2?' · Faith '+Math.floor(S.faith)+' · Praying '+Math.round(S.bel):'')+'</span></div>';
  const latestAction=S.results[S.results.length-1];
  h+='<div class="obs" aria-live="polite">'+(latestAction?'<p class="res latest-action">Just now · '+esc(latestAction)+'</p>':'')+S.obs.map(x=>'<p>'+esc(x)+'</p>').join('')+S.results.slice(0,-1).map(x=>'<p class="res">'+esc(x)+'</p>').join('')+'</div></div>';
  h+='<section class="threats"><p class="mono">Village pressures · rising if neglected</p>'+[['sickness','Sickness'],['hunger','Hunger'],['unrest','Unrest']].map(([id,label])=>'<div class="threat"><div><span>'+label+'</span><span>'+Math.round(S.threats[id])+'%</span></div><progress max="100" value="'+S.threats[id]+'" class="risk-'+id+'"></progress>'+(S.threats[id]>=8&&S.ap>0&&!S.pending?'<button class="small-action" data-threat="'+id+'"'+(S.faith<({sickness:2,hunger:2,unrest:1}[id])?' disabled':'')+'>'+({sickness:'Care for the sick · 2 faith',hunger:'Share the stores · 2 faith',unrest:'Mediate the quarrel · 1 faith'}[id])+'</button>':'')+'</div>').join('')+'</section></div>';
  const outsideOpen=['westmere','eastbank'].some(id=>S.settlements[id].open);
  if(outsideOpen)h+='<nav class="page-tabs" aria-label="Game pages"><button data-page="people" class="'+(GAME_PAGE==='people'?'active':'')+'">People</button><button data-page="villages" class="'+(GAME_PAGE==='villages'?'active':'')+'">Villages</button></nav>';
  if(S.pending){const ev=S.pending;h+='<section class="panel event-panel"><p class="mono">'+esc(ev.title)+'</p><p>'+esc(ev.text)+'</p><div class="opts">'+ev.options.map((o,i)=>'<button data-opt="'+i+'"'+(S.faith<o.cost?' disabled':'')+'>'+esc(o.label)+(o.cost?'<span class="cost">'+o.cost+' faith</span>':'')+'</button>').join('')+'</div></section>';}
  if(GAME_PAGE==='villages'&&outsideOpen){h+=renderVillagesPage();h+='<div class="endrow"><p class="mono">Village choices affect belief, prosperity, neighboring villages, and your traits.</p></div>';return h;}
  const visible=unlockedVillagers(), locked=lockedNeighbors(visible);
  const slash=String.fromCharCode(92),art={mara:[' /------'+slash,'| MARA  |','|______|'],oren:[' /------'+slash,'| OREN  |','|______|'],leni:[' /------'+slash,'| LENI  |','|______|'],tomas:[' /------'+slash,'| TOMAS |','|______|'],vale:[' /------'+slash,'| VALE  |','|______|'],hester:[' /------'+slash,'| HESTER|','|______|'],kit:[' /------'+slash,'| KIT   |','|______|'],bram:[' /------'+slash,'| BRAM  |','|______|'],ada:[' /------'+slash,'| ADA   |','|______|']};
  const icons={shrine:['   /'+slash+'   ','  SHRINE ','  |___|  '],church:['    +    ','  CHURCH ','  |___|  ']};
  h+='<section class="village"><p class="mono">The Village · prosperity '+Math.round(S.prosperity)+'/100 · known houses and their direct connections</p><pre class="ascii-sky">        .       *           .       *\n  ^     ^    ^       ^    ^      ^\n /|'+slash+'   /|'+slash+'  /|'+slash+'     /|'+slash+'  /|'+slash+'    /|'+slash+'\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n                    |\n               .----+----.\n          _____/    |    '+slash+'_____</pre><div class="ascii-houses">';
  const housePositions=['mara','oren','leni','tomas','vale','hester','kit','bram','ada'];
  for(const id of housePositions){
    const person=S.villagers.find(x=>x.id===id),item=locked.find(x=>x.person.id===id);
    if(person.dead){h+=renderDeceasedPerson(person,art[id]);continue;}
    if(item){h+=renderLockedPerson(item.person,item.links,art[id]);continue;}
    if(!visible.includes(id)){h+='<div class="ascii-entry undiscovered-slot" aria-hidden="true"></div>';continue;}
    const crime=id==='tomas'&&S.flags.tomasCrime&&!S.flags.tomasJudged,prayer=person.praying;
    h+='<div class="ascii-entry"><button class="ascii-house '+(SELECTED===id?'selected':'')+'" data-select="'+id+'" aria-label="Open '+esc(person.name)+'’s house"><span>'+art[id][0]+'</span><span>'+art[id][1]+(crime?' !':'')+'</span><span>'+art[id][2]+'</span><small>'+esc(person.name)+'</small></button>';
    h+=SELECTED===id?renderPersonInfo(person,crime,prayer):'<div class="inline-info inline-info-placeholder" aria-hidden="true"></div>';
    h+='</div>';
  }
  h+='</div><div class="map-expansions">';
  const buildings=[];if(S.fame>=2)buildings.push('shrine');if(S.fame>=5.5)buildings.push('church');
  for(const id of buildings){h+='<div class="ascii-entry"><button class="ascii-house building '+(SELECTED===id?'selected':'')+'" data-select="'+id+'"><span>'+icons[id][0]+'</span><span>'+icons[id][1]+'</span><span>'+icons[id][2]+'</span></button>';h+=SELECTED===id?renderPlaceInfo(id):'<div class="inline-info inline-info-placeholder" aria-hidden="true"></div>';h+='</div>';}
  const regions=[];if(S.fame>=8)regions.push('westmere');if(S.fame>=12)regions.push('eastbank');
  for(const id of regions){const label=id==='westmere'?'WESTMERE':'EASTBANK';h+='<div class="ascii-entry"><button class="ascii-house building '+(SELECTED===id?'selected':'')+'" data-select="'+id+'"><span>  .-.</span><span> /___'+(id==='westmere'?'W':'E')+'\\</span><span> '+label+'</span></button>';h+=SELECTED===id?renderOutlyingInfo(id):'<div class="inline-info inline-info-placeholder" aria-hidden="true"></div>';h+='</div>';}
  h+='</div><pre class="ascii-road">--------------------- the old road '+(regions.length?' · · · · · · · · · · · · · · · · · · · · · · · · · ·':'---------------------')+'</pre>';
  h+='</section>';
  if(st>=3){const hearth=S.factions.hearth,wardens=S.factions.wardens;h+='<p class="mono social-status">'+hearth.name+' '+beliefMeter(hearth.belief)+' · '+wardens.name+' '+beliefMeter(wardens.belief)+' · division '+Math.round(Math.abs(hearth.belief-wardens.belief)*100)+'%</p>';}
  if(S.customs.length)h+='<p class="mono social-status">Customs kept: '+S.customs.map(c=>esc(c)).join(' · ')+'</p>';
  if(st>=3)h+='<p class="lede">'+esc(describe(S.W,false))+'</p>';
  h+='<div class="endrow"><p class="mono">Action capacity grows with fame, belief, and influential followers.</p></div>';
  if(S.log.length)h+='<details><summary class="mono">Earlier seasons</summary>'+S.log.map((l,i)=>'<p class="mono">Season '+(S.season-1-i)+'</p>'+l.map(x=>'<p class="lede">'+esc(x)+'</p>').join('')).join('')+'</details>';
  return h;
}
function renderFinal(){
  return '<div class="topbar mono"><span>' + STAGE_NAMES[5] + '</span></div><div class="obs">' + (S.carryObs||[]).map(x=>'<p>'+esc(x)+'</p>').join('') + '<p>The worst is over, or the worst is still to come. This is the last choice you will make as a god.</p></div><div class="opts">' +
    finalOptions().map(o => '<button data-final="' + o.id + '">' + esc(o.label) + '</button>').join('') + '</div>';
}
function renderEnding(){
  const r = S.result;
  const traits = '<section class="trait-results"><h2>Traits</h2><div class="trait-head"><span>Trait</span><span>At start</span><span>At end</span></div>' + TRAITS.map(t => '<div class="trait-result"><span>' + LABEL[t] + '</span><span>' + (S.counts[t] || 0) + '</span><span>' + Math.round((S.W[t] || 0) * 100) + '%</span></div>').join('') + '</section>';
  const fame = Number.isFinite(r.fame) ? r.fame : S.fame;
  const prosperity = Number.isFinite(r.prosperity) ? r.prosperity : S.prosperity;
  const believers = Number.isFinite(r.believers) ? r.believers : S.bel;
  const population = Number.isFinite(r.population) ? r.population : S.pop;
  const reach = Number.isFinite(r.reach) ? r.reach : 0;
  const isNothing = r.legacy === 'nothing';
  const endingFactors = '<section class="ending-factors"><h2>How this ending was shaped</h2>' +
    (isNothing ? '<p>You took no actions before your presence faded, so the usual consistency, village, and legacy checks did not decide this ending.</p>' :
      '<p><strong>Consistency: ' + esc(r.cons) + '</strong> — how closely your actions matched the traits chosen at the start (distance ' + Number(r.dist || 0).toFixed(2) + '; smaller is closer).</p>' +
      '<p><strong>Village: ' + esc(r.fate) + '</strong> — average prosperity ended at ' + Math.round(prosperity) + '%, cohesion at ' + Math.round(r.cohesion || 0) + '%, with ' + population + ' villagers. Low prosperity or population leads to a broken village; strong prosperity and cohesion allow it to thrive.</p>' +
      '<p><strong>Fame and legacy:</strong> fame ended at ' + fame.toFixed(1) + '. Fame opened doors and carried your name outward during play. ' + believers + ' of ' + population + ' villagers believed in you. The final legacy check used believer reach (' + reach.toFixed(2) + ', threshold ' + Number(r.faithThreshold || 0).toFixed(2) + '), imprint (' + Math.round(r.imprint || 0) + ', threshold ' + Number(r.imprintThreshold || 0).toFixed(2) + '), and whether word reached another village (' + (r.spreadBeyondVillage ? 'yes' : 'no') + ').' + (r.spent ? ' Spending everything reduced your final reach.' : '') + '</p>') +
    '</section>';
  return traits + '<h2 class="etitle">' + esc(r.title) + '</h2><p>' + esc(r.text) + '</p>' + endingFactors + '<div class="row"><button id="again" class="primary">Begin again</button></div>';
}
function renderGallery(){
  return '<h1>Ending gallery</h1><p class="lede">All 46 endings.</p>' +
    Object.keys(ENDINGS).map(l => '<details><summary>' + LEGACY_LABEL[l] + '</summary>' +
      ['high','medium','low'].map(c => ['thriving','scarred','broken'].map(f => { const e = ENDINGS[l][c][f]; return '<h4>' + c + ' consistency \u00b7 ' + f + ' \u2014 ' + esc(e[0]) + '</h4><p>' + esc(e[1]) + '</p>'; }).join('')).join('') + '</details>').join('') + '<details><summary>Nothing</summary><h4>' + esc(NOTHING[0]) + '</h4><p>' + esc(NOTHING[1]) + '</p></details>';
}
function render(){
  const el = document.getElementById('app');
  if (location.hash === '#endings'){ el.innerHTML = renderGallery(); return; }
  const playing = VIEW !== 'picker' && S && S.phase === 'play';
  el.classList.toggle('game-screen', !!playing);
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
    if (b.id === 'begin'){ newGame(PICK); S = getS(); VIEW = 'play'; GAME_PAGE='people'; SELECTED = 'mara'; }
    else if (b.id === 'reset'){ TRAITS.forEach(t => PICK[t] = 0); }
    else if (b.id === 'randomize'){
      TRAITS.forEach(t => PICK[t] = 0);
      let remaining = BUDGET;
      while (remaining > 0){ const choices=TRAITS.filter(t=>PICK[t]<MAXPER); const t=choices[Math.floor(Math.random()*choices.length)]; PICK[t]++; remaining--; }
    }
    else if (b.id === 'again'){ VIEW = 'picker'; GAME_PAGE='people'; SELECTED = 'mara'; TRAITS.forEach(t => PICK[t] = 0); }
    else if (b.id === 'end'){ endSeason(); }
    else if (d.nudge !== undefined){ S.nudgeOpen = d.nudge === '1'; }
    else if (d.act){ doAction(d.act,d.place); }
    else if (d.prayer){ answerPrayer(d.villager, d.prayer); }
    else if (d.person){ actOnVillager(d.villager, d.person); }
    else if (d.threat){ tendThreat(d.threat); }
    else if (d.settlement){ actOnSettlement(d.settlement,d.choice); }
    else if (d.spread){ spreadWord(d.spread); }
    else if (d.page){ GAME_PAGE=d.page==='villages'?'villages':'people'; }
    else if (d.select){ SELECTED = SELECTED === d.select ? null : d.select; }
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
