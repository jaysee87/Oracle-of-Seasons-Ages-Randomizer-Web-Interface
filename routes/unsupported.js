const express = require('express');
const router = express.Router();
const version = require('../base/version');

router.all('/*', (req, res, next)=>{
  req.app.locals.layout = 'unsupported';
  next();
});

router.get('/', (req,res)=>{
  res.render('unsupported/unsupported', {version: version});
});

module.exports = router;
