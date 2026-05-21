import { Scenario } from '../types';
import { makeEmojiAvatar } from '../../utils/makeEmojiAvatar';

export const bottlesNight: Scenario = {
  id: 'BottlesNight',
  chatList: [
    { name: 'Mom',          avatar: 'M', preview: 'are you eating properly??? 😤',            time: '9:38', unread: 3, pinned: true },
    { name: 'Royce DuPont III', avatar: 'R', preview: 'the market waits for no one, Gerald', time: '9:35', pinned: true },
    { name: 'Landlord 🏠',  avatar: 'L', preview: 'rent is due in 3 days just a reminder 🙂', time: '9:21', unread: 1 },
    { name: 'Big Mike 🍾',  avatar: 'B', preview: 'bro you want to get BOTTLES tonight or not', time: '9:15', unread: 1 },
    { name: 'Work',         avatar: 'W', preview: 'can you come in Saturday',                 time: '8:50' },
    { name: 'Alex 🎮',      avatar: 'A', preview: 'yo did you see the new trailer',            time: '8:30' },
    { name: 'Sarah',        avatar: 'S', preview: 'omg you have to try this place',            time: '8:12' },
    { name: 'Dad',          avatar: 'D', preview: 'call me when you get a chance',             time: 'Yesterday' },
  ],
  scenes: [
    {
      type: 'chat-list',
      tapContact: 'Big Mike 🍾',
      duration: 105,
    },
    {
      type: 'conversation',
      contactName: '💰 Budget Bot',
      contactAvatarSrc: makeEmojiAvatar('💰', '#1dab61'),
      typingDuration: 18,
      messages: [
        {
          role: 'user',
          lines: ['should I get bottles at the club tonight?'],
          delayFrames: 20,
          time: '10:32 PM',
        },
        {
          role: 'bot',
          lines: [
            "lol okay let's see 😅",
            '',
            "you've spent $340 on clubs in the last 30 days alone.",
            '',
            'your current goal: "buy mom a house by 2027" 🏠',
            '',
            "at this rate you'll get there in approximately... 47 years.",
            '',
            "also your notes say last time you went out you told a girl you were an \"entrepreneur\" and then ubered home alone and got mcdonalds at 2am 🍟",
            '',
            'so. bottles?',
          ],
          delayFrames: 45,
          time: '10:32 PM',
        },
        {
          role: 'user',
          lines: ['staying in tonight 🙏'],
          delayFrames: 30,
          time: '10:33 PM',
        },
        {
          role: 'bot',
          lines: ["proud of you. that's $180 saved. maybe 46 years now 📈"],
          delayFrames: 25,
          time: '10:33 PM',
        },
      ],
    },
    {
      type: 'quick-reply',
      contactName: 'Big Mike 🍾',
      contactAvatarSrc: makeEmojiAvatar('🍾', '#e67e22'),
      previewMessage: 'bro you want to get BOTTLES tonight or not',
      userMessage: "can't bro, saving up 💪",
      contactResponse: '...bro',
      duration: 440,
      replyOffset: 50,
      responseOffset: 110,
      times: {
        preview: '9:15 AM',
        reply: '9:41 AM',
        response: '9:41 AM',
      },
    },
  ],
};
