# Technology Detection Signals

Use this reference during Phase 1 to identify technologies present in the repository. Each entry lists **strong signals** (1 match = detected) and **weak signals** (need 2+ matches).

---

## Package Managers & Runtimes

| Technology | Strong Signals | Weak Signals |
|-----------|---------------|-------------|
| Node.js | `package.json` | `.nvmrc`, `.node-version`, `node_modules/` |
| pnpm | `pnpm-lock.yaml` | `pnpm-workspace.yaml`, `.npmrc` with pnpm config |
| Yarn | `yarn.lock` | `.yarnrc.yml`, `.yarnrc` |
| Bun | `bun.lockb` | `bunfig.toml` |
| Go | `go.mod` | `go.sum`, `*.go` files |
| Rust | `Cargo.toml` | `Cargo.lock`, `*.rs` files |
| Python | `pyproject.toml`, `requirements.txt` | `setup.py`, `Pipfile`, `*.py` files, `__init__.py` |
| Ruby | `Gemfile` | `Gemfile.lock`, `*.rb` files |
| Java | `pom.xml`, `build.gradle` | `*.java` files, `src/main/java/` |
| .NET / C# | `*.csproj`, `*.sln` | `*.cs` files, `Program.cs` |
| PHP | `composer.json` | `composer.lock`, `*.php` files |
| Elixir | `mix.exs` | `mix.lock`, `*.ex` files |
| Dart/Flutter | `pubspec.yaml` | `*.dart` files, `lib/` with dart |

---

## Languages (generate skill only if significant usage)

| Technology | Strong Signals | Weak Signals | Glob Patterns |
|-----------|---------------|-------------|---------------|
| TypeScript | `tsconfig.json` | `*.ts` files, `*.tsx` files, `@types/*` deps | `**/tsconfig*.json`, `**/*.ts` |
| JavaScript | — | `*.js` files, `*.mjs` files, `*.cjs` files | `**/*.js`, `**/*.mjs` |
| Go | `go.mod` | `*.go` files | `**/*.go` |
| Rust | `Cargo.toml` | `*.rs` files | `**/*.rs` |
| Python | `pyproject.toml` | `*.py` files | `**/*.py` |

---

## Backend Frameworks

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| NestJS | `nest-cli.json` | `@nestjs/core` dep, `@nestjs/common` dep | `@Module\(`, `@Injectable\(`, `@Controller\(` |
| Express | — | `express` dep, `app.use(`, `router.get(` | `require\(['"]express['"]\)`, `from ['"]express['"]` |
| Fastify | — | `fastify` dep | `fastify.register\(`, `from ['"]fastify['"]` |
| Koa | — | `koa` dep | `from ['"]koa['"]` |
| Hono | — | `hono` dep | `from ['"]hono['"]` |
| Django | `manage.py` + `settings.py` | `django` in requirements | `views.py`, `models.py`, `urls.py` |
| Flask | — | `flask` in requirements | `@app.route\(` |
| FastAPI | — | `fastapi` in requirements | `@app.get\(`, `@app.post\(`, `from fastapi` |
| Spring Boot | — | `spring-boot-starter` in pom/gradle | `@SpringBootApplication`, `@RestController` |
| Rails | `config/routes.rb` | `rails` gem | `app/controllers/`, `app/models/` |
| Laravel | `artisan` | `laravel/framework` in composer | `app/Http/Controllers/` |
| Gin | — | `github.com/gin-gonic/gin` in go.mod | `gin.Default\(\)`, `r.GET\(` |
| Actix | — | `actix-web` in Cargo.toml | `HttpServer::new`, `#[get(` |
| Phoenix | — | `phoenix` in mix.exs | `router.ex`, `*_controller.ex` |

---

## Frontend Frameworks

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| React | — | `react` dep, `react-dom` dep | `.tsx` files with JSX, `useState`, `useEffect` |
| Next.js | `next.config.*` | `next` dep | `pages/` or `app/` dir, `getServerSideProps` |
| Vue | — | `vue` dep | `*.vue` files |
| Nuxt | `nuxt.config.*` | `nuxt` dep | `pages/`, `composables/`, `plugins/` dirs |
| Angular | `angular.json` | `@angular/core` dep | `*.component.ts`, `*.module.ts` |
| Svelte | `svelte.config.*` | `svelte` dep | `*.svelte` files |
| SvelteKit | `svelte.config.*` + routes | `@sveltejs/kit` dep | `src/routes/` |
| Solid | — | `solid-js` dep | `*.tsx` with `createSignal` |
| Astro | `astro.config.*` | `astro` dep | `*.astro` files |
| Remix | — | `@remix-run/node` dep | `loader`, `action` exports |
| Gatsby | `gatsby-config.*` | `gatsby` dep | `gatsby-node.*`, `gatsby-browser.*` |

---

## ORMs & Databases

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| Prisma | `schema.prisma` (glob: `**/schema.prisma`) | `@prisma/client` dep | `prisma.` queries, `PrismaClient` |
| TypeORM | `ormconfig.*` | `typeorm` dep | `@Entity\(`, `@Column\(`, `@Repository\(` |
| Sequelize | `.sequelizerc` | `sequelize` dep | `Model.init\(`, `sequelize.define\(` |
| Drizzle | `drizzle.config.*` | `drizzle-orm` dep | `drizzle\(`, `pgTable\(`, `mysqlTable\(` |
| Mongoose | — | `mongoose` dep | `new Schema\(`, `mongoose.model\(` |
| MikroORM | `mikro-orm.config.*` | `@mikro-orm/core` dep | `@Entity\(`, `em.find\(` |
| Knex | `knexfile.*` | `knex` dep | `knex\(`, `knex.migrate` |
| SQLAlchemy | — | `sqlalchemy` in requirements | `Base.metadata`, `session.query\(` |
| GORM | — | `gorm.io/gorm` in go.mod | `db.Find\(`, `db.Create\(` |
| ActiveRecord | — | `activerecord` gem | `belongs_to`, `has_many` |
| PostgreSQL | — | `pg` dep, `DATABASE_URL` with `postgres://` | Prisma provider `postgresql` |
| MongoDB | — | `mongodb` dep, `mongoose` dep | `MongoClient`, `MONGODB_URI` |
| Redis | — | `redis` dep, `ioredis` dep | `REDIS_HOST`, `Redis\(` |
| Elasticsearch | — | `@elastic/elasticsearch` dep | `client.search\(`, `client.index\(` |

---

## Testing

| Technology | Strong Signals | Weak Signals | Glob Patterns |
|-----------|---------------|-------------|---------------|
| Jest | `jest.config.*` | `jest` dep, `@jest/globals` dep | `**/*.spec.ts`, `**/*.test.ts` |
| Vitest | `vitest.config.*` | `vitest` dep | `**/*.spec.ts`, `**/*.test.ts` |
| Mocha | `.mocharc.*` | `mocha` dep | `test/**/*.js` |
| Cypress | `cypress.config.*` | `cypress` dep | `cypress/e2e/**` |
| Playwright | `playwright.config.*` | `@playwright/test` dep | `**/*.spec.ts` in e2e dirs |
| Testing Library | — | `@testing-library/*` dep | `render\(`, `screen.getBy` |
| Supertest | — | `supertest` dep | `request\(app\)`, `supertest\(` |
| pytest | `conftest.py` | `pytest` in requirements | `test_*.py`, `*_test.py` |
| RSpec | `.rspec` | `rspec` gem | `*_spec.rb` |
| Go testing | — | `*_test.go` files | `func Test`, `t.Run\(` |

---

## Infrastructure & DevOps

| Technology | Strong Signals | Weak Signals |
|-----------|---------------|-------------|
| Docker | `Dockerfile` | `docker-compose.*`, `.dockerignore` |
| Kubernetes | `*.yaml` with `apiVersion:` + `kind:` | `helmfile.yaml`, `Chart.yaml` |
| Terraform | `*.tf` files | `.terraform/`, `terraform.tfstate` |
| Pulumi | `Pulumi.yaml` | `Pulumi.*.yaml` |
| GitHub Actions | `.github/workflows/*.yml` | `.github/actions/` |
| GitLab CI | `.gitlab-ci.yml` | `.gitlab/` |
| CircleCI | `.circleci/config.yml` | — |
| AWS CDK | `cdk.json` | `aws-cdk-lib` dep |
| Serverless | `serverless.yml` | `serverless` dep |

---

## Build Tools & Monorepo

| Technology | Strong Signals | Weak Signals |
|-----------|---------------|-------------|
| Nx | `nx.json` | `nx` dep, `project.json` files |
| Turborepo | `turbo.json` | `turbo` dep |
| Lerna | `lerna.json` | `lerna` dep |
| Vite | `vite.config.*` | `vite` dep |
| Webpack | `webpack.config.*` | `webpack` dep |
| Rollup | `rollup.config.*` | `rollup` dep |
| esbuild | — | `esbuild` dep, `esbuild` in scripts |
| SWC | `.swcrc` | `@swc/core` dep |
| Babel | `babel.config.*`, `.babelrc` | `@babel/core` dep |

---

## Styling & UI

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| Tailwind CSS | `tailwind.config.*` | `tailwindcss` dep | `className=".*\b(flex|grid|p-|m-|text-)` |
| Styled Components | — | `styled-components` dep | `` styled\..+` `` |
| Emotion | — | `@emotion/react` dep | `css\``, `styled\(` |
| Sass/SCSS | — | `sass` dep | `*.scss` files, `*.sass` files |
| CSS Modules | — | `*.module.css` files | `*.module.scss` files |
| Material UI | — | `@mui/material` dep | `from ['"]@mui/` |
| Chakra UI | — | `@chakra-ui/react` dep | `from ['"]@chakra-ui/` |
| Shadcn/ui | `components.json` | `components/ui/` dir | `@/components/ui/` imports |
| Storybook | `.storybook/` dir | `@storybook/*` deps | `*.stories.tsx` files |

---

## Messaging & Queues

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| Kafka | — | `kafkajs` dep, `@nestjs/microservices` | `Kafka\(`, `consumer.subscribe\(` |
| BullMQ | — | `bullmq` dep, `@nestjs/bullmq` | `new Queue\(`, `@Processor\(` |
| RabbitMQ | — | `amqplib` dep, `amqp-connection-manager` | `channel.sendToQueue\(` |
| Redis Pub/Sub | — | `ioredis` dep + publish/subscribe usage | `redis.publish\(`, `redis.subscribe\(` |
| AWS SQS | — | `@aws-sdk/client-sqs` dep | `SendMessageCommand`, `ReceiveMessageCommand` |
| NATS | — | `nats` dep | `nc.publish\(`, `nc.subscribe\(` |

---

## API & Communication

| Technology | Strong Signals | Weak Signals | Grep Patterns |
|-----------|---------------|-------------|--------------|
| GraphQL | `*.graphql` files, `schema.graphql` | `graphql` dep, `@apollo/*` dep | `type Query`, `gql\`` |
| tRPC | — | `@trpc/server` dep | `router\(`, `publicProcedure` |
| gRPC | `*.proto` files | `@grpc/grpc-js` dep | `service.*{`, `rpc ` |
| REST (OpenAPI) | `openapi.yaml`, `swagger.json` | `@nestjs/swagger` dep | `@ApiOperation\(`, `@ApiResponse\(` |
| WebSockets | — | `ws` dep, `socket.io` dep | `@WebSocketGateway\(`, `io.on\(` |

---

## Auth & Security

| Technology | Strong Signals | Weak Signals |
|-----------|---------------|-------------|
| Passport | — | `passport` dep, `@nestjs/passport` | 
| JWT | — | `jsonwebtoken` dep, `@nestjs/jwt` |
| Auth0 | — | `auth0` dep, `@auth0/*` dep |
| NextAuth | `[...nextauth].*` route | `next-auth` dep |
| Clerk | — | `@clerk/*` dep |
| OAuth2 | — | `oauth` patterns, `passport-oauth2` |

---

## Detection Priority

Scan in this order for efficiency:

1. **Package manifests** — Read `package.json`, `go.mod`, etc. for dependency lists (fastest, most signals)
2. **Config files** — Glob for framework-specific configs (confirms frameworks)
3. **Directory structure** — `ls` top-level and key directories (confirms architecture)
4. **Import patterns** — Targeted grep only for technologies that need confirmation (slowest, use sparingly)

## Grouping Rules

Some technologies should be grouped rather than given separate skills:

- **Language + Type System**: TypeScript covers both `.ts` and type-checking conventions — don't create a separate "JavaScript" skill if the repo is primarily TypeScript
- **Framework + Router**: Express + express-router = one Express skill, not two
- **ORM + Database**: Prisma + PostgreSQL = one Prisma skill (mention the specific DB provider)
- **Test Framework + Assertion Library**: Jest + Testing Library = one Jest skill
- **Package Manager**: Don't generate skills for npm/pnpm/yarn — these are too generic. Only generate if there are repo-specific conventions worth documenting.
- **Linting/Formatting**: Don't generate separate ESLint or Prettier skills unless the repo has highly custom configurations. Mention linting conventions within the relevant language skill instead.
