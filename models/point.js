const mongoose = require('mongoose');

const logger = require('../utils/logger');

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
      message: 'Can\'t create points with no units.',
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
pointSchema.statics.calculateParticipantPointsByDay = async function (participants, date, user) {
  logger.entered('model:Point:calculateParticpantPointsByDay');
  if (participants.length === 0) {
    return;
  }

  // TODO: this should be done using aggregation
  const participantsPointsProms = participants.map(participant => mongoose.model('Point')
    .aggregate([
      {
        $match: {
          participant: participant._id,
          date,
        },
      }, {
        $lookup: {
          from: 'activities',
          localField: 'activity',
          foreignField: '_id',
          as: 'activity',
        },
      }, {
        $unwind: {
          path: '$activity',
        },
      }, {
        $lookup: {
          from: 'units',
          localField: 'activity.unit',
          foreignField: '_id',
          as: 'activity.unit',
        },
      }, {
        $unwind: {
          path: '$activity.unit',
        },
      },
    ]));

  const pointsArraysArray = await Promise.all(participantsPointsProms);
  participants.forEach((participant, index) => {
    participant.points = pointsArraysArray[index];
    participant.totalDailyPoints = pointsArraysArray[index].reduce((total, point) => total + point.calculatedPoints, 0);
    if (participant.totalDailyPoints % 1 === 0) {
      participant.totalDailyPointsDisplay = participant.totalDailyPoints;
    } else {
      participant.totalDailyPointsDisplay = (participant.totalDailyPoints).toFixed(2);
    }
  });

  participants.sort((a, b) => b.totalDailyPoints - a.totalDailyPoints);

  // always have the signed in user at the top no matter how many points they have
  moveUserToTop(participants, user);
};

// TODO: Fix aggregate here
pointSchema.statics.calculatePointsForWeek = function (participants, weekStart, weekEnd) {
  if (participants.length === 0) {
    return;
  }
  return Promise.all(
    participants.map(participant => mongoose.model('Point')
      .aggregate([
        {
          $match: {
            $and: [{ participant: participant._id }, {
              date: {
                $gte: weekStart,
                $lte: weekEnd,
              },
            }],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$calculatedPoints' },
          },
        },
      ]))
  )
    .then(totalPointObjs => {
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
