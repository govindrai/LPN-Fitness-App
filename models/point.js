const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  participation: {
    type: mongoose.Types.ObjectId,
    ref: 'Participation',
  },
  activity: {
    type: mongoose.Types.ObjectId,
    ref: 'Activity',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  numOfUnits: {
    type: Number,
    required: true,
    validate: {
      validator: value => value !== 0,
      message: "Can't create points with no units.",
    },
  },
  calculatedPoints: {
    type: Number,
    required: true,
  },
});

// For each participant, find all point entries for requested date
// total those points, sort the participants by most points entered
// then if the user who requested this page is in the family, move that
// user to the top of the participants
pointSchema.statics.calculateParticipantPointsByDay = function(participations, date, user) {
  if (participations.length === 0) {
    return;
  }
  return Promise.all(
    participations.map(participation => {
      return Point.find({ participation: participation._id, date }).populate({
        path: 'activity',
        populate: { path: 'unit' },
      });
    })
  ).then(pointsArraysArray => {
    participations.forEach((participation, index) => {
      participation.points = pointsArraysArray[index];
      participation.totalDailyPoints = participation.points.reduce((total, point) => total + point.calculatedPoints, 0);
    });

    participations.sort((a, b) => b.totalDailyPoints - a.totalDailyPoints);

    moveUserToTop(participations, user);
  });
};

pointSchema.statics.calculatePointsForWeek = function(participations, weekStart, weekEnd) {
  if (participations.length === 0) {
    return;
  }
  return Promise.all(
    participations.map(participation => {
      return Point.aggregate([
        {
          $match: {
            $and: [{ participation: participation._id }, { date: { $gte: weekStart, $lte: weekEnd } }],
          },
        },
        { $group: { _id: null, total: { $sum: '$calculatedPoints' } } },
      ]);
    })
  ).then(totalPointObjs => {
    totalPointObjs.forEach((totalPointObj, index) => {
      participations[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
    });
    return participations.reduce((total, participation) => total + participation.totalPoints, 0);
  });
};

const Point = mongoose.model('Point', pointSchema);

module.exports = Point;

// PRIVATE FUNCTIONS

// used inside Point#calculateParticpantPointsByDay
function moveUserToTop(participations, user) {
  if (user) {
    const currentUserIndex = participations.findIndex(participation => participation.user._id.toString() == user._id.toString());
    participations.unshift(participations.splice(currentUserIndex, 1)[0]);
  }
}
