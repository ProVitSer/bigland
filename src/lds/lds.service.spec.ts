import { Test, TestingModule } from '@nestjs/testing';
import { LdsService } from './lds.service';

describe('LdsService', () => {
  let service: LdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LdsService],
    }).compile();

    service = module.get<LdsService>(LdsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
