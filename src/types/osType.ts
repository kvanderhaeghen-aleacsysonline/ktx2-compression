export enum OSType {
    na = '',
    windows = 'dxt',
    apple = 'pvrtc',
    android = 'etc1',
}

export function osTypeToString(s: OSType): string {
    const states: Record<OSType, string> = {
        [OSType.na]: 'na',
        [OSType.windows]: 'windows',
        [OSType.apple]: 'apple',
        [OSType.android]: 'android',
    };
    return states[s];
}
