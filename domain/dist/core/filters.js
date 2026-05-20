"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.In = exports.LessThan = exports.MoreThan = exports.Equals = exports.Like = void 0;
const Like = (value) => {
    return {
        type: 'like',
        value,
    };
};
exports.Like = Like;
const Equals = (value) => {
    return {
        type: 'equals',
        value,
    };
};
exports.Equals = Equals;
const MoreThan = (value) => {
    return {
        type: 'moreThan',
        value,
    };
};
exports.MoreThan = MoreThan;
const LessThan = (value) => {
    return {
        type: 'lessThan',
        value,
    };
};
exports.LessThan = LessThan;
const In = (value) => {
    return {
        type: 'in',
        value,
    };
};
exports.In = In;
