import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VotesService } from './votes.service';
import { VoteSchema } from '../schemas/vote.schema';
import { UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vote', schema: VoteSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
