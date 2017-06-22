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
	return this.activity.unit.name;
};

pointSchema.statics.getPointsForParticipationsByDay = (participations, date, user) => {
	return Promise.all(participations.map(participation => {
		return Point.find({participation, date}).populate({ path: 'activity', populate: { path: 'unit' }});
	}))
	.then(pointsArray => {
		participations.forEach((participation, index) => {
			participation.points = pointsArray[index];
			participation.totalDailyPoints = participation.points.reduce((total, point) => total + point.calculatedPoints, 0);
		});

		participations.sort((a,b) => b.totalDailyPoints - a.totalDailyPoints);

		if (user !== undefined) {
			var currentUserIndex = participations.findIndex(participation => participation.user._id.toString() == user._id.toString());
			console.log("CURRENT USER INDEX", currentUserIndex);
			participations.unshift(participations.splice(currentUserIndex, 1)[0]);
			console.log(participations);
		}
	});
};

// gets the total points for each participation object
// and sets the total points to the participation obj's totalPoints property
pointSchema.statics.getTotalPointsForParticipationsByChallenge = participations => {
	return Promise.all(participations.map(participation => {
		return Point.aggregate([{$match: {participation: participation._id}}, {$group: {_id: null, total: {$sum: '$calculatedPoints'}}}]);
	}))
	.then(totalPointObjs => {
		totalPointObjs.forEach((totalPointObj, index) => {
			participations[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
		});
	})
	.then(()=>{
		return participations.reduce((a, b) =>  a.totalPoints + b.totalPoints);
	});
};

pointSchema.statics.getTotalPointsForParticipationsByWeek = (participations, weekStart, weekEnd) => {
	return Promise.all(participations.map(participation => {
		return Point.aggregate([{$match: {$and: [{participation: participation._id}, {date: {$gt: weekStart, $lt: weekEnd}}]}}, {$group: {_id: null, total: {$sum: '$calculatedPoints'}}}]);
	}))
	.then(totalPointObjs => {
		totalPointObjs.forEach((totalPointObj, index) => {
			participations[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
		});
	})
	.then(()=>{
		return participations.reduce((total, participation) => total + participation.totalPoints, 0);
	});
};

pointSchema.statics.getTotalPointsForDay = (participations, date) => {
	participations.forEach(participation => {
		participation.totalDailyPoints = participation.points.reduce((total, point) => total + point.calculatedPoints);
	});
};

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
