# CWALL Content Publisher

![Next.js](https://img.shields.io/badge/-Next.js-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/-TailwindCSS-21358E?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/-Prisma-3982CE?style=flat-square&logo=prisma)
![shadcn/ui](https://img.shields.io/badge/-shadcn%2Fui-38B2AC?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-black?style=flat-square&logo=postgresql)
![Clerk](https://img.shields.io/badge/-Clerk-0077B5?style=flat-square&logo=clerk)

Visit [cwall-publisher](https://cwall-publisher.vercel.app) to try it out!

CWALL Content Publisher is a utility web application designed to streamline the process of programmatically uploading content to Instagram accounts using the Instagram Graph API's content publish endpoints. It leverages Google Drive as an image repository, allowing users to select their own folders for uploading content seamlessly.

![Screenshot 2024-03-12 at 11 14 32 PM](https://github.com/SHHH9712/cwall-publisher/assets/11616440/f1a44f1d-b5f9-4627-8d14-4da7b6b20bce)
![Screenshot 2024-03-12 at 11 15 03 PM](https://github.com/SHHH9712/cwall-publisher/assets/11616440/39502852-03f8-454f-b698-8cb0c3c34e07)

## Features

- **Instagram Graph API Integration**: Utilize Instagram's content publishing capabilities to upload content directly to your Instagram account.
- **Google Drive Integration**: Select images from your own Google Drive folder to upload to Instagram.
- **Quota Management**: Keeps track of your daily posting limit with a visible indicator on the main page, noting the remaining quota out of the 50 post limit enforced by Facebook.

## Prerequisites

To use CWALL Content Publisher, you need to meet the following requirements:

1. **Instagram Account Type**: A Business or Creator Instagram account is necessary.
2. **Facebook Developer Account**: Create a Facebook Developer account and connect it to your Instagram account. A detailed guide is available here: [Register as a Meta Developer](https://developers.facebook.com/docs/development/register/).
3. **Google Drive Folder**: Create a shared Google Drive folder and note its folder ID from the URL.
4. **Graph API Explorer Access**: Access to the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to obtain an access token with the following permissions: `pages_show_list`, `business_management`, `instagram_basic`, `instagram_content_publish`.
5. **Instagram User ID**: Follow this guide: [getting started with Graph API](https://developers.facebook.com/docs/instagram-api/getting-started) to obtain your Instagram user ID (Steps 1-5).

## Setup and Usage

### Step 1: Prepare Your Accounts

Ensure you have fulfilled all the prerequisites mentioned above, including setting up your Instagram and Facebook Developer accounts, and creating a shared Google Drive folder.

### Step 2: Obtain Necessary IDs and Tokens

- Obtain your Instagram User ID and Google Drive folder ID as per the guides.
- Use the Graph API Explorer to grab your access token with the necessary permissions.

### Step 3: Configuration

Login to CWALL Content Publisher using your Google account and navigate to the settings page. Enter your Instagram User ID and Google Drive folder ID to complete the configuration.

## Limitations

Please note that there is a daily limit of 50 posts as enforced by Facebook. This limit cannot be bypassed, but you can monitor your remaining quota via the indicator on the main page.

## License

This project is open-sourced under the MIT License.

## Roadmap

- [ ] Add ability to remove photo
- [ ] Add one button push to Ins function
- [ ] Upload history observability page
