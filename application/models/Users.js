var db = require("../config/database");
var bcrypt = require("bcrypt");
const debugPrinter = require("../controllers/helpers/debug/debug_printer");

const User = {};

User.emailExists = async email => {
  debugPrinter.printFunction("User.emailExists");
  try {
    let [r, fields] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
    return r && r.length;
  } catch (err) {
    return false;
  }
};

User.usernameExists = async user => {
  debugPrinter.printFunction("User.usernameExists");

  try {
    let [r, fields] = await db.execute("SELECT * FROM users WHERE username=?", [user]);
    return r && r.length;
  } catch (err) {
    return false;
  }
};

User.create = async (username, name, password, active, usertype, email, title) => {
  debugPrinter.printFunction("User.create");
  let baseSQL = "";
  password = await bcrypt.hash(password, 15);
  if (!((await User.emailExists(email)) || (await User.usernameExists(username)))) {
    switch(usertype){
      case 0:
        baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `password`, `created`, `major`) VALUES (?,?,?,?,?,?, now(), ?);";
        break;
      case 1:
        baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `password`, `created`, `department`) VALUES (?,?,?,?,?,?, now(), ?);";
        break;
      case 2:
        baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `password`, `created`, `company`) VALUES (?,?,?,?,?,?, now(), ?);";
        break;
      default:
        console.log("Usertype not listed");
    }
    let a = await db.execute(baseSQL, [username, name, email, active, usertype, password, title]);
    return a;
  }
};

User.createWithGoogleID = async (username, name, password, active, usertype, email, googleid) => {
  debugPrinter.printFunction("User.createWithGoogleID");

  password = await bcrypt.hash(password, 15);
  if (!((await User.emailExists(email)) || (await User.usernameExists(username)))) {
    let baseSQL = "INSERT INTO users (`username`,`name`, `email`, `active`,`usertype`, `created`, `password`, googleid) VALUES (?,?,?,?,?, now(), ?, ?);";
    let a = await db.execute(baseSQL, [username, name, email, active, usertype, password, googleid]);
    return a;
  }
};

User.getId = async username => {
  debugPrinter.printFunction("User.getId");

  let baseSQL = "SELECT id FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  if (r && r.length) {
    return r[0].id;
  } else {
    console.log("error retrieving id");
    return null;
  }
};

User.getUsername = async id => {
  debugPrinter.printFunction("User.getUsername");

  let baseSQL = "SELECT username FROM users WHERE id=?;";
  let [r, fields] = await db.execute(baseSQL, [id]);
  if (r && r.length) {
    return r[0].username;
  } else {
    console.log("error retrieving id");
    return null;
  }
};

// From google ID get user IO
User.getGoogleId = async googleid => {
  debugPrinter.printFunction("User.getGoogleId");

  let baseSQL = "SELECT id FROM users WHERE googleid=?;";
  let [r, fields] = await db.execute(baseSQL, [googleid]);
  if (r && r.length) {
    return r[0].id;
  } else {
    debugPrinter.printWarning(`Google ID: ${googleid} is not in the DB`);
    return null;
  }
};

User.authenticate = async (username, password) => {
  debugPrinter.printFunction("User.authenticate");

  let baseSQL = "SELECT id,username, usertype, lastlogin, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);

  // If user stuff exists based on Username
  if (r && r.length) {
    let check = await bcrypt.compare(password, r[0].password);
    let userid = r[0].id;
    let usertype = r[0].usertype;
    let lastlogin = r[0].lastlogin;
    
    // If password is in the DB
    if (check) {
      return [true, userid, usertype, lastlogin];
    }
    else return [false, null];
  }

  // Username does not exist
  else {
    debugPrinter.printWarning(`Username: ${username} is not in the DB`);
    return [false, null];
  }
};

User.updateLastLogin = async (username) => {
  // Update their last login to right now
  let baseSQL2 = "UPDATE `users` SET `lastlogin` = now() WHERE `username`=?;";
  await db.execute(baseSQL2, [username]);
};

User.getLastLogin = async (username) => {
  let baseSQL = "SELECT `lastlogin` FROM users WHERE `username`=?;";
  [r, fields] = await db.execute(baseSQL, [username]);
  if (r && r.length) {
    console.log("r: ");
    console.log(r);
    return r;
  } else {
    return null;
  }
}

// returns a list of any new unseen alerts 
// meaning new profiles relevant to their alert that they have not seen yet
User.hasNewAlerts = async (lastLogin, userid) => {
  console.log("Inside hasNewAlerts");
  let baseSQL = "SELECT * from users WHERE `usertype`=0 AND UNIX_TIMESTAMP(`created`) > UNIX_TIMESTAMP(?);";
  let [r, fields] = await db.execute(baseSQL, [lastLogin]);

  if (r && r.length) {
    console.log("New alert possibly");
    //do second query to find out if new profile matches demographics in alert
    let[r2, fields2] = await User.getAlerts(userid);
    console.log("r2: ");
    console.log(r2);

    //console.log("Fields2.length: ");
    //console.log(fields2.length);

    // if we have any alert parameters set up
    if(r2) {
      console.log("User has an alert set up..");
      console.log("r2: ");
      console.log(r2);

      //cycle through all of our new accounts 
      for(i = 0; i < r.length; i++) {
        console.log("r[i]: ");
        console.log(r[i]);
        //Only have genders to match
        if((r2.ethnicity == null) && (r2.major == null) && (r2.gender[0] != null)) {
          console.log("Only have gender to match");
          console.log(r2.gender[0]);
          if(r2.gender[0] === r[i].gender) return true;
        }

        //Only have major to match
        if((r2.ethnicity == null) && (r2.major[0] != null) && (r2.gender == null)) {
          console.log("Only have major to match");
          console.log(r2.major);
          if(r2.major[0] === r[i].major) return true;
        }

        //gender and major to match
        if((r2.ethnicity == null) && (r2.major[0] != null) && (r2.gender[0] != null)) {
          console.log("Have gender and major to match");
          console.log(r2.gender[0]);
          console.log(r2.major[0]);
          if((r2.gender[0] === r[i].gender) && (r2.major[0] === r[i].major)) return true;
        }

        //Only have ethnicity to match
        if((r2.ethnicity[0] != null) && (r2.major == null) && (r2.gender == null)) {
          console.log("Only have ethnicity to match");
          console.log(r2.ethnicity[0]);
          if(r2.ethnicity[0] === r[i].ethnicity) return true;
        }

        //ethnicity and gender to match
        if((r2.ethnicity[0] != null) && (r2.major == null) && (r2.gender[0] != null)) {
          console.log("Have ethnicity and gender to match");
          console.log(r2.gender[0]);
          console.log(r2.ethnicity[0]);
          if((r2.ethnicity[0] === r[i].ethnicity) && (r2.gender[0] === r[i].gender)) return true;
        }
      
        //ethnicity and major to match
        if((r2.ethnicity[0] != null) && (r2.major[0] != null) && (r2.gender == null)) {
          console.log("Have ethnicity and major to match");
          console.log(r2.ethnicity[0]);
          console.log(r2.major[0]);
          if((r2.ethnicity[0] === r[i].ethnicity) && (r2.major[0] === r[i].major)) return true;
        }
      
        //all three to match
        if((r2.ethnicity[0] != null) && (r2.major[0] != null) && (r2.gender[0] != null)) {
          console.log("Have all three to match");
          console.log(r2.ethnicity[0]);
          console.log(r2.gender[0]);
          console.log(r2.major[0]);
          if((r2.ethnicity[0] === r[i].ethnicity) && (r2.major[0] === r[i].major) &&
              (r2.gender[0] === r[i].gender)) return true;
        }
      }
      console.log("For-loop yields no matches");
      return false; // for-loop yielded nothing

    } else {
      console.log("user has no alerts set up");
      return false; // user has no alerts set up
    }
  }
  else {
    console.log("No new alert");
    return false; // no new accounts to try to match
  }
};

User.checkPassword = async (username, new_password) => {
  debugPrinter.printFunction("User.checkPassword");

  let baseSQL = "SELECT id,username, password FROM users WHERE username=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  console.log(r);

  let validResult = r && r.length;
  console.log("validResult: " + validResult);
  if(validResult == 0) return false;
  let isTheSame = await bcrypt.compare(new_password, r[0].password);
  console.log("isTheSame: " + isTheSame);
  return (!isTheSame) ? true : false;
};

User.checkUser = async username => {
  debugPrinter.printFunction("User.checkUser");

  let baseSQL = "SELECT username FROM users WHERE `username`=?;";
  let [r, fields] = await db.execute(baseSQL, [username]);
  //true exists : false doesnt exist
  return r && r.length ? true : false;
};

User.changePassword = async (username, new_password, confirm_password, userid) => {
  debugPrinter.printFunction("User.changePassword");

  if (await User.checkPassword(username, confirm_password)) {
    let baseSQL = "UPDATE `users` SET `password` = ? WHERE `id` = ?;";
    new_password = await bcrypt.hash(new_password, 15);
    let [r, fields] = await db.execute(baseSQL, [new_password, userid]);
    return r;
  } else return null;
};

User.changeEmail = async (new_email, userid) => {
  debugPrinter.printFunction("User.changeEmail");

  if (!(await User.emailExists(new_email))) {
    let baseSQL = "UPDATE `users` SET `email` = ? WHERE `id` = ?;";
    let [r, fields] = await db.execute(baseSQL, [new_email, userid]);
    return r;
  } else return null;
};

User.changeBio = async (new_bio, userid) => {
  debugPrinter.printFunction("User.changeBio");

  // verify user input by taking out ``

  // update the database
  let baseSQL = "UPDATE `users` SET `bio` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_bio, userid]);

  return r;
}

// Change Username
User.changeUsername = async (new_username, userid) => {
  debugPrinter.printFunction("User.changeUsername");

  if(!(await User.usernameExists(new_username))) {
    let baseSQL = "UPDATE `users` SET `username` = ? WHERE `id` = ?;";
    let [r, fields] = await db.execute(baseSQL, [new_username, userid]);
    return r;
  } else {
    console.log("Error User.changeUsername: name already exists.");
    return null;
  }
};

// Change name
User.changeName = async (username, new_name, userid) => {
  debugPrinter.printFunction("User.changeName");

  if (!(await User.checkUser(new_name))) {
    let baseSQL = "UPDATE `users` SET `name` = ? WHERE `id` = ?;";
    let [r, fields] = await db.execute(baseSQL, [new_name, userid]);
    return r;
  } else {
    return null;
  }
};

// Change Ethnicity
User.changeEthnicity = async (new_ethnicity, userid) => {
  debugPrinter.printFunction("User.changeEthnicity");

  let baseSQL = "UPDATE `users` SET `ethnicity` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_ethnicity, userid]);
  return r;
};

// Change Gender
User.changeGender = async (new_gender, userid) => {
  debugPrinter.printFunction("User.changeGender");

  let baseSQL = "UPDATE `users` SET `gender` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_gender, userid]);
  return r;
};

// Change Major
User.changeMajor = async (new_major, userid) => {
  debugPrinter.printFunction("User.changeMajor");

  let baseSQL = "UPDATE `users` SET `major` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_major, userid]);
  return r;
};

// Change Company
User.changeCompany = async (new_company, userid) => {
  debugPrinter.printFunction("User.changeCompany");

  let baseSQL = "UPDATE `users` SET `company` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_company, userid]);
  return r;
};

// Change Department
User.changeDepartment = async (new_department, userid) => {
  debugPrinter.printFunction("User.changeDepartment");

  let baseSQL = "UPDATE `users` SET `department` = ? WHERE `id` = ?;";
  let [r, fields] = await db.execute(baseSQL, [new_department, userid]);
  return r;
};

User.getInfo = async username => {
  debugPrinter.printFunction("User.getInfo");

  var baseSQL = "SELECT id, username, name, email, usertype, created, title, bio, profilepic, gender, ethnicity, major, company, department, resume FROM users WHERE username=?;";
  let [r, fields] = await db.query(baseSQL, [username]);
  return r;
};

const handler = async value => {
  try {
    return await value.split();
  } catch (err) {
    return await value;
  }
};

// Get all the relevant alerts for an account
User.getAlerts = async user_id => {
  debugPrinter.printFunction("User.getAlerts");

  var baseSQL = "SELECT ethnicity, major, gender FROM alerts WHERE fk_userid=?;";
  let [r, fields] = await db.query(baseSQL, [user_id]);
  if (r && r.length) {
    r[0].ethnicity = await handler(r[0].ethnicity);
    r[0].major = await handler(r[0].major);
    r[0].gender = await handler(r[0].gender);
    return r;
  }
  return false;
};

User.hasAlerts = async user_id => {
  let basesql = "SELECT id FROM alerts WHERE fk_userid=?;";
  let [r, fields] = await db.query(basesql, [user_id]);
  return r && r.length;
};
const alertsetter = async option => {
  if (option == NULL || option == undefined) return NULL;
};

User.setAlert = async (object, userid) => {
  if (await User.hasAlerts(userid)) basesql = "UPDATE `website`.`alerts` SET `ethnicity` = ?, `major` = ?, `gender` = ? WHERE `fk_userid` = ?;";
  else basesql = "INSERT INTO `website`.`alerts` SET `ethnicity` = ?, `major` = ?, `gender` = ?, `fk_userid` = ?;";
  db.query(basesql, [object.ethnicity, object.major, object.gender, userid]);
};

module.exports = User;
