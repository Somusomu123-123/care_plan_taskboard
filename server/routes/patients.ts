import { Router } from 'express';
import { patients } from '../data';

const router = Router();

// GET /patients
router.get('/', (req, res) => {
  res.json(patients);
});

export default router;