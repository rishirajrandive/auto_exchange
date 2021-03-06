/**
 * Created by rishi on 11/23/16.
 */

var auto_exchange = angular.module('auto_exchange', ['ngRoute']);

auto_exchange.config(function ($routeProvider) {
    console.log("Inside config");
    $routeProvider
        .when('/',
            {
                templateUrl: '/partials/welcome.html',
                controller: 'welcome'
            })
        .when('/check-cust',
            {
                templateUrl: '/partials/check_customer.html',
                controller: 'check_customer'
            })
        .when('/add',
            {
                templateUrl: '/partials/add_transaction.html',
                controller: 'add_transaction'
            })
        .when('/branch',
            {
                templateUrl: '/partials/branch.html',
                controller: 'branch'
            })
        .when('/branch-info',
            {
                templateUrl: '/partials/branch_info.html',
                controller: 'branch_info'
            })
        .when('/transactions',
            {
                templateUrl: '/partials/transactions.html',
                controller: 'transactions'
            })
        .when('/thankyou',
            {
                templateUrl: '/partials/thankyou.html',
                controller: 'thankyou'
            })
        .when('/customers',
            {
                templateUrl: '/partials/customers.html',
                controller: 'customers'
            })
        .when('/cars',
            {
                templateUrl: '/partials/cars.html',
                controller: 'cars'
            })
        .otherwise({redirectTo: '/'});
});

auto_exchange.controller('welcome', function ($scope, $http, $window, $rootScope) {
    $scope.current_branch = {};
    $scope.getBranchInfo = function () {
        $http({
            method : "GET",
            url : '/branch-data',
            params: {},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200) {
                console.log(JSON.stringify(data.profile));
                $rootScope.current_branch = data.profile;
                $scope.current_branch = data.profile;
            }else {
                $scope.error_msg = "Error fetching customer info";
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };
});

auto_exchange.controller('check_customer', function ($scope, $http, $window, $rootScope) {
    $scope.customer = {};
    $scope.vehicle = {};
    $scope.error = false;
    $rootScope.new_customer = true;
    $rootScope.new_vehicle = true;
    $scope.checkSsnAndVin = function () {
        if($scope.customer.ssn != undefined && $scope.customer.ssn != ''){
            $scope.checkCustomer();
        }else{
            $scope.checkVehicle();
        }
    };

    $scope.checkCustomer = function () {
        $http({
            method : "POST",
            url : '/api/getCustomerBySsn',
            params: {ssn: $scope.customer.ssn},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length > 0) {
                console.log(JSON.stringify("Ouptupt" + data.profile));
                $rootScope.customer = data.profile[0];
                $rootScope.new_customer = false;
            }else{
                $rootScope.customer = {};
                $rootScope.new_customer = true;
            }

            if($scope.vehicle.vin != undefined && $scope.vehicle.vin != ''){
                $scope.checkVehicle();
            }else {
                $window.location.href = "#/add";
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.checkVehicle = function () {
        $scope.info = false;
        $scope.info_msg = '';
        $scope.error = false;
        $scope.error_msg = '';
        $http({
            method : "POST",
            url : '/api/getCarById',
            params: {vin: $scope.vehicle.vin},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
                $rootScope.vehicle = data.profile[0];
                $rootScope.new_vehicle = false;
            }else {
                $rootScope.vehicle = {};
                $rootScope.new_vehicle = true;
            }
            $window.location.href = "#/add";
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.newCustomer = function () {
        $rootScope.new_customer = true;
        $window.location.href = "#/add";
    };

});

auto_exchange.controller('add_transaction', function ($scope, $http, $window, $rootScope) {

    $scope.isCustomerDisabled = false;
    $scope.isVehicleDisabled = false;
    $scope.gender = [{value: 'M', name: 'M'}, {value: 'F', name: 'F'}];
    $scope.cars = getCars();
    $scope.manufactured_years = getYears();
    $scope.car_types = [{value: 'Hatchback', name: 'Hatchback'}, {value: 'Sedan', name: 'Sedan'},
        {value: 'Wagon', name: 'Wagon'}, {value: 'Coupe', name: 'Coupe'},
        {value: 'Convertible', name: 'Convertible'}, {value: 'Sports car', name: 'Sports car'},
        {value: 'Truck', name: 'Truck'}];

    $scope.error = false;
    $scope.success = false;
    $scope.info = false;

    $scope.isDiscount = false;
    console.log("Scope value "+ $rootScope.new_customer + "   " + $rootScope.new_vehicle);
    var message = '';

    if($rootScope.new_customer){
        $scope.customer = {};
        message = 'Customer match not found';
    }else {
        $scope.customer = $rootScope.customer;
        message = 'Customer match found';
        $scope.isCustomerDisabled = true;
    }

    if($rootScope.new_vehicle){
        $scope.vehicle = {};
        message = message + ' and car match not found';
    }else {
        $scope.vehicle = $rootScope.vehicle;
        message = message + ' and car match found';
        $scope.isVehicleDisabled = true;
    }
    $scope.info = true;
    $scope.info_msg = message;

    $scope.checkForDiscount = function () {
        console.log("Check disocunt "+ $rootScope.customer + " scope "+ $scope.customer);
        $http({
            method : "POST",
            url : '/api/getCustomerHistory',
            params: {ssn: $scope.customer.ssn},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200) {
                console.log(JSON.stringify(data.discount));
                if(data.discount != 0){
                    $scope.isDiscount = true;
                    $scope.customer.discount = data.discount;
                }
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.addTransaction = function () {
        if($rootScope.new_customer){
            $scope.addCustomer();
        }else {
            $scope.addVehicle();
        }
    };

    $scope.addCustomer = function () {
        $http({
            method : "POST",
            url : '/api/addNewCustomer',
            params: $scope.customer,
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
                $scope.addVehicle();
                $scope.addMobile();
                $scope.addEmail();
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.addVehicle = function () {
        $scope.vehicle.ssn = $scope.customer.ssn;
        if($scope.vehicle.type == 'buy'){
            $http({
                method : "POST",
                url : '/api/setTransactionBuy',
                params: $scope.vehicle,
                headers : {'Content-Type': 'application/json'}
            }).success(function(data) {
                if (data.status == 200 && data.profile.length != 0) {
                    console.log(JSON.stringify(data.profile));
                    $window.location.href = "#/thankyou";
                }else {
                    $scope.error_msg = data.message;
                    $scope.error = true;
                }
            }).error(function(error) {
                console.log("Error "+ error);
                $scope.error_msg = error;
                $scope.error = true;
            });
        }else {
            $http({
                method : "POST",
                url : '/api/setTransactionSell',
                params: $scope.vehicle,
                headers : {'Content-Type': 'application/json'}
            }).success(function(data) {
                if (data.status == 200 && data.profile.length != 0) {
                    console.log(JSON.stringify(data.profile));
                    $window.location.href = "#/thankyou";
                }else {
                    $scope.error_msg = data.message;
                    $scope.error = true;
                }
            }).error(function(error) {
                console.log("Error "+ error);
                $scope.error_msg = error;
                $scope.error = true;
            });
        }
    };

    $scope.addMobile = function () {
        $http({
            method : "POST",
            url : '/api/setCustomerPhoneNo',
            params: {ssn: $scope.customer.ssn, primary_mobile: $scope.customer.primary_mobile,
                secondary_mobile: $scope.customer.secondary_mobile},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.addEmail = function () {
        $http({
            method : "POST",
            url : '/api/setCustomerEmail',
            params: {ssn: $scope.customer.ssn, primary_email: $scope.customer.primary_email,
                secondary_email: $scope.customer.secondary_email},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };



    $scope.getModels = function (carId) {
        console.log("Select car id "+ carId);
        $scope.vehicle.manufacturer = getCars().manufacturer[carId].name;
        $scope.models = getCars().manufacturer[carId].models;
    }
});

auto_exchange.controller('branch', function ($scope, $http, $window, $rootScope) {
    $scope.branches = {};
    $scope.lastSelected = '';
    $scope.actionDisabled = true;

    if($rootScope.branch_update){
        $scope.info = true;
        $scope.info_msg = "Company branch updated";
    }else if($rootScope.branch_add){
        $scope.info = true;
        $scope.info_msg = "Company branch added";
    }

    $scope.getAllBranches = function () {
        $http({
            method : "POST",
            url : '/api/getAllBranches',
            params: {},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
                $scope.branches = data.profile;
            }else {
                $scope.error_msg = "No branches found";
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.setSelected = function (branch_id, location) {
        console.log("Selected branch = "+ branch_id);
        if ($scope.lastSelected) {
            $scope.lastSelected.selected = '';
        }
        this.selected = 'row-select';
        $scope.lastSelected = this;
        $scope.actionDisabled = false;
        $rootScope.branch_id = branch_id;
        $scope.location = location;
    };

    $scope.addBranch = function () {
        $rootScope.new_branch = true;
        $window.location.href = "#/branch-info";
    };

    $scope.updateBranch = function () {
        $rootScope.new_branch = false;
        $window.location.href = "#/branch-info";
    };

    $scope.useBranch = function () {
        $http({
            method : "POST",
            url : '/api/updateSession',
            params: {branch_id: $rootScope.branch_id, location: $scope.location},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                console.log(JSON.stringify(data.profile));
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            console.log("Error "+ error);
            $scope.error_msg = error;
            $scope.error = true;
        });
        $window.location.href = "#/";
    }

    $scope.deleteBranch = function () {
        $http({
            method : "POST",
            url : '/api/deletebranch',
            params: {branch_id: $rootScope.branch_id},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                $scope.success = true;
                $scope.success_msg = "Successfully deleted branch";
            }else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function(error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };
});

auto_exchange.controller('branch_info', function ($scope, $http, $window, $rootScope) {

    var branch_id = $rootScope.branch_id;
    $scope.branch = {};
    $scope.message = "Add new branch information";
    $rootScope.branch_update = false;
    $rootScope.branch_add = false;
    $scope.buttonText = "Add";

    if(branch_id && !$rootScope.new_branch) {
        $scope.buttonText = "Update";
        $scope.message = "Update branch information for branch number "+ branch_id;
        $http({
            method: "POST",
            url: '/api/getBranchById',
            params: {branch_id: branch_id},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            if (data.status == 200 && data.profile.length != 0) {
                $scope.branch = data.profile[0];
            } else {
                $scope.error_msg = data.message;
                $scope.error = true;
            }
        }).error(function (error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    }

    $scope.branchInfo = function () {
        if($rootScope.new_branch){
            $http({
                method: "POST",
                url: '/api/addNewBranch',
                params: $scope.branch,
                headers: {'Content-Type': 'application/json'}
            }).success(function (data) {
                if (data.status == 200 && data.profile.length != 0) {
                    $rootScope.branch_update = false;
                    $window.location.href = "#/branch";
                } else {
                    $scope.error_msg = data.result;
                    $scope.error = true;
                }
            }).error(function (error) {
                $scope.error_msg = error;
                $scope.error = true;
            });
        }else {
            $http({
                method: "POST",
                url: '/api/updateBranchInfo',
                params: $scope.branch,
                headers: {'Content-Type': 'application/json'}
            }).success(function (data) {
                if (data.status == 200 && data.profile.length != 0) {
                    $rootScope.branch_add = true;
                    $window.location.href = "#/branch";
                } else {
                    $scope.error_msg = data.result;
                    $scope.error = true;
                }
            }).error(function (error) {
                $scope.error_msg = error;
                $scope.error = true;
            });
        }

    };
});

auto_exchange.controller('transactions', function ($scope, $http, $window, $rootScope) {
    $scope.transactions = {};
    $scope.searchText = '';

    $scope.searchTransaction = function () {
        if($scope.searchText != ''){
            $http({
                method: "POST",
                url: '/api/getCustomerHistory',
                params: {ssn: $scope.searchText},
                headers: {'Content-Type': 'application/json'}
            }).success(function (data) {
                if (data.status == 200 && data.profile.length != 0) {
                    $scope.transactions = data.profile;
                } else {
                    $scope.error_msg = "Transaction with SSN not found";
                    $scope.error = true;
                }
            }).error(function (error) {
                $scope.error_msg = error;
                $scope.error = true;
            });
        }else {
            $scope.error = true;
            $scope.error_msg = "SSN cannot be blank";
        }
    };
});

auto_exchange.controller('thankyou', function ($scope, $http, $window, $rootScope) {
    $scope.makeAnother = function () {
        $rootScope.new_customer = true;
        $rootScope.customer = {};
        $window.location.href = "#/check-cust";
    };
});

/** Customers Functions  starts: Ishan **/
auto_exchange.controller('customers', function ($scope, $http, $window, $rootScope) {
    $scope.showAllCust = false;
    $scope.showSearchPage = true;

    $http.post('api/getAllCustomers').then(function (result) {
        $scope.showAllCust = true;
        $scope.showOtherSearches = true;
        $scope.customers = result.data.profile;

    });


    $scope.custSearchOptions = [{value: 'ssn', name: 'Search by SSN'}, {value: 'name', name: 'Search by Name'},
        {value: 'license', name: 'Search by Lincese Number'}, {value: 'email', name: 'Search by E-Mail'},
        {value: 'phone', name: 'Search by Phone'}];


    $scope.onOptionChange = function (searchBy) {
        $scope.searchBy = searchBy;
        $scope.searchText = '';
        if(searchBy == 'name'){
            $scope.showOtherSearches = false;
        }
    };

    $scope.addNewCustomer = function () {
        $rootScope.new_customer = true;
        $window.location.href = "#/add";
    };

    $scope.searchCustomer = function () {
        $scope.showAllCust = false;
        if($scope.searchBy == 'ssn'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getCustomerBySsn',
                    params: {ssn: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.customers = data.profile;

                    } else {
                        $scope.error_msg = "Customer with SSN " +$scope.searchText+" not found";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "SSN cannot be blank";
            }
        }else if($scope.searchBy == 'name'){
            var full_name =$scope.searchText.split(" ");
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getCustomerByName',
                    params: {first_name:full_name[0] , last_name:full_name[1] },
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.customers = data.profile;

                    } else {
                        $scope.error_msg = "Customer with name not found";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Name cannot be blank";
            }
        }  else if($scope.searchBy == 'email'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getCustomerByEmail',
                    params: {email: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.customers = data.profile;

                    } else {
                        $scope.error_msg = "customer with email not found";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "email cannot be blank";
            }
        }  else if($scope.searchBy == 'phone'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getCustomerByPhone',
                    params: {phone: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.customers = data.profile;

                    } else {
                        $scope.error_msg = "customer with phone not found";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "phone cannot be blank";
            }
        } else if($scope.searchBy == 'license'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getCustomerByLicense',
                    params: {license: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.customers = data.profile;

                    } else {
                        $scope.error_msg = "customer with license not found";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "license cannot be blank";
            }
        }
    };
    $scope.editCustomer = function (ssn) {
        $scope.showSearchPage = false;
    $scope.custSsn = ssn;
        $http({
            method: "POST",
            url: '/api/getCustomerBySsn',
            params: {ssn: $scope.custSsn},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            if (data.status == 200 && data.profile.length != 0) {
                $scope.customer = data.profile[0];
                $scope.primary_mobile = data.profile_mobile[0].mobile_no;
                $scope.primary_email = data.profile_email[0].email;
                $scope.old_pri_mobile = $scope.primary_mobile;
                $scope.old_pri_email = $scope.primary_email;

                if(data.profile_email.length > 1){
                    $scope.secondary_email = data.profile_email[1].email;
                    $scope.old_sec_email = $scope.secondary_email;
                }
                if(data.profile_mobile.length > 1){
                    $scope.secondary_mobile = data.profile_mobile[1].mobile_no;
                    $scope.old_sec_mobile = $scope.secondary_mobile;
                }

            } else {
                $scope.error_msg = "customer with ssn not found";
                $scope.error = true;
            }
        }).error(function (error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.getCurrentBranch = function () {
        if($rootScope.current_branch == undefined){
            $scope.current_branch = {};
            $http({
                method : "GET",
                url : '/branch-data',
                params: {},
                headers : {'Content-Type': 'application/json'}
            }).success(function(data) {
                if (data.status == 200) {
                    $rootScope.current_branch = data.profile;
                    $scope.current_branch = data.profile;
                }else {
                    $scope.error_msg = "Error fetching customer info";
                    $scope.error = true;
                }
            }).error(function(error) {
                $scope.error_msg = error;
                $scope.error = true;
            });
        }
    };

    $scope.updateCustomerInfo = function () {
        $scope.upadateCustomer();
        $scope.updateCustomerEmail();
        $scope.updateCustomerMobile();
        $window.location.reload();
    };
    $scope.upadateCustomer = function () {
        $http({
            method: "POST",
            url: '/api/updateCustomerInfo',
            params: $scope.customer,
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            if (data.status == 200 && data.profile.length != 0) {


            } else {
                $scope.error_msg = "customer with ssn not found";
                $scope.error = true;
            }
        }).error(function (error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.updateCustomerEmail = function () {
        $http({
            method: "POST",
            url: '/api/updateCustomerEmail',
            params: {ssn: $scope.customer.ssn, primary_email: $scope.primary_email,
                secondary_email: $scope.secondary_email, old_pri_email: $scope.old_pri_email,
                old_sec_email: $scope.old_sec_email},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            if (data.status == 200 && data.profile.length != 0) {

            } else {
                $scope.error_msg = "customer with ssn not found";
                $scope.error = true;
            }
        }).error(function (error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };

    $scope.updateCustomerMobile = function () {
        $http({
            method: "POST",
            url: '/api/updateCustomerPhoneNo',
            params: {ssn: $scope.customer.ssn, primary_mobile: $scope.primary_mobile,
                secondary_mobile: $scope.secondary_mobile, old_pri_mobile: $scope.old_pri_mobile,
                old_sec_mobile: $scope.old_sec_mobile},
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            if (data.status == 200 && data.profile.length != 0) {

            } else {
                $scope.error_msg = "customer with ssn not found";
                $scope.error = true;
            }
        }).error(function (error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };
});
/** Customers Functions  ends: Ishan **/

auto_exchange.controller('cars', function ($scope, $http, $window, $rootScope) {

    $scope.showAllCars = false;


    $scope.carSearchOptions = [{value: 'vehicleId', name: 'Search by VIN'}, {value: 'mfr', name: 'Search by Manufacturer'},
        {value: 'mfr_year', name: 'Search by Mfr Year'}, {value: 'model_no', name: 'Search by Model Number'},
        {value: 'type', name: 'Search by Type'} , {value: 'price_start', name: 'Search by starting price'},
        {value: 'price_end', name: 'Search by ending price'}];

    $scope.onOptionChange = function (searchBy) {
        $scope.searchBy = searchBy;
        $scope.searchText = '';
    };

    $http.post('api/getIn_Stock_CarsbyBranchId').then(function (result) {
        $scope.showAllCars = true;
        $scope.cars = result.data.profile;

    });

    $scope.getCarHistory =function (vehicleId) {
        $scope.showAllCars = false;
        $http({
            method : "POST",
            url : '/api/getTransactionAndCarDetailsbyVehicleID',
            params: {vin: vehicleId},
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                $scope.carHistory = data.profile;
                $scope.carDetails = data.profile_car_details;
            }else {
                $scope.error_msg = data.result;
                $scope.error = true;
            }
        }).error(function(error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };


    $scope.getAllInStockCars =function () {
        $scope.showAllCars = true;
        $http({
            method : "POST",
            url : '/api/getAllIn_Stock_Cars',
            headers : {'Content-Type': 'application/json'}
        }).success(function(data) {
            if (data.status == 200 && data.profile.length != 0) {
                $scope.cars = data.profile;
             }else {
                $scope.error_msg = data.result;
                $scope.error = true;
            }
        }).error(function(error) {
            $scope.error_msg = error;
            $scope.error = true;
        });
    };



    $scope.searchCar = function () {
        $scope.showAllCars = true   ;
        if($scope.searchBy == 'vehicleId'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {Vehicle_ID: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with VIN " +$scope.searchText+" not found in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "VIN cannot be blank";
            }
        }else if($scope.searchBy == 'mfr'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {Manufacturer:$scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with Manufacturer not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Name cannot be blank";
            }
        }  else if($scope.searchBy == 'mfr_year'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {manufactured_year: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with manufactured year not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Manufactured year cannot be blank";
            }
        }  else if($scope.searchBy == 'model_no'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {model_no: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with model number not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Car with model number cannot be blank";
            }
        } else if($scope.searchBy == 'type'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {car_type: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with type not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Car type cannot be blank";
            }
        } else if($scope.searchBy == 'price_start'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {In_Stock_price_start: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with price start not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Price start cannot be blank";
            }
        }  else if($scope.searchBy == 'price_end'){
            if($scope.searchText != ''){
                $http({
                    method: "POST",
                    url: '/api/getIn_Stock_Car',
                    params: {In_Stock_price_end: $scope.searchText},
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if (data.status == 200 && data.profile.length != 0) {
                        $scope.cars = data.profile;

                    } else {
                        $scope.error_msg = "Car with price-end not in stock";
                        $scope.error = true;
                    }
                }).error(function (error) {
                    $scope.error_msg = error;
                    $scope.error = true;
                });
            }else {
                $scope.error = true;
                $scope.error_msg = "Price end cannot be blank";
            }
        }
    };
});