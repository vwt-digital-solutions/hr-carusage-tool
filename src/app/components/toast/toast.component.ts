import { Component } from '@angular/core';

import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: 'app-toasts',
  templateUrl: './toast.component.html',
  host: {'[class.ngb-toasts]': 'true'}
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
