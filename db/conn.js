/* db connection exports*/

module.exports = function(mongoose){
  mongoose.connect('mongodb://localhost/test');
  var db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log('connected to db')
  });
}
