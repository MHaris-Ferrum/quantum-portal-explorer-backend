import express from 'express';
const router = express.Router();
import validate from '../middlewares/validate.middleware';
import { transactionsController } from '../controllers';
import { transactionValidation } from '../validations';

router.get(
  '/',
  validate(transactionValidation.getTransactions),
  transactionsController.getTransactions,
);

export default router;
