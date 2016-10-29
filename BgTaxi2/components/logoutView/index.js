'use strict';

app.logoutView = kendo.observable({
    onShow: function() {
        localStorage.removeItem("bgTaxiAuth_authData_homeView");
        app.mobileApp.navigate('components/home/view.html');
    },
    afterShow: function() {}
});

// START_CUSTOM_CODE_logoutView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_logoutView