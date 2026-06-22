import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private userUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { message });
  }

  // ✅ save user details
  saveUserDetails(details: { username: string; email: string; phone: string; issue: string; userId?: string }): Observable<any> {
    return this.http.post(this.userUrl, details);
  }

  // ✅ get all users for dashboard
  getAllUsers(): Observable<any> {
    return this.http.get(this.userUrl);
  }

  // ✅ update user status
  updateUserStatus(id: string | number, status: string): Observable<any> {
    return this.http.patch(`${this.userUrl}/${id}/status`, { status });
  }
}