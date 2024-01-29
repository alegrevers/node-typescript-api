import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { Forecast } from '@src/services/forecast';
import { BaseController } from '.';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      this.sendErrorResponse(res, {code: 500, message: 'Somethin went wrong'})
    }
  }
}
