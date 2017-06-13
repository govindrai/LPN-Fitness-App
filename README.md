# Lambda Phi Nu Fitness App
Custom Node.js app built for UC Irvine's professional co-ed business fraternity, [Lambda Phi Nu](http://lambdaphinu.com/) (LPN), to support an initiative for having all constituents stay healthy and take charge of personal health.

## Preface
Although created specifically for LPN and it's specifications, this app is open source under an MIT license. You can use this app in your own organizations and we highly recommend collaboration. Feel free to fork the project and create your own version of the application or submit pull requests to further the app. 

## Background
LPN is comprised of seven distinct houses: Alexandrite, Emerald, Iolite, Ruby, Sapphire, Sunstone and Topaz. To promote a healthy lifestyle, LPN hosts nine week fitness challenges, where different houses in LPN go head to head every week to compete for most points through various fitness activities with the higher averaging house earning the win. Each team plays one another (first 7 weeks), and the top four teams make it to the playoffs (final two weeks).  

## Problem
Traditionally, the fraternity implemented the competition through Google Sheets. However, as the challenge grew, so did its complexity and time required to manage the program. In additon, the user experience, or lack therof, has been a key factor in deterring participation. Here are some screenshots for perspective:


Having once been a part of this fraternity and having web development experience, I saw this as a perfect opportunity to practice my skills and give back to an organization that helped me shape my career and make lifelong friendships.

## Authors
Cally Dai, UX/UI Designer
Govind Rai, Full Stack Web Developer
Vilde Vevatne, Full Stack Web Developer

## Technology Stack
#### Backend & ORM
Node.js
MongoDB
Mongoose.js
Redis

#### Frameworks
Express.js

#### Frontend
Pug.js
Typeahead.js
SASS
jQuery

#### Authentication & Authorization
JSON Web Token
Bcrypt

#### Other
Lodash.js


## Feature Roadmap ##

### Implement secret code during registration
- Currently anyone can register and gain access to the application

### Todos ###
- points/new
    + ✅ Add a date field, which defaults to today and has a min of Monday and a max of Sunday
    + ✅ Users can add points for a given week up to the next Monday at 12 pm
    + ✅ Users cannot prefill points in for future days
- families/:familyName
    + Display all participants (in a table format) from family who are participating, ordered by total contribution on current challenge
        * Table Head needs to be Monday-Sunday with respective dates
        * clicking on a certain date should trigger points
- challenges/index
    + Display challenges in right order on challenges index


- challenges/new
 - For new challenges, ensure end date is after start date
 - Automate dates so only start date is necessary
 - Add field for weeks
 - Days or time remaining until registration deadline (challenges index) + until current challenge ends  
- Index
 - Display the name of user + nickname 
 - Total points (all time)
 - Points for current challenge
 - If not participating, then show message that suggests you sign up for challenge

 
