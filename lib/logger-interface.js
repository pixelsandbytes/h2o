module.exports = {
    type: 'object',
    contents: {
        info: {
            type: 'function',
            minArity: 1
        },
        warn: {
            type: 'function',
            minArity: 1
        },
        error: {
            type: 'function',
            minArity: 1
        },
        fatal: {
            type: 'function',
            minArity: 1
        }
    }
};
