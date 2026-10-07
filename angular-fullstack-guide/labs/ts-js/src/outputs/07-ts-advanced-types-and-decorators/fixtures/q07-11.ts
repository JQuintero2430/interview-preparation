interface PaymentEvent {
  kind: 'payment';
  amount: number;
}
interface LoginEvent {
  kind: 'login';
  user: string;
}
type AppEvent = PaymentEvent | LoginEvent;

interface Handler {
  handle(event: AppEvent): void;
}

export const receipts: string[] = [];
export const audit: Handler = {
  handle(event: PaymentEvent) {
    receipts.push(event.amount.toFixed(2));
  },
};

audit.handle({ kind: 'login', user: 'ann' });
