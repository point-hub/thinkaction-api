import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { type ISendEmail, sendEmail } from '@/utils/email';
import type { IUniqueValidation } from '@/utils/unique-validation';

import { UserEntity } from '../entity';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { ISignupRepository } from '../repositories/signup.repository';
import type { ICreateLinkEmailVerification } from '../utils/create-link-email-verification';
import type { IPasswordService } from '../utils/password';

export interface IInput {
  data: {
    name: string
    username: string
    email: string
    password: string
  }
}

export interface IDeps {
  signupRepository: ISignupRepository
  retrieveRepository: IRetrieveRepository
  uniqueValidation: IUniqueValidation
  sendEmail: ISendEmail
  createLinkEmailVerification: ICreateLinkEmailVerification
  passwordService: IPasswordService
}

export interface ISuccessData {
  inserted_id: string
  user: {
    _id: string
    name: string
    username: string
    email: string
  }
}

/**
 * Use case: Handle user signup.
 *
 * Responsibilities:
 * 1. Generate an email verification link and code.
 * 2. Create a UserEntity and apply transformations.
 * 3. Validate uniqueness for email and username.
 * 4. Persist the user data into the repository.
 * 5. Send the email verification message to the user.
 * 6. Retrieve user data after insertion.
 * 7. Return success response.
 */
export class SignupUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Generate an email verification link and code.
    const linkEmailVerification = this.deps.createLinkEmailVerification();

    // 2. Create a UserEntity and apply transformations.
    const userEntity = new UserEntity({
      name: input.data.name,
      username: input.data.username,
      email: input.data.email,
      password: input.data.password ? await this.deps.passwordService.hash(input.data.password) : '',
      email_verification: {
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
      private_account: false,
    });
    userEntity.trimmedEmail();
    userEntity.trimmedUsername();

    // 3. Validate uniqueness for email and username.
    await this.deps.uniqueValidation.handle('users', {
      match: { trimmed_email: input.data.email },
      replaceErrorAttribute: { trimmed_email: 'email' },
    });
    await this.deps.uniqueValidation.handle('users', {
      match: { trimmed_username: input.data.username },
      replaceErrorAttribute: { trimmed_username: 'username' },
    });

    // 4. Persist the user data into the repository.
    const responseSignup = await this.deps.signupRepository.handle(userEntity.data);

    // 5. Send the email verification message to the user.
    await sendEmail({
      to: userEntity.data.email as string,
      subject: 'Please verify your email address',
      template: 'modules/users/emails/email-verification.hbs',
      context: {
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
    }, true);

    // 6. Retrieve user data after insertion.
    const responseUser = await this.deps.retrieveRepository.handle(responseSignup.inserted_id);

    // 7. Return success response.
    return this.success({
      inserted_id: responseSignup.inserted_id,
      user: {
        _id: responseSignup.inserted_id,
        name: responseUser.name,
        username: responseUser.username,
        email: responseUser.email,
      },
    });
  }
}
