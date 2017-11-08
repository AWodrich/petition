//THIS is a SERVER-SIDE PROJECT
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hb = require('express-handlebars');
const port = 8080;
const database = require('./database.js');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended:false
}))


app.get('/', (req, res) => {
    res.render('petition', {
        layout: 'main'
    })
})

app.post('/petition', (req, res) => {
    const first = req.body.first;
    const last = req.body.last;
    const signature = 'sig comes here';
    database.signPetition(first, last, signature)
    res.render('petition', {
        layout: 'main'
    })
})

app.get('/signed', (req, res) => {
    res.render('signed', {
        layout: 'main'
    })
})

app.listen(port, () => console.log('Listening on server'));
