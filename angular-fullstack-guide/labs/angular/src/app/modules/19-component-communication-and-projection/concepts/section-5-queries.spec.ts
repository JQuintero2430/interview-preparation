import {
  Component,
  Directive,
  ElementRef,
  Injector,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  computed,
  contentChild,
  contentChildren,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m19-s5-leaf',
  template: `<span class="inside" #inside>leaf</span>`,
})
class Leaf {}

@Directive({ selector: '[labM19S5Item]' })
class Item {}

@Component({
  selector: 'lab-m19-s5-q',
  imports: [Leaf],
  template: `
    <span #a>a</span>
    @if (show()) {
      <span #b>b</span>
    }
    <ng-template #tpl>t</ng-template>
    <lab-m19-s5-leaf />
    <ng-content />
  `,
})
class Q implements OnInit {
  readonly show = signal(false);

  readonly a = viewChild<ElementRef<HTMLElement>>('a');
  readonly b = viewChild<ElementRef<HTMLElement>>('b');
  readonly requiredB = viewChild.required<ElementRef<HTMLElement>>('b');
  readonly inside = viewChild('inside');
  readonly leaf = viewChild(Leaf);
  readonly tplRef = viewChild('tpl', { read: TemplateRef });
  readonly tplContainer = viewChild('tpl', { read: ViewContainerRef });
  readonly aElement = viewChild('a', { read: ElementRef });
  readonly aInjector = viewChild('a', { read: Injector });
  readonly bAll = viewChildren<ElementRef<HTMLElement>>('b');
  readonly bCount = computed(() => this.bAll().length);

  readonly item = contentChild(Item);
  readonly items = contentChildren(Item);
  readonly deepItems = contentChildren(Item, { descendants: true });

  readonly seenInConstructor = this.a();
  seenAInInit: ElementRef<HTMLElement> | undefined;
  seenBInInit: ElementRef<HTMLElement> | undefined;
  requiredBError = '';

  ngOnInit(): void {
    this.seenAInInit = this.a();
    this.seenBInInit = this.b();
    try {
      this.requiredB();
    } catch (error) {
      this.requiredBError = (error as Error).message;
    }
  }
}

@Component({
  selector: 'lab-m19-s5-view-host',
  imports: [Q],
  template: `<lab-m19-s5-q />`,
})
class ViewHost {}

@Component({
  selector: 'lab-m19-s5-content-host',
  imports: [Q, Item],
  template: `
    <lab-m19-s5-q>
      <div labM19S5Item><span labM19S5Item></span></div>
    </lab-m19-s5-q>
  `,
})
class ContentHost {}

@Component({
  selector: 'lab-m19-s5-nested-host',
  imports: [Q, Item],
  template: `
    <lab-m19-s5-q>
      <div><span labM19S5Item></span></div>
    </lab-m19-s5-q>
  `,
})
class NestedHost {}

function create<T>(type: new () => T): { root: HTMLElement; q: Q; host: T; detect: () => void } {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  const q = fixture.debugElement.children[0]!.componentInstance as Q;
  return { root: fixture.nativeElement, q, host: fixture.componentInstance, detect: () => fixture.detectChanges() };
}

describe('Section 5: queries', () => {
  it("Section 5: viewChild sees the component's own template and not a child's template", () => {
    const { root, q } = create(ViewHost);
    expect(q.a()?.nativeElement.tagName).toBe('SPAN');
    expect(q.leaf()).toBeInstanceOf(Leaf);
    expect(root.querySelector('lab-m19-s5-leaf .inside')).not.toBeNull();
    expect(q.inside()).toBeUndefined();
  });

  it('Section 5: contentChild and contentChildren differ in the default of descendants', () => {
    const matching = create(ContentHost).q;
    expect(matching.item()).toBeInstanceOf(Item);
    expect(matching.items().length).toBe(1);
    expect(matching.deepItems().length).toBe(2);

    const nested = create(NestedHost).q;
    expect(nested.item()).toBeInstanceOf(Item);
    expect(nested.items().length).toBe(0);
    expect(nested.deepItems().length).toBe(1);
  });

  it('Section 5: read returns ElementRef, TemplateRef and ViewContainerRef', () => {
    const { q } = create(ViewHost);
    expect(q.aElement()).toBeInstanceOf(ElementRef);
    expect(q.tplRef()).toBeInstanceOf(TemplateRef);
    expect(q.tplContainer()).toBeInstanceOf(ViewContainerRef);
  });

  it('Section 5: read Injector returns the node injector of the element', () => {
    const { q } = create(ViewHost);
    const injector = q.aInjector();
    expect(injector).toBeDefined();
    expect(injector!.get(ElementRef).nativeElement).toBe(q.a()!.nativeElement);
  });

  it('Section 5: a required query throws NG0951 until the element exists', () => {
    const { q, detect } = create(ViewHost);
    expect(q.requiredBError).toMatch(/^NG0951: Child query result is required but no value is available\. Find more at /);

    q.show.set(true);
    detect();
    expect(q.requiredB().nativeElement.textContent).toBe('b');
  });

  it('Section 5: a query signal is empty in the constructor and filled in ngOnInit for a static element', () => {
    const { q } = create(ViewHost);
    expect(q.seenInConstructor).toBeUndefined();
    expect(q.seenAInInit?.nativeElement.tagName).toBe('SPAN');
    expect(q.seenBInInit).toBeUndefined();
  });

  it('Section 5: a computed over viewChildren follows an @if', () => {
    const { q, detect } = create(ViewHost);
    expect(q.bCount()).toBe(0);

    q.show.set(true);
    detect();
    expect(q.bCount()).toBe(1);

    q.show.set(false);
    detect();
    expect(q.bCount()).toBe(0);
  });
});
