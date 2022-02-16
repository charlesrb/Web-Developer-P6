const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema(
    {
        email: {
            type:String,
            required:true,
            trimp:true,
            lowercase:true,
            validate: [isEmail],
            unique:true
        },
        password: {
            type:String,
            required:true,
    }
}
);



//fonction hash password

userSchema.pre("save", async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//fonction dehash password
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password,user.password)
        if (auth) {
            return user;
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect email')
}
module.exports = mongoose.model('user', userSchema);
