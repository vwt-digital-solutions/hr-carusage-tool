import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { AuditLog } from 'src/app/models/audit-log.model';

import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import * as dot from 'dot-object';

@Component({
  selector: 'app-audit-modal',
  templateUrl: './audit-modal.component.html',
  styleUrls: ['./audit-modal.component.scss']
})
export class AuditModalComponent implements OnInit, OnDestroy {
  @Input() tripId: string;

  public auditLogging = [];

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.httpClient.get<Array<AuditLog>>(
      `${this.env.apiUrl}/audit-logs`,
      { params: { trip_id: this.tripId }}).subscribe(
        response => this.processAuditLogging(response['results']),
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.auditLogging = [];
  }

  processAuditLogging(auditLogs: AuditLog[]): void {
    for (const log of auditLogs) {
      log['attributes_changed'] = dot.dot(log['attributes_changed']);
    }

    this.auditLogging = auditLogs.sort((a, b) => a.timestamp > b.timestamp ? -1 : (a.timestamp < b.timestamp ? 1 : 0));
  }

  getAttributeValue(log: AuditLog, attribute: string): string | null {
    if (attribute in log.attributes_changed) {
      if (typeof log.attributes_changed[attribute] === 'boolean') {
        return log.attributes_changed[attribute] ? 'Ja' : 'Nee';
      } else {
        return log.attributes_changed[attribute];
      }
    } else {
      return null;
    }
  }
}
