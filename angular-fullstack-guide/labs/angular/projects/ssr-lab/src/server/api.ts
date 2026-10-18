import { Router } from 'express';

interface Product {
  id: string;
  name: string;
}

const PRODUCTS: readonly Product[] = [
  { id: 'p1', name: 'Keyboard' },
  { id: 'p2', name: 'Mouse' },
  { id: 'p3', name: 'Monitor' },
];

const STARTED_AT = new Date().toISOString();

export const labApi = Router();

labApi.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

labApi.get('/products', (_req, res) => {
  res.json(PRODUCTS);
});

labApi.get('/products/:id', (req, res) => {
  const product = PRODUCTS.find((candidate) => candidate.id === req.params['id']);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

labApi.get('/me', (req, res) => {
  if (req.get('Authorization')) {
    res.json({ name: 'Ada' });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

labApi.get('/time', (_req, res) => {
  res.json({ time: STARTED_AT });
});

// SEC-M32-08: the list of `/products` without `Cache-Control: no-store`, so the HTTP transfer cache may store it.
labApi.get('/catalog', (_req, res) => {
  res.removeHeader('Cache-Control');
  res.json(PRODUCTS);
});
