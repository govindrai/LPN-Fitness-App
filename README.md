# Lambda Phi Nu Fitness Challenge App

This app will help Lambda Phi Nu members track their fitness and lead their families to victory.

## Feature Roadmap ##

### Implement secret code during registration
- Currently anyone can register and gain access to the application

### Todos ###
- points/new
    + Add a date field, which defaults to today and has a min of Monday and a max of Sunday
    + Users can add points for a given week up to the next Monday at 12 pm
- families/:familyName
    + Display all participants (in a table format) from family who are participating, ordered by total contribution on current challenge
        * Table Head needs to be Monday-Sunday with respective dates
        * clicking on a certain date should trigger points


- challenges/index
    + Display challenges in right order on challenges index
- challenges/new
 - For new challenges, ensure end date is after start date
 - Automate dates so only start date is neccessary
 - Add field for weeks
 - Days or time remaining until registration deadline (challenges index) + until current challenge ends  
- Index
 - Display the name of user + nickname 
 - Total points (all time)
 - Points for current challenge
 - If not participating, then show message that suggests you sign up for challenge

 
