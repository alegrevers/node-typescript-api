import apiForecastRespons1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import { Beach, GeoPosition } from '@src/models/beach';
import nock from 'nock'
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach forecast functional tests', () => {
  let token: string;
  const defaultUser = {
    name: 'John Doe',
    email: 'john@emai.com',
    password: '1234'
  };

  beforeEach(async() => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id
    }

    new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.toJSON());
  })

  it('Should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      },
    }).defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/v2/weather/point')
    .query({
      lat: '-33.792726',
      lng: '151.289824',
      params: /(.*)/,
      source: 'noaa',
      end: /(.*)/,
    }).reply(200, stormGlassWeather3HoursFixture)

    const { body, status } = await global.testRequest.get('/forecast').set({ 'x-access-token': token });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastRespons1BeachFixture);
  });

  it('Should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true
      },
    }).defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get('/v2/weather/point')
    .query({lat: '-33.792726', lng: '151.289824'})
    .replyWithError('Something went wrong')

    const { status } = await global.testRequest.get('/forecast').set({ 'x-access-token': token });
    expect(status).toBe(500);
  })
});
