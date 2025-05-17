const layoutMetadata = {
    title: 'NFun - Turn NFTs into Viral Memes Instantly',
    description:
        'Create and mint viral NFT memes in seconds with NFun! Customize styles, add captions, and share your Squid Game-inspired creations.',
    keywords: [
        'NFT memes',
        'meme generator',
        'NFun',
        'viral memes',
        'Squid Game memes',
        'NFT creator',
        'meme minting',
        'X memes',
    ],
    openGraph: {
        title: 'NFun - Instant Viral NFT Memes',
        description:
            'Transform NFTs into memes with captions and Squid Game-inspired styles. Mint or share in seconds with NFun. Follow @NFToodleHQ on X!',
        url: 'https://NFun.ayverse.me',
        siteName: 'NFun',
        images: [
            {
                url: 'https://pbs.twimg.com/profile_images/1903891969476059136/ovNOfG-d_400x400.jpg',
                width: 400,
                height: 400,
                alt: 'NFun Viral NFT Meme Creator',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'NFun - Create Viral NFT Memes',
        description:
            'Turn NFTs into memes in seconds with NFun! Customize, mint, or share with our Squid Game-themed generator. Follow @NFToodleHQ on X!',
        images: [
            'https://pbs.twimg.com/profile_images/1903891969476059136/ovNOfG-d_400x400.jpg',
        ],
        site: '@NFToodleHQ',
    },
    alternates: {
        canonical: 'https://NFun.ayverse.me',
    },
    robots: {
        index: true,
        follow: true,
    },
}

const SQUID_ELEMENTS = {
    emojis: {
      circle: '⭕️',
      triangle: '🔺',
      square: '⬛',
      mask: '🎭',
      guard: '👥',
      doll: '🎎',
      cookie: '🍪',
      money: '💰',
      gun: '🔫',
      skull: '💀',
      glass: '🪟',
      umbrella: '☂️',
    },
    filters: {
      redLight: {
        name: 'Red Light',
        filter:
          'brightness(120%) saturate(180%) hue-rotate(340deg) contrast(130%) sepia(20%)',
        // Creates an intense red atmosphere with enhanced contrast
      },
      greenLight: {
        name: 'Green Light',
        filter:
          'brightness(115%) saturate(140%) hue-rotate(85deg) contrast(120%) sepia(15%)',
        // Vivid green with slight warmth
      },
      arenaMode: {
        name: 'Arena',
        filter:
          'contrast(140%) brightness(85%) saturate(120%) sepia(30%) hue-rotate(15deg)',
        // Dark, gritty look with enhanced contrast
      },
      neonNight: {
        name: 'Neon Night',
        filter:
          'brightness(130%) contrast(140%) saturate(200%) hue-rotate(190deg)',
        // Cyberpunk-style with intense colors
      },
      dollScene: {
        name: 'Doll Scene',
        filter:
          'sepia(50%) brightness(105%) contrast(130%) saturate(140%) hue-rotate(305deg)',
        // Creepy vintage look with purple tint
      },
      glassGame: {
        name: 'Glass Bridge',
        filter:
          'brightness(110%) contrast(120%) saturate(110%) blur(0.4px) hue-rotate(10deg)',
        // Subtle glass effect with slight blur
      },
      vhs: {
        name: 'VHS Style',
        filter:
          'contrast(150%) brightness(95%) saturate(130%) sepia(20%) hue-rotate(5deg)',
        // Retro VHS look
      },
      nightmare: {
        name: 'Nightmare',
        filter:
          'contrast(160%) brightness(80%) saturate(160%) hue-rotate(270deg) grayscale(30%)',
        // Dark and ominous
      },
      synthwave: {
        name: 'Synthwave',
        filter:
          'brightness(120%) contrast(140%) saturate(180%) hue-rotate(220deg)',
        // 80s synthwave aesthetic
      },
      elimination: {
        name: 'Elimination',
        filter:
          'contrast(150%) brightness(90%) saturate(170%) sepia(40%) hue-rotate(320deg)',
        // Dramatic red-tinted elimination scene
      },
    },
    fonts: {
      impact: 'Impact',
      squidGame: 'SquidGame',
      pixel: 'Press Start 2P',
      future: 'Orbitron',
    },
    captions: [
      "Red light... 🔴 Green light... 🟢 You won't escape!",
      "The game isn't over yet... 🦑 The real challenge begins now!",
      'Choose wisely, your next move could cost you everything 🎮',
      'The Front Man sees all 👁️ but can you escape his gaze?',
      '456 reasons to play again... but no promises of survival 🎲',
      'Glass stepping stones... Choose or lose! 🪟 Are you brave enough?',
      'Honeycomb challenge accepted 🍯 Break the cookie or break your fate.',
      'Tug of war champion 🏆 Who will survive the final pull?',
      'Marbles: friend or foe? 🔮 Will you win with a friend, or alone?',
      "Final round: Squid Game 🦑 There's no going back now...",
    ],
  };
  

export {
    layoutMetadata,
    SQUID_ELEMENTS
}