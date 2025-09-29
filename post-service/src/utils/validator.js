const joi= require('joi')

const ValidationcreatePost= (data)=>{
    const schema= joi.object({
       content:joi.string().min(3).max(5000).required()
    })
    return schema.validate(data)

}


module.exports=(ValidationcreatePost )