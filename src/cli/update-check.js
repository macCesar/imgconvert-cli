'use strict';

const { name, version } = require('../../package.json');

function checkForUpdate() {
  if (process.env.IMGCONVERT_NO_UPDATE_CHECK) return;
  try {
    const updateNotifier = require('update-notifier');
    const notifier = updateNotifier({ pkg: { name, version }, updateCheckInterval: 86400000 });
    notifier.notify({ isGlobal: true });
  } catch (_) {}
}

module.exports = { checkForUpdate };
