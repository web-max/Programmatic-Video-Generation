export interface Message {
  role: 'user' | 'bot';
  lines: string[];
  delayFrames: number;
  time?: string;
}

export interface ChatListItem {
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread?: number;
  pinned?: boolean;
}

export type Scene =
  | {
      type: 'chat-list';
      tapContact: string;
      duration: number;
    }
  | {
      type: 'conversation';
      contactName: string;
      contactAvatarSrc?: string;
      messages: Message[];
      typingDuration?: number;
    }
  | {
      type: 'quick-reply';
      contactName: string;
      contactAvatarSrc?: string;
      previewMessage: string;
      userMessage: string;
      contactResponse: string;
      duration: number;
      replyOffset?: number;
      responseOffset?: number;
      times?: {
        preview?: string;
        reply?: string;
        response?: string;
      };
    };

export interface Scenario {
  id: string;
  chatList: ChatListItem[];
  scenes: Scene[];
}
