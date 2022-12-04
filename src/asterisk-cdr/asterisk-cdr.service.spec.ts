import { Test, TestingModule } from '@nestjs/testing';
import { AsteriskCdrService } from './asterisk-cdr.service';

describe('AsteriskCdrService', () => {
  let service: AsteriskCdrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsteriskCdrService],
    }).compile();

    service = module.get<AsteriskCdrService>(AsteriskCdrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
