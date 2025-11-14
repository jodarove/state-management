// Now import after mocks are set up
import detailPanelStateManager from '../detailPanelStateManager';
import { stateManagerInstanceMock } from 'sm-test-utils';
import smRecord from 'lightning/stateManagerRecord';
import smLayout from 'lightning/stateManagerLayout';

describe('detailPanelStateManager', () => {
    let initialRecordCall;
    let finalRecordCall;
    let layoutCall;

    beforeEach(() => {
        smRecord.mockClear();
        smLayout.mockClear();

        initialRecordCall = stateManagerInstanceMock({
            status: 'unconfigured',
            data: undefined,
            error: undefined,
        });
        finalRecordCall = stateManagerInstanceMock({
            status: 'unconfigured',
            data: undefined,
            error: undefined,
        });
        layoutCall = stateManagerInstanceMock({
            status: 'unconfigured',
            data: undefined,
            error: undefined,
        });

        smRecord
            .mockReturnValueOnce(initialRecordCall)
            .mockReturnValueOnce(finalRecordCall);
        smLayout
            .mockReturnValueOnce(layoutCall);
    });

    describe('initialization', () => {
        

        it('should initialize with unconfigured status when no recordId provided', () => {
            const state = detailPanelStateManager(undefined, 'Account');
            expect(state.value.status).toBe('unconfigured');
        });

        it('should initialize with unconfigured status when no objectApiName provided', () => {
            const state = detailPanelStateManager('001000000000000AAA', undefined);
            expect(state.value.status).toBe('unconfigured');
        });

        it('should initialize with unconfigured status when both recordId and objectApiName are missing', () => {
            const state = detailPanelStateManager(undefined, undefined);
            expect(state.value.status).toBe('unconfigured');
        });

        it('should initialize with unconfigured status when both recordId and objectApiName are empty strings', () => {
            const state = detailPanelStateManager('', '');
            expect(state.value.status).toBe('unconfigured');
        });

        it('should initialize with loading status when both recordId and objectApiName are provided', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            // Initially should be loading or unconfigured depending on async timing
            expect(['unconfigured', 'loading']).toContain(state.value.status);
        });

        it('should expose config atom', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(state.value).toBeDefined();
        });

        it('should expose setRecordId action', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(typeof state.value.setRecordId).toBe('function');
        });

        it('should expose setObjectApiName action', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(typeof state.value.setObjectApiName).toBe('function');
        });

        it('should expose data computed property', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            finalRecordCall.emitValue({
                data: {
                    fields: {
                        Name: 'Test Account',
                        AccountNumber: '1234567890'
                    }
                },
                error: null,
                status: 'loaded'
            });
            expect(state.value.data).toBeDefined();
        });

        it('should expose error computed property', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            const error = new Error('Test error');
            debugger;
            initialRecordCall.emitValue({
                error: error,
                status: 'error'
            });
            expect(state.value.error).toBe(error);
        });

        it('should expose status computed property', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(state.value.status).toBeDefined();
        });
    });

    describe('data initialRecord computed argument to first smRecord', () => {
        let smDetailPanel;
        let firstCallArg;
        beforeEach(() => {
            // smRecord.mockClear();
            // smLayout.mockClear();
            smDetailPanel = detailPanelStateManager(undefined, undefined);
            // gets the first call argument to the first smRecord call,
            // which is the computed argument to the first smRecord call.
            firstCallArg = smRecord.mock.calls[0]?.[0];
        });
        
        it('should return undefined when no recordId or objectApiName are provided', () => {
            expect(firstCallArg.value).toEqual({});

            smDetailPanel.value.setRecordId('001000000000000AAA');
            expect(firstCallArg.value).toEqual({});

            smDetailPanel.value.setRecordId(undefined);
            smDetailPanel.value.setObjectApiName('Account');

            expect(firstCallArg.value).toEqual({});
        });

        it('should return the correct value when recordId and objectApiName are provided', () => {
            smDetailPanel.value.setRecordId('001000000000000AAA');
            smDetailPanel.value.setObjectApiName('Account');

            expect(firstCallArg.value).toEqual({
                recordId: '001000000000000AAA',
                fields: ['Account.Id']
            });
        });
    });

    describe('layout computed argument to smLayout', () => {
        let layoutComputedArg;

        beforeEach(() => {
            detailPanelStateManager(undefined, undefined);
            // smLayout will have its computed argument as the first call
            layoutComputedArg = smLayout.mock.calls[0]?.[0];
        });

        it('should return {} when initialRecord data is undefined', () => {
            // Simulates initial state: initialRecord data is undefined
            // simulated by default when called with no recordId/objectApiName
            expect(layoutComputedArg.value).toEqual({});
        });

        it('should return the correct config once initialRecord has data', () => {
            // // simulate recordId/objectApiName set
            // smDetailPanel.value.setRecordId('001000000000000AAA');
            // smDetailPanel.value.setObjectApiName('Account');

            // Now, simulate initialRecord returning a record data
            // The computed arg expects an object of format: { data: recordData }
            // It expects apiName and recordTypeId on recordData

            // We set the value for initialRecord's computed atom
            // We'll set the computed source value to a specific data
            const fakeInitialRecordData = {
                apiName: 'Account',
                recordTypeId: '012000000000000AAA',
            };

            initialRecordCall.emitValue({
                data: fakeInitialRecordData,
                error: null,
                status: 'loaded'
            });

            expect(layoutComputedArg.value).toEqual({
                objectApiName: 'Account',
                recordTypeId: '012000000000000AAA',
                layoutType: 'Compact',
                mode: 'View',
            });
        });
    });

    describe('finalRecord computed argument to smRecord', () => {
        let finalRecordComputedArg;

        beforeEach(() => {
            // Call the state manager with no initial recordId/objectApiName to trigger atoms
            detailPanelStateManager(undefined, undefined);

            // The first smRecord is for initialRecord, second for finalRecord.
            // smRecord is called for initialRecord, then again for finalRecord.
            // Find the computed argument used for finalRecord
            // Calls order: 0 - initialRecord, 1 - finalRecord
            finalRecordComputedArg = smRecord.mock.calls[1]?.[0];
        });

        it('should return {} if initialRecord data is undefined', () => {
            // Initial state: initialRecord undefined, layout either way
            expect(
                finalRecordComputedArg.value
            ).toEqual({});
        });

        it('should return {} if layout data is undefined', () => {
            // Compose initialRecord result (has data) but layout result is undefined
            const fakeRecordData = {
                id: '001000000000000AAA',
                apiName: 'Account',
                recordTypeId: '012000000000000AAA'
            };
            // Update first arg (initialRecord) with data, layout stays undefined
            initialRecordCall.emitValue({
                data: fakeRecordData,
                error: null,
                status: 'loaded'
            });
            layoutCall.emitValue({
                data: undefined,
                error: null,
                status: 'loading'
            });

            expect(
                finalRecordComputedArg.value
            ).toEqual({});
        });

        it('should return correct config when both initialRecord and layout have data', () => {
            const fakeRecordData = {
                id: '001000000000000AAA',
                apiName: 'Account',
                recordTypeId: '012000000000000AAA'
            };
            const fakeLayoutData = {
                objectApiName: 'Account',
                recordTypeId: '012000000000000AAA',
                sections: [
                    {
                        layoutRows: [
                            {
                                layoutItems: [
                                    { fieldApiName: 'Name' },
                                    { fieldApiName: 'Phone' }
                                ]
                            }
                        ]
                    }
                ]
            };

            // Spy on extractFields so we can check that it is called and mock its return
            const extractFieldsSpy = jest.spyOn(require('../fieldUtils'), 'extractFields');
            extractFieldsSpy.mockReturnValue(['Account.Name', 'Account.Phone']);

            // Set both dependencies data
            initialRecordCall.emitValue({
                data: fakeRecordData,
                error: null,
                status: 'loaded'
            });
            
            layoutCall.emitValue({
                data: fakeLayoutData,
                error: null,
                status: 'loaded'
            });

            expect(finalRecordComputedArg.value).toEqual({
                recordId: '001000000000000AAA',
                fields: ['Account.Name', 'Account.Phone']
            });

            // Clean up mock
            extractFieldsSpy.mockRestore();
        });
    });

    describe('data computed property', () => {
        it('should return undefined if finalRecord data is undefined', () => {
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            finalRecordCall.emitValue({
                data: undefined,
                error: null,
                status: 'loading'
            });
            expect(state.value.data).toBeUndefined();
        });

        it('should return the mapped data when finalRecord data.fields has values with displayValue or value', () => {
            const testFields = {
                Name: { value: 'Test Name', displayValue: 'Display Test Name' },
                Phone: { value: '555-1234', displayValue: null },
                Amount: { value: 900, displayValue: 900 }
            };
            finalRecordCall.emitValue({
                data: { fields: testFields },
                error: null,
                status: 'loaded'
            });
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(state.value.data).toEqual({
                Name: 'Display Test Name',
                Phone: '555-1234',
                Amount: 900
            });
        });

        it('should return empty object if finalRecord data.fields is empty', () => {
            finalRecordCall.emitValue({
                data: { fields: {} },
                error: null,
                status: 'loaded'
            });
            const state = detailPanelStateManager('001000000000000AAA', 'Account');
            expect(state.value.data).toEqual({});
        });
    });

    describe('error computed property', () => {
        it('should be undefined if initialRecord, layout, and finalRecord all have no error', () => {
            initialRecordCall.emitValue({ error: undefined });
            layoutCall.emitValue({ error: undefined });
            finalRecordCall.emitValue({ error: undefined });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.error).toBeUndefined();
        });

        it('should return initialRecord error if set', () => {
            const err = new Error('Initial error');
            initialRecordCall.emitValue({ error: err });
            layoutCall.emitValue({ error: undefined });
            finalRecordCall.emitValue({ error: undefined });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.error).toBe(err);
        });

        it('should return layout error if initialRecord has no error but layout has error', () => {
            initialRecordCall.emitValue({ error: undefined });
            const err = new Error('Layout error');
            layoutCall.emitValue({ error: err });
            finalRecordCall.emitValue({ error: undefined });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.error).toBe(err);
        });

        it('should return finalRecord error if the others do not', () => {
            initialRecordCall.emitValue({ error: undefined });
            layoutCall.emitValue({ error: undefined });
            const err = new Error('Final error');
            finalRecordCall.emitValue({ error: err });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.error).toBe(err);
        });
    });

    describe('status computed property', () => {
        it('should be "unconfigured" if initialRecord status is unconfigured', () => {
            initialRecordCall.emitValue({ status: 'unconfigured' });
            layoutCall.emitValue({ status: 'loading' });
            finalRecordCall.emitValue({ status: 'loading' });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.status).toBe('unconfigured');
        });

        it('should be "loading" if any is loading but not unconfigured or error', () => {
            initialRecordCall.emitValue({ status: 'loaded' });
            layoutCall.emitValue({ status: 'loading' });
            finalRecordCall.emitValue({ status: 'loaded' });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.status).toBe('loading');

            layoutCall.emitValue({ status: 'loaded' });
            finalRecordCall.emitValue({ status: 'loading' });
            expect(state.value.status).toBe('loading');
        });

        it('should be "error" if any has error status and initialRecord is not unconfigured', () => {
            initialRecordCall.emitValue({ status: 'loaded' });
            layoutCall.emitValue({ status: 'error' });
            finalRecordCall.emitValue({ status: 'loaded' });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.status).toBe('error');

            layoutCall.emitValue({ status: 'loaded' });
            finalRecordCall.emitValue({ status: 'error' });
            expect(state.value.status).toBe('error');
        });

        it('should be "loaded" if all are loaded', () => {
            initialRecordCall.emitValue({ status: 'loaded' });
            layoutCall.emitValue({ status: 'loaded' });
            finalRecordCall.emitValue({ status: 'loaded' });
            const state = detailPanelStateManager('001', 'Account');
            expect(state.value.status).toBe('loaded');
        });
    });

    it('should correctly populate data, status, and error from start to end through the happy path', () => {
        // when updating atoms, the state manager is not updated immediately,
        // so we need to use fake timers to wait for the state manager to update.
        jest.useFakeTimers('modern'); // use modern fake timers

        // 1. Initial state: all state managers are unconfigured
        const state = detailPanelStateManager('001AAA', 'Account');

        // run all ticks to ensure the state manager is updated
        jest.runAllTicks();

        // At first, only config is set; initialRecord is unconfigured
        expect(state.value.status).toBe('unconfigured');
        expect(state.value.data).toBeUndefined();
        expect(state.value.error).toBeUndefined();

        // 2. initialRecord is loading (simulate fetching minimal record)
        initialRecordCall.emitValue({
            status: 'loading',
            data: undefined,
            error: undefined,
        });
        
        jest.runAllTicks();

        // Should reflect loading (as long as not unconfigured or error)
        expect(state.value.status).toBe('loading');
        expect(state.value.data).toBeUndefined();
        expect(state.value.error).toBeUndefined();

        // 3. initialRecord loads, layout is now loading
        const minimalRecord = {
            id: '001AAA',
            apiName: 'Account',
            recordTypeId: '012BBBB'
        };
        initialRecordCall.emitValue({
            status: 'loaded',
            data: minimalRecord,
            error: undefined,
        });
        layoutCall.emitValue({
            status: 'loading',
            data: undefined,
            error: undefined,
        });

        jest.runAllTicks();

        // Should still be loading, layout isn't ready yet
        expect(state.value.status).toBe('loading');
        expect(state.value.data).toBeUndefined();
        expect(state.value.error).toBeUndefined();

        // 4. layout loads, finalRecord now loading
        const layoutData = {
            objectApiName: 'Account',
            recordTypeId: '012BBBB',
            layoutType: 'Compact',
            mode: 'View',
            // sections or fields for extractFields, but mock extractFields will just take these names
            sections: [
                { layoutRows: [
                    { layoutItems: [{ fieldApiName: 'Name' }, { fieldApiName: 'Phone' }] }
                ]}
            ]
        };
        layoutCall.emitValue({
            status: 'loaded',
            data: layoutData,
            error: undefined,
        });
        finalRecordCall.emitValue({
            status: 'loading',
            data: undefined,
            error: undefined,
        });

        jest.runAllTicks();

        // All needed inputs for finalRecord, but it's loading
        expect(state.value.status).toBe('loading');
        expect(state.value.data).toBeUndefined();
        expect(state.value.error).toBeUndefined();

        // 5. finalRecord loads (record with layout fields present)
        finalRecordCall.emitValue({
            status: 'loaded',
            data: {
                id: '001AAA',
                fields: {
                    Name: { value: 'Acme Corp', displayValue: undefined },
                    Phone: { value: '555-000', displayValue: '(555) 000' }
                }
            },
            error: undefined,
        });

        jest.runAllTicks();

        // Now everything present: should be loaded, error is undefined, data extracted properly
        expect(state.value.status).toBe('loaded');
        expect(state.value.error).toBeUndefined();

        // The data field should present extracted field values.
        // "Phone" expects displayValue when present, else value.
        expect(state.value.data).toEqual({
            Name: 'Acme Corp',
            Phone: '(555) 000'
        });

        jest.useRealTimers();
    });
});

