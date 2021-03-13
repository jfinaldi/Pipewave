/*
This file should get the text from the PDF via google cloud platform

Reference:
    https://cloud.google.com/vision/docs/pdf
*/

// var test = "https://storage.googleapis.com/pdfbucket0001/test2.pdf";

// // Imports the Google Cloud client libraries
// const vision = require("@google-cloud/vision").v1;

// // Creates a client
// const client = new vision.ImageAnnotatorClient();

// /**
//  * TODO(developer): Uncomment the following lines before running the sample.
//  */
// // Bucket where the file resides
// const bucketName = "pdfbucket0001";
// // Path to PDF file within bucket

// // The folder to store the results
// const outputPrefix = "results";

// async function pdfToText(fileName) {
//   // const fileName = 'path/to/document.pdf';

//   const gcsSourceUri = `gs://${bucketName}/${fileName}`;
//   const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

//   const inputConfig = {
//     // Supported mime_types are: 'application/pdf' and 'image/tiff'
//     mimeType: "application/pdf",
//     gcsSource: {
//       uri: gcsSourceUri,
//     },
//   };
//   const outputConfig = {
//     gcsDestination: {
//       uri: gcsDestinationUri,
//     },
//   };
//   const features = [{ type: "DOCUMENT_TEXT_DETECTION" }];
//   const request = {
//     requests: [
//       {
//         inputConfig: inputConfig,
//         features: features,
//         outputConfig: outputConfig,
//       },
//     ],
//   };

//   const [operation] = await client.asyncBatchAnnotateFiles(request);
//   const [filesResponse] = await operation.promise();
//   const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
//   console.log("Json saved to: " + destinationUri);
// }

/*

IMPORTANT NOTES:

    NLP Documentation:
        Analyzing Entities:
            https://cloud.google.com/natural-language/docs/analyzing-entities

        Entity:
            https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type

    Add Google application credentials to ENV (Joseph)
        $env:GOOGLE_APPLICATION_CREDENTIALS="H:\Programming\JavaScript\hackathon\hackerthon\application\config\hackerthon-306708-db4e7e45bb57.json"

    What to npm install
        npm install pdf-parse

*/

// Imports the Google Cloud client library
const language = require("@google-cloud/language");
require("dotenv").config();

// Creates a client
const client = new language.LanguageServiceClient();

// pdf Parser object
const pdfParse = require("pdf-parse");

// Debug printer
const debugPrinter = require("../helpers/debug/debug_printer");

async function pdfToText(filepath) {
  debugPrinter.printFunction("pdfToText");

  // filepath = "./public/assets/yk_sugi_resume_new.pdf"
  // filepath = "./public/assets/test.pdf"

  try {
    pdfParseObject = await pdfParse(filepath);
    // console.log(pdfParseObject.numpages)
    // console.log(pdfParseObject.text);
    // console.log(pdfParseObject.info)

    // Print text
    debugPrinter.printDebug(pdfParseObject.text);

    arrayUsefulEntities = await textToEntities(pdfParseObject.text);

    return arrayUsefulEntities;
  } catch (err) {
    debugPrinter.printError(err);
  }
}

async function textToEntities(text) {
  debugPrinter.printFunction("textToEntities");

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: "PLAIN_TEXT",
  };

  try {
    const [result] = await client.analyzeEntities({ document });
    const entities = result.entities;

    // console.log('Entities:');
    // entities.forEach(entity => {
    //     // console.log(entity.name);
    //     // console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    //     // console.log(entity.metadata); // not so complex data
    //     // console.log(entity.sentiment); // ??? useless
    //     // console.log(entity.mentions); // weird data

    //     if (entity.metadata && entity.metadata.wikipedia_url) {
    //         console.log(entity.name);
    //         console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);

    //         console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
    //         console.log("\n")
    //     }
    // });

    results = entities
      .filter(entity => {
        return entity.metadata && entity.metadata.wikipedia_url;
      })
      .map(entity => {
        return entity.name;
      });

    // Make one big string, replace space with no spaces

    console.log(results);
    results = results.join("").replace(/ /g, "");
    debugPrinter.printDebug(results);

    return await results;
  } catch (err) {
    debugPrinter.printError(err);
    return [];
  }
}

module.exports = pdfToText;
