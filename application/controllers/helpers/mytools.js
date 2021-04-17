var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Convert res.data.created data to a Date object
module.exports = {
  resFormatDateCreated: res_data => {
    for (var i = 0; i < res_data.length; i++) {
      // Convert res_data's date created to a Date object
      let date_object = new Date(res_data[i].created.toString().split("-")[0]);

      // console.log(res_data);
      res_data[i].created = `${MONTHS[date_object.getMonth()]} ${date_object.getDate()}, ${date_object.getFullYear()}`;
    }
    return res_data;
  },
  // Input validation for search function
  isLetter: str => {
    return str.length > 0 && str.match(/^[a-z\d\-_\s]+$/i);
  },
};

// //   for (var i = 0; i < res.locals.results.length; i++) {
// //     res.locals.results[i].created = new Date(
// //       res.locals.results[i].created.toString().split("-")[0]
// //     ).toLocaleString();
// //   }
// var options = {
//   weekday: "long",
//   year: "numeric",
//   month: "long",
//   day: "numeric",
// };
