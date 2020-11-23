import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = [];

  show(message: string, title: string, options: Record<string, unknown> = {}): void {
    this.toasts.push({ message, title, ...options });
  }

  remove(toast: Record<string, unknown>): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
