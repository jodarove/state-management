import { LightningElement } from 'lwc';
import { fromContext } from '@lwc/state';
import counterStateManager from 'c/counterStateManager';

export default class CounterDisplay extends LightningElement {
    // Use fromContext to find the counter state manager from the parent component's context
    counterState = fromContext(counterStateManager);

    // Getter for the counter value
    get counter() {
        return this.counterState?.value?.counter ?? 0;
    }

    // Getter for the double counter value (computed property)
    get doubleCounter() {
        return this.counterState?.value?.doubleCounter ?? 0;
    }

    // Handler for increment button
    handleIncrement() {
        if (this.counterState?.value) {
            this.counterState.value.increment();
        }
    }

    // Handler for decrement button
    handleDecrement() {
        if (this.counterState?.value) {
            this.counterState.value.decrement();
        }
    }
}

