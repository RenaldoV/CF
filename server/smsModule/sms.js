let request = require('request');
let http = require('http');
const config = require('../../config/config');
const xml2js = require('xml2js');
const soapRequest = require('easy-soap-request');

class Sms {

  constructor() {
    this.headers = {
      'Content-Type': 'text/xml;charset=UTF-8'
    };
  }
  login() {
    let loginBody = {api_action: 'login', api_username: config.smsApiUsername, api_password: config.smsApiPassword};
    let builder = new xml2js.Builder({rootName: 'sms_api'});
    let xml = builder.buildObject(loginBody);
    return (async () => {
      try {
        const { response } = await soapRequest(config.smsApiUrl, this.headers, xml, 10000);
        let parser = new xml2js.Parser();
        parser.parseString(response.body, (err, res) => {
          // parse xml response
          if(err) {
            throw new Error(err);
          } else if(res.sms_api.error_type) {
            // some error occured
            throw new Error(res.sms_api.error_type[0]);
          } else if(res.sms_api.session_id[0]) {
            response.result = res.sms_api.session_id[0];
          }
        });
        return response.result;
      } catch (err) {
        throw err;
      }
    })()
  }
  logout(sessionid) {
    let loginBody = {api_action: 'logout', api_sessionid: sessionid};
    let builder = new xml2js.Builder({rootName: 'sms_api'});
    let xml = builder.buildObject(loginBody);
    return (async () => {
      try {
        const { response } = await soapRequest(config.smsApiUrl, this.headers, xml, 10000);
        let parser = new xml2js.Parser();
        parser.parseString(response.body, (err, res) => {
          response.result = res.sms_api.status[0];
        });
        return response.result;
      } catch (err) {
        console.log(err.Error);
      }
    })()
  }
  sendMessage(sessionid, message, contact) {
    message = this.escapeSpecialChars(message);
    let messageBody = {
      api_action: 'sendmessages', api_sessionid: sessionid, action_content: {
        sms : {
          msisdn: this.parseContact(contact),
          message: message
        }
      }
    };
    let builder = new xml2js.Builder({rootName: 'sms_api'});
    let xml = builder.buildObject(messageBody);
    return (async () => {
      try {
        const { response } = await soapRequest(config.smsApiUrl, this.headers, xml, 10000);
        let parser = new xml2js.Parser();
        parser.parseString(response.body, (err, res) => {
          // parse xml response
          if(err) {
            throw new Error(err);
          } else if(res.sms_api.error_type) {
            // some error occured
            throw new Error(res.sms_api.error_type[0]);
          } else if(res.sms_api.sms[0].submit) {
            if (res.sms_api.sms[0].submit[0].indexOf('Failed') > -1) {
              // message failed so throw error
              throw new Error(res.sms_api.sms[0].submit[0]);
            }
            response.result = res.sms_api.sms[0].submit[0];
          }
        });
        return response.result;
      } catch (err) {
        throw err;
      }
    })()
  }
  getAccountInfo(sessionid) {
    let messageBody = {
      api_action: 'accountinfo', api_sessionid: sessionid};
    let builder = new xml2js.Builder({rootName: 'sms_api'});
    let xml = builder.buildObject(messageBody);
    return (async () => {
      try {
        const { response } = await soapRequest(config.smsApiUrl, this.headers, xml, 10000);
        let parser = new xml2js.Parser();
        parser.parseString(response.body, (err, res) => {
          // parse xml response
          if(err) {
            throw new Error(err);
          } else if(res.sms_api) {
            // some error occured
            response.result = res.sms_api;
          }
        });
        return response.result;
      } catch (err) {
        return new Promise((resolve, reject) => {
          reject(err);
        })
      }
    })()
  }
  async send(contact, message) {
    try {
      let sessionid = await this.login();
      let status = await this.sendMessage(sessionid, message, contact);
      let logout = await this.logout(sessionid);
      let promise = new Promise((resolve, reject) => {
        if(status === 'Success') {
          resolve();
        } else {
          reject(status);
        }
      });
      return promise;
    } catch (e) {
      if (e) {
        console.log(message);
        throw e;
      }
    }
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
    /*const preMessage = adminName + ' added a comment: ' + propDesc + '. ' + milestone + '. ';
    let lengthPreComment = preMessage.length + footer.length + 2; // get length of sms body without comment
    let totalLength = comment.length + lengthPreComment;
    if ( totalLength > 740 ) {
      // console.log('total Length: ' + totalLength);
      let overflow = totalLength - 740;
      // console.log('overflow: ' + overflow);
      let cutIndice = comment.length - overflow;
      comment = comment.substring(0, cutIndice);
    }*/
    let message = adminName + ' added a comment: ' + propDesc + '. ' + milestone + '. ' + comment + '. ' + footer;
    // console.log('final total length: ' + message.length);
    return this.send(contact, message)
      .then(res => {}).catch(err => {
        console.log(err);
      });
  }
  summaryAdded(contact, summary, adminName, propDesc, fileRef, footer) {
    /*const preMessage = adminName + ' added a summary progress report: ' + propDesc + '. ' + fileRef + '. ';
    let lengthPreComment = preMessage.length + footer.length + 2; // get length of sms body without comment
    let totalLength = summary.length + lengthPreComment;
    if ( totalLength > 740 ) {
      // console.log('total Length: ' + totalLength);
      let overflow = totalLength - 740;
      // console.log('overflow: ' + overflow);
      let cutIndice = summary.length - overflow;
      summary = summary.substring(0, cutIndice);
    }*/
    let message = adminName + ' added a summary progress report: ' + propDesc + '. ' + fileRef + '. ' + summary + '. ' + footer;
    // console.log('final total length: ' + message.length);
    return this.send(contact, message)
      .then(res => {
        // console.log(res);
      }).catch(err => {
        console.log(err);
      });
  }
  // Helper function to determine if word starts with a vowel
  async getCredits () {
    try {
      let sessionid = await this.login();
      let accountInfo = await this.getAccountInfo(sessionid);
      let logout = await this.logout(sessionid);
      let promise = new Promise((resolve, reject) => {
        if (accountInfo) {
          resolve(accountInfo.max_total[0]);
        } else {
          reject('No data returned');
        }
      });
      return promise;
    } catch (e) {
      return new Promise((resolve, reject) => {
        reject(e);
      });
    }
    /*let promise = new Promise(function(resolve, reject) {
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
    return promise;*/
  }
  escapeSpecialChars(message) {
    message = message.replace(/[\\\[\]^<>]/g, " "); // replace all illegal characters with a space.
    message = message.replace('’', "'");
    message = message.replace('–', '-');
    message = message.replace('½', 'half');
    return message;
  }
}

module.exports = Sms;
