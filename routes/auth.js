const express = require('express')
const router = express.Router()
const User = require ('../models/users')
const checkAuth = require('../middleware/checkAuth')
const bcryptjs = require('bcryptjs')






router.get('/login', checkAuth.checkNotAuthenticated ,(req,res) => {
    res.render('auth/login.ejs')
})

router.get('/register', checkAuth.checkNotAuthenticated, (req,res) => {
    res.render('auth/register.ejs')
})

router.post('/register', checkAuth.checkNotAuthenticated, async (req,res) => {
    const hashedPassword = await bcryptjs.hash(req.body.password,10)
        const user = new User({
        name: req.body.name,
        email: req.body.email,          
        password: hashedPassword
        })
    try{
        
        user.save()
        res.redirect('/auth/login')
    }catch{
        res.redirect('/auth/register')
    }
    console.log(user)
})

router.post('/login',checkAuth.checkNotAuthenticated , async(req, res) =>{
    var email = req.body.email
    var user =  await User.findOne().byEmail(email)
     if(user._doc.email !== email){
        res.render('auth/login.ejs', {
            errors: ["No user with that email"]
            
        })
         return 
     }
    
    if(await bcryptjs.compare(req.body.password, user._doc.password) === false){
        res.render('auth/login.ejs', {
            errors: ["Password incorrect"]
        })
        return
    }
    res.cookie('userId', user.id, {
        signed: true
    })
    res.redirect('/')
})

router.delete('/logout', checkAuth.checkAuthenticated, (req,res) => {
    res.clearCookie('userId')
    res.redirect('/')
})





module.exports= router