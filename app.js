const express = require('express');
const fs = require('fs');

const port = process.env.PORT || 3001;

const app = express();
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({extended: false}));
const jsonFilePath = './data/database.json';
const jsonDB = JSON.parse(fs.readFileSync(jsonFilePath));


// console.log(getAvailableCode());

function generateRandomDigit(){
    let randomInt;
    const existingCodes = getAvailableCode(); 
    do {
        randomInt = Math.floor(100000 + Math.random() * 900000);
    } while (existingCodes.includes(randomInt));
    return randomInt;
};

app.get('/', (req, res) => res.render('index'));

app.get('new', (req, res) => res.render('new'));

app.get('/join',(req, res) => res.render('join'));

app.get('/feedback',(req, res) => {
    const code = parseInt(req.query.code);
    if(!getAvailableCode().includes(parseInt(code))) return res.status(404).render('codenotfound', {code: code});
    // console.log(`${code} is ${typeof(code)}`);
    const eventIndex = jsonDB.events.findIndex(event => event.code === code);
    const eventName = jsonDB.events[eventIndex].eventName
    // console.log(eventIndex);
    res.render('feedback', {eventName : eventName });
});

app.post('/checkcode', (req, res) => {
    const code = req.body.code;
    res.redirect(302, '/feedback?code=' + code);
})

app.post('/newsession', (req, res) => {
    res.send('ok');
    const data = generateEventJSON(req.body.eventName, req.body.password);
    jsonDB.events.push(data)
    fs.writeFile(jsonFilePath, JSON.stringify(jsonDB, null, 2), (err) => {if(err) console.log(err)});
})


app.use((req, res) => res.status(404).render('404'))

function generateEventJSON(eventName, password) {
    return {
        eventName: eventName,
        password: password,
        code: generateRandomDigit(),
        feedback: []
    };
}

function getAvailableCode(){
    return jsonDB.events.map((event) => event.code)
}


app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});