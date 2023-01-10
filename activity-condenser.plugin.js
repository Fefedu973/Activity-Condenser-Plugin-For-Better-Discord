/**
 * @name ActivityCondenser
 * @author Fefe_du_973
 * @description This plugin allow to bypass discord limitaions for Activity Condenser
 * @version 0.0.1
 */
const fs = require("fs");
const {Webpack, Webpack: {Filters}} = BdApi;
const Dispatcher = Webpack.getModule(Filters.byProps("isDispatching", "subscribe"));
const UserStore = Webpack.getModule(Filters.byProps("getUser"));
var Id = UserStore.getCurrentUser().id;
function presenceUpdateHandler(action) {
  var activity = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byProps("getStatus", "getState")).getActivities(Id);

  // Create an array to hold the activity objects
  let activities = [];

  // Loop through the activity objects
  for (let i = 0; i < activity.length; i++) {
    let act = activity[i];
    // Only analyze activities with a "type" of 0
    if (act.type === 0) {
      // Create an object to hold the button URLs for this activity
      let buttons = {
        application_id: act.application_id,
        buttons: []
      };
      // Check if the activity object has a "buttons" property
      if (act.hasOwnProperty("buttons")) {
        // Check if the "buttons" property is an array with at least one element
        if (Array.isArray(act.buttons) && act.buttons.length > 0) {
          // Add the button URLs to the object
          buttons.buttons = act.metadata.button_urls;
        }
      }
      // If there are not enough buttons, add "none" to the array to fill the remaining slots
      while (buttons.buttons.length < 2) {
        buttons.buttons.push("none");
      }
      // Add the object to the array
      activities.push(buttons);
    }
  }

  // Return the array of activity objects
  const jsonString = JSON.stringify(activities);

  // Write the JSON string to a file
  fs.writeFile("output.json", jsonString, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("JSON file has been created.");
  });
  
}

module.exports = class MyPlugin {
  constructor(meta) {
    // Do stuff in here before starting
  }

  start() {
    Dispatcher.subscribe("SESSIONS_REPLACE", presenceUpdateHandler);
  }

  stop() {
    Dispatcher.unsubscribe("SESSIONS_REPLACE", presenceUpdateHandler);
  }
};