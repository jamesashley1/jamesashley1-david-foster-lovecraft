export const SANITY_DRAIN_LOGS = [
  (monster: string, amount: number) => `Glimpsing the ${monster} drains your sanity by ${amount}. Your cognitive firewall is starting to look a bit porous.`,
  (monster: string, amount: number) => `The mere sight of the ${monster} costs you ${amount} sanity. You feel a headache that tastes like purple.`,
  (monster: string, amount: number) => `You lose ${amount} sanity looking at the ${monster}. It reminds you of your ex, but with more tentacles.`,
  (monster: string, amount: number) => `The ${monster}'s geometry hurts your brain. You lose ${amount} sanity points and a bit of your childhood innocence.`,
  (monster: string, amount: number) => `Witnessing the ${monster} erodes ${amount} sanity. You suddenly remember every embarrassing thing you've ever done.`,
  (monster: string, amount: number) => `The ${monster} is logically impossible. Your mind rejects it, costing you ${amount} sanity.`,
  (monster: string, amount: number) => `You lose ${amount} sanity. The ${monster} whispers secrets you really didn't want to know.`,
  (monster: string, amount: number) => `The ${monster} makes a sound that shouldn't exist. You lose ${amount} sanity trying to process it.`,
  (monster: string, amount: number) => `Your grip on reality loosens by ${amount} points. The ${monster} is just... wrong.`,
  (monster: string, amount: number) => `The ${monster} exists in defiance of natural law. You lose ${amount} sanity out of sheer protest.`,
  (monster: string, amount: number) => `You feel ${amount} sanity slip away. The ${monster} is a visual non-sequitur.`,
  (monster: string, amount: number) => `The ${monster} causes a ${amount} point drop in your mental stability. You consider a career change.`,
  (monster: string, amount: number) => `You lose ${amount} sanity. The ${monster} looks like a biological error message.`,
  (monster: string, amount: number) => `The ${monster}'s presence is an affront to your psyche. You lose ${amount} sanity.`,
  (monster: string, amount: number) => `You drop ${amount} sanity. The ${monster} is the stuff of nightmares, literally.`,
  (monster: string, amount: number) => `The ${monster} makes you question your life choices. You lose ${amount} sanity.`,
  (monster: string, amount: number) => `You lose ${amount} sanity. The ${monster} is a walking, squelching existential crisis.`,
  (monster: string, amount: number) => `The ${monster} drains ${amount} sanity. You feel your grasp on the present moment slipping.`,
  (monster: string, amount: number) => `You lose ${amount} sanity. The ${monster} is a glitch in the matrix of your mind.`,
  (monster: string, amount: number) => `The ${monster} costs you ${amount} sanity. You feel a sudden urge to scream into a pillow.`
];

export const SANITY_LOSS_LOGS = [
  "Your mind shatters from the eldritch horrors. You are now—technically speaking—a total mess.",
  "Your psyche collapses like a flan in a cupboard. You are done.",
  "You have lost the ability to distinguish between a monster and a lamp post. Game over.",
  "Your mind has left the building. It did not leave a forwarding address.",
  "You are now fully insane. On the bright side, the monsters look much friendlier now.",
  "Reality and hallucination have merged. You can no longer function as a protagonist.",
  "Your sanity hits zero. You decide to curl up in a ball and hum show tunes until the end.",
  "The abyss gazed back, and you blinked. Your mind is broken.",
  "You have transcended sanity. Unfortunately, this means you lose.",
  "Your mental hard drive has crashed. Please reboot universe.",
  "You are lost in the madness. The game is over, but the screaming continues.",
  "Your mind snaps. You are now one with the chaos.",
  "You have gone stark raving mad. It's a bold look, but not a winning one.",
  "Your sanity is gone. You are now just a vessel for the void.",
  "You have successfully lost your mind. Congratulations?",
  "The horrors were too much. You are now a vegetable with anxiety.",
  "Your brain has resigned in protest. Game over.",
  "You have achieved maximum entropy. Your mind is a soup.",
  "Sanity: 0. Madness: 1. You: Dead.",
  "You giggle uncontrollably as the darkness takes you. It's over."
];

export const LOOT_DROP_LOGS = [
  (monster: string, item: string) => `The ${monster} dropped a ${item}! A small consolation for your impending doom.`,
  (monster: string, item: string) => `You find a ${item} on the remains of the ${monster}. Finders keepers.`,
  (monster: string, item: string) => `The ${monster} was carrying a ${item}. It won't be needing it anymore.`,
  (monster: string, item: string) => `A ${item} falls from the ${monster}. It's sticky, but useful.`,
  (monster: string, item: string) => `You loot a ${item} from the ${monster}. Capitalism thrives even in the dungeon.`,
  (monster: string, item: string) => `The ${monster} leaves behind a ${item}. A parting gift, perhaps?`,
  (monster: string, item: string) => `You recover a ${item} from the mess that was the ${monster}.`,
  (monster: string, item: string) => `The ${monster} drops a ${item}. You take it without hesitation.`,
  (monster: string, item: string) => `A ${item} slides out of the ${monster}. Gross, but you take it.`,
  (monster: string, item: string) => `You scavenge a ${item} from the ${monster}. Survival of the fittest.`,
  (monster: string, item: string) => `The ${monster} yields a ${item}. A reward for your violence.`,
  (monster: string, item: string) => `You find a ${item} near the ${monster}. It looks important.`,
  (monster: string, item: string) => `The ${monster} drops a ${item}. You pocket it quickly.`,
  (monster: string, item: string) => `A ${item} is left behind by the ${monster}. Lucky you.`,
  (monster: string, item: string) => `You pick up a ${item} from the ${monster}. Every little bit helps.`,
  (monster: string, item: string) => `The ${monster} had a ${item}. Now you have a ${item}.`,
  (monster: string, item: string) => `You obtain a ${item} from the ${monster}. Don't ask where it was keeping it.`,
  (monster: string, item: string) => `The ${monster} drops a ${item}. It shines in the gloom.`,
  (monster: string, item: string) => `You secure a ${item} from the defeated ${monster}.`,
  (monster: string, item: string) => `The ${monster} relinquishes a ${item}. You accept the offering.`
];

export const LOW_HEALTH_LOGS = [
  "You are bleeding profusely. It's very dramatic, but also life-threatening.",
  "Your health is critically low. You should probably do something about that.",
  "You are one stiff breeze away from death. Be careful.",
  "Your vision is blurring. That's usually a bad sign.",
  "You feel cold. And not just because of the dungeon.",
  "You are running on fumes and adrenaline. Mostly fumes.",
  "Your body is screaming at you to stop. You ignore it.",
  "You are barely standing. This is not going well.",
  "Blood loss is making you lightheaded. Or maybe it's the eldritch horror.",
  "You are at death's door. Please do not knock."
];

export const LOW_SANITY_LOGS = [
  "The shadows are whispering to you. You are starting to listen.",
  "You feel like you're being watched by the walls. The walls are judging you.",
  "Your thoughts are racing, but they're running in circles.",
  "You are having trouble remembering your own name. It probably doesn't matter.",
  "The geometry of the room seems... flexible. That's not right.",
  "You hear laughter. You are the only one laughing.",
  "Your grip on reality is slipping. Try to hold on.",
  "The colors are too loud. The silence is too bright.",
  "You feel a scream building in your throat. You swallow it.",
  "You are losing it. 'It' being your mind."
];
