const mongoose = require('mongoose');
const Book = require('./book');
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

authorSchema.pre('remove', async function (next) {
    try {
        const books = await Book.find({ author: this.id });
        if (books.length > 0) {
            throw new Error('This author has books still');
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = new mongoose.model('Author', authorSchema);
