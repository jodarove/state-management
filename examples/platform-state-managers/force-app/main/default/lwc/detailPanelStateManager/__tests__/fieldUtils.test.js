import { extractFields } from '../fieldUtils';

describe('extractFields', () => {
    describe('null and undefined handling', () => {
        it('should return undefined when layout is null', () => {
            const result = extractFields(null);
            expect(result).toBeUndefined();
        });

        it('should return undefined when layout is undefined', () => {
            const result = extractFields(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined when layout is falsy', () => {
            const result = extractFields(false);
            expect(result).toBeUndefined();
        });
    });

    describe('empty layout handling', () => {
        it('should throw error when layout has no sections property', () => {
            const layout = {
                objectApiName: 'Account'
            };
            expect(() => extractFields(layout)).toThrow();
        });

        it('should return empty array when sections is empty array', () => {
            const layout = {
                objectApiName: 'Account',
                sections: []
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });

        it('should throw error when section has no layoutRows property', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{}]
            };
            expect(() => extractFields(layout)).toThrow();
        });

        it('should return empty array when layoutRows is empty array', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: []
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });

        it('should throw error when row has no layoutItems property', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{}]
                }]
            };
            expect(() => extractFields(layout)).toThrow();
        });

        it('should return empty array when layoutItems is empty array', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: []
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });

        it('should throw error when item has no layoutComponents property', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{}]
                    }]
                }]
            };
            expect(() => extractFields(layout)).toThrow();
        });

        it('should return empty array when layoutComponents is empty array', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: []
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });
    });

    describe('non-field components', () => {
        it('should return empty array when component is not a Field', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [{
                                componentType: 'Button',
                                apiName: 'SomeButton'
                            }]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });

        it('should ignore non-field components', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [
                                {
                                    componentType: 'Button',
                                    apiName: 'SomeButton'
                                },
                                {
                                    componentType: 'Separator',
                                    apiName: 'SomeSeparator'
                                }
                            ]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual([]);
        });
    });

    describe('single field extraction', () => {
        it('should extract a single field from layout', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [{
                                componentType: 'Field',
                                apiName: 'Name'
                            }]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name']);
        });

        it('should extract field with correct objectApiName prefix', () => {
            const layout = {
                objectApiName: 'Contact',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [{
                                componentType: 'Field',
                                apiName: 'Email'
                            }]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Contact.Email']);
        });
    });

    describe('multiple fields extraction', () => {
        it('should extract multiple fields from same component', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [
                                {
                                    componentType: 'Field',
                                    apiName: 'Name'
                                },
                                {
                                    componentType: 'Field',
                                    apiName: 'Industry'
                                }
                            ]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name', 'Account.Industry']);
        });

        it('should extract fields from multiple items in same row', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [
                            {
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Name'
                                }]
                            },
                            {
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Industry'
                                }]
                            }
                        ]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name', 'Account.Industry']);
        });

        it('should extract fields from multiple rows in same section', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [
                        {
                            layoutItems: [{
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Name'
                                }]
                            }]
                        },
                        {
                            layoutItems: [{
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Industry'
                                }]
                            }]
                        }
                    ]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name', 'Account.Industry']);
        });

        it('should extract fields from multiple sections', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [
                    {
                        layoutRows: [{
                            layoutItems: [{
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Name'
                                }]
                            }]
                        }]
                    },
                    {
                        layoutRows: [{
                            layoutItems: [{
                                layoutComponents: [{
                                    componentType: 'Field',
                                    apiName: 'Industry'
                                }]
                            }]
                        }]
                    }
                ]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name', 'Account.Industry']);
        });
    });

    describe('mixed component types', () => {
        it('should extract only Field components from mixed components', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [
                                {
                                    componentType: 'Button',
                                    apiName: 'SaveButton'
                                },
                                {
                                    componentType: 'Field',
                                    apiName: 'Name'
                                },
                                {
                                    componentType: 'Separator',
                                    apiName: 'Divider'
                                },
                                {
                                    componentType: 'Field',
                                    apiName: 'Industry'
                                }
                            ]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.Name', 'Account.Industry']);
        });
    });

    describe('complex nested structures', () => {
        it('should extract fields from complex nested layout structure', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [
                    {
                        layoutRows: [
                            {
                                layoutItems: [
                                    {
                                        layoutComponents: [
                                            {
                                                componentType: 'Field',
                                                apiName: 'Name'
                                            },
                                            {
                                                componentType: 'Field',
                                                apiName: 'AccountNumber'
                                            }
                                        ]
                                    },
                                    {
                                        layoutComponents: [{
                                            componentType: 'Field',
                                            apiName: 'Industry'
                                        }]
                                    }
                                ]
                            },
                            {
                                layoutItems: [{
                                    layoutComponents: [{
                                        componentType: 'Field',
                                        apiName: 'Phone'
                                    }]
                                }]
                            }
                        ]
                    },
                    {
                        layoutRows: [{
                            layoutItems: [{
                                layoutComponents: [
                                    {
                                        componentType: 'Button',
                                        apiName: 'Action'
                                    },
                                    {
                                        componentType: 'Field',
                                        apiName: 'Website'
                                    }
                                ]
                            }]
                        }]
                    }
                ]
            };
            const result = extractFields(layout);
            expect(result).toEqual([
                'Account.Name',
                'Account.AccountNumber',
                'Account.Industry',
                'Account.Phone',
                'Account.Website'
            ]);
        });
    });

    describe('edge cases', () => {
        it('should handle missing objectApiName gracefully', () => {
            const layout = {
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [{
                                componentType: 'Field',
                                apiName: 'Name'
                            }]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['undefined.Name']);
        });

        it('should handle componentType case sensitivity', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [
                                {
                                    componentType: 'field', // lowercase
                                    apiName: 'Name'
                                },
                                {
                                    componentType: 'Field', // correct case
                                    apiName: 'Industry'
                                }
                            ]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            // Only 'Field' (exact match) should be extracted
            expect(result).toEqual(['Account.Industry']);
        });

        it('should handle missing apiName in Field component', () => {
            const layout = {
                objectApiName: 'Account',
                sections: [{
                    layoutRows: [{
                        layoutItems: [{
                            layoutComponents: [{
                                componentType: 'Field'
                                // missing apiName
                            }]
                        }]
                    }]
                }]
            };
            const result = extractFields(layout);
            expect(result).toEqual(['Account.undefined']);
        });
    });
});

