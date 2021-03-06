'use strict';

(function () {
    var app = {
        data: {}
    };

    var bootstrap = function () {
        $(function () {
            app.mobileApp = new kendo.mobile.Application(document.body, {
                                                             skin: 'nova',
                                                             initial: 'components/home/view.html'
                                                         });
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', function () {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            var element = document.getElementById('appDrawer');
            if (typeof (element) != 'undefined' && element !== null) {
                if (window.navigator.msPointerEnabled) {
                    $('#navigation-container').on('MSPointerDown', 'a', function (event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $('#navigation-container').on('touchstart', 'a', function (event) {
                        app.keepActiveState($(this).closest('li'));
                    });
                }
            }

            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $('#navigation-container li.active').removeClass('active');
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function () {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };

    app.openLink = function (url) {
        if (url.substring(0, 4) === 'geo:' && device.platform === 'iOS') {
            url = 'http://maps.apple.com/?ll=' + url.substring(4, url.length);
        }

        window.open(url, '_system');
        if (window.event) {
            window.event.preventDefault && window.event.preventDefault();
            window.event.returnValue = false;
        }
    };

    /// start appjs functions
    /// end appjs functions
    app.showFileUploadName = function (itemViewName) {
        $('.' + itemViewName).off('change', 'input[type=\'file\']').on('change', 'input[type=\'file\']', function (event) {
            var target = $(event.target),
                inputValue = target.val(),
                fileName = inputValue.substring(inputValue.lastIndexOf('\\') + 1, inputValue.length);

            $('#' + target.attr('id') + 'Name').text(fileName);
        });
    };

    app.clearFormDomData = function (formType) {
        $.each($('.' + formType).find('input:not([data-bind]), textarea:not([data-bind])'), function (key, value) {
            var domEl = $(value),
                inputType = domEl.attr('type');

            if (domEl.val().length) {
                if (inputType === 'file') {
                    $('#' + domEl.attr('id') + 'Name').text('');
                }

                domEl.val('');
            }
        });
    };
}());

function logoutBtn() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userFirstName");
                               
    localStorage.removeItem("user");
    localStorage.removeItem("userLastName");
    
    $.ajax({
               url: "http://bgtaxi.net/Account/LogoutExternal?accessToken=" + getFromLocalStorage("accessToken"),
               type: "POST",
               dataType: "json",
               contentType: "application/json",
               success: function (status) {
                   if (status.status == "OK") {
                       localStorage.removeItem("user");
                       app["user"] = null;
                       localStorage.removeItem("userFirstName");
                       localStorage.removeItem("userLastName");
                       app.mobileApp.navigate('components/home/view.html');
                   }
               },
               erorr: function () {
               }
           });
}

function getFromLocalStorage(key) {
    return localStorage.getItem(key);
}
function saveInLocalStorage(key, value) {
    localStorage.setItem(key, value);
}
function backBtnClicked() {
    if (staringAddressView) {
        startingAddress.startingAddressFocusOut();
    }else {
        finishAddress.FocusOut();
    }
}

function init() {
    startingAddress.setMap();
    console.log("init");
   
    startingAddress.setLocationInterval();
}

var searchBtnIsClicked = false;
var staringAddressView = false;

function searchBtnClicked() {
    if (staringAddressView) {
        if (!searchBtnIsClicked) {
            searchBtnIsClicked = true;
            $("#startingAddressStreet").focus();
            $("#startingAddressStreet").val("");
            startingAddress.startingAddressFocused();
        }else {
            searchBtnIsClicked = false;
            $("#startingAddressStreet").blur();
            startingAddress.startingAddressFocusOut();
        }  
    }else {
        if (!searchBtnIsClicked) {
            searchBtnIsClicked = true;
            $("#finishAddressStreet").focus();
            $("#finishAddressStreet").val("");
            finishAddress.Focus();
        }else {
            searchBtnIsClicked = false;
            $("#finishAddressStreet").blur();
            finishAddress.FocusOut();
        }
    }
}
$(document).ajaxStart(function() {
    $("#appDrawer").data("kendoMobileDrawer").hide();
    $(".popup-loading").css("display", "block");
});

$(document).ajaxComplete(function() {
    $("#appDrawer").data("kendoMobileDrawer").hide();
    $(".popup-loading").css("display", "none");
});

// START_CUSTOM_CODE_kendoUiMobileApp
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_kendoUiMobileApp