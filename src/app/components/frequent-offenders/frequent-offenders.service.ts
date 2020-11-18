import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { FrequentOffender } from 'src/app/models/frequent-offenders.model';

@Injectable({
  providedIn: 'root'
})

export class FrequentOffendersService {
  public offenders: Array<FrequentOffender> = [];

  private isInit = false;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
  ) { }

  getFrequentOffenders(): Array<FrequentOffender> {
    if (this.isInit) {
      return this.offenders;
    } else {
      return this.retrieveOffendersData();
    }
  }

  retrieveOffendersData(): Array<FrequentOffender> {
    const response = this.httpClient.get<Array<FrequentOffender>>(
      `${this.env.apiUrl}/data/frequent-offenders`).toPromise();

    console.log(response);

    this.offenders = 'results' in response ? response['results'] : [];
    this.isInit = true;

    return this.offenders;
  }
}
