import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Ingredients endpoint - Coming soon' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create ingredient - Coming soon' });
});

export default router;
