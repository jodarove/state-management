import { defineState } from '@lwc/state';

// Define the state manager
export default defineState(({ atom, computed, setAtom }) => {
    // Return a function that creates a new state manager instance
    return (initialValue = 0) => {
        // Initialize the counter atom with a default value of 0
        const counter = atom(initialValue);

        // Computed property that exposes the double of the counter
        const doubleCounter = computed([ counter ], (count) => count * 2);

        // Increment operation: increases counter by 1
        const increment = () => {
            setAtom(counter, counter.value + 1);
        };

        // Decrement operation: decreases counter by 1 and increments operation count
        const decrement = () => {
            setAtom(counter, counter.value - 1);
        };

        // This is the external shape that consumers of this state manager will see
        return {
            // data properties
            counter,
            doubleCounter,

            // actions
            increment,
            decrement,
        };
    };
});

