const axios = require('axios');
const cron = require('node-cron');

(async () => {
  cron.schedule('0 8 * * *', () => {
    console.log('Sending Birthday Messages.');
    axios.get(`http://localhost:4000/user/happyBirthdayContacts`).then(res => {
      let contacts = res.data;
      console.log(contacts.map(ct => `${ct.name} ${ct.surname} ${ct.dob}`));
    }).catch(e => {
      console.error(e);
    });
  });
})();
