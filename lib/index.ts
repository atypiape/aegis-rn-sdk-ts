const AegisInner = require('./aegis.min.js');

/**
 * 忽略 aegis-rn-sdk 内部警报
 */
(function () {
  const rn = require('react-native');
  if (!rn) {
    return;
  }
  const { LogBox } = rn;
  LogBox.ignoreLogs([
    /** 代码异常警告 */
    "ReferenceError: Property 'location' doesn't exist",
  ]);
})();

/**
 * 当前项目运行所处的环境
 */
export enum AegisEnvironment {
  production = 'production',
  development = 'development',
  gray = 'gray',
  pre = 'pre',
  daily = 'daily',
  local = 'local',
  test = 'test',
  others = 'others',
}

/**
 * 请求资源类型
 */
export enum AegisResourceType {
  static = 'static',
  fetch = 'fetch',
}

/**
 * 返回码上报钩子函数处理后的返回值
 */
export interface AegisReturn {
  isErr: boolean;
  code: string;
}

export interface AegisAPI {
  /**
   *  可选，boolean，默认false。
   * 上报 api 信息的时候，是否上报 api 的请求参数和返回值;
   */
  apiDetail?: boolean;
  /**
   * 返回码上报钩子函数。
   * 会传入接口返回数据,请求url和xhr对象
   */
  retCodeHandler?: (
    data: string,
    url: string,
    xhr: XMLHttpRequest,
  ) => AegisReturn;

  /**
   * 上报请求参数的处理函数。
   * 可以对接口的请求参数进行处理，方便用户过滤上报请求参数的信息;
   */
  reqParamHandler: (data: any, url: string) => void;

  /**
   * 上报 response 返回 body 的处理函数。
   * 可以对接口返回值的 response body 进行处理，只上报关键信息;
   */
  resBodyHandler: (data: any, url: string) => void;

  /**
   * 请求资源类型修正钩子函数。
   * 会传入接口url，返回值为‘static’或‘fetch’。
   */
  resourceTypeHandler: () => AegisResourceType;
}

/**
 * 日志等级
 */
export enum AegisLogLevel {
  /** 白名单日志 */
  whiteList = '1',
  /** 一般日志 */
  normal = '2',
  /** 错误日志 */
  error = '4',
  /** Promise 错误 */
  promiseError = '8',
  /** Ajax 请求异常 */
  ajaxError = '16',
  /** JS 加载异常 */
  JsError = '32',
  /** 图片加载异常 */
  imageError = '64',
  /** css 加载异常 */
  cssError = '128',
  /** console.error */
  consoleError = '256',
  /** 音视频资源异常 */
  mediaError = '512',
  /** retcode 异常 */
  retCodeError = '1024',
  /** aegis report */
  aegisReport = '2048',
  /** PV */
  pv = '4096',
  /** 自定义事件 */
  custom = '8192',
  /** 小程序页面不存在 */
  miniprogramNotFound = '16384',
  /** websocket错误 */
  websocketError = '32768',
  /** js bridge错误 */
  jsBridgeError = '65536',
}

/**
 * 日志类型
 */
export enum AegisLogType {
  /** 自定义测速 */
  custom = 'custom',
  /** 自定义事件 */
  event = 'event',
  /** 日志 */
  log = 'log',
  /** 页面测速 */
  performance = 'performance',
  /** 页面PV */
  pv = 'pv',
  /** 接口和静态资源测速 */
  speed = 'speed',
  /** SDK 内部报错 */
  sdkError = 'sdkError',
  /** 白名单 */
  whiteList = 'whiteList',
  /** web vitals */
  vitals = 'vitals',
}

/**
 * 上报的日志内容
 */
export interface AegisLogs {
  level: AegisLogLevel;
  msg: string;
}

/**
 * 上报的数据
 */
export interface AegisRequestData {
  logType: AegisLogType;
  logs: AegisLogs | Error | null;
}

/**
 * 传入请求的所有内容
 */
export interface AegisRequestOption {
  type: AegisLogType;
  url: string;
  fail: (error: Error) => void;
}

export interface AegisAfterRequestMsg {
  /** 请求上报接口是否错误 */
  isErr: boolean;
  /**  上报接口的返回结果，JSON 字符串数组 */
  result: string[];
  /** 日志类型 */
  logType: AegisLogType;
  /** 上报的日志内容 */
  logs: AegisLogs | undefined;
}

export type AegisBeforeRequest = (
  data: AegisRequestData,
) => AegisRequestData | false;
export type AegisModifyRequest = (
  option: AegisRequestOption,
) => AegisRequestOption;
export type AegisAfterRequest = (msg: AegisAfterRequestMsg) => void;

export interface AegisConfig {
  /**
   * 必须，string，默认 无。
   * 开发者平台分配的项目上报ID, 业务系统 ID
   */
  id: string;
  /**
   * 建议，string，默认无。
   * 当前用户的唯一标识符，白名单上报时将根据该字段判定用户是否在白名单中，
   * 字段仅支持字母数字@=._-，正则表达式: /^[@=.0-9a-zA-Z_-]{1,60}$/
   */
  uin?: string;
  /**
   * 可选，boolean 或者 object，默认 false。
   * 是否开启接口测速
   */
  reportApiSpeed?: boolean;
  /**
   * 可选，string，默认 sdk 版本号。
   * 当前上报版本，当页面使用了pwa或者存在离线包时，
   * 可用来判断当前的上报是来自哪一个版本的代码，
   * 仅支持字母数字.,:_-，长度在 60 位以内 /^[0-9a-zA-Z.,:_-]{1,60}$/
   */
  version?: string;
  /**
   * 可选，number，默认 5。
   * 重复上报次数，对于同一个错误超过多少次不上报。
   */
  delay?: number;
  /**
   * 可选，number，默认 5。
   * 重复上报次数，对于同一个错误超过多少次不上报。
   */
  repeat?: number;
  /**
   * 可选，enum，默认 Aegis.environment.production。
   * 当前项目运行所处的环境。
   */
  env?: AegisEnvironment;
  /**
   * 可选，默认为{}
   */
  api?: AegisAPI;
  /**
   * 可选，默认是 https://aegis.qq.com。
   * 影响全部上报数据的 host 地址，下面几个 url 地址设置后会覆盖对应的上报地址
   */
  hostUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/collect'。
   * 日志上报地址
   */
  url?: string;
  /**
   * 可选，string, 默认 'https://aegis.qq.com/collect/pv'
   * pv 上报地址
   */
  pvUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/collect/whitelist'。
   * 白名单确认接口
   * 如果想要关闭白名单接口请求，可以传空字符串
   */
  whiteListUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/collect/offline'。
   * 离线日志上报地址
   */
  offlineUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/collect/events'。
   * 自定义事件上报地址
   */
  eventUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/speed/custom'。
   * 自定义测速上报地址
   */
  customTimeUrl?: string;
  /**
   * 可选，string，默认 'https://aegis.qq.com/speed'。
   * 测速日志上报地址
   */
  speedUrl?: string;
  /**
   * 可选，string，自定义上报的额外维度，上报的时候可以被覆盖
   */
  ext1?: string;
  /**
   * 可选，string，自定义上报的额外维度，上报的时候可以被覆盖
   */
  ext2?: string;
  /**
   * 可选，string，自定义上报的额外维度，上报的时候可以被覆盖
   */
  ext3?: string;
  /**
   * 上报前的钩子函数。
   * 该钩子将会在日志上报前执行，用于对上报数据的拦截和修改，通过返回不同类型的值：
   * - 拦截：返回false
   * - 修改：修改入参的值并返回
   */
  beforeRequest?: AegisBeforeRequest;

  /**
   * 该钩子函数会在所有请求发出前调用，参数中会传入请求的所有内容，必须返回待发送内容
   */
  modifyRequest?: AegisModifyRequest;

  /**
   * 该勾子将会在数据上报后被执行
   */
  afterRequest?: AegisAfterRequest;
}

export interface AegisEnvironmentType {
  production: AegisEnvironment;
  development: AegisEnvironment;
  gray: AegisEnvironment;
  pre: AegisEnvironment;
  daily: AegisEnvironment;
  local: AegisEnvironment;
  test: AegisEnvironment;
  others: AegisEnvironment;
}

/**
 * 上报的自定义事件参数
 * ext1 ext2 ext3 默认使用 new Aegis 的时候传入的参数，自定义事件上报的时候，可以覆盖默认值。
 * 注意，额外参数的三个 key 是固定的，目前只支持 ext1 ext2 ext3。
 */
export interface AegisReportEventParams {
  name: string; // 如: 'XXX请求成功'
  ext1: string; // 额外参数1
  ext2: string; // 额外参数2
  ext3: string; // 额外参数3
}

/**
 * 自定义测速参数
 * ext1 ext2 ext3 默认使用 new Aegis 的时候传入的参数，自定义测速上报的时候，可以覆盖默认值。
 */
export interface AegisReportTimeParams {
  name: string; // 自定义测速 name
  duration: number; // 自定义测速耗时(0 - 60000)
  ext1: string; // 额外参数1
  ext2: string; // 额外参数2
  ext3: string; // 额外参数3
}

/**
 * 对 aegis-rn-sdk 默认导出的 TypeScript 封装
 */
export class Aegis extends AegisInner {
  public static readonly environment: AegisEnvironmentType = {
    production: AegisEnvironment.production,
    development: AegisEnvironment.development,
    gray: AegisEnvironment.gray,
    pre: AegisEnvironment.pre,
    daily: AegisEnvironment.daily,
    local: AegisEnvironment.local,
    test: AegisEnvironment.test,
    others: AegisEnvironment.others,
  };

  /**
   * 在构造函数中实例化 Aegis
   */
  constructor(config: AegisConfig) {
    const finalConfig: AegisConfig = {
      ...config,
      /**
       * 过滤掉 Aegis 自身异常
       */
      beforeRequest: (data: AegisRequestData): AegisRequestData | false => {
        if (data.logs) {
          let isAegisError = false;
          const { logType, logs } = data;
          if (
            logType === 'log' &&
            !(logs instanceof Error) &&
            logs.msg &&
            logs.level === AegisLogLevel.ajaxError
          ) {
            if (
              (config.url && logs.msg.includes(config.url)) ||
              logs.msg.includes('clients3.google.com')
            ) {
              isAegisError = true;
            }
          } else if (logType === 'sdkError' && logs instanceof ReferenceError) {
            if (logs.message.includes("Property 'location' doesn't exist")) {
              isAegisError = true;
            }
          }
          if (isAegisError) {
            __DEV__ && console.debug('[Aegis] 中断上报内部异常:', data);
            return false;
          }
        }

        if (config.beforeRequest) {
          return config.beforeRequest(data);
        }
        return data;
      },
    };
    super(finalConfig);
  }

  /**
   * 该方法用来修改实例配置
   */
  public setConfig(config: Partial<AegisConfig>) {
    return super.setConfig(config);
  }

  /**
   * 上报一条白名单日志，这两种情况这条日志才会报到后台：
   * 1、打开页面的用户在名单中；
   * 2、对应的页面发生了错误'
   */
  public info(msg: string) {
    super.info(msg);
  }

  /**
   * 上报了一条日志，该上报与info唯一的不同就在于，所有用户都会上报
   */
  public infoAll(msg: string) {
    super.infoAll(msg);
  }

  /**
   * 上报一个错误
   */
  public report(error: Error) {
    super.report(error);
  }

  /**
   * 主动上报一个JS执行错误
   */
  public error(error: Error) {
    super.error(error);
  }

  /**
   * 该方法可用来上报自定义事件，平台将会自动统计上报事件的各项指标，诸如：PV、UV、平台分布等...
   * reportEvent 可以支持两种类型上报参数类型，一种是字符串类型；一种是对象类型。
   */
  public reportEvent(event: string | AegisReportEventParams) {
    super.reportEvent(event);
  }

  /**
   * 该方法可用来上报自定义测速
   */
  public reportTime(name: string | AegisReportEventParams, duration?: number) {
    super.reportTime(name, duration);
  }

  /**
   * 该方法同样可用来上报自定义测速，适用于两个时间点之间时长的计算并上报
   */
  public time(tag: string) {
    super.time(tag);
  }

  public timeEnd(tag: string) {
    super.timeEnd(tag);
  }

  /**
   * 该方法用于销毁 sdk 实例，销毁后，不再进行数据上报
   */
  public destroy() {
    super.destroy();
  }
}

export default Aegis;
