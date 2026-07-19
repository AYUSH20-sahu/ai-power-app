export const parseGenerationResponse = (responseText) => {
    let code = '';
    let description = '';
    const marker = '```html';
    const startIndex = responseText.indexOf(marker);

    if (startIndex !== -1) {
        description = responseText.slice(0, startIndex).trim();
        const codeStart = startIndex + marker.length;
        const endIndex = responseText.indexOf('```', codeStart);
        code = endIndex !== -1 ? responseText.slice(codeStart, endIndex).trim() : '';
    } else {
        const genericStart = responseText.indexOf('```');
        if (genericStart !== -1) {
            description = responseText.slice(0, genericStart).trim();
            const genericCodeStart = genericStart + 3;
            const genericEnd = responseText.indexOf('```', genericCodeStart);
            code = genericEnd !== -1 ? responseText.slice(genericCodeStart, genericEnd).trim() : '';
        } else {
            description = responseText.trim();
        }
    }

    return { description, code };
};
