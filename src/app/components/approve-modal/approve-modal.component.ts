import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NestedValuePipe } from 'src/app/pipes/nested-value.pipe';

@Component({
  selector: 'app-approve-modal',
  templateUrl: './approve-modal.component.html',
  styleUrls: ['./approve-modal.component.scss'],
  providers: [NestedValuePipe]
})
export class ApproveModalComponent {
  @ViewChild('descriptionInput') descriptionInput: ElementRef;
  @Input() tripKind: string;
  @Input() descriptionValue: NgModel;

  public isNotValid = false;

  constructor(public activeModal: NgbActiveModal) {}

  passBack(isSave: boolean): void {
    if (isSave && this.tripKind === 'personal' && !this.descriptionValue) {
      this.isNotValid = true;
    } else {
      this.activeModal.close({
        saving: isSave,
        tripKind: this.tripKind,
        value: this.descriptionValue
      });
    }
  }
}
