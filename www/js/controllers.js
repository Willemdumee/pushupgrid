angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
        //$scope.$on('$ionicView.enter', function(e) {
        //});

    })

    .controller('homeCtrl', function ($scope, $localstorage, $ionicPlatform, $state, sqliteStorage, $ionicModal, $timeout, dayFactory) {

        var today = dayFactory.get();
        $scope.items = [];
        $scope.pushups = 0;


        $ionicPlatform.ready(function () {
            $scope.items = sqliteStorage.get();
        });

        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.pushups = 0;
            updatePushups();
            $scope.$broadcast("updateGrid");
            if (states.fromCache && states.stateName == "app.home") {
                $scope.$broadcast("updateGrid");
            }
        });

        $scope.goToGrid = function () {
            $state.go('app.grid');
        };



        updatePushups = function () {

            // if day exists in localStorage then set grid from localStorage
            if ($localstorage.get('today')) {
                var storedData = JSON.parse($localstorage.get('today'));
                var storedDay = storedData.day;
                if (storedDay == today) {
                    // go ahead and check what you've done today
                    var sets = storedData.sets;
                    for (var key in sets) {
                        if (sets.hasOwnProperty(key)) {
                            var pushupSet = JSON.stringify(sets[key].value);
                            if (pushupSet != 'null')
                                $scope.pushups = $scope.pushups + parseInt(pushupSet);
                        }
                    }
                    $scope.$broadcast("updateGrid");
                } else {
                    // this is an old day, save it in database
                    var day = storedData.day;
                    var oldSets = storedData.sets;
                    var pushups = 0;
                    for (var oldKey in oldSets) {
                        if (oldSets.hasOwnProperty(oldKey)) {
                            var oldPushupSet = JSON.stringify(oldSets[oldKey].value);
                            pushups = pushups + parseInt(oldPushupSet);
                        }
                    }
                    sqliteStorage.add(day, pushups);
                    createTodayGrid();
                }
            }
        };

        $ionicModal.fromTemplateUrl('day-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        function createTodayGrid() {
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
            $scope.$broadcast("updateGrid");
        }

    })

    .controller('gridCtrl', function ($scope, $ionicPlatform, $localstorage, sqliteStorage, gridFactory, dayFactory) {

        var today = dayFactory.get();

        $scope.itemWidth = 'medium';
        $scope.gridSize = '100';
        $scope.keyboardVisible = false;
        // used later to determine which field in grid is used
        $scope.activeField = false;

        // ion digit keyboard settings
        $scope.keyboardSettings = {
            theme: "asertive",
            action: function (number) {
                $scope.items[$scope.activeField].value += number;
                setGridinLocalStorage();
            },
            leftButton: {
                html: '<i class="icon ion-minus"></i>',
                action: function () {
                    if ($scope.items[$scope.activeField].value > 0) {
                        $scope.items[$scope.activeField].value -= 1;
                        setGridinLocalStorage();
                    }
                }
            },
            rightButton: {
                html: '<i class="icon ion-plus"></i>',
                action: function () {
                    $scope.items[$scope.activeField].value += 1;
                    setGridinLocalStorage();
                }
            }
        };

        $scope.showKeyboard = function ($event, index) {
            if ($event.stopPropagation) $event.stopPropagation();
            if ($event.preventDefault) $event.preventDefault();

            $scope.activeField = index;
            // clear the already existing value
            $scope.items[$scope.activeField].value = 0;
            setGridinLocalStorage();
            $scope.keyboardVisible = true;
        };

        $scope.hideKeyboard = function ($event) {
            $scope.keyboardVisible = false;
        };

        if (typeof $localstorage.get('ctrl-gridWidth') !== 'undefined') {
            $scope.itemWidth = $localstorage.get('ctrl-gridWidth');
        }
        if (typeof $localstorage.get('ctrl-gridSize') !== 'undefined') {
            $scope.gridSize = $localstorage.get('ctrl-gridSize');
        }

        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.$broadcast("updateGrid");
            if (states.fromCache && states.stateName == "app.grid") {
                if (typeof $localstorage.get('ctrl-gridWidth') !== 'undefined') {
                    $scope.itemWidth = $localstorage.get('ctrl-gridWidth');
                }
                if (typeof $localstorage.get('ctrl-gridSize') !== 'undefined') {
                    $scope.gridSize = $localstorage.get('ctrl-gridSize');
                }
            }
        });

        $ionicPlatform.ready(function () {

            // check if 'today' exists in local storage
            if ($localstorage.get('today')) {
                //get data
                var storedData = JSON.parse($localstorage.get('today'));
                var storedDay = storedData.day;
                // check if the day in stored data is today
                if (storedData.day == today) {
                    $scope.items = storedData.sets;
                } else {
                    var sets = storedData.sets;
                    var pushups = 0;
                    for (var key in sets) {
                        if (sets.hasOwnProperty(key)) {
                            var pushupSet = JSON.stringify(sets[key].value);
                            pushups = pushups + parseInt(pushupSet);
                        }
                    }
                    // add day to database
                    var addedDay = sqliteStorage.add(storedDay, pushups);
                    createTodayGrid();
                }
            } else {
                createTodayGrid();
            }
        });

        $scope.submitForm = function (item, gridValue) {
            $scope.items[item].value = gridValue;
            setGridinLocalStorage();
        }

        function createTodayGrid() {
            $scope.items = gridFactory.create($scope.gridSize);
            setGridinLocalStorage();
            $scope.$broadcast("updateGrid");
        }

        function setGridinLocalStorage() {
            $localstorage.set('today', JSON.stringify({
                "day": today,
                "sets": $scope.items
            }));
            // make sure that directive 'grid-progress 'knows the grid is updated
            $scope.$broadcast("updateGrid");

        }
    })

    .controller('settingsCtrl', function ($scope, $localstorage) {
        $scope.settingsData = [];

        $scope.settingsData.gridWidth = 'medium';
        $scope.settingsData.gridRedirect = 'home';
        $scope.settingsData.gridSize = '100';

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
