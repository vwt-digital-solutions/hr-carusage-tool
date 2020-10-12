import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Trip } from 'src/app/models/trip.model';
import { EnvService } from 'src/app/services/env/env.service';

import { GridOptions, AgGridEvent, ValueFormatterParams, RowNode, ValueGetterParams, GridApi, ColumnApi } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe, LicensePlatePipe]
})

export class DashboardComponent {
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  public gridOptions: GridOptions;
  public overlayNoRowsTemplate: string;
  public locations: Array<Trip> = [];

  public activeTrip: Trip = null;
  public activeIndexInfo = {current: null, min: 0, max: null};

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
          children: [
            {
              headerName: 'Datum',
              field: 'started_at',
              sort: 'asc',
              filter: 'agDateColumnFilter',
              valueGetter: (params: ValueGetterParams): string => {
                if (!isNaN(Date.parse(params.data.started_at))) {
                  return this.datePipe.transform(params.data.started_at, 'dd-MM-yyyy');
                } else {
                  return 'N/B';
                }
              }
            },
            {
              headerName: 'Tijd',
              field: 'started_at',
              sort: 'asc',
              valueGetter: (params: ValueGetterParams): string => {
                if (!isNaN(Date.parse(params.data.started_at))) {
                  return this.datePipe.transform(params.data.started_at, 'HH:mm');
                } else {
                  return 'N/B';
                }
              }
            }
          ]
        },
        {
          headerName: 'Eindtijd',
          children: [
            {
              headerName: 'Datum',
              field: 'ended_at',
              sort: 'asc',
              filter: 'agDateColumnFilter',
              valueGetter: (params: ValueGetterParams): string => {
                if (!isNaN(Date.parse(params.data.ended_at))) {
                  return this.datePipe.transform(params.data.ended_at, 'dd-MM-yyyy');
                } else {
                  return 'N/B';
                }
              }
            },
            {
              headerName: 'Tijd',
              field: 'ended_at',
              sort: 'asc',
              valueGetter: (params: ValueGetterParams): string => {
                if (!isNaN(Date.parse(params.data.ended_at))) {
                  return this.datePipe.transform(params.data.ended_at, 'HH:mm');
                } else {
                  return 'N/B';
                }
              }
            }
          ]
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

  onSelectionChanged(event: AgGridEvent): void | boolean {
    if (event === null || event === undefined) {
      return false;
    }
    const currentIndex = event.api.getSelectedNodes()[0];
    this.activeIndexInfo.current = currentIndex.rowIndex;
    this.activeTrip = currentIndex.data;
  }

  onGridSizeChanged(event: AgGridEvent): void {
    event.api.sizeColumnsToFit();
  }

  onIndexChange(event: number): void {
    const newIndex = this.gridApi.getSelectedNodes()[0].rowIndex + event;

    this.gridApi.forEachNodeAfterFilterAndSort((rowNode: RowNode, index: number) => {
      if (index === newIndex) {
        rowNode.setSelected(true, true);
      }
    });
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

  get getTotalNodeCount(): number {
    const rowData = [];
    this.gridApi.forEachNode(node => rowData.push(node.data));
    return rowData.length - 1;
  }

  async retrieveTripData(): Promise<void> {
    this.gridApi.showLoadingOverlay();

    const response = await this.httpClient.get<Array<Trip>>(`${this.env.apiUrl}/trips`).toPromise();
    this.gridApi.setRowData(('results' in response) ? response['results'] : []);
    this.activeIndexInfo.max = this.getTotalNodeCount;

    this.gridApi.sizeColumnsToFit();
    this.gridApi.hideOverlay();
  }
}
