// Calibrated from WhatsApp light-theme screenshots at 1080px-wide render (~2.6× real phone)
export const WA = {
  // Backgrounds
  bgChatList:        '#ffffff',
  bgConversation:    '#ece5dd',
  bgHeader:          '#ffffff',
  bgInput:           '#f0f2f5',
  bgBubbleSent:      '#dcf8c6',
  bgBubbleReceived:  '#ffffff',
  bgSearchBar:       '#f0f2f5',
  bgFilterActive:    '#25d366',
  bgFilterInactive:  'transparent',

  // Text
  textPrimary:    '#111b21',
  textSecondary:  '#667781',
  textTimestamp:  '#667781',
  textPlaceholder:'#8696a0',

  // Accent
  green:    '#25d366',
  blue:     '#34b7f1',

  // Avatar initials colors (per contact letter)
  avatarColors: {
    M: '#c0392b',
    R: '#2980b9',
    L: '#27ae60',
    B: '#e67e22',
    W: '#8e44ad',
  } as Record<string, string>,

  // Sizes (at 1080px wide ≈ 2.6× a 412dp Android)
  avatarLg:     128,
  avatarSm:      96,
  fontTitle:     52,
  fontName:      42,
  fontPreview:   36,
  fontMessage:   36,
  fontTimestamp: 26,
  fontBadge:     26,
  fontNav:       28,
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
