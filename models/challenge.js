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
	schedule: {
		type: Object,
		required: true
	}
});

challengeSchema.pre('validate', function(next) {
	this.date.registrationEnd = this.date.start;
	this.generateSchedule()
	.then(() => {
		next();
	})
	.catch(e => console.log("Problem inside generate Schedule", e));
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

challengeSchema.statics.getAllExceptPastChallengesCount = () => {
	return Challenge.find().where('date.end').gt(new Date()).count();
};

challengeSchema.statics.getChallengeByDate = date => {
	return Challenge.find().where('date.start').lt(new Date(date)).where('date.end').gt(new Date(date));
};

challengeSchema.statics.getFamilyIds = () => {
	return Family.find({}).select('_id');
};

challengeSchema.methods.generateSchedule = function() {
	var challenge = this;

	return Challenge.getFamilyIds()
	.then(familyIds => {
		var schedule = {
	    week1: {},
	    week2: {},
	    week3: {},
	    week4: {},
	    week5: {},
	    week6: {},
	    week7: {}
	  };

	  familyIds.forEach((family, index) => {
	    var newFamilies = familyIds.filter(newFamily => newFamily != family);
	    var week = 1;
	    for (var i = 0; i < 7; i++) {
	      var weekNumber = "week" + week;
	      if (schedule[weekNumber][family]) {
	      	// don't do anything since fam not free that week
	      } else if (schedule[weekNumber][newFamilies[i]]) {
	      	var tempFams = newFamilies.slice(i+1);
	    		tempFams.some(tempFam => {
	    			if(schedule[weekNumber][tempFam]) {
	    				return false;
	    				// do nothing as fam is unavailable
	    			} else {
	    				 // add a verse for opposing family
			        schedule[weekNumber][family] = tempFam;
			        // add same entry for versing family
			        schedule[weekNumber][tempFam] = family;
			        newFamilies[newFamilies.indexOf(tempFam)] = newFamilies[i];
							return true;
	    			}
	    		});
	      } else {
	        // add a verse for opposing family
	        schedule[weekNumber][family] = newFamilies[i];
	        // add same entry for versing family
	        schedule[weekNumber][newFamilies[i]] = family;
	      }
      	week++;
	    }
	  });
	  challenge.schedule = schedule;
	  return challenge.save();
	});
};


var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
