// Calibrated from WhatsApp light-theme screenshots at 1080px-wide render (~2.6× real phone)
export const WA = {
  // Backgrounds
  bgChatList:        '#ffffff',
  bgConversation:    '#EFEAE2',
  bgHeader:          '#ffffff',
  bgInput:           '#f0f2f5',
  bgBubbleSent:      '#D9FDD3',
  bgBubbleReceived:  '#ffffff',
  bgSearchBar:       '#f0f2f5',
  bgFilterActive:    '#1dab61',
  bgFilterInactive:  'transparent',

  // Text
  textPrimary:    '#111b21',
  textSecondary:  '#667781',
  textTimestamp:  '#667781',
  textPlaceholder:'#8696a0',

  // Accent
  green:    '#1dab61',
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
  fontFilter:    34,

  // Bubble geometry
  bubbleRadius:   18,
  bubbleMaxWidth: '918px',  // 85% of 1080px canvas — fixed px so it resolves identically in any CSS layout context
  bubblePadV:     16,
  bubblePadH:     26,
  tailSize:       18,

  // Input bar
  inputRadius: 48,

  // Chat list specific colors (calibrated separately from conversation colors)
  textListPrimary: '#111820',  // contact name in chat list rows
  textListMuted:   '#646b72',  // preview text and timestamp in chat list rows
  pinColor:        '#90989e',  // pin icon in chat list
} as const;
