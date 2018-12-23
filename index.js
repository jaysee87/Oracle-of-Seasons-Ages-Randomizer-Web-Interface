const express = require('express');
const app = express();

const path = require('path');
const exphbs = require('express-handlebars');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {mongoDBurl}= require('./configs/db');

mongoose.connect(mongoDBurl, {useNewUrlParser: true}).then(db=>{
  console.log(`Connected to db`);
}).catch(err =>{
  console.log(err);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('handlebars', exphbs({defaultLayout: 'home'}));
app.set('view engine', 'handlebars');

const main = require('./routes/index');
const api = require('./routes/api');
const unsupported = require('./routes/unsupported');
app.use('/', main);
app.use('/api', api);
app.use('/unsupported', unsupported);

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`Zelda Oracles Randomizer running on port ${port}`);
})