import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Recipes endpoint - Coming soon' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create recipe - Coming soon' });
});

export default router;
