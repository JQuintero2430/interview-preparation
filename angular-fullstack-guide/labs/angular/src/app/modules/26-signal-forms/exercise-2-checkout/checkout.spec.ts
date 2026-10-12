import { Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import type { Schema } from '@angular/forms/signals';
import { Checkout, INITIAL_CHECKOUT } from './checkout-model';
import { checkoutSchema, checkoutWhenSchema } from './checkout-schema';
import { LabM26CheckoutForm, LabM26CheckoutWhenForm } from './checkout-form';

interface CheckoutHost {
  readonly model: { (): Checkout; update(fn: (m: Checkout) => Checkout): void };
  readonly checkoutForm: {
    (): { valid(): boolean };
    billing: { (): { hidden(): boolean }; street(): { errors(): unknown[] } };
  };
}

async function mount<T extends CheckoutHost>(component: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function input(fixture: ComponentFixture<unknown>, id: string): HTMLInputElement | null {
  return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement | null;
}

function errors(fixture: ComponentFixture<unknown>, id: string): string[] {
  const nodes = fixture.nativeElement.querySelectorAll(`.${id}-error`) as NodeListOf<HTMLElement>;
  return Array.from(nodes, (n) => n.textContent ?? '');
}

async function type(fixture: ComponentFixture<unknown>, id: string, value: string): Promise<void> {
  const el = input(fixture, id) as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

async function toggle(fixture: ComponentFixture<unknown>, id: string): Promise<void> {
  (input(fixture, id) as HTMLInputElement).click();
  await fixture.whenStable();
}

async function fillShipping(fixture: ComponentFixture<unknown>): Promise<void> {
  await type(fixture, 'shipping-street', '1 Main St');
  await type(fixture, 'shipping-city', 'Lima');
}

const variants: [string, Type<CheckoutHost>, Schema<Checkout>][] = [
  ['applyWhen', LabM26CheckoutForm, checkoutSchema],
  ['required with when', LabM26CheckoutWhenForm, checkoutWhenSchema],
];

describe('E26.2 checkout form with cross-field and conditional rules', () => {
  describe.each(variants)('%s', (_name, component, schemaFn) => {
    it('the billing address is hidden and not validated while billing equals shipping', async () => {
      const fixture = await mount(component);
      const tree = fixture.componentInstance.checkoutForm;
      expect(tree.billing().hidden()).toBe(true);
      expect(tree.billing.street().errors()).toEqual([]);
      expect(input(fixture, 'billing-street')).toBeNull();
      await fillShipping(fixture);
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(true);
    });

    it('unchecking the flag shows the billing address and makes its rules count', async () => {
      const fixture = await mount(component);
      await fillShipping(fixture);
      await toggle(fixture, 'same');
      expect(input(fixture, 'billing-street')).not.toBeNull();
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(false);
      await type(fixture, 'billing-street', '2 Side St');
      await type(fixture, 'billing-city', 'Cusco');
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(true);
    });

    it('VAT is required only for a company', async () => {
      const fixture = await mount(component);
      await fillShipping(fixture);
      expect(errors(fixture, 'vat')).toEqual([]);
      await toggle(fixture, 'company');
      expect(errors(fixture, 'vat')).toEqual(['This field is required']);
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(false);
      await type(fixture, 'vat', 'PE123');
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(true);
      await type(fixture, 'vat', '');
      await toggle(fixture, 'company');
      expect(errors(fixture, 'vat')).toEqual([]);
      expect(fixture.componentInstance.checkoutForm().valid()).toBe(true);
    });

    it('a delivery date before the order date puts an error on the delivery field', async () => {
      const fixture = await mount(component);
      await type(fixture, 'order', '2026-10-10');
      await type(fixture, 'delivery', '2026-10-09');
      expect(errors(fixture, 'delivery')).toEqual(['Delivery cannot be before the order date']);
      await type(fixture, 'delivery', '2026-10-10');
      expect(errors(fixture, 'delivery')).toEqual([]);
      await type(fixture, 'order', '2026-10-11');
      expect(errors(fixture, 'delivery')).toEqual(['Delivery cannot be before the order date']);
    });

    it('the schema is reusable: applying it to a second model gives the same errors', () => {
      TestBed.runInInjectionContext(() => {
        const bad: Checkout = {
          ...INITIAL_CHECKOUT,
          sameAsShipping: false,
          isCompany: true,
          orderDate: '2026-10-10',
          deliveryDate: '2026-10-01',
        };
        const first = form(signal<Checkout>(structuredClone(bad)), schemaFn);
        const second = form(signal<Checkout>(structuredClone(bad)), schemaFn);
        const kinds = (f: typeof first) => ({
          shipping: f.shipping.street().errors().map((e) => e.kind),
          billing: f.billing.street().errors().map((e) => e.kind),
          vat: f.vat().errors().map((e) => e.kind),
          delivery: f.deliveryDate().errors().map((e) => e.kind),
        });
        expect(kinds(first)).toEqual({
          shipping: ['required'],
          billing: ['required'],
          vat: ['required'],
          delivery: ['beforeOrder'],
        });
        expect(kinds(second)).toEqual(kinds(first));
      });
    });
  });
});
