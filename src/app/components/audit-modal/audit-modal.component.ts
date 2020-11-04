import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { AuditLog } from 'src/app/models/audit-log.model';

import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { NestedValuePipe } from 'src/app/pipes/nested-value.pipe';
import { TripKindPipe } from 'src/app/pipes/trip-kind.pipe';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-audit-modal',
  templateUrl: './audit-modal.component.html',
  styleUrls: ['./audit-modal.component.scss'],
  providers: [NestedValuePipe, TripKindPipe]
})
export class AuditModalComponent implements OnInit, OnDestroy {
  @Input() tripId: string;

  public auditLogging = [];
  public isLoading = false;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    public activeModal: NgbActiveModal,
    public nestedValue: NestedValuePipe
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.httpClient.get<Array<AuditLog>>(
      `${this.env.apiUrl}/audit-logs`,
      { params: { trip_id: this.tripId }}).subscribe(
        response => {
          const result = response['results'].sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp ? 1 : 0));
          this.isLoading = false;
          this.auditLogging = result;
        },
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.auditLogging = [];
  }
}
