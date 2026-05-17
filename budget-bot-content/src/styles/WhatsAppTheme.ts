// Calibrated from WhatsApp dark-theme screenshots at 1080px-wide render (~2.6× real phone)
export const WA = {
  // Backgrounds
  bgChatList:        '#111b21',
  bgConversation:    '#0b141a',
  bgHeader:          '#1f2c34',
  bgInput:           '#2a3942',
  bgBubbleSent:      '#005c4b',
  bgBubbleReceived:  '#1f2c34',
  bgSearchBar:       '#2a3942',
  bgFilterActive:    '#00a884',
  bgFilterInactive:  'transparent',

  // Text
  textPrimary:    '#e9edef',
  textSecondary:  '#8e9eab',
  textTimestamp:  '#8e9eab',
  textPlaceholder:'#8e9eab',

  // Accent
  green:    '#00a884',
  blue:     '#53bdeb',

  // Avatar initials colors (per contact letter)
  avatarColors: {
    M: '#c0392b',
    R: '#2980b9',
    L: '#27ae60',
    B: '#e67e22',
    W: '#8e44ad',
  } as Record<string, string>,

  // Sizes (at 1080px wide ≈ 2.6× a 412dp Android)
  avatarLg:     104,
  avatarSm:      80,
  fontTitle:     52,
  fontName:      42,
  fontPreview:   36,
  fontMessage:   36,
  fontTimestamp: 26,
  fontBadge:     26,
  fontNav:       26,
  fontStatus:    26,
  fontFilter:    28,

  // Bubble geometry
  bubbleRadius:   18,
  bubbleMaxWidth: '68%',
  bubblePadV:     20,
  bubblePadH:     26,
  tailSize:       14,

  // Input bar
  inputRadius: 48,
} as const;
