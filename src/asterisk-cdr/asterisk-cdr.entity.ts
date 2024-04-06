import { Table, Column, Model } from 'sequelize-typescript';

@Table({
    tableName: 'cdr',
})
export class AsteriskCdr extends Model {
    @Column
    calldate: Date;

    @Column
    clid: string;

    @Column
    src: string;

    @Column
    dst: string;

    @Column
    dcontext: string;

    @Column
    channel: string;

    @Column
    dstchannel: string;

    @Column
    lastapp: string;

    @Column
    lastdata: string;

    @Column
    duration: number;

    @Column
    billsec: number;

    @Column
    disposition: string;

    @Column
    amaflags: number;

    @Column
    accountcode: string;

    @Column
    uniqueid: string;

    @Column
    userfield: string;

    @Column
    did: string;

    @Column
    recordingfile: string;

    @Column
    cnum: string;

    @Column
    cnam: string;

    @Column
    outboundCnum: string;

    @Column
    outboundCnam: string;

    @Column
    dstCnam: string;

    @Column
    linkedid: string;

    @Column
    peeraccount: string;

    @Column
    sequence: number;
}