let request = require('request');
let http = require('http');
const config = require('../../config/config');

class Sms {

  constructor() {}

  send(contact, message) {
    const ct = this.parseContact(contact);
    const msg = encodeURI(message);
    const smsApiUrl = 'http://148.251.196.36/app/smsapi/index.php?key=' + config.smsAPIKey + '&type=text&contacts='+ ct +'&senderid=ULTIMATE&msg=' + msg;
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

  commentMade(contact, comment, adminName, propDesc, milestone, footer) {
    const preMessage = adminName + ' added a comment: ' + propDesc + '. ' + milestone + '. ';
    let lengthPreComment = preMessage.length + footer.length + 2; // get length of sms body without comment
    let totalLength = comment.length + lengthPreComment;
    if ( totalLength > 740 ) {
      console.log('total Length: ' + totalLength);
      let overflow = totalLength - 740;
      console.log('overflow: ' + overflow);
      let cutIndice = comment.length - overflow;
      comment = comment.substring(0, cutIndice);
    }
    const message = adminName + ' added a comment: ' + propDesc + '. ' + milestone + '. ' + comment + '. ' + footer;
    console.log('final total length: ' + message.length);
    return this.send(contact, message)
      .then(res => {
        // console.log(res);
      }).catch(err => {
        console.log(err);
      });
  }
  // Helper function to determine if word starts with a vowel
  getCredits () {
    let promise = new Promise(function(resolve, reject) {
      http.get('http://148.251.196.36/app/miscapi/' + config.smsAPIKey + '/getBalance/true/', (resp) => {

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
    });
    return promise;
  } // TODO: implement get credits
}

module.exports = Sms;
