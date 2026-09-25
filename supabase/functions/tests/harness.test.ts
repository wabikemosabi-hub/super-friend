// Checks that `deno test` runs and can load jsr modules.
// Delete once real function tests exist.
import { assertEquals } from 'jsr:@std/assert@1';

Deno.test('deno test harness runs', () => {
  assertEquals(['movie', 'series', 'book'].length, 3);
});
