export enum OSTypes {
    na = '',
    windows = 'dxt',
    apple = 'pvrtc',
    android = 'etc1',
}

export function osTypeToString(s: OSTypes): string {
    const states: Record<OSTypes, string> = {
        [OSTypes.na]: 'na',
        [OSTypes.windows]: 'windows',
        [OSTypes.apple]: 'apple',
        [OSTypes.android]: 'android',
    };
    return states[s];
}
