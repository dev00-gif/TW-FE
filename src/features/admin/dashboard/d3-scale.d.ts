// The runtime package is installed; keep the narrow functions used by this feature typed
// until @types/d3-scale can be installed in an environment with registry access.
declare module 'd3-scale' {
  export function scaleBand(): {
    (value: string): number | undefined
    padding: (value: number) => ReturnType<typeof scaleBand>
    bandwidth: () => number
    domain: (values: Iterable<string>) => ReturnType<typeof scaleBand>
    range: (values: Iterable<number>) => ReturnType<typeof scaleBand>
    copy: () => ReturnType<typeof scaleBand>
  }
  export function scaleLinear(): {
    (value: number): number
    domain: (values: Iterable<number>) => ReturnType<typeof scaleLinear>
    range: (values: Iterable<number>) => ReturnType<typeof scaleLinear>
    copy: () => ReturnType<typeof scaleLinear>
    ticks: (count?: number) => number[]
    tickFormat: (count?: number) => (value: number) => string
    nice: (count?: number) => ReturnType<typeof scaleLinear>
  }
}
