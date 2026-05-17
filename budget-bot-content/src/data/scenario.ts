export interface ChatListItem {
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread?: number;
}

export interface Message {
  role: 'user' | 'bot';
  lines: string[];
  delayFrames: number;
}

export interface Scenario {
  triggerContact: string;
  chatList: ChatListItem[];
  botConversation: Message[];
  resolution: {
    replyTo: string;
    userMessage: string;
    theirResponse: string;
  };
}

export const scenario: Scenario = {
  triggerContact: 'Big Mike 🍾',
  chatList: [
    {
      name: 'Mom',
      avatar: 'M',
      preview: 'are you eating properly??? 😤',
      time: '9:38',
      unread: 3,
    },
    {
      name: 'Royce DuPont III',
      avatar: 'R',
      preview: 'the market waits for no one, Gerald',
      time: '9:35',
    },
    {
      name: 'Landlord 🏠',
      avatar: 'L',
      preview: 'rent is due in 3 days just a reminder 🙂',
      time: '9:21',
      unread: 1,
    },
    {
      name: 'Big Mike 🍾',
      avatar: 'B',
      preview: 'bro you want to get BOTTLES tonight or not',
      time: '9:15',
      unread: 1,
    },
    {
      name: 'Work',
      avatar: 'W',
      preview: 'can you come in Saturday',
      time: '8:50',
    },
  ],
  botConversation: [
    {
      role: 'user',
      lines: ['should I get bottles at the club tonight?'],
      delayFrames: 20,
    },
    {
      role: 'bot',
      lines: [
        'lol okay let\'s see 👀',
        '',
        'you\'ve spent $340 on clubs',
        'in the last 30 days alone.',
        '',
        'your current goal:',
        '"buy mom a house by 2027" 🏠',
        '',
        'at this rate you\'ll get there',
        'in approximately... 47 years.',
        '',
        'also your notes say last time',
        'you went out you told a girl',
        'you were an "entrepreneur"',
        'and then ubered home alone',
        'and got mcdonalds at 2am 🍟',
        '',
        'so. bottles?',
      ],
      delayFrames: 45,
    },
    {
      role: 'user',
      lines: ['staying in tonight 🙏'],
      delayFrames: 30,
    },
    {
      role: 'bot',
      lines: ['proud of you. that\'s $180 saved.', 'maybe 46 years now 📈'],
      delayFrames: 25,
    },
  ],
  resolution: {
    replyTo: 'Big Mike 🍾',
    userMessage: "can't bro, saving up 💪",
    theirResponse: '...bro',
  },
};
