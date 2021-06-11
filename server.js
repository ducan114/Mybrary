if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', () => {
    console.log(`Connected to database`);
});

db.on('error', (err) => {
    console.error(err);
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
