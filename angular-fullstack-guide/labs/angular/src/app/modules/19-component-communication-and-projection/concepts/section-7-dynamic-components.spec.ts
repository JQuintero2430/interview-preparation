import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  ViewContainerRef,
  createComponent,
  inputBinding,
  input,
  model,
  output,
  outputBinding,
  signal,
  twoWayBinding,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'lab-m19-s7-dyn',
  template: `{{ label() }}|{{ n() }}|{{ v() }}`,
})
class Dyn {
  readonly label = input.required<string>();
  readonly n = input(0);
  readonly v = model('M0');
  readonly done = output<number>();
}

@Component({
  selector: 'lab-m19-s7-slots',
  template: `<header><ng-content select="[a]">fallback-a</ng-content></header><main><ng-content /></main>`,
})
class Slots {}

@Component({
  selector: 'lab-m19-s7-host',
  template: `<ng-container #slot />`,
})
class Host {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
}

function mount(): { root: HTMLElement; host: Host; detect: () => void; destroy: () => void } {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return {
    root: fixture.nativeElement,
    host: fixture.componentInstance,
    detect: () => fixture.detectChanges(),
    destroy: () => fixture.destroy(),
  };
}

function markup(node: HTMLElement): string {
  return node.innerHTML.replace(/<!--.*?-->/g, '');
}

function element(tag: string, text: string, attribute?: string): HTMLElement {
  const node = document.createElement(tag);
  node.textContent = text;
  if (attribute) node.setAttribute(attribute, '');
  return node;
}

describe('Section 7: dynamic components', () => {
  it('Section 7: ViewContainerRef.createComponent renders into the container and destroy removes it', () => {
    const { root, host, detect } = mount();
    const ref = host.slot().createComponent(Dyn, { bindings: [inputBinding('label', () => 'vcr')] });
    detect();
    expect(root.querySelector('lab-m19-s7-dyn')?.textContent).toBe('vcr|0|M0');
    expect(host.slot().length).toBe(1);

    ref.destroy();
    expect(root.querySelector('lab-m19-s7-dyn')).toBeNull();
    expect(host.slot().length).toBe(0);
  });

  it('Section 7: createComponent needs attachView to render and detachView with destroy to clean up', () => {
    const appRef = TestBed.inject(ApplicationRef);
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const viewsBefore = appRef.viewCount;
    const bindings = [inputBinding('label', () => 'app')];

    const lonely = createComponent(Dyn, { environmentInjector, bindings });
    document.body.appendChild(lonely.location.nativeElement);
    appRef.tick();
    expect(lonely.location.nativeElement.textContent).toBe('');
    expect(appRef.viewCount).toBe(viewsBefore);
    lonely.destroy();

    const ref = createComponent(Dyn, { environmentInjector, bindings });
    document.body.appendChild(ref.location.nativeElement);
    appRef.attachView(ref.hostView);
    appRef.tick();
    expect(ref.location.nativeElement.textContent).toBe('app|0|M0');
    expect(appRef.viewCount).toBe(viewsBefore + 1);
    expect(document.body.contains(ref.location.nativeElement)).toBe(true);

    let destroyed = false;
    ref.onDestroy(() => (destroyed = true));
    ref.destroy();
    expect(destroyed).toBe(true);
    expect(document.body.contains(ref.location.nativeElement)).toBe(false);
    expect(appRef.viewCount).toBe(viewsBefore);
  });

  it('Section 7: a component in a container is destroyed with its host and an application-attached one is not', () => {
    const appRef = TestBed.inject(ApplicationRef);
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const { host, destroy } = mount();
    const inContainer = host.slot().createComponent(Dyn, { bindings: [inputBinding('label', () => 'c')] });
    const attached = createComponent(Dyn, { environmentInjector, bindings: [inputBinding('label', () => 'a')] });
    appRef.attachView(attached.hostView);

    destroy();
    expect(inContainer.hostView.destroyed).toBe(true);
    expect(attached.hostView.destroyed).toBe(false);

    attached.destroy();
    expect(attached.hostView.destroyed).toBe(true);
  });

  it('Section 7: inputBinding follows a signal and outputBinding receives emissions', () => {
    const { root, host, detect } = mount();
    const label = signal('L1');
    const heard: number[] = [];
    const ref = host.slot().createComponent(Dyn, {
      bindings: [
        inputBinding('label', label),
        inputBinding('n', () => 3),
        outputBinding<number>('done', (value) => heard.push(value)),
      ],
    });
    detect();
    expect(root.querySelector('lab-m19-s7-dyn')?.textContent).toBe('L1|3|M0');

    label.set('L2');
    detect();
    expect(root.querySelector('lab-m19-s7-dyn')?.textContent).toBe('L2|3|M0');

    ref.instance.done.emit(9);
    expect(heard).toEqual([9]);
  });

  it("Section 7: twoWayBinding writes the child's model to the parent signal", () => {
    const { root, host, detect } = mount();
    const two = signal('T1');
    const ref = host.slot().createComponent(Dyn, {
      bindings: [inputBinding('label', () => 'x'), twoWayBinding('v', two)],
    });
    detect();
    expect(root.querySelector('lab-m19-s7-dyn')?.textContent).toBe('x|0|T1');

    ref.instance.v.set('T2');
    expect(two()).toBe('T2');
    detect();
    expect(root.querySelector('lab-m19-s7-dyn')?.textContent).toBe('x|0|T2');
  });

  it('Section 7: setInput throws NG0317 on a component created with an input binding and works without one', () => {
    const { host } = mount();
    const bound = host.slot().createComponent(Dyn, { bindings: [inputBinding('label', () => 'b')] });
    expect(() => bound.setInput('n', 4)).toThrowError(/NG0317.*inputBinding/);
    expect(() => bound.setInput('label', 'z')).toThrowError(/NG0317/);

    const plain = host.slot().createComponent(Dyn);
    plain.setInput('label', 'S');
    plain.changeDetectorRef.detectChanges();
    expect(plain.location.nativeElement.textContent).toBe('S|0|M0');

    const outputOnly = host.slot().createComponent(Dyn, { bindings: [outputBinding<number>('done', () => undefined)] });
    outputOnly.setInput('label', 'O');
    outputOnly.changeDetectorRef.detectChanges();
    expect(outputOnly.location.nativeElement.textContent).toBe('O|0|M0');
  });

  it('Section 7: projectableNodes fill the slots of a dynamic component', () => {
    const { host } = mount();
    const filled = host.slot().createComponent(Slots, {
      projectableNodes: [[element('b', 'A', 'a')], [element('i', 'M')]],
    });
    expect(markup(filled.location.nativeElement)).toBe('<header><b a="">A</b></header><main><i>M</i></main>');

    const emptyArray = host.slot().createComponent(Slots, { projectableNodes: [[], []] });
    expect(markup(emptyArray.location.nativeElement)).toBe('<header>fallback-a</header><main></main>');

    const emptyText = host.slot().createComponent(Slots, {
      projectableNodes: [[document.createTextNode('')], []],
    });
    expect(markup(emptyText.location.nativeElement)).toBe('<header></header><main></main>');
  });
});
