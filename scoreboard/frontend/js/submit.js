var angular = require('angular');

angular.module('Sniff.Submit', ['Sniff.Data'])
.controller('SubmitController', function ($scope, $location, TaskService) {
    var selectedTaskId;

    function updateTasks() {
        $scope.tasks = TaskService.tasks;

        for (var idx in $scope.tasks) {
            var task = $scope.tasks[idx];

            if (!selectedTaskId) {
                selectedTaskId = task.id;
            }

            task.selected = task.id === selectedTaskId;
        }
    }

    TaskService.on('update', function () {
        $scope.$apply(function () {
            updateTasks();
        });
    });
    updateTasks();

    $scope.selectTask = function (task) {
        for (var idx in $scope.tasks) {
            $scope.tasks[idx].selected = false;
        }

        task.selected = true;
        selectedTaskId = task.id;
    };

    $scope.send = function () {
        var taskId = selectedTaskId;
        var key = $scope.key;
        var name = $scope.name;

        TaskService.claim(taskId, key, name).then(function (accepted) {
            $scope.$apply(function () {
                $location.url('/result')
                    .search('accepted', accepted);
            });
        });
    };
})
.filter('keyTasks', function () {
    return function (tasks) {
        var keyTasks = [];

        for (var idx in tasks) {
            var task = tasks[idx];

            if (task.mode === 'key') {
                keyTasks.push(task);
            }
        }

        return keyTasks;
    };
});
