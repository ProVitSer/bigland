interface TemplateVariables {
  [key: string]: string | number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MailContact {
  name: string;
  email: string;
}

export interface SendMail {
  to: string | string[];
  from?: string;
  subject?: string;
  context: TemplateVariables | ChanSpyContext | CreatePbxUserContext;
  template: string;
}

export interface ChanSpyContext {
  context: {
    password: string;
    month: string;
  };
}

export interface CreatePbxUserContext {
  username: string;
  extension: string;
  password: string;
}
