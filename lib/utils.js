const fs = require('fs')
const path = require('path')

// 代码来源：https://github.com/joehewitt/mkdir/blob/master/lib/mkdir.js
function makePathSync (dirPath, mode) {
    dirPath = path.resolve(dirPath) // eslint-disable-line no-param-reassign

    if (typeof mode === 'undefined') {
        mode = 0o0777 & (-process.umask()) // eslint-disable-line no-param-reassign, no-bitwise
    }

    try {
        if (!fs.statSync(dirPath).isDirectory()) {
            throw new Error(`${dirPath} exists and is not a directory`)
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            makePathSync(path.dirname(dirPath), mode)
            fs.mkdirSync(dirPath, mode)
        } else {
            throw err
        }
    }
}

// 构建项目文件夹
exports.manufactureInfrastructureSync = function (arrPaths) {
    arrPaths.forEach((pth) => { makePathSync(pth) })
}
