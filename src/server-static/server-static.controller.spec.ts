import { Test, TestingModule } from '@nestjs/testing';
import { ServerStaticController } from './server-static.controller';

describe('ServerStaticController', () => {
  let controller: ServerStaticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServerStaticController],
    }).compile();

    controller = module.get<ServerStaticController>(ServerStaticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
