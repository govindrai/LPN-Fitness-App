var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Family = require('./family');

var challengeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	date: {
		start: {
			type: Date,
			required: true
		},
		end: {
			type: Date,
			required: true
		},
		registrationStart: {
			type: Date,
			required: true,
			default: new Date()
		},
		registrationEnd: {
			type: Date,
			required: true
		}
	},
	winner: {
		type: Schema.Types.ObjectId,
		ref: 'Family',
		default: null
	},
	schedule: [{
		week: {
			type: Number,
			required: true
		},
		matchups: [{
			family: {
				type: Schema.Types.ObjectId,
				required: true
			},
			versing: {
				type: Schema.Types.ObjectId,
				required: true
			}
		}]
	}]
});

challengeSchema.pre('validate', function(next) {
	this.date.registrationEnd = this.date.start;
	next();
});

challengeSchema.statics.getCurrentChallenge = () => {
	return Challenge.findOne().where('date.start').lt(new Date()).where('date.end').gt(new Date());
};

challengeSchema.statics.getPastChallenges = () => {
	return Challenge.find().populate('winner').where('date.end').lt(new Date()).sort('date.start');
};

challengeSchema.statics.getFutureChallenges = () => {
	return Challenge.find().where('date.start').gt(new Date()).sort('date.start');
};

challengeSchema.statics.getAllExceptPastChallenges = () => {
	return Challenge.find().where('date.end').gt(new Date()).count();
};

challengeSchema.statics.getChallengeByDate = date => {
	return Challenge.find().where('date.start').lt(new Date(date)).where('date.end').gt(new Date(date));
};

// challengeSchema.statics.generateSchedule = () => {
// 	Family.find({}).select('_id name')
// 	.then(families => {
// 		function generateSchedule(families) {
// 			var matches = {
// 				iolite: [],
// 				alexandrite: [],
// 				ruby: [],
// 				sapphire: [],
// 				emerald: [],
// 				topaz: [],
// 				sunstone: [],
// 				bye: []
// 			};
// 			for (var i = 0; i < 7; i++) {
// 				families.forEach((family, index) => {
// 					if (matches[family.name][index] || (family.name == families[i].name)) {
// 						// don't do anything since fam is not free that week
// 					} else {
// 						// add a verse for opposing family
// 						matches[families[i].name].push(family.name);
// 						// add same entry for versing family
// 						matches[family.name][index] = families[i].name;
// 					}
// 				});
// 			}
// 			return matches;
// 		}
// });

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
