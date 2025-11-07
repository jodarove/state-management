import { createElement } from 'lwc';
import SimulatedDetailPanel from 'c/simulatedDetailPanel';
import detailPanelStateManager from 'c/detailPanelStateManager';
import { smStubWith } from 'sm-test-utils';

// Mock detailPanelStateManager
jest.mock('c/detailPanelStateManager', () => {
    return jest.fn();
});

const detailPanelStateManagerStub = smStubWith(
    ['status', 'data', 'error'],
    ['setRecordId', 'setObjectApiName']
);

// Helper function to get input by label
const getInputByLabel = (element, label) => {
    const inputs = element.shadowRoot.querySelectorAll('lightning-input');
    for (let input of inputs) {
        if (input.label === label) {
            return input;
        }
    }
    return null;
};

// Helper function to get textarea element and optionally its value
const getTextareaDump = (element) => {
    const textarea = element.shadowRoot.querySelector('textarea');
    return textarea ? textarea.value : null;
};

describe('c-simulated-detail-panel', () => {
    let mockStateManager;

    beforeEach(() => {
        mockStateManager = detailPanelStateManagerStub();
        mockStateManager.value.updateAtoms({
            status: 'unconfigured',
            data: undefined,
            error: undefined,
        });

        // Reset the mock to return our mock state manager
        detailPanelStateManager.mockReturnValue(mockStateManager);
    });

    afterEach(() => {
        // Clear mocks after each test
        jest.clearAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('initialization', () => {
        it('should initialize with detailPanelStateManager', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Verify detailPanelStateManager was called
            expect(detailPanelStateManager).toHaveBeenCalled();
        });

        it('should initialize state manager with no arguments', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Verify detailPanelStateManager was called (with no arguments)
            expect(detailPanelStateManager).toHaveBeenCalled();
            expect(detailPanelStateManager.mock.calls[0].length).toBe(0);
        });
    });

    describe('stateDump getter', () => {
        it('should return JSON stringified state', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const textarea = element.shadowRoot.querySelector('textarea');
                expect(textarea).not.toBeNull();
                
                const expectedDump = JSON.stringify(mockStateManager.value, null, 2);
                expect(getTextareaDump(element)).toBe(expectedDump);
            });
        });

        it('should update when state changes', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const initialDump = getTextareaDump(element);
                    expect(initialDump).toBeTruthy();

                    // Update state by modifying the mock state manager value
                    // Note: In a real scenario, the state manager would update reactively
                    // For testing, we need to update the mock and trigger a re-render
                    mockStateManager.value.updateAtoms({
                        status: 'loaded',
                        data: { Name: 'Test Account' }
                    });

                    // Force re-render by accessing the getter
                    // In LWC, reactive updates happen automatically, but in tests we need to wait
                    return Promise.resolve();
                })
                .then(() => {
                    // We should really check that the textarea is updated when the state changes.
                    // This will only pass if the LWC actually updates reactively, which it may not with a plain object mock.
                    // If the LWC does not re-render for in-place mutation of the .value object,
                    // A real test would require the state manager to be reactive or return a proxy/observable.
                    const updatedDump = getTextareaDump(element);
                    // This assertion will fail unless the component is actually reactive to the state update above:
                    expect(updatedDump).toBe(JSON.stringify(mockStateManager.value, null, 2));
                });
        });

        it('should handle state with all properties', () => {
            mockStateManager.value.updateAtoms({
                status: 'loaded',
                data: {
                    Name: 'Acme Corp',
                    Phone: '(555) 000'
                },
                error: undefined,
                setRecordId: jest.fn(),
                setObjectApiName: jest.fn(),
            });

            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const expectedDump = JSON.stringify(mockStateManager.value, null, 2);
                expect(getTextareaDump(element)).toBe(expectedDump);
            });
        });

        it('should handle state with error', () => {
            const testError = new Error('Test error');
            mockStateManager.value.updateAtoms({
                status: 'error',
                data: undefined,
                error: testError,
                setRecordId: jest.fn(),
                setObjectApiName: jest.fn(),
            });

            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const dump = getTextareaDump(element);
                expect(dump).toContain('"status": "error"');
                expect(dump).toContain('"error"');
            });
        });
    });

    describe('setConfig method', () => {
        it('should call setRecordId and setObjectApiName with input values', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve()
                .then(() => {
                    // Query inputs from shadow DOM using helper function
                    const objectApiNameInput = getInputByLabel(element, 'Object API name');
                    const recordIdInput = getInputByLabel(element, 'Record ID');
                    const setButton = element.shadowRoot.querySelector('lightning-button');

                    expect(objectApiNameInput).not.toBeNull();
                    expect(recordIdInput).not.toBeNull();
                    expect(setButton).not.toBeNull();

                    // Set up refs on element instance (simulating how LWC provides refs)
                    element.refs = {
                        objectApiName: objectApiNameInput,
                        recordId: recordIdInput
                    };

                    // Set values on inputs
                    objectApiNameInput.value = 'Account';
                    recordIdInput.value = '001000000000000AAA';

                    // Trigger setConfig via button click (how it's actually used)
                    setButton.click();

                    // Verify state manager methods were called with correct values
                    expect(mockStateManager.value.setObjectApiName).toHaveBeenCalledWith('Account');
                    expect(mockStateManager.value.setRecordId).toHaveBeenCalledWith('001000000000000AAA');
                });
        });

        it('should handle empty input values', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve()
                .then(() => {
                    const objectApiNameInput = getInputByLabel(element, 'Object API name');
                    const recordIdInput = getInputByLabel(element, 'Record ID');
                    const setButton = element.shadowRoot.querySelector('lightning-button');

                    // Set up refs
                    element.refs = {
                        objectApiName: objectApiNameInput,
                        recordId: recordIdInput
                    };

                    // Set empty values
                    objectApiNameInput.value = '';
                    recordIdInput.value = '';

                    // Trigger setConfig via button click
                    setButton.click();

                    // Verify state manager methods were called with empty strings
                    expect(mockStateManager.value.setObjectApiName).toHaveBeenCalledWith('');
                    expect(mockStateManager.value.setRecordId).toHaveBeenCalledWith('');
                });
        });

        it('should handle undefined input values', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve()
                .then(() => {
                    const objectApiNameInput = getInputByLabel(element, 'Object API name');
                    const recordIdInput = getInputByLabel(element, 'Record ID');
                    const setButton = element.shadowRoot.querySelector('lightning-button');

                    // Set up refs
                    element.refs = {
                        objectApiName: objectApiNameInput,
                        recordId: recordIdInput
                    };

                    // Set undefined values (simulating no value set)
                    objectApiNameInput.value = undefined;
                    recordIdInput.value = undefined;

                    // Trigger setConfig via button click
                    setButton.click();

                    // Verify state manager methods were called with undefined
                    expect(mockStateManager.value.setObjectApiName).toHaveBeenCalledWith(undefined);
                    expect(mockStateManager.value.setRecordId).toHaveBeenCalledWith(undefined);
                });
        });

        it('should update state when setConfig is called via button click', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve()
                .then(() => {
                    const objectApiNameInput = getInputByLabel(element, 'Object API name');
                    const recordIdInput = getInputByLabel(element, 'Record ID');
                    const setButton = element.shadowRoot.querySelector('lightning-button');

                    expect(setButton).not.toBeNull();
                    expect(objectApiNameInput).not.toBeNull();
                    expect(recordIdInput).not.toBeNull();

                    // Set up refs
                    element.refs = {
                        objectApiName: objectApiNameInput,
                        recordId: recordIdInput
                    };

                    // Set values
                    objectApiNameInput.value = 'Contact';
                    recordIdInput.value = '003000000000000AAA';

                    // Click button to trigger setConfig
                    setButton.click();

                    // Verify state manager methods were called
                    expect(mockStateManager.value.setObjectApiName).toHaveBeenCalledWith('Contact');
                    expect(mockStateManager.value.setRecordId).toHaveBeenCalledWith('003000000000000AAA');
                });
        });
    });

    describe('DOM structure', () => {
        it('should render all required elements', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const card = element.shadowRoot.querySelector('lightning-card');
                const objectApiNameInput = getInputByLabel(element, 'Object API name');
                const recordIdInput = getInputByLabel(element, 'Record ID');
                const setButton = element.shadowRoot.querySelector('lightning-button');
                const textarea = element.shadowRoot.querySelector('textarea');

                expect(card).not.toBeNull();
                expect(objectApiNameInput).not.toBeNull();
                expect(recordIdInput).not.toBeNull();
                expect(setButton).not.toBeNull();
                expect(textarea).not.toBeNull();
            });
        });

        it('should have correct input labels', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const objectApiNameInput = getInputByLabel(element, 'Object API name');
                const recordIdInput = getInputByLabel(element, 'Record ID');

                expect(objectApiNameInput).not.toBeNull();
                expect(recordIdInput).not.toBeNull();
                expect(objectApiNameInput.label).toBe('Object API name');
                expect(recordIdInput.label).toBe('Record ID');
            });
        });

        it('should have correct button label', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                const setButton = element.shadowRoot.querySelector('lightning-button');
                expect(setButton.label).toBe('Set');
            });
        });
    });

    describe('integration with state manager', () => {
        it('should reflect state manager changes in stateDump', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const initialDump = getTextareaDump(element);
                    expect(initialDump).toBeTruthy();

                    // Simulate state manager update
                    mockStateManager.value.updateAtoms({
                        status: 'loading',
                        data: { Name: 'Test' }
                    });

                    // Force re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify textarea reflects state change
                    const updatedDump = getTextareaDump(element);
                    expect(updatedDump).toContain('"status": "loading"');
                    expect(updatedDump).toContain('"Name": "Test"');
                    
                    // Note: In LWC tests, reactive updates may require additional setup
                    // We verify the state manager state is correct
                });
        });

        it('should handle complete workflow: set config and see state update', () => {
            const element = createElement('c-simulated-detail-panel', {
                is: SimulatedDetailPanel
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const objectApiNameInput = getInputByLabel(element, 'Object API name');
                    const recordIdInput = getInputByLabel(element, 'Record ID');
                    const setButton = element.shadowRoot.querySelector('lightning-button');

                    // Set up refs
                    element.refs = {
                        objectApiName: objectApiNameInput,
                        recordId: recordIdInput
                    };

                    // Set values
                    objectApiNameInput.value = 'Account';
                    recordIdInput.value = '001000000000000AAA';

                    // Click button
                    setButton.click();

                    // Verify methods were called
                    expect(mockStateManager.value.setObjectApiName).toHaveBeenCalledWith('Account');
                    expect(mockStateManager.value.setRecordId).toHaveBeenCalledWith('001000000000000AAA');

                    // Simulate state manager responding to the config change
                    mockStateManager.value.updateAtoms({
                        status: 'loading',
                    });

                    // Wait for DOM to update after state manager's updateAtoms
                    return Promise.resolve();
                }).then(() => {
                    mockStateManager.value.updateAtoms({
                        status: 'loaded',
                        data: { Name: 'Test' },
                    });

                    // Wait for DOM to update after state manager's updateAtoms
                    return Promise.resolve();
                }).then(() => {
                    const updatedDump = getTextareaDump(element);
                    expect(updatedDump).toBe(JSON.stringify(mockStateManager.value, null, 2));
                });
        });
    });
});

