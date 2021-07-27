
import { MongoAccessor, getDb, LoggerInterface } from 'less-api'
import { Db } from 'less-api-database'
import Config from '../config'
import { createLogger } from './logger'


/**
 * 管理应用的全局对象
 * - sys db: 即 devops server 所需的数据库，管理应用的系统数据（云函数、访问策略等）
 * - app db: 即 app server 所用的数据库，管理应用的业务数据
 */
export class Globals {
  private static _sys_accessor: MongoAccessor = null
  private static _sys_db: Db = null

  private static _app_accessor: MongoAccessor = null
  private static _app_db: Db = null

  private static _logger: LoggerInterface = null

  static get sys_accessor() {
    return this._sys_accessor
  }

  static get sys_db() {
    return this._sys_db
  }

  static get app_accessor() {
    return this._app_accessor
  }

  static get app_db() {
    return this._app_db
  }

  static get logger() {
    return this._logger
  }

  /**
   * 初始化全局对象
   */
  static init() {
    // 创建全局日志对象
    if (null === this._logger) {
      this._logger = createLogger('server')
    }

    // 创建 sys db accessor
    if (null === this._sys_accessor) {
      this._sys_accessor = this._createAccessor(Config.sys_db.database, Config.sys_db.uri, Config.sys_db.poolSize)
    }

    // 创建 sys db orm 实例
    if (null === this._sys_db) {
      this._sys_db = this.createSysDb()
    }

    // 创建 app db accessor
    if (null === this._app_accessor) {
      this._app_accessor = this._createAccessor(Config.app_db.database, Config.app_db.uri, Config.app_db.poolSize)
    }

    // 创建 app db orm 实例
    if (null === this._app_db) {
      this._app_db = this.createAppDb()
    }

    Object.freeze(Globals)
  }

  /**
   * 创建 Sys Db 实例
   * @returns 
   */
  static createSysDb() {
    if (null === this._sys_accessor) {
      throw new Error('Globals.sys_accessor is empty, please run Globals.init() before!')
    }
    return getDb(this._sys_accessor)
  }

  /**
   * 创建 App Db 实例
   * @returns 
   */
  static createAppDb() {
    if (null === this._app_accessor) {
      throw new Error('Globals.app_accessor is empty, please run Globals.init() before!')
    }
    return getDb(this._app_accessor)
  }

  /**
   * 创建 MongoAccessor 对象
   * @param database 数据库名
   * @param uri 连接 uri
   * @param poolSize 
   * @returns 
   * @see — https://mongodb.github.io/node-mongodb-native/3.3/reference/connecting/connection-settings/
   */
  private static _createAccessor(database: string, uri: string, poolSize: number) {
    const accessor = new MongoAccessor(database, uri, {
      poolSize: poolSize,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    accessor.setLogger(createLogger('db', 'warning'))
    accessor.init()

    return accessor
  }
}

/**
 * 初始化全局资源对象
 */
Globals.init()