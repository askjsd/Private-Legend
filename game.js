(function(){
'use strict';
const TITLE = 'Small Gods';
const LAST = 13, BUDGET = 12, MAXPER = 5;
let T_HIGH = 0.3, T_LOW = 0.55, T_FAITH = 0.4, T_IMPRINT = 12;

const TRAITS = ['merciful','wrathful','generous','cunning','silent','playful','just','proud','selfish'];
const LABEL = {merciful:'Merciful',wrathful:'Wrathful',generous:'Generous',cunning:'Cunning',silent:'Silent',playful:'Playful',just:'Just',proud:'Proud',selfish:'Selfish'};
const BLURB = {merciful:'forgives, spares, heals',wrathful:'punishes, frightens, avenges',generous:'gives freely, rewards',cunning:'tricks, bargains, hides its hand',silent:'rarely answers, stays distant',playful:'pranks, delights, bends the rules',just:'keeps count, rewards fairness',proud:'demands recognition and offerings',selfish:'takes first, keeps what it can'};
const PHRASE = {merciful:'a god of small mercies',wrathful:'a god not to be crossed',generous:'a giver of good harvests',cunning:'a clever, slippery thing',silent:'a god who rarely answers',playful:'a god with a sense of humor',just:'a god who keeps count',proud:'a god who wants to be honored',selfish:'a god that takes its share first'};
const DEMAND = {merciful:'forgiveness',wrathful:'fear',generous:'generosity',cunning:'cleverness',silent:'silence',playful:'laughter',just:'fairness',proud:'honor',selfish:'a share of every harvest'};
const INTERP = {
  merciful:'They say someone is watching over the house.',
  wrathful:'They say you are not to be crossed.',
  generous:'They say you give without being asked.',
  cunning:'They say there was a trick in it somewhere.',
  silent:'They say you do not explain yourself.',
  playful:'They say you have a sense of humor.',
  just:'They say it was fair, whatever else it was.',
  proud:'They say you will want something for it.',
  selfish:'They say you always take your share first.'
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
  {id:'price', stage:2, name:'Answer, for a price', cost:1, tags:{selfish:.45,proud:.3,just:.15,cunning:.1}, b:.5, co:-1, gain:2, did:'You answer, and ask for something in return.'},
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
  {id:'flood', stage:3, name:'Flood the valley', cost:6, tags:{wrathful:.7,proud:.2,selfish:.1}, b:1, pr:-22, co:-8, pop:-2, im:8, did:'The river comes over its banks and takes what it takes.'},
  {id:'gathering', stage:2, fame:4, name:'Call a village gathering', cost:2, tags:{generous:.35,playful:.25,just:.25,merciful:.15}, b:.7, co:3, pr:2, im:2, did:'People meet beneath the old trees.'},
  {id:'custom', stage:2, fame:7, name:'Establish a yearly custom', cost:3, tags:{proud:.3,generous:.3,silent:.2,playful:.2}, b:.35, im:8, did:'A small custom takes root.'},
  {id:'edict', stage:3, belief:5, name:'Proclaim a village doctrine', cost:3, tags:{proud:.3,just:.3,selfish:.2,cunning:.2}, b:.8, co:-2, im:5, did:'Your words become a rule people argue over.'}
];
const GROUPS = {1:'Nudge',2:'Answer',3:'Miracles'};
const groupOf = a => a.stage;
const OUTSIDE_NEEDS = {
  harvest:{label:'a poor harvest',tags:{generous:.65,merciful:.35}},
  sickness:{label:'a fever moving through several homes',tags:{merciful:.75,generous:.25}},
  dispute:{label:'a bitter boundary dispute',tags:{just:.65,merciful:.2,wrathful:.15}},
  flood:{label:'water rising along the lower fields',tags:{cunning:.35,merciful:.4,generous:.25}}
};
const VILLAGE_SCALE=10;
const VILLAGE_CHOICES={
  harvest:[
    {id:'seed',name:'Send seed and tools',cost:4,belief:.16,global:.55,welfare:7,cohesion:2,tags:{generous:.55,merciful:.3,just:.15},text:'You send seed and tools to the households that lost the most.'},
    {id:'ration',name:'Set a fair ration',cost:4,belief:.13,global:.4,welfare:5,cohesion:4,tags:{just:.65,merciful:.2,silent:.15},text:'You guide the village toward a ration no household can quietly change.'},
    {id:'levy',name:'Protect the largest landholders’ stores',cost:3,belief:.1,global:.65,welfare:-7,cohesion:-5,tags:{selfish:.45,proud:.3,cunning:.25},text:'You preserve the largest stores. The poorer households remember who went without.'}
  ],
  sickness:[
    {id:'infirmary',name:'Open a shared infirmary',cost:5,belief:.16,global:.55,welfare:6,cohesion:3,tags:{merciful:.65,generous:.25,just:.1},text:'You turn an empty hall into a place where the sick can be tended.'},
    {id:'water',name:'Clean the wells and water jars',cost:4,belief:.13,global:.45,welfare:5,cohesion:2,tags:{merciful:.4,just:.4,cunning:.2},text:'The wells are cleaned, and the fever slows.'},
    {id:'quarantine',name:'Isolate the first households',cost:3,belief:.08,global:.25,welfare:-2,cohesion:-5,tags:{silent:.35,just:.35,wrathful:.3},text:'The sick are separated from the rest. Some are frightened by the silence around them.'}
  ],
  dispute:[
    {id:'hear',name:'Hear both sides in public',cost:4,belief:.14,global:.5,welfare:3,cohesion:5,tags:{just:.6,merciful:.3,generous:.1},text:'Both sides speak before the village, and neither can claim they were unheard.'},
    {id:'mediate',name:'Ask neighboring elders to mediate',cost:5,belief:.17,global:.6,welfare:5,cohesion:4,tags:{merciful:.45,just:.35,cunning:.2},text:'Elders from the neighboring village help settle the boundary.'},
    {id:'strong',name:'Rule for the stronger household',cost:3,belief:.09,global:.6,welfare:-4,cohesion:-7,tags:{wrathful:.35,selfish:.35,proud:.3},text:'The stronger household gets its way. The dispute ends, but the grievance does not.'}
  ],
  flood:[
    {id:'levee',name:'Raise a shared levee',cost:5,belief:.15,global:.5,welfare:7,cohesion:3,tags:{generous:.35,just:.3,cunning:.25,merciful:.1},text:'Neighbors raise a levee together before the water reaches the lower homes.'},
    {id:'relocate',name:'Move families to higher ground',cost:4,belief:.13,global:.45,welfare:4,cohesion:4,tags:{merciful:.5,just:.3,generous:.2},text:'The lower homes empty before the water reaches them.'},
    {id:'mills',name:'Save the mills first',cost:3,belief:.08,global:.55,welfare:-6,cohesion:-5,tags:{selfish:.4,cunning:.3,proud:.2,just:.1},text:'The mills are saved. Families downstream watch the water rise.'}
  ]
};
const VILLAGE_COUNSEL=[
  {id:'strangers',question:'Travelers arrive with little food. What should the village do?',choices:[
    {id:'welcome',name:'Share stores and shelter them',cost:5,belief:.16,global:.5,welfare:-1,cohesion:4,tags:{generous:.55,merciful:.35,playful:.1},text:'The travelers are given a place by the fire and a share of the stores.'},
    {id:'work',name:'Offer food in exchange for work',cost:4,belief:.12,global:.45,welfare:3,cohesion:1,tags:{just:.4,generous:.25,cunning:.25,selfish:.1},text:'The travelers work for their keep, and a few stay after the road dries.'},
    {id:'turnaway',name:'Send them on before stores run short',cost:3,belief:.08,global:.55,welfare:2,cohesion:-4,tags:{proud:.35,silent:.3,selfish:.25,just:.1},text:'The village closes its doors. The travelers continue down the road.'}
  ]},
  {id:'trade',question:'A neighboring village asks to share the old road. How should you answer?',choices:[
    {id:'openroad',name:'Open the road to both villages',cost:4,belief:.14,global:.45,welfare:5,cohesion:4,tags:{generous:.35,just:.35,cunning:.2,playful:.1},text:'The road is opened, and traders begin to travel both ways.'},
    {id:'toll',name:'Allow passage for a fair toll',cost:3,belief:.11,global:.5,welfare:4,cohesion:1,tags:{just:.4,cunning:.3,proud:.2,selfish:.1},text:'A toll is agreed upon. No one loves it, but the road stays open.'},
    {id:'close',name:'Keep the road for this village alone',cost:3,belief:.07,global:.6,welfare:-1,cohesion:-4,tags:{selfish:.4,proud:.3,silent:.2,wrathful:.1},text:'The road remains closed to outsiders, and the neighboring village takes note.'}
  ]},
  {id:'custom',question:'The elders disagree about which custom to keep. Which one should guide them?',choices:[
    {id:'care',name:'Keep the custom that cares for the vulnerable',cost:4,belief:.15,global:.5,welfare:4,cohesion:3,tags:{merciful:.45,generous:.35,just:.2},text:'The custom is kept, and the poorest households are included.'},
    {id:'balance',name:'Let each household choose for itself',cost:3,belief:.11,global:.35,welfare:1,cohesion:2,tags:{just:.4,silent:.3,merciful:.2,playful:.1},text:'No single custom is imposed. The elders leave the choice to each household.'},
    {id:'authority',name:'Let the strongest elder decide',cost:3,belief:.08,global:.55,welfare:-2,cohesion:-5,tags:{proud:.35,wrathful:.25,selfish:.25,cunning:.15},text:'One elder decides for everyone. The others remember being overruled.'}
  ]}
];

/* ---------- state ---------- */
let S = null, RUN_ID = 0;
function newGame(counts){
  S = null;
  RUN_ID++;
  const lens = {}; for (const t of TRAITS) lens[t] = .6 + rand() * .9;
  const villagers = [
    {id:'mara',name:'Mara',trade:'farmer',home:'The Crooked House',belief:.12,influence:1,ties:[{id:'oren',trust:.8},{id:'leni',trust:.45}],prayers:[{text:'My bean shoots are curling. I need rain before the well runs low.',traits:{generous:.7,merciful:.3}},{text:'I need a good harvest before the dry weeks.',traits:{generous:.7,just:.3}},{text:'Please keep the goats out of my seedlings.',traits:{just:.5,merciful:.3,cunning:.2}}]},
    {id:'oren',name:'Oren',trade:'smith',home:'The Smithy',belief:0,influence:3,ties:[{id:'mara',trust:.8},{id:'leni',trust:.35}],prayers:[{text:'My daughter has a fever. I need you to ease it, if you can.',traits:{merciful:.7,generous:.3}},{text:'I need a steady hand before this difficult repair.',traits:{just:.4,cunning:.35,generous:.25}},{text:'Please keep the road safe for my apprentice.',traits:{merciful:.4,just:.4,silent:.2}}]},
    {id:'leni',name:'Leni',trade:'weaver',home:'The Blue Door',belief:0,influence:2,ties:[{id:'mara',trust:.45},{id:'tomas',trust:.75}],prayers:[{text:'I need you to settle a quarrel over my boundary fence.',traits:{just:.65,merciful:.35}},{text:'I need enough thread to finish my order.',traits:{generous:.5,cunning:.3,playful:.2}},{text:'I need Tomas to return the winter grain he borrowed.',traits:{just:.5,merciful:.3,generous:.2}}]},
    {id:'tomas',name:'Tomas',trade:'goatherd',home:'The Goat Shed',belief:0,influence:2,ties:[{id:'leni',trust:.75}],prayers:[{text:'I cannot find my old goat before nightfall. Please send me a sign.',traits:{merciful:.4,playful:.4,cunning:.2}},{text:'Please keep the wolves from my flock.',traits:{just:.4,wrathful:.3,merciful:.3}},{text:'I hope no one notices the missing grain.',traits:{silent:.5,selfish:.3,cunning:.2}}]},
    {id:'vale',name:'Lord Vale',trade:'reeve',home:'The Manor',belief:0,influence:5,ties:[{id:'mara',trust:.55},{id:'oren',trust:.45},{id:'leni',trust:.25},{id:'tomas',trust:.35},{id:'bram',trust:.6}],prayers:[{text:'Bless my new levy on the tenant families.',traits:{selfish:.5,proud:.3,cunning:.2}},{text:'Send a sign to quiet those questioning my lands.',traits:{proud:.4,wrathful:.3,cunning:.3}},{text:'Make my harvest look like a gift from the gods.',traits:{cunning:.4,proud:.3,generous:.3}}]},
    {id:'hester',name:'Hester',trade:'midwife',home:'The Rowan Cottage',belief:0,influence:3,ties:[{id:'oren',trust:.7},{id:'leni',trust:.55},{id:'kit',trust:.9}],prayers:[{text:'I need this difficult birth to end safely for both mother and child.',traits:{merciful:.7,generous:.3}},{text:'I need enough herbs to see the village through the fever.',traits:{generous:.5,merciful:.4,just:.1}},{text:'Please quiet this family and let a grieving mother rest.',traits:{just:.45,merciful:.4,silent:.15}}]},
    {id:'kit',name:'Kit',trade:'apprentice',home:'The Little Loft',belief:0,influence:1,ties:[{id:'mara',trust:.65},{id:'hester',trust:.9}],prayers:[{text:'Please send my missing dog home.',traits:{playful:.5,merciful:.35,cunning:.15}},{text:'I need help finishing my carving before the market.',traits:{playful:.35,cunning:.35,generous:.3}},{text:'Please keep the older children from mocking me.',traits:{merciful:.5,just:.35,wrathful:.15}}]},
    {id:'bram',name:'Bram',trade:'miller',home:'The Mill House',belief:0,influence:3,ties:[{id:'tomas',trust:.6},{id:'vale',trust:.6},{id:'ada',trust:.5}],prayers:[{text:'I need the mill wheel to hold through the next hard rain.',traits:{cunning:.4,just:.35,generous:.25}},{text:'I need enough grain to keep my mill working through winter.',traits:{generous:.6,just:.25,merciful:.15}},{text:'Please expose whoever has been taking flour from my bins.',traits:{just:.55,wrathful:.25,cunning:.2}}]},
    {id:'ada',name:'Ada',trade:'potter',home:'The Kiln House',belief:0,influence:2,ties:[{id:'leni',trust:.6},{id:'bram',trust:.5}],prayers:[{text:'I need the kiln fire to burn evenly through this large order.',traits:{cunning:.45,just:.3,playful:.25}},{text:'I need customers after a run of cracked pots.',traits:{generous:.45,merciful:.3,cunning:.25}},{text:'I need a fair hearing after a merchant blames me for his mistake.',traits:{just:.65,wrathful:.2,merciful:.15}}]}
  ];
  generateRelationships(villagers);
  for(const v of villagers){v.unrestShaken=false;delete v.beliefBeforeUnrest;delete v.unrestShakenRun;}
  const hearthMembers=new Set(randomVillagers(villagers,4).map(v=>v.id));
  for(const v of villagers)v.faction=hearthMembers.has(v.id)?'hearth':'wardens';
  S = {runId:RUN_ID, season:1, faith:3, bel:1, prosperity:60, cohesion:62, pop:9, imprint:0, bond:0, everActed:false, acts:0,
       doctrine:null, priestInfl:0, spent:false, p0:normalize(counts), counts:Object.assign({}, counts), W:uniform(), lens,
       ap:1, obs:[], results:[], pending:null, flags:{}, phase:'play', result:null, log:[], nudgeOpen:false, crisis:null, villagers,
       threats:{sickness:8,hunger:5,unrest:4}, tended:{}, carryObs:[], fame:1,
       settlements:{valley:{name:'The Valley',open:true,belief:.55,prosperity:60,opinion:uniform(),need:null,praying:false},westmere:{name:'Westmere',open:false,belief:0,prosperity:60,opinion:uniform(),need:null,praying:false},eastbank:{name:'Eastbank',open:false,belief:0,prosperity:60,opinion:uniform(),need:null,praying:false}},settlementChoice:null,
       factions:{hearth:{name:'Hearth Circle',belief:.42,opinion:normalize({merciful:.35,generous:.35,playful:.15,just:.15})},wardens:{name:'Stone Wardens',belief:.38,opinion:normalize({just:.35,proud:.25,wrathful:.15,cunning:.15,silent:.1})}},customs:[],customFlags:{},rumorFeed:[]};
  generateSettlementRelationships(S.settlements);
  recalculateFame();
  beginSeason();
  return S;
}
function interpret(tags){ const o = {}; for (const t of TRAITS) o[t] = (tags[t] || 0) * S.lens[t]; return normalize(o); }
function pushW(tags, k){ const i = interpret(tags); for (const t of TRAITS) S.W[t] = S.W[t] * (1 - k) + i[t] * k; for(const f of Object.values(S.factions||{})){let fit=0;for(const t of TRAITS)fit+=i[t]*f.opinion[t];f.belief=clamp(f.belief+(fit-.11)*k*.8,0,1);} }
function clampAll(){ S.prosperity = clamp(S.prosperity, 0, 100); S.cohesion = clamp(S.cohesion, 0, 100); S.bel = clamp(S.bel, 0, S.pop); }
function recalculateFame(){
  let personal=0;
  for(const v of S.villagers){
    v.fameContribution=v.dead?0:clamp(v.belief,0,1)*(v.influence||1);
    personal+=v.fameContribution;
  }
  S.fame=personal;
  return S.fame;
}
function changeVillagerBelief(v,amount){
  const before=v.belief;
  const shakenThisRun=v.unrestShaken&&v.unrestShakenRun===S.runId;
  if(v.unrestShaken&&!shakenThisRun){v.unrestShaken=false;delete v.beliefBeforeUnrest;delete v.unrestShakenRun;}
  if(amount>0&&shakenThisRun&&before<(v.beliefBeforeUnrest||0)){
    const target=v.beliefBeforeUnrest,needed=target-before,effortToRecover=needed*2;
    const gain=amount>=effortToRecover?needed+(amount-effortToRecover):amount*.5;
    v.belief=clamp(before+gain,0,1);
    if(v.belief>=target){v.unrestShaken=false;delete v.unrestShakenRun;}
  }else{
    v.belief=clamp(before+amount,0,1);
    if(shakenThisRun&&v.belief>=(v.beliefBeforeUnrest||0)){v.unrestShaken=false;delete v.unrestShakenRun;}
  }
  return v.belief-before;
}
function shiftBeliefForFame(amount){
  if(!amount)return 0;
  const sign=Math.sign(amount), pool=S.villagers.filter(v=>!v.dead&&v.influence>0);
  const capacity=v=>(sign>0?1-v.belief:v.belief)*v.influence;
  const total=pool.reduce((sum,v)=>sum+capacity(v),0), applied=Math.min(Math.abs(amount),total);
  if(total<=0)return 0;
  let beliefDelta=0;
  for(const v of pool){const share=applied*capacity(v)/total, delta=share/v.influence;beliefDelta+=changeVillagerBelief(v,sign*delta);}
  return beliefDelta;
}
function changeTrackedFame(amount){const beliefDelta=shiftBeliefForFame(amount);S.bel=clamp(S.bel+beliefDelta,0,S.pop);recalculateFame();}
function addBel(x,fameChange=x){ S.bel = clamp(S.bel + (x >= 0 ? x * (1 - S.bel / 14) : x), 0, S.pop); shiftBeliefForFame(fameChange); recalculateFame(); }
function shiftPersonBelief(v,amount){if(v&&!v.dead){changeVillagerBelief(v,amount);recalculateFame();}}
function shiftFactionBeliefs(faction,amount){let total=0;for(const v of S.villagers){if(v.dead||v.faction!==faction)continue;total+=changeVillagerBelief(v,amount);}S.bel=clamp(S.bel+total,0,S.pop);recalculateFame();}
function blessAllVillagers(amount){let gained=0;for(const v of S.villagers){if(v.dead)continue;gained+=changeVillagerBelief(v,amount);}S.bel=clamp(S.bel+gained,0,S.pop);recalculateFame();return gained;}
function randomVillagers(list,count){
  const pool=list.slice(), chosen=[];
  for(let i=0;i<count&&pool.length;i++)chosen.push(pool.splice(Math.floor(rand()*pool.length),1)[0]);
  return chosen;
}
function generateSettlementRelationships(settlements){
  const ids=Object.keys(settlements);
  for(const id of ids)settlements[id].relations={};
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
    const strength=25+Math.floor(rand()*61);
    settlements[ids[i]].relations[ids[j]]=strength;
    settlements[ids[j]].relations[ids[i]]=strength;
  }
}
function generateRelationships(villagers){
  const order=randomVillagers(villagers,villagers.length);
  for(let i=0;i<order.length;i++){
    const source=order[i],next=order[(i+1)%order.length],others=villagers.filter(v=>v.id!==source.id&&v.id!==next.id);
    const degree=Math.min(villagers.length-1,2+Math.floor(rand()*3));
    const links=[next,...randomVillagers(others,degree-1)];
    const weights=links.map(()=>.2+rand()),total=weights.reduce((sum,w)=>sum+w,0);
    source.ties=links.map((v,j)=>({id:v.id,trust:weights[j]/total}));
  }
}
function killRandomVillagers(reason){
  const living=S.villagers.filter(v=>!v.dead), count=Math.min(Math.floor(rand()*4),living.length);
  const victims=randomVillagers(living,count);
  for(const v of victims){
    v.beliefAtDeath=v.belief;
    v.fameContributionAtDeath=v.belief*(v.influence||1);
    v.dead=true;v.belief=0;v.praying=false;v.satisfied=false;v.answered=true;
    S.bel=Math.max(0,S.bel-v.beliefAtDeath);
    S.pop=Math.max(1,S.pop-1);
  }
  recalculateFame();
  const names=victims.map(v=>v.name);
  return names.length?reason+' takes '+names.join(', ')+'. Their belief and fame are lost.': 'No one dies this time.';
}
function unrestBeliefLoss(){
  const believers=S.villagers.filter(v=>!v.dead&&v.belief>0), count=Math.min(Math.floor(rand()*4),believers.length);
  const shaken=randomVillagers(believers,count);
  for(const v of shaken){v.beliefBeforeUnrest=v.belief;v.unrestShaken=true;v.unrestShakenRun=S.runId;v.belief=0;v.praying=false;v.satisfied=true;S.bel=Math.max(0,S.bel-v.beliefBeforeUnrest);}
  recalculateFame();
  return shaken.length?shaken.map(v=>v.name).join(', ')+' lose their belief.': 'No one loses their belief this time.';
}
function shiftSettlementOpinion(place,tags,k){
  const opinion=interpret(tags);
  for(const t of TRAITS)place.opinion[t]=place.opinion[t]*(1-k)+opinion[t]*k;
}
function villageInfluence(k){return 1-Math.pow(1-k,VILLAGE_SCALE);}
function recordVillageChoice(place,choice){
  pushW(choice.tags,villageInfluence(.24));
  shiftSettlementOpinion(place,choice.tags,villageInfluence(.35));
  for(const [id,strength] of Object.entries(place.relations||{})){
    const neighbor=S.settlements[id];if(!neighbor||!neighbor.open)continue;
    const link=strength/100;
    shiftSettlementOpinion(neighbor,choice.tags,.04*link);
    neighbor.prosperity=clamp(neighbor.prosperity+choice.welfare*.08*link,0,100);
    if(neighbor===S.settlements.valley){S.prosperity=neighbor.prosperity;S.cohesion+=choice.cohesion*.05*link;S.bel=clamp(S.bel+(choice.belief-.1)*.08*link,0,S.pop);}
    else neighbor.belief=clamp(neighbor.belief+(choice.belief-.1)*.12*link,0,1);
  }
}
function traitProsperityScore(opinion){
  const values={merciful:.8,generous:1,just:.7,playful:.15,silent:0,cunning:-.15,proud:-.45,wrathful:-.85,selfish:-1};
  const identity=Object.fromEntries(TRAITS.map(t=>[t,(S.p0[t]||0)*.55+(S.W[t]||0)*.45]));
  const virtue=TRAITS.reduce((sum,t)=>sum+identity[t]*(values[t]||0),0);
  const alignment=TRAITS.reduce((sum,t)=>sum+identity[t]*(opinion[t]||0),0);
  return clamp(virtue+(alignment-.12)*1.5,-1,1);
}
function applySettlementProsperity(){
  const valley=S.settlements.valley;
  valley.prosperity=S.prosperity;
  for(const place of Object.values(S.settlements)){
    if(!place.open)continue;
    const belief=place===valley?clamp(S.bel/Math.max(1,S.pop),0,1):place.belief;
    const influence=clamp((belief-.2)/.65,0,1);
    const quality=traitProsperityScore(place.opinion);
    place.prosperity=clamp(place.prosperity+(place===valley?0:(62-place.prosperity)*.06)+quality*influence*3,0,100);
  }
  S.prosperity=valley.prosperity;
}
function averageProsperity(){const places=Object.values(S.settlements).filter(p=>p.open);return places.reduce((sum,p)=>sum+p.prosperity,0)/Math.max(1,places.length);}
function outsideFaith(){return Object.values(S.settlements).filter(v=>v.open&&v!==S.settlements.valley).reduce((sum,v)=>sum+v.belief*.32*VILLAGE_SCALE,0)+S.villagers.reduce((sum,v)=>sum+v.belief*.08,0)+Object.values(S.factions).reduce((sum,f)=>sum+f.belief*.12,0)+S.customs.length*.15;}
function actionCapacity(){
  const base=stageOf(S.season)===1?1:2;
  const network=S.bel+Object.values(S.settlements).filter(v=>v.open).reduce((n,v)=>n+v.belief*2,0);
  return Math.min(5,base+(S.fame>=5?1:0)+(S.fame>=10?1:0)+(network>=4?1:0)+(network>=8?1:0)+(S.villagers.some(v=>v.belief>=.88)?1:0));
}
function villagerVisible(id){const v=S.villagers.find(x=>x.id===id);const threshold={mara:0,kit:.6,oren:1.6,leni:2.5,hester:2.8,ada:3,tomas:3.5,bram:3.8,vale:4.5}[id]??Infinity;return !!v&&!v.dead&&v.belief>0&&S.fame>=threshold;}
function recordCustom(key,text,imprint){if(S.customFlags[key])return false;S.customFlags[key]=true;S.customs.push(text);S.imprint+=imprint||2;return true;}
function spreadRumor(id,tags,goodness){
  const source=S.villagers.find(v=>v.id===id);if(!source||!source.ties)return;
  const recipients=[];
  for(const listener of S.villagers){if(listener.id===id)continue;const forward=source.ties.find(t=>t.id===listener.id),reverse=(listener.ties||[]).find(t=>t.id===id);if(!forward&&!reverse)continue;const trust=Math.max(forward?.trust||0,reverse?.trust||0);shiftPersonBelief(listener,goodness*trust*.08);if(villagerVisible(listener.id))recipients.push(listener.name);}
  if(recipients.length){S.rumorFeed.push(goodness>=0?'Word of '+source.name+'’s good fortune reaches '+recipients.join(' and ')+'.':'A sour account of what happened at '+source.name+'’s house reaches '+recipients.join(' and ')+'.');if(goodness<0)S.cohesion-=.5;}
}
function factionTension(){return Math.abs(S.factions.hearth.belief-S.factions.wardens.belief);}
function finishAction(){
  if(S.fame<=0){forgetEnd();return true;}
  if(S.ap<=0){
    const lastResult=S.results[S.results.length-1];
    if(lastResult)S.carryObs.push(lastResult);
    endSeason();
  }
  return true;
}

function beginSeason(){
  S.ap = actionCapacity(); S.actionCap=S.ap;
  S.settlementChoice=null;
  S.tended = {};
  S.obs = []; S.results = []; S.nudgeOpen = false; S.acts = 0;
  if (S.carryObs.length) { S.obs.push(...S.carryObs); S.carryObs = []; }
  if (S.rumorFeed.length) { S.obs.push(...S.rumorFeed.splice(0)); }
  for (const v of S.villagers) v.answered = false;
  for (const v of S.villagers) {
    if(v.dead){v.praying=false;v.satisfied=false;continue;}
    v.answered = false;
    v.praying = (v.id==='mara'&&S.season===1)||rand() < clamp(.32 + v.belief*.45 + (v.id === 'vale' ? .12 : 0),.2,.85);
    v.satisfied = !v.praying;
    if (v.praying) v.prayer = pick(v.prayers);
  }
  for(const id of ['westmere','eastbank']){
    const place=S.settlements[id];
    if(place.open){place.need=pick(Object.keys(OUTSIDE_NEEDS));place.praying=rand()<.78;place.requestMode=rand()<.3?'counsel':'help';place.question=place.requestMode==='counsel'?pick(VILLAGE_COUNSEL).id:null;}
  }
  if (S.season === 1) S.obs.push('One person still remembers you.');
  if (BANNERS[S.season]) S.obs.push(BANNERS[S.season]);
  if (S.season > 1 || !S.obs.length) S.obs.push(pick(AMBIENT[stageOf(S.season)]));
  if (factionTension()>=.42&&S.season-(S.flags.lastSchismSeason||0)>=3){S.pending=evSchism();S.flags.lastSchismSeason=S.season;}
  else if (S.threats.sickness >= 45 && !S.flags.motherEvent) { S.pending = evMother(); S.flags.motherEvent = true; }
  else if (S.threats.unrest >= 45 && S.bel >= 3 && !S.flags.priestEvent) { S.pending = evPriest(); S.flags.priestEvent = true; }
}

function availableActions(){ const st = stageOf(S.season); return ACTIONS.filter(a => a.stage <= st && (a.fame===undefined||S.fame>=a.fame) && (a.belief===undefined||S.bel>=a.belief)); }
function doAction(id, placeId){
  const a = ACTIONS.find(x => x.id === id);
  if (!a || S.pending || S.phase !== 'play' || S.ap < 1 || S.faith < a.cost - 1e-9 || a.stage > stageOf(S.season)) return false;
  S.faith -= a.cost; S.ap--; S.everActed = true; S.acts++;
  if (a.gain) S.faith += a.gain;
  addBel(a.b || 0);
  if(placeId==='shrine')blessAllVillagers(.025);
  if(placeId==='church'){blessAllVillagers(.02);S.prosperity+=2;}
  S.prosperity += a.pr || 0; S.cohesion += a.co || 0; S.imprint += a.im || 0; S.bond += a.bond || 0;
  if (id === 'withhold' || id === 'blight') S.threats.hunger = Math.min(100, S.threats.hunger + 24);
  if (id === 'flood') { S.threats.hunger = Math.min(100, S.threats.hunger + 22); S.threats.unrest = Math.min(100, S.threats.unrest + 18); }
  if (id === 'thunder') S.threats.unrest = Math.min(100, S.threats.unrest + 10);
  if (a.pop) S.pop = Math.max(1, S.pop + a.pop);
  pushW(a.tags, .22);
  const top = topTraits(interpret(a.tags), 1)[0];
  S.results.push(a.did + ' ' + INTERP[top]);
  if(id==='sign')recordCustom('shrine-mark','A mark is left on the shrine door.',3);
  if(id==='custom')recordCustom('yearly-custom','The village keeps an annual custom in your name.',8);
  if(id==='gathering')recordCustom('village-gathering','People gather beneath the old trees each turning season.',3);
  clampAll();
  return finishAction();
}
function answerPrayer(id, choice){
  const v = S.villagers.find(x => x.id === id);
  if (!v || v.dead || !v.praying || v.answered || S.phase !== 'play' || S.pending || S.ap < 1) return false;
  const options = {help:{cost:1,faith:.3,prosperity:3,cohesion:2,bond:.5,tags:{merciful:.5,generous:.5},text:'You send a small kindness. Someone nearby notices.'},refuse:{cost:0,faith:-.4,prosperity:0,cohesion:-1,bond:0,tags:{silent:.5,just:.5},text:'You leave the prayer unanswered. The need remains.'},exploit:{cost:0,faith:.8,prosperity:-3,cohesion:-3,bond:0,tags:{selfish:.4,proud:.3,cunning:.2,wrathful:.1},text:'You make a bargain from their worry. The village remembers the price.'}};
  const o = options[choice]; if (!o || S.faith < o.cost) return false;
  S.faith -= o.cost; S.faith += o.faith; S.ap--; S.acts++; S.everActed = true; v.answered = true;
  v.praying = false; v.satisfied = true;
  shiftPersonBelief(v,choice==='help'?.2:choice==='exploit'?.12:-.16);
  S.prosperity += o.prosperity; S.cohesion += o.cohesion; S.bond += o.bond;
  const beliefChange=choice === 'help' ? .35 : choice === 'exploit' ? .15 : -.2;
  addBel(beliefChange,0);
  const traits=choice==='help'&&v.prayer?v.prayer.traits:o.tags;
  pushW(traits,.22);spreadRumor(id,traits,choice==='help'?1:choice==='exploit'?-1:-.8); S.results.push(v.name + ' (' + v.trade + '): ' + o.text); clampAll();
  if(id==='mara'&&choice==='refuse'&&S.season===1){S.everActed=false;S.acts=0;S.fame=0;return forgetEnd();}
  return finishAction();
}
function actOnVillager(id, choice){
  const v = S.villagers.find(x => x.id === id);
  if (!v || v.dead || S.phase !== 'play' || S.pending || S.ap < 1) return false;
  const crime = id === 'tomas' && S.flags.tomasCrime && !S.flags.tomasJudged;
  const acts = {
    comfort:{cost:1,tags:{merciful:.6,generous:.4},bel:.3,prosperity:2,cohesion:1,text:'You ease the worry in ' + v.name + '’s house.'},
    bless:{cost:1,tags:{generous:.6,playful:.2,merciful:.2},bel:.4,prosperity:2,cohesion:0,text:'A small good fortune finds ' + v.name + '.'},
    warn:{cost:0,tags:{just:.5,wrathful:.3,cunning:.2},bel:.1,prosperity:0,cohesion:0,text:'A warning comes to ' + v.name + ' in a dream.'},
    forgive:{cost:0,tags:{merciful:.5,just:.5},bel:.1,prosperity:0,cohesion:2,text:'You ask the village to make room for repair. Tomas returns what he took.'},
    punish:{cost:0,tags:{wrathful:.6,just:.4},bel:.4,prosperity:1,cohesion:-2,text:'Tomas is made to answer for taking Leni’s winter grain.'},
    favor:{cost:0,tags:{selfish:.4,proud:.3,cunning:.2,generous:.1},bel:.8,prosperity:-7,cohesion:-5,text:'You bless Lord Vale’s levy. His influence swells; tenant families lose grain and faith in one another.'},
    oppose:{cost:0,tags:{just:.5,merciful:.35,wrathful:.15},bel:-.35,prosperity:4,cohesion:4,text:'You turn the blessing aside and protect the tenants. Lord Vale’s favor cools, but the village keeps its stores.'}
  };
  const a = acts[choice]; if (!a || ((choice === 'punish' || choice === 'forgive') && !crime) || ((choice === 'favor' || choice === 'oppose') && (id !== 'vale' || !v.praying)) || S.faith < a.cost) return false;
  S.faith -= a.cost; S.ap--; S.acts++; S.everActed = true; addBel(a.bel,0); S.prosperity += a.prosperity; S.cohesion += a.cohesion;
  shiftPersonBelief(v,choice==='comfort'?.16:choice==='bless'?.2:choice==='warn'?.06:choice==='favor'?.5:choice==='oppose'?-.2:choice==='punish'?-.12:.04);
  if (id === 'vale' && (choice === 'favor' || choice === 'oppose')) {
    v.praying = false; v.satisfied = true;
    if (choice === 'favor') { S.threats.hunger = Math.min(100,S.threats.hunger+16); S.threats.unrest = Math.min(100,S.threats.unrest+12); }
  }
  if (choice === 'punish' || choice === 'forgive') S.flags.tomasJudged = true;
  pushW(a.tags,.22);spreadRumor(id,a.tags,choice==='favor'?-1:choice==='oppose'?1:choice==='punish'?.2:choice==='forgive'?.8:.65); S.results.push(a.text); clampAll(); return finishAction();
}
function tendThreat(id){
  const actions={sickness:{cost:2,reduce:30,tags:{merciful:.6,generous:.4},result:'You bring clean water and a little care to the sick.'},hunger:{cost:2,reduce:28,tags:{generous:.7,merciful:.3},result:'You guide food toward the households that need it.'},unrest:{cost:1,reduce:26,tags:{just:.6,merciful:.4},result:'You give the quarrel a chance to be heard before it hardens.'}};
  const a=actions[id]; if(!a||S.phase!=='play'||S.pending||S.ap<1||S.faith<a.cost||S.threats[id]<8)return false;
  S.faith-=a.cost; S.ap--; S.acts++; S.everActed=true; S.threats[id]=Math.max(0,S.threats[id]-a.reduce); S.tended[id]=true;
  if(id==='sickness')S.prosperity+=2;if(id==='hunger')S.prosperity+=3;if(id==='unrest')S.cohesion+=3;
  pushW(a.tags,.2);S.results.push(a.result);clampAll();return finishAction();
}
function spreadWord(id){
  const places={westmere:{threshold:8,cost:2,label:'Westmere',text:'A traveling miller carries your name to Westmere. Someone there sets a bowl of water on the sill.'},eastbank:{threshold:12,cost:3,label:'Eastbank',text:'Word reaches Eastbank. At dusk, a second village looks toward your valley.'}};
  const place=places[id]; if(!place||S.fame<place.threshold||S.flags['word_'+id]||S.pending||S.phase!=='play'||S.ap<1||S.faith<place.cost)return false;
  const settlement=S.settlements[id],tags={generous:.45,silent:.35,cunning:.2};
  S.faith-=place.cost;S.ap--;S.acts++;S.everActed=true;S.flags['word_'+id]=true;
  settlement.open=true;settlement.belief=.12;settlement.need=pick(Object.keys(OUTSIDE_NEEDS));settlement.praying=true;
  settlement.requestMode=rand()<.3?'counsel':'help';settlement.question=settlement.requestMode==='counsel'?pick(VILLAGE_COUNSEL).id:null;
  changeTrackedFame(1.5*VILLAGE_SCALE);S.imprint+=3;addBel(.5);
  pushW(tags,villageInfluence(.18));shiftSettlementOpinion(settlement,tags,villageInfluence(.3));
  recalculateFame();S.results.push(place.text+' Your name takes root there, and the village remembers you strongly.');return finishAction();
}
function availableSettlementActions(id){
  const place=S&&S.settlements[id];if(!place||!place.open||!place.praying)return [];
  const question=place.requestMode==='counsel'?VILLAGE_COUNSEL.find(x=>x.id===place.question):null;
  return (question?question.choices:VILLAGE_CHOICES[place.need]||[]).map(({id,name,cost})=>({id,name,cost}));
}
function actOnSettlement(id,choice){
  const place=S.settlements[id];
  if(!place||!place.open||!place.praying||S.settlementChoice||S.pending||S.phase!=='play'||S.ap<1)return false;
  const question=place.requestMode==='counsel'?VILLAGE_COUNSEL.find(x=>x.id===place.question):null;
  const action=(question?question.choices:VILLAGE_CHOICES[place.need]||[]).find(x=>x.id===choice);
  if(!action||S.faith<action.cost)return false;
  S.faith-=action.cost;S.ap--;S.acts++;S.everActed=true;
  place.belief=clamp(place.belief+action.belief,0,1);place.praying=false;S.settlementChoice=id;
  place.prosperity=clamp(place.prosperity+action.welfare,0,100);S.cohesion+=action.cohesion;addBel(action.global);
  recordVillageChoice(place,action);
  if(place.belief>=.55)recordCustom(id+'-road-bowl',place.name+' keeps a bowl of water at the road.',3);
  if(action.tags.selfish||action.tags.wrathful)S.threats.unrest=Math.min(100,S.threats.unrest+4);
  S.results.push(action.text+' The choice shapes how neighboring villages see you.');clampAll();return finishAction();
}
function advanceThreats(){
  const t=S.threats, did=S.tended;
  const notices=[];
  t.sickness += (did.sickness?3:13)+Math.max(0,55-S.prosperity)*.12;
  t.hunger += (did.hunger?2:9)+Math.max(0,62-S.prosperity)*.18;
  t.unrest += (did.unrest?2:9)+Math.max(0,58-S.cohesion)*.16;
  for(const key of Object.keys(t))t[key]=clamp(t[key],0,100);
  if(t.sickness>=100){t.sickness=56;S.prosperity*=.5;S.bel=Math.max(0,S.bel-.5);notices.push('The sickness has reached several homes. Prosperity is cut in half. '+killRandomVillagers('The fever') );}
  if(t.hunger>=100){t.hunger=54;S.prosperity*=.5;S.cohesion-=2;notices.push('The stores run short. Prosperity is cut in half. '+killRandomVillagers('Hunger') );}
  if(t.unrest>=32&&!S.flags.tomasCrime){S.flags.tomasCrime=true;notices.push('Tomas took a sack of Leni’s winter grain. He says he had no other choice. Leni asks you to judge him.');}
  if(t.unrest>=100){t.unrest=52;S.cohesion-=9;notices.push('The quarrels spread beyond the first fence. '+unrestBeliefLoss());}
  S.obs.push(...notices); S.carryObs.push(...notices);
  changeTrackedFame(-notices.length*.35);
  clampAll(); S.tended={};
}

/* ---------- story events ---------- */
function evMother(){
  return {id:'mother', title:'A sickness moving through the village',
    text:'Oren’s daughter is feverish. The illness has reached more than one house, and he asks whether you can help.',
    options:[
      {label:'Refuse, gently', cost:0, tags:{merciful:.6,silent:.4}, apply(){ addBel(-.3); S.cohesion += 1; }, result:'You tell her, as softly as you can, that you cannot. She hears it.'},
      {label:'Refuse, coldly', cost:0, tags:{just:.5,proud:.3,wrathful:.2}, apply(){ addBel(-.8); S.cohesion -= 1; }, result:'You tell him the fever is not yours to lift.'},
      {label:'Give her a dream of recovery', cost:3, tags:{cunning:.2,merciful:.8}, apply(){ addBel(.8); S.imprint += 4; S.bond += 1; }, result:'You give her a quiet night. By morning her fever has eased.'},
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
function evSchism(){
  return {id:'schism',title:'Two circles, one god',text:'The Hearth Circle asks for care without conditions. The Stone Wardens say order and reciprocity keep the village alive. Both claim to know what you want.',options:[
    {label:'Hear both sides',cost:1,tags:{just:.5,merciful:.35,silent:.15},apply(){const mid=(S.factions.hearth.belief+S.factions.wardens.belief)/2;S.factions.hearth.belief=mid;S.factions.wardens.belief=mid;S.cohesion+=5;},result:'The circles leave with less certainty and a little more room for one another.'},
    {label:'Favor the Hearth Circle',cost:0,tags:{merciful:.45,generous:.4,playful:.15},apply(){S.factions.hearth.belief=clamp(S.factions.hearth.belief+.16,0,1);S.factions.wardens.belief=clamp(S.factions.wardens.belief-.08,0,1);shiftFactionBeliefs('hearth',.1);shiftFactionBeliefs('wardens',-.1);S.cohesion-=3;},result:'The Hearth Circle grows. Its members trust you more; the Wardens lose faith.'},
    {label:'Favor the Stone Wardens',cost:0,tags:{just:.4,proud:.3,selfish:.2,wrathful:.1},apply(){S.factions.wardens.belief=clamp(S.factions.wardens.belief+.16,0,1);S.factions.hearth.belief=clamp(S.factions.hearth.belief-.08,0,1);shiftFactionBeliefs('wardens',.1);shiftFactionBeliefs('hearth',-.1);S.cohesion-=3;},result:'The Wardens gain authority. Their members trust you more; the Hearth Circle loses faith.'}
  ]};
}
function chooseOption(i){
  const ev = S.pending; if (!ev) return false;
  const o = ev.options[i]; if (!o || S.faith < o.cost - 1e-9) return false;
  S.faith -= o.cost;
  pushW(o.tags, .25);
  o.apply(); clampAll();
  S.results.push(o.result);
  if(ev.id==='schism')S.flags.schismResolved=true;
  S.pending = null;
  if(S.fame<=0)forgetEnd();
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
  if (!(stageOf(S.season) === 1 && S.acts === 0)) advanceThreats();
  S.log.unshift(S.obs.concat(S.results));
  if (S.doctrine && S.season >= 10){
    const v = zero(); v[S.doctrine[0]] = .5; v[S.doctrine[1]] = .5;
    for (const t of TRAITS) S.W[t] = S.W[t] * (1 - .08 * S.priestInfl) + v[t] * .08 * S.priestInfl;
  }
  if (stageOf(S.season) === 1 && S.acts === 0){ forgetEnd(); return true; }
  S.faith = S.faith * .92 + 1 + S.bel * .5 + outsideFaith();
  S.bel = clamp(S.bel - .25, 0, S.pop);
  if (S.acts === 0){ S.bel = clamp(S.bel - .5, 0, S.pop); S.prosperity -= 3; S.cohesion -= 2; }
  S.cohesion += (62 - S.cohesion) * .07;
  S.prosperity += (62 - S.prosperity) * .06 + (rand() * 6 - 3);
  applySettlementProsperity();
  clampAll();
  changeTrackedFame(-((S.acts===0?.6:0)+(S.prosperity<30?.5:0)+(S.cohesion<30?.4:0)+(Math.max(S.threats.sickness,S.threats.hunger,S.threats.unrest)>=85?.35:0)));
  if(S.fame<=0){forgetEnd();return true;}
  if (S.bel <= 0.05){ forgetEnd(); return true; }
  if (S.season >= LAST){ S.phase = 'final'; return true; }
  S.season++; beginSeason(); return true;
}

/* ---------- ending ---------- */
const wellFate = () => {const prosperity=averageProsperity();return (S.pop <= 6 || prosperity < 30 || (prosperity < 38 && S.cohesion < 40)) ? 'broken' : (prosperity >= 56 && S.cohesion >= 50) ? 'thriving' : 'scarred';};
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
  const spreadBeyondVillage = !!(S.flags.word_westmere || S.flags.word_eastbank);
  const legacy = id === 'forgot' ? 'forgotten' : id === 'mortal' ? 'mortal' : hiF ? (hiI && spreadBeyondVillage ? 'major' : 'bright') : (hiI ? 'remembered' : 'forgotten');
  const fate = wellFate();
  const e = ENDINGS[legacy][cons][fate];
  S.result = {legacy, cons, fate, title:e[0], text:e[1], dist, reach, fame:S.fame, prosperity:averageProsperity(), cohesion:S.cohesion, population:S.pop, believers:S.bel, imprint:S.imprint, spreadBeyondVillage, spent:S.spent, consistencyHigh:T_HIGH, consistencyMedium:T_LOW, faithThreshold:T_FAITH, imprintThreshold:T_IMPRINT};
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
  if (!S.everActed){ S.result = {legacy:'nothing', cons:'-', fate:'-', title:NOTHING[0], text:NOTHING[1], dist:0, reach:0, fame:S.fame, prosperity:averageProsperity(), cohesion:S.cohesion, population:S.pop, believers:S.bel, imprint:S.imprint, spreadBeyondVillage:false, spent:false, consistencyHigh:T_HIGH, consistencyMedium:T_LOW, faithThreshold:T_FAITH, imprintThreshold:T_IMPRINT}; S.phase = 'ending'; return S.result; }
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

const GameAPI = {newGame, getS:() => S, doAction, answerPrayer, actOnVillager, actOnSettlement, availableSettlementActions, tendThreat, spreadWord, endSeason, chooseOption, finalChoose, finalOptions, availableActions, actionCapacity, ACTIONS, ENDINGS, TRAITS, tvd, setSeed, rand, stageOf, groupOf, describe, startPhrase, setT:(h, l, f, i) => { T_HIGH = h; T_LOW = l; T_FAITH = f; T_IMPRINT = i; }};


window.SmallGodsGame = Object.assign(GameAPI, { TITLE, LAST, BUDGET, MAXPER, LABEL, BLURB, STAGE_NAMES, GROUPS, LEGACY_LABEL, NOTHING });
})();
