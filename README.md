## Introduction

### Idea

The main idea is to create our family task app that will have main features:

- Create group where users can create and share tasks, assign task to the group members.
- Will have different roles in group, like: admin, user.
- Create recurring tasks and see what needs to be done for the day. Sort tasks by categories.
- Create rewards that can be claimed using points gained from completing tasks. Motivation for doing tasks.
- Create motivational school grade rewards for kids. This will be based on average monthly grade for each subject. Each subject can have differentiated importance index and the reward will be based on maximum available amount for the max grades. Also it will have 0 index set to the grade that will not be rewarded and minus index for grades that is considered bad. So if index is set higher it will produce greater reward and bigger minus for bad grades. This is not yet implemented.

You will find how to set up and test sever side and client side by reading each readme file for server and client, that you will find under the server/client directories.

:)

### Current Implementation and Limitations

### Some implementation explanation:

1. User: can sign up, login. Change username, delete his account, enable/disable points.

2. Tasks: task can be created and reviewed/edited under 'Tasks' tab. Scheduled tasks can be marked as done under 'Calendar' tab, but if task is not scheduled it can be marked as done under 'Tasks' tab. I have some default filtration for tasks ('Scheduled', 'Routine' etc) to help filter out all the tasks. Task can be edited under 'Tasks' tab.

3. Calendar view. You can't mark as done in the future. If task has points, you will get those points only once and points are not subtracted from user points if he marks task as not done.

4. Settings: points for group are counted separately from personal points, so to get points for completing task, first you need to enable your points. This can be done under user settings for personal points and under group settings, for that particular group.

4. Quite a lot to cover... just be curious and try to poke the functionality. I'll try to cover main features during the presentation.

#### Limitations:

1. No Real-Time Data Synchronization
Task updates created by other group members do not appear in real time. You will need to refresh the page or re-enter the group to see changes.

2. Limited Notification System
Notifications are currently only available for invitations. Other events—such as reward claims, task completions, and additional group activities—do not trigger any notifications yet.

3. Single Assignee per Task
Tasks can only be assigned to one group member at a time. Multi-user assignments are not yet supported.

4. No Restrictions on Group or Task Limits
There are currently no constraints on the number of groups a user can create, the number of members per group, or the number of categories and tasks within a group.


### Important Note:

For project to fully function it is required to have the Auth0 - https://auth0.com/ - setup (that allows use of google provider for sign up) and email service provider setup.
Auth0 is quite simple, but still requires some knowledge, so if you are struggling, please contact me - I'll do my best to help you.
For Auth0 you will need to create:

1. Machine to Machine application for server side. You will need to provide required credentials to server .env file.
2. Single Page application for front-end/ client. Make sure you allow google provider as option for sign up. You will need to provide required credentials to client .env file.
3. Management API (API's) that will be used to perform actions on the users or perform administrative tasks. Make sure you have linked you machine to machine application and set permissions to act on it.


### Quick Setup

Follow these steps to get your project up and running <small>(from project root)</small>:

#### 1. Install Dependencies

First, install all the necessary dependencies for the project:

```bash
npm install
```

#### 3.  Make sure your .env variables are set for server and client
#### 4.  Initialize Server Side

Next, initialize the server-side setup:
<small>This includes database migrations, building</small>

```bash
npm run init:server
```

#### 5.  Initialize Client Side
After setting up the server, initialize the client-side:
<small>This includes building</small>
```bash
npm run init:client
```

#### 6.  Run in Development or Preview Mode

To start the development environment (with both server and client running):

```bash
npm run dev
```

For running the production preview (after building the project):

```bash
npm run start
```