const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

let pointSchema = new Schema({
  participation: {
    type: Schema.Types.ObjectId,
    ref: "Participation"
  },
  activity: {
    type: Schema.Types.ObjectId,
    ref: "Activity",
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

pointSchema.methods.getUnitName = function() {
  return this.activity.unit.name;
};

// For each participant, find all point entries for requested date
// total those points, sort the participants by most points entered
// then if the user who requested this page is in the family, move that
// user to the top of the participants
pointSchema.statics.calculateParticipantPointsByDay = (
  participations,
  date,
  user,
  isFutureWeek
) => {
  if (isFutureWeek) return moveUserToTop(participations, user);
  return Promise.all(
    participations.map(participation => {
      return Point.find({ participation, date }).populate({
        path: "activity",
        populate: { path: "unit" }
      });
    })
  ).then(pointsArray => {
    participations.forEach((participation, index) => {
      participation.points = pointsArray[index];
      participation.totalDailyPoints = participation.points.reduce(
        (total, point) => total + point.calculatedPoints,
        0
      );
    });

    participations.sort((a, b) => b.totalDailyPoints - a.totalDailyPoints);

    moveUserToTop(participations, user);
  });
};

function moveUserToTop(participations, user) {
  if (user !== undefined) {
    var currentUserIndex = participations.findIndex(
      participation => participation.user._id.toString() == user._id.toString()
    );
    participations.unshift(participations.splice(currentUserIndex, 1)[0]);
  }
}

// gets the total points for each participation object
// and sets the total points to the participation obj's totalPoints property
pointSchema.statics.getTotalPointsForParticipationsByChallenge = participations => {
  return Promise.all(
    participations.map(participation => {
      return Point.aggregate([
        { $match: { participation: participation._id } },
        { $group: { _id: null, total: { $sum: "$calculatedPoints" } } }
      ]);
    })
  )
    .then(totalPointObjs => {
      totalPointObjs.forEach((totalPointObj, index) => {
        participations[index].totalPoints = totalPointObj[0]
          ? totalPointObj[0].total
          : 0;
      });
    })
    .then(() => {
      return participations.reduce((a, b) => a.totalPoints + b.totalPoints);
    });
};

pointSchema.statics.calculatePointsForWeek = (
  participations,
  weekStart,
  weekEnd,
  isFutureWeek
) => {
  if (isFutureWeek) return 0;
  return Promise.all(
    participations.map(participation => {
      return Point.aggregate([
        {
          $match: {
            $and: [
              { participation: participation._id },
              { date: { $gt: weekStart, $lt: weekEnd } }
            ]
          }
        },
        { $group: { _id: null, total: { $sum: "$calculatedPoints" } } }
      ]);
    })
  )
    .then(totalPointObjs => {
      totalPointObjs.forEach((totalPointObj, index) => {
        participations[index].totalPoints = totalPointObj[0]
          ? totalPointObj[0].total
          : 0;
      });
    })
    .then(() => {
      return participations.reduce(
        (total, participation) => total + participation.totalPoints,
        0
      );
    });
};

pointSchema.statics.getTotalPointsForDay = (participations, date) => {
  participations.forEach(participation => {
    participation.totalDailyPoints = participation.points.reduce(
      (total, point) => total + point.calculatedPoints
    );
  });
};

var Point = mongoose.model("Point", pointSchema);

module.exports = Point;
