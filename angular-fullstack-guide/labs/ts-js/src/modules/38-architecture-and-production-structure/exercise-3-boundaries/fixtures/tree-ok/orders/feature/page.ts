import { Button } from '@ok/orders-ui';
import { fetchOrders } from '@ok/orders-data';
import { title } from './helper';
export const OrdersPage = [Button, fetchOrders, title];
