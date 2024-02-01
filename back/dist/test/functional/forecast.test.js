"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_forecast_response_1_beach_json_1 = __importDefault(require("@test/fixtures/api_forecast_response_1_beach.json"));
const stormglass_weather_3_hours_json_1 = __importDefault(require("@test/fixtures/stormglass_weather_3_hours.json"));
const beach_1 = require("@src/models/beach");
const nock_1 = __importDefault(require("nock"));
const user_1 = require("@src/models/user");
const auth_1 = __importDefault(require("@src/services/auth"));
describe('Beach forecast functional tests', () => {
    let token;
    const defaultUser = {
        name: 'John Doe',
        email: 'john@emai.com',
        password: '1234'
    };
    beforeEach(async () => {
        await beach_1.Beach.deleteMany({});
        await user_1.User.deleteMany({});
        const user = await new user_1.User(defaultUser).save();
        const defaultBeach = {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: beach_1.GeoPosition.E,
            user: user.id
        };
        new beach_1.Beach(defaultBeach).save();
        token = auth_1.default.generateToken(user.toJSON());
    });
    it('Should return a forecast with just a few times', async () => {
        (0, nock_1.default)('https://api.stormglass.io:443', {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: () => true
            },
        }).defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get('/v2/weather/point')
            .query({
            lat: '-33.792726',
            lng: '151.289824',
            params: /(.*)/,
            source: 'noaa',
            end: /(.*)/,
        }).reply(200, stormglass_weather_3_hours_json_1.default);
        const { body, status } = await global.testRequest.get('/forecast').set({ 'x-access-token': token });
        expect(status).toBe(200);
        expect(body).toEqual(api_forecast_response_1_beach_json_1.default);
    });
    it('Should return 500 if something goes wrong during the processing', async () => {
        (0, nock_1.default)('https://api.stormglass.io:443', {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: () => true
            },
        }).defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .get('/v2/weather/point')
            .query({ lat: '-33.792726', lng: '151.289824' })
            .replyWithError('Something went wrong');
        const { status } = await global.testRequest.get('/forecast').set({ 'x-access-token': token });
        expect(status).toBe(500);
    });
});
//# sourceMappingURL=forecast.test.js.map