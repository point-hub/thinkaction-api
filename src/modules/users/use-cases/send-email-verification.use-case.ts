import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import { type ISendEmail, sendEmail } from '@/utils/email';

import type { IIdentityMatcherRepository } from '../repositories/identity-matcher.repository';
import type { IUpdateRepository } from '../repositories/update.repository';
import type { ICreateLinkEmailVerification } from '../utils/create-link-email-verification';

export interface IInput {
  filter: {
    username: string
  }
}

export interface IDeps {
  identityMatcherRepository: IIdentityMatcherRepository
  updateRepository: IUpdateRepository
  sendEmail: ISendEmail
  createLinkEmailVerification: ICreateLinkEmailVerification
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Send an email verification link to a user.
 *
 * Responsibilities:
 * 1. Retrieve the user by email.
 *    1.1. Fail if the email does not exist in the system.
 * 2. Generate a new email verification link and code.
 * 3. Create a UserEntity and normalize the provided email.
 * 4. Update the user's record with the verification data.
 * 5. Send an email containing the verification link and code.
 * 6. Return a standardized success response.
 */
export class SendEmailVerificationUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // 1. Retrieve the user by email.
    const users = await this.deps.identityMatcherRepository.handle(input.filter.username);
    // 1.1. Fail if the email does not exist in the system.
    if (users.data.length === 0) {
      return this.fail({ code: 422, message: 'Email is invalid', errors: { email: ['Email is invalid'] } });
    }

    // 2. Generate a new email verification link and code.
    const linkEmailVerification = this.deps.createLinkEmailVerification();

    // 4. Update the user's record with the verification data.
    const response = await this.deps.updateRepository.handle(users.data[0]._id, {
      email_verification: {
        requested_at: new Date(),
        code: linkEmailVerification.code,
        url: linkEmailVerification.url,
      },
    });

    // 5. Send an email containing the verification link and code.
    await sendEmail({
      to: users.data[0].email as string,
      subject: 'Please verify your email address',
      template: 'modules/users/emails/email-verification.hbs',
      context: {
        url: linkEmailVerification.url,
        code: linkEmailVerification.code,
      },
    }, true);

    // 6. Return a standardized success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
