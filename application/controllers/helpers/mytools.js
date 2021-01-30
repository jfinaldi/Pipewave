var months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
module.exports = {
  convert: x => {
    for (var i = 0; i < x.length; i++) {
      let response = new Date(x[i].created.toString().split("-")[0]);
      console.log();
      x[i].created = `${months[response.getMonth()]}
      ${response.getDate()}, 
      ${response.getFullYear()}`;
    }
    return x;
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
