angular.module('starter.directives', [])

    .directive('gridProgress', function ($localstorage) {
        console.log('inside directive');
        return {
            template: '<div class="progress-wrapper" ng-show="showProgress"><div class="progress" style="width: {{percentage}}%"></div></div>',
            link: function (scope, element, attrs) {
                scope.$on("updateGrid", function (event, args) {
                    scope.showProgress = false;
                    scope.percentage = 0;
                    var todayGrid = JSON.parse($localstorage.get('today'));
                    var sets = todayGrid.sets;
                    var filledSets = 0;
                    var totalSets = 0;
                    for (var key in sets) {
                        if (sets.hasOwnProperty(key)) {
                            totalSets = totalSets + 1;
                            var pushupSet = JSON.stringify(sets[key].value);

                            if (pushupSet != 'null' && pushupSet > 0)
                                filledSets = filledSets + 1;
                        }
                    }
                    if (filledSets > 0)
                        scope.showProgress = true;
                    scope.percentage = (filledSets / totalSets) * 100;
                });
            }
        };
    });