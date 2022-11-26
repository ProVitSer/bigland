import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cdr, CdrDocument } from './cdr.schema';
import { Model } from 'mongoose';

@Injectable()
export class CdrService {
  constructor(@InjectModel(Cdr.name) private cdrModel: Model<CdrDocument>) {}

  public async updateCdr() {}
}
