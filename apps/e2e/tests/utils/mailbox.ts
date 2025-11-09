import { Page } from '@playwright/test';
import { parse } from 'node-html-parser';

export class Mailbox {
  constructor(private readonly page: Page) {}

  async visitMailbox(
    email: string,
    params: {
      deleteAfter: boolean;
    },
  ) {
    console.log(`Visiting mailbox ${email} ...`);

    const json = await this.getInviteEmail(email, params);

    if (!json?.HTML) {
      console.error(`Email not found for ${email}. Response:`, json);
      throw new Error('Email body was not found');
    }

    console.log('Email found');

    const html = json.HTML;
    const el = parse(html);

    const linkHref = el.querySelector('a')?.getAttribute('href');

    if (!linkHref) {
      throw new Error('No link found in email');
    }

    console.log(`Visiting ${linkHref} from mailbox ${email}...`);

    return this.page.goto(linkHref);
  }

  async getInviteEmail(
    email: string,
    params: {
      deleteAfter: boolean;
    },
  ) {
    const url = `http://127.0.0.1:54324/api/v1/search?query=to:${encodeURIComponent(email)}`;

    console.log(`Checking Inbucket for email to ${email}...`);

    const response = await fetch(url);

    if (!response.ok) {
      const status = response.status;
      console.error(`Inbucket API error: ${status} ${response.statusText}`);

      // If it's a 500 error, wait and retry
      if (status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        throw new Error(`Inbucket server error (${status}), will retry...`);
      }

      throw new Error(`Failed to fetch emails: ${status} ${response.statusText}`);
    }

    const json = (await response.json()) as { messages: Array<{ ID: string }> };

    console.log(`Inbucket search result:`, json);

    if (!json?.messages || !json.messages.length) {
      console.log(`No messages found for ${email} yet. Waiting for email to arrive...`);
      throw new Error(`No email found for ${email} yet. Will retry...`);
    }

    const messageId = json.messages[0]?.ID;
    console.log(`Found email with ID: ${messageId}`);

    const messageUrl = `http://127.0.0.1:54324/api/v1/message/${messageId}`;

    const messageResponse = await fetch(messageUrl);

    if (!messageResponse.ok) {
      throw new Error(`Failed to fetch email: ${messageResponse.statusText}`);
    }

    // Get the message content first
    const messageData = await messageResponse.json();

    // Delete message asynchronously (don't wait or fail if it doesn't work)
    if (params.deleteAfter) {
      console.log(`Deleting email ${messageId} ...`);

      // Delete asynchronously without blocking
      fetch(messageUrl, {
        method: 'DELETE',
      }).catch((error) => {
        // Silently ignore deletion errors - they don't affect test functionality
        console.warn(`Email deletion failed (non-critical): ${error.message}`);
      });
    }

    return messageData;
  }
}
