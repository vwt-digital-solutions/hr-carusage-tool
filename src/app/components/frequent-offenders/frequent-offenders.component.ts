import { Component } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env/env.service';

import { AgGridEvent, ColumnApi, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import { FrequentOffender } from 'src/app/models/frequent-offenders.model';

import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import { agGridLocaleNL } from 'src/assets/locale/locale.nl';

@Component({
  selector: 'app-frequent-offenders',
  templateUrl: './frequent-offenders.component.html',
  styleUrls: ['./frequent-offenders.component.scss'],
  providers: [LicensePlatePipe]
})
export class FrequentOffendersComponent {
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  public gridOptions: GridOptions;
  public overlayNoRowsTemplate: string;
  public offenders: Array<FrequentOffender> = [];

  public isLoading = false;
  public isError = false;

  constructor(
    private env: EnvService,
    private httpClient: HttpClient,
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
          headerName: 'Achternaam',
          field: 'offender_info.last_name'
        },
        {
          headerName: 'Afdeling',
          field: 'offender_info.department_name'
        },
        {
          headerName: 'Kenteken',
          field: 'license',
          cellRenderer: (params: ValueFormatterParams): string => {
            const licensePlate = this.licensePlatePipe.transform(params.value);
            return `<span class="license-plate license-nl">${licensePlate}</span>`;
          }
        },
      ],
      domLayout: 'normal',
      rowSelection: null,
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

    this.overlayNoRowsTemplate = '<span class="alert alert-primary" role="alert"><i class="fas fa-magic mr-2"></i> Geen veelplegers gevonden</span>';
  }

  onGridSizeChanged(event: AgGridEvent): void {
    event.columnApi.autoSizeAllColumns();
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
    this.retrieveOffendersData();
  }

  retrieveOffendersData(): void {
    this.isError = false;
    this.isLoading = true;
    this.gridApi.showLoadingOverlay();

    this.httpClient.get<Array<FrequentOffender>>(
      `${this.env.apiUrl}/data/frequent-offenders`).subscribe(
        response => {
          this.gridApi.setRowData(('results' in response) ? response['results'] : []);

          this.gridColumnApi.autoSizeAllColumns();

          this.gridApi.hideOverlay();
          this.isLoading = false;
        }, error => {
          console.log(error);
          this.gridApi.hideOverlay();
          this.gridApi.showNoRowsOverlay();
          this.isLoading = false;
          this.isError = true;
        }
      );
  }
}
