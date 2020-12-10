import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Trip } from 'src/app/models/trip.model';
import { FrequentOffender } from 'src/app/models/frequent-offenders.model';
import { EnvService } from 'src/app/services/env/env.service';

import { GridOptions, AgGridEvent, ValueFormatterParams, RowNode, ValueGetterParams, GridApi, ColumnApi } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import * as moment from 'moment';
import { saveAs } from 'file-saver';

import { agGridLocaleNL } from 'src/assets/locale/locale.nl';
import { ActivatedRoute, Router } from '@angular/router';
import { FrequentOffendersService } from 'src/app/services/frequent-offenders.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe, LicensePlatePipe]
})

export class DashboardComponent {
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  public isManager = true;

  public gridOptions: GridOptions;
  public overlayNoRowsTemplate: string;
  public locations: Array<Trip> = [];

  public frequentOffenders: Array<FrequentOffender> = [];

  public activeTrip: Trip = null;
  public activeIndexInfo = {current: null, min: 0, max: null, total: null};
  public isLoading = false;
  public isError = false;
  public errorMessage = null;

  public now = moment().subtract(1, 'weeks');
  public dynamicMoment = moment().subtract(1, 'weeks');
  public weekHasNext = this.canSeeFuture;
  public weekHasPrev = true;

  public activeFilter = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private env: EnvService,
    private httpClient: HttpClient,
    private toastService: ToastService,
    private offendersService: FrequentOffendersService,
    private datePipe: DatePipe,
    private licensePlatePipe: LicensePlatePipe
  ) {
    this.isManager = route.snapshot.data['isManager'];
    if (!this.isManager) {
      this.weekHasNext = this.canSeeFuture;
    }

    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: false
      },
      columnDefs: [
        {
          headerName: '',
          field: 'checking_info.trip_kind',
          pinned: 'left',
          maxWidth: 60,
          cellStyle: {textAlign: 'center'},
          suppressSizeToFit: true,
          suppressMenu: true,
          sortable: false,
          cellRenderer: (params: ValueFormatterParams): string => {
            if (params.value !== null) {
              return params.value === 'work' ?
              `<span class="fa-stack fa-xs" title="Zakelijke rit"><i class="fas fa-circle fa-stack-2x success"></i><i class="fas fa-briefcase fa-stack-1x fa-inverse"></i></span>` :
              `<span class="fa-stack fa-xs" title="Privérit"><i class="fas fa-circle fa-stack-2x danger"></i><i class="fas fa-user fa-stack-1x fa-inverse"></i></span>`;
            }
          }
        },
        {
          headerName: 'Starttijd',
          children: [
            {
              headerName: 'Datum',
              field: 'started_at',
              sort: 'asc',
              filter: 'agDateColumnFilter',
              filterParams: {
                filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange'],
                inRangeInclusive: true,
                comparator: this.dateComparator
              },
              valueGetter: (params: ValueGetterParams): string => {
                return !isNaN(Date.parse(params.data.started_at)) ?
                  this.datePipe.transform(params.data.started_at, 'MM/dd/yyyy') :
                  null;
              },
              cellRenderer: (params: ValueFormatterParams): string => {
                return params.value != null ?
                  this.datePipe.transform(params.value, 'dd-MM-yyyy') :
                  'N/B';
              }
            },
            {
              headerName: 'Tijd',
              field: 'started_at',
              sort: 'asc',
              filter: null,
              valueGetter: (params: ValueGetterParams): string => {
                return !isNaN(Date.parse(params.data.started_at)) ?
                  this.datePipe.transform(params.data.started_at, 'HH:mm') :
                  'N/B';
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
              filterParams: {
                filterOptions: ['equals', 'notEqual', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual', 'inRange'],
                inRangeInclusive: true,
                comparator: this.dateComparator
              },
              valueGetter: (params: ValueGetterParams): string => {
                return !isNaN(Date.parse(params.data.ended_at)) ?
                  this.datePipe.transform(params.data.ended_at, 'MM/dd/yyyy') :
                  null;
              },
              cellRenderer: (params: ValueFormatterParams): string => {
                return params.value != null ?
                  this.datePipe.transform(params.value, 'dd-MM-yyyy') :
                  'N/B';
              }
            },
            {
              headerName: 'Tijd',
              field: 'ended_at',
              sort: 'asc',
              filter: null,
              valueGetter: (params: ValueGetterParams): string => {
                return !isNaN(Date.parse(params.data.ended_at)) ?
                  this.datePipe.transform(params.data.ended_at, 'HH:mm') :
                  'N/B';
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
          field: 'department.department_name'
        }
      ],
      domLayout: 'normal',
      rowSelection: 'single',
      pagination: true,
      paginationAutoPageSize: true,
      localeTextFunc: (key: string, defaultValue: string) =>  agGridLocaleNL[key] || defaultValue,
      rowClassRules: {
        'ag-row-exported': (params) => {
          return params.data['exported']['exported_at'] === null ? false : true;
        }
      },
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalRowCountComponent', align: 'left' },
          { statusPanel: 'agFilteredRowCountComponent', align: 'left' }
        ]
      }
    };

    this.overlayNoRowsTemplate = '<span class="alert alert-primary" role="alert"><i class="fas fa-magic mr-2"></i> Geen ritten gevonden</span>';
  }

  dateComparator(filterLocalDateAtMidnight: string, cellValue: string): number {
    const filterDate = new Date(filterLocalDateAtMidnight);
    const cellDate = new Date(cellValue);

    if (filterDate.getTime() === cellDate.getTime()) {
      return 0;
    } else if (cellDate < filterDate) {
      return -1;
    } else if (cellDate > filterDate) {
      return 1;
    }
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

  onIndexChange(event: {index: number, trip: Trip, approving: boolean}): void {
    let newIndex = this.gridApi.getSelectedNodes()[0].rowIndex + event.index;
    this.gridApi.getSelectedNodes()[0].setData(event.trip);

    this.gridApi.forEachNodeAfterFilterAndSort((rowNode: RowNode, index: number) => {
      if (index === newIndex) {
        if (event.approving && rowNode.data.checking_info.trip_kind !== null) {
          newIndex += 1;
        } else {
          rowNode.setSelected(true, true);
        }
      }
    });
  }

  onFilterChanged(): void {
    this.activeIndexInfo.max = this.getTotalFilteredNodeCount;
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
    this.offendersService.retrieveOffendersData();
    this.retrieveTripData();
  }

  get getTotalFilteredNodeCount(): number {
    const rowData = [];
    this.gridApi.forEachNodeAfterFilterAndSort(node => rowData.push(node.data));
    return rowData.length;
  }

  get getTotalNodeCount(): number {
    const rowData = [];
    this.gridApi.forEachNode(node => rowData.push(node.data));
    return rowData.length;
  }

  get hasNoRows(): boolean {
    return this.activeIndexInfo.total === 0 ? true : false;
  }

  get canSeeFuture(): boolean {
    return ((this.env.environment === 'development' ? true : false) || !this.isManager) ? true : false;
  }

  retrieveTripData(): void {
    this.activeFilter = null;
    this.isError = false;
    this.isLoading = true;
    this.gridApi.showLoadingOverlay();

    const url = this.isManager ? '/trips/managers' : '/trips';

    this.httpClient.get<Array<Trip>>(
      `${this.env.apiUrl}/data${url}`,
      { params: {
        ended_after: this.currentWeekStartTimestamp,
        ended_before: this.currentWeekEndTimestamp
      }}).subscribe(
        response => {
          this.gridApi.setRowData(('results' in response) ? response['results'] : []);
          this.activeIndexInfo.total = this.getTotalNodeCount;
          this.activeIndexInfo.max = this.getTotalFilteredNodeCount;

          this.gridColumnApi.autoSizeAllColumns();

          this.gridApi.hideOverlay();
          this.isLoading = false;
        }, error => {
          this.handleError(error, 'Ophalen ritten');
          this.gridApi.showNoRowsOverlay();
        }
      );
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

  get isActiveWeek(): boolean {
    return this.now.startOf('week').toISOString() === this.dynamicMoment.startOf('week').toISOString() ? true : false;
  }

  changeWeek(action: number): void {
    if (!this.isLoading) {
      if (action > 0 && !this.weekHasNext) {
        return;
      } else {
        this.gridApi.deselectAll();
        this.activeTrip = null;

        if (action < 0) {
          this.dynamicMoment = this.dynamicMoment.subtract(1, 'weeks');
        } else if (action > 0) {
          this.dynamicMoment = this.dynamicMoment.add(1, 'weeks');
        } else {
          this.dynamicMoment = moment().subtract(1, 'weeks');
        }

        this.weekHasNext = this.isActiveWeek ?
        (this.canSeeFuture) : true;

        this.retrieveTripData();
      }
    }
  }

  exportTrips(): void {
    if (confirm(
        'Weet je zeker dat je de huidige week wilt afsluiten en exporteren? ' +
        'Dit kan niet ongedaan worden gemaakt!')) {
      const toastTitle = 'Ritten exporteren';
      this.isError = false;
      this.isLoading = true;
      this.gridApi.deselectAll();
      this.gridApi.showLoadingOverlay();

      const headers = new HttpHeaders({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const params = {
        ended_after: this.currentWeekStartTimestamp,
        ended_before: this.currentWeekEndTimestamp
      };

      this.httpClient.get<Blob>(
        `${this.env.apiUrl}/exports/trips`,
        { headers, params, observe: 'response', responseType: 'blob' as 'json'}).subscribe(
          response => {
            if (response.status === 200) {
              const matches = /(?:filename=)([\w\d-_.]*)/g.exec(
                response.headers.get('content-disposition'));
              saveAs(response.body, matches && matches.length > 1 ? matches[1] : null);
            } else {
              this.toastService.show(
                'Er zijn geen ritten om te exporteren voor de actieve week', toastTitle,
                { classname: 'toast-info' });
            }

            this.gridApi.hideOverlay();
            this.isLoading = false;
          }, error => this.handleError(error, toastTitle)
        );
    }
  }

  checkTrips(): void {
    const toastTitle = 'Niet geëxporteerde ritten';
    this.isError = false;
    this.isLoading = true;
    this.gridApi.deselectAll();
    this.gridApi.showLoadingOverlay();

    const headers = new HttpHeaders({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const params = {
      ended_after: this.currentWeekStartTimestamp,
      ended_before: this.currentWeekEndTimestamp
    };

    this.httpClient.get<Blob>(
      `${this.env.apiUrl}/checks/open-trips`,
      { headers, params, observe: 'response', responseType: 'blob' as 'json'}).subscribe(
        response => {
          if (response.status === 200) {
            const matches = /(?:filename=)([\w\d-_.]*)/g.exec(
              response.headers.get('content-disposition'));
            saveAs(response.body, matches && matches.length > 1 ? matches[1] : null);
          } else {
            this.toastService.show(
              'Er zijn geen niet-geëxporteerde ritten voor de actieve week', toastTitle,
              { classname: 'toast-info' });
          }

          this.gridApi.hideOverlay();
          this.isLoading = false;
        }, error => this.handleError(error, toastTitle)
      );
  }

  handleError(error: HttpErrorResponse, title: string): void {
    if (error.status === 406) {
      this.toastService.show(
        'Niet elke rit is gecontroleerd', title, { classname: 'toast-warning'});
    } else if ('detail' in error.error) {
      this.toastService.show(error.error['detail'], title, { classname: 'toast-danger', delay: 10000});
    } else {
      this.toastService.show(error.error, title, { classname: 'toast-danger', delay: 10000});
    }

    this.isLoading = false;
    this.isError = true;
    this.gridApi.hideOverlay();
  }

  toggleFilter(name: string): void {
    let model = {};
    this.activeFilter = name;

    if (name === 'checked') {
      model['checking_info.trip_kind'] = {
        filterType: 'set',
        values: [null]
      };
    } else if (name === 'personal') {
      model['checking_info.trip_kind'] = {
        filterType: 'set',
        values: ['personal']
      };
    } else if (name === 'work') {
      model['checking_info.trip_kind'] = {
        filterType: 'set',
        values: ['work']
      };
    } else {
      model = null;
    }

    this.gridApi.deselectAll();
    this.gridApi.setFilterModel(model);
  }
}
