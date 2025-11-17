import type { Options, Option } from 'ccmodmanager/types/mod-options'
import VariableChargeTimings from './plugin'
import { defaultChargeTimings } from './variable-charge-time'

export let Opts: ReturnType<typeof modmanager.registerAndGetModOptions<ReturnType<typeof registerOpts>>>

export function buildTimingArrayFromOptions() {
    return [Opts.timing0, Opts.timing1, Opts.timing2]
}

export function registerOpts() {
    const base = {
        type: 'OBJECT_SLIDER',
        min: 0,
        max: 2,
        step: 0.01,
        thumbWidth: 60,
        customNumberDisplay(this: any, index: number): string {
            const seconds: number = this.min + index * this.step
            return `${seconds.toFixed(2)} s`
        },
        changeEvent() {
            for (const func of ig.onChargeTimingsOptionChange) func()
        },
    } as const satisfies Partial<Option>

    const opts = {
        general: {
            settings: {
                title: 'General',
                tabIcon: 'general',
            },
            headers: {
                timings: {
                    info: {
                        type: 'INFO',
                        name: 'Lvl 1 timing < Lvl 2 timing < Lvl 3 timing',
                    },
                    timing0: {
                        ...base,
                        init: defaultChargeTimings[0],
                        name: 'Lvl 1 timing',
                        description: 'Time required to active the first (lvl 1 combat art) charging stage',
                    },
                    timing1: {
                        ...base,
                        init: defaultChargeTimings[1],
                        name: 'Lvl 2 timing',
                        description: 'Time required to active the second (lvl 2 combat art) charging stage',
                    },
                    timing2: {
                        init: defaultChargeTimings[2],
                        ...base,
                        name: 'Lvl 3 timing',
                        description: 'Time required to active the second (lvl 3 combat art) charging stage',
                    },
                },
            },
        },
    } as const satisfies Options

    Opts = modmanager.registerAndGetModOptions(
        {
            modId: VariableChargeTimings.manifset.id,
            title: 'Var charge time',
        },
        opts
    )
    return opts
}
