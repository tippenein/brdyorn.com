/* store all models here until there is a reason to split them up */

// salt passwords

exports.setup = function(mongoose, db) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  User = new Schema({
      created: Date
    , username: String
    , password: String
    , email: String
  })

  //register models
  mongoose.model('User', User)
  User = db.model('User');
}
