import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { ITokenService } from '../utils/jwt';

export interface IInput {
  data: {
    token: string
    secret: string
  }
}

export interface IDeps {
  retrieveRepository: IRetrieveRepository
  tokenService: ITokenService
}

export interface ISuccessData {
  _id: string
  email: string
  username: string
  name: string
}

/**
 * Use case: Verify a user's authentication token.
 *
 * Responsibilities:
 * 1. Verify the authenticity and validity of the provided token.
 *    1.1. Reject the request if token verification fails.
 * 2. Decode the token payload and extract the user identifier.
 * 3. Retrieve the corresponding user record from the repository.
 * 4. Return the verified user's information.
 */
export class VerifyTokenUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Verify the authenticity and validity of the provided token.
    const decodedToken = this.deps.tokenService.verifyToken(input.data.token);

    // 1.1. Reject the request if token verification fails.
    if (!decodedToken) {
      return this.fail({
        code: 401,
        message: 'Token verification failed',
      });
    }

    // 2. Decode the token payload and extract the user identifier.
    const userId = decodedToken.sub as string;

    // 3. Retrieve the corresponding user record from the repository.
    const response = await this.deps.retrieveRepository.handle(userId);

    // 4. Return the verified user's information.
    return this.success({
      _id: response._id,
      username: response.username as string,
      email: response.email as string,
      name: response.name as string,
    });
  }
}
