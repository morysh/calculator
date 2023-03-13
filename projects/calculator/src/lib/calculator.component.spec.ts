import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';

import { CalculatorComponent } from './calculator.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from './types';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculatorComponent, CalculatorComponent],
      imports: [HttpClientTestingModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(
      HttpTestingController as Type<HttpTestingController>
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call proper URL with proper parameter', () => {
    let amountInput = fixture.debugElement.query(
      By.css('input[name="amount"]')
    ).nativeElement;
    let form = fixture.debugElement.query(By.css('.amount-form')).nativeElement;

    component.host = 'https://dummy.com';
    component.shopId = 123;
    component.authToken = 'token';

    amountInput.value = 42;
    amountInput.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    httpMock.expectOne(
      `https://dummy.com/shop/123/search-combination?amount=42`
    );
  });

  it('should output proper amount', () => {
    // The component outputs the property value, not the return value so we need to set it
    component.amount = 42;

    let response = {
      equal: {
        value: 42,
        cards: [42],
      },
      floor: { value: 20, cards: [20] },
      ceil: { value: 60, cards: [30, 30] },
    };

    testReturnValue(42, response);
  });

  it('should output minimum amount when called with a value too low', () => {
    let response = {
      ceil: {
        value: 42,
        cards: [42],
      },
    };

    testReturnValue(42, response);
  });

  it('should output maximum amount when called with a value too high', () => {
    let response = {
      floor: {
        value: 42,
        cards: [42],
      },
    };

    testReturnValue(42, response);
  });

  it('should display cards', () => {
    let response = {
      floor: {
        value: 42,
        cards: [20, 22],
      },
    };

    submitFormAndRespond(response);

    fixture.detectChanges();
    let cards = fixture.debugElement
      .queryAll(By.css('.card'))
      .map((el) => el.nativeElement.textContent);

    expect(cards.length).toEqual(2);
    expect(cards).toContain('20€');
    expect(cards).toContain('22€');
  });

  it('should display error', () => {
    let options = { status: 400, statusText: 'Bad Request' };

    submitFormAndRespond({}, options);

    fixture.detectChanges();
    let error = fixture.debugElement.query(By.css('.error')).nativeElement;
    expect(error.textContent).toEqual(
      'Erreur lors de la communication avec le serveur'
    );
  });

  /////////////////////////////////////////////////////////////////////////////
  // Helpers

  function testReturnValue(value: number, response: ApiResponse) {
    let selectedAmount = 0;
    component.selectedAmount.subscribe((amount) => (selectedAmount = amount));

    submitFormAndRespond(response);

    expect(selectedAmount).toEqual(value);
  }

  function submitFormAndRespond(response: ApiResponse, options?: any) {
    let form = fixture.debugElement.query(By.css('.amount-form')).nativeElement;

    form.dispatchEvent(new Event('submit'));

    const req = httpMock.expectOne(() => true);
    req.flush(response, options);
  }
});
