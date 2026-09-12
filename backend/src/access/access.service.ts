import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class AccessService {
  verify(passphrase: string): boolean {
    const expected = process.env.ACCESS_PASSPHRASE;

    if (!expected) {
      return false;
    }

    const supplied = Buffer.from(passphrase);
    const target = Buffer.from(expected);

    return supplied.length === target.length && timingSafeEqual(supplied, target);
  }
}
