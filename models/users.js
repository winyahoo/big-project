const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})
userSchema.query.byEmail = function(email) {
    return this.where({ email: new RegExp(email, 'i') });
  };

var User = mongoose.model('User', userSchema)

module.exports = User