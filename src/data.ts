import { Entity, Stats, LoreEntry } from './types';

export const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'lore-1',
    title: 'The Shadow Over Innsmouth (Annotated)',
    content: 'The deep ones are not merely fish, nor merely men—a distinction that, in the grand, entropic scheme of things, is essentially a category error. They are a blasphemous union of both, dwelling in the sunless, high-pressure depths of the ocean, waiting for the stars to achieve a specific, non-negotiable alignment.',
    quote: '...a distinction that is essentially a category error...',
    author: 'A concerned (and highly medicated) citizen'
  },
  {
    id: 'lore-2',
    title: 'Fragment of the Necronomicon (Draft)',
    content: 'That is not dead which can eternal lie—which is to say, the state of "death" is less a binary toggle and more a spectrum of metabolic stasis. And with strange aeons even death may die, or at least undergo a significant, permanent rebranding. Cthulhu sleeps, dreaming of a reality where your consciousness is just a rounding error.',
    quote: '...death is less a binary toggle and more a spectrum...',
    author: 'Abdul "The Mad" Alhazred'
  },
  {
    id: 'lore-3',
    title: 'Miskatonic Expedition Notes (Confidential)',
    content: 'The structures we found in the Antarctic were not built by human hands, nor by any hands that follow the standard five-digit paradigm. They were carved by the Elder Things, beings who arrived from the stars when the Earth was still a cooling, semi-solid lump of geological potential.',
    quote: '...the standard five-digit paradigm...',
    author: 'Professor William Dyer (Dept. of Existential Dread)'
  },
  {
    id: 'lore-4',
    title: 'The Call of Cthulhu (Executive Summary)',
    content: 'The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents—a sort of cognitive firewall against the absolute, soul-crushing vastness of the Infinite. We live on a placid island of ignorance in the midst of black, non-Euclidean seas of pure, unadulterated "No Thank You."',
    quote: '...a sort of cognitive firewall...',
    author: 'Francis Wayland Thurston'
  },
  {
    id: 'lore-5',
    title: 'De Vermis Mysteriis (Paperback Edition)',
    content: 'The Mysteries of the Worm are less about actual annelids and more about the metaphysical implications of being consumed from the inside out by ideas that refuse to fit in your head. It suggests that the universe is not indifferent, but actively hostile in a way that feels personal.',
    quote: '...ideas that refuse to fit in your head...',
    author: 'Ludvig Prinn'
  },
  {
    id: 'lore-6',
    title: 'Unaussprechlichen Kulten (Translated)',
    content: 'Von Junzt\'s catalog of "Nameless Cults" is a dry, academic look at people who worship things that look like spilled lasagna. The text argues that sanity is just a lack of imagination, and that true enlightenment involves screaming until your vocal cords detach.',
    quote: '...sanity is just a lack of imagination...',
    author: 'Friedrich von Junzt'
  },
  {
    id: 'lore-7',
    title: 'The King in Yellow (Playbill)',
    content: 'Have you seen the Yellow Sign? It looks a bit like a triskelion drawn by someone with a tremor. Reading the second act of this play is said to induce madness, which is a convenient way to avoid writing a third act.',
    quote: '...a convenient way to avoid writing a third act...',
    author: 'Unknown (possibly a hallucination)'
  },
  {
    id: 'lore-8',
    title: 'Pnakotic Manuscripts (Fragment)',
    content: 'These pre-human texts describe the Great Race of Yith, who project their minds through time to learn about history. Essentially, they are cosmic tourists who don\'t tip and leave your body feeling used and confused.',
    quote: '...cosmic tourists who don\'t tip...',
    author: 'The Great Race of Yith (Ghostwritten)'
  }
];

export const ENVIRONMENTAL_DETAILS: Partial<Entity>[] = [
  {
    name: 'Blood-Stained Altar',
    char: 'π',
    color: '#991b1b',
    description: 'A stone altar covered in dried, dark blood. It suggests a level of ritualistic commitment that is both impressive and deeply, deeply problematic.'
  },
  {
    name: 'Strange Carvings',
    char: '≈',
    color: '#4d7c0f',
    description: 'The walls are covered in geometries that seem to actively loathe the concept of a right angle.'
  },
  {
    name: 'Broken Shackles',
    char: '∞',
    color: '#525252',
    description: 'Heavy iron chains, snapped as if by a force that considers the laws of physics to be merely "suggestions."'
  }
];

export const MONSTERS: Partial<Entity>[] = [
  {
    name: 'Deep One',
    char: 'D',
    color: '#3b82f6',
    description: 'A fish-like humanoid that represents a fairly significant violation of the standard evolutionary trajectory.',
    stats: { hp: 10, maxHp: 10, sanity: 0, maxSanity: 0, attack: 3, defense: 1 },
    minLevel: 3,
    lootTable: [
      { itemTemplate: { name: 'Strange Idol', char: 'i', color: '#14b8a6', type: 'item', itemType: 'artifact', description: 'A green soapstone carving of a winged octopus that is—let\'s be honest—kind of a vibe.' }, chance: 0.2 },
      { itemTemplate: { name: 'Health Tincture', char: '!', color: '#ef4444', type: 'item', itemType: 'consumable', description: 'A red liquid that restores 10 HP. Tastes like copper and regret.', effect: (stats: Stats) => ({ ...stats, hp: Math.min(stats.maxHp, stats.hp + 10) }) }, chance: 0.3 }
    ]
  },
  {
    name: 'Mi-Go',
    char: 'M',
    color: '#ec4899',
    description: 'Fungi from Yuggoth. They have wings, which is a bit much, frankly.',
    stats: { hp: 8, maxHp: 8, sanity: 0, maxSanity: 0, attack: 4, defense: 0 },
    minLevel: 6,
    lootTable: [
      { itemTemplate: { name: 'Strange Cylinder', char: 'o', color: '#ec4899', type: 'item', description: 'A metallic cylinder containing a human brain. It\'s probably not yours, but you can\'t be 100% sure.' }, chance: 0.1 }
    ]
  },
  {
    name: 'Cultist',
    char: 'c',
    color: '#ef4444',
    description: 'A person who has decided that "sanity" is a bit too mainstream for their tastes.',
    stats: { hp: 6, maxHp: 6, sanity: 0, maxSanity: 0, attack: 2, defense: 0 },
    minLevel: 2,
    lootTable: [
      { itemTemplate: { name: 'Ritual Dagger', char: '/', color: '#94a3b8', type: 'item', itemType: 'weapon', description: 'A curved blade used in ceremonies that you definitely weren\'t invited to. Increases attack by 2.', effect: (stats: Stats) => ({ ...stats, attack: stats.attack + 2 }) }, chance: 0.15 }
    ]
  },
  {
    name: 'Shoggoth',
    char: 'S',
    color: '#10b981',
    description: 'A massive, bubbling mass of protoplasm that is essentially a sentient, angry lava lamp. Highly resistant to physical attacks.',
    stats: { hp: 25, maxHp: 25, sanity: 0, maxSanity: 0, attack: 6, defense: 3, resistances: { physical: 0.3 } },
    minLevel: 10,
    lootTable: [
      { itemTemplate: { name: 'Elder Sign', char: '*', color: '#fbbf24', type: 'item', description: 'A powerful protection against the mythos. It\'s basically a cosmic "Do Not Disturb" sign.' }, chance: 0.5 }
    ]
  },
  {
    name: 'Night-Gaunt',
    char: 'N',
    color: '#6366f1',
    description: 'Faceless, rubbery-skinned winged creatures that are—and I mean this in the most literal sense—a total nightmare.',
    stats: { hp: 12, maxHp: 12, sanity: 0, maxSanity: 0, attack: 4, defense: 1 },
    minLevel: 7,
    ability: 'teleport'
  },
  {
    name: 'Elder Thing',
    char: 'E',
    color: '#84cc16',
    description: 'Ancient, star-headed beings. Their presence heavily drains sanity, mostly because they remind you how young and irrelevant your species is.',
    stats: { hp: 18, maxHp: 18, sanity: 0, maxSanity: 0, attack: 5, defense: 2 },
    minLevel: 8,
    ability: 'drain_sanity'
  },
  {
    name: 'Flying Polyp',
    char: 'P',
    color: '#a1a1aa',
    description: 'Invisible, semi-material entities. They attack with wind blasts, which is a very efficient way to ruin someone\'s day.',
    stats: { hp: 15, maxHp: 15, sanity: 0, maxSanity: 0, attack: 4, defense: 1 },
    minLevel: 9,
    ability: 'ranged_attack'
  },
  {
    name: 'Hounds of Tindalos',
    char: 'H',
    color: '#7c3aed',
    description: 'Beings that emerge from the angles of time. They are extremely fast and—one assumes—very punctual.',
    stats: { hp: 10, maxHp: 10, sanity: 0, maxSanity: 0, attack: 6, defense: 1 },
    minLevel: 11
  }
];

export const ITEMS: Partial<Entity>[] = [
  {
    name: 'Necronomicon',
    char: '§',
    color: '#a855f7',
    type: 'item',
    itemType: 'consumable',
    description: 'The book of the dead. It\'s a real page-turner, provided you don\'t mind your soul being slowly digested by an ancient deity. Increases attack by 10 but reduces sanity by 15 when used.',
    effect: (stats: Stats) => ({ ...stats, attack: stats.attack + 10, sanity: Math.max(0, stats.sanity - 15) })
  },
  {
    name: 'Elder Sign',
    char: '*',
    color: '#fbbf24',
    type: 'item',
    itemType: 'artifact',
    description: 'A powerful protection against the mythos. It\'s like a security system for your sanity. Increases defense by 3 and restores 5 sanity when equipped.',
    effect: (stats: Stats) => ({ ...stats, defense: stats.defense + 3, sanity: Math.min(stats.maxSanity, stats.sanity + 5) })
  },
  {
    name: 'Revolver',
    char: 'r',
    color: '#94a3b8',
    type: 'item',
    itemType: 'weapon',
    description: 'A standard .38 caliber handgun. It provides a comforting, if ultimately futile, sense of agency. Increases attack by 5 when equipped.',
    effect: (stats: Stats) => ({ ...stats, attack: stats.attack + 5 })
  },
  {
    name: 'Laudanum',
    char: '!',
    color: '#60a5fa',
    type: 'item',
    itemType: 'consumable',
    description: 'Restores sanity at the cost of physical health. It\'s a trade-off that feels very "late-stage capitalism." Restores 20 sanity but reduces HP by 5.',
    effect: (stats: Stats) => ({ ...stats, sanity: Math.min(stats.maxSanity, stats.sanity + 20), hp: Math.max(1, stats.hp - 5) })
  },
  {
    name: 'Miskatonic Map',
    char: 'm',
    color: '#fde047',
    type: 'item',
    itemType: 'consumable',
    description: 'A dusty map of the university tunnels. Reading it reveals the layout of the current floor, though some of the geometry hurts your eyes.'
  }
];

export const NPCS: Partial<Entity>[] = [
  {
    name: 'The Mad Arab',
    char: 'A',
    color: '#f97316',
    description: 'Abdul Alhazred himself. He seems to be having a very intense conversation with a patch of empty air.',
    dialogue: [
      "The stars... they are almost right. Which is to say, they are currently wrong, but in a very specific, impending way.",
      "Do not look too closely at the shadows, traveler. They have a tendency to look back, and their gaze is—frankly—unsettling.",
      "I have seen the face of Yog-Sothoth, and it is a thousand spheres of light. It\'s actually quite beautiful, in a soul-shattering sort of way."
    ]
  },
  {
    name: 'Professor Armitage',
    char: 'P',
    color: '#64748b',
    description: 'A librarian from Miskatonic University. He looks like he hasn\'t slept since the late nineteenth century.',
    dialogue: [
      "We must find the key to the restricted section. The Dewey Decimal System is our only defense against the void.",
      "The Necronomicon is not a book to be read lightly. Or at all, if you value your ability to perceive reality as a stable construct.",
      "There are things in this basement that were never meant to be disturbed. Like the 1924 budget reports, for instance."
    ]
  }
];
