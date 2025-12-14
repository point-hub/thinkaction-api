import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { UserEntity } from '../entity';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { ITokenService } from '../utils/jwt';
import type { IPasswordService } from '../utils/password';

export interface IInput {
  data: {
    username: string
    password: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  passwordService: Pick<IPasswordService, 'verify'>
  tokenService: Pick<ITokenService, 'createAccessToken' | 'createRefreshToken'>
}

export interface ISuccessData {
  _id?: string
  email?: string
  username?: string
  name?: string
  profile?: {
    bio?: string
    status?: string
  }
  avatar?: {
    public_domain?: string
    public_path?: string
  }
  access_token?: string
  refresh_token?: string
}

/**
 * Use case: Authenticate a user during sign-in.
 *
 * Responsibilities (with branching numbering):
 * 1. Normalize the provided identity (email or username).
 * 2. Retrieve the user record matching the provided identity.
 *    2.1. Reject if no matching user is found.
 * 3. Validate the provided password against the stored hash.
 *    3.1. Reject if the password is invalid.
 * 4. Reject if the user's email is not verified.
 * 5. Generate access and refresh tokens for the authenticated user.
 * 6. Return the authenticated user's details and tokens.
 */
export class SigninUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Normalize the provided identity (email or username).
    let userInput: UserEntity;
    if (input.data.username.includes('@')) {
      userInput = new UserEntity({ email: input.data.username });
      userInput.trimmedEmail();
    } else {
      userInput = new UserEntity({ username: input.data.username });
      userInput.trimmedUsername();
    }

    // 2. Retrieve the user record matching the provided identity.
    const users = await this.deps.identityMatcherRepository.handle(
      userInput.data.trimmed_username ?? (userInput.data.trimmed_email as string),
    );

    // 2.1. Reject authentication if no matching user is found.
    if (users.data.length === 0) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // Re-instantiate user entity for encapsulation and reusability.
    const user = new UserEntity(users.data[0]);

    // 3. Validate the provided password against the stored hash.
    const isPasswordVerified = await this.deps.passwordService.verify(
      input.data.password,
      user.data.password as string,
    );

    // 3.1. Reject authentication if the password is invalid.
    if (!isPasswordVerified) {
      return this.fail({ code: 401, message: 'Invalid Credentials' });
    }

    // 4. Reject authentication if the user's email is not verified.
    if (!user.data.email_verification || !user.data.email_verification.is_verified) {
      return this.fail({
        code: 422,
        message: 'Email not verified',
        errors: { username: ['Email associated with this account has not been verified'] },
      });
    }

    // 5. Generate access and refresh tokens for the authenticated user.
    const accessToken = this.deps.tokenService.createAccessToken(user.data._id as string);
    const refreshToken = this.deps.tokenService.createRefreshToken(user.data._id as string);

    // 6. Return the authenticated user's details and tokens.
    return this.success({
      _id: user.data._id,
      email: user.data.email,
      username: user.data.username,
      name: user.data.name,
      profile: user.data.profile,
      avatar: user.data.avatar,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}
