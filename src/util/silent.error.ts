/**
 * Throw this error if it shouldn't be logged when caught (implying that whatever threw this error
 * has already handled the logging.
 */
export class SilentError extends Error {
    public override name = 'SilentError';
    constructor() {
        super();
    }
}
