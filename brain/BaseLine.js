var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var BaseLine = new Schema({
		value:{type: String, required: true},
});

BaseLine.pre('save', function(next){
  	if ( !this.created_at ) {
			this.created_at = new Date;
 		}
  	next();
});

module.exports = mongoose.model('BaseLine', BaseLine);