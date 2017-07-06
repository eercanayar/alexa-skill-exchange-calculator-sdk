'use strict';
var Alexa = require("alexa-sdk");
var appId = '***';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(mainHandlers);
    alexa.execute();
};

var mainHandlers = {
    'calculateExchange': function() {
        
        var amountVal = parseInt(this.event.request.intent.slots.Amount.value);
        var currencyVal = this.event.request.intent.slots.Currency.value;

        var myCont = this;
        var speechOutput = `You asked ${amountVal} ${currencyVal}. `;

        var http = require('http');

        var currencyDict = {};
        
		// currency rates api
		// ref: http://fixer.io
        var options = {
          host: 'api.fixer.io',
          path: '/latest?base=TRY'
        };
        
        var callbackQ = function(response) {
          var strResult = '';
        
          response.on('data', function (chunk) {
        	strResult += chunk;
          });
        
          response.on('end', function () {
        	try {
        		var ratesData = JSON.parse(strResult);
        	} catch(e) {
                throw new Error('Parse error:' + e);
            }
        	//console.log(ratesData);
        	currencyDict['euros'] = ratesData.rates.EUR;
        	currencyDict['dollars'] = ratesData.rates.USD;
        	speechOutput += "It equals to "+Math.round(amountVal/currencyDict[currencyVal])+" Turkish Liras.";
        	myCont.emit(':ask', speechOutput);  
          });
        };
        
        http.request(options, callbackQ).end();

    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },'LaunchRequest': function () {
        this.emit(":ask", "Welcome to exchange calculator. You can ask any exchange to Turkish liras.");
    }

};
