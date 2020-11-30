import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { AuditLog } from 'src/app/models/audit-log.model';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { NestedValuePipe } from 'src/app/pipes/nested-value.pipe';
import { TripKindPipe } from 'src/app/pipes/trip-kind.pipe';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast.service';

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
    private toastService: ToastService,
    public activeModal: NgbActiveModal,
    public nestedValue: NestedValuePipe
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.httpClient.get<Array<AuditLog>>(
      `${this.env.apiUrl}/data/audit-logs`,
      { params: { trip_id: this.tripId }}).subscribe(
        response => {
          const result = response['results'].sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp ? 1 : 0));
          this.isLoading = false;
          this.auditLogging = result;
        },
        error => this.handleError(error)
      );
  }

  handleError(error: HttpErrorResponse): void {
    this.toastService.show(
      'detail' in error.error ? error.error['detail'] : null, 'Audit logging',
      { classname: 'toast-danger'});

    this.isLoading = false;
  }

  isExportLog(log: AuditLog): boolean {
    return 'exported' in log.attributes_changed ? true : false;
  }

  ngOnDestroy(): void {
    this.auditLogging = [];
  }
}
