import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  Component,
  Directive,
  Injectable,
  LOCALE_ID,
  Pipe,
  PipeTransform,
  inject,
  input,
  inputBinding,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, map } from 'rxjs';

/** A pure pipe with no dependencies: a plain class with a `transform` method. */
@Pipe({ name: 'labM29Initials' })
class LabM29InitialsPipe implements PipeTransform {
  transform(name: string): string {
    return name
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }
}

/** A pipe that calls inject(): it can only be constructed inside an injection context. */
@Pipe({ name: 'labM29Locale' })
class LabM29LocalePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: string): string {
    return `${this.locale}:${value}`;
  }
}

/** An attribute directive: its selector has no tag name and it writes one host attribute. */
@Directive({
  selector: '[labM29Hi]',
  host: { '[attr.data-hi]': 'labM29Hi()' },
})
class LabM29Hi {
  readonly labM29Hi = input('');
}

@Component({
  selector: 'lab-m29-hi-host',
  imports: [LabM29Hi],
  template: '<p [labM29Hi]="word()">text</p>',
})
class LabM29HiHost {
  readonly word = signal('hello');
}

interface LabM29Price {
  readonly price: number;
}

@Injectable({ providedIn: 'root' })
class LabM29Prices {
  private readonly http = inject(HttpClient);

  total(): Promise<number> {
    return firstValueFrom(
      this.http
        .get<{ readonly items: readonly LabM29Price[] }>('/api/prices')
        .pipe(map((body) => body.items.reduce((sum, item) => sum + item.price, 0))),
    );
  }
}

const NO_TAG_NAME =
  /^Cannot determine tag name for _?LabM29Hi, because one was not set in the options object and the selector for _?LabM29Hi does not include a tag name\. Specify which tag name should be used via the `tagName` key in the options parameter\.$/;

describe('Section 8: services, pipes and directives', () => {
  it('Section 8: a pure pipe is tested with new', () => {
    const pipe = new LabM29InitialsPipe();

    expect(pipe.transform('ada lovelace')).toBe('AL');
    expect(pipe.transform('  grace   brewster hopper ')).toBe('GBH');
    expect(pipe.transform('')).toBe('');
  });

  it('Section 8: a pipe that injects is constructed in an injection context', () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] });

    const pipe = TestBed.runInInjectionContext(() => new LabM29LocalePipe());

    expect(pipe.transform('x')).toBe('de:x');
    expect(() => new LabM29LocalePipe()).toThrowError(/^NG0203: /);
  });

  it('Section 8: createDirective needs a tag name for an attribute selector', () => {
    expect(() => TestBed.createDirective(LabM29Hi)).toThrowError(NO_TAG_NAME);
  });

  it("Section 8: createDirective renders the directive's host binding", async () => {
    const fixture = TestBed.createDirective(LabM29Hi, {
      tagName: 'span',
      bindings: [inputBinding('labM29Hi', () => 'yo')],
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.tagName).toBe('SPAN');
    expect(fixture.nativeElement.getAttribute('data-hi')).toBe('yo');
    expect(fixture.nativeElement.getAttribute('ng-version')).toMatch(/^\d+\.\d+\.\d+/);
    expect(fixture.directiveInstance).toBeInstanceOf(LabM29Hi);
  });

  it('Section 8: a host component tests the same directive through a template', async () => {
    const fixture = TestBed.createComponent(LabM29HiHost);
    await fixture.whenStable();
    const paragraph: HTMLElement = fixture.nativeElement.querySelector('p');

    expect(paragraph.getAttribute('data-hi')).toBe('hello');

    fixture.componentInstance.word.set('bye');
    TestBed.tick();

    expect(paragraph.getAttribute('data-hi')).toBe('bye');
  });

  describe('with HTTP faked', () => {
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('Section 8: a service is tested with the real HttpClient over HttpTestingController', async () => {
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      const total = TestBed.inject(LabM29Prices).total();

      const request = TestBed.inject(HttpTestingController).expectOne('/api/prices');
      expect(request.request.method).toBe('GET');
      request.flush({ items: [{ price: 2 }, { price: 3 }] });

      await expect(total).resolves.toBe(5);
    });
  });
});
