const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
const port = process.env.PORT || 3001;
app.set('view engine', 'hbs');
app.use(express.urlencoded({extended: false}));
app.use(express.json());

function generateRandomDigit(){
    return Math.floor(100000 + Math.random() * 900000);
};

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.get('/join',(reg, res) => {
    res.render('join');
});

app.get('/dashboard',(reg, res) => {
    res.render('dashboard');
});

app.post('/newsession', (req, res) => {
    console.log(req.body);
    res.send('ok');
    console.log(generateEventJSON(req.body.eventName, req.body.password, generateRandomDigit()));
})

app.use((req, res) => {
    res.status(404).render('404');
})

function generateEventJSON(eventName, passwordHash, code) {

    return {
        eventName: eventName,
        passwordHash: passwordHash,
        code: code,
        feedback: []
    };
}




app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});