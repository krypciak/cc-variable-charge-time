import { buildTimingArrayFromOptions } from './options'

export const defaultChargeTimings: number[] = [0.25, 0.5, 1]

declare global {
    namespace ig {
        var chargeTimings: number[]
        var onChargeTimingsChange: ((timings: number[]) => void)[]

        function setChargeTimings(timings: number[]): void
    }
}

const origMin = Math.min
function getChargeLevel(charging: ig.ENTITY.Player.Charging, timings = ig.chargeTimings) {
    let c = 0
    for (let b = timings.length - 1; b >= 0; b--)
        if (charging.time >= timings[b]) {
            c = b + 1
            break
        }
    return origMin(charging.maxLevel, c)
}

let clearChargeCalled = false
export function injectVariableChargeTime() {
    let noBroadcast = false
    ig.setChargeTimings = function (timings) {
        if (timings.length != 3) throw new Error(`Charge timings array has to be of length 3!`)
        ig.chargeTimings = timings

        if (noBroadcast) return
        noBroadcast = true
        for (const listener of ig.onChargeTimingsChange) listener(timings)
        noBroadcast = false
    }
    ig.onChargeTimingsChange ??= []
    ig.setChargeTimings(buildTimingArrayFromOptions())

    ig.ENTITY.Player.inject({
        getCurrentChargeLevel() {
            return this.charging.time <= 0 ? 0 : getChargeLevel(this.charging)
        },
        clearCharge() {
            this.parent()
            clearChargeCalled = true
        },
        handleCharge(state, input) {
            clearChargeCalled = false

            Math.min = (...args) => {
                if (args.length == 2) {
                    const [a, b] = args
                    if (a == this.charging.maxLevel && b == getChargeLevel(this.charging, defaultChargeTimings)) {
                        if (this.charging.maxLevel < 3) {
                            this.charging.time = origMin(
                                this.charging.time,
                                ig.chargeTimings[this.charging.maxLevel] - 0.05
                            )
                        }

                        return getChargeLevel(this.charging)
                    }
                }
                return origMin(...args)
            }
            this.parent(state, input)
            Math.min = origMin

            if (
                !clearChargeCalled &&
                (this.charging.cancelTime > 1 || !input.charge) &&
                this.charging.time >= ig.chargeTimings[0]
            ) {
                state.applyCharge = getChargeLevel(this.charging)
                state.isCharging = false
                this.clearCharge()
                if (this.charging.cancelTime > 1) this.charging.block = 0.5
            }
        },
    })
}
