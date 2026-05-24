import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResearchRequestMessage {
  researchTopic: string;
}

export interface ResearchReport {
  shortSummary: string;
  markdownReport: string;
  followUpQuestions?: string[];
}

export interface ResearchResultMessage {
  sessionId: string;
  report: ResearchReport;
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

  /** Emits the sessionId when a live research session completes */
  private sessionCompletedSubject = new Subject<string>();
  sessionCompleted$ = this.sessionCompletedSubject.asObservable();

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
          this.progressSubject.next([]);
          const reportMessage: ResearchResultMessage = JSON.parse(message.body);
          this.reportSubject.next(reportMessage.report);
          // Emit sessionId so consumers (sidebar) can refresh
          this.sessionCompletedSubject.next(reportMessage.sessionId);
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
    this.sessionCompletedSubject.complete();
  }

  startResearch(topic: string): void {
    if (!this.isConnectedSubject.value) {
      console.error('Not connected to STOMP broker');
      return;
    }

    const message: ResearchRequestMessage = { researchTopic: topic };
    this.stompClient.publish({
      destination: '/app/research',
      body: JSON.stringify(message),
    });
  }

  clearReport(): void {
    this.reportSubject.next(null);
  }

  clearProgress(): void {
    this.progressSubject.next([]);
  }

  isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}