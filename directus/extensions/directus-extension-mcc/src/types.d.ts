export type FullAddress = {
    Email: string,
    Name?: string,
    MailboxHash?: string
}

export type Header = {
    Name: string,
    Value: string
}

export type Attachment = {
    Name: string,
    Content: string,
    ContentType: string,
    ContentLength: number
}

export type OutboundEmail = {
    From: string,
    To: string,
    Cc?: string,
    Bcc?: string,
    Subject?: string,
    Tag?: string,
    HtmlBody?: string,
    TextBody?: string
    ReplyTo?: string,
    Headers?: string[],
    TrackOpens?: boolean,
    TrackLinks?: string,
    Metadata?: object,
    Attachments?: Attachment[],
    MessageStream?: string
}

export type InboundEmail = {
    FromName: string,
    MessageStream: string,
    From: string,
    FromFull: FullAddress,
    To: string,
    ToFull: FullAddress[],
    Cc: string,
    CcFull: FullAddress[],
    Bcc: string,
    BccFull: FullAddress[],
    OriginalRecipient: string,
    Subject: string,
    MessageID: string,
    MailboxHash: string,
    Date: string,
    TextBody: string,
    HtmlBody: string,
    StrippedTextReply: string,
    Tag: string;
    Headers: Header[],
    Attachments: Attachment[]
}

export type Subscriber = {
    mailing_list: number,
    email: string,
    user?: {
        email: string,
        first_name: string,
        last_name: string
    }
}

export type MailingList = {
    id: number,
    name: string,
    email_name: string
}

export interface MailForward {
    name: string,
    from_name?: string,
    target_email: string
}
