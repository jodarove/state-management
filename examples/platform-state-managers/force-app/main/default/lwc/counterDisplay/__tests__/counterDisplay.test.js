import { createElement } from 'lwc';
import CounterDisplay from 'c/counterDisplay';
import counterStateManager from 'c/counterStateManager';
import { fromContext } from '@lwc/state';

// Mock only fromContext, but keep the real defineState so counterStateManager can work
jest.mock('@lwc/state', () => {
    const actual = jest.requireActual('@lwc/state');
    return {
        ...actual,
        fromContext: jest.fn()
    };
});

// Helper function to get counter value from DOM
const getCounterFromDOM = (element) => {
    // Counter is in the first .slds-text-heading_large element
    const counterElement = element.shadowRoot.querySelector('.slds-text-heading_large');
    return counterElement ? parseInt(counterElement.textContent.trim(), 10) : null;
};

// Helper function to get doubleCounter value from DOM
const getDoubleCounterFromDOM = (element) => {
    // DoubleCounter is in a .slds-text-heading_medium that comes after "Counter Value" text
    // Find the div containing "Counter Value" text, then find the next .slds-text-heading_medium
    const allMediumHeadings = element.shadowRoot.querySelectorAll('.slds-text-heading_medium');
    // The second .slds-text-heading_medium is the doubleCounter (first is the title)
    // We can find it by looking for the one that's a number
    for (let heading of allMediumHeadings) {
        const text = heading.textContent.trim();
        // Check if it's a number (not the title "Counter State Manager")
        if (!isNaN(parseInt(text, 10))) {
            return parseInt(text, 10);
        }
    }
    return null;
};

// Helper function to get increment button
const getIncrementButton = (element) => {
    // Increment button has variant="brand"
    const buttons = element.shadowRoot.querySelectorAll('lightning-button');
    for (let button of buttons) {
        if (button.variant === 'brand') {
            return button;
        }
    }
    return null;
};

// Helper function to get decrement button
const getDecrementButton = (element) => {
    // Decrement button has variant="neutral"
    const buttons = element.shadowRoot.querySelectorAll('lightning-button');
    for (let button of buttons) {
        if (button.variant === 'neutral') {
            return button;
        }
    }
    return null;
};

describe('c-counter-display', () => {
    afterEach(() => {
        // Clear mocks after each test
        jest.clearAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('initialization', () => {
        it('should initialize with counter state from context', () => {
            // Create a mock state manager instance
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            // Create element
            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Verify fromContext was called with counterStateManager
            expect(fromContext).toHaveBeenCalledWith(counterStateManager);
        });

        it('should handle missing state manager gracefully', () => {
            // Mock fromContext to return null/undefined
            fromContext.mockReturnValue(null);

            // Create element
            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                // Verify default values are displayed in DOM
                expect(getCounterFromDOM(element)).toBe(0);
                expect(getDoubleCounterFromDOM(element)).toBe(0);
            });
        });
    });

    describe('counter display', () => {
        it('should display counter value from state manager', () => {
            const mockState = counterStateManager(5);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                expect(getCounterFromDOM(element)).toBe(5);
            });
        });

        it('should display 0 when counter state is not available', () => {
            fromContext.mockReturnValue(null);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                expect(getCounterFromDOM(element)).toBe(0);
            });
        });

        it('should display 0 when state manager value is not available', () => {
            fromContext.mockReturnValue({ value: null });

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                expect(getCounterFromDOM(element)).toBe(0);
            });
        });
    });

    describe('doubleCounter display', () => {
        it('should display doubleCounter computed value from state manager', () => {
            const mockState = counterStateManager(3);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                expect(getDoubleCounterFromDOM(element)).toBe(6);
            });
        });

        it('should display 0 when doubleCounter state is not available', () => {
            fromContext.mockReturnValue(null);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for DOM to update
            return Promise.resolve().then(() => {
                expect(getDoubleCounterFromDOM(element)).toBe(0);
            });
        });

        it('should update doubleCounter when counter changes', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    expect(getDoubleCounterFromDOM(element)).toBe(0);

                    // Increment counter via button click
                    const incrementButton = getIncrementButton(element);
                    expect(incrementButton).not.toBeNull();
                    incrementButton.click();

                    // Verify state manager was updated
                    expect(mockState.value.counter).toBe(1);
                    expect(mockState.value.doubleCounter).toBe(2);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getDoubleCounterFromDOM(element)).toBe(2);
                });
        });
    });

    describe('handleIncrement', () => {
        it('should call increment on state manager', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    // Verify initial state in DOM
                    expect(getCounterFromDOM(element)).toBe(0);

                    // Click increment button
                    const incrementButton = getIncrementButton(element);
                    expect(incrementButton).not.toBeNull();
                    incrementButton.click();

                    // Verify state manager was updated
                    expect(mockState.value.counter).toBe(1);
                    expect(mockState.value.doubleCounter).toBe(2);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(1);
                    expect(getDoubleCounterFromDOM(element)).toBe(2);
                });
        });

        it('should increment multiple times', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const incrementButton = getIncrementButton(element);
                    expect(incrementButton).not.toBeNull();
                    incrementButton.click();
                    incrementButton.click();
                    incrementButton.click();

                    expect(mockState.value.counter).toBe(3);
                    expect(mockState.value.doubleCounter).toBe(6);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(3);
                    expect(getDoubleCounterFromDOM(element)).toBe(6);
                });
        });

        it('should handle increment when state manager is not available', () => {
            fromContext.mockReturnValue(null);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for render
            return Promise.resolve().then(() => {
                // Should not throw an error when clicking button
                const incrementButton = getIncrementButton(element);
                if (incrementButton) {
                    expect(() => incrementButton.click()).not.toThrow();
                }
            });
        });

        it('should handle increment when state manager value is not available', () => {
            fromContext.mockReturnValue({ value: null });

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for render
            return Promise.resolve().then(() => {
                // Should not throw an error when clicking button
                const incrementButton = getIncrementButton(element);
                if (incrementButton) {
                    expect(() => incrementButton.click()).not.toThrow();
                }
            });
        });
    });

    describe('handleDecrement', () => {
        it('should call decrement on state manager', () => {
            const mockState = counterStateManager(5);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    // Verify initial state in DOM
                    expect(getCounterFromDOM(element)).toBe(5);

                    // Click decrement button
                    const decrementButton = getDecrementButton(element);
                    expect(decrementButton).not.toBeNull();
                    decrementButton.click();

                    // Verify state manager was updated
                    expect(mockState.value.counter).toBe(4);
                    expect(mockState.value.doubleCounter).toBe(8);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(4);
                    expect(getDoubleCounterFromDOM(element)).toBe(8);
                });
        });

        it('should decrement multiple times', () => {
            debugger;
            const mockState = counterStateManager(5);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const decrementButton = getDecrementButton(element);
                    expect(decrementButton).not.toBeNull();
                    decrementButton.click();
                    decrementButton.click();
                    decrementButton.click();

                    expect(mockState.value.counter).toBe(2);
                    expect(mockState.value.doubleCounter).toBe(4);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(2);
                    expect(getDoubleCounterFromDOM(element)).toBe(4);
                });
        });

        it('should handle negative counter values', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const decrementButton = getDecrementButton(element);
                    expect(decrementButton).not.toBeNull();
                    decrementButton.click();
                    decrementButton.click();

                    expect(mockState.value.counter).toBe(-2);
                    expect(mockState.value.doubleCounter).toBe(-4);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(-2);
                    expect(getDoubleCounterFromDOM(element)).toBe(-4);
                });
        });

        it('should handle decrement when state manager is not available', () => {
            fromContext.mockReturnValue(null);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for render
            return Promise.resolve().then(() => {
                // Should not throw an error when clicking button
                const decrementButton = getDecrementButton(element);
                if (decrementButton) {
                    expect(() => decrementButton.click()).not.toThrow();
                }
            });
        });

        it('should handle decrement when state manager value is not available', () => {
            fromContext.mockReturnValue({ value: null });

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for render
            return Promise.resolve().then(() => {
                // Should not throw an error when clicking button
                const decrementButton = getDecrementButton(element);
                if (decrementButton) {
                    expect(() => decrementButton.click()).not.toThrow();
                }
            });
        });
    });

    describe('combined operations', () => {
        it('should handle increment and decrement together', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const incrementButton = getIncrementButton(element);
                    const decrementButton = getDecrementButton(element);
                    expect(incrementButton).not.toBeNull();
                    expect(decrementButton).not.toBeNull();
                    incrementButton.click();
                    incrementButton.click();
                    decrementButton.click();

                    expect(mockState.value.counter).toBe(1);
                    expect(mockState.value.doubleCounter).toBe(2);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(1);
                    expect(getDoubleCounterFromDOM(element)).toBe(2);
                });
        });

        it('should handle multiple increment and decrement operations', () => {
            const mockState = counterStateManager(5);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    const incrementButton = getIncrementButton(element);
                    const decrementButton = getDecrementButton(element);
                    expect(incrementButton).not.toBeNull();
                    expect(decrementButton).not.toBeNull();
                    incrementButton.click();
                    incrementButton.click();
                    decrementButton.click();
                    incrementButton.click();
                    decrementButton.click();
                    decrementButton.click();

                    expect(mockState.value.counter).toBe(5);
                    expect(mockState.value.doubleCounter).toBe(10);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(5);
                    expect(getDoubleCounterFromDOM(element)).toBe(10);
                });
        });
    });

    describe('reactive updates', () => {
        it('should reflect changes when state is updated externally', () => {
            const mockState = counterStateManager(0);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    expect(getCounterFromDOM(element)).toBe(0);
                    expect(getDoubleCounterFromDOM(element)).toBe(0);

                    // Update state directly (simulating external update)
                    mockState.value.increment();

                    // Force re-render by accessing getters
                    // In LWC, reactive updates happen automatically, but we need to wait for the next tick
                    return Promise.resolve();
                })
                .then(() => {
                    // The DOM should reflect the updated state
                    // Note: In a real LWC environment, reactive updates happen automatically
                    // In tests, we verify the state manager was updated correctly
                    expect(mockState.value.counter).toBe(1);
                    expect(mockState.value.doubleCounter).toBe(2);
                    
                    // In addition to verifying the state manager, also verify the DOM reflects the change
                    expect(getCounterFromDOM(element)).toBe(1);
                    expect(getDoubleCounterFromDOM(element)).toBe(2);
                });
        });

        it('should reflect computed property updates when counter changes', () => {
            const mockState = counterStateManager(3);
            fromContext.mockReturnValue(mockState);

            const element = createElement('c-counter-display', {
                is: CounterDisplay
            });
            document.body.appendChild(element);

            // Wait for initial render
            return Promise.resolve()
                .then(() => {
                    expect(getCounterFromDOM(element)).toBe(3);
                    expect(getDoubleCounterFromDOM(element)).toBe(6);

                    // Decrement counter via button click to trigger component update
                    const decrementButton = getDecrementButton(element);
                    expect(decrementButton).not.toBeNull();
                    decrementButton.click();

                    // Verify state manager was updated
                    expect(mockState.value.counter).toBe(2);
                    expect(mockState.value.doubleCounter).toBe(4);

                    // Wait for LWC to process reactive updates and re-render
                    return Promise.resolve();
                })
                .then(() => {
                    // Verify DOM reflects the update
                    expect(getCounterFromDOM(element)).toBe(2);
                    expect(getDoubleCounterFromDOM(element)).toBe(4);
                });
        });
    });
});

