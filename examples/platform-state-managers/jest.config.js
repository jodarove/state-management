const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver'],
    transformIgnorePatterns: [
        jestConfig.transformIgnorePatterns?.[0]?.replace(
            /(.*@salesforce\/sfdx-lwc-jest\/src\/lightning-stubs)/,
            '$1|.*@lwc/state'
        ) || '/node_modules/(?!(.*@salesforce/sfdx-lwc-jest/src/lightning-stubs|.*@lwc/state)/)'
    ],
    // Merge our setup file with any existing setup files from the parent config
    setupFilesAfterEnv: [
        ...(jestConfig.setupFilesAfterEnv || []),
        '<rootDir>/jest.setup.js'
    ]
};
