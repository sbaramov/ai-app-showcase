import { Injectable } from '@angular/core';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResearchRequestMessage {
  researchTopic: string;
}

export interface ResearchReport {
  shortSummary: string;
  markdownReport: string;
  followUpQuestions?: string[];
}

export interface ProgressOutputChannelEvent {
  processId: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private reportSubject = new BehaviorSubject<ResearchReport | null>(null);
  report$ = this.reportSubject.asObservable();

  private progressSubject = new BehaviorSubject<ProgressOutputChannelEvent[]>([]);
  progress$ = this.progressSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();

  private stompClient: Client | null = null;

  constructor() {
    this.stompClient = new Client({
      brokerURL: environment.wsUrl,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
      reconnectDelay: 1000,
      connectionTimeout: 1000,
      onConnect: (frame: IFrame) => {
        this.isConnectedSubject.next(true);
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.body);
      },
      onDisconnect: (frame: IFrame) => {
        this.isConnectedSubject.next(false);
      },
    });

    this.stompClient.activate();
  }

  startResearch(topic: string): void {
    if (!this.stompClient || !this.isConnectedSubject.value) {
      console.error('Not connected to STOMP broker');
      return;
    }

    const message: ResearchRequestMessage = {
      researchTopic: topic,
    };

    this.stompClient.publish({
      destination: '/app/research',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  connectProgress(): void {
    if (!this.stompClient || !this.isConnectedSubject.value) {
      return;
    }

    this.stompClient.subscribe('/topic/research/progress', (message: IMessage) => {
      const event: ProgressOutputChannelEvent = JSON.parse(message.body);
      this.progressSubject.next([event]);
    });
  }

  connectReport(): void {
    if (!this.stompClient || !this.isConnectedSubject.value) {
      return;
    }

    this.stompClient.subscribe('/topic/research/result', (message: IMessage) => {
      const report: ResearchReport = JSON.parse(message.body);
      this.reportSubject.next(report);
    });
  }

  clearReport(): void {
    this.reportSubject.next(null);
  }

  isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}