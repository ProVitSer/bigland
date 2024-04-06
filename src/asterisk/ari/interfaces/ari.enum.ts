export enum AriCallType {
    pozvonim = 'pozvonim',
    monitoring = 'monitoring',
    checkSpamNumber = 'checkSpamNumber',
    checkOperatorSpam = 'checkOperatorSpam',
}

export enum ChannelType {
    PJSIP = 'PJSIP',
    SIP = 'SIP',
    LOCAL = 'local',
}

export enum PlaybackSounds {
    IncorrectPass = 'sound:vm-incorrect',
    Goodbye = 'sound:vm-goodbye',
    DialPass = 'sound:agent-pass',
}

export enum EndpointState {
    offline = 'offline',
    online = 'online',
}

export enum HangupReason {
    normal = 'normal',
    busy = 'busy',
    congestion = 'congestion',
    noAnswer = 'no_answer',
}

export enum AsteriskContext {
    monitoring = 'monitoring',
    fromInternal = 'from-internal',
    pozvonim = 'pozvonim',
    amdCheckSpam = 'amd-check-spam',
    fromInternalAdditional = 'from-internal-additional',
}

export enum AsteriskOperatorTrunkName {
    monitoring = 'Monitoring',
}

export enum AsteriskDialStatus {
    CHANUNAVAIL = 'CHANUNAVAIL',
    CONGESTION = 'CONGESTION',
    NOANSWER = 'NOANSWER',
    BUSY = 'BUSY',
    ANSWER = 'ANSWER',
    CANCEL = 'CANCEL',
}

export enum AsteriskAmdCallStatus {
    MACHINE = 'MACHINE',
    HUMAN = 'HUMAN',
    NOTSURE = 'NOTSURE',
    HANGUP = 'HANGUP',
}
