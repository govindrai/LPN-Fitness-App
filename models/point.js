var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var pointSchema = new Schema({
	participation: {
		type: Schema.Types.ObjectId,
		ref: 'Participation'
	},
	activity: {
		type: Schema.Types.ObjectId,
		ref: 'Activity',
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	numOfUnits: {
		type: Number,
		required: true
	},
	calculatedPoints: {
		type: Number,
		required: true
	}
});

pointSchema.methods.getUnitName = function(){
	return this.activity.unit.name ;
};

pointSchema.statics.getPointsByDay = function(participation, day){
	return Point.find({participation: participation,
		date: day });
};

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
