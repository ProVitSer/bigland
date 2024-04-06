import { RedisService } from '@app/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { REDIS_PROBLEM } from '../health.constants';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    constructor(private readonly redisClient: RedisService) {
        super();
    }

    public async ping(key: string): Promise<HealthIndicatorResult> {
        try {

            const result = await this.redisClient.ping();

            if (result !== 'PONG') throw REDIS_PROBLEM;

            return super.getStatus(key, true);

        } catch (e) {

            throw new HealthCheckError(`${key} failed`, this.getStatus(key, false, {
                message: e
            }));
            
        }
    }
}