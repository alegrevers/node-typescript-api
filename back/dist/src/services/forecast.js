"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forecast = exports.ForecastProcessingInternalError = void 0;
const lodash_1 = __importDefault(require("lodash"));
const internal_error_1 = require("@src/util/errors/internal-error");
const stormGlass_1 = require("@src/clients/stormGlass");
const logger_1 = __importDefault(require("@src/logger"));
const rating_1 = require("./rating");
class ForecastProcessingInternalError extends internal_error_1.InternalError {
    constructor(message) {
        super(`Unexpected error during the forecast processing: ${message}`);
    }
}
exports.ForecastProcessingInternalError = ForecastProcessingInternalError;
class Forecast {
    constructor(stormGlass = new stormGlass_1.StormGlass(), RatingService = rating_1.Rating) {
        this.stormGlass = stormGlass;
        this.RatingService = RatingService;
    }
    async processForecastForBeaches(beaches, orderBy = 'desc', orderField = 'rating') {
        try {
            const beachForecast = await this.calculateRating(beaches);
            const timeForecast = this.mapForecastByTime(beachForecast);
            return timeForecast.map((t) => ({
                time: t.time,
                forecast: lodash_1.default.orderBy(t.forecast, [orderField], [orderBy])
            }));
        }
        catch (error) {
            logger_1.default.error(error);
            throw new ForecastProcessingInternalError(error.message);
        }
    }
    async calculateRating(beaches) {
        const pointsWithCorrectSources = [];
        logger_1.default.info(`Preparing the forecast for ${beaches.length} beaches`);
        for (const beach of beaches) {
            const rating = new this.RatingService(beach);
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
            const enrichedBeachData = this.enrichedBeachData(points, beach, rating);
            pointsWithCorrectSources.push(...enrichedBeachData);
        }
        return pointsWithCorrectSources;
    }
    enrichedBeachData(points, beach, rating) {
        return points.map((point) => ({
            ...{},
            ...{
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: rating.getRateForPoint(point)
            },
            ...point,
        }));
    }
    mapForecastByTime(forecast) {
        const forecastByTime = [];
        for (const point of forecast) {
            const timePoint = forecastByTime.find((f) => f.time === point.time);
            if (timePoint) {
                timePoint.forecast.push(point);
            }
            else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point],
                });
            }
        }
        return forecastByTime;
    }
}
exports.Forecast = Forecast;
//# sourceMappingURL=forecast.js.map