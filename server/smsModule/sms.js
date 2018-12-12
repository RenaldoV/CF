let request = require('request');
let http = require('http');

class Sms {

  constructor() {}

  send(contact, message) {
    console.log(contact);
    console.log(message);
    const ct = this.parseContact(contact);
    const msg = encodeURI(message);
    const smsApiUrl = 'http://148.251.196.36/app/smsapi/index.php?key=54b728a102252&type=text&contacts='+ ct +'&senderid=ULTIMATE&msg=' + msg;
    console.log(smsApiUrl);
    let promise = new Promise(function(resolve, reject) {
      if (message.length >= 740) {
        reject(new Error('Message is too long'));
      } else {
        http.get(smsApiUrl, (resp) => {

          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            resolve(data);
          });

        }).on("error", (err) => {
          reject("Error: " + err.message);
        });
      }
    });
    return promise;
  }

  parseContact(ct) {
    if (ct[0] === '0' && ct.length === 10) {
      ct = '27'  + ct.substring(1, ct.length);
    }else if(ct[0] === '+' && ct.length === 12) {
      ct = ct.substring(1, ct.length);
    }
    console.log(ct);
    return ct;
  }
  //Helper function to determine if word starts with a vowel
  getCredits () {} // TODO: implement get credits
}

module.exports = Sms;
