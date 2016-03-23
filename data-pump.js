/*
Sample code by 
Michael E. Clemens
mnc@qlik.com
*/
var prefix = window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/extensions") + 1);
var config = {
  host: window.location.hostname,
  prefix: prefix,
  port: window.location.port,
  isSecure: window.location.protocol === "https:"
};
require.config({
  baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
});

require(["js/qlik"], function(qlik) {
  qlik.setOnError(function(error) {
    alert(error.message);
  });

  var dpCount = 0;
  var dataSource;
  var localHyperDef;

  function wwWorker() {
    var localHold = [];
    //localHold[0]=['title','title'];
    var localQlik = qlik;
    var app = qlik.openApp('*** APP NAME OR QUI GOES HERE ***', config);
    console.log('hello qlik');

    var rowsPerFetch = 2000;
    var colsPerRow = 5;
    var maxFetches = 100;

    var localHyperDef = {
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
    //http://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
    //    /\s*"mTitle"\s*:\s*(.+?)\s*"/g          returns this
    // str.match(/"mTitle"(.*?)",/g)

    var regex = /xt":"([^"]+)\"/g;

    function getMatches(s) {
      var match;
      var matches = [];
      matches.length = 0;
      while (match = regex.exec(s)) {
        matches.push((match[1]));
      }
      s = null;
      return matches;
    }

    //collectData(dataSource, 0);
    var rpCt = 0;


    // #c6ff00 
    $('#pcprogress1').addClass('pc-connecting');
    


    var pcprogress1=0;
    app.createCube(localHyperDef, function(dataSource) { //create an object
      app.getObject('QV01', 'MU1').then(function(res) { //obtain the obecjt model so we have a ref to our hypercube available, below as "/qHyperCubeDef"
        var readySet = setInterval(function() {

          $('#pcprogress1').removeClass('pc-connecting');
        
        
          dpCount++;

          if (rpCt === 0) {
            $('#pcprogress1').addClass('p0');
            (res.session.socket).addEventListener('message', function(rpc) {
              localHold[rpCt] = getMatches(rpc.data)

              //number of rows
              $('#pcprogress1 span:nth-child(2)').html(''+dpCount*rowsPerFetch+'');

              //up the progress bar and text inside but not too often
              if(dpCount%(maxFetches/100) === 0 /*&& Math.round( ((dpCount/maxFetches)*100)) > pcprogress1*/) {
                $('#pcprogress1').removeClass(function(index, className) {
                    return (className.match(/(^|\s)p\S+/g) || []).join(' ');
                });
                pcprogress1 = Math.round( ((dpCount/maxFetches)*100));

                 $('#pcprogress1').addClass('p'+ pcprogress1);
                 $('#pcprogress1 span:nth-child(1)').html(''+pcprogress1+'%');
              }

              



              rpc = null;
              rpCt++;
            });
          }

          if (dpCount > maxFetches) {
            // debugger;
            res.session.socket.close();
            // res = null;
            clearInterval(readySet);
            readySet = null;
            // setTimeout(function() {
              window.URL = window.URL || window.webkitURL;
              // var blob = new Blob([localHold.join(',')]);
              // var blobURL = window.URL.createObjectURL(blob);
              // var blobURL = window.URL.createObjectURL(new Blob([localHold.join(',')]));

              var linkToFile = $("#downloadLink").html("");
              $("<a></a>").
              attr("href", window.URL.createObjectURL(new Blob([localHold.join(',')]))).
              attr("download", "data.csv").
              text("Download Data").
              appendTo('#downloadLink');
              localHold = null;
              linkToFile = null;
            // }, 1000);

          } else {
            res.session.socket.send(JSON.stringify({
              "method": "GetHyperCubeData",
              "handle": 2,
              "params": ["/qHyperCubeDef", [{
                "qTop": ((rowsPerFetch * dpCount) + 1),
                "qHeight": rowsPerFetch,
                "qLeft": 0,
                "qWidth": colsPerRow
              }]],
              "id": (dpCount + 111),
              "jsonrpc": "2.0"
            }));

          }


      

        }, 500);
        //console.log(dataSource);
      });
      //app.model.session.send(JSON.stringify({"method":"GetHyperCubeData","handle":1,"params":["/qHyperCubeDef",[{"qTop":2001,"qHeight":2000,"qLeft":0,"qWidth":5}]],"id":123123,"jsonrpc":"2.0"}));
    });



    //},3000);
    // function collectData(dataSource, counter) {
    //   dataSource.qHyperCube.qDataPages[0].qMatrix.forEach(
    //     function(row, rownum) {
    //       if (typeof(localHold[rownum + (5000 * dpCount)]) === 'undefined') {
    //         localHold[rownum + (5000 * dpCount)] = [];
    //       }
    //       row.forEach(function(cell, cellIndex) {
    //         if (typeof(cell.qText) === 'undefined') {
    //           cell.qText = "UNDEF";
    //         }
    //         // cell.qText = cell.qText.split(`,`).join(`-`);
    //         localHold[rownum + (5000 * dpCount)][cellIndex] = cell.qText;

    //       });
    //       postMessage(rownum + (5000 * dpCount));
    //       //console.log('row '+(rownum+(5000*dpCount))+' ['+localHold[rownum++(5000*dpCount)].join(",")+']');
    //     });

    // }
  }


  wwWorker();

});