'use strict';

(function() {
    var provider = app.data.bgTaxi2 = new Everlive({
        offlineStorage: true,
        appId: '7vf8m4trbsidtqjk',
        scheme: 'https',
        authentication: {
            persist: true
        }
    });

    function _readyTimeout() {
        if (!provider.sbReady) {
            provider.sbReady = true;
            provider.emit('sbReady');
        }
    }

    provider.sbProviderReady = function sbProviderReady(callback) {
        if (provider.sbReady) {
            return callback();
        } else {
            provider.once('sbReady', callback);
        }
    }

    document.addEventListener('online', function _appOnline() {
        provider.offline(false);
        provider.sync();
        _readyTimeout();
    });

    document.addEventListener('offline', function _appOffline() {
        provider.offline(true);
        _readyTimeout();
    });

    window.setTimeout(_readyTimeout, 2000);

}());

// START_CUSTOM_CODE_bgTaxi2
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_bgTaxi2