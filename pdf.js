var casper = require('casper').create({
    verbose: false,
    logLevel: 'debug',
    pageSettings: {
        loadImages: true,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
    }
});
var utils = require('utils');
var tabList = [];

function openBhopalPage() {
    this.echo("Opening Bhopal Page");
    this.waitForSelector('.listing_lft_sec_inner > a:nth-child(6)', function() {
        this.click('.listing_lft_sec_inner > a:nth-child(6)');
        this.waitWhileSelector('.listing_lft_sec_inner', getTabs);
    });
}

function getTabs() {
    this.echo("In Bhopal Page. URL is " + this.getCurrentUrl());
    this.waitForSelector('ul#local li', function() {
        this.echo("Checking for all tabs since tab selector is visible");
        tabList = this.getElementsAttribute('ul#local li', 'id');
    }).then(parseTab);
}

function parseTab() {
    this.each(tabList, function(self, tabId) {
        self.then(function() {
            this.click("#" + tabId + " a");
        });
        self.then(function() {
            this.waitForSelector("#" + tabId + ".tab_loc_uns", function() {
                this.wait(2000);
                this.waitForSelector("#pageDropDown", function() {
                    var options = this.getElementsAttribute('#pageDropDown option', 'value');
                    var data;
                    this.each(options, function(self, option) {
                        self.then(function sendAJAX() {
                            var wsurl = "http://epaper.bhaskar.com" + option;
                            utils.dump(wsurl);
                            data = casper.evaluate(function() {
                                return __utils__.sendAJAX(wsurl);
                            });
                        });
                        self.then(function() {
                            utils.dump(data);
                        });
                    });
                    this.capture(tabId + ".png");
                });
            }, null, 10000);
        });
    });
}

casper.on('complete.error', function(err) {
    this.capture('error.png');
    this.die("Complete callback has failed: " + err);
});

casper.on('waitFor.timeout', function(err) {
    this.capture('error.png');
    this.die("Timeout occurred : " + err);
});
casper.start("http://epaper.bhaskar.com", openBhopalPage);
casper.run();
