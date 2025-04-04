### How to test existing endpoints
 1. Swagger UI - after running the server, you can go to `http://localhost:3000/docs` and you should see the swagger ui for created endpoints/procedures. First sign up, login and use your JWT token to Authorize. (for that you will need to set up your auth0) Then you can proceed with the protected endpoints. Keep in mind that if you want to test group endpoints, you will need to first create group and use it's id.
  - you can check Schemas for more information on payload as I included descriptions on more complex payloads.

 ### Additional notes about current functionality
  - Sending invitations to the email are implemented, I provided fake email provider in the env.example. (Don't worry this is not sensitive data). You can visit - https://ethereal.email/ for more information.
  If you want to fully test email sending, you will need to provide your real email service.

## Setup

1. `npm install`
2. Create a PostgreSQL database, or use an existing one from the previous exercises. Test database is required also.
3. Setup `.env` file based on `.env.example` files.
4. Run the migrations to the latest: `npm run migrate:gen`

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

# generate types of database
npm run gen:types
```

## Running the server in production

Server:

```bash
npm run build
npm run start

# or migrate + start
npm run prod
```
