import { Test, TestingModule } from '@nestjs/testing';
import { GsmGatewayApiController } from './gsm-gateway-api.controller';

describe('GsmGatewayApiController', () => {
  let controller: GsmGatewayApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GsmGatewayApiController],
    }).compile();

    controller = module.get<GsmGatewayApiController>(GsmGatewayApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
