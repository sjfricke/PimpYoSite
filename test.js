const browser = require('zombie');
browser.localhost('example.com', 3000)
browser.visit('/path', function() {
//    console.log(browser.location.href);
    console.dir(browser.resources);
    console.log("\n";)
});
