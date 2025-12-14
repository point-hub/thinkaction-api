import { copyrightYear, Handlebars } from '@point-hub/express-utils';

import emailServiceConfig from '@/config/email';

// Partials
const header = await Bun.file('./src/utils/email/header.hbs').text();
Handlebars.registerPartial('header', Handlebars.compile(header));
const footer = await Bun.file('./src/utils/email/footer.hbs').text();
Handlebars.registerPartial('footer', Handlebars.compile(footer));

// Helpers
Handlebars.registerHelper('appName', () => { return 'Thinkaction'; });
Handlebars.registerHelper('copyrightYear', copyrightYear);

export const renderHbsTemplate = async (path: string, context?: Record<string, unknown>) => {
  const file = Bun.file(`./src/${path}`);
  if (!(await file.exists())) {
    return `Template not found: ${path}`;
  }
  return Handlebars.render(await file.text(), context ?? {});
};

export interface ISendEmail {
  (data: { to: string, subject: string, template: string, context: Record<string, unknown> }): Promise<void>
}
export const sendEmail = async (data: { to: string, subject: string, template: string, context: Record<string, unknown> }, awaitResponse = false) => {
  const fetchPromise = fetch(emailServiceConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: await renderHbsTemplate(data.template, data.context),
      to: data.to,
      subject: data.subject,
    }),
  });

  if (awaitResponse) {
    await fetchPromise;
  }
};
