const mongoose=require('mongoose');
const argon2= require('argon2')



const userSchema =new schema.mongoose({
    username:{
        type:String,
        required:[true,'username is required'],
        unique:[true, 'username must be unique']
    },
    email:{
        type:String,
        required:[true, 'Email is required'],
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,'password is required']

    },
    createdAt:{
        type:Date,
        defaulf:Date.now
    }
},{
timestamps:true
})



userSchema.pre('save', async function(next){
    if(this.isModified('this.password'))
        try {
             this.password = await argon2.hash(this.password)
        } catch (error) {
           return next(error) 
        }
})

userSchema.methods.comparepasswords=async function(candidatepassword){
    try {
        return await argon2.verify(this.password,candidatepassword)
    } catch (error) {
        throw error
    }
}


userSchema.index({username:text});
const user =mongoose.model('User',userSchema);
module.export= User




