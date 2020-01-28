const express = require('express')
const router = express.Router()
const Author = require ('../models/authors')
const Book = require('../models/books')
const checkAuth = require('../middleware/checkAuth')

// All Authors Route
router.get('/', async (req, res) =>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

//New Author Route
router.get('/new',checkAuth.checkAuthenticated ,(req, res) =>{
    res.render('authors/new', {author: new Author() })
})

// Create Author Route
router.post('/',checkAuth.checkAuthenticated, async (req,res) =>{
    const author = new Author({
        name: req.body.name
    })
    const existedAuthor = await Author.exists({"name": req.body.name})
    if(existedAuthor){
        res.render('authors/new', {
            author: author,
            errorMessage: 'Existed Author'
            })
        return     
    }
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch (error) {
        res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating Author'
        })
    }   
})
//Show Author
router.get('/:id', async (req,res) =>{
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    } catch (error) {
        res.redirect('/')
    }
})
// Edit author
router.get('/:id/edit',checkAuth.checkAuthenticated, async (req,res) =>{
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author })
    } catch (error) {
        res.redirect('/authors')
    }
    
})
// Update Author
router.put('/:id',checkAuth.checkAuthenticated, async (req, res) =>{
    let author
    try {
        author = await Author.findById(req.params.id)
        existedAuthor = await Author.exists({"name": req.body.name})
        if(existedAuthor){
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Existed Author'
                })
            return  
        }
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch (error) {
        if(author == null){
            res.redirect('/')
        }
        else{
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
                })
        }
    }   
})
//Delete Author
router.delete('/:id',checkAuth.checkAuthenticated, async(req, res) =>{
    const existedAuthor = await Author.exists({"name": req.body.name})
    if(existedAuthor){
        res.render('authors/edit', {
            author: author,
            errorMessage: 'Existed Author'
            })
        return     
    }
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch (error) {
        if(author == null){
            res.redirect('/')
        }
        else{
            res.redirect(`/authors/${author.id}`)
        }
    }   
})


module.exports = router