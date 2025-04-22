const express = require('express');
const fs =require('fs')

const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'hbs');

function generateRandomDigit(){
    return Math.floor(100000 + Math.random() * 900000);
}

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/panitia', (req, res) => {
    res.render('panitiamain')
})

app.post('/panitia', (req, res) => {
    const newCode = generateRandomDigit()
    const codeElement =`<div class='code'>${newCode}</div>`
    res.render('panitiamain', { code: newCode});
})

app.listen(port, () => {
    console.log(`Aplikasi berjalan di http://localhost:${port}`);
});