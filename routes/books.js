const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Book = require('../models/book');
const Author = require('../models/author');

const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

//Get all books route
router.get('/', async (req, res) => {
    let query = Book.find();
    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishAfter) {
        query = query.gte('publishDate', req.query.publishAfter);
    }
    if (req.query.publishBefore) {
        query = query.lte('publishDate', req.query.publishBefore);
    }
    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch (err) {
        res.redirect('/');
    }
});
//New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});
//Create new book route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file.filename;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect('books');
    } catch (err) {
        renderNewPage(res, book, true);
    }
});

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) params.errorMessage = 'Error creating new book';
        res.render('books/new', params);
    } catch (err) {
        res.redirect('/books');
    }
}

module.exports = router;
