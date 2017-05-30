var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var pointSchema = new Schema({
	participationId: {
		type: Schema.Types.ObjectId,
		ref: 'Participation'
	},
	activityId: {
		type: Schema.Types.ObjectId,
		ref: 'Activity',
		required: true
	},
	points: {
		type: Number,
		required: true
	}
});

pointSchema.methods.getUnitName = function(){
	return this.activityId.unitId.name ;
}; 

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
