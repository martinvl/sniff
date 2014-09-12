var angular = require('angular');

angular.module('Sniff.Scoreboard', ['Sniff.Data'])
.controller('ScoreboardController', function ($scope, TaskService) {
    function updateTasks() {
        $scope.tasks = TaskService.tasks;
    }

    TaskService.on('update', function () {
        $scope.$apply(function () {
            updateTasks();
        });
    });
    updateTasks();
});
