const { JUnitXmlReporter } = require('jasmine-reporters');
const fs = require('fs');
const path = require('path');

const testResultsDir = './test-results';
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

jasmine.getEnv().addReporter(new JUnitXmlReporter({
    savePath: testResultsDir,
    consolidateAll: true
}));