// utils
export { default as util } from 'vis-util'
export { default as Any } from './DOMutil'

// data
import { DataSet, DataView, Queue } from 'vis-data'
export { DataSet, DataView, Queue }

// Network.
export { default as Network } from './network/Network'

import Images from './network/Images'
import dotparser from './network/dotparser'
import * as gephiParser from './network/gephiParser'
import * as allOptions from './network/options'
export const network = {
  Images,
  dotparser,
  gephiParser,
  allOptions,
  convertDot(input: string): any {
    return exports.network.dotparser.DOTToGraph(input)
  },
  convertGephi(input: string, options: unknown): any {
    return exports.network.gephiParser.parseGephi(input, options)
  },
}

// bundled external libraries
export { default as moment } from './module/moment'
export { default as Hammer } from './module/hammer'
export { default as keycharm } from 'keycharm'
