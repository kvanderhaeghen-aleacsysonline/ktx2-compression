import { OSType, osTypeToString } from '../types/osType';

export function getOSType(): OSType {
    let userAgent = window.navigator.userAgent,
        platform = (navigator as any).userAgentData?.platform || navigator?.platform || 'unknown',
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        osType: OSType = OSType.na;

    if (macosPlatforms.indexOf(platform) !== -1) {
        osType = OSType.apple;
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        osType = OSType.apple;
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        osType = OSType.windows;
    } else if (/Android/.test(userAgent)) {
        osType = OSType.android;
    } else if (!osType && /Linux/.test(platform)) {
        osType = OSType.windows;
    }
    console.log('Device:', osTypeToString(osType));

    return osType;
}
