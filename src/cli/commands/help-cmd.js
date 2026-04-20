'use strict';
const { displayTopic, listTopics } = require('../help');

module.exports = function helpAction(topic) {
  if (!topic) {
    listTopics();
  } else {
    displayTopic(topic);
  }
};
