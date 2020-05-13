const process = require('process')
const path = require('path')

const glob = require('glob')
const download = require('download-git-repo')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs-extra')

const gulp = require('gulp')
const babel = require('gulp-babel')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const gulpIf = require('gulp-if')
const uglify = require('gulp-uglify')
const connect = require('gulp-connect')
const prettier = require('gulp-prettier')
const eslint = require('gulp-eslint')
const babelEnv = require('@babel/preset-env')

const pkg = require('../package')
const { manufactureInfrastructureSync } = require('./utils')

module.exports = ({ port, useLocalTemplate }) => {
    const cwd = process.cwd() // 当前工作目录（用户在命令行执行`classic`命令时所在的目录）

    /**
     * 判断当前目录下是否存在文件、目录
     * 如果没有，则自动帮用户创建模版项目工程
     * 若用户有自己的项目工程结构则忽略
     */
    glob(path.join(cwd, '*'), {}, (err, files) => {
        if (files.length === 0) {
            console.log(
                [
                    chalk.green('It seems you are in an empty directory, so we will create template files for you.'),
                    chalk.green('If you don\'t want template files to be generated, simply create some files in this path before running command `classic`.'),
                ].join('\n'),
            )

            if (useLocalTemplate === true) {
                try {
                    fs.ensureDirSync(path.join(cwd, 'images'))
                    fs.ensureFileSync(path.join(cwd, 'scripts/app.js'))
                    fs.ensureFileSync(path.join(cwd, 'styles/app.css'))
                    fs.ensureFileSync(path.join(cwd, 'index.html'))
                    fs.ensureFileSync(path.join(cwd, 'README.md'))
                    console.log(chalk.green('Create local template successfully.'))
                } catch (err1) {
                    console.log(chalk.red(`Failed to create local template: ${err1.message.trim()}`))
                }
            } else {
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

                    fs.copySync(path.join(tempTemplatePath, 'template'), cwd)
                    fs.removeSync(tempTemplatePath)
                })
            }
        }

        // 给CSS文件添加浏览器厂商前缀
        const cssFiles = {}
        const compileCSS = ({ src, dest, options }) => {
            options = options || {}
            gulp
                .src(src)
                .pipe(autoprefixer({
                    cascade: false,
                    ...(options || {}),
                }))
                .on('error', (err) => console.log(err.message))
                .pipe(gulpIf(options.compress === true, cleanCSS()))
                .on('error', (err) => console.log(err.message))
                .pipe(gulpIf(options.compress === false, prettier({
                    editorconfig: true,
                })))
                .on('error', (err) => console.log(err.message))
                .pipe(gulp.dest(dest))
                .on('error', (err) => console.log(err.message))
                .pipe(connect.reload())
                .on('error', (err) => console.log(err.message))
                .on('end', () => {
                    console.log(chalk.yellow(`Compiled: ${src}.`))
                    cssFiles[src].isHandled = true
                    cssFiles[src].timestamp = new Date().getTime()
                })
        }

        // 编译JS代码
        const jsFiles = {}
        const compileJS = ({ src, dest, options }) => {
            gulp
                .src(src)
                .pipe(babel({ presets: [babelEnv] }))
                .on('error', (err) => console.log(err.message))
                .pipe(gulpIf(options.compress === true, uglify({ output: { comments: true } }))) // preserve all comments
                .on('error', (err) => console.log(err.message))
                .pipe(gulpIf(options.compress === false, prettier({
                    editorconfig: true,
                    singleQuote: true,
                    semi: false,
                })))
                .on('error', (err) => console.log(err.message))
                .pipe(eslint({
                    fix: true,
                    rules: {
                        'space-before-function-paren': ['error', 'always'],
                    },
                    envs: ['browser'],
                }))
                .on('error', (err) => console.log(err.message))
                .pipe(gulp.dest(dest))
                .on('error', (err) => console.log(err.message))
                .pipe(connect.reload())
                .on('error', (err) => console.log(err.message))
                .on('end', () => {
                    console.log(chalk.yellow(`Compiled: ${src}.`))
                    jsFiles[src].isHandled = true
                    jsFiles[src].timestamp = new Date().getTime()
                })
        }

        const htmlFiles = {}
        const compileHTML = ({ src, dest, options }) => {
            gulp
                .src(src)
                .pipe(prettier({
                    editorconfig: true,
                }))
                .on('error', (err) => console.log(err.message))
                .pipe(gulp.dest(dest))
                .on('error', (err) => console.log(err.message))
                .pipe(connect.reload())
                .on('error', (err) => console.log(err.message))
                .on('end', () => {
                    console.log(chalk.yellow(`Compiled: ${src}.`))
                    htmlFiles[src].isHandled = true
                    htmlFiles[src].timestamp = new Date().getTime()
                })
        }

        const changeCallback = (filePath, store, compileFunc) => {
            const fileContent = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })

            let storeItem = store[filePath]
            if (!storeItem) {
                store[filePath] = {}
                storeItem = store[filePath]
                storeItem.fileContent = null
            } else {
                if (storeItem.isHandled === false) { return } // 如果上一次任务还未处理完毕，则不继续处理

                if (fileContent === storeItem.fileContent) { return } // 如果文件内容没变化，则不继续处理

                if (new Date().getTime() - storeItem.timestamp < 300) { return } // 如果距离上一次修改不到300ms，也直接忽略

                storeItem.fileContent = fileContent
            }

            console.log()
            console.log(chalk.yellow(`Changed: ${filePath}.`))

            storeItem.isHandled = false
            storeItem.timestamp = new Date().getTime()

            compileFunc({
                src: filePath,
                dest: filePath.replace(/[\/][^\/]+$/, ''),
                options: {
                    compress: (() => {
                        if (/classic-compress:\s*true/.test(fileContent)) { return true }
                        if (/classic-compress:\s*false/.test(fileContent)) { return false }
                        return null
                    })(), // 如果文件中有classic-compress: true注释，则压缩文件，否则美化文件
                },
            })
        }

        const cssWatcher = gulp.watch([path.join(cwd, '**/*.css'), '!' + path.join(cwd, '**/*.min.css')])
        const jsWatcher = gulp.watch([path.join(cwd, '**/*.js'), '!' + path.join(cwd, '**/*.min.js')])
        const htmlWatcher = gulp.watch([path.join(cwd, '**/*.html')])

        cssWatcher.on('change', (filePath, stats) => changeCallback(filePath, cssFiles, compileCSS))

        jsWatcher.on('change', (filePath, stats) => changeCallback(filePath, jsFiles, compileJS))

        htmlWatcher.on('change', (filePath, stats) => changeCallback(filePath, htmlFiles, compileHTML))

        connect.server({
            name: 'classic\s built-in server',
            root: [cwd],
            port: parseInt(port, 10),
            livereload: true,
        })
    })
}
