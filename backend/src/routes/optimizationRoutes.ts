import { Router } from 'express';
import { OptimizationController } from '../controllers/optimizationController';

const router = Router();

// POST /api/optimize - Optimize a product by ASIN
router.post('/optimize', OptimizationController.optimizeProduct);

// GET /api/optimizations - Get all optimizations
router.get('/optimizations', OptimizationController.getAllOptimizations);

// GET /api/optimizations/:id - Get specific optimization by ID
router.get('/optimizations/:id', OptimizationController.getOptimizationById);

// GET /api/history/:asin - Get optimization history for an ASIN
router.get('/history/:asin', OptimizationController.getHistoryByAsin);

// GET /api/changes/:asin - Get change history for an ASIN
router.get('/changes/:asin', OptimizationController.getChangeHistory);

export default router;
