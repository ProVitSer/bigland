export enum AmocrmActionStatus {
    status = 'status',
    call = 'call',
    cdr = 'cdr',
}

export enum SipBusynessStateId {
    free = 'free',
    busy = 'busy',
    error = 'error',
}

export enum DoNotDisturbStatus {
    on = 'on',
    off = 'off'
}

export enum AsteriskChannelState {
    Up = 'Up',
    Down = 'Down',
    Busy = 'Busy',
    Rsrvd = 'Rsrvd',
    OffHook = 'OffHook',
    Dialing = 'Dialing',
    Ring = 'Ring',
    Ringing = 'Ringing',
    Unknown = 'Unknown',
    PreRing = 'Pre-ring',
    DialingOffhook = 'Dialing Offhook',
}

export enum AsteriskDisposition {
    NO_ANSWER = 'NO ANSWER',
    FAILED = 'FAILED',
    BUSY  = 'BUSY',
    ANSWERED = 'ANSWERED',
    CONGESTION = 'CONGESTION',
    ON_CALL = 'ON_CALL',
    UNKNOWN = 'UNKNOWN'
}

export enum TransferContext {
    withHandler = 'from-internal-xfer-api-with-handler' ,
    withoutHandler = 'from-internal-xfer-api-without-handler'
}

export enum AsteriskCallContext {
    dialoutTrunk = 'macro-dialout-trunk',
    pstn = "from-pstn", 
    gorod = "from-4955454323",
    pozvonim = 'outrt-pozvonim', 
    apiGorod = 'outrt-api-gorod', 
    apiPozvonim = 'outrt-api-pozvonim', 
    tollFree = 'outrt-api-toll-free',
    local =  'ext-local',
    internal = 'from-internal'
}