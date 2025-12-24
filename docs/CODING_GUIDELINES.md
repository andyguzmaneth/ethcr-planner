# Coding Guidelines

This document captures coding standards, best practices, and lessons learned from development experience.

## TypeScript & Type Safety

- **Supabase Type Assertions**: Cast insert/update payloads to `never`, then cast the entire operation result to the expected type when custom Database types don't match Supabase's inference.
- **Null Safety**: Use non-null assertions (`!`) only after explicit null checks that throw errors.
- **Query Result Casting**: Cast Supabase query results to `any[]` before mapping or accessing properties when TypeScript can't infer types correctly.
- **Return Type Consistency**: Use `null` for "not found" cases in async operations and convert `undefined` to `null` when return types require it.

## ESLint and Code Quality

- **Legitimate `any` Usage**: Add `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments directly above lines using `any` in transform functions, internal helpers, or type assertion steps.
- **Transform Functions**: Cast database results to `any` when passing to transform functions, which should accept `any` and return strongly-typed application types.

## Error Handling

- **Database Error Handling**: Always check `result.error` before accessing `result.data`, throw errors immediately with meaningful messages, and preserve original error codes when available.

## Code Organization

- **Type Imports**: Use `import type` for type-only imports and import types from their source modules.
- **Documentation**: Document all type assertions and workarounds with comments explaining why they're necessary and noting that runtime behavior is correct.

## Quick Checklist

When working with Supabase operations:

- [ ] Cast insert/update payloads to `never`
- [ ] Cast entire operation result to expected type
- [ ] Check for errors before accessing data
- [ ] Check for null data and throw if missing
- [ ] Use non-null assertions (`!`) only after null checks
- [ ] Cast query results to `any[]` before mapping
- [ ] Add eslint-disable comments for legitimate `any` usage
- [ ] Convert `undefined` to `null` when return types require it
- [ ] Import types explicitly from source modules
- [ ] Document type workarounds with comments

## Future Improvements

- **Generate Types from Supabase**: Use Supabase CLI to generate types directly from the database schema.
- **Type Helper Functions**: Create wrapper functions that handle type assertions internally.
- **Type Guards**: Implement type guards for runtime type checking.
- **Better Database Type Structure**: Refine the Database type structure to better match Supabase's expectations.

---

*Last Updated: Based on learnings from fixing TypeScript errors in `lib/data-supabase.ts`*
