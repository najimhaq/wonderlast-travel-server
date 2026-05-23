const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('User route working');
});

module.exports = router;
