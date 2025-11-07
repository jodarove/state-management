import { defineState } from '@lwc/state';

export default defineState(({ atom, setAtom }) => {
    return (initialValue = undefined) => {
        const version = atom(0);
        let latestValue = initialValue;

        const emmitValue = (value) => {
            if (typeof value !== 'object') {
                throw new Error('Value must be an object');
            }
            setAtom(version, version.value + 1);
            latestValue = value;
        }

        const target = { version, emmitValue };
        return new Proxy(target, {
            get(_target, prop) {
                if (prop === 'version' || prop === 'emmitValue') {
                    return target[prop];
                }
                return latestValue && Object.prototype.hasOwnProperty.call(latestValue, prop)
                    ? atom(latestValue[prop]) // hack to avoid exception in subscribers
                    : undefined;
            },
            ownKeys() {
                let keys = ['version', 'emmitValue'];
                if (latestValue && typeof latestValue === 'object') {
                    keys = keys.concat(Reflect.ownKeys(latestValue));
                }
                return keys;
            },
            getOwnPropertyDescriptor(_target, prop) {
                if (prop === 'version' || prop === 'emmitValue') {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: target[prop]
                    };
                }
                if (latestValue && Object.prototype.hasOwnProperty.call(latestValue, prop)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        value: latestValue[prop]
                    };
                }
                return undefined;
            }
        });
    }
});

export function buildStubStateManagerWith(atoms = [], actions = []) {
    const smDef = defineState(({ atom, setAtom }) => {
        return (initialValue = {}) => {
            const atomObjs = atoms.map((prop) => {
                atomObjs[prop] = atom(initialValue[prop]);
            });
    
            const actionFns = actions.map((actionName) => {
                actionFns[actionName] = jest.fn();
            });
    
            // Special action to bulk update atom values
            const updateAtoms = (newObj = {}) => {
                atoms.forEach((prop) => {
                    if (Object.prototype.hasOwnProperty.call(newObj, prop)) {
                        setAtom(atomObjs[prop], newObj[prop]);
                    } else {
                        atomObjs[prop].set(undefined);
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

    return jest.fn(() => { return smDef(); });
}

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