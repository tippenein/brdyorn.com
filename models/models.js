/* store all models here until there is a reason to split them up */

// salt passwords

exports.setup = function(mongoose, db) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  User = new Schema({
    created: Date,
    username: String,
    password: String,
    email: String
  })
  Contact = new Schema({
    date: Date,
    name: String,
    email: String,
    comment: String
  })
  //register models
  mongoose.model('User', User)
  mongoose.model('Contact', Contact)

  User = db.model('User');
  Contact = db.model('Contact');
}
