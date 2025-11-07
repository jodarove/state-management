/**
 * Extracts the field values referenced by a layout.
 * 
 * @param {*} layout layout definition
 * @returns fields referenced by the layout, as a string[]
 */
export function extractFields(layout) {
    if (! layout) {
        return;
    }

    const fields = [];

    for (const section of layout.sections) {
        for (const row of section.layoutRows) {
            for (const item of row.layoutItems) {
                for (const component of item.layoutComponents) {
                    if (component.componentType === 'Field') {
                        fields.push(`${layout.objectApiName}.${component.apiName}`);
                    }
                }
            }
        }
    }

    return fields;
}