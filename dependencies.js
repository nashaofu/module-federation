const http = require('http')
const https = require('https')
const fs = require('fs-extra')
const axios = require('axios')
const chalk = require('chalk')
const globby = require('globby')
const semver = require('semver')
const parallelToSerial = require('parallel-to-serial')

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50
})
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50
})

/**
 * 拉取最新的包
 * @param {*} pkg
 * @param {*} pkgInfo
 */
async function getPackageVersion(pkg, pkgInfo) {
  console.log(`get ${pkg} ...`)
  const time = Date.now()
  const id = encodeURIComponent(pkg).replace(/^%40/, '@')

  try {
    const { data } = await axios.get(`https://registry.npm.taobao.org/${id}/latest`, { httpAgent, httpsAgent })
    console.log(
      chalk.bgGreen.black(' DONE '),
      JSON.stringify(
        {
          ...pkgInfo,
          id: pkg,
          status: 200,
          time: Date.now() - time
        },
        null,
        2
      )
    )
    return data.version
  } catch (e) {
    const status = ((e || {}).response || {}).status
    console.log(
      chalk.bgRed.black(' ERROR '),
      JSON.stringify(
        {
          ...pkgInfo,
          id: pkg,
          status: status ? status : e.response,
          time: Date.now() - time
        },
        null,
        2
      )
    )
  }
}

/**
 * 比较版本
 * @param {*} pkg
 * @param {*} type
 */
function diffVersion(pkg, type, pkgNames) {
  return Object.keys(pkg[type] || {}).map(key => async () => {
    // 排除内部依赖
    if (pkgNames.indexOf(key) !== -1) return
    const version = await getPackageVersion(key, {
      name: pkg.name,
      type,
      version: pkg[type][key]
    })
    pkg[type][key] =
      version && semver.gt(semver.minVersion(version), semver.minVersion(pkg[type][key]))
        ? `^${version}`
        : pkg[type][key]
  })
}

globby(['./packages/*/package.json'], { cwd: __dirname, absolute: true }).then(async files => {
  const pkgs = await Promise.all(
    files.map(async file => {
      const pkg = await fs.readJSON(file)
      pkg.__file__ = file
      return pkg
    })
  )
  const pkgNames = pkgs.map(({ name }) => name)

  const tasks = pkgs.map(pkg => async () => {
    const file = pkg.__file__
    delete pkg.__file__

    const dependencies = diffVersion(pkg, 'dependencies', pkgNames)
    const devDependencies = diffVersion(pkg, 'devDependencies', pkgNames)

    console.log(`🚀  ${file} 正在获取新版本...`)

    await parallelToSerial(dependencies)
    await parallelToSerial(devDependencies)
    await fs.outputJson(file, pkg, { spaces: 2 })

    console.log(`🚀  ${file} DONE\n`)
  })
  console.log(files, pkgNames)
  parallelToSerial(tasks)
})
