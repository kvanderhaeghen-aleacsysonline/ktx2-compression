import { ExtensionTypes, KTX2Types } from "../constants/constants";

export function getKTX2Type(): KTX2Types {
    const element = document.getElementById('compression')! as HTMLSelectElement;
    const selectedValue = element.options[element.selectedIndex].text;
    return selectedValue && selectedValue !== '' ? selectedValue as KTX2Types : KTX2Types.ETC1S;
}

export function getExtensionType(): ExtensionTypes {
    const element = document.getElementById('extension')! as HTMLSelectElement;
    const selectedValue = element.options[element.selectedIndex].text;
    return selectedValue && selectedValue !== '' ? selectedValue as ExtensionTypes : ExtensionTypes.PNG;
}