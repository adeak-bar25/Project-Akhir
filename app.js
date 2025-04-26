const e = require('express');
const express = require('express');
const fs = require('fs');
const { get } = require('http');

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

app.get('/dashboard', (req, res) => res.render('dashboard'));

app.get('/feedback',(req, res) => {
    const code = parseInt(req.query.code);
    const eventIndex = getEvent.index(code);
    const eventName = jsonDB.events[eventIndex].eventName;
    if(!getEvent.availableCode().includes(parseInt(code))){
        return res.status(404).render('codenotfound', {code: code});
    };
    res.render('feedback', {eventName : eventName });
});

app.post('/newsession', (req, res) => {
    res.redirect('/dashboard');
    jsonDB.events.push(generate.eventJSON(req.body.eventName, req.body.password));
    fs.writeFile(jsonFilePath, JSON.stringify(jsonDB, null, 2), (err) => {if(err) console.log(err)});
})

app.post('/join', (req, res) => {
    const code = req.body.code;
    res.redirect('/feedback?code=' + code);
})

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
    eventJSON: function(eventName, password) {
        return {
            eventName: eventName,
            password: password,
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
    }
}

const getEvent = {
    index: function(code) {
        return jsonDB.events.findIndex(event => event.code === parseInt(code));
    },
    availableCode(){
        return jsonDB.events.map((event) => event.code);
    }

}

app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});