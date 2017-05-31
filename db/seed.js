var mongoose = require('./mongoose'),
  Activity = require('./../models/activity'),
  User = require('./../models/user'),
  Family = require('./../models/family'),
  Challenge = require('./../models/challenge'),
  Point = require('./../models/point'),
  // Participation = require('./../models/participation'),
  Unit = require('./../models/unit');

// User.insertMany([
// ])

// new Promise(resolve.Family.remove({justOne: false})

var iolite,
  sunstone,
  ruby,
  emerald,
  sapphire,
  topaz
  alexandrite;

Family.insertMany([
  {
    name: 'Iolite',
    motto: 'The best family',
    challengesWon: 3,
    playoffsReached: 4
  },
  {
    name: 'Alexandrite',
    motto: 'The 2nd best family',
    challengesWon: 4,
    playoffsReached: 3
  },
  {
    name: 'Sunstone',
    motto: 'A family in LPN',
    challengesWon: 5,
    playoffsReached: 2
  },
  {
    name: 'Ruby',
    motto: 'Another family in LPN',
    challengesWon: 3,
    playoffsReached: 1
  },
  {
    name: 'Sapphire',
    motto: 'Yet another family in LPN',
    challengesWon: 2,
    playoffsReached: 1
  },
  {
    name: 'Topaz',
    motto: 'A chill family in LPN',
    challengesWon: 2,
    playoffsReached: 2
  },
  {
    name: 'Emerald',
    motto: 'Almost forgot this family',
    challengesWon: 1,
    playoffsReached: 2
  }
]).then(families => {
  families.forEach(familiy => {
    switch (family.name) {
      case 'Iolite':
        iolite = family;
        break;
      case 'Alexandrite':
        alexandrite = family;
        break;
      case 'Sunstone':
        sunstone = family;
        break;
      case 'Ruby':
        ruby = family;
        break;
      case 'Sapphire':
        sapphire = family;
        break;
      case 'Topaz':
        topaz = family;
        break;
      case 'Emerald':
        emerald = family;
        break;
      default
        console.log("i don't know that family");
    }
  })
})
.catch(e => console.log(e));

User.insertMany([
  {
    email: 'edwardchow@gmail.com'
    name: {
      first: 'Edward',
      last: 'Chow',
      nickname: 'EdwardChow'
    },
    password: '123456',
    family: '',
    allTimePoints: 100

  },
  {
    email: 'michaelwen@gmail.com',
    name: {
      first: 'Michael',
      last: 'Wen',
      nickname: 'MichaelWen'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'adamwhitescarver@gmail.com',
    name: {
      first: 'Adam',
      last: 'White',
      nickname: 'AdamWhitescarver'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'steventrinh@gmail.com',
    name: {
      first: 'Steven',
      last: 'Trinh',
      nickname: 'StevenTrinh'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'callydai@gmail.com',
    name: {
      first: 'Cally',
      last: 'Dai',
      nickname: 'CallyDai'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'brittanyyoung@gmail.com',
    name: {
      first: 'Brittany',
      last: 'Young',
      nickname: 'BrittanyYoung'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'patricklai@gmail.com',
    name: {
      first: 'Patrick',
      last: 'Lai',
      nickname: 'PatrickLai'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'amandagieg@gmail.com',
    name: {
      first: 'Amanda',
      last: 'Gieg',
      nickname: 'AmandaGieg'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'shannonlee@gmail.com',
    name: {
      first: 'Shannon',
      last: 'Lee',
      nickname: 'ShannonLee'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'stephenlee@gmail.com',
    name: {
      first: 'Stephen',
      last: 'Lee',
      nickname: 'StephenLee'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'kevinau@gmail.com',
    name: {
      first: 'Kevin',
      last: 'Au',
      nickname: 'KevinAu'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'govindrai@gmail.com',
    name: {
      first: 'Govind',
      last: 'Rai',
      nickname: 'GovindRai'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'jeffersonchen@gmail.com',
    name: {
      first: 'Jefferson',
      last: 'Chen',
      nickname: 'JeffersonChen'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'aileenju@gmail.com',
    name: {
      first: 'Aileen',
      last: 'Ju',
      nickname: 'AileenJu'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'ivanwoo@gmail.com',
    name: {
      first: 'Ivan',
      last: 'Woo',
      nickname: 'IvanWoo'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'sophiaduong@gmail.com',
    name: {
      first: 'Sophia',
      last: 'Duong',
      nickname: 'SophiaDuong'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'harrisonhuang@gmail.com',
    name: {
      first: 'Harrison',
      last: 'Huang',
      nickname: 'HarrisonHuang'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'emilyrong@gmail.com',
    name: {
      first: 'Emily',
      last: 'Rong',
      nickname: 'EmilyRong'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'irischan@gmail.com',
    name: {
      first: 'Iris',
      last: 'Chan',
      nickname: 'IrisChan'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'michellele@gmail.com',
    name: {
      first: 'Michelle',
      last: 'Le',
      nickname: 'MichelleLe'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'jackiesiu@gmail.com',
    name: {
      first: 'Jackie',
      last: 'Siu',
      nickname: 'JackieSiu'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'scotthenry@gmail.com',
    name: {
      first: 'Scott',
      last: 'Henry',
      nickname: 'ScottHenry'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'artreyes@gmail.com',
    name: {
      first: 'Art',
      last: 'Reye,
      nickname: 'Art'sRey'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'eliselin@gmail.com',
    name: {
      first: 'Elise',
      last: 'Lin',
      nickname: 'EliseLin'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'calvinchan@gmail.com',
    name: {
      first: 'Calvin',
      last: 'Chan',
      nickname: 'CalvinChan'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'kurtkline@gmail.com',
    name: {
      first: 'Kurt',
      last: 'Kline,
      nickname: 'Kurt'Klin'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'shoumyodewan@gmail.com',
    name: {
      first: 'Shoumyo',
      last: 'Dewan',
      nickname: 'ShoumyoDewan'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'andypark@gmail.com',
    name: {
      first: 'Andy',
      last: 'Park',
      nickname: 'AndyPark'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'parthdhingreja@gmail.com',
    name: {
      first: 'Parth',
      last: 'Dhingr,
      nickname: 'Parth'ejaDhing'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'trinhtruong@gmail.com',
    name: {
      first: 'Trinh',
      last: 'Truong,
      nickname: 'Trinh'Truon'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'christinatruong@gmail.com',
    name: {
      first: 'Christina',
      last: 'Truong',
      nickname: 'ChristinaTruong'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'richardperez@gmail.com',
    name: {
      first: 'Richard',
      last: 'Perez',
      nickname: 'RichardPerez'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'vivianmai@gmail.com',
    name: {
      first: 'Vivian',
      last: 'Mai',
      nickname: 'VivianMai'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'henryhe@gmail.com',
    name: {
      first: 'Henry',
      last: 'He',
      nickname: 'HenryHe'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'annatran@gmail.com',
    name: {
      first: 'Anna',
      last: 'Tran',
      nickname: 'AnnaTran'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'ryanteo@gmail.com',
    name: {
      first: 'Ryan',
      last: 'Teo',
      nickname: 'RyanTeo'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'vinayakdhingreja@gmail.com',
    name: {
      first: 'Vinayak',
      last: 'Dhingrej,
      nickname: 'Vinayak'aDhingre'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'tracylam@gmail.com',
    name: {
      first: 'Tracy',
      last: 'Lam',
      nickname: 'TracyLam'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'michaelho@gmail.com',
    name: {
      first: 'Michael',
      last: 'Ho',
      nickname: 'MichaelHo'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'staceyli@gmail.com',
    name: {
      first: 'Stacey',
      last: 'Li',
      nickname: 'StaceyLi'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'andrewkuo@gmail.com',
    name: {
      first: 'Andrew',
      last: 'Kuo',
      nickname: 'AndrewKuo'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'jaytsui@gmail.com',
    name: {
      first: 'Jay',
      last: 'Tsui,
      nickname: 'Jay'Tsu'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'nicoperez@gmail.com',
    name: {
      first: 'Nico',
      last: 'Perez,
      nickname: 'Nico'Pere'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  {
    email: 'ireneear@gmail.com',
    name: {
      first: 'Irene',
      last: 'Ear',
      nickname: 'IreneEar'
    },
    password: '123456',
    family: '',
    allTimePoints:

  },
  ]
])
.then(users => console.log("success"))
.catch(e => console.log(e));
