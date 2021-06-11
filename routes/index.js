const express = require('express');
const Book = require('../models/book');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ createdAt: 'desc' })
            .limit(10)
            .exec();
        res.render('index', { books: books });
    } catch (err) {
        res.render('index', { books: [] });
    }
});

module.exports = router;
