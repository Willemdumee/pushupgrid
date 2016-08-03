angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

    })

    .controller('homeCtrl', function ($scope, $localstorage, $cordovaSQLite, $ionicPlatform, $state) {

        var today = new Date();
        //for testing purposes set current date to tomorrow
        //today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        var timeOffset = today.getTimezoneOffset() / 60;
        today.setHours(-timeOffset, 0, 0, 0);

        today = JSON.stringify(today);

        $scope.items = [];
        $scope.pushups = 0;

        $ionicPlatform.ready(function () {

            updatePushups();
            loadHistory();

        });

        loadHistory = function () {

            $cordovaSQLite.execute(db, 'SELECT * FROM Days ORDER BY id DESC')
                .then(
                    function (result) {
                        for (var i = 0; i < result.rows.length; i++) {
                            var item = {
                                'pushups': result.rows.item(i).pushups,
                                'day': JSON.parse(result.rows.item(i).day),
                                'id': result.rows.item(i).id
                            };
                            $scope.items.push(item);
                        }
                    }

                );
        };


        $scope.$on("$ionicView.enter", function (scopes, states) {
            if (states.fromCache && states.stateName == "app.home") {
                $scope.pushups = 0;
                updatePushups();

            }
        });

        $scope.goToGrid = function() {
            $state.go('app.grid');
        };

        updatePushups = function () {

            // if day exists in localStorage then set grid from localStorage
            if ($localstorage.get('today')) {
                console.log('theres a day in localstorage');
                var storedData = JSON.parse($localstorage.get('today'));
                var storedDay = storedData.day;
                if (storedDay == today) {
                    console.log('today is the day');
                    // go ahead and check what youve done today
                    var sets = storedData.sets;
                    for (var key in sets) {
                        if (sets.hasOwnProperty(key)) {
                            var pushupSet = JSON.stringify(sets[key].value);
                            if (pushupSet != 'null')
                                $scope.pushups = $scope.pushups + parseInt(pushupSet);
                        }
                    }
                } else {
                    // this is an old day, save it in database
                    console.log('start  fresh');
                    //get data ready
                    var day = storedData.day;
                    var oldSets = storedData.sets;
                    var pushups = 0;
                    for (var oldKey in oldSets) {
                        if (oldSets.hasOwnProperty(oldKey)) {
                            var oldPushupSet = JSON.stringify(oldSets[oldKey].value);
                            pushups = pushups + parseInt(oldPushupSet);
                        }
                    }
                    // and save it
                    $cordovaSQLite.execute(db, 'INSERT INTO Days (pushups, day) VALUES (?,?)', [pushups, day])
                        .then(function (result) {
                            console.log("Day saved successful, cheers!");
                        }, function (error) {
                            console.log("Error on saving: " + error.message);
                        })
                }
            }
        };

    })

    .controller('gridCtrl', function ($scope, $localstorage) {

        var today = new Date();
        // get offset of time so time is set to midnight
        var timeOffset = today.getTimezoneOffset() / 60;
        today.setHours(-timeOffset, 0, 0, 0);
        today = JSON.stringify(today);

        $scope.itemWidth = 'medium';
        $scope.gridSize = '100';

        if (typeof $localstorage.get('ctrl-gridWidth') !== 'undefined') {
            $scope.itemWidth = $localstorage.get('ctrl-gridWidth');
        }
        if (typeof $localstorage.get('ctrl-gridSize') !== 'undefined') {
            $scope.gridSize = $localstorage.get('ctrl-gridSize');
        }

        $scope.$on("$ionicView.enter", function (scopes, states) {
            if (states.fromCache && states.stateName == "app.grid") {
                if (typeof $localstorage.get('ctrl-gridWidth') !== 'undefined') {
                    $scope.itemWidth = $localstorage.get('ctrl-gridWidth');
                }
                if (typeof $localstorage.get('ctrl-gridSize') !== 'undefined') {
                    $scope.gridSize = $localstorage.get('ctrl-gridSize');
                }
            }
        });



        // check if 'today' exists in local storage
        if ($localstorage.get('today')) {
            console.log('there is a today in localstorage');
            //get data
            var storedData = JSON.parse($localstorage.get('today'));
            var storedDay = JSON.stringify(storedData.day);
            console.log(today, storedDay);
            // check if the day in stored data is today
            if (storedData.day == today) {
                console.log('the day in localstorage matches today');
                $scope.items = storedData.sets;
            } else {
                console.log('the day in localstorage doesnt match today');
                // @todo create function to store data into sqlite
                createTodayGrid();
            }
        } else {
            console.log('today doenst exist yet in localstorage');
            createTodayGrid();
        }

        $scope.submitForm = function (item, gridValue) {
            $scope.items[item].value = gridValue;
            setGridinLocalStorage();
        }

        function createTodayGrid() {
            console.log('create todays grid');
            $scope.items = [];
            for (var i = 0; i < $scope.gridSize; i++) {
                var item = {
                    "index": i,
                    "value": 0
                }
                $scope.items.push(item);

            }
            setGridinLocalStorage();
        }

        function setGridinLocalStorage() {
            $localstorage.set('today', JSON.stringify({
                "day": today,
                "sets": $scope.items
            }));

        }
    })

    .controller('settingsCtrl', function ($scope, $localstorage) {
        $scope.settingsData = [];

        $scope.settingsData.gridWidth = 'medium';
        $scope.settingsData.gridRedirect = 'home';
        $scope.settingsData.gridSize = '100';

        console.log($localstorage.get('ctrl-gridWidth'));

        if (typeof $localstorage.get('ctrl-gridWidth') !== 'undefined') {
            $scope.settingsData.gridWidth = $localstorage.get('ctrl-gridWidth');
        } else {
            $localstorage.set('ctrl-gridWidth', 'medium');
        }
        if (typeof $localstorage.get('ctrl-gridSize') !== 'undefined') {
            $scope.settingsData.gridSize = $localstorage.get('ctrl-gridSize');
        } else {
            $localstorage.set('ctrl-gridWidth', '100');
        }

        $scope.changeGridSize = function () {
            $localstorage.set('ctrl-gridSize', $scope.settingsData.gridSize);
        }

        $scope.changeGridWidth = function () {
            $localstorage.set('ctrl-gridWidth', $scope.settingsData.gridWidth);
        }

    });
