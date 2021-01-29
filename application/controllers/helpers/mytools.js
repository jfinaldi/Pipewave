module.exports = {
  convert: x => {
    for (var i = 0; i < x.length; i++) {
      x[i].created = new Date(
        x[i].created.toString().split("-")[0]
      ).toLocaleString();
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
