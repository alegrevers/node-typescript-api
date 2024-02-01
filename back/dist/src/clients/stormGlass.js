"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StormGlass = exports.StormGlassResponseError = exports.ClientRequestError = void 0;
const internal_error_1 = require("@src/util/errors/internal-error");
const HTTPUtil = __importStar(require("@src/util/request"));
const config_1 = __importDefault(require("config"));
class ClientRequestError extends internal_error_1.InternalError {
    constructor(message) {
        const internalMessage = 'Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);
    }
}
exports.ClientRequestError = ClientRequestError;
class StormGlassResponseError extends internal_error_1.InternalError {
    constructor(message) {
        const internalMessage = 'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}
exports.StormGlassResponseError = StormGlassResponseError;
const stormGlassResourceConfig = config_1.default.get('App.resources.StormGlass');
class StormGlass {
    constructor(request = new HTTPUtil.Request()) {
        this.request = request;
        this.stormGlassAPIParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
        this.stormGlassAPISource = 'noaa';
    }
    async fetchPoints(lat, lng) {
        try {
            const response = await this.request.get(`${stormGlassResourceConfig.get('apiUrl')}/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=${new Date().getTime()}&lat=${lat}&lng=${lng}`, {
                headers: {
                    Authorization: stormGlassResourceConfig.get('apiToken'),
                },
            });
            return this.normalizedResponse(response.data);
        }
        catch (err) {
            if (HTTPUtil.Request.isRequestError(err)) {
                throw new StormGlassResponseError(`Error: ${JSON.stringify(err.response.data)} Code: ${err.response.status}`);
            }
            throw new ClientRequestError(err.message);
        }
    }
    normalizedResponse(points) {
        return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
            time: point.time,
            swellDirection: point.swellDirection[this.stormGlassAPISource],
            swellHeight: point.swellHeight[this.stormGlassAPISource],
            waveHeight: point.waveHeight[this.stormGlassAPISource],
            swellPeriod: point.swellPeriod[this.stormGlassAPISource],
            waveDirection: point.waveDirection[this.stormGlassAPISource],
            windDirection: point.windDirection[this.stormGlassAPISource],
            windSpeed: point.windSpeed[this.stormGlassAPISource],
        }));
    }
    isValidPoint(point) {
        var _a, _b, _c, _d, _e, _f, _g;
        return !!(point.time &&
            ((_a = point.swellDirection) === null || _a === void 0 ? void 0 : _a[this.stormGlassAPISource]) &&
            ((_b = point.swellHeight) === null || _b === void 0 ? void 0 : _b[this.stormGlassAPISource]) &&
            ((_c = point.waveHeight) === null || _c === void 0 ? void 0 : _c[this.stormGlassAPISource]) &&
            ((_d = point.swellPeriod) === null || _d === void 0 ? void 0 : _d[this.stormGlassAPISource]) &&
            ((_e = point.waveDirection) === null || _e === void 0 ? void 0 : _e[this.stormGlassAPISource]) &&
            ((_f = point.windDirection) === null || _f === void 0 ? void 0 : _f[this.stormGlassAPISource]) &&
            ((_g = point.windSpeed) === null || _g === void 0 ? void 0 : _g[this.stormGlassAPISource]));
    }
}
exports.StormGlass = StormGlass;
//# sourceMappingURL=stormGlass.js.map