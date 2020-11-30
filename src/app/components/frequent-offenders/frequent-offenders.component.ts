import { Component } from '@angular/core';

import { AgGridEvent, ColumnApi, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';

import { LicensePlatePipe } from 'src/app/pipes/license-plate.pipe';
import { FrequentOffendersService } from 'src/app/services/frequent-offenders.service';
import { ToastService } from 'src/app/services/toast.service';

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

  public isLoading = false;
  public isError = false;

  constructor(
    private licensePlatePipe: LicensePlatePipe,
    private offendersService: FrequentOffendersService,
    private toastService: ToastService
  ) {
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: false
      },
      columnDefs: [
        {
          headerName: 'Bestuurder',
          children: [
            {
              headerName: 'Achternaam',
              field: 'driver_info.driver_last_name'
            },
            {
              headerName: 'Voornaam',
              field: 'driver_info.driver_first_name'
            },
            {
              headerName: 'Personeelsnummer',
              field: 'driver_info.driver_employee_number'
            }
          ]
        },
        {
          headerName: 'Afdeling',
          children: [
            {
              headerName: 'Naam',
              field: 'department.department_name'
            },
            {
              headerName: 'Nummer',
              field: 'department.department_id'
            }
          ]
        },
        {
          headerName: 'Totale overtredingen',
          field: 'trips',
          cellRenderer: (params: ValueFormatterParams): string => {
            return params.value.length;
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
    this.gridApi.showLoadingOverlay();

    if (!this.offendersService.isInit) {
      this.toastService.show(
        'Een bestuurder wordt "veelpleger" genoemd als hij of zij in twee maanden drie maal een privérit rijd',
        'Veelplegers', {delay: 10000});
    }

    this.gridApi.addEventListener('rowDataChanged', this.rowDataChangedHandler);
    this.offendersService.retrieveOffendersData();
    this.offendersService.offenders.subscribe(
      data => {
        if (data) {
          this.gridApi.setRowData(data);
          this.gridColumnApi.autoSizeAllColumns();

          this.gridApi.hideOverlay();
          this.isLoading = false;
        }
      }
    );
  }
}
