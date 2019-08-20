// peer
export * from './index-peer'

// vis-util
import * as util from 'vis-util'
export { util }

// vis-data
import * as data from 'vis-data'
export { data }
export { DataSet, DataView, Queue } from 'vis-data'

// bundled external libraries
import * as moment from './module/moment'
export { moment }
import * as Hammer from './module/hammer'
export { Hammer }
import * as keycharm from 'keycharm'
export { keycharm }
