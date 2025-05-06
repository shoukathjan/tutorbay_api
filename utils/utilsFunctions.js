
const jwt = require('jsonwebtoken');


const generateToken = () => {
  // const payload = { userId: user._id, userType: user.userType };
  const payload = {};
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
};


function formatDate(date, isEndOfDay = false) {
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const time = isEndOfDay ? '23:59:59.999' : '00:00:00.000';
  return `${year}-${month}-${day}T${time}`;
}

function dateAsset() {
  // Get current date and time
  const now = new Date();

  // Array to hold the 7 objects
  return Array.from({ length: 7 }, (_, i) => {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() - i);
    const fromDate = new Date(currentDate);
    const toDate = new Date(currentDate);
    toDate.setHours(23, 59, 59, 999);
    return {
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate, true),
      day: formatDate(fromDate).split('T')[0]
    };
  });
}

function EmailDateAsset(currentDateAndTime) {
  const now = currentDateAndTime;

  // Array to hold the 7 objects
  return Array.from({ length: 7 }, (_, i) => {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() - i);
    const fromDate = new Date(currentDate);
    const toDate = new Date(currentDate);
    toDate.setHours(23, 59, 59, 999);
    return {
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate, true),
      day: formatDate(fromDate).split('T')[0]
    };
  });
}

function returnIndianDate(currentTime) {

  var currentOffset = currentTime.getTimezoneOffset();

  var ISTOffset = 330;   // IST offset UTC +5:30 

  var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
  return ISTTime
}

module.exports = { dateAsset, EmailDateAsset, returnIndianDate, generateToken }