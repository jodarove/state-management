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
    // Map lightning/stateManagerRecord to our manual mock
    // Map sm-test-utils to our test utilities
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '^lightning/stateManagerRecord$': '<rootDir>/force-app/test/jest-mocks/lightning/stateManagerRecord',
        '^lightning/stateManagerLayout$': '<rootDir>/force-app/test/jest-mocks/lightning/stateManagerLayout',
        '^sm-test-utils$': '<rootDir>/force-app/test/jest-mocks/sm-test-utils'
    },
    // Merge our setup file with any existing setup files from the parent config
    setupFilesAfterEnv: [
        ...(jestConfig.setupFilesAfterEnv || []),
        '<rootDir>/jest.setup.js'
    ]
};
