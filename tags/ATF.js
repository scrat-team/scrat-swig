exports.compile = function () {
    return '_output += _ext._resource.useATF();';
};
exports.parse = function () {
    return true;
};
exports.ends = false;