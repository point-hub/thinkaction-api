import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { ISendEmail } from '@/utils/email';

import { UserEntity } from '../entity';
import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { ICreateLinkResetPassword } from '../utils/create-link-reset-password';

export interface IInput {
  data: {
    email: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  updateRepository: IUpdateRepository
  createLinkResetPassword: ICreateLinkResetPassword
  sendEmail: ISendEmail
}

/**
 * Use case: Handle a user's password reset request.
 *
 * Responsibilities:
 * 1. Normalize the provided email using the UserEntity.
 * 2. Check whether the user exists in the system.
 *    2.1. Reject the request if the user does not exist.
 * 3. Generate a secure reset password link.
 * 4. Update the user record with reset-related information.
 * 5. Send a reset password email to the user.
 * 6. Return a standardized success response.
 */
export class RequestPasswordUseCase extends BaseUseCase<IInput, IDeps, void> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<void> | IUseCaseOutputFailed> {
    // 1. Normalize the provided email using the UserEntity.
    const userEntity = new UserEntity({ email: input.data.email });
    userEntity.trimmedEmail();

    // 2. Check whether the user exists in the system.
    const users = await this.deps.identityMatcherRepository.handle(userEntity.data.trimmed_email as string);

    // 2.1. Reject the request if the user does not exist.
    if (users.data.length === 0) {
      return this.fail({ code: 422, message: 'Invalid Credentials', errors: { email: ['Email is invalid'] } });
    }

    // 3. Generate a secure reset password link.
    const linkResetPassword = this.deps.createLinkResetPassword();

    // 4. Update the user record with reset-related information.
    await this.deps.updateRepository.handle(users.data[0]._id, {
      request_password: {
        requested_at: new Date(),
        code: linkResetPassword.code,
        url: linkResetPassword.url,
      },
    });

    // 5. Send a reset password email to the user.
    await this.deps.sendEmail({
      to: userEntity.data.email as string,
      subject: 'Request reset password',
      template: 'modules/users/emails/request-password.hbs',
      context: {
        name: users.data[0].name,
        code: linkResetPassword.code,
        url: linkResetPassword.url,
      },
    });

    // 6. Return a standardized success response.
    return this.success();
  }
}
