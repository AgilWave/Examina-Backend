import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway';
import { ViolationsModule } from '../violations/violations.module';

@Module({
  imports: [ViolationsModule],
  providers: [SignalingGateway],
})
export class SignalingModule {}
