/* store all models here until there is a reason to split them up */

exports.setup = function(mongoose, db) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  Comment = new Schema({
    created: Date,
    username: String,
    email: String,
    comment: String
  })
  Contact = new Schema({
    date: Date,
    name: String,
    email: String,
    comment: String
  })
  //register models
  mongoose.model('Comment', Comment)
  mongoose.model('Contact', Contact)

}
