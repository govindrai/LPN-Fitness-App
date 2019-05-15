  
participation: {
    type: mongoose.Types.ObjectId,
  },
  activity: {
    type: mongoose.Types.ObjectId,
  },
  date: {
    type: Date,
  },
  numOfUnits: {
    type: Number,
  },
  calculatedPoints: {
    type: Number,
  },
});