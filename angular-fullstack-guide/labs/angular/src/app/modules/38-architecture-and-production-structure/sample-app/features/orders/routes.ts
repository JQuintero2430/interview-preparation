import { Routes } from '@angular/router';
import { provideOrdersDataAccess } from './data-access/orders-facade';
import { LabM38OrdersHome } from './feature/orders-home';

export default [{ path: '', component: LabM38OrdersHome, providers: [provideOrdersDataAccess()] }] satisfies Routes;
