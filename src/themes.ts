import { Theme, Entity } from './types';

export const THEMES: Theme[] = [
  {
    id: 'innsmouth',
    name: 'The Shadow Over Innsmouth',
    introLog: 'The air grows heavy with the smell of brine and decaying fish. The architecture shifts, becoming strangely aquatic and oppressive.',
    monsterNames: ['Deep One', 'Deep One Scout', 'Deep One Warrior', 'Cultist'],
    environmentalDetails: [
      { name: 'Damp Idol', char: 'i', color: '#14b8a6', description: 'A soapstone idol that feels perpetually moist.' },
      { name: 'Fishy Puddle', char: '~', color: '#3b82f6', description: 'A puddle of seawater that smells of ancient depths.' },
      { name: 'Rotting Net', char: '#', color: '#78716c', description: 'Old fishing nets draped over the walls.' }
    ],
    roomDescriptions: [
      'The room smells of salt and old secrets. The walls seem to sweat seawater.',
      'You hear the distant sound of waves crashing against stone, though you are deep underground.',
      'The floor is slick with a strange, viscous slime. It smells like low tide on a hot day.',
      'Statues of frog-like beings leer at you from the corners. Their eyes seem to follow your movements.',
      'The geometry of this room suggests it was built for things that do not walk on two legs.'
    ]
  },
  {
    id: 'mountains',
    name: 'At the Mountains of Madness',
    introLog: 'The temperature drops sharply. A howling wind echoes through the corridors, carrying the sound of piping whistles.',
    monsterNames: ['Elder Thing', 'Shoggoth', 'Shoggoth Spawn', 'Penguin (Giant)'], // Added Penguin just in case, but will map to something else if not found
    environmentalDetails: [
      { name: 'Frozen Carving', char: '❄', color: '#bae6fd', description: 'Bas-reliefs depicting a star-headed race.' },
      { name: 'Black Stone', char: '■', color: '#1c1917', description: 'A block of iridescent black stone, cold to the touch.' },
      { name: 'Strange Piping', char: '♪', color: '#a3a3a3', description: 'The wind whistles through holes in the wall, creating a disturbing melody.' }
    ],
    roomDescriptions: [
      'The room is freezing cold. Your breath mists in the air.',
      'Murals on the walls depict the rise and fall of a civilization that predates humanity by eons.',
      'You hear a "Tekeli-li" echoing from the darkness ahead.',
      'The architecture here is cyclopean, with five-sided symmetry dominating the design.',
      'Massive blocks of stone are fitted together with impossible precision.'
    ]
  },
  {
    id: 'whisperer',
    name: 'The Whisperer in Darkness',
    introLog: 'A buzzing sound fills your ears. The shadows seem to vibrate with an alien frequency.',
    monsterNames: ['Mi-Go', 'Mi-Go Drone', 'Cultist'],
    environmentalDetails: [
      { name: 'Brain Cylinder', char: 'o', color: '#ec4899', description: 'A metal cylinder connected to strange machinery. It hums softly.' },
      { name: 'Black Stone Tablet', char: 'T', color: '#1e293b', description: 'A tablet covered in buzzing, insect-like hieroglyphs.' },
      { name: 'Surgical Table', char: '∏', color: '#94a3b8', description: 'A table fitted with restraints and strange, alien instruments.' }
    ],
    roomDescriptions: [
      'The room hums with the sound of unseen machinery.',
      'You feel a sensation of being watched by compound eyes.',
      'The air smells of ozone and copper.',
      'Strange, organic-looking technology is fused into the stone walls.',
      'You hear a buzzing voice in your head, whispering secrets of the cosmos.'
    ]
  },
  {
    id: 'cthulhu',
    name: 'The Call of Cthulhu',
    introLog: 'A psychic pressure builds in your mind. You dream while awake, seeing visions of a sunken city.',
    monsterNames: ['Cultist', 'Cultist Initiate', 'Cultist Acolyte', 'Deep One', 'Star Spawn'],
    environmentalDetails: [
      { name: 'Cthulhu Idol', char: 'C', color: '#15803d', description: 'A small statue of the sleeper of R\'lyeh.' },
      { name: 'Ritual Circle', char: 'O', color: '#b91c1c', description: 'A circle drawn in blood, surrounded by burnt candles.' },
      { name: 'Green Ooze', char: '~', color: '#22c55e', description: 'A patch of glowing green slime that defies analysis.' }
    ],
    roomDescriptions: [
      'The geometry of this room is all wrong. Angles that should be acute look obtuse.',
      'You feel a overwhelming sense of insignificance.',
      'The walls are covered in hieroglyphs that hurt your eyes to look at.',
      'You hear a rhythmic chanting: "Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn."',
      'The air is thick with humidity and the smell of tropical decay.'
    ]
  },
  {
    id: 'rats',
    name: 'The Rats in the Walls',
    introLog: 'The scratching sound is incessant. It comes from behind the walls, under the floor... everywhere.',
    monsterNames: ['Rat', 'Skeleton', 'Ghost', 'Zombie'],
    environmentalDetails: [
      { name: 'Rat Hole', char: 'o', color: '#44403c', description: 'A small hole in the baseboard. You see eyes reflecting in the darkness.' },
      { name: 'Gnawed Bones', char: '%', color: '#e5e5e5', description: 'Bones that have been stripped clean by tiny teeth.' },
      { name: 'Ancient Tapestry', char: 'T', color: '#7f1d1d', description: 'A tapestry depicting a family with very questionable dietary habits.' }
    ],
    roomDescriptions: [
      'The sound of scampering feet is deafening.',
      'The walls are lined with ancient, crumbling masonry.',
      'You feel a strange hunger, a desire to consume.',
      'The floor is littered with the debris of centuries.',
      'You discover a hidden grotto beneath the floorboards.'
    ]
  }
];
