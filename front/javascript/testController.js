app.controller('TestController', function($scope, $http, $rootScope, $location) {

    function getTest(){
         $http.get("/api/test").success(function(data){
            $scope.getResults = data;
        });
    }   
    
    
   $scope.scopeTest = "ScopeTest"    
  
    
});