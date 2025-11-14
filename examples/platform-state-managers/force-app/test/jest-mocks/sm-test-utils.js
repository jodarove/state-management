import { defineState } from '@lwc/state';

export function smStubWith(atoms = [], actions = []) {
    return defineState(({ atom, setAtom }) => {
        return () => {
            const atomObjs = atoms.reduce((acc, prop) => {
                acc[prop] = atom(undefined);
                return acc;
            }, {});
    
            const actionFns = actions.reduce((acc, actionName) => {
                acc[actionName] = jest.fn();
                return acc;
            }, {});
    
            // Special action to bulk update atom values
            const updateAtoms = (newObj = {}) => {
                atoms.forEach((prop) => {
                    if (Object.prototype.hasOwnProperty.call(newObj, prop)) {
                        setAtom(atomObjs[prop], newObj[prop]);
                    } else {
                        setAtom(atomObjs[prop], undefined);
                    }
                });
            };
    
            return {
                ...atomObjs,
                ...actionFns,
                updateAtoms
            };
        }        
    });
}

const simpleStateManager = defineState(({ atom, setAtom }) => {
    const version = atom(0);
    return () => {
        return {
            _v: version,
            triggerNotify: () => {
                setAtom(version, version.value + 1);
            }
        };
    }
});

export function stateManagerInstanceMock(initialValue = {}) {
    let value = initialValue;
    const stubStateManager = simpleStateManager();

    // does not work because the stub is not a trusted signal.
    // Save original descriptor for "value" from the prototype, not the instance.
    const originalValueDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(stubStateManager), 'value');

    // Override the "value" property, preserving all other aspects of the original descriptor
    Object.defineProperty(stubStateManager, 'value', {
        get() {
            return value;
        },
        enumerable: originalValueDescriptor ? originalValueDescriptor.enumerable : true,
        configurable: originalValueDescriptor ? originalValueDescriptor.configurable : true
    });

    // Add emitValue using the overridden .value and triggerNotify logic
    stubStateManager.emitValue = function(newValue) {
        // @todo: loop through new values, and for state managers (don't know atm how to do this),
        // use the .value to mimic computedValue fn.
        value = newValue;
        const origVal = originalValueDescriptor.get.call(stubStateManager);
        origVal.triggerNotify();
    };

    // const stub = {
    //     get value() {
    //         return value;
    //     },
    //     emitValue(newValue) {
    //         // @todo: loop through new values, and for state managers (don't know atm how to do this),
    //         // use the .value to mimic computedValue fn.
    //         value = newValue;

    //         this.prototype.value.triggerNotify();
    //     }
    // };

    // stub.prototype = stubStateManager;
    
    return stubStateManager;
}
