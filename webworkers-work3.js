/*
Sample code by 
Michael E. Clemens
mnc@qlik.com
*/

'use strict';

/*Confugured for Qlik Sense Desktop here, set your own host and port if needed */
var config = {
  host: 'localhost',
  prefix: "/",
  port: '4848',
  isSecure: false
};
//rowsPerFetch times colsPerRow must equal 10k or less
var rowsPerFetch = 2000;
var colsPerRow = 5;

//this number, as well as a value for qtop should be received from the main window
//to  do this we need to write code to recieve a message from the main window, and then set these variables based on the message and then run this code
var maxFetches = 100;



function wwWorker(qlik, config) {
  var localQlik = qlik;
  var app = localQlik.openApp('*** APP NAME OR QUID GOES HERE ***', config);
  console.log('hello qlik');
  var dpCount = 0;
  var dataSource;
  var localHyperDef;
  var localHold = [];

  localHyperDef = {
    "qInitialDataFetch": [{
      "qHeight": rowsPerFetch,
      "qWidth": colsPerRow,
      "qTop": (rowsPerFetch * dpCount)
    }],
    "qDimensions": [{
      "qDef": {
        "qFieldDefs": [
              "*** FIELD NAME GOES HERE ***"
      ]
      },
      "qNullSuppression": true,
      "qOtherTotalSpec": {
        "qOtherMode": "OTHER_OFF",
        "qSuppressOther": true,
        "qOtherSortMode": "OTHER_SORT_DESCENDING",
        "qOtherCounted": {
          "qv": "5"
        },
        "qOtherLimitMode": "OTHER_GE_LIMIT"
      }
    }, {
      "qDef": {
        "qFieldDefs": [
              "*** FIELD NAME GOES HERE ***"
      ]
      },
      "qNullSuppression": true,
      "qOtherTotalSpec": {
        "qOtherMode": "OTHER_OFF",
        "qSuppressOther": true,
        "qOtherSortMode": "OTHER_SORT_DESCENDING",
        "qOtherCounted": {
          "qv": "5"
        },
        "qOtherLimitMode": "OTHER_GE_LIMIT"
      }
    }, {
      "qDef": {
        "qFieldDefs": [
              "*** FIELD NAME GOES HERE ***"
      ]
      },
      "qNullSuppression": true,
      "qOtherTotalSpec": {
        "qOtherMode": "OTHER_OFF",
        "qSuppressOther": true,
        "qOtherSortMode": "OTHER_SORT_DESCENDING",
        "qOtherCounted": {
          "qv": "5"
        },
        "qOtherLimitMode": "OTHER_GE_LIMIT"
      }
    }, {
      "qDef": {
        "qFieldDefs": [
              "*** FIELD NAME GOES HERE ***"
      ]
      },
      "qNullSuppression": true,
      "qOtherTotalSpec": {
        "qOtherMode": "OTHER_OFF",
        "qSuppressOther": true,
        "qOtherSortMode": "OTHER_SORT_DESCENDING",
        "qOtherCounted": {
          "qv": "5"
        },
        "qOtherLimitMode": "OTHER_GE_LIMIT"
      }
    }, {
      "qDef": {
        "qFieldDefs": [
              "*** FIELD NAME GOES HERE ***"
      ]
      },
      "qNullSuppression": true,
      "qOtherTotalSpec": {
        "qOtherMode": "OTHER_OFF",
        "qSuppressOther": true,
        "qOtherSortMode": "OTHER_SORT_DESCENDING",
        "qOtherCounted": {
          "qv": "5"
        },
        "qOtherLimitMode": "OTHER_GE_LIMIT"
      }
    }],
    "qMeasures": [],
    "qSuppressZero": false,
    "qSuppressMissing": false,
    "qMode": "S",
    "qInterColumnSortOrder": [],
    "qStateName": "$"
  };

  var regex = /xt":"([^"]+)\"/g;
  var curCol = 0;

  //http://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
  function getMatches(s) {
    curCol = 0;
    var match;
    var matches = [];
    while (match = regex.exec(s)) {
      curCol++;
      curCol === colsPerRow ? matches.push((match[1]) + '\n') : matches.push((match[1]) + ',');
      if (curCol === colsPerRow) {
        curCol = 0;
      }
    }
    s = null;
    return matches;
  }



  var rpCt = 0;
  var timeReceived = 0;
  var timeSent = 0;

  var pcprogress1 = 0;
  app.createCube(localHyperDef, function(dataSource) { //create a Qlik Sense Object

    postMessage({
      'mdedConnected': 1
    }); // Tell main window we're connected

    app.getObject('QV01', dataSource.qInfo.qId).then(function(res) { //obtain the obecjt model so we have a ref to our hypercube available, below as "/qHyperCubeDef"
      var readySet = setInterval(function() { //using a timer to send a page request every 500ms
        dpCount++;
        if (rpCt === 0) {
          (res.session.socket).addEventListener('message', function(rpc) { //add on message handler to the websocket session giving us access to the Qlik engine
            //timeReceived = new Date();
            //console.log('server response time: ',timeReceived - timeSent);
            var tenThousandRecordsString = (getMatches(rpc.data)).join('');
            localHold[rpCt] = tenThousandRecordsString;
            postMessage({ //tell the main window what our row count is
              'mdedCount': (dpCount * rowsPerFetch)
            });

            if (maxFetches < 100 || dpCount % (maxFetches / 100) === 0) { //check if percent will change
              pcprogress1 = Math.round(((dpCount / maxFetches) * 100)); //calculate percent
              postMessage({ //send new percent to main window
                'mdedPercent': pcprogress1
              });

            }
            rpc = null;
            rpCt++;
          });
        }

        if (dpCount > maxFetches) { //check if we've reached our maximum page request count
          var aVeryLargeString = localHold.join(''); //form the final string to send
          postMessage({ //deliver string to main window
            'mdedDelivery': [aVeryLargeString]
          });
          res.session.socket.close(); //CLOSE WEBSOCKET SESSION
          clearInterval(readySet); //CLEAR THE TIMER SENDING PAGE REQUESTS
          readySet = null;
          localHold = null;
          // END WEB WORKER

        } else {
          // timeSent = new Date();

          res.session.socket.send(JSON.stringify({ //request a new page of data as per the Qlik Sense docs Engine Api, this is JSON RPC 2.0 
            "method": "GetHyperCubeData",
            "handle": 2,
            "params": ["/qHyperCubeDef", [{
              "qTop": ((rowsPerFetch * dpCount) + 1),
              "qHeight": rowsPerFetch,
              "qLeft": 0,
              "qWidth": colsPerRow
            }]],
            "id": (dpCount + 3000),
            "jsonrpc": "2.0"
          }));


        }

      }, 500);

    });

  });

}