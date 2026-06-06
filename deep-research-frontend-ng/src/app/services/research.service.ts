import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResearchRequestMessage {
  researchTopic: string;
  sessionId?: string;
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

  private isSearchingSubject = new BehaviorSubject<boolean>(false);
  isSearching$ = this.isSearchingSubject.asObservable();

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
          this.isSearchingSubject.next(false);
          const reportMessage: ResearchResultMessage = JSON.parse(message.body);
          this.reportSubject.next(reportMessage.report);
          // Emit sessionId so consumers (sidebar) can refresh
          this.sessionCompletedSubject.next(reportMessage.sessionId);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.headers['message'] || frame.body);
        this.isSearchingSubject.next(false);
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP broker');
        this.isConnectedSubject.next(false);
        this.isSearchingSubject.next(false);
      },
    });

    this.stompClient.activate();
  }

  ngOnDestroy(): void {
    this.stompClient.deactivate();
    this.sessionCompletedSubject.complete();
  }

  startResearch(topic: string, sessionId?: string): void {
    if (!this.isConnectedSubject.value) {
      console.error('Not connected to STOMP broker');
      return;
    }

    this.isSearchingSubject.next(true);

    const message: ResearchRequestMessage = {
      researchTopic: topic,
      ...(sessionId ? { sessionId } : {}),
    };
    this.stompClient.publish({
      destination: '/app/research',
      body: JSON.stringify(message),
    });
  }

  clearReport(): void {
    this.reportSubject.next(null);
    this.isSearchingSubject.next(false);
  }

  clearProgress(): void {
    this.progressSubject.next([]);
    this.isSearchingSubject.next(false);
  }

  isConnected(): boolean {
    return this.isConnectedSubject.value;
  }
}