import { NgModule } from '@angular/core';
import { CalculatorComponent } from './calculator.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { PopupComponent } from './popup/popup.component';

@NgModule({
  declarations: [CalculatorComponent, PopupComponent],
  imports: [FormsModule, CommonModule, BrowserModule, HttpClientModule],
  exports: [CalculatorComponent],
})
export class CalculatorModule {}
