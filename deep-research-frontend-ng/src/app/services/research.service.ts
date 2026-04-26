import { Injectable, OnDestroy } from '@angular/core';
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
export class ResearchService implements OnDestroy {
  private reportSubject = new BehaviorSubject<ResearchReport | null>(null);
  report$ = this.reportSubject.asObservable();

  private progressSubject = new BehaviorSubject<ProgressOutputChannelEvent[]>([]);
  progress$ = this.progressSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  isConnected$ = this.isConnectedSubject.asObservable();

  private stompClient: Client;

  constructor() {
    this.stompClient = new Client({
      brokerURL: environment.wsUrl,
      onConnect: () => {
        console.log('Connected to STOMP broker');
        this.isConnectedSubject.next(true);

        this.stompClient.subscribe('/topic/research/progress', (message: IMessage) => {
          const event: ProgressOutputChannelEvent = JSON.parse(message.body);
          this.progressSubject.next([event, ...this.progressSubject.value].slice(0, 20));
        });

        this.stompClient.subscribe('/topic/research/result', (message: IMessage) => {
          const report: ResearchReport = JSON.parse(message.body);
          this.reportSubject.next(report);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.headers['message'] || frame.body);
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP broker');
        this.isConnectedSubject.next(false);
      },
    });

    this.stompClient.activate();
  }

  ngOnDestroy(): void {
    this.stompClient.deactivate();
  }

  startResearch(topic: string): void {
    if (!this.isConnectedSubject.value) {
      console.error('Not connected to STOMP broker');
      return;
    }

    this.stompClient.publish({
      destination: '/app/research',
      body: JSON.stringify({ researchTopic: topic }),
    });
  }

  clearReport(): void {
    this.reportSubject.next(null);
  }

  isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}