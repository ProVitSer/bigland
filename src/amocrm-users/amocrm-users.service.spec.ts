import { Test, TestingModule } from '@nestjs/testing';
import { AmocrmUsersService } from './amocrm-users.service';

describe('AmocrmUsersService', () => {
  let service: AmocrmUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmocrmUsersService],
    }).compile();

    service = module.get<AmocrmUsersService>(AmocrmUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
