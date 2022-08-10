import data from './data.json';

const yawPitchData = Object.keys(data) // .filter(k => !k)

let validYawPitchData: any[] = [];
yawPitchData.forEach((k: any) => {
    const item = data[k];
    const child = Object.keys(item);
    child.forEach(l => {
        const childItem = item[l];
        if (childItem.count > 0) {
            validYawPitchData.push(childItem)
        }
    });
});


console.log(validYawPitchData.length);
let topLeft: { values: { yaw: number, pitch: number, valid: boolean }[], highestPitch: number, highestYaw: number } = {
    values: [],
    highestPitch: 0,
    highestYaw: 0
};
const bottomRight: { values: { yaw: number, pitch: number, valid: boolean }[], highestPitch: number, highestYaw: number } = {
    values: [],
    highestPitch: 0,
    highestYaw: 0
};
const topRight: { values: { yaw: number, pitch: number, valid: boolean }[], highestPitch: number, highestYaw: number } = {
    values: [],
    highestPitch: 0,
    highestYaw: 0
};
const bottomleft: { values: { yaw: number, pitch: number, valid: boolean }[], highestPitch: number, highestYaw: number } = {
    values: [],
    highestPitch: 0,
    highestYaw: 0
};
const remaining: { yaw: number; pitch: number; valid: boolean; }[] = [];
validYawPitchData.forEach((f) => {
    if(parseInt(f.pitch_bin) < 0 && parseInt(f.yaw_bin) < 0) {
        // console.log(f.yaw_bin, f.pitch_bin);
        topLeft.values.push({ yaw: parseInt(f.yaw_bin), pitch: parseInt(f.pitch_bin), valid: false });
    }
    else if (parseInt(f.pitch_bin) > 0 && parseInt(f.yaw_bin) > 0) {
        bottomRight.values.push({ yaw: parseInt(f.yaw_bin), pitch: parseInt(f.pitch_bin), valid: false });
    }
    else if(parseInt(f.pitch_bin) < 0 && parseInt(f.yaw_bin) > 0) {
        topRight.values.push({ yaw: parseInt(f.yaw_bin), pitch: parseInt(f.pitch_bin), valid: false });
    }
    else if(parseInt(f.pitch_bin) > 0 && parseInt(f.yaw_bin) < 0) {
        bottomleft.values.push({ yaw: parseInt(f.yaw_bin), pitch: parseInt(f.pitch_bin), valid: false });
    } else {
        remaining.push({ yaw: parseInt(f.yaw_bin), pitch: parseInt(f.pitch_bin), valid: false });
    }
});
topLeft.highestPitch = topLeft.values.map(p => p.pitch).sort((a,b) => b-a)[0]
topLeft.highestYaw = topLeft.values.map(p => p.yaw).sort((a,b) => b-a)[0]

bottomRight.highestPitch = bottomRight.values.map(p => p.pitch).sort((a,b) => b-a)[0]
bottomRight.highestYaw = bottomRight.values.map(p => p.yaw).sort((a,b) => b-a)[0]

topRight.highestPitch = topRight.values.map(p => p.pitch).sort((a,b) => b-a)[0]
topRight.highestYaw = topRight.values.map(p => p.yaw).sort((a,b) => b-a)[0]
bottomleft.highestPitch = bottomleft.values.map(p => p.pitch).sort((a,b) => b-a)[0]
bottomleft.highestYaw = bottomleft.values.map(p => p.yaw).sort((a,b) => b-a)[0]


const all = {
    total: validYawPitchData,
    topLeft,
    bottomRight,
    topRight,
    bottomleft,
    remaining,
};

export default all;
