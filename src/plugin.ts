import type { PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod'
import type { Mod1 } from './types'
import ccmod from '../ccmod.json'
import { registerOpts } from './options'
import { injectVariableChargeTime } from './variable-charge-time'

export default class VariableChargeTimings implements PluginClass {
    static dir: string
    static mod: Mod1
    static manifset: typeof import('../ccmod.json') = ccmod

    constructor(mod: Mod1) {
        VariableChargeTimings.dir = mod.baseDirectory
        VariableChargeTimings.mod = mod
        VariableChargeTimings.mod.isCCL3 = mod.findAllAssets ? true : false
        VariableChargeTimings.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }

    async prestart() {
        registerOpts()
        injectVariableChargeTime()
    }
}
