import { LightningElement } from 'lwc';
import counterStateManager from 'c/counterStateManager';

export default class CounterApp extends LightningElement {
    // Create the counter state manager instance
    // This makes it available to child components via context
    counterState = counterStateManager(0);
}

