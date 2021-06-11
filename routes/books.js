const express = require('express');
const router = express.Router();

const Book = require('../models/book');
const Author = require('../models/author');

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];

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
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch (err) {
        renderNewPage(res, book, true);
    }
});
//Show Book Route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec();
        res.render('books/show', { book: book });
    } catch (err) {
        res.redirect('/');
    }
});
//Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (err) {
        res.redirect('/');
    }
});
//Update Book Route
router.put('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.description = req.body.description;
        book.pageCount = req.body.pageCount;
        saveCover(book, req.body.cover);
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (err) {
        console.log(err);
        if (book) {
            renderEditPage(res, book, true);
            return;
        }
        res.redirect('/');
    }
});
//Delete Book Route
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch (err) {
        if (book) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove the book'
            });
            return;
        }
        res.redirect('/');
    }
});

function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) {
            let errorString;
            switch (form) {
                case 'new':
                    errorString = 'creating new';
                    break;
                case 'edit':
                    errorString = 'updating';
                    break;
            }
            params.errorMessage = `Error ${errorString} book`;
        }
        res.render(`books/${form}`, params);
    } catch (err) {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null || coverEncoded == '') return;
    const cover = JSON.parse(coverEncoded);
    if (cover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;
