(function(){
'use strict';
const TITLE = 'Small Gods';
const LAST = 13, BUDGET = 12, MAXPER = 5;
let T_HIGH = 0.3, T_LOW = 0.55, T_FAITH = 0.4, T_IMPRINT = 12;

const TRAITS = ['merciful','wrathful','generous','cunning','silent','playful','just','proud'];
const LABEL = {merciful:'Merciful',wrathful:'Wrathful',generous:'Generous',cunning:'Cunning',silent:'Silent',playful:'Playful',just:'Just',proud:'Proud'};
const BLURB = {merciful:'forgives, spares, heals',wrathful:'punishes, frightens, avenges',generous:'gives freely, rewards',cunning:'tricks, bargains, hides its hand',silent:'rarely answers, stays distant',playful:'pranks, delights, bends the rules',just:'keeps count, rewards fairness',proud:'demands recognition and offerings'};
const PHRASE = {merciful:'a god of small mercies',wrathful:'a god not to be crossed',generous:'a giver of good harvests',cunning:'a clever, slippery thing',silent:'a god who rarely answers',playful:'a god with a sense of humor',just:'a god who keeps count',proud:'a god who wants to be honored'};
const DEMAND = {merciful:'forgiveness',wrathful:'fear',generous:'generosity',cunning:'cleverness',silent:'silence',playful:'laughter',just:'fairness',proud:'honor'};
const INTERP = {
  merciful:'They say someone is watching over the house.',
  wrathful:'They say you are not to be crossed.',
  generous:'They say you give without being asked.',
  cunning:'They say there was a trick in it somewhere.',
  silent:'They say you do not explain yourself.',
  playful:'They say you have a sense of humor.',
  just:'They say it was fair, whatever else it was.',
  proud:'They say you will want something for it.'
};
const STAGE_NAMES = {1:'The Last Prayer',2:'The Shrine',3:'The Congregation',4:'The Doctrine',5:'The Reckoning'};
const BANNERS = {4:'Word has spread. There is a shrine now, and people stop at it.',7:'They are no longer asking only for small things.',10:'People have begun to speak on your behalf.',13:'The old signs are returning. Something is coming for the village.'};
const AMBIENT = {
  1:['The old stones are cold. Someone still sweeps them.','A name is spoken once, quietly, by someone who has forgotten the rest of the prayer.'],
  2:['More people stop at the shrine than you expected.','A prayer is said over the evening meal.','Someone has painted a small mark on the shrine door.'],
  3:['They pray for rain, and for the sick, and for things you cannot name.','Two neighbors argue about what you would want.'],
  4:['The priest speaks in the evenings. Not everyone agrees with the priest.','Your name is on a festival day now.'],
  5:['The village is quiet in the way that comes before something.']
};

/* ---------- helpers ---------- */
let _seed = (Date.now() ^ 0x9e3779b9) >>> 0;
function rand(){ _seed = (_seed + 0x6D2B79F5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function setSeed(s){ _seed = s >>> 0; }
const pick = a => a[Math.floor(rand() * a.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const zero = () => Object.fromEntries(TRAITS.map(t => [t, 0]));
const uniform = () => Object.fromEntries(TRAITS.map(t => [t, 1 / TRAITS.length]));
function normalize(o){ let s = 0; for (const t of TRAITS) s += o[t] || 0; const r = {}; for (const t of TRAITS) r[t] = s > 0 ? (o[t] || 0) / s : 1 / TRAITS.length; return r; }
const topTraits = (o, n) => TRAITS.slice().sort((a, b) => o[b] - o[a]).slice(0, n);
function tvd(p, q){ let s = 0; for (const t of TRAITS) s += Math.abs(p[t] - q[t]); return s / 2; }
const stageOf = s => s <= 3 ? 1 : s <= 6 ? 2 : s <= 9 ? 3 : s <= 12 ? 4 : 5;

/* ---------- actions ---------- */
const ACTIONS = [
  {id:'lost', stage:1, name:'Guide a lost thing back', cost:1, tags:{generous:.5,silent:.3,playful:.2}, b:.6, bond:.5, did:'You guide it to the right doorstep.'},
  {id:'dream', stage:1, name:'Soothe someone\u2019s sleep', cost:1, tags:{merciful:.6,silent:.4}, b:.5, bond:.5, did:'You send a quiet dream.'},
  {id:'stumble', stage:1, name:'Make someone stumble, once', cost:1, tags:{playful:.5,cunning:.3,wrathful:.2}, b:.6, did:'You trip them on the path, gently.'},
  {id:'warning', stage:1, name:'Send a warning dream', cost:1, tags:{wrathful:.3,just:.4,cunning:.3}, b:.6, did:'You show them what comes of carelessness.'},
  {id:'mercy', stage:2, name:'Answer a prayer with mercy', cost:2, tags:{merciful:.7,generous:.3}, b:1, pr:1, bond:.8, did:'You answer, freely.'},
  {id:'price', stage:2, name:'Answer, for a price', cost:1, tags:{proud:.5,just:.4,cunning:.1}, b:.5, co:-1, gain:2, did:'You answer, and ask for something in return.'},
  {id:'trick', stage:2, name:'Answer with a trick', cost:1, tags:{cunning:.6,playful:.4}, b:.8, did:'You answer in a way they will argue about.'},
  {id:'gift', stage:2, name:'Answer with a gift', cost:2, tags:{generous:.8,merciful:.2}, b:.8, pr:2, bond:.5, did:'You leave more than they asked for.'},
  {id:'sign', stage:2, name:'Leave a sign in the village', cost:2, tags:{proud:.4,generous:.3,silent:.3}, b:.4, im:6, did:'You leave a mark that will be there next year.'},
  {id:'turn', stage:2, name:'Hear a prayer and turn away', cost:0, tags:{silent:.6,proud:.4}, b:-.6, pr:-10, co:-6, did:'You hear the prayer and do not answer.'},
  {id:'rain', stage:3, name:'Send rain', cost:4, tags:{generous:.5,merciful:.3,just:.2}, b:1, pr:8, im:4, did:'Rain falls on the fields.'},
  {id:'heal', stage:3, name:'Heal the sick', cost:4, tags:{merciful:.7,generous:.3}, b:1, pr:4, co:1, im:2, did:'The fevers break.'},
  {id:'thunder', stage:3, name:'Thunder over the fields', cost:3, tags:{wrathful:.6,proud:.4}, b:1, co:-4, pr:-2, im:4, did:'The sky goes dark and loud.'},
  {id:'expose', stage:3, name:'Expose a liar', cost:3, tags:{just:.6,cunning:.4}, b:.5, co:3, did:'You make the truth hard to hide.'},
  {id:'luck', stage:3, name:'Grant a season of luck', cost:3, tags:{playful:.5,generous:.5}, b:.6, pr:4, co:2, did:'Small things go right for everyone.'},
  {id:'withhold', stage:3, name:'Withhold the rain', cost:0, tags:{silent:.6,wrathful:.2,proud:.2}, b:-.6, pr:-14, co:-6, did:'The fields stay dry. You do nothing about it.'},
  {id:'blight', stage:3, name:'Blight the fields', cost:3, tags:{wrathful:.6,proud:.4}, b:1, pr:-14, co:-6, im:5, did:'The crops blacken in a night.'},
  {id:'flood', stage:3, name:'Flood the valley', cost:6, tags:{wrathful:.7,proud:.3}, b:1, pr:-22, co:-8, pop:-2, im:8, did:'The river comes over its banks and takes what it takes.'}
];
const GROUPS = {1:'Nudge',2:'Answer',3:'Miracles'};
const groupOf = a => a.stage;

/* ---------- state ---------- */
let S = null;
function newGame(counts){
  const lens = {}; for (const t of TRAITS) lens[t] = .6 + rand() * .9;
  S = {season:1, faith:3, bel:1, prosperity:60, cohesion:62, pop:12, imprint:0, bond:0, everActed:false, acts:0,
       doctrine:null, priestInfl:0, spent:false, p0:normalize(counts), counts:Object.assign({}, counts), W:uniform(), lens,
       ap:1, obs:[], results:[], pending:null, flags:{}, phase:'play', result:null, log:[], nudgeOpen:false, crisis:null};
  beginSeason();
  return S;
}
function interpret(tags){ const o = {}; for (const t of TRAITS) o[t] = (tags[t] || 0) * S.lens[t]; return normalize(o); }
function pushW(tags, k){ const i = interpret(tags); for (const t of TRAITS) S.W[t] = S.W[t] * (1 - k) + i[t] * k; }
function clampAll(){ S.prosperity = clamp(S.prosperity, 0, 100); S.cohesion = clamp(S.cohesion, 0, 100); S.bel = clamp(S.bel, 0, S.pop); }
function addBel(x){ S.bel = clamp(S.bel + (x >= 0 ? x * (1 - S.bel / 14) : x), 0, S.pop); }

function beginSeason(){
  S.ap = stageOf(S.season) === 1 ? 1 : 2;
  S.obs = []; S.results = []; S.nudgeOpen = false; S.acts = 0;
  if (S.season === 1) S.obs.push('One person still remembers you.');
  if (BANNERS[S.season]) S.obs.push(BANNERS[S.season]);
  if (S.season > 1 || !S.obs.length) S.obs.push(pick(AMBIENT[stageOf(S.season)]));
  const ev = {7:evMother, 10:evPriest}[S.season];
  if (ev) S.pending = ev();
  if (S.season === 12) startCrisis();
}

function availableActions(){ const st = stageOf(S.season); return ACTIONS.filter(a => a.stage <= st); }
function doAction(id){
  const a = ACTIONS.find(x => x.id === id);
  if (!a || S.pending || S.phase !== 'play' || S.ap < 1 || S.faith < a.cost - 1e-9 || a.stage > stageOf(S.season)) return false;
  S.faith -= a.cost; S.ap--; S.everActed = true; S.acts++;
  if (a.gain) S.faith += a.gain;
  addBel(a.b || 0);
  S.prosperity += a.pr || 0; S.cohesion += a.co || 0; S.imprint += a.im || 0; S.bond += a.bond || 0;
  if (a.pop) S.pop = Math.max(1, S.pop + a.pop);
  pushW(a.tags, .22);
  const top = topTraits(interpret(a.tags), 1)[0];
  S.results.push(a.did + ' ' + INTERP[top]);
  clampAll();
  return true;
}

/* ---------- story events ---------- */
function evMother(){
  return {id:'mother', title:'A prayer you cannot answer',
    text:'A child died in the night, and the child\u2019s mother asks you to bring them back.',
    options:[
      {label:'Refuse, gently', cost:0, tags:{merciful:.6,silent:.4}, apply(){ addBel(-.3); S.cohesion += 1; }, result:'You tell her, as softly as you can, that you cannot. She hears it.'},
      {label:'Refuse, coldly', cost:0, tags:{just:.5,proud:.3,wrathful:.2}, apply(){ addBel(-.8); S.cohesion -= 1; }, result:'You tell her the dead are not yours to give back.'},
      {label:'Give her a dream of the child', cost:3, tags:{cunning:.5,merciful:.5}, apply(){ addBel(.8); S.imprint += 4; S.bond += 1; }, result:'You give her one night with the child. In the morning she is calmer, and a little afraid.'},
      {label:'Say nothing', cost:0, tags:{silent:1}, apply(){ addBel(-1); }, result:'You say nothing. The silence is the answer she hears.'}
    ]};
}
function evPriest(){
  const w = TRAITS.map(t => [t, S.lens[t] * (.5 + rand())]).sort((a, b) => b[1] - a[1]);
  const d = [w[0][0], w[1][0]]; S.doctrine = d; S.priestInfl = .5;
  const vec = () => { const v = zero(); v[d[0]] = .5; v[d[1]] = .5; return v; };
  return {id:'priest', title:'Someone speaks for you',
    text:'A villager has begun speaking for you in the evenings. They say you demand ' + DEMAND[d[0]] + ' and ' + DEMAND[d[1]] + '.',
    options:[
      {label:'Let them speak', cost:0, tags:vec(), apply(){ S.priestInfl = 1; }, result:'You let the words stand.'},
      {label:'Overrule them', cost:2, tags:{proud:.6,wrathful:.2,just:.2}, apply(){ S.priestInfl = .1; S.cohesion -= 3; addBel(-.8); }, result:'You tell them, in a dream, that they have it wrong. They are not sure who to believe.'},
      {label:'Bless their first festival', cost:2, tags:{generous:.35,proud:.35,merciful:.3}, apply(){ S.imprint += 10; S.priestInfl = .7; S.cohesion += 2; }, result:'The festival goes well. It will happen again next year.'}
    ]};
}
function chooseOption(i){
  const ev = S.pending; if (!ev) return false;
  const o = ev.options[i]; if (!o || S.faith < o.cost - 1e-9) return false;
  S.faith -= o.cost;
  pushW(o.tags, .25);
  o.apply(); clampAll();
  S.results.push(o.result);
  S.pending = null;
  return true;
}
function startCrisis(){
  const t = pick(['famine','plague','war']); S.crisis = t;
  if (t === 'famine'){ S.prosperity -= 12; S.cohesion -= 3; S.obs.push('The harvest has failed across the valley. The stores will not last the winter.'); }
  if (t === 'plague'){ S.prosperity -= 6; S.cohesion -= 3; S.obs.push('A sickness is moving along the road, and it has reached the first house.'); }
  if (t === 'war'){ S.prosperity -= 8; S.cohesion -= 6; S.obs.push('Riders from the next valley have been seen at the ford. They are not here to trade.'); }
  clampAll();
}

/* ---------- season end ---------- */
function endSeason(){
  if (S.phase !== 'play' || S.pending) return false;
  S.log.unshift(S.obs.concat(S.results));
  if (S.doctrine && S.season >= 10){
    const v = zero(); v[S.doctrine[0]] = .5; v[S.doctrine[1]] = .5;
    for (const t of TRAITS) S.W[t] = S.W[t] * (1 - .08 * S.priestInfl) + v[t] * .08 * S.priestInfl;
  }
  if (stageOf(S.season) === 1 && S.acts === 0){ forgetEnd(); return true; }
  S.faith = S.faith * .92 + 1 + S.bel * .5;
  S.bel = clamp(S.bel - .25, 0, S.pop);
  if (S.acts === 0){ S.bel = clamp(S.bel - .5, 0, S.pop); S.prosperity -= 3; S.cohesion -= 2; }
  S.cohesion += (62 - S.cohesion) * .07;
  S.prosperity += (62 - S.prosperity) * .06 + (rand() * 6 - 3);
  if (S.season === 12){
    const dead = clamp(Math.round((72 - S.prosperity) / 10 + rand() * 2), 0, 7);
    S.pop -= dead; S.cohesion -= dead * 1.5;
  }
  clampAll();
  if (S.bel <= 0.05){ forgetEnd(); return true; }
  if (S.season >= LAST){ S.phase = 'final'; return true; }
  S.season++; beginSeason(); return true;
}

/* ---------- ending ---------- */
const wellFate = () => (S.pop <= 6 || S.prosperity < 30 || (S.prosperity < 38 && S.cohesion < 40)) ? 'broken' : (S.prosperity >= 56 && S.cohesion >= 50) ? 'thriving' : 'scarred';
function finalOptions(){
  const o = [{id:'stand', label:'Stand with them, as you are'}, {id:'spend', label:'Spend everything you have to protect them'}];
  if (S.bond >= 3) o.push({id:'mortal', label:'Give up godhood and live beside the one you stayed for'});
  o.push({id:'ruin', label:'Bring it all down on them'});
  return o;
}
function resolveEnding(id){
  clampAll();
  const dist = tvd(S.p0, S.W);
  const cons = dist < T_HIGH ? 'high' : dist < T_LOW ? 'medium' : 'low';
  const reach = (S.bel / Math.max(1, S.pop)) * (S.spent ? .5 : 1);
  const hiF = reach >= T_FAITH, hiI = S.imprint >= T_IMPRINT;
  const legacy = id === 'mortal' ? 'mortal' : hiF ? (hiI ? 'major' : 'bright') : (hiI ? 'remembered' : 'forgotten');
  const fate = wellFate();
  const e = ENDINGS[legacy][cons][fate];
  S.result = {legacy, cons, fate, title:e[0], text:e[1], dist, reach};
  S.phase = 'ending';
  return S.result;
}
function finalChoose(id){
  if (S.phase !== 'final') return null;
  if (id === 'spend'){ S.spent = true; S.faith = 0; S.prosperity += 8; S.cohesion += 4; S.imprint += 6; }
  if (id === 'mortal') S.prosperity += 3;
  if (id === 'ruin'){ S.prosperity = Math.min(S.prosperity, 8); S.cohesion = Math.min(S.cohesion, 8); S.pop = Math.max(1, S.pop - 5); S.imprint += 4; }
  return resolveEnding(id);
}
function forgetEnd(){
  S.bel = 0;
  if (!S.everActed){ S.result = {legacy:'nothing', cons:'-', fate:'-', title:NOTHING[0], text:NOTHING[1], dist:0, reach:0}; S.phase = 'ending'; return S.result; }
  return resolveEnding('forgot');
}
function describe(W, past){
  const [a, b] = topTraits(W, 2);
  if (W[a] < .16) return past ? 'they could not agree on what you were.' : 'They cannot agree on what you are.';
  const x = W[b] >= .14 ? PHRASE[a] + ', and ' + PHRASE[b] : PHRASE[a];
  return past ? 'they said you were ' + x + '.' : 'They say you are ' + x + '.';
}
function startPhrase(p){ const [a, b] = topTraits(p, 2); return p[b] >= .15 ? PHRASE[a] + ', and ' + PHRASE[b] : PHRASE[a]; }

/* ---------- endings: legacy -> consistency -> village fate ---------- */
const ENDINGS = {
forgotten:{
 high:{
  thriving:['The Quiet Debt','The harvests are good and the children are fed, and nobody knows why. Your shrine is a pile of stones in a field. You stayed who you chose to be, to the end, and no one ever said your name for it. You find that this is enough, or that you have to decide it is.'],
  scarred:['Unwitnessed','The village survives, thinner than it was, and tells itself the hard years were weather. You stayed who you chose to be through all of them and nobody connected it to you. You are still exactly who you meant to be, with no one left to be it for.'],
  broken:['Intact','The village is gone, or going, and the last fire out there belongs to strangers passing through. You never stopped being yourself. It saved nothing, and nobody is left to say whether that was a mistake.']},
 medium:{
  thriving:['Worn Smooth','The village is well, and some of the reason is you, though not the way you planned. You set out to be one kind of god and gave up some of it for what they needed more. They have forgotten you now, and you have mostly forgotten the god you started as. The village is better for the trade. You can\u2019t tell if you are.'],
  scarred:['Half a Shape','You ended up between who you chose to be and who they needed, and they have forgotten both. The village limps through the years you left behind. What it remembers is a bad winter and a vague sense that someone was supposed to help.'],
  broken:['Neither','You bent toward what they needed, and it was not enough. You held on to who you were, and that was not enough either. The village is empty, and no one who left remembers you. Whatever you were in the middle, it did not hold.']},
 low:{
  thriving:['Someone Else\u2019s Work','The village thrives, and nobody knows a god had any part in it. You set out to be one thing and became another, and it worked, in the sense that they are fed. Nothing of you remains, in either version. If someone asked who you were, you would not know which answer to give.'],
  scarred:['Hollowed','You gave yourself away a piece at a time, each time for a good reason, until what remained was only what they had asked for. They have forgotten even that, and the village survives the way people survive. Nothing is left of the god you chose, and nothing is left of the god they wanted.'],
  broken:['Nothing to Return To','You stopped being yourself early and became something else, for reasons that seemed good at the time. The village is gone anyway. You were forgotten as something you never meant to be, in a place that no longer exists.']}},
major:{
 high:{
  thriving:['The God You Chose','They build you a temple, and the festival days are yours, and the god they worship is the one you set out to be. Children learn your habits as manners. The village is full and warm, and somewhere in the noise of it you recognize yourself. It is a rare thing, to be loved for what you are.'],
  scarred:['The Same Hands','They worship you, and the village endures, bruised, and you are still the god you started as. Some of the people who suffered do not forgive you, and you cannot say they are wrong. You never changed. That is the comfort, and it is also the charge.'],
  broken:['Faithful to the End','The temple stands over a village that is not there anymore, and the few who remain still pray to you. You never became anything else, not even to save them. You were exactly what you chose to be, and it was not what they needed.']},
 medium:{
  thriving:['A Fair Likeness','They love you, and the village is better for it, and you are close to the god you meant to be. Close is not the same. Your statues are slightly wrong in ways no one but you can see, and you let them stand. It is a good life with a few things missing.'],
  scarred:['The Compromise','The temple is full and the village is scarred, and you are partly who you chose and partly who they asked for. The priests call it wisdom, and the village is too tired to disagree. You remember each place where you gave way, and what it bought.'],
  broken:['The Cost of Being Worshipped','They worship you in ruins. You gave them what they asked for, a little at a time, and it was never enough to hold them together. Your name is carved over every empty door. You are half what you chose and half what they wanted, and the village died of both.']},
 low:{
  thriving:['A Mask That Fits','The village thrives, and the god it worships is exactly what they wanted and little else. They are happy. You gave them what they wanted until nothing of the original was left. There is a god in the temple, and it fits them perfectly. It is not you, and it is the only version of you anyone will ever know.'],
  scarred:['Their Image','They made you in their own image, and then lived in the world that image made. The village endures, scarred, and every festival is for a god who is mostly their own invention. You watch from somewhere inside it, unrecognized by the thing you became.'],
  broken:['The God They Asked For','You became everything they asked for, and it ruined them. The temples are enormous and the village is empty, and the god on the altar is what they asked for, to the bone. There is no one left to ask for anything else.']}},
bright:{
 high:{
  thriving:['A Good Generation','For one generation you are the god of everything: the harvests, the births, the festivals. The village thrives, and you are still yourself. Then the old believers die, the new ones have no reason to pray, and you fade. You had one very good generation, and you spent it as who you wanted to be.'],
  scarred:['Burned Clean','They believed in you fiercely and they survived, though they are not what they were. You stayed who you chose to be through all of it. When the last person who remembers the worst years is gone, so is the belief, and the village forgets you the way people forget a fever.'],
  broken:['A Flame in the Wind','They prayed to you with everything they had, and you answered as yourself, and the village fell anyway. The faith died with the people who held it. Nothing was left to pass on. You were true to yourself, and it burned out with them.']},
 medium:{
  thriving:['What They Needed for a While','You were everything to them for a time, and the village thrived on it. You were partly yourself and partly what they asked for. When the need passes, so does the faith. Their grandchildren will not know your name, and you will have been, briefly, exactly useful.'],
  scarred:['Borrowed Light','They worshipped you hard and fast, and the village comes through scarred. You gave them part of what you were and part of what they wanted. It was enough for one generation. Then the prayers get quieter, and neither version of you is anyone\u2019s inheritance.'],
  broken:['Too Bright','Everyone believed, and it was not enough. The village is gone, and the faith with it, inside a single generation. You were halfway between who you chose to be and who they needed, and you were not enough of either to hold them. It happened fast. You can still hear the last prayer.']},
 low:{
  thriving:['Dawn and Dusk','For a moment you are the center of everything, and the village flourishes. The face they see is not your own but a kinder, more useful one, shaped entirely by what they needed. When they stop needing it, the god goes with the need. The village remains. The god it worshipped was an arrangement, and arrangements end.'],
  scarred:['Spent','The village worshipped you with a fury, and you gave it a version of yourself you hardly recognized. It is scarred but standing. The faith leaves as quickly as it came, and you are not sure anything of yours goes with it.'],
  broken:['Ash','You became what they begged for, and they worshipped you to the end. The village is gone, and the faith was gone before it. You were not who you chose to be, and you were a god for one generation, and there is no one left to say you ever were.']}},
remembered:{
 high:{
  thriving:['A Rhyme About You','Nobody prays to you anymore, and the village is doing well. At the harvest they still sing a song that makes no sense, a hill carries your name, and the children play a game you used to play. It is your own self in small pieces, kept by people who don\u2019t know why. You stayed who you chose to be, and a little of it survived.'],
  scarred:['Worn Into the Floor','The village is scarred, and it has stopped praying. But its customs are yours: the way they greet the winter, the stone they leave at the road. You stayed yourself, and it lives on in the habits of people who could not tell you where they learned them.'],
  broken:['The Last Custom','The village is dying, and nobody prays. The few who are left still set out a bowl at the door in the old way and don\u2019t know why. It is exactly what you would have done. It is all that remains of the god you chose to be, and it is almost enough.']},
 medium:{
  thriving:['Garbled','The village is well and the faith is long gone, but they keep a festival that is half what you stood for and half what they wished. They have the stories slightly wrong. You are partly yourself in them and partly a stranger, and they are happy with either.'],
  scarred:['A Name on a Hill','The village is scarred, and it keeps your name on a hill and a song at the harvest, though neither means what it used to. You are partly the god you chose and partly something the village invented. The hill is the one piece of you nobody argues about.'],
  broken:['The Wrong Song','The village is almost gone, and the few who are left sing one of your songs at funerals. The words are mixed up, half what you were and half what they wished. It is not the god you chose, and it is not the one they asked for. It is what is left.']},
 low:{
  thriving:['A Stranger\u2019s Holiday','They keep a festival in your name, and the village is prosperous, and almost nothing of it is you. They remember a god you never meant to be. Children dress up as you and do things you would never do. You are a happy story with someone else\u2019s face.'],
  scarred:['Folklore','The village is scarred, and at the fire they tell a story about you. In the story you are not who you wanted to be. They have forgotten the rest. The story is warm, and it is not yours.'],
  broken:['A Ghost Story','The village is gone, and the story about you survives in the three people who left. In it you are a figure to fear or to hope for. They have no idea who you were. A god you never chose is the only one remembered.']}},
mortal:{
 high:{
  thriving:['One of Them','You give up the shrine and the power and walk into the village as a neighbor. You are still yourself. It shows in how you share, how you listen, and what you won\u2019t do, and no one knows why. The village thrives, and you have a name for the first time, a small one, and it is yours.'],
  scarred:['Ordinary Hands','You become one of them, and the village is scarred, and you are still yourself with no power to prove it. You help in the ways a person can. It is slower and it costs more, and nobody thanks you, and you find you do not need them to.'],
  broken:['Staying','The village is failing, and you gave up godhood to be in it. You are the same person you chose to be, and you cannot stop what is happening. You are here with them in the bad years, being who you meant to be. It is all a mortal can do.']},
 medium:{
  thriving:['Learning to Be Small','You leave the shrine behind and become a neighbor. You are partly the god you chose and partly someone new, someone who has to learn how to mend a fence. The village thrives without needing you. You are not sure which part of yourself you are keeping.'],
  scarred:['Both Halves','You live among them now, and the village is scarred. You carry some of what you were and some of what they made of you. People say you are odd. You mostly agree, and mostly you are one of them.'],
  broken:['Late','You gave up the god to join them, and the village is falling anyway. You are somewhat the one you chose to be and somewhat the one they needed. You help where you can. It is not much, and for the first time you can feel exactly how little.']},
 low:{
  thriving:['A New Name','You give up godhood, and the person who walks into the village is someone new. Almost nothing of the god you meant to be came with you. The village thrives, and you take a new name and use it. Nobody asks who you were, and you are glad.'],
  scarred:['Someone Else, Alive','You are mortal now, and the village is scarred, and you are far from the god you chose. You are what the village made of you, with hands. You have a bed, a bad knee, and a place at the table. It is the first real thing that has ever happened to you.'],
  broken:['Cold Hands','You become one of them as the village falls apart. You are nothing like who you chose to be. You have a body now, in a place that is dying. You hold the one you stayed for, and it is the only thing that is yours.']}}
};
const LEGACY_LABEL = {major:'Major god',bright:'Bright and brief',remembered:'Remembered',forgotten:'Forgotten',mortal:'Mortal'};
const NOTHING = ['Nobody Remembered', 'You did nothing, and the season passed. The last person who remembered you said your name once more, to no one in particular, and then lost the thread of it. There is no shrine, no song, no village that ever knew you were there. You are completely gone, and nothing in the world is different.'];

const GameAPI = {newGame, getS:() => S, doAction, endSeason, chooseOption, finalChoose, finalOptions, availableActions, ACTIONS, ENDINGS, TRAITS, tvd, setSeed, rand, stageOf, groupOf, describe, startPhrase, setT:(h, l, f, i) => { T_HIGH = h; T_LOW = l; T_FAITH = f; T_IMPRINT = i; }};


window.SmallGodsGame = Object.assign(GameAPI, { TITLE, LAST, BUDGET, MAXPER, LABEL, BLURB, STAGE_NAMES, GROUPS, LEGACY_LABEL, NOTHING });
})();
