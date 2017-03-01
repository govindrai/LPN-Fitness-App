require 'sqlite3'

# DATABASE SCHEMA

create_users_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR(100),
    fullname VARCHAR(100),
    nickname VARCHAR(200),
    admin BOOLEAN,
    family_id INTEGER,
    FOREIGN KEY(family_id) REFERENCES families(family_id)
  )
DELIMITER

create_challenges_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS challenges (
    challenges_id INTEGER PRIMARY KEY,
    challenge_name VARCHAR(255),
    challenge_start_date DATE,
    challenge_end_date DATE,
    challenge_enrollment_start_date DATE,
    challenge_enrollment_end_date DATE
  )
DELIMITER

create_users_challenges_junction_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS users_challenges
    user_id INTEGER,
    challenge_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(challenge_id) REFERENCES challenges(challenge_id)
  )
DELIMITER

create_users_points_junction_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS users_points (
    user_id INTEGER,
    challenge_id INTEGER,
    activity_id INTEGER,
    comments MEDIUMTEXT,
    points INTEGER,
    date_of_activity DATE,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(challenge_id) REFERENCES challenges(challenge_id)
  )
DELIMITER

create_activities_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS activities (
    activity_id INTEGER PRIMARY KEY,
    activity_name_and_description VARCHAR(200),
    point_value INTEGER
  )
DELIMITER

create_families_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS families (
    family_id INTEGER PRIMARY KEY,
    family_name VARCHAR(50),
    family_slogan MEDIUMTEXT
  )
DELIMITER

# FITNESS CHALLENGE METHODS

def execute_batch_queries_if_empty(db, table, queries)
  count = db.execute("SELECT COUNT(1) FROM #{table}")
  if count[0][0] === 0
    queries.each do |query|
      db.execute(query)
    end
  end
end

def add_families(db)
  add_families_queries = [
    "INSERT INTO families(family_name, family_slogan) VALUES ('Iolite', 'The best family')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Alexandrite', 'The 2nd best family')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Sunstone', 'A family in LPN')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Ruby', 'Another family in LPN')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Sapphire', 'Yet another family in LPN')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Topaz', 'A chill family in LPN')",
    "INSERT INTO families(family_name, family_slogan) VALUES ('Emerald', 'Almost forgot this family')",
  ]
  execute_batch_queries_if_empty(db, 'families', add_families_queries)
end

def add_activities(db)
  add_activities_queries = [
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (1,'150 jump ropes')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (1,'1 mile bike (>5 min pace)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (2,'1 mile bike (<5 min pace)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (2,'biking - for every 100 ft. of additional elevation')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (2,'1 mile elliptical')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (2,'1 mile walk (>15 min pace)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (3,'1 mile run/walk (10-15 min pace)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'1 mile hike (outdoors on trail)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'1500 meters rowing machine')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'15 min weightlifting (body weight exercises like pushups, pullups, etc included)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'15 min swimming')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'15 min abs (not in a class)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (4,'1 mile run (<10 min pace)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (6,'30 min sports game - basketball, volleyball, badminton, etc. (actual game, not just warming up)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (8,'1 hour class like pilates, yoga, zumba, rock climbing, martial arts, etc.')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (12,'9 holes of golf')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (12,'30 min intense workout (p90x, parkour, cycling class, crossfit)')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (12,'surfing - 1 hour')",
    "INSERT INTO activities(activity_name_and_description, point_value) VALUES (15,'snowboarding - half day')",
  ]
  execute_batch_queries_if_empty(db, 'activities', add_activities_queries)
end

def add_users(db)
  add_users_queries = [
    "INSERT INTO users(user_id, username, admin) VALUES (1, 'superuser', 'true')",
    "INSERT INTO users(username, fullname, family_id) VALUES ('edwardchow', 'Edward Chow',1)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('michaelwen', 'Michael Wen',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('adamwhitescarver', 'Adam Whitescarver',3)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('steventrinh', 'Steven Trinh',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('callydai', 'Cally Dai',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('brittanyyoung', 'Brittany Young',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('patricklai', 'Patrick Lai',4)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('amandagieg', 'Amanda Gieg',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('shannonlee', 'Shannon Lee',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('stephenlee', 'Stephen Lee',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('kevinau', 'Kevin Au',3)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('govindrai', 'Govind Rai',1)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('jeffersonchen', 'Jefferson Chen',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('aileenju', 'Aileen Ju',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('ivanwoo', 'Ivan Woo',4)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('sophiaduong', 'Sophia Duong',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('harrisonhuang', 'Harrison Huang',1)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('emilyrong', 'Emily Rong',3)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('irischan', 'Iris Chan',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('michellele', 'Michelle Le',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('jackiesiu', 'Jackie Siu',1)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('scotthenry', 'Scott Henry',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('artreyes', 'Art Reyes',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('eliselin', 'Elise Lin',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('calvinchan', 'Calvin Chan',3)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('kurtkline', 'Kurt Kline',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('shoumyodewan', 'Shoumyo Dewan',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('andypark', 'Andy Park',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('parthdhingreja', 'Parth Dhingreja',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('trinhtruong', 'Trinh Truong',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('christinatruong', 'Christina Truong',3)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('richardperez', 'Richard Perez',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('vivianmai', 'Vivian Mai',4)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('henryhe', 'Henry He',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('annatran', 'Anna Tran',4)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('ryanteo', 'Ryan Teo',7)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('vinayakdhingreja', 'Vinayak Dhingreja',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('tracylam', 'Tracy Lam',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('michaelho', 'Michael Ho',6)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('staceyli', 'Stacey Li',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('andrewkuo', 'Andrew Kuo',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('jaytsui', 'Jay Tsui',5)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('nicoperez', 'Nico Perez',2)",
    "INSERT INTO users(username, fullname, family_id) VALUES ('ireneear', 'Irene Ear',4)",
  ]
  execute_batch_queries_if_empty(db, 'users', add_users_queries)
end

def add_challenge(db)
  add_challenge_query = ["INSERT INTO challenges VALUES (1, 'Winter 2017 Fitness Challenge', '2017-02-06 00:00:00', '2017-04-09 23:59:59', '2017-01-25 00:00:00', '2017-02-05 23:59:59')"]
  execute_batch_queries_if_empty(db, 'challenges', add_challenge_query)
end

def create_new_user(db)
  puts "Let's get you registered. We need a couple pieces of information."
  puts "Please specify a unique user name"
  username = gets.chomp

  while user_already_exists(db, username)
    username = gets.chomp
  end

  puts "What is your full name?"
  fullname = gets.chomp
  puts "Do you have a nick name? Press return to skip"
  nickname = gets.chomp
  puts "Which family are you a part of?"
  print_families(db)
  family_id = gets.chomp
  admin = 'false'

  create_new_user_query = <<-DELIMITER
    INSERT INTO users (username, fullname, nickname, family_id, admin) values (?, ?, ?, ?, ?)
  DELIMITER

  db.execute(create_new_user_query, [username, fullname, nickname, family_id, admin])

  puts "Thanks, #{fullname}! You've been added!"
  fullname
end

def print_families(db)
  select_all_families_query = <<-DELIMITER
    SELECT * FROM families
  DELIMITER

  families = db.execute(select_all_families_query)

  families.each do |family|
    puts "#{family['family_id']}. #{family['family_name']}"
  end
end

def user_already_exists(db, username)
  determine_matching_username_query = <<-DELIMITER
    SELECT COUNT(1) FROM users WHERE username = ?
  DELIMITER

  matching_usernames = db.execute(determine_matching_username_query, [username])

  if matching_usernames[0][0] != 0
    puts "#{username} already exists in the database, please choose another username"
    return true
  end
end

def display_user_rank(db, username)
  total_user_points_all_time_query = <<-DELIMITER
    SELECT u.user_id, SUM(points) FROM users_points up INNER JOIN users u on up.user_id = u.user_id WHERE u.username = ? GROUP BY u.user_id ORDER BY SUM(points) DESC
  DELIMITER

  points = db.execute(total_user_points_all_time_query, [username])
  puts "You are rank with _ points"
end

def user_summary(db, username)
  puts "Welcome, #{username}"
  display_user_rank(db, username)
end

def check_if_challenge_available
  number_of_available_challenges_query = <<-DELIMITER
    SELECT COUNT(*) FROM challenges WHERE datetime('now') BETWEEN challenge_enrollment_start_date AND challenge_enrollment_end_date
  DELIMITER

  num_of_challenges = db.execute(number_of_available_challenges_query)

  if num_of_challenges[0][0] === 0
    puts "There are currently no fitness challenges available to join"
  else
    availabe_challenges_query = <<-DELIMITER
      SELECT * FROM challenges WHERE datetime('now') BETWEEN challenge_enrollment_start_date AND challenge_enrollment_end_date
    DELIMITER
    puts "You can enroll in the following challenges: "
    challenges = db.execute(availabe_challenges_query)
    challenges.each_with_index do |challenge, index|
      puts "#{index + 1}. challenge['challenge_name']"
    end
  end
  # check if there is a current challenge available
  # if so then check if the user is registered for a challenge
end

def current_top_five
  # "SELECT u.user_name, "
  # show names and points the five individuals with the most points
end

def all_individuals_all_time
  # show the names and points of all individuals of all time
  # this doesn't mean much because people will start at different times--so what does this really mean?
  # needs to be weighted properly
end

# BUILD INITIAL DATABASE & TABLES

db = SQLite3::Database.new('fitness-challenge.db')
db.results_as_hash = true

db.execute(create_users_table_query)
db.execute(create_challenges_table_query)
db.execute(create_users_points_junction_table_query)
db.execute(create_activities_table_query)
db.execute(create_families_table_query)

# INSERT INTIAL DATABASE DATA
add_families(db)
add_activities(db)
add_users(db)
add_challenge(db)

# USER INTERFACE
puts "Welcome to the fitness challenge!"
puts "Please input your username to login or type \"Register\" to create a new account."
username = gets.chomp

if username.downcase === 'register'
  username = create_new_user(db)
else
end

user_summary(db, username)