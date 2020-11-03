import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-approve-modal',
  templateUrl: './approve-modal.component.html',
  styleUrls: ['./approve-modal.component.scss']
})
export class ApproveModalComponent {
  @ViewChild('descriptionInput') descriptionInput: ElementRef;
  @Input() tripKind: string;

  public descriptionInputValue: NgModel;
  public isNotValid = false;

  constructor(public activeModal: NgbActiveModal) {}

  passBack(isSave: boolean): void {
    if (isSave && this.tripKind === 'personal' && !this.descriptionInputValue) {
      this.isNotValid = true;
    } else {
      this.activeModal.close({
        saving: isSave,
        tripKind: this.tripKind,
        value: this.descriptionInputValue
      });
    }
  }
}
