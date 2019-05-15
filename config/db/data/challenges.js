function getMonday(date) {
  const monday = new Date(date.getTime());
  monday.setDate(date.getDate() - (date.getDay() - 1));
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
}

// generates an array of dates for challenges
// generates two dates in the past, two in the future and one in the present
function getChallengeStartDates() {
  const dates = [];

  const thisMonday = getMonday(new Date());

  const lastYear = new Date(thisMonday.getTime());
  lastYear.setDate(lastYear.getDate() - 365);

  const twoYearsAgo = new Date(thisMonday.getTime());
  twoYearsAgo.setDate(twoYearsAgo.getDate() - 730);

  const nextYear = new Date(thisMonday.getTime());
  nextYear.setDate(nextYear.getDate() + 365);

  const twoYearsLater = new Date(thisMonday.getTime());
  twoYearsLater.setDate(twoYearsLater.getDate() + 730);

  dates.push(thisMonday, getMonday(lastYear), getMonday(twoYearsAgo), getMonday(nextYear), getMonday(twoYearsLater));
  return dates;
}

const startDates = getChallengeStartDates();

const challenges = [
  {
    name: 'THE CURRENT CHALLENGE',
    date: {
      start: startDates[0],
    },
    status: 'Current',
  },
  {
    name: 'LAST YEAR CHALLENGE',
    date: {
      start: startDates[1],
    },
    status: 'Completed',
  },
  {
    name: 'TWO YEARS AGO CHALLENGE',
    date: {
      start: startDates[2],
    },
    status: 'Completed',
  },
  {
    name: 'NEXT YEAR CHALLENGE',
    date: {
      start: startDates[3],
    },
    status: 'Upcoming',
  },
  {
    name: 'TWO YEARS LATER CHALLENGE',
    date: {
      start: startDates[4],
    },
    status: 'Upcoming',
  },
];

module.exports = challenges;
