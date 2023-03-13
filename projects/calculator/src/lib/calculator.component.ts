import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiResponse } from './types';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'glady-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CalculatorComponent,
    },
  ],
})
export class CalculatorComponent implements ControlValueAccessor, Validator {
  private _error = '';

  @Input() host?: string;
  @Input() shopId?: number;
  @Input() authToken?: string;
  @Output() selectedAmount = new EventEmitter();

  amount = 0;
  cards: number[] = [];

  question = false;
  choices?: number[];

  touched = false;
  disabled = false;

  constructor(private http: HttpClient) {}

  public get error(): string {
    return this._error;
  }

  public set error(error: string) {
    this._error = error;
    setTimeout(() => {
      this._error = '';
    }, 5000);
  }

  onChange = (amount: number) => {};
  onTouched = () => {};

  submit() {
    this.getApiCall(this.amount).subscribe({
      next: (response) => this.handleResponse(response),
      error: () => this.handleError(),
    });
  }

  handleResponse(response: ApiResponse) {
    this.markAsTouched();

    if (response.equal) {
      this.cards = response.equal.cards;
      this.amountChanged();
    } else if (response.floor && response.ceil) {
      this.question = true;
      this.choices = [response.floor.value, response.ceil.value];
    } else if (response.floor) {
      this.amount = response.floor.value;
      this.cards = response.floor.cards;
      this.amountChanged();
    } else if (response.ceil) {
      this.amount = response.ceil.value;
      this.cards = response.ceil.cards;
      this.amountChanged();
    }
  }

  handleError() {
    this.error = 'Erreur lors de la communication avec le serveur';
  }

  handleUserChoice(response: number) {
    this.question = false;
    this.amount = response;
    this.submit();
  }

  next() {
    // Add random decimal to force computing of next value
    this.getApiCall(this.amount + 0.5).subscribe({
      next: (response) => {
        if (response.ceil) {
          this.amount = response.ceil.value;
          this.cards = response.ceil.cards;
          this.markAsTouched();
          this.amountChanged();
        } else {
          this.error = 'Montant maximum atteint';
        }
      },
      error: () => this.handleError(),
    });
  }

  previous() {
    // Substract random decimal to force computing of next value
    this.getApiCall(this.amount - 0.5).subscribe({
      next: (response) => {
        if (response.floor) {
          this.amount = response.floor.value;
          this.cards = response.floor.cards;
          this.markAsTouched();
          this.amountChanged();
        } else {
          this.error = 'Montant minimum atteint';
        }
      },
      error: () => this.handleError(),
    });
  }

  getApiCall(amount: number) {
    return this.http.get<ApiResponse>(
      `${this.host}/shop/${this.shopId}/search-combination`,
      {
        headers: new HttpHeaders().set('Authorization', this.authToken!),
        params: new HttpParams().set('amount', amount),
      }
    );
  }

  amountChanged() {
    this.selectedAmount.emit(this.amount);
    this.onChange(this.amount);
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(amount: any): void {
    this.amount = amount;
    this.selectedAmount.emit(this.amount);
    this.submit;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState?(disabled: boolean): void {
    this.disabled = disabled;
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    const amount = control.value;
    if (amount < 0) {
      return {
        mustBePositive: {
          amount,
        },
      };
    } else {
      return null;
    }
  }
}
