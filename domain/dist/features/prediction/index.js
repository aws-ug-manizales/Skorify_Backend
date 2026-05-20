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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatePredictionUsecase = exports.GetPredictionRulesUsecase = exports.GetPredictionByIdUsecase = exports.EditPredictionUsecase = exports.GetPredictionsByMatchUsecase = exports.PredictionContract = exports.CheckMatchCanBetUsecase = exports.GetPredictionsByUserUsecase = exports.GetPredictionByUserAndMatchUsecase = exports.MakePredictionUsecase = exports.PredictionEntity = void 0;
var prediction_entity_1 = require("./prediction.entity");
Object.defineProperty(exports, "PredictionEntity", { enumerable: true, get: function () { return prediction_entity_1.PredictionEntity; } });
__exportStar(require("./domain-events"), exports);
__exportStar(require("./prediction.rule"), exports);
__exportStar(require("./scoreRules"), exports);
var make_prediction_usecase_1 = require("./usecases/make-bet/make-prediction.usecase");
Object.defineProperty(exports, "MakePredictionUsecase", { enumerable: true, get: function () { return make_prediction_usecase_1.MakePredictionUsecase; } });
var get_prediction_by_user_and_match_usecase_1 = require("./usecases/get-prediction-by-user-and-match/get-prediction-by-user-and-match.usecase");
Object.defineProperty(exports, "GetPredictionByUserAndMatchUsecase", { enumerable: true, get: function () { return get_prediction_by_user_and_match_usecase_1.GetPredictionByUserAndMatchUsecase; } });
var get_predictions_by_user_usecase_1 = require("./usecases/get-predictions-by-user/get-predictions-by-user.usecase");
Object.defineProperty(exports, "GetPredictionsByUserUsecase", { enumerable: true, get: function () { return get_predictions_by_user_usecase_1.GetPredictionsByUserUsecase; } });
var check_match_can_bet_usecase_1 = require("./usecases/check-match-can-bet/check-match-can-bet.usecase");
Object.defineProperty(exports, "CheckMatchCanBetUsecase", { enumerable: true, get: function () { return check_match_can_bet_usecase_1.CheckMatchCanBetUsecase; } });
var prediction_contract_1 = require("./prediction.contract");
Object.defineProperty(exports, "PredictionContract", { enumerable: true, get: function () { return prediction_contract_1.PredictionContract; } });
var get_predictions_by_match_usecase_1 = require("./usecases/get-predictions-by-match/get-predictions-by-match.usecase");
Object.defineProperty(exports, "GetPredictionsByMatchUsecase", { enumerable: true, get: function () { return get_predictions_by_match_usecase_1.GetPredictionsByMatchUsecase; } });
var edit_prediction_usecase_1 = require("./usecases/edit-prediction/edit-prediction.usecase");
Object.defineProperty(exports, "EditPredictionUsecase", { enumerable: true, get: function () { return edit_prediction_usecase_1.EditPredictionUsecase; } });
var get_prediction_by_id_usecase_1 = require("./usecases/get-prediction-by-id/get-prediction-by-id.usecase");
Object.defineProperty(exports, "GetPredictionByIdUsecase", { enumerable: true, get: function () { return get_prediction_by_id_usecase_1.GetPredictionByIdUsecase; } });
var get_prediction_rules_usecase_1 = require("./usecases/get-prediction-rules/get-prediction-rules.usecase");
Object.defineProperty(exports, "GetPredictionRulesUsecase", { enumerable: true, get: function () { return get_prediction_rules_usecase_1.GetPredictionRulesUsecase; } });
var simulate_prediction_usecase_1 = require("./usecases/simulate-prediction/simulate-prediction.usecase");
Object.defineProperty(exports, "SimulatePredictionUsecase", { enumerable: true, get: function () { return simulate_prediction_usecase_1.SimulatePredictionUsecase; } });
