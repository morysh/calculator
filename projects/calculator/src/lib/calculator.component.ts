import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiResponse } from './types';

@Component({
  selector: 'glady-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent {
  private _error = '';

  @Input() host?: string;
  @Input() shopId?: number;
  @Input() authToken?: string;
  @Output() selectedAmount = new EventEmitter();

  amount = 0;
  cards: number[] = [];

  question = false;
  choices?: number[];

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

  submit() {
    this.http
      .get<ApiResponse>(`${this.host}/shop/${this.shopId}/search-combination`, {
        headers: new HttpHeaders().set('Authorization', this.authToken!),
        params: new HttpParams().set('amount', this.amount),
      })
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: () => this.handleError(),
      });
  }

  handleResponse(response: ApiResponse) {
    if (response.equal) {
      this.cards = response.equal.cards;
      this.selectedAmount.emit(this.amount);
    } else if (response.floor && response.ceil) {
      this.question = true;
      this.choices = [response.floor.value, response.ceil.value];
    } else if (response.floor) {
      this.amount = response.floor.value;
      this.cards = response.floor.cards;
      this.selectedAmount.emit(this.amount);
    } else if (response.ceil) {
      this.amount = response.ceil.value;
      this.cards = response.ceil.cards;
      this.selectedAmount.emit(this.amount);
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
}
