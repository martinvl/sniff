var angular = require('angular');

angular.module('Sniff.Result', [])
.controller('ResultController', function ($scope, $location) {
    $scope.accepted = $location.search().accepted;
});
