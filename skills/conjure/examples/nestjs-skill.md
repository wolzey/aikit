# Example: Generated NestJS Skill

This is an example of what a well-crafted generated skill looks like. Use this as a quality benchmark during Phase 3.

---

```markdown
---
name: nestjs
description: |
  Monolog NestJS patterns and conventions.
  Use when: editing .ts files in apps/ or services/ directories, working with
  @Module/@Injectable/@Controller decorators, creating NestJS modules/services/controllers/guards,
  adding API endpoints, configuring dependency injection.
user-invocable: false
---

# NestJS — Monolog

NestJS v10.3 powers all backend services in this Nx monorepo. Each service lives in `apps/<service-name>/`
with shared libraries in `libs/shared/nest/`. Services follow a modular architecture with strict
separation between controllers (HTTP layer), services (business logic), and repositories (data access).

## Patterns

### Module Organization

Each feature gets its own module with co-located controller, service, and DTOs.

```typescript
// From: apps/claims-svc/src/claims/claims.module.ts:1
@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsRepository],
  exports: [ClaimsService],
})
export class ClaimsModule {}
```

### DTO Validation with class-validator

All API inputs are validated via DTOs with class-validator decorators and the global ValidationPipe.

```typescript
// From: apps/claims-svc/src/claims/dto/create-claim.dto.ts:1
export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(ClaimReason)
  reason: ClaimReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
```

### Shared Guards via libs/

Authentication and authorization guards live in the shared library and are reused across services.

```typescript
// From: libs/shared/nest/src/guards/auth.guard.ts:10
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    // ... token validation
  }
}
```

## Conventions

- **File naming**: kebab-case with suffixes: `.module.ts`, `.controller.ts`, `.service.ts`, `.repository.ts`, `.dto.ts`, `.guard.ts`
- **Directory structure**: `apps/<svc>/src/<feature>/` with co-located files per feature
- **Imports**: Use `@app/*` path alias for intra-service, `@shared/*` for shared libs
- **Error handling**: Throw NestJS `HttpException` subclasses (`NotFoundException`, `BadRequestException`); global exception filter in `libs/shared/nest/` catches and formats
- **Dependency injection**: Always inject via constructor; prefer interfaces with custom injection tokens for testability

## Common Workflow: Adding a New Endpoint

1. Create DTO in `apps/<svc>/src/<feature>/dto/<name>.dto.ts` with class-validator decorators
2. Add service method in `<feature>.service.ts`
3. Add controller method with `@Post()/@Get()` etc., pipe the DTO with `@Body()` or `@Query()`
4. Register any new providers in the feature module
5. Run `nx test <svc>` and `nx lint <svc>`

## Anti-Patterns

### WARNING: Direct Prisma Calls in Controllers

Controllers must NOT call PrismaClient directly. Always go through the service layer (and optionally a repository).

```typescript
// BAD — controller touching the database:
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.prisma.claim.findUnique({ where: { id } });
}

// GOOD — controller delegates to service:
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.claimsService.findOne(id);
}
```

## References

- [Detailed patterns and examples](references/patterns.md)

## Related Skills

- **prisma** — Database access patterns, schema conventions, migration workflow
- **typescript** — Type definitions, generics usage, strict mode conventions
- **jest** — Testing patterns for NestJS services and controllers
```
