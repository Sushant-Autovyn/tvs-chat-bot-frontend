import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { Message } from '../../models/message';

interface UserDetails {
  username: string;
  email: string;
  phone: string;
  issue: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class ChatbotComponent implements OnInit {

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: Message[] = [];
  quickReplies: string[] = [];

  showForm = false;
  formSubmitted = false;
  userDetails: UserDetails = { username: '', email: '', phone: '', issue: '' };
  formErrors: Partial<UserDetails> = {};
  fallbackCount = 0;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addBotMessage('Welcome to TVS Support. I\'m your virtual assistant and I\'m here to help with your queries. How may I assist you today?');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.userDetails.username.trim()) {
      this.formErrors.username = 'Username is required';
    }

    if (!this.userDetails.phone.trim()) {
      this.formErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(this.userDetails.phone)) {
      this.formErrors.phone = 'Enter a valid phone number';
    }

    if (!this.userDetails.email.trim()) {
      this.formErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userDetails.email)) {
      this.formErrors.email = 'Enter a valid email';
    }

    if (!this.userDetails.issue.trim()) {
      this.formErrors.issue = 'Please describe your issue';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  submitForm() {
    if (!this.validateForm()) return;

    this.chatService.saveUserDetails(this.userDetails).subscribe({
      next: () => {
        this.showForm = false;
        this.formSubmitted = true;

        this.addBotMessage('Thanks! We’ve sent a confirmation link to your email — please check your inbox. You’re free to keep chatting with our agent in the meantime.');
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        this.showForm = false;
        this.formSubmitted = true;

        this.addBotMessage('Thanks! We’ve sent a confirmation link to your email — please check your inbox. You’re free to keep chatting with our agent in the meantime.');
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  sendMessage(text?: string) {
    if (this.formSubmitted) return;

    const message = (text || this.userInput).trim();
    if (!message) return;

    this.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    this.userInput = '';
    this.quickReplies = [];
    this.isTyping = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    this.chatService.sendMessage(message).subscribe({
      next: (res) => {
        this.isTyping = false;

        const isFallback = res.intent === 'fallback';
        if (isFallback) {
          this.fallbackCount += 1;
        } else {
          this.fallbackCount = 0;
        }

        // If this triggers the form, just show the form silently —
        // no extra prompt message (the form itself is the prompt).
        if (isFallback && this.fallbackCount >= 1 && !this.showForm) {
          this.showForm = true;
        } else {
          this.addBotMessage(res.reply, res.quickReplies);
        }

        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        this.isTyping = false;
        this.addBotMessage('Something went wrong. Please try again.', ['Back to Menu']);
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });
  }

  addBotMessage(text: string, quickReplies: string[] = []) {
    this.messages.push({
      sender: 'bot',
      text,
      timestamp: new Date()
    });
    this.quickReplies = quickReplies;
  }

  onQuickReply(reply: string) {
    if (reply === 'Back to Menu') {
      this.quickReplies = [];
      this.addBotMessage(
        `Sure ${this.userDetails.username || 'there'}! Here's what I can help you with:`,
        ['Vehicle Stock', 'Spare Parts', 'Service Targets', 'Current Schemes', 'Customer Complaint', 'Talk to TVS Team']
      );
      this.scrollToBottom();
      return;
    }
    this.sendMessage(reply);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.messageContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (e) {}
    }, 50);
  }

  formatText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }
}