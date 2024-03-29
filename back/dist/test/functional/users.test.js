"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("@src/models/user");
const auth_1 = __importDefault(require("@src/services/auth"));
describe('Users functional tests', () => {
    beforeEach(async () => {
        await user_1.User.deleteMany({});
    });
    describe('When creating a new user', () => {
        it('Should successfully create a new user with encrypted password', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@email.com',
                password: '1234',
            };
            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(201);
            await expect(auth_1.default.comparePasswords(newUser.password, response.body.password)).resolves.toBeTruthy();
            expect(response.body).toEqual(expect.objectContaining({ ...newUser, ...{ password: expect.any(String) } }));
        });
        it('Should return 400 when there is a validation error', async () => {
            const newUser = {
                email: 'john@email.com',
                password: '1234',
            };
            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                code: 400,
                error: 'Bad Request',
                message: 'User validation failed: name: Path `name` is required.',
            });
        });
        it('Should return 409 when email already exist', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@email.com',
                password: '1234',
            };
            await global.testRequest.post('/users').send(newUser);
            const response = await global.testRequest.post('/users').send(newUser);
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: 'Conflict',
                message: 'User validation failed: email: already exists in the database.',
            });
        });
    });
    describe('When authenticating a user', () => {
        it('Should generate a token for a valid user', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@email.com',
                password: '1234',
            };
            await new user_1.User(newUser).save();
            const response = await global.testRequest.post('/users/authenticate')
                .send({ email: newUser.email, password: newUser.password });
            expect(response.body).toEqual(expect.objectContaining({ token: expect.any(String) }));
        });
        it('Should return UNAUTHORIZED if the user with the given email is not found', async () => {
            const response = await global.testRequest
                .post('/users/authenticate')
                .send({ email: 'some-email@mail.com', password: '1234' });
            expect(response.status).toBe(401);
        });
        it('Should return UNAUTHORIZED if the user is found but the password does not match', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@mail.com',
                password: '1234',
            };
            await new user_1.User(newUser).save();
            const response = await global.testRequest
                .post('/users/authenticate')
                .send({ email: newUser.email, password: 'different password' });
            expect(response.status).toBe(401);
        });
    });
    describe('When getting user profile info', () => {
        it('Should return the token\'s owner profile information', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@email.com',
                password: '1234',
            };
            const user = await new user_1.User(newUser).save();
            const token = auth_1.default.generateToken(user.toJSON());
            const { body, status } = await global.testRequest.get('/users/me').set({ 'x-access-token': token });
            expect(status).toBe(200);
            expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
        });
        it('Should return Not Found, when user is not found', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'john@email.com',
                password: '1234',
            };
            const user = new user_1.User(newUser);
            const token = auth_1.default.generateToken(user.toJSON());
            const { body, status } = await global.testRequest.get('/users/me').set({ 'x-access-token': token });
            expect(status).toBe(404);
            expect(body.message).toBe('User not found!');
        });
    });
});
//# sourceMappingURL=users.test.js.map