import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Trip } from 'src/app/models/trip.model';
import { EnvService } from 'src/app/services/env/env.service';

import { GridOptions, AgGridEvent, ValueFormatterParams, RowNode, ValueGetterParams, GridApi, ColumnApi } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import * as moment from 'moment';

import { agGridLocaleNL } from 'src/assets/locale/locale.nl';

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
  public isLoading = false;

  public now = moment();
  public dynamicMoment = moment().subtract(1, 'weeks');
  public weekHasNext = true;
  public weekHasPrev = true;

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
        },
        {
          headerName: 'Afdeling',
          field: 'driver_info.department.name'
        },
      ],
      domLayout: 'normal',
      rowSelection: 'single',
      pagination: true,
      paginationAutoPageSize: true,
      localeTextFunc: (key: string, defaultValue: string) =>  agGridLocaleNL[key] || defaultValue,
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'left' }
        ]
      }
    };

    this.overlayNoRowsTemplate = '<span class="alert alert-primary" role="alert">Geen ritten gevonden</span>';
  }

  onSelectionChanged(event: AgGridEvent): void | boolean {
    if (event === null || event === undefined) {
      return false;
    }

    const selectedNodes = event.api.getSelectedNodes();
    if (selectedNodes.length > 0) {
      this.rowDataSetPage(selectedNodes[0].rowIndex);
      this.activeIndexInfo.current = selectedNodes[0].rowIndex;
      this.activeTrip = selectedNodes[0].data;
    } else {
      this.activeTrip = null;
    }
  }

  onGridSizeChanged(event: AgGridEvent): void {
    event.columnApi.autoSizeAllColumns();
  }

  onIndexChange(event: number): void {
    const newIndex = this.gridApi.getSelectedNodes()[0].rowIndex + event;

    this.gridApi.forEachNodeAfterFilterAndSort((rowNode: RowNode, index: number) => {
      if (index === newIndex) {
        rowNode.setSelected(true, true);
      }
    });
  }

  rowDataSetPage(index: number): void {
    const pageSize = this.gridApi.paginationGetPageSize();
    const pageNumber = Math.floor(index / pageSize);

    if (this.gridApi.paginationGetCurrentPage() !== pageNumber) {
      this.gridApi.paginationGoToPage(pageNumber);
    }
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
    this.isLoading = true;
    this.gridApi.showLoadingOverlay();

    const response = await this.httpClient.get<Array<Trip>>(
      `${this.env.apiUrl}/trips`,
      { params: {
        ended_after: this.currentWeekStartTimestamp,
        ended_before: this.currentWeekEndTimestamp,
        outside_time_window: 'true'
      }}).toPromise();
    this.gridApi.setRowData(('results' in response) ? response['results'] : []);
    this.activeIndexInfo.max = this.getTotalNodeCount;

    this.gridColumnApi.autoSizeAllColumns();

    this.gridApi.hideOverlay();
    this.isLoading = false;
  }

  get currentWeekStartTimestamp(): string {
    return `${this.dynamicMoment.startOf('week').format('YYYY-MM-DD')}T00:00:00Z`;
  }

  get currentWeekEndTimestamp(): string {
    return `${this.dynamicMoment.endOf('week').format('YYYY-MM-DD')}T23:59:59Z`;
  }

  get currentWeekStartDate(): string {
    return this.dynamicMoment.startOf('week').format('YYYY-MM-DD');
  }

  get currentWeekEndDate(): string {
    return this.dynamicMoment.endOf('week').format('YYYY-MM-DD');
  }

  get currentWeekNumber(): string {
    return this.dynamicMoment.format('w');
  }

  get isCurrentWeek(): boolean {
    return this.now.startOf('week').toISOString() === this.dynamicMoment.startOf('week').toISOString() ? true : false;
  }

  changeWeek(action: number): void {
    this.gridApi.deselectAll();
    this.activeTrip = null;

    if (action < 0) {
      this.dynamicMoment = this.dynamicMoment.subtract(1, 'weeks');
    } else if (action > 0) {
      this.dynamicMoment = this.dynamicMoment.add(1, 'weeks');
    } else {
      this.dynamicMoment = moment();
    }

    this.weekHasNext = this.isCurrentWeek ? false : true;

    this.retrieveTripData();
  }
}
