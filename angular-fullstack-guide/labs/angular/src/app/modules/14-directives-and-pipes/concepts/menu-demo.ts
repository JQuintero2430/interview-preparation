import { Component, Directive, inject, input, OnInit, output } from '@angular/core';

// Records the order in which the classes below run; the spec clears it before each test.
export const menuLog: string[] = [];

@Directive({
  selector: '[labMenuBehavior]',
  host: {
    role: 'menu',
    '[style.color]': "'red'",
    '[class.menu-behavior]': 'true',
  },
})
export class MenuBehavior implements OnInit {
  readonly menuId = input('none');
  readonly closed = output<void>();

  constructor() {
    menuLog.push('ctor MenuBehavior');
  }

  ngOnInit(): void {
    menuLog.push(`init MenuBehavior id=${this.menuId()}`);
  }
}

@Component({
  selector: 'lab-admin-menu',
  template: 'admin',
  hostDirectives: [{ directive: MenuBehavior, inputs: ['menuId: id'], outputs: ['closed'] }],
  host: {
    role: 'navigation',
    '[style.color]': "'blue'",
  },
})
export class AdminMenu implements OnInit {
  private readonly behavior = inject(MenuBehavior);

  constructor() {
    menuLog.push(`ctor AdminMenu has MenuBehavior=${this.behavior instanceof MenuBehavior}`);
  }

  ngOnInit(): void {
    menuLog.push('init AdminMenu');
  }
}

// Applies the same host directive but overrides nothing and exposes nothing.
@Component({
  selector: 'lab-plain-menu',
  template: 'plain',
  hostDirectives: [MenuBehavior],
})
export class PlainMenu {}
