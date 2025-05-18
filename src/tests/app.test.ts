import request from 'supertest'
import app from '../app'

let testApiKey: string;

beforeAll(async () => {
    const res = await request(app).post('/api-keys').send({
        name: 'TestClient',
    })
    testApiKey = res.body.key
})

describe('Chakula API', () => {
    it('should return a welcome message on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('Chakula API');
    });

    it('should generate a new API key', async () => {
        const res = await request(app).post('/api-keys').send({ name: 'AnotherClient' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('key');
        expect(res.body).toHaveProperty('name', 'AnotherClient');
    });

    it('should return one random meal by default', async () => {
        const res = await request(app)
            .get('/meals/random')
            .set('x-api-key', testApiKey);

        expect(res.statusCode).toBe(200);
        expect(typeof res.body).toBe('object');
        expect(res.body).toHaveProperty('title');
    });

    it('should return multiple random meals if count is given', async () => {
        const res = await request(app)
        .get('/meals/random?count=3')
        .set('x-api-key', testApiKey);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
    });

    it('should paginate meals with limit and offset', async () => {
        const res = await request(app)
        .get('/meals?limit=2&offset=0')
        .set('x-api-key', testApiKey);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it('should search meals with a query', async () => {
        const res = await request(app)
        .get('/meals?search=rice')
        .set('x-api-key', testApiKey);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 for missing API key', async () => {
        const res = await request(app).get('/meals');
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'API key required');
    });

    it('should return 403 for invalid API key', async () => {
        const res = await request(app)
            .get('/meals')
            .set('x-api-key', 'invalidkey');
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'Invalid API key');
    });

    it('should reject malformed API key payload', async () => {
        const res = await request(app)
            .post('/api-keys')
            .send({});
        expect(res.statusCode).toBe(400);
    });
})