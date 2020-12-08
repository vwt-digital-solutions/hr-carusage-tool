import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { FrequentOffender } from 'src/app/models/frequent-offenders.model';
import { ToastService } from 'src/app/services/toast.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class FrequentOffendersService {
  private offenders$: BehaviorSubject<FrequentOffender[]> = new BehaviorSubject(null);

  public offenders = this.offenders$.asObservable();
  public isInit = false;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    private toastService: ToastService
  ) { }

  retrieveOffendersData(): void {
    this.httpClient.get<Array<FrequentOffender>>(
      `${this.env.apiUrl}/data/frequent-offenders`).subscribe(
        response => {
          this.offenders$.next('results' in response ? response['results'] : []);
          this.isInit = true;
        }, error => this.handleError(error)
      );
  }

  handleError(error: HttpErrorResponse): void {
    this.toastService.show(
      'detail' in error.error ? error.error['detail'] : null, 'Veelplegers',
      { classname: 'toast-danger', delay: 10000});
    this.offenders$.next([]);
  }
}
