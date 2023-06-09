import { OSTypes, osTypeToString } from '../types/osType';

export function getOSType(): OSTypes {
    let userAgent = window.navigator.userAgent,
        platform = (navigator as any).userAgentData?.platform || navigator?.platform || 'unknown',
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        osType: OSTypes = OSTypes.na;

    if (macosPlatforms.indexOf(platform) !== -1) {
        osType = OSTypes.apple;
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        osType = OSTypes.apple;
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        osType = OSTypes.windows;
    } else if (/Android/.test(userAgent)) {
        osType = OSTypes.android;
    } else if (!osType && /Linux/.test(platform)) {
        osType = OSTypes.windows;
    }
    console.log('Device:', osTypeToString(osType));

    return osType;
}
