## Introduction

### Idea
The main idea is to create our family task app that will have main features:
 - Create group where users can create and share tasks, assign task to the group members.
 - Will have different roles in group, like: admin, user.
 - Create recurring tasks and see what needs to be done for the day. Sort tasks by categories.
 - Create rewards that can be claimed using points gained from completing tasks. Motivation for doing tasks.
 - Create motivational school grade rewards for kids. This will be based on average monthly grade for each subject. Each subject can have differentiated importance index and the reward will be based on maximum available amount for the max grades. Also it will have 0 index set to the grade that will not be rewarded and minus index for grades that is considered bad. So if index is set higher it will produce greater reward and bigger minus for bad grades. This is not yet implemented.

### How to test existing endpoints
 1. Swagger UI - after running the server, you can go to `http://localhost:3000/api` and you should see the swagger ui for created endpoints/procedures. First sign up, login and use your JWT token to Authorize. Then yuo can proceed with the protected endpoints. Keep in mind that if you want to test group endpoints, you will need to first create group and use it's id.
  - you can check Schemas for more information on payload as I included descriptions on more complex payloads.

 2. tRPC-Panel - after running the server, you can go to `http://localhost:3000/api/v1/trpc-panel` and you should see UI for playing with endpoints. But this version will not support all endpoints, particularly where additional authentication is needed (for the group endpoints)

 ### Additional notes about current functionality
  - Sending invitations to the email are not yet implemented, just used fake email service provider.

## Setup

1. `npm install`
2. Create a PostgreSQL database, or use an existing one from the previous exercises.
3. Setup `.env` file based on `.env.example` files.
4. Run the migrations to the latest.

## Running the project in development

```bash
# automatically restarts the server
npm run dev
```

## Tests

```bash
# back end tests
npm run test

# back end coverage
npm run coverage
```

## Migrations

```bash
# prepare a migration
npm run migrate:new myMigrationName

# migrate up to the latest migration
npm run migrate:latest

# migrate down one migration
npm run migrate:down
```

## Running the server in production

Server:

```bash
npm run build
npm run start

# or migrate + start
npm run prod
```
