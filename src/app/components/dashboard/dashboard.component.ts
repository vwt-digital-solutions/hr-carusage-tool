import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Trip } from 'src/app/models/trip';
import { EnvService } from 'src/app/services/env/env.service';

import { GridOptions, AgGridEvent, ValueFormatterParams, RowEvent } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe, LicensePlatePipe]
})

export class DashboardComponent {
  private gridApi;
  private gridColumnApi;

  public gridOptions: GridOptions;
  public overlayNoRowsTemplate: string;
  public locations: Array<Trip> = [];

  public activeTrip: Trip = null;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
    private datePipe: DatePipe,
    private licensePlatePipe: LicensePlatePipe
  ) {
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: false
      },
      columnDefs: [
        {
          headerName: 'Starttijd',
          field: 'started_at',
          sort: 'asc',
          valueFormatter: (params: ValueFormatterParams): string => {
            if (!isNaN(Date.parse(params.value))) {
              return this.datePipe.transform(params.value, 'dd-MM-yyyy HH:mm');
            } else {
              return 'N/B';
            }
          }
        },
        {
          headerName: 'Eindtijd',
          field: 'ended_at',
          valueFormatter: (params: ValueFormatterParams): string => {
            if (!isNaN(Date.parse(params.value))) {
              return this.datePipe.transform(params.value, 'dd-MM-yyyy HH:mm');
            } else {
              return 'N/B';
            }
          }
        },
        {
          headerName: 'Kenteken',
          field: 'license',
          cellRenderer: (params: ValueFormatterParams): string => {
            const licensePlate = this.licensePlatePipe.transform(params.value);
            return `<span class="license-plate license-nl">${licensePlate}</span>`;
          }
        }
      ],
      domLayout: 'normal',
      rowSelection: 'single',
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'left' }
        ]
      }
    };

    this.overlayNoRowsTemplate = '<span class="alert alert-info" role="alert">Geen trips gevonden</span>';
  }

  onRowClicked(event: RowEvent): void | boolean {
    if (event === null || event === undefined) {
      return false;
    }
    this.activeTrip = event.data;
  }

  rowDataChangedHandler(event: AgGridEvent): void {
    if (!event.api.getRowNode('0')) {
      event.api.showNoRowsOverlay();
    }
  }

  onGridReady(event: AgGridEvent): void {
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;

    this.gridApi.addEventListener('rowDataChanged', this.rowDataChangedHandler);
    this.retrieveTripData();
  }

  async retrieveTripData(): Promise<void> {
    this.gridApi.showLoadingOverlay();

    const response = await this.httpClient.get<Array<Trip>>(`${this.env.apiUrl}/trips`).toPromise();
    this.gridApi.setRowData(('results' in response) ? response['results'] : []);

    this.gridApi.sizeColumnsToFit();
    this.gridApi.hideOverlay();
  }
}
