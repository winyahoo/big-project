const express = require('express')
const router = express.Router()
const Book = require ('../models/books')
const Author = require('../models/authors')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const checkAuth = require('../middleware/checkAuth')

// All Books Route
router.get('/', async (req, res) =>{
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query= query.regex('title', new RegExp(req.query.title, 'i')) //i is dont care upcase or lowcase
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query= query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query= query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
        books: books,
        searchOptions: req.query
    })
    }catch{
        res.redirect('/')
    }
})

//New Book Route 
router.get('/new', checkAuth.checkAuthenticated, async (req, res) =>{
    renderNewPage(res, new Book(), )
})

// Create Book Route
router.post('/', async (req,res) =>{
   const book = new Book({
       title: req.body.title,
       author: req.body.author,
       publishDate: new Date(req.body.publishDate),
       pageCount: req.body.pageCount,
       description: req.body.description
   })
   const existedBook = await Book.exists({"title": req.body.title})
   if(existedBook){
        renderNewPage(res, book, true, true)
       return     
   }
   saveCover(book, req.body.cover)
   try {
       const newBook = await book.save()
       res.redirect(`books/${newBook.id}`)
   } catch {   
    renderNewPage(res, book, true)
   }
})
//Show Book Route
router.get('/:id', async (req, res) =>{
    try {
        const book = await Book.findById(req.params.id).populate('author').exec() // add info author
        res.render('books/show', {book: book})
    } catch (error) {
        res.redirect('/')
    }
})

//Edit Book Route 
router.get('/:id/edit', async (req, res) =>{
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book )
    } catch (error) {
        res.redirect('/')
    }
})

// Update Book Route
router.put('/:id', async (req,res) =>{
    let book
   try {
       book = await Book.findById(req.params.id)
       book.title= req.body.title
       book.author= req.body.author
       book.publishDate= new Date(req.body.publishDate)
       book.pageCount= req.body.pageCount
       book.description = req.body.description
       const existedBook = await Book.exists({"title": req.body.title})
        if(existedBook){
            renderEditPage(res, book, true, true)
            return
        }
       if(req.body.cover != null  && req.body.cover != ''){
           saveCover(book,req.body.cover)
       }
       await book.save()
       res.redirect(`/books/${book.id}`)
   } catch {   
        if(book != null){
            renderEditPage(res, book, true)
        }else{
            redirect('/')
        }
   }
})
//Delete Book Route
router.delete('/:id', async (req,res) =>{
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if(book != null){
            res.render('/books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        }else{
            res.redirect('/')
        }
    }
})

async function renderFormPage(res, book, form ,hasError = false, existedBook = false){
    try{
        const authors= await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'Error Editing Book'
            }else{
                params.errorMessage = 'Error Creating Book'
            }
        }
        if(existedBook){
            params.errorMessage = 'Existed Book'
        }
        res.render(`books/${form}`, params)
    }catch{
        res.redirect('/books')
    }
}
async function renderNewPage(res, book, hasError = false, existedBook = false){
    renderFormPage(res,book,'new', hasError, existedBook)
}

async function renderEditPage(res, book, hasError = false, existedBook = false){
   renderFormPage(res,book, 'edit', hasError, existedBook)
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}


module.exports = router