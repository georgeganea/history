var app = angular.module('hindsight', ['n3-line-chart', 'ui.bootstrap']);

app.controller('TodoListController', function($scope, $document, $window, $http, $uibModal, $log) {
  var classList = this;
  var keyisdown;

  //var repo = 'eclipse/dltk.core';
  var repo = 'gitblit/gitblit';

  function onKeyDown(event) {
    if (event.metaKey)
      keyisdown = true;
    // Repeat for each key you care about...
  }

  function onKeyUp(event) {
    if (event.metaKey)
      keyisdown = false;
  }
  $document.bind("keyup", onKeyUp);
  $document.bind("keydown", onKeyDown);

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;
  $scope.computeStyle = function(val, acc) {
    var list = acc.accesses;
    if (list.indexOf(val) > 0)
      return {
        "background-color": "#869D96",
        "color": "#869D96"
      };
    else return {
      "background-color": "white",
      "color": "white"
    };
  }

  $scope.mahClickCallback = function(row, cls) {

    var comm = row.x;
    if (comm)
      comm = classList.timeToCommit[row.x.toString()];
    else
      comm = row;


    $scope.githuburl = 'https://github.com/' + repo + '/commit/' + comm;
    var modalInstance = $uibModal.open({
      animation: false,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      windowClass: 'fullwidth',
      resolve: {
        githuburl: function() {
          return $scope.githuburl;
        }
      }
    });



    var url = "https://api.github.com/repos/" + repo + "/commits/" + comm;
    var config = {
      "url": url,
      "headers": {
        "Accept": "application/vnd.github.diff"
      }
    };

    var showDiffDialog = function(lineDiffExample) {
      var files = lineDiffExample.split("diff --git");
      var isOurFile = function(diffcontent) {
        return diffcontent.indexOf("/" + cls.name + ".java") > 0;
      }
      var diff2htmlUi = new Diff2HtmlUI({
        diff: lineDiffExample
      });
      diff2htmlUi.draw('#side-by-side', {
        inputFormat: 'json',
        showFiles: true,
        matching: 'lines',
        outputFormat: 'side-by-side'
      });
      diff2htmlUi.fileListCloseable('#side-by-side', false);
      diff2htmlUi.highlightCode('#side-by-side');
      console.log(($("a:contains('" + "/" + cls.name + ".java" + "')")[0]).click());
    }

    $http(config).then(function(response) {
      var lineDiffExample = response.data;
      showDiffDialog(lineDiffExample);
    }, function(error) {
      config.url = "https://api.github.com/repos/eclipse-dltk/dltk.core/commits/" + comm;
      $http(config).then(function(response) {
        var lineDiffExample = response.data;
        showDiffDialog(lineDiffExample);
      });
    });

    modalInstance.result.then(function(selectedItem) {
      $scope.selected = selectedItem;
    }, function() {
      $log.info('Modal dismissed at: ' + new Date());
    });
  }


  $http.get('gitblit' + '.json').success(function(data) {
    classList.timeToCommit = data.pop();
    classList.todos = data;
    var max = 0;
    var min = Number.MAX_VALUE;
    for (var i = 0; i < classList.todos.length; i++) {
      for (var j = 0; j < classList.todos[i].severity.length; j++) {
        if (max < classList.todos[i].severity[j].x) max = classList.todos[i].severity[j].x;
        if (min > classList.todos[i].severity[j].x) min = classList.todos[i].severity[j].x;
      }
    }

    console.log("min " + min);
    console.log("max " + max);

    var keyEnum = {
      W_Key: 0,
      A_Key: 1,
      S_Key: 2,
      D_Key: 3
    };
    var keyArray = new Array(4);



    $scope.options = {
      axes: {
        x: {
          key: 'x',
          type: 'date',
          max: max,
          min: min,
          ticks: 5,
          tooltipFormat: '%Y-%m-%d',
          ticksFormat: '%Y-%m-%d'
        },
        y: {
          type: 'linear',
          min: 0
        },
        y2: {
          type: 'linear',
          min: 0,
          ticks: 1,
          max: 1
        }
      },
      series: [{
        dataset: "dataset",
        key: 'y',
        type: ['line', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        label: "Design flaw percentage",
        color: "#1f77b4"
      }, {
        dataset: "dataset",
        key: "gc",
        type: ['area', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        dotSize: 2,
        color: "#eeeecc",
        type: 'area'
      }],
      zoom: {
        x: true,
        y: false
      },
      pan: {
        x: false,
        y: false
      }
      // tooltipHook: function(points) {
      //  if (keyisdown) {
      //    $window.open('https://github.com/eclipse/dltk.core/commit/' + points[0].row.id);
      //    console.log("0 " + points[0].row.id);
      //    keyisdown = false;
      //  }
      // }
    };
    $scope.optionsatfd = {
      axes: {
        x: {
          key: 'x',
          type: 'date',
          max: max,
          min: min,
          ticks: 5,
          tooltipFormat: '%Y-%m-%d',
          ticksFormat: '%Y-%m-%d'
        },
        y: {
          type: 'linear',
          min: 0,
          max: 200
        },
        y2: {
          type: 'linear',
          min: 0,
          ticks: 1,
          max: 1
        }
      },
      series: [{
        dataset: "dataset",
        key: 'y',
        type: ['line', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        label: "Design flaw percentage",
        color: "#1f77b4"
      }, {
        dataset: "dataset",
        key: "gc",
        type: ['area', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        dotSize: 2,
        color: "#eeeecc",
        type: 'area'
      }],
      zoom: {
        x: true,
        y: false
      },
      pan: {
        x: false,
        y: false
      }
      // tooltipHook: function(points) {
      //  if (keyisdown) {
      //    $window.open('https://github.com/eclipse/dltk.core/commit/' + points[0].row.id);
      //    console.log("0 " + points[0].row.id);
      //    keyisdown = false;
      //  }
      // }
    };


    $scope.optionstcc = {
      axes: {
        x: {
          key: 'x',
          type: 'date',
          max: max,
          min: min,
          ticks: 5,
          tooltipFormat: '%Y-%m-%d',
          ticksFormat: '%Y-%m-%d'
        },
        y: {
          type: 'linear',
          min: 0,
          max: 1
        },
        y2: {
          type: 'linear',
          min: 0,
          ticks: 1,
          max: 1
        }
      },
      series: [{
        dataset: "dataset",
        key: 'y',
        type: ['line', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        color: "#1f77b4"
      }, {
        dataset: "dataset",
        key: "gc",
        type: ['area', 'dot'], // this, or a string. But this is better.
        interpolation: {
          mode: 'step'
        },
        dotSize: 2,
        color: "#eeeecc",
        type: 'area'
      }],
      zoom: {
        x: true,
        y: false
      },
      pan: {
        x: false,
        y: false
      }
      // tooltipHook: function(points) {
      //  if (keyisdown) {
      //    $window.open('https://github.com/eclipse/dltk.core/commit/' + points[0].row.id);
      //    console.log("0 " + points[0].row.id);
      //    keyisdown = false;
      //  }
      // }
    };

  });
});



app.controller('ModalInstanceCtrl', function($scope, $uibModalInstance, $sce, githuburl) {

  $scope.githuburl = $sce.trustAsResourceUrl(githuburl);

  $scope.ok = function() {
    $uibModalInstance.close($scope.githuburl);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
});