import counterStateManager from 'c/counterStateManager';

describe('counterStateManager', () => {
    describe('initialization', () => {
        it('should initialize counter to 0 by default', () => {
            const state = counterStateManager();
            expect(state.value.counter).toBe(0);
        });

        it('should initialize counter with custom initial value', () => {
            const state = counterStateManager(5);
            expect(state.value.counter).toBe(5);
        });

        it('should initialize doubleCounter based on initial counter value', () => {
            const state = counterStateManager(3);
            expect(state.value.doubleCounter).toBe(6);
        });

        it('should initialize doubleCounter to 0 when counter is 0', () => {
            const state = counterStateManager(0);
            expect(state.value.doubleCounter).toBe(0);
        });
    });

    describe('increment operation', () => {
        it('should increment counter by 1', () => {
            const state = counterStateManager();
            state.value.increment();
            expect(state.value.counter).toBe(1);
        });

        it('should update doubleCounter when incrementing', () => {
            const state = counterStateManager();
            state.value.increment();
            expect(state.value.doubleCounter).toBe(2);
        });

        it('should increment counter multiple times', () => {
            const state = counterStateManager();
            state.value.increment();
            state.value.increment();
            state.value.increment();
            expect(state.value.counter).toBe(3);
            expect(state.value.doubleCounter).toBe(6);
        });

        it('should increment from custom initial value', () => {
            const state = counterStateManager(10);
            state.value.increment();
            expect(state.value.counter).toBe(11);
            expect(state.value.doubleCounter).toBe(22);
        });
    });

    describe('decrement operation', () => {
        it('should decrement counter by 1', () => {
            const state = counterStateManager();
            state.value.decrement();
            expect(state.value.counter).toBe(-1);
        });

        it('should update doubleCounter when decrementing', () => {
            const state = counterStateManager();
            state.value.decrement();
            expect(state.value.doubleCounter).toBe(-2);
        });

        it('should decrement counter multiple times', () => {
            const state = counterStateManager();
            state.value.decrement();
            state.value.decrement();
            state.value.decrement();
            expect(state.value.counter).toBe(-3);
            expect(state.value.doubleCounter).toBe(-6);
        });

        it('should decrement from custom initial value', () => {
            const state = counterStateManager(10);
            state.value.decrement();
            expect(state.value.counter).toBe(9);
            expect(state.value.doubleCounter).toBe(18);
        });
    });

    describe('combined operations', () => {
        it('should handle increment and decrement together', () => {
            const state = counterStateManager();
            state.value.increment();
            state.value.increment();
            state.value.decrement();
            expect(state.value.counter).toBe(1);
            expect(state.value.doubleCounter).toBe(2);
        });

        it('should handle multiple increment and decrement operations', () => {
            const state = counterStateManager(5);
            state.value.increment();
            state.value.increment();
            state.value.decrement();
            state.value.increment();
            state.value.decrement();
            state.value.decrement();
            expect(state.value.counter).toBe(5);
            expect(state.value.doubleCounter).toBe(10);
        });

        it('should maintain correct doubleCounter after multiple operations', () => {
            const state = counterStateManager();
            for (let i = 0; i < 5; i++) {
                state.value.increment();
            }
            for (let i = 0; i < 3; i++) {
                state.value.decrement();
            }
            expect(state.value.counter).toBe(2);
            expect(state.value.doubleCounter).toBe(4);
        });
    });

    describe('computed property reactivity', () => {
        it('should update doubleCounter reactively when counter changes', () => {
            const state = counterStateManager(0);
            expect(state.value.doubleCounter).toBe(0);

            state.value.increment();
            expect(state.value.counter).toBe(1);
            expect(state.value.doubleCounter).toBe(2);

            state.value.increment();
            expect(state.value.counter).toBe(2);
            expect(state.value.doubleCounter).toBe(4);

            state.value.decrement();
            expect(state.value.counter).toBe(1);
            expect(state.value.doubleCounter).toBe(2);
        });

        it('should handle negative counter values correctly', () => {
            const state = counterStateManager(0);
            state.value.decrement();
            state.value.decrement();
            expect(state.value.counter).toBe(-2);
            expect(state.value.doubleCounter).toBe(-4);
        });
    });

    describe('state manager API', () => {
        it('should expose counter atom', () => {
            const state = counterStateManager();
            expect(state.value.counter).toBeDefined();
            expect(typeof state.value.counter).toBe('number');
        });

        it('should expose doubleCounter computed property', () => {
            const state = counterStateManager();
            expect(state.value.doubleCounter).toBeDefined();
            expect(typeof state.value.doubleCounter).toBe('number');
        });

        it('should expose increment function', () => {
            const state = counterStateManager();
            expect(typeof state.value.increment).toBe('function');
        });

        it('should expose decrement function', () => {
            const state = counterStateManager();
            expect(typeof state.value.decrement).toBe('function');
        });
    });
});

