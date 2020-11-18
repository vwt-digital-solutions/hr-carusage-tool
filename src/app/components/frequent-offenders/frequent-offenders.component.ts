import { Component } from '@angular/core';

import { AgGridEvent, ColumnApi, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';

import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';

import { agGridLocaleNL } from 'src/assets/locale/locale.nl';
import { FrequentOffendersService } from './frequent-offenders.service';

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

  public isLoading = false;
  public isError = false;

  constructor(
    private licensePlatePipe: LicensePlatePipe,
    private offendersService: FrequentOffendersService
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
    this.gridApi.setRowData(this.offendersService.getFrequentOffenders());

    this.gridColumnApi.autoSizeAllColumns();

    this.gridApi.hideOverlay();
    this.isLoading = false;
  }
}
