const process = require('process')
const path = require('path')

const glob = require('glob')
const download = require('download-git-repo')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')

const pkg = require('../package')
const { manufactureInfrastructureSync } = require('./utils')

module.exports = () => {
    const cwd = process.cwd() // 当前工作目录（用户在命令行执行`classic`命令时所在的目录）

    /**
     * 判断当前目录下是否存在文件、目录
     * 如果没有，则自动帮用户创建模版项目工程
     * 若用户有自己的项目工程结构则忽略
     */
    glob(path.join(cwd, '*'), {}, (err, files) => {
        if (files.length === 0) {
            const spinner = ora(chalk.green('Start to download remote template.'))
            spinner.start()

            const tempTemplatePath = path.join(cwd, './classic-cli-template')
            download(pkg.repository.url.replace(/^.*github.com\//, '').replace(/\.git.*$/, ''), tempTemplatePath, {}, (err) => {
                spinner.stop()
                if (err) {
                    console.log(chalk.red(`Failed to download repo ${pkg.repository.url}: ${err.message.trim()}`))
                    process.exit(-1)
                }

                console.log(chalk.green('Download remote template successfully.'))

                fs.copySync(path.join(tempTemplatePath), cwd)
                fs.removeSync(tempTemplatePath)
            })
        }
    })
}
