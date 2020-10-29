import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-approve-modal',
  templateUrl: './approve-modal.component.html',
  styleUrls: ['./approve-modal.component.scss']
})
export class ApproveModalComponent {
  @ViewChild('reasonInput') reasonInput: ElementRef;
  @Input() isCorrect: boolean;

  public reasonInputValue: NgModel;
  public isNotValid = false;

  constructor(public activeModal: NgbActiveModal) {}

  passBack(isSave: boolean): void {
    if (isSave && !this.isCorrect && !this.reasonInputValue) {
      this.isNotValid = true;
    } else {
      this.activeModal.close({
        saving: isSave,
        correct: this.isCorrect,
        value: this.reasonInputValue
      });
    }
  }
}
