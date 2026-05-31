import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResearchSessionSummary {
  id: string;
  name: string;
  pinned: boolean;
  createdAt: string;
  entryCount: number;
}

export interface ResearchEntry {
  id: string;
  sessionId: string;
  query: string;
  reportJson: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  listSessions(): Observable<ResearchSessionSummary[]> {
    return this._http.get<ResearchSessionSummary[]>(`${this._apiUrl}/api/sessions`);
  }

  renameSession(id: string, name: string): Observable<void> {
    return this._http.patch<void>(`${this._apiUrl}/api/sessions/${id}`, { name });
  }

  pinSession(id: string, pinned: boolean): Observable<void> {
    return this._http.put<void>(`${this._apiUrl}/api/sessions/${id}/pin`, null, {
      params: { pinned: String(pinned) }
    });
  }

  deleteSession(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/api/sessions/${id}`);
  }

  restoreSession(id: string): Observable<void> {
    return this._http.put<void>(`${this._apiUrl}/api/sessions/${id}/restore`, null);
  }

  getSessionEntries(id: string): Observable<ResearchEntry[]> {
    return this._http.get<ResearchEntry[]>(`${this._apiUrl}/api/sessions/${id}/entries`);
  }
}