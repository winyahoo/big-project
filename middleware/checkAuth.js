const User = require('../models/users')


module.exports.checkAuthenticated = async(req,res,next) => {
    
    if(!req.signedCookies.userId){
        res.redirect('/auth/login')
        return
    }
    var user = await User.find({"id": req.signedCookies.userId})
    if(!user){
        res.redirect('/auth/login')
        return
    }
    next()
}
module.exports.checkNotAuthenticated = (req,res, next) => {
    if(!req.signedCookies.userId){
        return next()
    }
    res.redirect('/')
}