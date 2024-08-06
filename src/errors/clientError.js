class ClientError extends Error {
    constructor(code, messages) {
        if (!Array.isArray(messages)) {
            messages = [messages];
        }
        super(messages.join(', '));
        this.name = 'ClientError';
        this.messages = messages;
        this.code = code;
    }
}

module.exports = ClientError