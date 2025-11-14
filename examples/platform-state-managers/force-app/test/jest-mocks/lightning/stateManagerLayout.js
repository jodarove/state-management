/**
 * Manual mock for lightning/stateManagerRecord
 * This mock is available globally for all Jest tests
 */
import { stateManagerInstanceMock } from 'sm-test-utils';

const mockStateManagerLayout = jest.fn(() => stateManagerInstanceMock({
    status: 'unconfigured',
    data: undefined,
    error: undefined,
    // other actions...
}));

export default mockStateManagerLayout;