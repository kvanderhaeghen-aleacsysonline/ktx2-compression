export enum LabelTypes {
    Loading = 'loading',
    Transcoding = 'transcoding',
}


export function setLabelTime(type: LabelTypes, ms: number): void {
    const label = document.getElementById('transcode') as HTMLLabelElement;
    const typeText = type === LabelTypes.Loading ? 'Loading' : 'Transcoding & loading';
    label.textContent = typeText + ' time: ' + ms.toFixed(0) + 'ms';
}

export function setLabelCount(count: number): void {
    const label = document.getElementById('objects') as HTMLLabelElement;
    label.textContent = 'Object count: ' + count.toFixed(0);
}