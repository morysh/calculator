import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'glady-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent {
  @Input() choices?: number[];
  @Output() response = new EventEmitter<number>();

  choose(choice: number) {
    this.response.emit(choice);
  }
}
