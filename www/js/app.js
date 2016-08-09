var db;

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'ngCordova', 'ion-digit-keyboard'])

    .run(function ($ionicPlatform, $cordovaSQLite) {
        $ionicPlatform.ready(function () {

            db = $cordovaSQLite.openDB({name: "ctrl-pushupgrid.db", location: 'default'});
            $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Days (id INTEGER PRIMARY KEY AUTOINCREMENT, pushups INTEGER, day DATETIME)');

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'homeCtrl'
                    }
                }
            })

            .state('app.activity', {
                url: '/activity',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/activity.html'
                    }
                }
            })
            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: 'settingsCtrl'
                    }
                }
            })
            .state('app.grid', {
                url: '/grid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/grid.html',
                        controller: 'gridCtrl'
                    }
                }
            })
            .state('app.info', {
                url: '/info',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/info.html'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

        $ionicConfigProvider.backButton.text('Back').previousTitleText(false);
    })


    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                seen = [];

                $window.localStorage[key] = JSON.stringify(obj, function (key, val) {
                    if (val != null && typeof val == "object") {
                        if (seen.indexOf(val) >= 0) {
                            return;
                        }
                        seen.push(val);
                    }
                    return val;
                });
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])

    // .factory('sqliteExamples', ['$cordovaSQLite', function ($cordovaSQLite) {
    //update
    // $cordovaSQLite.execute(db, "UPDATE Days SET day = '\"2016-08-01T00:00:00.000Z\"', pushups = '48' WHERE id = 32");
    //insert
    // $cordovaSQLite.execute(db, "INSERT INTO Days (day,pushups) VALUES ('\"2016-08-01T00:00:00.000Z\"', 68)");
    // delete
    // $cordovaSQLite.execute(db, "DELETE FROM Days WHERE id = 16");
    // }])

    .factory('sqliteStorage', ['$cordovaSQLite', function ($cordovaSQLite) {
        return {
            add: function (day, pushups) {
                if (pushups == 0)
                    return;
                $cordovaSQLite.execute(db, 'INSERT INTO Days (pushups, day) VALUES (?,?)', [pushups, day])
                    .then(function (result) {
                        return true;
                    }, function (error) {
                        return false;
                    })
            },
            get: function (order) {
                order = order || 'DESC';
                var items = [];
                $cordovaSQLite.execute(db, 'SELECT * FROM Days ORDER BY id ' + order)
                    .then(
                        function (result) {
                            for (var i = 0; i < result.rows.length; i++) {
                                var item = {
                                    'pushups': result.rows.item(i).pushups,
                                    'day': JSON.parse(result.rows.item(i).day),
                                    'id': result.rows.item(i).id
                                };
                                items.push(item);
                            }
                        });

                return items;
            },
            delete: function (id) {
                $cordovaSQLite.execute(db, 'DELETE FROM Days WHERE id  = ' + id)
                    .then(
                        function (result) {
                            return true;
                        }, function (error) {
                            return false;
                        });
            }
        }
    }])

    .factory('gridFactory', ['$localstorage', function ($localstorage) {
        return {
            create: function (gridSize) {
                var items = [];
                for (var i = 0; i < gridSize; i++) {
                    var item = {
                        "index": i,
                        "value": 0
                    }
                    items.push(item);

                }
                return items;
            },
            addToLocalstorage: function (order) {
            }
        }
    }])

    .service('dayFactory', function () {
        return {
            get: function () {
                var today = new Date();
                // get offset of time so time is set to midnight
                today = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                var timeOffset = today.getTimezoneOffset() / 60;
                today.setHours(-timeOffset, 0, 0, 0);
                today = JSON.stringify(today);
                return today;
            }
        }
    });
