"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
const beach_1 = require("@src/models/beach");
const waveHeights = {
    ankleToKnee: {
        min: 0.3,
        max: 1.0,
    },
    waistHigh: {
        min: 1.0,
        max: 2.0,
    },
    headHigh: {
        min: 2.0,
        max: 2.5,
    },
};
class Rating {
    constructor(beach) {
        this.beach = beach;
    }
    getRatingBasedOnWindAndWavePositions(wavePosition, windPosition) {
        if (wavePosition === windPosition) {
            return 1;
        }
        else if (this.isWindOffShore(wavePosition, windPosition)) {
            return 5;
        }
        return 3;
    }
    getRatingForSwellPeriod(period) {
        if (period >= 7 && period < 10)
            return 2;
        if (period >= 10 && period < 14)
            return 4;
        if (period >= 14)
            return 5;
        return 1;
    }
    getRatingForSwellSize(height) {
        if (height >= waveHeights.ankleToKnee.min && height < waveHeights.ankleToKnee.max)
            return 2;
        if (height >= waveHeights.waistHigh.min && height < waveHeights.waistHigh.max)
            return 3;
        if (height >= waveHeights.headHigh.min)
            return 5;
        return 1;
    }
    getPositionFromLocation(coordinates) {
        if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0))
            return beach_1.GeoPosition.N;
        if (coordinates >= 50 && coordinates < 120)
            return beach_1.GeoPosition.E;
        if (coordinates >= 120 && coordinates < 220)
            return beach_1.GeoPosition.S;
        if (coordinates >= 220 && coordinates < 310)
            return beach_1.GeoPosition.W;
        return beach_1.GeoPosition.E;
    }
    getRateForPoint(point) {
        const swellDirection = this.getPositionFromLocation(point.swellDirection);
        const windDirection = this.getPositionFromLocation(point.windDirection);
        const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(swellDirection, windDirection);
        const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
        const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
        const finalRating = (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
        return Math.round(finalRating);
    }
    isWindOffShore(wavePosition, windPosition) {
        return ((wavePosition === beach_1.GeoPosition.N
            && windPosition === beach_1.GeoPosition.S
            && this.beach.position === beach_1.GeoPosition.N) ||
            (wavePosition === beach_1.GeoPosition.S
                && windPosition === beach_1.GeoPosition.N
                && this.beach.position === beach_1.GeoPosition.S) ||
            (wavePosition === beach_1.GeoPosition.E
                && windPosition === beach_1.GeoPosition.W
                && this.beach.position === beach_1.GeoPosition.E) ||
            (wavePosition === beach_1.GeoPosition.W
                && windPosition === beach_1.GeoPosition.E
                && this.beach.position === beach_1.GeoPosition.W));
    }
}
exports.Rating = Rating;
//# sourceMappingURL=rating.js.map