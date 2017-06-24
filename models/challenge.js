var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	schedule = require('node-schedule');

var Family = require('./family'),
	Participation = require('./participation'),
	Point = require('./point');

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
	},
	jobs: {
		type: Array
	}
});

challengeSchema.pre('validate', function (next) {
	var challenge = this;
	if (challenge.date.registrationEnd) {
		next();
	} else {
		challenge.date.registrationEnd = this.date.start;
		challenge.date.end = getChallengeEndDate(challenge.date.start);
		challenge.generateSchedule()
		.then(schedule => {
			challenge.schedule = schedule;
			challenge.scheduleUpdateWeeklyWinsJob();
			next();
		})
		.catch(e => console.log("Problem inside generate Schedule", e));
	}
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
			        schedule[weekNumber][family.name] = {versingFamily: tempFam};
			        // add same entry for versing family
			        schedule[weekNumber][tempFam.name] = {versingFamily: family};

			        // now that a family has been added
			        // swap places of added family with family that should've been added
			        var matchingIndex;
			        for (var j = 0; j < newFamilies.length; j++) {
			        	if (tempFam.name == newFamilies[j].name) {
			        		matchingIndex = j;
			        		break;
			        	}
			        }
			        newFamilies[matchingIndex] = newFamilies[i];
							return true;
	    			}
	    		});
	      } else {
	        // add a verse for opposing family
	        console.log(schedule);
	        console.log(weekNumber);
	        console.log(family);
	        console.log(family.name);
	        schedule[weekNumber][family.name] = {versingFamily: newFamilies[i]};
	        // add same entry for versing family
	        schedule[weekNumber][newFamilies[i].name] = {versingFamily: family};
	      }
      week++;
	    }
	  });

	  console.log(Object.keys(schedule))
	  Object.keys(schedule).forEach(week => {
	  	console.log(Object.keys(schedule[week]));
	  	Object.keys(schedule[week]).forEach(contender => {
	  		schedule[week][contender].status = "TBD";
	  		schedule[week][contender].finalScore = "TBD";
	  		schedule[week][contender].versingFinalScore = "TBD";
	  	});
	  });

	  return schedule;
	});
};

challengeSchema.methods.scheduleUpdateWeeklyWinsJob = function() {
	var currentChallenge = this;
	var startTime = this.date.start.getTime();
	var scheduleOptions = {start: startTime, end: endTime, hour: 0, minute: 0, second: 0, dayOfWeek: 1};
	// FOR TESTING, uncomment next two lines
	var testStartTime = new Date(Date.now() + 15000);
	var minute = new Date();
	minute = minute.getMinutes() + 1;
	var testScheduleOptions = {start: testStartTime, end: endTime, minute: minute, dayOfWeek: 5};

	var endTime = this.date.end;


	schedule.scheduleJob(testScheduleOptions, function() {
		var week = "week" + getWeekNumber(currentChallenge.date.end);
		var families = Object.keys(currentChallenge.schedule[week]);
		var versingFamilyParticipations;
		Promise.all(families.map(family => {
			var versingFamily = currentChallenge.schedule[week][family].versingFamily;
			return Participation.getParticipationForChallengeByFamily(currentChallenge._id, versingFamily._id)
			.then(versingFamilyParticipationsArray => {
				versingFamilyParticipations = versingFamilyParticipationsArray;
				var lastMonday = new Date();
				lastMonday.setDate(lastMonday.getDate() - 7);
				lastMonday = new Date(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate());
				var mondayMorning = new Date();
				mondayMorning = new Date(mondayMorning.getFullYear(), mondayMorning.getMonth(), mondayMorning.getDate());
				return Point.getTotalPointsForParticipationsByWeek(versingFamilyParticipations, lastMonday, mondayMorning);
			})
			.then(versingTotalPoints => {
				var versingFinalScore = calculatePoints(versingTotalPoints);
				currentChallenge.schedule[week][family].versingFinalScore = versingFinalScore;
				var actualFamily = currentChallenge.schedule[week][family].versingFamily.name;
				currentChallenge.schedule[week][actualFamily].finalScore = versingFinalScore;
			})
			.catch(e => console.log("WHAT's GOOING ON INSIDE PROMISE ALL", e));
		}))
		.then(() => {
  		families.forEach(family => {
  			var status;
  			if (currentChallenge.schedule[week][family].finalScore == currentChallenge.schedule[week][family].versingFinalScore) {
  				status = "Tie";
  			} else if (currentChallenge.schedule[week][family].finalScore - currentChallenge.schedule[week][family].versingFinalScore < 0) {
  				status = "Lost";
  			} else {
  				status = "Won";
  			}

  			currentChallenge.schedule[week][family].status = status;
  		});
  		currentChallenge.markModified('schedule');
  		return currentChallenge.save();
  	})
  	.then(() => {
  		console.log("WORKER RAN!!!, Current Challenge Saved");
  		console.log(currentChallenge.schedule);
  	})
  	.catch(e => console.log("SCHEDULER FAILED BRO", e));
	});
};


// let startTime = new Date(Date.now() + 5000);
// let endTime = new Date(startTime.getTime() + 5000);
// var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
//   console.log('Time for tea!');
// });

var Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

// Private Helper Functions

function getChallengeEndDate(startDate) {
	var date = new Date(startDate.getTime());
	date.setDate(startDate.getDate() + 63);
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// have to get day before since challenge ends on
// Monday at 12:00:00 AM instead of Sunday at 11:59:59 PM
function getWeekNumber(challengeEndDate) {
  beginningOfToday = new Date();
  beginningOfToday = new Date(beginningOfToday.getFullYear(), beginningOfToday.getMonth(), beginningOfToday.getDate());
  return Math.ceil((63 - Math.abs(dateDiffInDays(challengeEndDate, beginningOfToday)))/7);
}

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  var _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function calculatePoints(familyTotalPoints, numOfParticipants) {
  numOfParticipants = numOfParticipants >= 5 ? numOfParticipants : 5;
  return (familyTotalPoints/numOfParticipants).toFixed(2);
}