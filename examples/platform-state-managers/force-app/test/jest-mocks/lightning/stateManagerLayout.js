/**
 * Manual mock for lightning/stateManagerRecord
 * This mock is available globally for all Jest tests
 */
import { smStubWith } from 'sm-test-utils';

const testSM = smStubWith(['status', 'data', 'error']);
const mockStateManagerLayout = jest.fn(() => testSM());

export default mockStateManagerLayout;
export { testSM };