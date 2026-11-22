/**
 * Paths are relative ('events', not '/events'): the request context's baseURL must end with '/api/',
 * otherwise URL resolution drops the '/api' segment.
 */
async function send(request, method, path, data, acceptedStatuses = []) {
    // Idle keep-alive sockets get dropped while the UI runs ("socket hang up", seen live). Retry that
    // network reset for idempotent methods only: a retried POST could create a duplicate.
    const maxRetries = ['GET', 'DELETE', 'PUT'].includes(method) ? 1 : 0;
    const response = await request.fetch(path, { method, data, maxRetries });
    if (!response.ok()) {
        if (acceptedStatuses.includes(response.status())) return {};
        throw new Error(`EventHub API ${method} ${path} failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
}

export class EventHubApi {

    /** @param {import('@playwright/test').APIRequestContext} request */
    constructor(request) {
        this.request = request;
    }

    /** @param {import('@playwright/test').APIRequestContext} request */
    static async register(request, email, password) {
        const { token, user } = await send(request, 'POST', 'auth/register', { email, password });
        return { token, user };
    }

    /** @param {import('@playwright/test').APIRequestContext} request */
    static async login(request, email, password) {
        const { token, user } = await send(request, 'POST', 'auth/login', { email, password });
        return { token, user };
    }

    async createEvent(data) {
        return (await send(this.request, 'POST', 'events', data)).data;
    }

    async deleteEvent(id) {
        // Teardown only: if a retried DELETE's first attempt already deleted it, 404 means "already gone".
        return (await send(this.request, 'DELETE', `events/${id}`, undefined, [404])).data;
    }

    async createBooking(data) {
        return (await send(this.request, 'POST', 'bookings', data)).data;
    }

    async cancelBooking(id) {
        return (await send(this.request, 'DELETE', `bookings/${id}`)).data;
    }

    async getBookingByRef(ref) {
        return (await send(this.request, 'GET', `bookings/ref/${ref}`)).data;
    }

}
