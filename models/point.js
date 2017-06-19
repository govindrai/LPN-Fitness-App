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
		date: day }).populate({ path: 'activity', populate: { path: 'unit' }});
};

// gets the total points for each participation object
// and sets the total points to the participation obj's totalPoints property
pointSchema.statics.getTotalPointsForParticipations = participations => {
	return Promise.all(participations.map(participation => {
		return Point.aggregate([{$match: {participation: participation._id}}, {$group: {_id: null, total: {$sum: '$calculatedPoints'}}}]);
	}))
	.then(totalPointObjs => {
		console.log("TOTLA POINTS OBJS", totalPointObjs);
		totalPointObjs.forEach((totalPointObj, index) => {
			participations[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
		});
	})
	.then(()=>{
		return participations.reduce((a, b) =>  a.totalPoints + b.totalPoints);
	});
};

pointSchema.statics.getTotalPointsForParticipatingFamily = (participations, weekStart, weekEnd) => {
	return Promise.all(participations.map(participation => {
		return Point.aggregate([{$match: {$and: [{participation: participation._id}, {date: {$gt: weekStart, $lt: weekEnd}}]}}, {$group: {_id: null, total: {$sum: '$calculatedPoints'}}}]);
	}))
	.then(totalPointObjs => {
		console.log("TOTLA POINTS OBJS", totalPointObjs);
		totalPointObjs.forEach((totalPointObj, index) => {
			participations[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
		});
	})
	.then(()=>{
		return participations.reduce((a, b) =>  a.totalPoints + b.totalPoints);
	});
};

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
