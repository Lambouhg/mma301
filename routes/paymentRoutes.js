const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

//Create momo payment
router.post('/payment', paymentController.payment);

//Callback
router.post('/callback', paymentController.callback);

//Transaction status
router.post('/transaction-status', paymentController.transactionStatus);

module.exports = router;