> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://developers.hubspot.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app#content-area)

Apps on the new developer platform (versions `2025.2` and `2026.03`) are initialized using the HubSpot CLI, via a series of streamlined commands. The app’s configuration (name, authentication type, etc.) and any features are specified using individual configuration files, which are bundled into a project.The steps below walk you through the process of creating a new app using the CLI, uploading the associated project to your HubSpot account, which you can install and test in a developer test account.

This article provides a full setup guide to customize and deploy a new app using the `hs project create` command.If you’re new to building apps on HubSpot, check out the [quickstart guide](https://developers.hubspot.com/docs/getting-started/quickstart) that will get you up and running with a demo app using the streamlined `hs get-started` command.

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#prerequisites)  Prerequisites

- To create an app on the latest version of the developer platform, you’ll need to [install the HubSpot CLI](https://developers.hubspot.com/docs/developer-tooling/local-development/hubspot-cli/install-the-cli) and authenticate it with your account using the `hs account auth` command. Make sure you’re using v7.6.0 of the HubSpot CLI before proceeding. If you’ve already installed the CLI, you can update to the latest version of the CLI by running `npm install -g @hubspot/cli@latest`.
- You may want to [create a configurable test account](https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts) so that you can build and test in an isolated environment.

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#create-a-new-boilerplate-project)  Create a new boilerplate project

- Run the command below in your terminal to create a new project with a boilerplate template to get you started.

```
hs project create
```

- Follow the commands to set up your project. When prompted to select the base contents of your project, select **App**.
- Continue to follow the CLI prompts to configure your app details, including:
- **\[—distribution\]:** select whether you plan to distribute your app on the [HubSpot Marketplace](https://ecosystem.hubspot.com/marketplace/apps) or if want to restrict installation to specific HubSpot accounts.
- **\[—auth\]:** select whether you want to use OAuth for the ability to authenticate multiple accounts, or opt for a static token to limit installation to a specific account.
- **\[—features\]:** select which app features to include, which will create a directory for each feature, along with the respective config files you’ll need to get started. Press **spacebar** to select a feature, the **a** key to toggle all features, the **i** key to invert your current selection, and the **enter** key to proceed. The following app features are available:

  - **Card:** an [app card](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-cards/create-an-app-card) that will appear on a CRM record page.
  - **App Function:** add support for [serverless functions](https://developers.hubspot.com/docs/cms/start-building/features/serverless-functions/overview).
  - **Settings:** add an [app settings page](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/create-a-settings-page).
  - **Webhooks:** add a configuration file to specify [webhook subscriptions](https://developers.hubspot.com/docs/apps/developer-platform/add-features/configure-webhooks).
  - **Custom Workflow Action:** add a [custom workflow action](https://developers.hubspot.com/docs/apps/developer-platform/add-features/custom-workflow-actions).

After selecting your app features, the HubSpot CLI will create a top-level project directory, as well as subdirectories for the app features you chose.Next, you’ll customize the configuration for the app and any of its associated features.

You can add a boilerplate feature to your app at any time by running the `hs project add` command in the root directory of the project.

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#configure-the-newly-created-project-and-upload-it-to-your-developer-account)  Configure the newly created project and upload it to your developer account

The projects framework moves app features that were previously configured in the UI or via the API over to source code files, typically defined as `<file-name>-hsmeta.json` configuration files.App features are then created using a combination of subfolders from the main `/src/app` directory and other configuration files as needed. Learn more about your app’s project structure and schema options in the [app configuration reference documentation](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration).

### [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#configure-uids-and-initial-app-features)  Configure UIDs and initial app features

Update the [UIDs](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration#specifying-uids) of your app and any features:

- Change the `uid` property of the app in the top-level `app-hsmeta.json` file and give a unique name to represent your new app.
- If you opted for `static` [authentication](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration#authentication) for a [privately distributed](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration#distribution) app, remove the `redirectUrls` sub-property within the `auth` field of your `app-hsmeta.json` configuration (see line 10 in the example code block below).

Example app-hsmeta.json

```
{
  "uid": "new_developer_platform_app",
  "type": "app",
  "config": {
    "description": "An example to demonstrate how to build an app with developer projects.",
    "name": "my first app",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["http://localhost:3000/oauth-callback"],
      "requiredScopes": [\
        "crm.objects.contacts.read",\
        "crm.objects.contacts.write"\
      ],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    },
    "permittedUrls": {
      "fetch": ["https://api.hubapi.com"],
      "iframe": [],
      "img": []
    },
    "support": {
      "supportEmail": "support@example.com",
      "documentationUrl": "https://example.com/docs",
      "supportUrl": "https://example.com/support",
      "supportPhone": "+18005555555"
    }
  }
}
```

- For any features you want to include (e.g., app cards), update the UID within any associated `*-hsmeta.json` configuration files in your project.

Keep in mind that UIDs are used as a unique identifier for all your project’s components and features. Once your app or any of its features has been uploaded with a specific UID, changing it in subsequent deployments will force the platform to recognize it as different from previous builds, which may not be intended.

### [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#set-up-oauth-if-applicable)  Set up OAuth (if applicable)

If you plan on distributing your app to multiple accounts (either with a specific set of allowlisted accounts or via the HubSpot app marketplace), you’ll need to set up OAuth for your app by following the steps below. Otherwise, you can skip this step and proceed to [upload your project](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app#upload-your-project).

- Add one or more valid redirect URLs to the `app-hsmeta.json` file based on your local (or another non-production) OAuth server configuration.
- If you don’t have a backend service set up already, you can get started by using the [sample OAuth Node.js example](http://github.com/hubspot/oauth-quickstart-nodejs) and run it locally. It’s already set up to work with `https://localhost:3000/oauth-callback` as the redirect URL configured in the boilerplate example code from the `hs project create` command you ran in the previous step.

Example app-hsmeta.json

```
{
  "uid": "new_developer_platform_app",
  "type": "app",
  "config": {
    "description": "An example to demonstrate how to build an app with developer projects.",
    "name": "my first app",
    "distribution": "marketplace",
    "auth": {
      "type": "oauth",
      "redirectUrls": ["http://localhost:3000/oauth-callback"],
      "requiredScopes": [\
        "crm.objects.contacts.read",\
        "crm.objects.contacts.write"\
      ],
      "optionalScopes": [],
      "conditionallyRequiredScopes": []
    },
    "permittedUrls": {
      "fetch": ["https://api.hubapi.com"],
      "iframe": [],
      "img": []
    },
    "support": {
      "supportEmail": "support@example.com",
      "documentationUrl": "https://example.com/docs",
      "supportUrl": "https://example.com/support",
      "supportPhone": "+18005555555"
    }
  }
}
```

See all 30 lines

### [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#upload-your-project)  Upload your project

After you’ve updated your app and feature schemas, run the `hs project upload` CLI command to upload your project to your HubSpot account and automatically trigger a new build.If your app is configured to use OAuth authentication, proceed to the next step to retrieve the app’s authentication details. Otherwise, you can proceed to [app installation](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app#install-your-app).

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#add-the-client-id-and-client-secret-of-your-app-to-your-app)  Add the client ID and client secret of your app to your app

If you configured the [authentication type](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/app-configuration#authentication) to use `oauth`, you’ll need to set up your backend OAuth server to use your app’s client ID and secret, which you can find in HubSpot:

- In the terminal, run `hs project open` from within your local project directory to open the project details page in HubSpot.
- Under _Project Components_, click the **name** of your app.

![Screenshot of the app name shown on the project details page](https://developers.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/project-details-page-app-name.png)

- Click the **Auth** tab.
- Under _Client credentials_, copy the _Client ID_ and _Client secret_ from your new app and paste them into the corresponding locations in your OAuth server’s configuration, then restart your OAuth server.

![Screenshot showing the client credentials of a developer platform app](https://developers.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/app-authentication-details-no-app-id.png)

Your app is now ready to test with an installed account.

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#install-your-app)  Install your app

If you’re still planning on testing your app out before getting it ready for a production setting, it’s recommended you start by installing it in a [developer test account](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app#install-in-a-developer-test-account). Otherwise, users with the [required user permissions](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot#permission-requirements) can install the app directly in their [standard HubSpot account](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app#install-in-a-standard-hubspot-account).

### [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#install-in-a-developer-test-account)  Install in a developer test account

If you don’t already have a [test account](https://developers.hubspot.com/docs/getting-started/account-types#developer-test-accounts), you can create one in HubSpot:

- Navigate to **Test accounts** in the _Development_ navigation menu, then click **Create developer test account**. Follow the prompts to create your new test account.
- In the left sidebar menu, navigate to **Projects**, click the **name** of your new project, then click the **UID** of your app in the component list.
- On the _Distribution_ tab, next to _Test installs_, click **Add test install(s)**.

![Screenshot showing where to initiate installation for a test account](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/install-new-app-in-test-account.png)

- In the right panel, click **Install** next to the test account you created.
- Review the app permissions, select the **checkbox** to authorize installing an unverified app, then click **Connect app**.

### [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#install-in-a-standard-account)  Install in a standard account

If you have the [required user permissions](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot#permission-requirements), you can also install your app directly in your [standard account](https://developers.hubspot.com/docs/getting-started/account-types#standard-hubspot-accounts):

- In your HubSpot account, navigate to **Development**.
- In the left sidebar menu, navigate to **Projects**, click the **name** of your new project, then click the **UID** of your app in the component list.
- On the _Distribution_ tab, under _Standard install_, click **Install now**.

![Screenshot showing where to initiate installation for a standard HubSpot account](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/install-new-app-in-standard-hubspot-account.png)

After initiating the install, you’ll be prompted to review the app permissions.

- Select the **checkbox** to authorize installing an unverified app, then click **Connect app**.
- Once successful, click **View installed app details** to navigate to the _Connected Apps_ page of the account where you installed your app.

![Screenshot of successful app installation within connected apps](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/installed-app-in-test-account-1.png)

Learn more about [distributing your app](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/manage-apps-in-hubspot#distribute-your-app).

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#local-development-and-previews)  Local development and previews

Once you’ve successfully installed the app into the test account, you can run `hs project dev` to start developing your app locally.

- When running this command, you’ll see a link to view your project status and source code within your primary developer account as well as a link to access a local development homepage in your test account.
- This homepage will provide you details about the active local development session, including which components are being developed locally and how you can preview those components to test your changes in real time.

As of [Google Chrome version 142](https://developer.chrome.com/release-notes/142#local_network_access_restrictions), you will receive a one-time popup asking for _app.hubspot.com_ to access devices on your local network. Select **Accept** to enable local development for your apps.

You can also manage this setting in your Chrome settings by navigating to **Settings** \> **Privacy & Security** \> **app.hubspot.com** \> **Permissions** \> **Local network access**.

![Screenshot showing the local development homepage](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/local-development-server-homepage-1.png)

## [​](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/create-an-app\#next-steps)  Next steps

Check out the documentation for guidance on [configuring an app card](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-cards/create-an-app-card) and [creating a settings page for your app](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/create-a-settings-page).

Last modified onMarch 30, 2026

Was this page helpful?

YesNo

[Validating Requests\\
\\
Previous](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/request-validation) [Determine your migration path to 2026.03\\
\\
Next](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/migrate-an-app/overview)

⌘I

Assistant

Responses are generated using AI and may contain mistakes.

![Screenshot of the app name shown on the project details page](https://developers.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/project-details-page-app-name.png)

![Screenshot showing the client credentials of a developer platform app](https://developers.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/app-authentication-details-no-app-id.png)

![Screenshot showing where to initiate installation for a test account](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/install-new-app-in-test-account.png)

![Screenshot showing where to initiate installation for a standard HubSpot account](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/install-new-app-in-standard-hubspot-account.png)

![Screenshot of successful app installation within connected apps](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/installed-app-in-test-account-1.png)

![Screenshot showing the local development homepage](https://www.hubspot.com/hubfs/Knowledge_Base_2023-24-25/developer/local-development-server-homepage-1.png)