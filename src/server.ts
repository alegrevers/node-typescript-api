import { Application } from 'express';
import bodyParser from 'body-parser';
import './util/module-alias';
import { Server } from '@overnightjs/core';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupController();
    await this.databaseSetup();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupController(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersControler = new UsersController();
    this.addControllers([forecastController, beachesController, usersControler]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
