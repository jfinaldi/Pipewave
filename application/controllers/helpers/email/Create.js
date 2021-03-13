const axios = require("axios");
const Email = {};
/**
 * request.send(JSON.stringify({
  'email': '<value for email>',
  'lifecycle_stage': 'create',
  'name': '<value for name>',
  'unique_id': '<value for unique_id>'
}))
request.open("POST", "https://events-api.notivize.com/applications/d70f006c-1881-4657-9d88-2c522f7a8873/event_flows/b450eb17-f240-4c7d-b730-5f9215a71676/events", true)
request.setRequestHeader("Content-Type", "application/json")
*/

Email.notify = async (dest_email, username, user_id) => {
  let options = {
    email: dest_email,
    lifecycle_stage: "create",
    name: username,
    unique_id: user_id,
  };
  options = JSON.stringify(options);
  let response = await axios.post(
    "https://events-api.notivize.com/applications/d70f006c-1881-4657-9d88-2c522f7a8873/event_flows/b450eb17-f240-4c7d-b730-5f9215a71676/events",
    options
  );
};

module.exports = Email;
