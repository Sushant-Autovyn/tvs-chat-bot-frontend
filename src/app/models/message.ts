export interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}