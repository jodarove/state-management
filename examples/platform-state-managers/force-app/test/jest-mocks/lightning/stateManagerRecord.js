/**
 * Manual mock for lightning/stateManagerRecord
 * This mock is available globally for all Jest tests
 */
import { smStubWith } from 'sm-test-utils';

const testSM = smStubWith(['status', 'data', 'error']);

const mockStateManagerRecord = jest.fn(() => testSM());

export default mockStateManagerRecord;
export { testSM };

