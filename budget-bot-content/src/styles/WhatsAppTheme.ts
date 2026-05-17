// Calibrated from WhatsApp light-theme screenshots at 1080px-wide render (~2.6× real phone)
export const WA = {
  // Backgrounds
  bgChatList:        '#F7F5F3',
  bgConversation:    '#EFEAE2',
  bgHeader:          '#ffffff',
  bgInput:           '#f0f2f5',
  bgBubbleSent:      '#D9FDD3',
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
    A: '#16a085',
    S: '#d35400',
    D: '#7f8c8d',
  } as Record<string, string>,

  // Sizes (at 1080px wide ≈ 2.62× a 412dp Android — Pixel 6 baseline)
  avatarLg:     128,
  avatarSm:      84,
  fontTitle:     48,
  fontName:      44,
  fontPreview:   37,
  fontMessage:   39,
  fontTimestamp: 29,
  fontBadge:     31,
  fontNav:       28,
  fontStatus:    26,
  fontFilter:    28,

  // Bubble geometry
  bubbleRadius:   18,
  bubbleMaxWidth: '80%',
  bubblePadV:     16,
  bubblePadH:     26,
  tailSize:       18,

  // Input bar
  inputRadius: 48,
} as const;
