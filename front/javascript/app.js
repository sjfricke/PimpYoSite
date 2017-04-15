//main module
var app = angular.module('app', ['ngRoute']);

//sets rootscope value prior to anything
app.run(function($rootScope) {
    $rootScope.rootTest = "RootScope";    
});

//routes to different views of different pages
app.config(['$routeProvider', function($routeProvider) {
    
  $routeProvider.
    when('/', {
      templateUrl: 'templates/start.html'
    }).
    when('/test', {
      templateUrl: 'templates/test.html',
      controller:  'TestController',
      controllerAs: 'login'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);


