import { Component, Directive, inject, Injector, input, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AdminMenu, MenuBehavior, menuLog, PlainMenu } from './menu-demo';

@Component({
  selector: 'lab-s3-order-host',
  imports: [AdminMenu],
  template: `<lab-admin-menu id="top" />`,
})
class OrderHost {}

@Component({
  selector: 'lab-s3-both-host',
  imports: [AdminMenu, PlainMenu],
  template: `
    <lab-admin-menu id="top" />
    <lab-plain-menu />
  `,
})
class BothHost {}

@Component({
  selector: 'lab-s3-expose-host',
  imports: [AdminMenu, PlainMenu],
  template: `
    <lab-admin-menu id="top" (closed)="closedByAdmin.set(closedByAdmin() + 1)" />
    <lab-plain-menu menuId="ignored" (closed)="closedByPlain.set(closedByPlain() + 1)" />
  `,
})
class ExposeHost {
  readonly closedByAdmin = signal(0);
  readonly closedByPlain = signal(0);
}

// A host directive whose input and output are renamed by the component that applies it.
@Directive({ selector: '[labDismiss]' })
class Dismiss {
  readonly reason = input('none');
  readonly closed = output<string>();
}

@Component({
  selector: 'lab-s3-panel',
  template: 'panel',
  hostDirectives: [{ directive: Dismiss, inputs: ['reason: why'], outputs: ['closed: dismissed'] }],
})
class Panel {}

@Component({
  selector: 'lab-s3-alias-host',
  imports: [Panel],
  template: `<lab-s3-panel why="stale" (dismissed)="seen.set($event)" />`,
})
class AliasHost {
  readonly seen = signal('');
}

// One directive that is both a host directive and matched in the template.
const hoverCount = { created: 0 };

@Directive({ selector: '[labHoverable]' })
class Hoverable {
  readonly level = input(0);

  constructor() {
    hoverCount.created++;
  }
}

@Component({
  selector: 'lab-s3-hbtn',
  template: 'button',
  hostDirectives: [{ directive: Hoverable, inputs: ['level'] }],
})
class HoverButton {}

@Component({
  selector: 'lab-s3-template-match-host',
  imports: [HoverButton, Hoverable],
  template: `
    <lab-s3-hbtn labHoverable [level]="9" />
    <lab-s3-hbtn [level]="3" />
  `,
})
class TemplateMatchHost {}

// Two directives that both list the same host directive.
const triggerCount = { created: 0 };

@Directive({ selector: '[labTrigger]', host: { '[attr.data-t]': 'popId()' } })
class TriggerRef {
  readonly popId = input('');

  constructor() {
    triggerCount.created++;
  }
}

@Directive({ selector: '[labPop]', hostDirectives: [{ directive: TriggerRef, inputs: ['popId'] }] })
class Pop {}

@Directive({ selector: '[labDrop]', hostDirectives: [{ directive: TriggerRef, inputs: ['popId'] }] })
class Drop {}

@Component({
  selector: 'lab-s3-shared-host',
  imports: [Pop, Drop],
  template: `<button labPop labDrop popId="p1">go</button>`,
})
class SharedHost {}

// A host directive and a host that inject each other, through a lazy read.
@Directive({ selector: '[labPeer]' })
class Peer {
  private readonly injector = inject(Injector);

  owner(): Owner {
    return this.injector.get(Owner);
  }
}

@Component({
  selector: 'lab-s3-owner',
  template: 'owner',
  hostDirectives: [Peer],
})
class Owner {
  readonly peer = inject(Peer);
}

@Component({
  selector: 'lab-s3-inject-host',
  imports: [Owner],
  template: `<lab-s3-owner />`,
})
class InjectHost {}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

describe('Section 3: host directives', () => {
  beforeEach(() => {
    menuLog.length = 0;
    hoverCount.created = 0;
    triggerCount.created = 0;
  });

  it("Section 3: host directive constructors and inputs run before the host's and the host's bindings win", () => {
    mount(OrderHost);
    expect(menuLog).toEqual([
      'ctor MenuBehavior',
      'ctor AdminMenu has MenuBehavior=true',
      'init MenuBehavior id=top',
      'init AdminMenu',
    ]);

    const fixture = mount(BothHost);
    const [admin, plain] = fixture.debugElement.queryAll(By.css('lab-admin-menu, lab-plain-menu'));
    expect(admin.nativeElement.getAttribute('role')).toBe('navigation');
    expect(admin.nativeElement.style.color).toBe('blue');
    expect(plain.nativeElement.getAttribute('role')).toBe('menu');
    expect(plain.nativeElement.style.color).toBe('red');
    // A host binding of the host directive that the host does not override survives.
    expect(admin.nativeElement.classList.contains('menu-behavior')).toBe(true);
    expect(plain.nativeElement.classList.contains('menu-behavior')).toBe(true);
  });

  it('Section 3: only the listed inputs and outputs are exposed and an alias renames them', () => {
    const fixture = mount(ExposeHost);
    const [admin, plain] = fixture.debugElement.queryAll(By.css('lab-admin-menu, lab-plain-menu'));

    expect(admin.injector.get(MenuBehavior).menuId()).toBe('top');
    // The aliased input also stays a plain attribute on the element.
    expect(admin.nativeElement.getAttribute('id')).toBe('top');
    // Not exposed: the attribute stays plain and the input keeps its default.
    expect(plain.injector.get(MenuBehavior).menuId()).toBe('none');
    expect(plain.nativeElement.getAttribute('menuid')).toBe('ignored');

    admin.injector.get(MenuBehavior).closed.emit();
    plain.injector.get(MenuBehavior).closed.emit();
    expect(fixture.componentInstance.closedByAdmin()).toBe(1);
    expect(fixture.componentInstance.closedByPlain()).toBe(0);

    const aliased = mount(AliasHost);
    const panel = aliased.debugElement.query(By.directive(Panel));
    expect(panel.injector.get(Dismiss).reason()).toBe('stale');
    panel.injector.get(Dismiss).closed.emit('done');
    expect(aliased.componentInstance.seen()).toBe('done');
  });

  it('Section 3: a directive that is also matched in the template is one instance', () => {
    const fixture = mount(TemplateMatchHost);
    const [matched, viaAlias] = fixture.debugElement.queryAll(By.directive(HoverButton));

    expect(hoverCount.created).toBe(2);
    expect(matched.injector.get(Hoverable).level()).toBe(9);
    expect(viaAlias.injector.get(Hoverable).level()).toBe(3);
  });

  it('Section 3: two directives sharing a host directive get one instance', () => {
    const fixture = mount(SharedHost);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(triggerCount.created).toBe(1);
    expect(button.getAttribute('data-t')).toBe('p1');
  });

  it('Section 3: the host can inject its host directive', () => {
    const fixture = mount(InjectHost);
    const owner = fixture.debugElement.query(By.directive(Owner));

    expect(owner.componentInstance.peer).toBe(owner.injector.get(Peer));
    expect(owner.injector.get(Peer).owner()).toBe(owner.componentInstance);
  });
});
