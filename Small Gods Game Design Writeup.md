# Small Gods: Game Design Writeup

Oct 19, 2026 · @Askjsd

## Premise and tone

You are a minor god nobody remembers, and the game asks whether you would rather be worshipped or be remembered. It is a text-based reveal-as-you-go game in the lineage of A Dark Room and Candy Box 2: it starts with one button and one villager, and the interface, the stakes, and your own identity expand and mutate as the village changes around you.

**The fantasy:** quiet power. You never fight. You nudge: a dream, a coincidence, a lost tool turning up. The pleasure is watching a tiny action ripple through a community and come back to you as a story told about you that you did not write.

**Tone:** warm, small-scale, and slightly melancholy. The village is a handful of named people with ordinary problems (a sick goat, a late harvest, a quarrel over a fence). The horror, where it exists, is gentle: becoming something you never meant to be because people needed you to be.

**Title note:** *Small Gods* is the title of a Terry Pratchett novel with a very similar premise, so this needs a different name before it ships. Working alternatives: "Whisper," "Forgotten," or "The Lesser Light." In this doc, "Small Gods" is only a working title.

## Core loop

Each cycle is a season: you spend faith to act, the village reacts, and the reaction changes how much faith you earn next.

1. **Observe.** A short passage describes what is happening in the village this season: who is struggling, who is celebrating, who is praying and for what.
2. **Choose.** You pick one or two actions from what you can currently afford (a nudge, a dream, a sign). Each costs faith.
3. **Resolve.** The game plays out consequences as a few lines of text, usually indirect. You never see your own effect directly, only how people interpret it.
4. **Interpret.** The villagers talk. Their retellings update how they feel about you and how your "description" reads (see the personality mechanic below).
5. **Collect.** Faith comes in based on how many believe, how intensely, and what they believe you are.

**Why it holds attention:** actions are cheap at the start, so early turns are about curiosity ("what happens if I help *this* person?"). Later the same loop carries heavier trade-offs, because a miracle that earns a lot of faith may also lock you into a version of yourself you dislike.

**Pacing:** one season takes roughly a minute of reading and choosing. The village can also tick forward in real time while you are away, so you return to find rumors, prayers, and changes waiting.

**Doing nothing ends the game.** In the first three seasons you must act every season. If a season passes with no nudge, the last person who remembers you forgets, and the game ends at once with its own ending, Nobody Remembered. Later, a season of inaction drains belief faster, and when belief reaches zero the game ends with one of the Forgotten endings.

## Systems

Three things drive the game: faith (your currency), the believers (who produce it), and what they believe (which decides how much you get and what it costs you).

**Faith.** The single resource. You spend it on actions and earn it from believers each season. It is deliberately not a number you can bank forever: unused faith decays slowly, so hoarding is a weak strategy.

**Believers.** Each villager is a small record with a few fields:

| Field | What it means |
| --- | --- |
| Name and trade | Who they are (farmer, midwife, child, smith) |
| Belief | How strongly they believe in you, from doubt to devotion |
| Version of you | Which story about you they hold (see the rumor mechanic) |
| Need | What they most want right now (rain, a cure, a reconciliation) |
| Ties | Who they listen to and who listens to them |

**Social spread.** Belief moves along ties. A believer who gets help tells friends and family, and a skeptic who hears it from three people starts to wonder. The reverse also works: a bad outcome spreads as fast as a good one.

**Cost of miracles.** Bigger actions cost more faith, and they also leave a mark. Large miracles are hard to explain away, so they pull in believers quickly, but they also make you easier to define, which narrows who you are allowed to be.

**Imprint.** A second, slower stat that records what the village builds that can outlast belief: a festival day, a place or child named for you, a saying, a ritual people keep without remembering why. Imprint rarely pays faith, so it competes with chasing worship, but it decides what is left of you in the end.

## The personality-as-rumor mechanic

Your character sheet is not something you set: it is a paragraph the game writes from what villagers say about you, and it changes as their beliefs change.

**How it works**

- You act. Each action has tags drawn from the trait list (for example mercy, wrath, cunning, generosity, silence) that the villagers can read into it.
- Each believer interprets the event through their own need and temperament, and tells it to others in their own words.
- The game aggregates these retellings into a small set of **trait weights** (for example: gentle 0.6, jealous 0.3, harvest-bringer 0.5).
- Your displayed description is assembled from the highest-weighted traits, so it can read "a kind god of small mercies" one season and "a hungry thing that wants offerings" a few seasons later.

**Why the player cares:** traits are not cosmetic. They gate which actions are available, change what believers expect, and shift how much faith each action earns. A "gentle" god gets little from a thunderstorm, and a "wrathful" god finds mercy suspicious.

**The tension in practice:** the fastest way to grow is to act in line with what believers already think of you, which reinforces and narrows the description. Staying flexible means acting against expectation, which costs faith and confuses people. A player chasing faith slowly becomes something they did not intend.

**Hidden layer:** you also have a starting trait profile that you set yourself before the first season (see Starting traits). The distance between that profile and the villagers' description is the emotional measure of the game, and it is the first axis of the ending.

## Starting traits

Before the first season you decide who you want to be, and that choice becomes the baseline every ending is measured against.

**The picker.** The first screen shows eight traits, each with a slider:

| Trait | Reads as |
| --- | --- |
| Merciful | forgives, spares, heals |
| Wrathful | punishes, frightens, avenges |
| Generous | gives freely, rewards |
| Cunning | tricks, bargains, hides its hand |
| Silent | rarely answers, stays distant |
| Playful | pranks, delights, bends the rules |
| Just | keeps count, rewards fairness |
| Proud | demands recognition and offerings |

You set each slider from 0 to 5 within a fixed budget of 12 points, so you cannot take everything. The budget matters: without it, a maxed-out profile would be impossible to drift from in any meaningful way, and the consistency axis would measure nothing.

**Checkbox mode.** A simpler alternative for players who do not want to tune numbers: tick up to four traits, each counting as equal weight. The game converts either mode into the same thing, a profile that adds up to 100 percent.

**One vocabulary.** Actions carry tags from this same list, villagers describe you using it, and your final trait weights are read on the same scale. That is what lets the game compare who you meant to be with who you became.

**What the player sees afterward.** The profile is shown once at full size, and is not shown again until the ending. From stage 3 on, a panel shows only how the villagers currently describe you.

**Design option to test:** actions that match your starting traits could cost slightly less faith, so being yourself is cheap while being what the village wants pays more. That pull between your nature and their expectations would then run through every season.

## Progression

The game unfolds in five stages, each unlocking new verbs, new kinds of people, and a new way the interface looks at you.

1. **The Last Prayer.** One villager, one button ("nudge"). You can send a dream or arrange a small coincidence. Faith is a single number. The goal is to make one person's life slightly better and be noticed for it.
2. **The Shrine.** The villager tells others. You gain a shrine, a handful of believers, and a second verb ("answer"), which lets you respond to specific prayers. The village gets names, and you start seeing what each person needs.
3. **The Congregation.** Miracles unlock: weather, luck, healing, each with escalating cost. The first description of you appears, and traits start gating actions. Believers begin to disagree about what you are.
4. **The Doctrine.** Priests, festivals, and rules appear. People interpret you on your behalf, and the official version of you starts to diverge from your starting profile.
5. **The Reckoning.** The village is large enough that you can no longer track individuals. A final crisis (famine, war, or plague) forces you to decide what you are willing to be, and which version of you survives.

**What makes each stage feel different:** the verb list grows, but so does the distance between what you did and what people say you did. In stage 1 you see exact cause and effect. By stage 5 you mostly read reports.

**Unlock pacing:** stages are driven by believer count and the traits you have accumulated, not by a timer, so a player who stays small and quiet can linger in stage 2 or 3 and still reach a valid ending.

## Complications

Four pressures push back against the player, each attacking a different part of what you want.

**Priests.** When the congregation grows, someone starts speaking for you. A priest is a believer with influence, an agenda, and their own interpretation of your will. They can amplify your faith income, but they also rewrite your description in their own terms and may ban practices you actually liked. You can overrule them, but at a cost in belief.

**Schisms.** Two groups of believers disagree about what you want (for example, whether you demand offerings or forgive without them). A schism splits your faith income and your description in two. You can favor one side, try to reconcile them, or stay silent and let the split resolve itself, which usually benefits whoever is louder.

**Neglect and ruin.** Harm is a legitimate path, and each version leads to its own ending. A forgotten god can break a village silently, by turning away from prayers and withholding the rain, while belief drains away as the village suffers. A major god can break it on purpose, with blight, flood, or a final choice to bring everything down, and fear keeps the worship coming.

**Prayers you cannot or will not answer.** Some requests are beyond your power (a dead child returned), and some you could grant but should not (a neighbor's ruin). Refusing costs belief and sometimes produces a bitter new version of you. Granting changes who you are. These moments are the emotional peaks of the game, and the text should be restrained and specific rather than dramatic.

## Interface

The interface starts almost empty and grows with your reach, so the screen itself shows how much of the world you can see and touch.

**Stage by stage**

- **Stage 1:** a trait picker first, then a dark page, one line of text, one button. No faith counter at all, just a sentence like "One person still remembers you."
- **Stage 2:** a faith number appears, then a short list of named villagers. A small log records what you did and what happened.
- **Stage 3:** a panel titled with your description appears and updates after each season. Actions are grouped by trait (gentle, severe, subtle).
- **Stage 4:** the log turns into reports: rumors, sermons, quotes from believers. You read these as second-hand accounts rather than seeing events directly.
- **Stage 5:** the villager list is replaced by summaries ("the eastern farms," "the temple") because individuals no longer fit on screen.

**Small surprises worth building in**

- Your starting profile is shown only at the start and again on the ending page, so the player has to remember who they meant to be.
- The text voice changes with your dominant trait: a gentle god narrates in soft, short lines, while a feared god's log is terse and formal.
- A button the player used often can vanish if the village stops believing you do that kind of thing, so the interface itself reflects the rumor mechanic.

**Away time:** while the player is offline, the village keeps ticking in real time. On return, a short "what was said while you were gone" summary shows the biggest shifts in belief, so the world feels alive without punishing absence.

## Endings

The ending is your position on several independent axes. Each axis is scored from the final game state, and the combination of all axes picks one hand-written ending. The set below uses three axes, but the number can change; each axis added or removed changes how many endings there are to write.

| Axis | Question it answers | Scored from | Values |
| --- | --- | --- | --- |
| Consistency | How true did you stay to your starting traits? | Distance between your starting profile and your final trait weights | High, Medium, Low |
| Legacy | What does the world keep of you? | Final faith, imprint, and choice flags | Major god, Bright and brief, Remembered, Forgotten, Mortal |
| Village fate | How does the village end up? | Well-being and cohesion at the end | Thriving, Scarred, Broken |

**Axis 1: Consistency.** Behind the scenes the game compares your starting profile with your final trait weights (total variation distance, from 0 to 1) and sorts the result into three buckets. The player never sees a score, a bar, or a label for it. The bucket only decides which of three differently written endings they get. Starting cut points, to be tuned in playtesting: under 0.2 is High, 0.2 to 0.5 is Medium, over 0.5 is Low. High does not mean good. It can read as integrity or as rigidity, and Low can read as growth or as being hollowed out. The passage should describe the shift without ranking it.

**Axis 2: Legacy.** Two numbers place you on a grid: faith (how many believe now, relative to village size) and imprint (how much you have built into lasting customs).

|  | Low imprint | High imprint |
| --- | --- | --- |
| **High faith** | Bright and brief: worshipped fiercely, but nothing outlives the generation that believed | Major god: widely worshipped and woven into the culture, unrecognizable next to your starting self |
| **Low faith** | Forgotten: nobody believes and nothing remains | Remembered: nobody prays, but a festival, a rhyme, or a place name keeps a distorted trace |

One more value is triggered by a choice rather than by numbers, and it overrides the grid:

- **Mortal:** after a deep bond with one believer, you give up godhood and live as one of them.

**Axis 3: Village fate.** Two measures describe the village: well-being (food, health, safety) and cohesion (trust between villagers, unresolved schisms). Both high is Thriving. Surviving with one measure low is Scarred. Both low, or a collapse in population, is Broken. This axis is deliberately separate from your legacy: a village can thrive under a forgotten god or fall apart under a major one.

**Assembling the ending.** Three consistency values, five legacy values, and three village fates give 45 combinations, plus one special ending. Each one gets its own written ending, 45 in total with no shared passages. Because consistency is one of the three axes, it changes the whole feeling of the ending and not just one line of it. Each ending is fixed text, so it reads the same for every player who reaches it. A few examples:

| Combination | Closing note |
| --- | --- |
| High consistency, Forgotten, Thriving | You stayed yourself and slipped out of memory. They prosper and never learn what they owe you. |
| Low consistency, Major god, Broken | You became everything they asked for, and it ruined them. |
| High consistency, Mortal, Thriving | You kept your nature and finished life as a neighbor in a village that no longer needed a god. |
| Medium consistency, Remembered, Scarred | You bent where you had to, a rhyme survives, and the village limps on. |

**The final page.** It shows your starting profile beside the village's final description of you, and then the ending itself, with no scores or labels. No ending is labeled best, and each one trades something real.

**Adding or dropping axes.** A fourth axis could track cost (relationships lost, prayers refused, miracles performed against your own traits). A shorter version could use only Consistency and Village fate. Each axis multiplies the number of endings to write: a fourth axis with three values would mean 162, so an axis is worth adding only if the extra variety justifies that writing.

## Technical sketch and open questions

The core is a small agent-based simulation with a text layer on top, and it can be built in a browser with plain JavaScript or in any language with a terminal UI.

**Data model**

- **Villager:** id, name, trade, belief (0 to 1), need, version-of-you (a vector of trait weights), and ties (a list of ids with a trust value).
- **Action:** cost, tags, a set of outcome templates, and conditions for being unlocked.
- **God state:** faith, trait weights aggregated from believers, and your starting trait profile.
- **Event queue:** season-by-season events (harvests, illnesses, disputes) that create needs and prayers.

**Season tick**

1. Generate events and new needs.
2. Player picks actions and spends faith.
3. Resolve outcomes and attach tags.
4. Each affected villager interprets the outcome through their need and temperament, then updates their version of you.
5. Spread belief and rumors along ties.
6. Recompute your trait weights and description, then pay out faith.

**Text generation:** use templates with slots for names, needs, and traits, plus a handful of variants per beat so repetition stays low. The description paragraph is assembled from the top two or three traits using short phrase banks.

**Open questions**

- Should the player be able to see trait weights, or only the prose description?
- How many named villagers keeps the village personal without becoming a spreadsheet (probably 12 to 20 at peak)?
- Is real-time offline progress worth the complexity, or should seasons only advance on play?
- Which language and platform: browser, terminal, or both?
- Final title, given the overlap with the Pratchett novel.

## Ending drafts

Endings are grouped by legacy outcome, then consistency, then village fate, and each of the 45 is written individually. They are second person, plain and specific, and end on a feeling instead of an explanation. High consistency means you stayed close to your starting traits, Medium means partway, and Low means far. For Mortal, it describes how much of your nature survives in the new life. Each ending is fixed text: it never names or depends on any specific trait.

### Forgotten · High consistency

**Thriving: The Quiet Debt**

The harvests are good and the children are fed, and nobody knows why. Your shrine is a pile of stones in a field. You stayed who you chose to be, to the end, and no one ever said your name for it. You find that this is enough, or that you have to decide it is.

**Scarred: Unwitnessed**

The village survives, thinner than it was, and tells itself the hard years were weather. You stayed who you chose to be through all of them and nobody connected it to you. You are still exactly who you meant to be, with no one left to be it for.

**Broken: Intact**

The village is gone, or going, and the last fire out there belongs to strangers passing through. You never stopped being yourself. It saved nothing, and nobody is left to say whether that was a mistake.

### Forgotten · Medium consistency

**Thriving: Worn Smooth**

The village is well, and some of the reason is you, though not the way you planned. You set out to be one kind of god and gave up some of it for what they needed more. They have forgotten you now, and you have mostly forgotten the god you started as. The village is better for the trade. You can't tell if you are.

**Scarred: Half a Shape**

You ended up between who you chose to be and who they needed, and they have forgotten both. The village limps through the years you left behind. What it remembers is a bad winter and a vague sense that someone was supposed to help.

**Broken: Neither**

You bent toward what they needed, and it was not enough. You held on to who you were, and that was not enough either. The village is empty, and no one who left remembers you. Whatever you were in the middle, it did not hold.

### Forgotten · Low consistency

**Thriving: Someone Else's Work**

The village thrives, and nobody knows a god had any part in it. You set out to be one thing and became another, and it worked, in the sense that they are fed. Nothing of you remains, in either version. If someone asked who you were, you would not know which answer to give.

**Scarred: Hollowed**

You gave yourself away a piece at a time, each time for a good reason, until what remained was only what they had asked for. They have forgotten even that, and the village survives the way people survive. Nothing is left of the god you chose, and nothing is left of the god they wanted.

**Broken: Nothing to Return To**

You stopped being yourself early and became something else, for reasons that seemed good at the time. The village is gone anyway. You were forgotten as something you never meant to be, in a place that no longer exists.

### Major god · High consistency

**Thriving: The God You Chose**

They build you a temple, and the festival days are yours, and the god they worship is the one you set out to be. Children learn your habits as manners. The village is full and warm, and somewhere in the noise of it you recognize yourself. It is a rare thing, to be loved for what you are.

**Scarred: The Same Hands**

They worship you, and the village endures, bruised, and you are still the god you started as. Some of the people who suffered do not forgive you, and you cannot say they are wrong. You never changed. That is the comfort, and it is also the charge.

**Broken: Faithful to the End**

The temple stands over a village that is not there anymore, and the few who remain still pray to you. You never became anything else, not even to save them. You were exactly what you chose to be, and it was not what they needed.

### Major god · Medium consistency

**Thriving: A Fair Likeness**

They love you, and the village is better for it, and you are close to the god you meant to be. Close is not the same. Your statues are slightly wrong in ways no one but you can see, and you let them stand. It is a good life with a few things missing.

**Scarred: The Compromise**

The temple is full and the village is scarred, and you are partly who you chose and partly who they asked for. The priests call it wisdom, and the village is too tired to disagree. You remember each place where you gave way, and what it bought.

**Broken: The Cost of Being Worshipped**

They worship you in ruins. You gave them what they asked for, a little at a time, and it was never enough to hold them together. Your name is carved over every empty door. You are half what you chose and half what they wanted, and the village died of both.

### Major god · Low consistency

**Thriving: A Mask That Fits**

The village thrives, and the god it worships is exactly what they wanted and little else. They are happy. You gave them what they wanted until nothing of the original was left. There is a god in the temple, and it fits them perfectly. It is not you, and it is the only version of you anyone will ever know.

**Scarred: Their Image**

They made you in their own image, and then lived in the world that image made. The village endures, scarred, and every festival is for a god who is mostly their own invention. You watch from somewhere inside it, unrecognized by the thing you became.

**Broken: The God They Asked For**

You became everything they asked for, and it ruined them. The temples are enormous and the village is empty, and the god on the altar is what they asked for, to the bone. There is no one left to ask for anything else.

### Bright and brief · High consistency

**Thriving: A Good Generation**

For one generation you are the god of everything: the harvests, the births, the festivals. The village thrives, and you are still yourself. Then the old believers die, the new ones have no reason to pray, and you fade. You had one very good generation, and you spent it as who you wanted to be.

**Scarred: Burned Clean**

They believed in you fiercely and they survived, though they are not what they were. You stayed who you chose to be through all of it. When the last person who remembers the worst years is gone, so is the belief, and the village forgets you the way people forget a fever.

**Broken: A Flame in the Wind**

They prayed to you with everything they had, and you answered as yourself, and the village fell anyway. The faith died with the people who held it. Nothing was left to pass on. You were true to yourself, and it burned out with them.

### Bright and brief · Medium consistency

**Thriving: What They Needed for a While**

You were everything to them for a time, and the village thrived on it. You were partly yourself and partly what they asked for. When the need passes, so does the faith. Their grandchildren will not know your name, and you will have been, briefly, exactly useful.

**Scarred: Borrowed Light**

They worshipped you hard and fast, and the village comes through scarred. You gave them part of what you were and part of what they wanted. It was enough for one generation. Then the prayers get quieter, and neither version of you is anyone's inheritance.

**Broken: Too Bright**

Everyone believed, and it was not enough. The village is gone, and the faith with it, inside a single generation. You were halfway between who you chose to be and who they needed, and you were not enough of either to hold them. It happened fast. You can still hear the last prayer.

### Bright and brief · Low consistency

**Thriving: Dawn and Dusk**

For a moment you are the center of everything, and the village flourishes. The face they see is not your own but a kinder, more useful one, shaped entirely by what they needed. When they stop needing it, the god goes with the need. The village remains. The god it worshipped was an arrangement, and arrangements end.

**Scarred: Spent**

The village worshipped you with a fury, and you gave it a version of yourself you hardly recognized. It is scarred but standing. The faith leaves as quickly as it came, and you are not sure anything of yours goes with it.

**Broken: Ash**

You became what they begged for, and they worshipped you to the end. The village is gone, and the faith was gone before it. You were not who you chose to be, and you were a god for one generation, and there is no one left to say you ever were.

### Remembered · High consistency

**Thriving: A Rhyme About You**

Nobody prays to you anymore, and the village is doing well. At the harvest they still sing a song that makes no sense, a hill carries your name, and the children play a game you used to play. It is your own self in small pieces, kept by people who don't know why. You stayed who you chose to be, and a little of it survived.

**Scarred: Worn Into the Floor**

The village is scarred, and it has stopped praying. But its customs are yours: the way they greet the winter, the stone they leave at the road. You stayed yourself, and it lives on in the habits of people who could not tell you where they learned them.

**Broken: The Last Custom**

The village is dying, and nobody prays. The few who are left still set out a bowl at the door in the old way and don't know why. It is exactly what you would have done. It is all that remains of the god you chose to be, and it is almost enough.

### Remembered · Medium consistency

**Thriving: Garbled**

The village is well and the faith is long gone, but they keep a festival that is half what you stood for and half what they wished. They have the stories slightly wrong. You are partly yourself in them and partly a stranger, and they are happy with either.

**Scarred: A Name on a Hill**

The village is scarred, and it keeps your name on a hill and a song at the harvest, though neither means what it used to. You are partly the god you chose and partly something the village invented. The hill is the one piece of you nobody argues about.

**Broken: The Wrong Song**

The village is almost gone, and the few who are left sing one of your songs at funerals. The words are mixed up, half what you were and half what they wished. It is not the god you chose, and it is not the one they asked for. It is what is left.

### Remembered · Low consistency

**Thriving: A Stranger's Holiday**

They keep a festival in your name, and the village is prosperous, and almost nothing of it is you. They remember a god you never meant to be. Children dress up as you and do things you would never do. You are a happy story with someone else's face.

**Scarred: Folklore**

The village is scarred, and at the fire they tell a story about you. In the story you are not who you wanted to be. They have forgotten the rest. The story is warm, and it is not yours.

**Broken: A Ghost Story**

The village is gone, and the story about you survives in the three people who left. In it you are a figure to fear or to hope for. They have no idea who you were. A god you never chose is the only one remembered.

### Mortal · High consistency

**Thriving: One of Them**

You give up the shrine and the power and walk into the village as a neighbor. You are still yourself. It shows in how you share, how you listen, and what you won't do, and no one knows why. The village thrives, and you have a name for the first time, a small one, and it is yours.

**Scarred: Ordinary Hands**

You become one of them, and the village is scarred, and you are still yourself with no power to prove it. You help in the ways a person can. It is slower and it costs more, and nobody thanks you, and you find you do not need them to.

**Broken: Staying**

The village is failing, and you gave up godhood to be in it. You are the same person you chose to be, and you cannot stop what is happening. You are here with them in the bad years, being who you meant to be. It is all a mortal can do.

### Mortal · Medium consistency

**Thriving: Learning to Be Small**

You leave the shrine behind and become a neighbor. You are partly the god you chose and partly someone new, someone who has to learn how to mend a fence. The village thrives without needing you. You are not sure which part of yourself you are keeping.

**Scarred: Both Halves**

You live among them now, and the village is scarred. You carry some of what you were and some of what they made of you. People say you are odd. You mostly agree, and mostly you are one of them.

**Broken: Late**

You gave up the god to join them, and the village is falling anyway. You are somewhat the one you chose to be and somewhat the one they needed. You help where you can. It is not much, and for the first time you can feel exactly how little.

### Mortal · Low consistency

**Thriving: A New Name**

You give up godhood, and the person who walks into the village is someone new. Almost nothing of the god you meant to be came with you. The village thrives, and you take a new name and use it. Nobody asks who you were, and you are glad.

**Scarred: Someone Else, Alive**

You are mortal now, and the village is scarred, and you are far from the god you chose. You are what the village made of you, with hands. You have a bed, a bad knee, and a place at the table. It is the first real thing that has ever happened to you.

**Broken: Cold Hands**

You become one of them as the village falls apart. You are nothing like who you chose to be. You have a body now, in a place that is dying. You hold the one you stayed for, and it is the only thing that is yours.

### Special · Did nothing

This one ending sits outside the grid. It is reached only if you never act at all.

**Nobody Remembered**

You did nothing, and the season passed. The last person who remembered you said your name once more, to no one in particular, and then lost the thread of it. There is no shrine, no song, no village that ever knew you were there. You are completely gone, and nothing in the world is different.
