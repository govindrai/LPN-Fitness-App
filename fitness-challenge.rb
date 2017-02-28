require 'sqlite3'

# DATABASE SCHEMA

create_users_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    user_name VARCHAR(100),
    full_name VARCHAR(100),
    nick_name VARCHAR(200),
    admin BOOLEAN,
    family_id INTEGER,
    FOREIGN KEY(family_id) REFERENCES families(family_id)
  )
  /* SAMPLE DATA IF TABLE NEEDS TO BE RESET */
  /* SUPER USER WILL BE ABLE TO ADD/DELETE USERS & CHALLENGES */
  /*
  INSERT INTO users VALUES (1, 'superuser', '', '', 'true', '')
  */
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

create_users_points_junction_table_query = <<-DELIMITER
  CREATE TABLE IF NOT EXISTS users_point (
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
  /* SAMPLE DATA IF TABLE NEEDS TO BE RESET */
  /*
  INSERT INTO families(family_name, family_slogan) VALUES ('Iolite', 'The best family');
  INSERT INTO families(family_name, family_slogan) VALUES ('Alexandrite', 'The 2nd best family');
  INSERT INTO families(family_name, family_slogan) VALUES ('Sunstone', 'A family in LPN');
  INSERT INTO families(family_name, family_slogan) VALUES ('Ruby', 'Another family in LPN');
  INSERT INTO families(family_name, family_slogan) VALUES ('Sapphire', 'Yet another family in LPN');
  INSERT INTO families(family_name, family_slogan) VALUES ('Topaz', 'A chill family in LPN');
  INSERT INTO families(family_name, family_slogan) VALUES ('Emerald', 'Almost forgot this family');
  */
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

def create_superuser(db)
  create_superuser_query = ["INSERT INTO users VALUES (1, 'superuser', '', '', 'true', '')"]
  execute_batch_queries_if_empty(db, 'users', create_superuser_query)
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

def create_new_user(db)
  puts "Let's get you registered. We need a couple pieces of information."

  puts "What is your name?"
  user_name = gets.chomp
  puts "Do you have a nick name? Press return to skip"
  nick_name = gets.chomp
  puts "Which family are you a part of?"
  print_families(db)
  family_id = gets.chomp
  admin = 'false'

  create_new_user_query = <<-DELIMITER
    INSERT INTO users (user_name, nick_name, family_id, admin) values (?, ?, ?, ?)
  DELIMITER

  db.execute(create_new_user_query, [user_name, nick_name, family_id, admin])

  puts "Thanks, #{user_name}! You've been added!"
  user_name
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

def user_summary(db, user_name)
  puts "Welcome, #{user_name}"
end

def check_if_challenge_available
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
create_superuser(db)
add_families(db)
add_activities(db)

# USER INTERFACE
puts "Welcome to the fitness challenge!"
puts "Please input your username to login or type \"Register\" to create a new account."
user_name = gets.chomp

if user_name.downcase === 'register'
  user_name = create_new_user(db)
end

user_summary(db, user_name)

################# TODOs #################
# EDGE CASES - DOESN'T ENSURE USER NAMES ARE UNIQUE - WILL NEED TO ADD USERNAME FIELD, DIFFERENT FROM USER_NAME (FULLNAME)
#########################################