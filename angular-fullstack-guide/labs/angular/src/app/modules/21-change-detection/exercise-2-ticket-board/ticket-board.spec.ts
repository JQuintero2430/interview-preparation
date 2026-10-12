import { ApplicationRef, isSignal, provideCheckNoChangesConfig } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BoardHost } from './board-host';
import { StaleBoard } from './legacy/stale-board';
import { TicketBoard } from './ticket-board';
import { Ticket, TicketSource } from './ticket-source';

const TICKETS: readonly Ticket[] = [
  { id: 1, title: 'alpha', done: false },
  { id: 2, title: 'beta', done: true },
];

const textOf = (fixture: ComponentFixture<unknown>): string =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p, li'))
    .map((element) => element.textContent?.trim())
    .join(' ');

const pause = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 5));

function renderLegacy() {
  const fixture = TestBed.createComponent(StaleBoard);
  fixture.detectChanges();
  return { fixture, board: fixture.componentInstance, source: TestBed.inject(TicketSource) };
}

function renderFixed() {
  const fixture = TestBed.createComponent(BoardHost);
  fixture.detectChanges();
  const board: TicketBoard = fixture.debugElement.query(By.directive(TicketBoard)).componentInstance;
  return { fixture, board, source: TestBed.inject(TicketSource) };
}

describe('E21.2 Port a zone-era ticket board to signals', () => {
  it("each of the legacy board's four symptoms is reproduced (stale text or NG0100) in the spec", async () => {
    const emitted = renderLegacy();
    emitted.source.emit(TICKETS);
    await emitted.fixture.whenStable();
    expect(emitted.board.open).toBe(1);
    expect(textOf(emitted.fixture)).toContain('0 open');
    emitted.fixture.destroy();

    const pushed = renderLegacy();
    pushed.board.add('gamma');
    await pushed.fixture.whenStable();
    expect(pushed.board.tickets.length).toBe(1);
    expect(textOf(pushed.fixture)).toContain('0 tickets');
    pushed.fixture.destroy();

    const timed = renderLegacy();
    await pause();
    await timed.fixture.whenStable();
    expect(timed.board.status).toBe('ready');
    expect(textOf(timed.fixture)).toContain('loading');
    timed.fixture.destroy();

    const ticked = renderLegacy();
    ticked.source.emit(TICKETS);
    expect(() => TestBed.inject(ApplicationRef).tick()).toThrow(
      "NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '0'. Current value: '1'.",
    );
  });

  it('the fixed board shows a source emission after whenStable() with no manual refresh', async () => {
    const { fixture, source } = renderFixed();
    expect(textOf(fixture)).toContain('loading');
    source.emit(TICKETS);
    await fixture.whenStable();
    expect(textOf(fixture)).toBe('ready 1 open alpha beta');
  });

  it('an added ticket (a replaced list) renders', async () => {
    const { fixture, board, source } = renderFixed();
    source.emit(TICKETS);
    await fixture.whenStable();
    const before = board.list();
    board.add('gamma');
    await fixture.whenStable();
    expect(board.list()).not.toBe(before);
    expect(textOf(fixture)).toBe('ready 2 open alpha beta gamma');
  });

  it('the open count is a computed that renders the same value on every pass', async () => {
    const { fixture, board, source } = renderFixed();
    source.emit(TICKETS);
    await fixture.whenStable();
    expect(isSignal(board.open)).toBe(true);
    expect('set' in board.open).toBe(false);
    for (let pass = 0; pass < 3; pass++) {
      fixture.detectChanges();
      expect(textOf(fixture)).toContain('1 open');
    }
  });

  it('a late response after destruction does not write (no error)', async () => {
    const { fixture, board, source } = renderFixed();
    source.emit(TICKETS);
    await fixture.whenStable();
    fixture.componentInstance.shown.set(false);
    await fixture.whenStable();
    expect(source.observed).toBe(false);
    expect(() => source.emit([TICKETS[0]])).not.toThrow();
    expect(board.list()).toEqual(TICKETS);
  });

  it('the exhaustive check finds nothing on the fixed board', async () => {
    TestBed.configureTestingModule({
      providers: [provideCheckNoChangesConfig({ exhaustive: true })],
    });
    const { fixture, board, source } = renderFixed();
    source.emit(TICKETS);
    board.add('gamma');
    await fixture.whenStable();
    expect(() => TestBed.inject(ApplicationRef).tick()).not.toThrow();
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(textOf(fixture)).toBe('ready 2 open alpha beta gamma');
  });
});
