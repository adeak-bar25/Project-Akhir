const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { get } = require('https');

const port = process.env.PORT || 3001;

const app = express();
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.use(express.urlencoded({extended: false}));
const jsonFilePath = './data/database.json';
const jsonDB = JSON.parse(fs.readFileSync(jsonFilePath));

app.get('/', (req, res) => res.render('index'));

app.get('/new', (req, res) => res.render('new'));

app.get('/join',(req, res) => res.render('join'));

app.get('/login', (req, res) => res.render('login'))

app.get('/dashboard', (req, res) => res.render('dashboard'));

app.post('/newsession', (req, res) => {
    res.redirect('/dashboard');
    const passwordHash = generate.passwordHash(req.body.password);
    jsonDB.events.push(generate.eventJSON(req.body.eventName, passwordHash));
    fs.writeFile(jsonFilePath, JSON.stringify(jsonDB, null, 2), (err) => {if(err) console.log(err)});
})

app.post('/join', (req, res) => {
    const code = req.body.code;
    res.redirect('/feedback?code=' + code);
})

app.post('/login', (req, res) => {
    const code = parseInt(req.body.code)
    if(!getEvent.availableCode().includes(code)) return res.send('Kode lu ngga bener')
    res.send('ok')
    bcrypt.compare(req.body.password, getEvent.passwordHash(code), (err, result) => { return result;})
    // console.log(getEvent.passwordHash(code));
})

app.get('/feedback',(req, res) => {
    if(req.query.code === NaN || req.query.code === undefined){
        return res.redirect('/join');
    }else if(!getEvent.availableCode().includes(parseInt(req.query.code))){
        return res.status(404).render('codenotfound');
    }
    const code = parseInt(req.query.code);
    const eventIndex = getEvent.index(code);
    const eventName = jsonDB.events[eventIndex].eventName;
    res.render('feedback', {eventName : eventName });
});

app.post('/feedback/send', (req, res) => {
    res.send('Feedback submitted successfully! Thank you for your feedback!');
    const code = req.query.code;
    let name = req.body.name;
    const eventIndex = getEvent.index(code);

    if (req.body.name.length === 0) name = 'Anonymous';
    const feedbackMessage = generate.eventFeedback(name, req.body.feedback);
    jsonDB.events[eventIndex].feedback.push(feedbackMessage)
    fs.writeFile(jsonFilePath, JSON.stringify(jsonDB, null, 2), (err) => {if(err) console.log(err)});
    // console.log(req.body);
    console.log(feedbackMessage);
})

app.use((req, res) => res.status(404).render('404'));

const generate = {
    eventJSON: function(eventName, passwordHash) {
        return {
            eventName: eventName,
            passwordHash: passwordHash,
            code: generate.eventCode(),
            feedback: []
        };
    },
    eventFeedback: function(name, feedback) {
        return{
            name: name,
            feedback: feedback
        }
    },
    eventCode: function() {
        let randomInt;
        const existingCodes = getEvent.availableCode(); 
        do {
            randomInt = Math.floor(100000 + Math.random() * 900000);
        } while (existingCodes.includes(randomInt));
        return randomInt;
    },
    passwordHash: function(pass){
        return bcrypt.hashSync(pass, 10);
    }
}

const getEvent = {
    index: function(code) {
        return jsonDB.events.findIndex(event => event.code === parseInt(code));
    },
    availableCode: function(){
        return jsonDB.events.map((event) => event.code);
    },
    passwordHash: function(code){
        const i = getEvent.index(code)
        return jsonDB.events[i].passwordHash
    }
}

app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});