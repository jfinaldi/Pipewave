/* 
Purpose:
    Custom printer for console logging

Details:

Description:

Notes:
    Dumb note:
        Must use 
            typeof message === "string"
        Rather than
            message instanceof String

        because javascript is dumb

        Reference:
            https://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals

IMPORTANT NOTES:

Explanation:

Reference:

*/

/* 
Requires the colors module

Reference:
    https://www.npmjs.com/package/colors

*/
const colors = require("colors");
const e = require("express");

// Getting the time
const moment = require("moment");

// Color objects
colors.setTheme({
  error: ["white", "bgRed"],
  success: ["white", "bgGreen"],
  request: ["white", "bgBlack"],
  warning: ["black", "bgYellow"],
  debug: ["white", "bgBlue"],
  middleware: ["white", "bgMagenta", "bold"],
  router: ["white", "bgBrightBlue"],
  function: ["black", "bgGrey"],
});

// A Debug printer for the Debug printers
function wrapperPrinter(functionGiven) {
  return (...args) => {
    args.forEach(item => {
      // console.log(typeof item);
      // console.log(item);
    });

    return functionGiven(...args);
  };
}

// Custom printer for errors
const debugPrinter = {
  printError: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.error(`${moment().format()} ${message}`));
    } else {
      console.log(colors.error(`${moment().format()}`));
      console.log(colors.error(message));
    }
  }),
  printSuccess: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.success(`${moment().format()} ${message}`));
    } else {
      console.log(colors.success(`${moment().format()}`));
      console.log(colors.success(message));
    }
  }),
  printRequest: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.request(`${moment().format()} ${message}`));
    } else {
      console.log(colors.request(`${moment().format()}`));
      console.log(colors.request(message));
    }
  }),
  printWarning: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.warning(`${moment().format()} ${message}`));
    } else {
      console.log(colors.warning(`${moment().format()}`));
      console.log(colors.warning(message));
    }
  }),
  printDebug: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.debug(`${moment().format()} ${message}`));
    } else {
      console.log(colors.debug(`${moment().format()}`));
      console.log(colors.debug(message));
    }
  }),
  printMiddleware: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.middleware(`${moment().format()} Middleware: ${message}`));
    } else {
      console.log(colors.middleware(`${moment().format()}`));
      console.log(colors.middleware(message));
    }
  }),
  printRouter: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.router(`${moment().format()} Router: ${message}`));
    } else {
      console.log(colors.router(`${moment().format()}`));
      console.log(colors.router(message));
    }
  }),
  printFunction: wrapperPrinter(message => {
    if (typeof message === "string") {
      // Console log message with custom color
      console.log(colors.function(`${moment().format()} Function: ${message}`));
    } else {
      console.log(colors.function(`${moment().format()}`));
      console.log(colors.function(message));
    }
  }),
};

// Export const printers
module.exports = debugPrinter;
