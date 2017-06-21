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
	var challenge = this;
	challenge.date.registrationEnd = this.date.start;
	challenge.date.end = getChallengeEndDate(challenge.date.start);
	challenge.generateSchedule()
	.then((schedule) => {
		challenge.schedule = schedule;
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

challengeSchema.methods.generateSchedule = () => {
	return Family.find()
	.then(families => {
		// use below line to better debug
		// families = families.map(family => family.toObject());
		var schedule = {
	    week1: {},
	    week2: {},
	    week3: {},
	    week4: {},
	    week5: {},
	    week6: {},
	    week7: {}
	  };
	  families.forEach((family, index) => {
	    var newFamilies = families.filter(newFamily => newFamily.name != family.name);
	    var week = 1;
	    for (var i = 0; i < 7; i++) {
	      var weekNumber = "week" + week;
	      if (schedule[weekNumber][family.name]) {
	      	// don't do anything since fam not free that week
	      } else if (schedule[weekNumber][newFamilies[i].name]) {
	      	var tempFams = newFamilies.slice(i+1);
	    		tempFams.some(tempFam => {
	    			if(schedule[weekNumber][tempFam.name]) {
	    				return false;
	    				// do nothing as fam is unavailable
	    			} else {
	    				 // add a verse for opposing family
			        schedule[weekNumber][family.name] = tempFam;
			        // add same entry for versing family
			        schedule[weekNumber][tempFam.name] = family;

			        var matchingIndex;
			        for (var j = 0; j < newFamilies.length; j++) {
			        	if (tempFam.name == family.name) {
			        		matchingIndex = j;
			        		return;
			        	}
			        }

			        newFamilies[matchingIndex] = newFamilies[i];
							return true;
	    			}
	    		});
	      } else {
	        // add a verse for opposing family
	        schedule[weekNumber][family.name] = newFamilies[i];
	        // add same entry for versing family
	        schedule[weekNumber][newFamilies[i].name] = family;
	      }
      week++;
	    }
	  });
	  return schedule;
	});
};

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

// Private Helper Functions

function getChallengeEndDate(startDate) {
	var date = new Date(startDate.getTime());
	date.setDate(startDate.getDate() + 63);
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}