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
exports.SetupServer = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
require("./util/module-alias");
const core_1 = require("@overnightjs/core");
const forecast_1 = require("./controllers/forecast");
const database = __importStar(require("@src/database"));
const beaches_1 = require("./controllers/beaches");
const users_1 = require("./controllers/users");
const cors_1 = __importDefault(require("cors"));
const api_schema_json_1 = __importDefault(require("./api-schema.json"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const logger_1 = __importDefault(require("./logger"));
class SetupServer extends core_1.Server {
    constructor(port = 3000) {
        super();
        this.port = port;
    }
    async init() {
        this.setupExpress();
        await this.docsSetup();
        this.setupControllers();
        await this.databaseSetup();
    }
    setupExpress() {
        this.app.use(body_parser_1.default.json());
        this.app.use((0, cors_1.default)({ origin: '*' }));
    }
    setupControllers() {
        const forecastController = new forecast_1.ForecastController();
        const beachesController = new beaches_1.BeachesController();
        const usersControler = new users_1.UsersController();
        this.addControllers([forecastController, beachesController, usersControler]);
    }
    async databaseSetup() {
        await database.connect();
    }
    async docsSetup() {
        this.app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(api_schema_json_1.default));
        await OpenApiValidator.middleware({
            apiSpec: api_schema_json_1.default,
            validateRequests: true,
            validateResponses: true
        });
    }
    async close() {
        await database.close();
    }
    start() {
        this.app.listen(this.port, () => {
            logger_1.default.info(`Server listening on port: ${this.port}`);
        });
    }
    getApp() {
        return this.app;
    }
}
exports.SetupServer = SetupServer;
//# sourceMappingURL=server.js.map