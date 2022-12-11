import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Forecast } from '@src/services/forecast';
import logger from '@src/logger';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      logger.error("🚀 ~ file: forecast.ts:17 ~ req", req.decoded)
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error)
      res.status(500).send({ error: 'Something went wrong' })
    }
  }
}
