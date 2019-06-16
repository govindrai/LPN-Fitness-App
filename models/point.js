const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Types.ObjectId,
    ref: 'Participant',
  },
  // need user's id to be able to perform aggregations witout needing to populate particpant records
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
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
pointSchema.statics.calculateParticipantPointsByDay = function (participants, date, user) {
  if (participants.length === 0) {
    return;
  }
  return Promise.all(
    participants.map(participant => Point.find({ participant: participant._id, date }).populate({
        path: 'activity',
        populate: { path: 'unit' },
      }))
  ).then(pointsArraysArray => {
    participants.forEach((participant, index) => {
      participant.points = pointsArraysArray[index];
      participant.totalDailyPoints = participant.points.reduce((total, point) => total + point.calculatedPoints, 0);
      participant.totalDailyPoints = Number(participant.totalDailyPoints).toFixed(2);
    });

    participants.sort((a, b) => b.totalDailyPoints - a.totalDailyPoints);

    moveUserToTop(participants, user);
  });
};

pointSchema.statics.calculatePointsForWeek = function (participants, weekStart, weekEnd) {
  if (participants.length === 0) {
    return;
  }
  return Promise.all(
    participants.map(participant => Point.aggregate([
        {
          $match: {
            $and: [{ participant: participant._id }, { date: { $gte: weekStart, $lte: weekEnd } }],
          },
        },
        { $group: { _id: null, total: { $sum: '$calculatedPoints' } } },
      ]))
  ).then(totalPointObjs => {
    totalPointObjs.forEach((totalPointObj, index) => {
      participants[index].totalPoints = totalPointObj[0] ? totalPointObj[0].total : 0;
    });
    return participants.reduce((total, participant) => total + participant.totalPoints, 0);
  });
};

const Point = mongoose.model('Point', pointSchema);

module.exports = Point;

// PRIVATE FUNCTIONS

// used inside Point#calculateParticpantPointsByDay
function moveUserToTop(participants, user) {
  if (user) {
    const currentUserIndex = participants.findIndex(participant => participant.user._id.toString() == user._id.toString());
    participants.unshift(participants.splice(currentUserIndex, 1)[0]);
  }
}
