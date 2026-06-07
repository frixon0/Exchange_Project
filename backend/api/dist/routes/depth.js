"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depthRouter = void 0;
const express_1 = require("express");
const reddisManager_1 = require("../reddisManager");
const types_1 = require("../types");
exports.depthRouter = (0, express_1.Router)();
exports.depthRouter.get("/depth", async (req, res) => {
    const response = await reddisManager_1.RedisManager.getInstance().sendAndAwait({
        type: types_1.GET_DEPTH,
        data: {
            market: req.query.market
        }
    });
    res.json(response.payload);
});
//# sourceMappingURL=depth.js.map