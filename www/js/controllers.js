angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

    })

    .controller('homeCtrl', function ($scope, $localstorage) {

        $scope.pushups = 0;
        $scope.$on("$ionicView.enter", function (scopes, states) {
            if (states.fromCache && states.stateName == "app.home") {
                $scope.pushups = 0;
                updatePushups();

            }
        });

        updatePushups = function () {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            // if day exists in localStorage then set grid from localStorage
            if ($localstorage.get(today)) {
                var sets = JSON.parse($localstorage.get(today));
                for (var key in sets) {
                    if (sets.hasOwnProperty(key)) {
                        console.log(key + " -> " + JSON.stringify(sets[key].value));
                        var pushupSet = JSON.stringify(sets[key].value);
                        $scope.pushups = $scope.pushups + parseInt(pushupSet);
                    }
                }

            }
        }

        updatePushups();
    })

    .controller('gridCtrl', function ($scope, $localstorage) {
        $scope.itemWidth = 'medium';
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        // if day exists in localStorage then set grid from localStorage
        if ($localstorage.get(today)) {
            console.log($localstorage.get(today));
            $scope.items = JSON.parse($localstorage.get(today));
        } else {
            $scope.items = [];
            for (var i = 0; i < 100; i++) {
                var item = {
                    "index": i,
                    "value": 0
                }
                $scope.items.push(item);

            }
            $localstorage.set(today, JSON.stringify($scope.items));
        }

        $scope.submitForm = function (item, gridValue) {
            console.log($scope.items);
            $scope.items[item].value = gridValue;
            $localstorage.set(today, JSON.stringify($scope.items));

        }
    })

    .controller('settingsCtrl', function ($scope, $localstorage) {
        $scope.gridWidth = 'medium';
        $scope.gridRedirect = 'home';
    })
